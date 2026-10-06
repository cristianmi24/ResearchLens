import { COLOMBIA_TOPO } from "./colombiaTopo";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type GeoFeature = any;
export interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}

/** Decodificador TopoJSON mínimo (reemplaza a topojson-client, sin dependencias). */
export function topoFeatures(topo: any, objectName: string): GeoFeatureCollection {
  const tf = topo.transform;
  const arcs: number[][][] = topo.arcs.map((arc: number[][]) => {
    let x = 0;
    let y = 0;
    return arc.map((pt) => {
      if (!tf) return [pt[0], pt[1]];
      x += pt[0];
      y += pt[1];
      return [x * tf.scale[0] + tf.translate[0], y * tf.scale[1] + tf.translate[1]];
    });
  });

  const ring = (ids: number[]) => {
    const out: number[][] = [];
    ids.forEach((i, n) => {
      const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i];
      a.forEach((pt, j) => {
        if (n === 0 || j > 0) out.push(pt);
      });
    });
    while (out.length < 4) out.push(out[0]);
    return out;
  };

  const geometry = (g: any) =>
    g.type === "Polygon"
      ? { type: "Polygon", coordinates: g.arcs.map(ring) }
      : g.type === "MultiPolygon"
        ? { type: "MultiPolygon", coordinates: g.arcs.map((poly: number[][]) => poly.map(ring)) }
        : null;

  return {
    type: "FeatureCollection",
    features: topo.objects[objectName].geometries
      .map((g: any) => ({ type: "Feature", id: g.id, properties: g.properties || {}, geometry: geometry(g) }))
      .filter((f: any) => f.geometry),
  };
}

/** Datos de Colombia incluidos → GeoJSON con los nombres de campos del DANE. */
export function colombiaFromEmbedded(): GeoFeatureCollection {
  const fc = topoFeatures(COLOMBIA_TOPO, "d");
  fc.features.forEach((f) => {
    const p = f.properties;
    f.properties = { DPTO_CCDGO: p.c, AREA: p.a * 1e6, STP27_PERS: p.p, TSP16_HOG: p.h, LATITUD: p.y };
  });
  return fc;
}
