/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";
import * as d3 from "d3";
import worldTopo from "world-atlas/countries-110m.json";
import type { GeoResearchDistribution } from "@/types/research";
import { useLanguage } from "@/i18n/LanguageContext";
import { COLOMBIA_CENTER, COUNTRY_ES, DEPARTAMENTOS, FALLBACK_ES, R_EARTH } from "./geoData";
import { buildColombiaModel, buildWorldModel } from "./geoModel";
import type { ColombiaModel, DepartmentStat, WorldModel } from "./geoModel";
import { atlasStrings } from "./atlasStrings";
import type { AtlasStringKey } from "./atlasStrings";
import { colombiaFromEmbedded, topoFeatures } from "./topo";
import type { GeoFeature } from "./topo";
import { GeoWorksList } from "./GeoWorksList";
import { MapIcon } from "./MapIcon";
import "./mapaInteractivo.css";

/**
 * Atlas de investigación: dónde se investiga el tema del análisis.
 *  - Mundo (globo 3D): cada país se colorea por cuántos estudios tienen al menos
 *    una institución en él (conteo exacto de OpenAlex).
 *  - Colombia: departamentos coloreados por estudios con instituciones allí, más
 *    las instituciones como burbujas ubicadas por sus coordenadas.
 * Solo se muestra información de la investigación; nada demográfico ni turístico.
 */

type T = (key: AtlasStringKey, vars?: Record<string, string | number>) => string;

interface MapaInteractivoProps {
  distribution: GeoResearchDistribution;
  height?: string | number;
  initialView?: "world" | "colombia";
}

/* ================================================================
   Utilidades
   ================================================================ */
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Rampa de color de la investigación sobre fondo claro: menta clara (poco) → verde-azulado profundo (mucho). */
const RAMP = d3.interpolateRgbBasis(["#c7ece6", "#7fd3c8", "#2aa89c", "#147a7c", "#0b4f63"]);
const RAMP_FLOOR = 0.1;
const researchColor = (value: number, max: number) => RAMP(RAMP_FLOOR + (1 - RAMP_FLOOR) * Math.sqrt(value / Math.max(max, 1)));
const RAMP_CSS = `linear-gradient(90deg, ${d3.range(RAMP_FLOOR, 1.001, 0.1).map((t) => RAMP(t)).join(",")})`;
const NO_RESEARCH_FILL = "#e6ebf2";

/** Centroide del polígono más grande (evita que Francia caiga en el Atlántico). */
function mainCentroid(f: GeoFeature): [number, number] {
  const g = f.geometry;
  if (!g || g.type !== "MultiPolygon") return d3.geoCentroid(f) as [number, number];
  let best: any = null;
  let max = -1;
  for (const coords of g.coordinates) {
    const poly = { type: "Polygon", coordinates: coords };
    const a = d3.geoArea(poly as any);
    if (a > max) {
      max = a;
      best = poly;
    }
  }
  return d3.geoCentroid(best) as [number, number];
}

/** Zoom sugerido según el tamaño del país (pequeños = más zoom). */
const zoomFor = (areaKm2: number) => clamp(1 + (6.4 - Math.log10(Math.max(areaKm2, 1))) * 0.6, 1.05, 4);

function useSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/** Nombre del país en el idioma de la app (Intl), con el nombre en español como respaldo. */
function useCountryName(language: string) {
  const names = useMemo(() => {
    try {
      return new Intl.DisplayNames([language], { type: "region" });
    } catch {
      return null;
    }
  }, [language]);
  return (a2: string | null, fallback: string) => {
    if (!a2) return fallback;
    try {
      return names?.of(a2) ?? fallback;
    } catch {
      return fallback;
    }
  };
}

const Icon = {
  plus: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  minus: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
    </svg>
  ),
  reset: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M7 5l12 7-12 7z" />
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
};

/** Ranking con barras proporcionales al valor. */
function RankList({ items, onPick }: { items: { key: string; label: string; value: number; color: string }[]; onPick?: (key: string) => void }) {
  const max = items[0]?.value || 1;
  return (
    <ol className="rank">
      {items.map((item, i) => (
        <li key={item.key}>
          <button type="button" onClick={() => onPick?.(item.key)}>
            <span className="rank-n">{i + 1}</span>
            <span className="rank-name" title={item.label}>
              {item.label}
            </span>
            <span className="rank-bar">
              <span style={{ width: `${(item.value / max) * 100}%`, background: item.color, animationDelay: `${i * 60}ms` }} />
            </span>
            <small>{item.value.toLocaleString()}</small>
          </button>
        </li>
      ))}
    </ol>
  );
}

