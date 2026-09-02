import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, GraduationCap, Library, Menu, SquarePlay, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import { isClerkEnabled } from "@/lib/clerkConfig";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import "./Welcome.css";

type AuthMode = "register" | "login";

interface TeamMember {
  tab: string;
  name: string;
  role: string;
  bio: string;
  stampLeft: string;
  stampRight: string;
}

const teamMembers: TeamMember[] = [
  {
    tab: "AUTOR",
    name: "Cristian Miguel Peñata Andrades",
    role: "Estudiante de Tecnología e Informática",
    bio: "Vinculado a la Universidad de Córdoba (Colombia) y al grupo de investigación EDUTLAN, donde participa en proyectos de tecnología educativa, sistemas tutores inteligentes y herramientas de apoyo a la investigación académica.",
    stampLeft: "UNIV. DE CÓRDOBA",
    stampRight: "GRUPO EDUTLAN",
  },
  {
    tab: "AUTORA",
    name: "Andreina Esther Sami Almanza",
    role: "Estudiante de Tecnología e Informática",
    bio: "Vinculada a la Universidad de Córdoba (Colombia), coautora de este proyecto dentro de la asignatura de Ciencia de Datos.",
    stampLeft: "UNIV. DE CÓRDOBA",
    stampRight: "GRUPO EDUTLAN",
  },
  {
    tab: "DOCENTE",
    name: "Alexander Toscano",
    role: "Docente de la asignatura de Ciencia de Datos",
    bio: "Docente de la Universidad de Córdoba a cargo de la asignatura de Ciencia de Datos, en cuyo marco se desarrolló este proyecto.",
    stampLeft: "UNIV. DE CÓRDOBA",
    stampRight: "CIENCIA DE DATOS",
  },
];

interface HeroSource {
  x: number;
  y: number;
  r: number;
  color: string;
  label: string;
}

const connectedSources = [
  { label: "Semantic Scholar", color: "#2FA89A", icon: GraduationCap },
  { label: "OpenAlex", color: "#D1993F", icon: Library },
  { label: "arXiv", color: "#E0636E", icon: FileText },
  { label: "YouTube", color: "#D6484A", icon: SquarePlay },
];

/** Réplica del network-SVG decorativo original: nodos de fuentes conectados a un
 * nodo central (la búsqueda), con animación SMIL. Puramente presentacional; se
 * genera una sola vez por montaje (useMemo), igual que el script original corría
 * una sola vez al cargar la página. */
