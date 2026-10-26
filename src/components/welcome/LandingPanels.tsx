import type { AnchorHTMLAttributes, CSSProperties } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { accents, features, sources, steps, teamMembers } from "./landingData";

// Cada sección del inicio es un panel independiente; Welcome solo decide cuál se muestra.

interface HeroPanelProps {
  onRegister: () => void;
  howLinkProps: AnchorHTMLAttributes<HTMLAnchorElement>;
}

export function HeroPanel({ onRegister, howLinkProps }: HeroPanelProps) {
  const { t } = useLanguage();
  return (
    <>
      <section className="hero">
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
            <button type="button" className="btn-primary" onClick={onRegister}>
              {t("welcome.hero.cta")}
              <ArrowRight size={18} />
            </button>
            <a {...howLinkProps} className="btn-ghost">
              {t("welcome.hero.secondary")}
            </a>
          </motion.div>
        </div>
        {/* Cifras clave en una columna a la derecha del texto, aprovechando el espacio libre del hero. */}
        <motion.dl
          className="hero-stats"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {["stat1", "stat2"].map((stat) => (
            <div key={stat}>
              <dt>{t(`welcome.hero.${stat}.value`)}</dt>
              <dd>{t(`welcome.hero.${stat}.label`)}</dd>
            </div>
          ))}
        </motion.dl>
      </section>
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
    </>
  );
}

export function FeaturesPanel() {
  const { t } = useLanguage();
  return (
    <section className="section" aria-labelledby="sec-que-hace">
      <div className="section-head reveal">
        <span className="section-tag">{t("welcome.features.tag")}</span>
        <h2 id="sec-que-hace">{t("welcome.features.title")}</h2>
        <p>{t("welcome.features.subtitle")}</p>
      </div>
      <div className="feature-grid">
        {features.map((feature, i) => (
          <article
            key={feature.key}
            className="feature-card reveal"
            style={{ animationDelay: `${i * 60}ms`, "--c": accents[i % accents.length] } as CSSProperties}
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
  );
}

export function HowPanel() {
  const { t } = useLanguage();
  return (
    <section className="section" aria-labelledby="sec-como-funciona">
      <div className="section-head reveal">
        <span className="section-tag">{t("welcome.how.tag")}</span>
        <h2 id="sec-como-funciona">{t("welcome.how.title")}</h2>
        <p>{t("welcome.how.subtitle")}</p>
      </div>
      <ol className="steps">
        {steps.map((step, i) => (
          <li
            key={step.key}
            className="step reveal"
            style={{ animationDelay: `${i * 80}ms`, "--c": accents[i % accents.length] } as CSSProperties}
          >
            <div className="step-badge">
              <span className="step-icon">
                <step.icon size={24} />
              </span>
              <span className="step-num">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3>{t(`welcome.how.${step.key}.title`)}</h3>
            <p>{t(`welcome.how.${step.key}.desc`)}</p>
            {/* Las etiquetas vienen en un solo texto separado por "·" para no tocar el tipo de traducciones. */}
            <ul className="step-chips">
              {t(`welcome.how.${step.key}.chips`)
                .split("·")
                .map((chip) => chip.trim())
                .filter(Boolean)
                .map((chip) => (
                  <li key={chip}>{chip}</li>
                ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function AboutPanel() {
  const { t } = useLanguage();
  return (
    <section className="section" aria-labelledby="sec-quienes-somos">
      <div className="about">
        <div className="about-copy reveal">
          <span className="section-tag">{t("welcome.about.tag")}</span>
          <h2 id="sec-quienes-somos">{t("welcome.about.title")}</h2>
          <p>{t("welcome.about.mission1")}</p>
          <p>{t("welcome.about.mission2")}</p>
          <aside className="name-origin">
            <span className="name-greek" lang="el">ζήτησις</span>
            <div>
              <h3>{t("welcome.about.nameTitle")}</h3>
              <p>{t("welcome.about.nameDesc")}</p>
              <strong>{t("welcome.about.nameTagline")}</strong>
            </div>
          </aside>
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
            <article key={member.name} className="team-card reveal" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="avatar">{member.initials}</span>
              <div>
                <div className="team-head">
                  <h3>{member.name}</h3>
                  <span className="team-badge">{t(member.badgeKey)}</span>
                </div>
                <span className="role">{t(member.roleKey)}</span>
                <p>{t(member.bioKey)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
