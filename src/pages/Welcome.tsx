import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Globe, Menu, X } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import type { AuthMode } from "@/components/auth/AuthModal";
import { AboutPanel, FeaturesPanel, HeroPanel, HowPanel } from "@/components/welcome/LandingPanels";
import { partners, SECTION_IDS, sectionFromHash } from "@/components/welcome/landingData";
import type { SectionId } from "@/components/welcome/landingData";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANGUAGE_OPTIONS } from "@/i18n/types";
import "./Welcome.css";

export function Welcome() {
  const { t, language, setLanguage } = useLanguage();

  const [activeSection, setActiveSection] = useState<SectionId>(sectionFromHash);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [modalKey, setModalKey] = useState(0);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onHashChange = () => setActiveSection(sectionFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const activeIndex = SECTION_IDS.indexOf(activeSection);

  function goTo(id: SectionId) {
    if (id !== activeSection) window.history.pushState(null, "", `#${id}`);
    setActiveSection(id);
    setIsMenuOpen(false);
  }

  // Flechas ← → para cambiar de sección con el teclado, salvo mientras se escribe o hay un diálogo abierto.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isModalOpen || e.altKey || e.ctrlKey || e.metaKey) return;
      if ((e.target as HTMLElement).closest("input, textarea, select, [contenteditable='true']")) return;
      const next = e.key === "ArrowRight" ? activeIndex + 1 : e.key === "ArrowLeft" ? activeIndex - 1 : -1;
      if (next < 0 || next >= SECTION_IDS.length) return;
      e.preventDefault();
      window.history.pushState(null, "", `#${SECTION_IDS[next]}`);
      setActiveSection(SECTION_IDS[next]);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, isModalOpen]);

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
    setAuthMode(nextMode);
    setModalKey((k) => k + 1);
    setIsMenuOpen(false);
    setIsModalOpen(true);
  }

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const navLinks: { id: SectionId; label: string }[] = [
    { id: "inicio", label: t("welcome.nav.home") },
    { id: "que-hace", label: t("welcome.nav.features") },
    { id: "como-funciona", label: t("welcome.nav.how") },
    { id: "quienes-somos", label: t("welcome.nav.about") },
  ];

  // Enlace a una sección: conserva href (abrir en otra pestaña, accesibilidad) pero cambia de sección sin saltar.
  function sectionLinkProps(id: SectionId) {
    return {
      href: `#${id}`,
      onClick: (e: ReactMouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        goTo(id);
      },
    };
  }

  return (
    <div className="zetia-landing">
      <a href="#contenido" className="skip-link">
        {t("a11y.skipToContent", "Saltar al contenido")}
      </a>
      {/* Foto de estudiantes (public/fondo.webp) bajo un velo blanco para que el texto se lea. */}
      <div className="photo-bg" aria-hidden="true" />

      <nav className={activeSection !== "inicio" ? "scrolled" : ""} aria-label={t("welcome.nav.main")}>
        <div className="brand-group">
          <a {...sectionLinkProps("inicio")} className="brand" aria-label="Zetia">
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
            <a
              key={link.id}
              {...sectionLinkProps(link.id)}
              className={activeSection === link.id ? "active" : undefined}
              aria-current={activeSection === link.id ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
          {/* En móvil los logos institucionales no caben en la barra: se muestran aquí. */}
          <div className="nav-partners">
            {partners.map((partner) => (
              <img key={partner.name} src={partner.src} alt={partner.name} title={partner.name} loading="lazy" />
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

      {/* Una sola sección visible a la vez; el menú, el paginador y las flechas ← → cambian entre ellas. */}
      <main className="landing-stage" id="contenido" tabIndex={-1}>
        {/* La key fuerza a montar la sección nueva con su animación de entrada, sin esperar una salida. */}
        <motion.div
          key={activeSection}
          className="landing-panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {activeSection === "inicio" && (
            <HeroPanel onRegister={() => openModal("register")} howLinkProps={sectionLinkProps("como-funciona")} />
          )}
          {activeSection === "que-hace" && <FeaturesPanel />}
          {activeSection === "como-funciona" && <HowPanel />}
          {activeSection === "quienes-somos" && <AboutPanel />}
        </motion.div>
      </main>

      <footer className="landing-footer">
        <p className="footer-credits">
          <img src="/logos/labsie.webp" alt="" aria-hidden="true" />
          <span>
            © {new Date().getFullYear()} Zetia · {t("welcome.footer.credits")}
          </span>
        </p>
        {/* Paginador en la zona del pulgar: anterior / siguiente con el nombre de la sección actual. */}
        <div className="section-pager" role="group" aria-label={t("welcome.pager.label")}>
          <button
            type="button"
            onClick={() => goTo(SECTION_IDS[activeIndex - 1])}
            disabled={activeIndex === 0}
            aria-label={t("welcome.pager.prev")}
            title={t("welcome.pager.prev")}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="pager-status" aria-live="polite">
            {activeIndex + 1} / {SECTION_IDS.length} · {navLinks[activeIndex].label}
          </span>
          <button
            type="button"
            onClick={() => goTo(SECTION_IDS[activeIndex + 1])}
            disabled={activeIndex === SECTION_IDS.length - 1}
            aria-label={t("welcome.pager.next")}
            title={t("welcome.pager.next")}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="footer-legal">
          <Link to="/terminos" className="footer-privacy">
            {t("welcome.footer.terms")}
          </Link>
          <Link to="/privacidad" className="footer-privacy">
            {t("welcome.footer.privacy")}
          </Link>
        </div>
      </footer>

      <AuthModal key={modalKey} open={isModalOpen} initialMode={authMode} onClose={closeModal} />
    </div>
  );
}
