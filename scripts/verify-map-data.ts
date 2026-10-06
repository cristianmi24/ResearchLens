/**
 * Verifica que el mapa coloque cada cosa donde corresponde.
 *
 *   server/node_modules/.bin/tsx scripts/verify-map-data.ts          # chequeos estáticos
 *   server/node_modules/.bin/tsx scripts/verify-map-data.ts --live   # + OpenAlex real
 *
 * Estáticos: 33 departamentos, cada capital dentro de su polígono (o a pocos km
 * del borde en islas/puntas), áreas coherentes con el dato oficial, ids de país
 * mapeados y capitales en su país. Con --live: toma instituciones colombianas
 * reales de OpenAlex y comprueba que cada una caiga en el departamento de su ciudad.
 */
import { readFileSync } from "node:fs";
import { geoArea, geoContains, geoDistance } from "d3";
import { colombiaFromEmbedded, topoFeatures } from "../src/components/map/topo.ts";
import { COUNTRY_ES, DEPARTAMENTOS, FALLBACK_ES, R_EARTH } from "../src/components/map/geoData.ts";
import { assignDepartment, buildColombiaModel } from "../src/components/map/geoModel.ts";

let failures = 0;
const fail = (message: string) => {
  failures++;
  console.log("  ✗", message);
};
const ok = (message: string) => console.log("  ✓", message);

function distToBoundaryKm(feature: any, point: [number, number]): number {
  const g = feature.geometry;
  const polygons = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  let best = Infinity;
  for (const polygon of polygons)
    for (const ring of polygon)
      for (const [x, y] of ring) best = Math.min(best, geoDistance(point, [x, y]) * R_EARTH);
  return best;
}

function staticChecks() {
  console.log("== Colombia (departamentos) ==");
  const col = colombiaFromEmbedded();
  col.features.length === 33 ? ok("33 departamentos") : fail(`hay ${col.features.length} departamentos`);

  let population = 0;
  for (const f of col.features) {
    const p = f.properties;
    const meta = DEPARTAMENTOS[p.DPTO_CCDGO];
    if (!meta) {
      fail(`código sin metadatos: ${p.DPTO_CCDGO}`);
      continue;
    }
    population += p.STP27_PERS;
    const ratio = (geoArea(f) * R_EARTH * R_EARTH) / (p.AREA / 1e6);
    if (p.AREA / 1e6 > 100 && (ratio < 0.85 || ratio > 1.15)) fail(`${meta.nombre}: área geométrica x${ratio.toFixed(2)} del dato oficial`);
    if (meta.cap && !geoContains(f, meta.cap)) {
      const km = distToBoundaryKm(f, meta.cap);
      km <= 25 ? ok(`${meta.nombre}: capital a ${km.toFixed(1)} km del borde (punta/isla simplificada)`) : fail(`${meta.nombre}: capital a ${km.toFixed(0)} km del polígono`);
    }
  }
  population === 44_164_417 ? ok("población suma 44.164.417 (censados efectivos DANE 2018)") : fail(`población suma ${population}`);

  const misplaced = Object.entries(DEPARTAMENTOS).filter(([code, meta]) => {
    if (!meta.cap) return false;
    const owners = col.features.filter((f) => geoContains(f, meta.cap!)).map((f) => f.properties.DPTO_CCDGO);
    return owners.length > 0 && !owners.includes(code);
  });
  misplaced.length === 0 ? ok("ninguna capital cae en otro departamento") : fail(`capitales en otro departamento: ${misplaced.map(([, m]) => m.capital)}`);

  console.log("== Mundo ==");
  const world = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/countries-110m.json", import.meta.url), "utf8"));
  const countries = topoFeatures(world, "countries").features;
  const unmapped = countries.filter((f) => !(COUNTRY_ES[f.id] ?? FALLBACK_ES[f.properties.name]));
  unmapped.length === 0 ? ok(`${countries.length} países/territorios con código ISO`) : fail(`sin código: ${unmapped.map((f) => f.properties.name)}`);

  const capitals: Record<string, [number, number]> = {
    "170": [-74.07, 4.71], "724": [-3.7, 40.42], "484": [-99.13, 19.43], "032": [-58.38, -34.6], "076": [-47.93, -15.78],
    "840": [-77.04, 38.91], "250": [2.35, 48.86], "392": [139.69, 35.69], "276": [13.4, 52.52], "152": [-70.65, -33.45],
    "604": [-77.03, -12.05], "862": [-66.9, 10.49], "218": [-78.52, -0.18], "826": [-0.13, 51.51], "380": [12.5, 41.9],
    "156": [116.4, 39.9], "356": [77.21, 28.61], "036": [149.13, -35.28], "710": [28.19, -25.75], "818": [31.24, 30.04],
    "643": [37.62, 55.75], "124": [-75.7, 45.42], "620": [-9.14, 38.72], "858": [-56.19, -34.9], "068": [-68.15, -16.5],
    "600": [-57.58, -25.26], "591": [-79.52, 8.98], "188": [-84.09, 9.93], "192": [-82.37, 23.13], "410": [126.98, 37.57],
  };
  let wrong = 0;
  for (const [id, point] of Object.entries(capitals)) {
    const owner = countries.find((f) => geoContains(f, point));
    if (owner?.id === id) continue;
    const km = distToBoundaryKm(countries.find((f) => f.id === id), point);
    if (km > 40) {
      wrong++;
      fail(`${COUNTRY_ES[id][1]}: su capital cae en ${owner ? COUNTRY_ES[owner.id]?.[1] : "ningún país"} (a ${km.toFixed(0)} km)`);
    }
  }
  wrong === 0 && ok(`${Object.keys(capitals).length} capitales en su país`);
}

