import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Globe,
  GraduationCap,
  Lightbulb,
  Map as MapIcon,
  Menu,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import { isClerkEnabled } from "@/lib/clerkConfig";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANGUAGE_OPTIONS } from "@/i18n/types";
import "./Welcome.css";

type AuthMode = "register" | "login";

interface TeamMember {
  name: string;
  initials: string;
  roleKey: string;
  bioKey: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Cristian Miguel Peñata Andrades",
    initials: "CP",
    roleKey: "welcome.team.roleStudent",
    bioKey: "welcome.team.bio1",
  },
  {
    name: "Andreina Esther Sami Almanza",
    initials: "AS",
    roleKey: "welcome.team.roleStudent",
    bioKey: "welcome.team.bio2",
  },
  {
    name: "Alexander Toscano",
    initials: "AT",
    roleKey: "welcome.team.roleTeacher",
    bioKey: "welcome.team.bio3",
  },
];

// Bases de datos conectadas: logo oficial y un color propio para distinguirlas de un vistazo.
const SOURCE_LOGOS = "https://pub-f692a19a9eeb4a918004610ccd64fcf0.r2.dev";
const sources: { label: string; logo: string; color: string }[] = [
  { label: "Semantic Scholar", logo: `${SOURCE_LOGOS}/605274dd4af9b0ca8ac84182_s2-logo.svg`, color: "#5b8cff" },
  { label: "OpenAlex", logo: `${SOURCE_LOGOS}/openalex.png`, color: "#ff9f43" },
  { label: "Crossref", logo: `${SOURCE_LOGOS}/crossref.png`, color: "#2ed3b7" },
  { label: "arXiv", logo: `${SOURCE_LOGOS}/images.png`, color: "#ff6b81" },
  { label: "Springer Nature", logo: `${SOURCE_LOGOS}/images%20(1).png`, color: "#ffd23f" },
  { label: "IEEE Xplore", logo: `${SOURCE_LOGOS}/iee.png`, color: "#4cc9f0" },
  { label: "Scopus", logo: `${SOURCE_LOGOS}/scorpus.png`, color: "#f77fbe" },
  { label: "Unicórdoba", logo: "/logos/unicordoba.webp", color: "#7bd88f" },
];

const features: { icon: LucideIcon; key: string }[] = [
  { icon: Lightbulb, key: "f1" },
  { icon: Search, key: "f2" },
  { icon: MapIcon, key: "f3" },
  { icon: Target, key: "f4" },
  { icon: Bot, key: "f5" },
  { icon: GraduationCap, key: "f6" },
];

const steps = ["s1", "s2", "s3", "s4"];

// Acentos de color (tomados del logo) para diferenciar tarjetas y pasos.
const accents = ["#5b8cff", "#a77bff", "#ff8fc7", "#ffb057", "#2ed3b7", "#4cc9f0"];