function buildHeroSvg(): string {
  const W = 1400;
  const H = 900;
  const sources: HeroSource[] = [
    { x: 1080, y: 160, r: 5, color: "#D1993F", label: "OpenAlex" },
    { x: 1230, y: 340, r: 5, color: "#E0636E", label: "arXiv" },
    { x: 1190, y: 560, r: 5, color: "#2FA89A", label: "Semantic Scholar" },
    { x: 1020, y: 700, r: 5, color: "#E2636E", label: "YouTube" },
  ];
  const center = { x: 780, y: 420 };
  const satellites = Array.from({ length: 26 }, () => ({
    x: 700 + Math.random() * 680,
    y: 60 + Math.random() * 800,
    r: 1.4 + Math.random() * 1.8,
  }));

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;

  satellites.forEach((s) => {
    svg += `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" fill="#2C2620" opacity="0.1"/>`;
  });

  sources.forEach((s, i) => {
    const midX = (s.x + center.x) / 2 + (Math.random() * 60 - 30);
    const midY = (s.y + center.y) / 2 + (Math.random() * 60 - 30);
    const path = `M${s.x},${s.y} Q${midX},${midY} ${center.x},${center.y}`;
    svg += `<path d="${path}" fill="none" stroke="${s.color}" stroke-opacity="0.45" stroke-width="1.2"
      stroke-dasharray="600" stroke-dashoffset="600" pathLength="600">
      <animate attributeName="stroke-dashoffset" from="600" to="0" dur="1.4s" begin="${0.3 + i * 0.18}s" fill="freeze" calcMode="spline" keySplines="0.16 1 0.3 1"/>
    </path>`;
  });

  svg += `<circle cx="${center.x}" cy="${center.y}" r="0" fill="#2C2620">
    <animate attributeName="r" from="0" to="6" dur="0.6s" begin="1.6s" fill="freeze" calcMode="spline" keySplines="0.16 1 0.3 1"/>
  </circle>`;
  svg += `<circle cx="${center.x}" cy="${center.y}" r="0" fill="none" stroke="#2C2620" stroke-opacity="0.3">
    <animate attributeName="r" from="6" to="34" dur="2.4s" begin="1.8s" repeatCount="indefinite"/>
    <animate attributeName="opacity" from="0.5" to="0" dur="2.4s" begin="1.8s" repeatCount="indefinite"/>
  </circle>`;

  sources.forEach((s, i) => {
    svg += `<circle cx="${s.x}" cy="${s.y}" r="0" fill="${s.color}">
      <animate attributeName="r" from="0" to="${s.r}" dur="0.5s" begin="${0.2 + i * 0.18}s" fill="freeze"/>
    </circle>`;
    svg += `<circle cx="${s.x}" cy="${s.y}" r="${s.r + 6}" fill="none" stroke="${s.color}" stroke-opacity="0.4">
      <animate attributeName="r" from="${s.r}" to="${s.r + 14}" dur="2.8s" begin="${1 + i * 0.4}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.45" to="0" dur="2.8s" begin="${1 + i * 0.4}s" repeatCount="indefinite"/>
    </circle>`;
  });

  svg += `</svg>`;
  return svg;
}