function Legend({ max, unit }: { max: number; unit: string }) {
  return (
    <div className="legend-ramp">
      <div className="ramp" style={{ background: RAMP_CSS }} />
      <div className="ramp-labels">
        <span>0</span>
        <span>{unit}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
}

/* ================================================================
   Componente principal
   ================================================================ */
export default function MapaInteractivo({
  distribution,
  height = "min(760px, 86dvh)",
  initialView = "world",
}: MapaInteractivoProps) {
  const { language } = useLanguage();
  const t = useMemo(() => atlasStrings(language), [language]);
  const countryName = useCountryName(language);
  const [view, setView] = useState(initialView);
  const isWorld = view === "world";

  const colFeatures = useMemo(() => colombiaFromEmbedded().features, []);
  const worldModel = useMemo(() => buildWorldModel(distribution.countries, distribution.total), [distribution]);
  const colModel = useMemo(
    () => (distribution.colombia ? buildColombiaModel(distribution.colombia, colFeatures) : null),
    [distribution, colFeatures],
  );

  return (
    <div className="atlas" style={{ height }}>
      <header className="atlas-head">
        <div className="brand">
          <MapIcon size={42} className="brand-mark" />
          <div>
            <h1>{t("title")}</h1>
            <p key={view} className="sub">
              {isWorld ? t("subWorld") : t("subCol")}
            </p>
          </div>
        </div>

        <div className="seg" role="tablist">
          <span className="seg-thumb" style={{ transform: `translateX(${isWorld ? 0 : 100}%)` }} />
          <button role="tab" aria-selected={isWorld} className={isWorld ? "on" : ""} onClick={() => setView("world")}>
            {Icon.globe} {t("tabWorld")}
          </button>
          <button role="tab" aria-selected={!isWorld} className={!isWorld ? "on" : ""} onClick={() => setView("colombia")}>
            {Icon.pin} {t("tabCol")}
          </button>
        </div>
      </header>

      <main className="stage">
        <section className={`view view-world ${isWorld ? "" : "off"}`} aria-hidden={!isWorld}>
          <WorldView
            active={isWorld}
            distribution={distribution}
            model={worldModel}
            onExploreColombia={() => setView("colombia")}
            t={t}
            countryName={countryName}
            language={language}
          />
        </section>
        <section className={`view view-col ${!isWorld ? "" : "off"}`} aria-hidden={isWorld}>
          <ColombiaView
            active={!isWorld}
            distribution={distribution}
            features={colFeatures}
            model={colModel}
            t={t}
          />
        </section>
      </main>
    </div>
  );
}

/* ================================================================
   Vista MUNDO — globo 3D
   ================================================================ */
interface WorldViewProps {
  active: boolean;
  distribution: GeoResearchDistribution;
  model: WorldModel;
  onExploreColombia: () => void;
  t: T;
  countryName: (a2: string | null, fallback: string) => string;
  language: string;
}

function WorldView({ active, distribution, model, onExploreColombia, t, countryName, language }: WorldViewProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { w, h } = useSize(canvasRef);
  const api = useRef<any>(null);
  const st = useRef<any>({
    rotate: [160, -25, 0],
    k: 0.3,
    dragging: false,
    hovering: false,
    auto: true,
    active: true,
    sel: null,
    tw: null,
    intro: false,
  }).current;

  const [hover, setHover] = useState<{ c: any; x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [autoOn, setAutoOn] = useState(true);
  const [touched, setTouched] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const countries = useMemo(() => {
    const fc: GeoFeature[] = topoFeatures(worldTopo, "countries").features;
    return fc.map((f) => {
      const info = COUNTRY_ES[f.id] || FALLBACK_ES[f.properties.name] || [null, f.properties.name];
      return {
        ...f,
        meta: {
          id: f.id ?? f.properties.name,
          a2: info[0] as string | null,
          fallbackName: info[1] as string,
          centroid: mainCentroid(f),
          area: d3.geoArea(f) * R_EARTH * R_EARTH,
        },
      };
    });
  }, []);

  const byA2 = useMemo(() => Object.fromEntries(countries.filter((c) => c.meta.a2).map((c) => [c.meta.a2 as string, c])), [countries]);
  const nameOf = (c: any) => countryName(c.meta.a2, c.meta.fallbackName);
  const countOf = (c: any): number => (c.meta.a2 ? (model.counts.get(c.meta.a2) ?? 0) : 0);

  /* ---------- Montaje de la escena D3 (idéntica al globo original) ---------- */
  useEffect(() => {
    if (!w || !h) return;
    const svg = d3.select(svgRef.current as SVGSVGElement);
    const base = Math.min(w, h) * 0.41;
    const projection = d3.geoOrthographic().clipAngle(90).precision(0.5);
    const path = d3.geoPath(projection);
    const grat = d3.geoGraticule10();

    const atmo = svg.select(".atmo");
    const sphere = svg.select(".sphere");
    const graticule = svg.select(".graticule");
    const shine = svg.select(".shine");
    const mSel = svg.select(".m-sel");

    const countrySel = svg
      .select(".countries")
      .selectAll<SVGPathElement, any>("path")
      .data(countries, (d: any) => d.meta.id)
      .join("path")
      .attr("class", "country")
      .classed("is-sel", (d) => d === st.sel)
      .on("pointerenter", (e: any, d: any) => {
        st.hovering = true;
        const [x, y] = d3.pointer(e, canvasRef.current);
        setHover({ c: d, x, y });
      })
      .on("pointermove", (e: any, d: any) => {
        const [x, y] = d3.pointer(e, canvasRef.current);
        setHover({ c: d, x, y });
      })
      .on("pointerleave", () => {
        st.hovering = false;
        setHover(null);
      })
      .on("click", (_e: any, d: any) => select(d));

    function draw() {
      const s = base * st.k;
      projection.translate([w / 2, h / 2]).scale(s).rotate(st.rotate);
      atmo.attr("cx", w / 2).attr("cy", h / 2).attr("r", s * 1.16);
      shine.attr("cx", w / 2).attr("cy", h / 2).attr("r", s);
      sphere.attr("d", path({ type: "Sphere" } as any));
      graticule.attr("d", path(grat));
      countrySel.attr("d", path as any);

      const center: [number, number] = [-st.rotate[0], -st.rotate[1]];
      if (st.sel) {
        const lonlat = st.sel.meta.centroid;
        const visible = d3.geoDistance(lonlat, center) < Math.PI / 2 - 0.03;
        const p = projection(lonlat);
        if (p) mSel.attr("transform", `translate(${p[0]},${p[1]})`).style("opacity", visible ? 1 : 0);
      } else {
        mSel.style("opacity", 0);
      }
    }

    function flyTo(lonlat: [number, number], k = st.k, duration = 1100) {
      if (st.tw) st.tw.stop();
      const r0 = st.rotate.slice();
      const r1 = [-lonlat[0], -lonlat[1], 0];
      r1[0] = r0[0] + ((((r1[0] - r0[0]) % 360) + 540) % 360) - 180; // camino más corto
      const ir = d3.interpolate(r0, r1);
      const ik = d3.interpolate(st.k, k);
      st.tw = d3.timer((elapsed) => {
        const tt = Math.min(1, elapsed / duration);
        const e = d3.easeCubicInOut(tt);
        st.rotate = ir(e);
        st.k = ik(e);
        draw();
        if (tt >= 1) {
          st.tw.stop();
          st.tw = null;
        }
      });
    }

    function select(d: any) {
      setTouched(true);
      if (st.sel === d) {
        setSelected(null);
        return;
      }
      setSelected(d);
      flyTo(d.meta.centroid, Math.max(zoomFor(d.meta.area), 1.1), 1200);
    }

    const center = (): [number, number] => [-st.rotate[0], -st.rotate[1]];
    api.current = {
      draw,
      flyTo,
      select,
      zoomBy: (f: number) => flyTo(center(), clamp(st.k * f, 0.7, 8), 450),
      reset: () => {
        setSelected(null);
        flyTo(COLOMBIA_CENTER, 1, 1200);
      },
    };

    /* Arrastrar para girar */
    const drag = d3
      .drag<SVGSVGElement, unknown>()
      .clickDistance(4)
      .on("start", () => {
        st.dragging = true;
        setTouched(true);
        if (st.tw) {
          st.tw.stop();
          st.tw = null;
        }
        svg.classed("grabbing", true);
      })
      .on("drag", (e: any) => {
        const f = 75 / (base * st.k);
        st.rotate = [st.rotate[0] + e.dx * f, clamp(st.rotate[1] - e.dy * f, -85, 85), 0];
        draw();
      })
      .on("end", () => {
        st.dragging = false;
        svg.classed("grabbing", false);
      });
    svg.call(drag as any);

    /* Rueda para zoom */
    svg.on(
      "wheel.globe",
      (e: WheelEvent) => {
        e.preventDefault();
        if (st.tw) {
          st.tw.stop();
          st.tw = null;
        }
        st.k = clamp(st.k * Math.exp(-e.deltaY * 0.0012), 0.7, 8);
        draw();
      },
      { passive: false } as any,
    );

    /* Rotación automática */
    let last: number | null = null;
    const spin = d3.timer((tm) => {
      const dt = last == null ? 0 : tm - last;
      last = tm;
      if (st.auto && st.active && !st.dragging && !st.hovering && !st.tw && !st.sel) {
        st.rotate = [st.rotate[0] + dt * 0.008, st.rotate[1], 0];
        draw();
      }
    });

    draw();
    if (!st.intro) {
      st.intro = true;
      flyTo(COLOMBIA_CENTER, 1, 2200); // entrada: el globo crece y gira hasta Colombia
    }

    return () => {
      spin.stop();
      if (st.tw) {
        st.tw.stop();
        st.tw = null;
      }
      svg.on(".drag", null).on("wheel.globe", null);
    };
  }, [w, h, countries, st]);

  /* ---------- Color por cantidad de estudios ---------- */
  useEffect(() => {
    d3.select(svgRef.current as SVGSVGElement)
      .selectAll<SVGPathElement, any>(".country")
      .style("--fill", (d) => {
        const n = d.meta.a2 ? (model.counts.get(d.meta.a2) ?? 0) : 0;
        return n > 0 ? researchColor(n, model.max) : null;
      })
      .classed("has-research", (d) => (d.meta.a2 ? (model.counts.get(d.meta.a2) ?? 0) : 0) > 0);
  }, [model, countries, w, h]);

  /* ---------- Selección ---------- */
  useEffect(() => {
    st.sel = selected;
    d3.select(svgRef.current as SVGSVGElement)
      .selectAll(".country")
      .classed("is-sel", (d: any) => d === selected);
    api.current?.draw();
  }, [selected, st]);

  useEffect(() => {
    st.auto = autoOn;
  }, [autoOn, st]);

  /* ---------- Transición entre vistas ---------- */
  const firstActive = useRef(true);
  useEffect(() => {
    st.active = active;
    if (firstActive.current) {
      firstActive.current = false;
      return;
    }
    const a = api.current;
    if (!a) return;
    if (!active) {
      a.flyTo(COLOMBIA_CENTER, 5, 900);
    } else {
      st.k = Math.max(st.k, 3.5);
      a.flyTo(selected ? selected.meta.centroid : COLOMBIA_CENTER, selected ? zoomFor(selected.meta.area) : 1, 1400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const suggestions = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return [];
    return countries
      .filter((c) => norm(countryName(c.meta.a2, c.meta.fallbackName)).includes(q))
      .sort((a, b) => (model.counts.get(b.meta.a2 ?? "") ?? 0) - (model.counts.get(a.meta.a2 ?? "") ?? 0))
      .slice(0, 6);
  }, [query, countries, countryName, model]);

  const pick = (c: any) => {
    if (!c) return;
    api.current?.select(c);
    setQuery("");
    setSearchOpen(false);
  };

  const ranking = useMemo(
    () =>
      distribution.countries
        .slice(0, 8)
        .map((c) => ({
          key: c.code,
          label: countryName(c.code, byA2[c.code]?.meta.fallbackName ?? c.code),
          value: c.count,
          color: researchColor(c.count, model.max),
        })),
    [distribution, model, byA2, countryName],
  );

  const hasColombia = Boolean(distribution.colombia) || (model.counts.get("CO") ?? 0) > 0;

  return (
    <div className="layout">
      <div className="canvas" ref={canvasRef}>
        <svg ref={svgRef} width={w} height={h} className="globe-svg">
          <defs>
            <radialGradient id="atlas-g-ocean" cx="38%" cy="32%" r="78%">
              <stop offset="0%" stopColor="#f4f9ff" />
              <stop offset="55%" stopColor="#d3e5fa" />
              <stop offset="100%" stopColor="#a9c9ef" />
            </radialGradient>
            <radialGradient id="atlas-g-atmo">
              <stop offset="78%" stopColor="#7fb2ee" stopOpacity="0" />
              <stop offset="86.5%" stopColor="#8fbdf2" stopOpacity="0.5" />
              <stop offset="91%" stopColor="#6da7ec" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6da7ec" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="atlas-g-shine" cx="32%" cy="28%" r="80%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="85%" stopColor="#1e4a8a" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#1e4a8a" stopOpacity="0.22" />
            </radialGradient>
            <filter id="atlas-f-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle className="atmo" fill="url(#atlas-g-atmo)" />
          <path className="sphere" />
          <path className="graticule" />
          <g className="countries" />
          <circle className="shine" fill="url(#atlas-g-shine)" />
          <g className="m-sel">
            <circle className="pulse" r="5" />
            <circle className="dot white" r="4" />
          </g>
        </svg>

        {hover && (
          <div className="tip" style={{ left: hover.x, top: hover.y }}>
            <div>
              <strong>{nameOf(hover.c)}</strong>
              <small>{t("tipStudies", { n: countOf(hover.c).toLocaleString(language) })}</small>
            </div>
          </div>
        )}

        <div className="controls">
          <button aria-label={t("zoomIn")} onClick={() => api.current?.zoomBy(1.5)}>
            {Icon.plus}
          </button>
          <button aria-label={t("zoomOut")} onClick={() => api.current?.zoomBy(1 / 1.5)}>
            {Icon.minus}
          </button>
          <button aria-label={t("resetView")} onClick={() => api.current?.reset()}>
            {Icon.reset}
          </button>
          <button aria-label={autoOn ? t("pause") : t("play")} className={autoOn ? "on" : ""} onClick={() => setAutoOn((v) => !v)}>
            {autoOn ? Icon.pause : Icon.play}
          </button>
        </div>

        <div className={`hint ${touched ? "gone" : ""}`}>{t("hint")}</div>
      </div>

      <aside className="panel">
        <div className="search">
          <span className="search-ico">{Icon.search}</span>
          <input
            value={query}
            placeholder={t("search")}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") pick(suggestions[0]);
              if (e.key === "Escape") setQuery("");
            }}
          />
          {searchOpen && suggestions.length > 0 && (
            <ul className="suggest">
              {suggestions.map((c) => (
                <li key={c.meta.id}>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => pick(c)}>
                    <span>{nameOf(c)}</span>
                    <small>{countOf(c).toLocaleString(language)}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selected ? (
          <CountryCard
            key={selected.meta.id}
            name={nameOf(selected)}
            a2={selected.meta.a2}
            count={countOf(selected)}
            rank={selected.meta.a2 ? model.rank.get(selected.meta.a2) : undefined}
            rankedCountries={distribution.countries.length}
            total={distribution.total}
            query={distribution.query}
            onClose={() => setSelected(null)}
            t={t}
            language={language}
          />
        ) : (
          <div className="card card-in">
            <span className="eyebrow">{t("worldEyebrow")}</span>
            <h2>{t("worldTitle")}</h2>
            <p className="muted">{t("worldDesc")}</p>
            <div className="stats">
              <div className="stat">
                <b>{distribution.total.toLocaleString(language)}</b>
                <span>{t("statTotal")}</span>
              </div>
              <div className="stat">
                <b>{distribution.countries.length.toLocaleString(language)}</b>
                <span>{t("statCountries")}</span>
              </div>
              <div className="stat" style={{ gridColumn: "1 / -1" }}>
                <b>{model.top3Share.toFixed(0)}%</b>
                <span>{t("statTop3")}</span>
              </div>
            </div>

            <Legend max={model.max} unit={t("studies")} />

            <span className="eyebrow mt">{t("rankWorld")}</span>
            <RankList
              items={ranking}
              onPick={(code) => {
                const c = byA2[code];
                if (c) pick(c);
              }}
            />
            <p className="note">{t("worldNote")}</p>
            {hasColombia && (
              <button className="cta" onClick={onExploreColombia}>
                {t("goColombia")}
                {Icon.arrow}
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

interface CountryCardProps {
  name: string;
  a2: string | null;
  count: number;
  rank: number | undefined;
  rankedCountries: number;
  total: number;
  query: string;
  onClose: () => void;
  t: T;
  language: string;
}

function CountryCard({ name, a2, count, rank, rankedCountries, total, query, onClose, t, language }: CountryCardProps) {
  const share = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="card card-in">
      <button className="x" onClick={onClose} aria-label={t("closeCard")}>
        {Icon.close}
      </button>
      <span className="eyebrow">{a2 ?? "—"}</span>
      <h2>{name}</h2>

      {count === 0 ? (
        <p className="muted">{t("noResearch")}</p>
      ) : (
        <div className="stats">
          <div className="stat">
            <b>{count.toLocaleString(language)}</b>
            <span>{t("cardStudies")}</span>
          </div>
          <div className="stat">
            <b>{share < 0.1 ? "<0.1" : share.toFixed(1)}%</b>
            <span>{t("cardShare")}</span>
          </div>
          {rank && (
            <div className="stat" style={{ gridColumn: "1 / -1" }}>
              <b className="small">{t("cardRank", { rank, n: rankedCountries })}</b>
            </div>
          )}
        </div>
      )}

      {a2 && count > 0 && <GeoWorksList query={query} country={a2} title={t("worksCountry")} t={t} />}
      <p className="note">{t("worldNote")}</p>
    </div>
  );
}

/* ================================================================
   Vista COLOMBIA — departamentos
   ================================================================ */
interface ColombiaViewProps {
  active: boolean;
  distribution: GeoResearchDistribution;
  features: GeoFeature[];
  model: ColombiaModel | null;
  t: T;
}

type ColHover = { kind: "dep"; f: any; x: number; y: number } | { kind: "inst"; i: any; x: number; y: number };

function ColombiaView({ active, distribution, features, model, t }: ColombiaViewProps) {
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<any>(null);
  const { w, h } = useSize(canvasRef);

  const [hover, setHover] = useState<ColHover | null>(null);
  const [sel, setSel] = useState<any>(null);
  const [k, setK] = useState(1);
  const [play, setPlay] = useState(0);

  const deps = useMemo(
    () =>
      features.map((f) => {
        const code: string = f.properties.DPTO_CCDGO;
        const works = model?.byDept.get(code)?.works ?? 0;
        return { ...f, d: { code, nombre: DEPARTAMENTOS[code]?.nombre ?? code, works, lat: f.properties.LATITUD as number } };
      }),
    [features, model],
  );
  const mainland = useMemo(() => deps.filter((f) => f.d.code !== "88"), [deps]);
  const island = useMemo(() => deps.find((f) => f.d.code === "88"), [deps]);
  const order = useMemo(() => {
    const byLat = [...mainland].sort((a, b) => b.d.lat - a.d.lat);
    return new Map(byLat.map((f, i) => [f.d.code, i]));
  }, [mainland]);
  const maxWorks = model?.maxWorks ?? 0;
  const colorOf = (f: any) => (f.d.works > 0 ? researchColor(f.d.works, maxWorks) : NO_RESEARCH_FILL);

  const geom = useMemo(() => {
    if (!w || !h) return null;
    const pad = Math.max(18, Math.min(w, h) * 0.05);
    const proj = d3.geoMercator().fitExtent([[pad, pad], [w - pad, h - pad]], { type: "FeatureCollection", features: mainland } as any);
    const path = d3.geoPath(proj);
    const inset = { x: pad * 0.6, y: pad * 0.6, w: 112, h: 92 };
    const iproj = island
      ? d3.geoMercator().fitExtent([[inset.x + 22, inset.y + 26], [inset.x + inset.w - 22, inset.y + inset.h - 10]], island as any)
      : null;
    return {
      proj,
      path,
      d: mainland.map((f) => path(f as any) ?? ""),
      centroid: mainland.map((f) => path.centroid(f as any)),
      inset,
      islandD: island && iproj ? (d3.geoPath(iproj)(island as any) ?? "") : null,
    };
  }, [w, h, mainland, island]);

  /* Burbujas de instituciones (solo continente; San Andrés se ve en el recuadro). */
  const bubbles = useMemo(() => {
    if (!geom || !model) return [];
    const maxCount = Math.max(1, ...model.placed.map((i) => i.count));
    return model.placed
      .filter((i) => i.dept !== "88")
      .map((i) => {
        const p = geom.proj([i.lon, i.lat]);
        return p ? { i, x: p[0], y: p[1], r: 3 + 9 * Math.sqrt(i.count / maxCount) } : null;
      })
      .filter((b): b is NonNullable<typeof b> => b !== null)
      .sort((a, b) => b.r - a.r); // las grandes debajo para que las pequeñas se puedan tocar
  }, [geom, model]);

  /* Zoom y arrastre */
  useEffect(() => {
    if (!w || !h) return;
    const svg = d3.select(svgRef.current as SVGSVGElement);
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .extent([[0, 0], [w, h]])
      .scaleExtent([1, 10])
      .translateExtent([[-w * 0.3, -h * 0.3], [w * 1.3, h * 1.3]])
      .on("zoom", (e: any) => {
        d3.select(gRef.current).attr("transform", e.transform);
        setK(e.transform.k);
      });
    svg.call(zoom as any).on("dblclick.zoom", null);
    zoomRef.current = zoom;
    svg.call(zoom.transform as any, d3.zoomIdentity);
    return () => {
      svg.on(".zoom", null);
    };
  }, [w, h]);

  const resetZoom = (dur = 800) => {
    if (!zoomRef.current) return;
    d3.select(svgRef.current as SVGSVGElement).transition().duration(dur).ease(d3.easeCubicInOut).call(zoomRef.current.transform, d3.zoomIdentity);
  };

  const zoomTo = (f: any) => {
    if (!geom || !zoomRef.current) return;
    const [[x0, y0], [x1, y1]] = geom.path.bounds(f);
    const s = clamp(0.72 / Math.max((x1 - x0) / w, (y1 - y0) / h), 1, 8);
    const tr = d3.zoomIdentity.translate(w / 2, h / 2).scale(s).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    d3.select(svgRef.current as SVGSVGElement).transition().duration(950).ease(d3.easeCubicInOut).call(zoomRef.current.transform, tr);
  };

  const deselect = () => {
    setSel(null);
    resetZoom();
  };
  const select = (f: any) => {
    if (sel === f) return deselect();
    setSel(f);
    if (f.d.code === "88") resetZoom();
    else zoomTo(f);
  };
  const selectByCode = (code: string) => {
    const f = deps.find((d) => d.d.code === code);
    if (f) select(f);
  };

  /* Al entrar a la vista se repite la animación de aparición */
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (active) {
      setPlay((p) => p + 1);
      if (zoomRef.current) d3.select(svgRef.current as SVGSVGElement).call(zoomRef.current.transform, d3.zoomIdentity);
      if (sel && sel.d.code !== "88") setTimeout(() => zoomTo(sel), 650);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && deselect();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, geom]);

  const pointer = (e: { clientX: number; clientY: number }) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const depProps = (f: any) => ({
    "data-code": f.d.code,
    className: "dep" + (sel && sel !== f ? " muted-dep" : "") + (sel === f ? " is-sel" : ""),
    style: { fill: colorOf(f) },
    tabIndex: 0,
    role: "button",
    "aria-label": f.d.nombre,
    onPointerEnter: (e: ReactPointerEvent) => setHover({ kind: "dep", f, ...pointer(e) }),
    onPointerMove: (e: ReactPointerEvent) => setHover({ kind: "dep", f, ...pointer(e) }),
    onPointerLeave: () => setHover(null),
    onClick: (e: ReactMouseEvent) => {
      e.stopPropagation();
      select(f);
    },
    onKeyDown: (e: ReactKeyboardEvent) => (e.key === "Enter" || e.key === " ") && select(f),
  });

  const selIdx = sel ? mainland.indexOf(sel) : -1;
  const showNames = k >= 2.4;

  const colombia = distribution.colombia;
  const deptRanking = model
    ? [...model.byDept.values()]
        .sort((a, b) => b.works - a.works)
        .slice(0, 6)
        .map((d) => ({ key: d.code, label: d.name, value: d.works, color: researchColor(d.works, maxWorks) }))
    : [];
  const instRanking = model
    ? [...model.placed]
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
        .map((i) => ({ key: i.id, label: i.name, value: i.count, color: "var(--teal)" }))
    : [];

  return (
    <div className="layout">
      <div className="canvas col-canvas" ref={canvasRef}>
        <svg ref={svgRef} width={w} height={h} className="col-svg">
          <defs>
            <filter id="atlas-f-sel" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.85" />
            </filter>
          </defs>
          <rect width={w} height={h} fill="transparent" onClick={deselect} />

          {geom && (
            <g ref={gRef}>
              <g key={`deps-${play}`} className="deps">
                {mainland.map((f, i) => {
                  const p = depProps(f);
                  return <path key={f.d.code} d={geom.d[i]} {...p} style={{ ...p.style, animationDelay: `${(order.get(f.d.code) ?? 0) * 32}ms` }} />;
                })}
              </g>

              {selIdx >= 0 && <path key={`sel-${sel.d.code}`} className="sel-outline" d={geom.d[selIdx]} />}

              {showNames &&
                mainland.map((f, i) => (
                  <text key={`n-${f.d.code}`} className="dep-name" x={geom.centroid[i][0]} y={geom.centroid[i][1]} style={{ fontSize: 11 / k, strokeWidth: 3 / k }}>
                    {f.d.nombre}
                  </text>
                ))}

              {/* Instituciones: cada burbuja está en las coordenadas de la institución */}
              <g className="bubbles">
                {bubbles.map((b) => (
                  <circle
                    key={b.i.id}
                    className="bubble"
                    data-inst={b.i.id}
                    data-dept={b.i.dept}
                    cx={b.x}
                    cy={b.y}
                    r={b.r / Math.sqrt(k)}
                    style={{ strokeWidth: 1 / k }}
                    onPointerEnter={(e) => setHover({ kind: "inst", i: b.i, ...pointer(e) })}
                    onPointerMove={(e) => setHover({ kind: "inst", i: b.i, ...pointer(e) })}
                    onPointerLeave={() => setHover(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectByCode(b.i.dept);
                    }}
                  />
                ))}
              </g>
            </g>
          )}

          {/* Recuadro de San Andrés y Providencia */}
          {geom && island && geom.islandD && (
            <g className={`inset ${sel === island ? "on" : ""}`}>
              <rect x={geom.inset.x} y={geom.inset.y} width={geom.inset.w} height={geom.inset.h} rx="12" />
              <text x={geom.inset.x + 10} y={geom.inset.y + 16}>
                {t("insetName")}
              </text>
              <path d={geom.islandD} {...depProps(island)} />
            </g>
          )}
        </svg>

        {hover && (
          <div className="tip" style={{ left: hover.x, top: hover.y }}>
            {hover.kind === "dep" ? (
              <>
                <span className="swatch" style={{ background: colorOf(hover.f) }} />
                <div>
                  <strong>{hover.f.d.nombre}</strong>
                  <small>{t("tipStudies", { n: hover.f.d.works.toLocaleString(language) })}</small>
                </div>
              </>
            ) : (
              <div>
                <strong>{hover.i.name}</strong>
                <small>
                  {[hover.i.city, t("tipStudies", { n: hover.i.count.toLocaleString(language) })].filter(Boolean).join(" · ")}
                </small>
              </div>
            )}
          </div>
        )}

        <div className="controls">
          <button aria-label={t("zoomIn")} onClick={() => zoomRef.current && d3.select(svgRef.current as SVGSVGElement).transition().duration(400).call(zoomRef.current.scaleBy, 1.6)}>
            {Icon.plus}
          </button>
          <button aria-label={t("zoomOut")} onClick={() => zoomRef.current && d3.select(svgRef.current as SVGSVGElement).transition().duration(400).call(zoomRef.current.scaleBy, 1 / 1.6)}>
            {Icon.minus}
          </button>
          <button aria-label={t("viewAll")} onClick={deselect}>
            {Icon.reset}
          </button>
        </div>
      </div>

      <aside className="panel">
        {sel ? (
          <DepCard key={sel.d.code} stat={model?.byDept.get(sel.d.code)} name={sel.d.nombre} color={colorOf(sel)} query={distribution.query} onBack={deselect} t={t} language={language} />
        ) : (
          <div className="card card-in">
            <span className="eyebrow">{t("colEyebrow")}</span>
            <h2>{t("tabCol")}</h2>

            {!colombia || !model ? (
              <p className="muted">{t("noColombia")}</p>
            ) : (
              <>
                <div className="stats">
                  <div className="stat">
                    <b>{colombia.total.toLocaleString(language)}</b>
                    <span>{t("colTotal")}</span>
                  </div>
                  <div className="stat">
                    <b>{distribution.total > 0 ? ((colombia.total / distribution.total) * 100).toFixed(1) : "0"}%</b>
                    <span>{t("colShare")}</span>
                  </div>
                  <div className="stat">
                    <b>{model.placed.length.toLocaleString(language)}</b>
                    <span>{t("colInst")}</span>
                  </div>
                  <div className="stat">
                    <b>{model.byDept.size.toLocaleString(language)}</b>
                    <span>{t("colDepts")}</span>
                  </div>
                </div>
                <p className="note">{t("colSampleLine", { n: colombia.sampleSize, total: colombia.total })}</p>

                <Legend max={maxWorks} unit={t("studies")} />

                <span className="eyebrow mt">{t("rankDept")}</span>
                <RankList items={deptRanking} onPick={selectByCode} />

                <span className="eyebrow mt">{t("rankInst")}</span>
                <RankList items={instRanking} onPick={(id) => { const inst = model.placed.find((i) => i.id === id); if (inst) selectByCode(inst.dept); }} />

                <GeoWorksList query={distribution.query} country="CO" title={t("worksColombia")} t={t} />

                <p className="note">{t("colNote")}</p>
                {(colombia.unlocated > 0 || model.unplaced.length > 0) && (
                  <p className="note">{t("unlocated", { n: colombia.unlocated + model.unplaced.length })}</p>
                )}
              </>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

function DepCard({ stat, name, color, query, onBack, t, language }: { stat: DepartmentStat | undefined; name: string; color: string; query: string; onBack: () => void; t: T; language: string }): ReactNode {
  return (
    <div className="card card-in">
      <button className="x" onClick={onBack} aria-label={t("backCol")}>
        {Icon.close}
      </button>
      <span className="badge" style={{ ["--c" as string]: color }}>
        <span className="swatch" style={{ background: color }} /> {t("tabCol")}
      </span>
      <h2 className="dep-title">{name}</h2>

      {!stat || stat.works === 0 ? (
        <p className="muted">{t("depEmpty")}</p>
      ) : (
        <>
          <div className="stats">
            <div className="stat" style={{ gridColumn: "1 / -1" }}>
              <b>{stat.works.toLocaleString(language)}</b>
              <span>{t("depStudies")}</span>
            </div>
          </div>
          <span className="eyebrow mt">{t("depInstitutions")}</span>
          <ul className="inst-list">
            {stat.institutions.map((inst) => (
              <li key={inst.id}>
                <span>
                  {inst.name}
                  {inst.city && <small>{inst.city}</small>}
                </span>
                <b>{inst.count.toLocaleString(language)}</b>
              </li>
            ))}
          </ul>
          <GeoWorksList query={query} institutions={stat.institutions.slice(0, 50).map((i) => i.id)} title={t("worksDept")} t={t} />
        </>
      )}

      <button className="ghost" onClick={onBack}>
        {t("backCol")}
      </button>
      <p className="note">{t("colNote")}</p>
    </div>
  );
}