// Logos institucionales que acompañan al de Zetia en el menú (public/logos, recortados en WebP).
const partners = [
  { src: "/logos/unicordoba.webp", name: "Universidad de Córdoba" },
  { src: "/logos/edutlan.webp", name: "Grupo de investigación EDUTLAN" },
  { src: "/logos/labsie.webp", name: "LABSIE" },
];

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

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function openModal(nextMode: AuthMode = "login") {
    setMode(nextMode);
    setError(null);
    setIsMenuOpen(false);
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

  const navLinks = [
    { href: "#inicio", label: t("welcome.nav.home") },
    { href: "#que-hace", label: t("welcome.nav.features") },
    { href: "#como-funciona", label: t("welcome.nav.how") },
    { href: "#quienes-somos", label: t("welcome.nav.about") },
  ];

  return (
    <div className="zetia-landing" ref={containerRef}>
      {/* Foto de estudiantes (public/fondo.png) bajo un velo blanco para que el texto se lea. */}
      <div className="photo-bg" aria-hidden="true" />

      <nav className={isScrolled ? "scrolled" : ""}>
        <div className="brand-group">
          <a href="#inicio" className="brand" aria-label="Zetia">
            <img src="/logos/zetia.webp" alt="Zetia" />
          </a>
          <span className="brand-divider" aria-hidden="true" />
          <div className="brand-partners">
            {partners.map((partner) => (
              <img key={partner.name} src={partner.src} alt={partner.name} title={partner.name} />
            ))}
          </div>
        </div>

        {isMenuOpen && (
          <button type="button" aria-label={t("welcome.nav.closeMenu")} className="nav-scrim" onClick={() => setIsMenuOpen(false)} />
        )}

        <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}>
              {link.label}
            </a>
          ))}
          {/* En móvil los logos institucionales no caben en la barra: se muestran aquí. */}
          <div className="nav-partners">
            {partners.map((partner) => (
              <img key={partner.name} src={partner.src} alt={partner.name} title={partner.name} />
            ))}
          </div>
        </div>

        <div className="nav-actions">
          <div className="lang-selector" ref={langRef}>
            <button
              type="button"
              className="lang-btn"
              onClick={() => setIsLangOpen((v) => !v)}
              aria-label={t("welcome.nav.language")}
              aria-expanded={isLangOpen}
            >
              <Globe size={15} />
              <span>{LANGUAGE_OPTIONS.find((o) => o.code === language)?.shortLabel ?? "ES"}</span>
            </button>
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  className="lang-dropdown"
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

          <button type="button" className="btn-enter" onClick={() => openModal("login")}>
            {t("welcome.nav.enter")}
          </button>

          <button
            type="button"
            className="nav-toggle"
            aria-label={isMenuOpen ? t("welcome.nav.closeMenu") : t("welcome.nav.openMenu")}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <section className="hero" id="inicio">
        <div className="hero-copy">
          <motion.span
            className="pill"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles size={14} />
            {t("welcome.hero.badge")}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            {t("welcome.hero.title1")} <span className="gradient-text">{t("welcome.hero.title2")}</span>
          </motion.h1>
          <motion.p
            className="lead"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
          >
            {t("welcome.hero.lead")}
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
          >
            <button type="button" className="btn-primary" onClick={() => openModal("register")}>
              {t("welcome.hero.cta")}
              <ArrowRight size={18} />
            </button>
            <a href="#como-funciona" className="btn-ghost">
              {t("welcome.hero.secondary")}
            </a>
          </motion.div>
          <motion.dl
            className="hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {["stat1", "stat2", "stat3"].map((stat) => (
              <div key={stat}>
                <dt>{t(`welcome.hero.${stat}.value`)}</dt>
                <dd>{t(`welcome.hero.${stat}.label`)}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </section>

      {/* Todo lo que va después del hero se apoya en un velo oscuro para que el texto se lea sobre el fondo ilustrado. */}
      <div className="landing-body">
      {/* ---------- FUENTES ---------- */}
      <section className="sources" aria-label={t("welcome.sources.title")}>
        <p className="sources-title">{t("welcome.sources.title")}</p>
        <div className="marquee">
          <div className="marquee-track">
            {[...sources, ...sources].map((source, i) => (
              <span key={`${source.label}-${i}`} className="source-chip"
                aria-hidden={i >= sources.length}
                style={{ "--c": source.color } as CSSProperties}
              >
                <img src={source.logo} alt={i < sources.length ? source.label : ""} decoding="async" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- QUÉ HACE ---------- */}
      <section id="que-hace" className="section">
        <div className="section-head reveal">
          <span className="section-tag">{t("welcome.features.tag")}</span>
          <h2>{t("welcome.features.title")}</h2>
          <p>{t("welcome.features.subtitle")}</p>
        </div>
        <div className="feature-grid">
          {features.map((feature, i) => (
            <article
              key={feature.key}
              className="feature-card reveal"
              style={{ transitionDelay: `${i * 60}ms`, "--c": accents[i % accents.length] } as CSSProperties}
            >
              <span className="feature-icon">
                <feature.icon size={22} />
              </span>
              <h3>{t(`welcome.features.${feature.key}.title`)}</h3>
              <p>{t(`welcome.features.${feature.key}.desc`)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- CÓMO FUNCIONA ---------- */}
      <section id="como-funciona" className="section">
        <div className="section-head reveal">
          <span className="section-tag">{t("welcome.how.tag")}</span>
          <h2>{t("welcome.how.title")}</h2>
          <p>{t("welcome.how.subtitle")}</p>
        </div>
        <ol className="steps">
          {steps.map((step, i) => (
            <li
              key={step}
              className="step reveal"
              style={{ transitionDelay: `${i * 80}ms`, "--c": accents[i % accents.length] } as CSSProperties}
            >
              <span className="step-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{t(`welcome.how.${step}.title`)}</h3>
              <p>{t(`welcome.how.${step}.desc`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- QUIÉNES SOMOS ---------- */}
      <section id="quienes-somos" className="section">
        <div className="about">
          <div className="about-copy reveal">
            <span className="section-tag">{t("welcome.about.tag")}</span>
            <h2>{t("welcome.about.title")}</h2>
            <p>{t("welcome.about.mission1")}</p>
            <p>{t("welcome.about.mission2")}</p>
            <ul className="values">
              {["v1", "v2", "v3"].map((value) => (
                <li key={value}>
                  <Sparkles size={14} />
                  {t(`welcome.about.${value}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="team">
            {teamMembers.map((member, i) => (
              <article key={member.name} className="team-card reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="avatar">{member.initials}</span>
                <div>
                  <h3>{member.name}</h3>
                  <span className="role">{t(member.roleKey)}</span>
                  <p>{t(member.bioKey)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA FINAL ---------- */}
      <section className="section">
        <div className="cta-band reveal">
          <h2>{t("welcome.cta.title")}</h2>
          <p>{t("welcome.cta.desc")}</p>
          <button type="button" className="btn-primary" onClick={() => openModal("register")}>
            {t("welcome.cta.btn")}
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <p>{t("welcome.footer.tagline")}</p>
          </div>
          <div className="footer-links">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
            <Link to="/privacidad">{t("welcome.footer.privacy")}</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Zetia · {t("welcome.footer.credits")}</p>
          <a href="#inicio">{t("welcome.footer.backToTop")} ↑</a>
        </div>
      </footer>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <motion.div
              className="modal-box"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)} aria-label={t("auth.modal.close")}>
                <X size={18} />
              </button>
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
                  <motion.p className="auth-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  className="btn-primary auth-submit"
                  disabled={isSubmitting || (mode === "register" && !acceptedTerms)}
                >
                  {isSubmitting
                    ? t("auth.modal.submitting")
                    : mode === "register"
                    ? t("auth.modal.submitRegister")
                    : t("auth.modal.submitLogin")}
                </button>
              </form>

              {isClerkEnabled && <SocialLoginButtons />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