export function Welcome() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [mode, setMode] = useState<AuthMode>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const heroSvg = useMemo(() => buildHeroSvg(), []);

  const [activeMember, setActiveMember] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMember((i) => (i + 1) % teamMembers.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const revealEls = container.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in");
        });
      },
      { threshold: 0.15 },
    );
    revealEls.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  function openModal() {
    setError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "register" && !acceptedTerms) {
      setError("Debes aceptar los términos y condiciones para crear una cuenta.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "register") {
        await register(email, password, firstName, lastName);
      } else {
        await login(email, password);
      }
      navigate("/inicio");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo completar la solicitud. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="trama-landing" ref={containerRef}>
      <nav className={isScrolled ? "scrolled" : ""}>
        <div className="nav-left">
          <button
            type="button"
            className="nav-toggle"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ opacity: 0, rotate: -45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.15 }}
                  className="nav-toggle-icon"
                >
                  <X size={19} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ opacity: 0, rotate: 45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -45 }}
                  transition={{ duration: 0.15 }}
                  className="nav-toggle-icon"
                >
                  <Menu size={19} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <a href="#inicio" className="brand">
            <span className="brand-mark">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="5" cy="12" r="2.2" fill="#D1993F" />
                <circle cx="19" cy="5" r="2.2" fill="#2FA89A" />
                <circle cx="19" cy="19" r="2.2" fill="#E0636E" />
                <path d="M7 12L17 5.5M7 12L17 18.5" stroke="#2C2620" strokeOpacity="0.35" strokeWidth="1" />
              </svg>
            </span>
            ResearchLens
          </a>
        </div>
        {isMenuOpen && (
          <button type="button" aria-label="Cerrar menú" className="nav-scrim" onClick={() => setIsMenuOpen(false)} />
        )}
        <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <a href="#inicio" onClick={() => setIsMenuOpen(false)}>
            Inicio
          </a>
          <a href="#quienes-somos" onClick={() => setIsMenuOpen(false)}>
            Quiénes somos
          </a>
          <a href="#como-usarla" onClick={() => setIsMenuOpen(false)}>
            Cómo usarla
          </a>
          <motion.button
            type="button"
            className="enter-btn"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setIsMenuOpen(false);
              openModal();
            }}
          >
            Entrar
          </motion.button>
        </div>
      </nav>

      <section className="hero" id="inicio">
        <div className="hero-canvas" dangerouslySetInnerHTML={{ __html: heroSvg }} />
        <div className="hero-veil" />
        <div className="hero-content">
          <span className="eyebrow">Semantic Scholar · OpenAlex · arXiv · YouTube</span>
          <h1>
            Una búsqueda.
            <br />
            Cuatro fuentes.
            <br />
            <em>Un solo mapa</em> del conocimiento.
          </h1>
          <p className="lead">
            ResearchLens cruza artículos científicos, preprints y video académico en tiempo real, y te devuelve las
            conexiones — no una lista más de resultados sueltos.
          </p>
          <div className="hero-actions">
            <motion.button
              type="button"
              className="btn-primary"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={openModal}
            >
              Entrar a ResearchLens →
            </motion.button>
            <a href="#como-usarla" className="btn-ghost">
              Ver cómo funciona
            </a>
          </div>
        </div>
        <div className="source-tags">
          <span className="label">Fuentes conectadas</span>
          <div className="tag-grid">
            {connectedSources.map((source) => (
              <span
                key={source.label}
                className="tag"
                style={{
                  color: source.color,
                  borderColor: `color-mix(in srgb, ${source.color} 45%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${source.color} 10%, transparent)`,
                }}
              >
                <source.icon size={13} strokeWidth={2.25} />
                {source.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="quienes-somos">
        <div className="section-inner">
          <span className="section-tag">Ficha 01 — Autoría</span>
          <h2 className="section-title reveal">Quiénes somos</h2>
          <p className="section-sub reveal">
            Un proyecto nacido en el aula, para resolver un problema del aula: encontrar en minutos lo que antes
            tomaba pestañas y pestañas de navegación.
          </p>

          <div className="card-index">
            <div>
              <div className="index-card reveal">
                <span className="tab mono">{teamMembers[activeMember].tab}</span>
                <h3>{teamMembers[activeMember].name}</h3>
                <span className="role">{teamMembers[activeMember].role}</span>
                <p>{teamMembers[activeMember].bio}</p>
                <div className="stamp">
                  <span>{teamMembers[activeMember].stampLeft}</span>
                  <span>{teamMembers[activeMember].stampRight}</span>
                </div>
              </div>

              <div className="carousel-controls">
                <div className="carousel-dots">
                  {teamMembers.map((member, i) => (
                    <button
                      key={member.name + i}
                      type="button"
                      className={i === activeMember ? "active" : ""}
                      aria-label={`Ver a ${member.name}`}
                      onClick={() => setActiveMember(i)}
                    />
                  ))}
                </div>
                <div className="carousel-arrows">
                  <button
                    type="button"
                    aria-label="Anterior"
                    onClick={() => setActiveMember((i) => (i - 1 + teamMembers.length) % teamMembers.length)}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label="Siguiente"
                    onClick={() => setActiveMember((i) => (i + 1) % teamMembers.length)}
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            <div className="mission-block reveal">
              <p>
                <strong>ResearchLens existe porque buscar bibliografía sigue siendo lento.</strong> Cada fuente académica
                habla su propio idioma: Semantic Scholar entiende de citaciones, OpenAlex de metadatos abiertos,
                arXiv de preprints recientes y YouTube de explicaciones en video.
              </p>
              <p>
                En lugar de abrir cuatro pestañas, ResearchLens hace la pregunta una sola vez y arma el cruce entre ellas:
                qué se ha publicado, quién lo cita, y quién ya lo explicó en video.
              </p>
              <p>Es una herramienta pensada para estudiantes, docentes y grupos de investigación que necesitan avanzar rápido sin perder rigor.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="como-usarla">
        <div className="section-inner">
          <span className="section-tag">Ficha 02 — Uso</span>
          <h2 className="section-title reveal">Cómo usarla</h2>
          <p className="section-sub reveal">
            Tres pasos, un solo cuadro de búsqueda. Así se traza la ruta desde tu pregunta hasta el material
            verificado.
          </p>

          <div className="steps">
            <div className="step reveal">
              <span className="step-num mono">01</span>
              <div>
                <h3>Escribe tu tema</h3>
                <p>Una palabra clave, una pregunta de investigación o el título de un paper. ResearchLens no necesita sintaxis especial.</p>
              </div>
              <div className="step-visual">
                <div className="node-chip">
                  <span className="dot" />
                  búsqueda
                </div>
              </div>
            </div>

            <div className="step reveal">
              <span className="step-num mono">02</span>
              <div>
                <h3>ResearchLens consulta las cuatro fuentes a la vez</h3>
                <p>
                  En paralelo, se interroga a Semantic Scholar y OpenAlex por artículos y metadatos, a arXiv por
                  preprints recientes, y a YouTube por explicaciones en video del mismo tema.
                </p>
              </div>
              <div className="step-visual">
                <span className="node-chip">
                  <span className="dot" />
                  Semantic Scholar
                </span>
                <span className="node-chip openalex">
                  <span className="dot" />
                  OpenAlex
                </span>
                <span className="node-chip arxiv">
                  <span className="dot" />
                  arXiv
                </span>
                <span className="node-chip youtube">
                  <span className="dot" />
                  YouTube
                </span>
              </div>
            </div>

            <div className="step reveal">
              <span className="step-num mono">03</span>
              <div>
                <h3>Recibe el cruce, no una lista suelta</h3>
                <p>
                  Papers agrupados por relevancia y citación, junto con los videos que mejor los explican — listos
                  para leer, citar o compartir con tu grupo de investigación.
                </p>
              </div>
              <div className="step-visual">
                <div className="node-chip">
                  <span className="dot" />
                  resultados cruzados
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <a href="#inicio" className="brand">
          ResearchLens
        </a>
        <p>
          EDUTLAN · Universidad de Córdoba — Gracias a Semantic Scholar por el acceso a su API ·{" "}
          <Link to="/privacidad">Políticas y privacidad</Link>
        </p>
      </footer>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="modal-overlay open"
            onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <motion.div
              className="modal-box"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)}>
                cerrar ✕
              </button>
              <span className="section-tag">Acceso</span>
              <h3>{mode === "register" ? "Crea tu cuenta" : "Inicia sesión"}</h3>

              <div className="auth-tabs">
                <button
                  type="button"
                  className={mode === "login" ? "active" : ""}
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  className={mode === "register" ? "active" : ""}
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                >
                  Crear cuenta
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <AnimatePresence initial={false}>
                  {mode === "register" && (
                    <motion.div
                      className="field-row two-col"
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: "0.9rem" }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="field">
                        <label htmlFor="firstName">Nombre</label>
                        <input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Tu nombre"
                          required
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="lastName">Apellido</label>
                        <input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Tu apellido"
                          required
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="email">Correo</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@universidad.edu"
                      required
                    />
                  </div>
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="password">Contraseña</label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                    {mode === "register" && <p className="field-hint">Mínimo 8 caracteres.</p>}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {mode === "register" && (
                    <motion.label
                      className="terms-check"
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: "0.9rem" }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        required
                      />
                      <span>
                        Acepto los{" "}
                        <Link to="/privacidad" target="_blank" rel="noreferrer">
                          términos y condiciones y la política de privacidad
                        </Link>
                        .
                      </span>
                    </motion.label>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.p
                    className="auth-error"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  type="submit"
                  className="btn-primary auth-submit"
                  disabled={isSubmitting || (mode === "register" && !acceptedTerms)}
                  whileHover={isSubmitting ? undefined : { y: -2 }}
                  whileTap={isSubmitting ? undefined : { scale: 0.98 }}
                >
                  {isSubmitting ? "Procesando..." : mode === "register" ? "Crear cuenta y continuar" : "Iniciar sesión"}
                </motion.button>
              </form>

              {isClerkEnabled && <SocialLoginButtons />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