/** Ciudad (como la reporta OpenAlex) → departamento esperado. */
const CITY_TO_DEPT: Record<string, string> = {
  Barranquilla: "08", Soledad: "08", "Medellín": "05", Envigado: "05", "Itagüí": "05", Sabaneta: "05", Rionegro: "05",
  "Bogotá": "11", "Santiago de Cali": "76", Cali: "76", "Tuluá": "76", Palmira: "76", "Montería": "23", "Chía": "25",
  Soacha: "25", "Zipaquirá": "25", Bucaramanga: "68", Floridablanca: "68", Piedecuesta: "68", Cartagena: "13",
  Manizales: "17", Pereira: "66", "Popayán": "19", Tunja: "15", Sogamoso: "15", "Ibagué": "73", Neiva: "41", Pasto: "52",
  "Cúcuta": "54", Villavicencio: "50", "Santa Marta": "47", Valledupar: "20", Sincelejo: "70", Armenia: "63", Riohacha: "44",
};

async function liveChecks() {
  console.log("== OpenAlex real: ¿cada institución cae en el departamento de su ciudad? ==");
  const { buildGeoDistribution } = await import("../server/src/pipeline/geoResearch.ts");
  const features = colombiaFromEmbedded().features;
  let checked = 0;
  for (const keywords of [["adaptive scaffolding", "mathematics learning"], ["machine learning", "education"], ["rural education", "Colombia"]]) {
    const geo = await buildGeoDistribution(keywords);
    if (!geo?.colombia) {
      console.log(`  (sin vista Colombia para «${keywords.join(" ")}»)`);
      continue;
    }
    const model = buildColombiaModel(geo.colombia, features);
    let mismatches = 0;
    for (const inst of model.placed) {
      const expected = inst.city ? CITY_TO_DEPT[inst.city] : undefined;
      if (!expected) continue;
      checked++;
      if (expected !== inst.dept) {
        mismatches++;
        fail(`${inst.name} (${inst.city}) → ${DEPARTAMENTOS[inst.dept]?.nombre}, esperado ${DEPARTAMENTOS[expected]?.nombre}`);
      }
    }
    const totalWorks = [...model.byDept.values()].reduce((s, d) => s + d.works, 0);
    console.log(`  «${keywords.join(" ")}»: ${geo.colombia.institutions.length} instituciones, ${model.placed.length} ubicadas, ${model.unplaced.length} sin ubicar, ${model.byDept.size} departamentos con estudios, ${totalWorks} estudios-departamento, ${mismatches} errores`);
    if (model.unplaced.length) console.log("    sin ubicar:", model.unplaced.map((i) => `${i.name} (${i.city})`).join("; "));
    // ninguna institución puede quedar en un departamento absurdo (Amazonas con Barranquilla, etc.)
    const top = [...model.byDept.values()].sort((a, b) => b.works - a.works).slice(0, 3).map((d) => `${d.name}:${d.works}`);
    console.log("    top departamentos:", top.join(", "));
  }
  checked > 0 ? ok(`${checked} instituciones verificadas contra su ciudad`) : fail("no se pudo verificar ninguna institución");
  void assignDepartment;
}

staticChecks();
if (process.argv.includes("--live")) await liveChecks();
console.log(failures ? `\nRESULTADO: ${failures} problema(s)` : "\nRESULTADO: todo en su sitio ✓");
process.exit(failures ? 1 : 0);
