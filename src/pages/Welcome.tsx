import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, FileText, Globe, GraduationCap, Library, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import { isClerkEnabled } from "@/lib/clerkConfig";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANGUAGE_OPTIONS } from "@/i18n/types";
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
    bio: "Vinculado a la Universidad de Córdoba (Colombia), donde participa en proyectos de tecnología educativa, sistemas tutores inteligentes y herramientas de apoyo a la investigación académica.",
    stampLeft: "UNIV. DE CÓRDOBA",
    stampRight: "INVESTIGACIÓN ACADÉMICA",
  },
  {
    tab: "AUTORA",
    name: "Andreina Esther Sami Almanza",
    role: "Estudiante de Tecnología e Informática",
    bio: "Vinculada a la Universidad de Córdoba (Colombia), coautora de este proyecto dentro de la asignatura de Ciencia de Datos.",
    stampLeft: "UNIV. DE CÓRDOBA",
    stampRight: "CIENCIA DE DATOS",
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
  { label: "Crossref", color: "#6B7AE8", icon: BookOpen },
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
    { x: 1020, y: 700, r: 5, color: "#6B7AE8", label: "Crossref" },
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
  const { t, language, setLanguage } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

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

  // Close lang dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function openModal() {
    setError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "register" && !acceptedTerms) {
      setError(t("auth.modal.termsError"));
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
      setError(err instanceof ApiError ? err.message : t("auth.modal.genericError"));
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
              <img src="/logo.png" alt="ResearchLens logo" />
            </span>
            ResearchLens
          </a>
        </div>
        {isMenuOpen && (
          <button type="button" aria-label="Cerrar menú" className="nav-scrim" onClick={() => setIsMenuOpen(false)} />
        )}
        <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <a href="#inicio" onClick={() => setIsMenuOpen(false)}>
            {t("welcome.nav.home")}
          </a>
          <a href="#quienes-somos" onClick={() => setIsMenuOpen(false)}>
            {t("welcome.nav.about")}
          </a>
          <a href="#como-usarla" onClick={() => setIsMenuOpen(false)}>
            {t("welcome.nav.how")}
          </a>

          {/* Selector de idioma en la nav */}
          <div className="nav-lang-selector" ref={langRef}>
            <button
              type="button"
              className="nav-lang-btn"
              onClick={() => setIsLangOpen((v) => !v)}
              aria-label="Cambiar idioma"
            >
              <Globe size={14} />
              <span>{LANGUAGE_OPTIONS.find((o) => o.code === language)?.shortLabel ?? "ES"}</span>
              <span className={`lang-chevron ${isLangOpen ? "open" : ""}`}>▾</span>
            </button>
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  className="nav-lang-dropdown"
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      className={`lang-option ${language === opt.code ? "active" : ""}`}
                      onClick={() => {
                        setLanguage(opt.code);
                        setIsLangOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      <span>{opt.flag}</span>
                      <span>{opt.label}</span>
                      {language === opt.code && <span className="lang-check">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
            {t("welcome.nav.enter")}
          </motion.button>
        </div>
      </nav>

      <section className="hero" id="inicio">
        <div className="hero-canvas" dangerouslySetInnerHTML={{ __html: heroSvg }} />
        <div className="hero-veil" />
        <div className="hero-content">
          <span className="eyebrow">{t("welcome.eyebrow")}</span>
          <h1>
            {t("welcome.hero.title1")}
            <br />
            {t("welcome.hero.title2")}
            <br />
            <em>{t("welcome.hero.title3")}</em>
          </h1>
          <p className="lead">{t("welcome.hero.lead")}</p>
          <div className="hero-actions">
            <motion.button
              type="button"
              className="btn-primary"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={openModal}
            >
              {t("welcome.hero.cta")}
            </motion.button>
            <a href="#como-usarla" className="btn-ghost">
              {t("welcome.hero.learnMore")}
            </a>
          </div>
        </div>
        <div className="source-tags">
          <span className="label">{t("welcome.hero.connectedSources")}</span>
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
          <span className="section-tag">{t("welcome.about.tag")}</span>
          <h2 className="section-title reveal">{t("welcome.about.title")}</h2>
          <p className="section-sub reveal">{t("welcome.about.subtitle")}</p>

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
              <p>{t("welcome.about.mission1")}</p>
              <p>{t("welcome.about.mission2")}</p>
              <p>{t("welcome.about.mission3")}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="como-usarla">
        <div className="section-inner">
          <span className="section-tag">{t("welcome.how.tag")}</span>
          <h2 className="section-title reveal">{t("welcome.how.title")}</h2>
          <p className="section-sub reveal">{t("welcome.how.subtitle")}</p>

          <div className="steps">
            <div className="step reveal">
              <span className="step-num mono">01</span>
              <div>
                <h3>{t("welcome.how.step1.title")}</h3>
                <p>{t("welcome.how.step1.desc")}</p>
              </div>
              <div className="step-visual">
                <div className="node-chip">
                  <span className="dot" />
                  {t("welcome.how.step1.visual")}
                </div>
              </div>
            </div>

            <div className="step reveal">
              <span className="step-num mono">02</span>
              <div>
                <h3>{t("welcome.how.step2.title")}</h3>
                <p>{t("welcome.how.step2.desc")}</p>
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
                <span className="node-chip crossref">
                  <span className="dot" />
                  Crossref
                </span>
              </div>
            </div>

            <div className="step reveal">
              <span className="step-num mono">03</span>
              <div>
                <h3>{t("welcome.how.step3.title")}</h3>
                <p>{t("welcome.how.step3.desc")}</p>
              </div>
              <div className="step-visual">
                <div className="node-chip">
                  <span className="dot" />
                  {t("welcome.how.step3.visual")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer-minimal">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-brand-section">
              <a href="#inicio" className="brand footer-brand">
                <span className="brand-mark">
                  <img src="/logo.png" alt="ResearchLens logo" />
                </span>
                ResearchLens
              </a>
              <p className="footer-tagline">{t("welcome.footer.tagline")}</p>
              <div className="footer-status-pill">
                <span className="status-indicator-dot" />
                <span>{t("welcome.footer.status")}</span>
              </div>
            </div>

            <div className="footer-links-grid">
              <div className="footer-link-group">
                <a href="#inicio">{t("welcome.nav.home")}</a>
                <a href="#quienes-somos">{t("welcome.nav.about")}</a>
                <a href="#como-usar">{t("welcome.nav.how")}</a>
              </div>
              <div className="footer-link-group">
                <Link to="/privacidad">{t("welcome.footer.privacy")}</Link>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setIsModalOpen(true);
                  }}
                  className="footer-enter-link"
                >
                  {t("welcome.nav.enter")} →
                </button>
              </div>
            </div>
          </div>

          <div className="footer-divider" />

          <div className="footer-bottom">
            <div className="footer-legal">
              <p className="footer-rights">
                © {new Date().getFullYear()} ResearchLens. {t("welcome.footer.rights")}
              </p>
              <p className="footer-credits">{t("welcome.footer.credits")}</p>
            </div>
            <a href="#inicio" className="back-to-top-btn" aria-label={t("welcome.footer.backToTop")}>
              <span>{t("welcome.footer.backToTop")}</span>
              <span className="back-arrow">↑</span>
            </a>
          </div>
        </div>
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
                {t("auth.modal.close")}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <img src="/logo.png" alt="ResearchLens" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
                <span className="section-tag" style={{ margin: 0 }}>{t("auth.modal.tag")}</span>
              </div>
              <h3>{mode === "register" ? t("auth.modal.registerTitle") : t("auth.modal.loginTitle")}</h3>

              <div className="auth-tabs">
                <button
                  type="button"
                  className={mode === "login" ? "active" : ""}
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                >
                  {t("auth.modal.loginTab")}
                </button>
                <button
                  type="button"
                  className={mode === "register" ? "active" : ""}
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                >
                  {t("auth.modal.registerTab")}
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
                        <label htmlFor="firstName">{t("auth.modal.firstName")}</label>
                        <input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder={t("auth.modal.firstNamePlaceholder")}
                          required
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="lastName">{t("auth.modal.lastName")}</label>
                        <input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder={t("auth.modal.lastNamePlaceholder")}
                          required
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="email">{t("auth.modal.email")}</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("auth.modal.emailPlaceholder")}
                      required
                    />
                  </div>
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="password">{t("auth.modal.password")}</label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                    {mode === "register" && <p className="field-hint">{t("auth.modal.passwordHint")}</p>}
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
                        {t("auth.modal.terms")}{" "}
                        <Link to="/privacidad" target="_blank" rel="noreferrer">
                          {t("auth.modal.termsLink")}
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
                  {isSubmitting
                    ? t("auth.modal.submitting")
                    : mode === "register"
                    ? t("auth.modal.submitRegister")
                    : t("auth.modal.submitLogin")}
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
