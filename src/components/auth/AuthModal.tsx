import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import { isClerkEnabled } from "@/lib/clerkConfig";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useLanguage } from "@/i18n/LanguageContext";

export type AuthMode = "register" | "login";

interface AuthModalProps {
  open: boolean;
  initialMode: AuthMode;
  onClose: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD = 8;

type Field = "email" | "password";

/**
 * Inicio de sesión y registro. Valida cada campo al salir de él (y en vivo una vez marcado el error),
 * con el mensaje justo debajo del campo; Escape cierra el diálogo y el foco entra al primer campo.
 */
export function AuthModal({ open, initialMode, onClose }: AuthModalProps) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<Field, boolean>>({ email: false, password: false });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // El padre vuelve a montar el modal (key) en cada apertura, así que el estado arranca limpio sin resetearlo aquí.
  useEffect(() => {
    if (!open) return;
    const focusTimer = setTimeout(() => firstFieldRef.current?.focus(), 50);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const fieldErrors: Record<Field, string | null> = {
    email: !email.trim()
      ? t("auth.modal.emailRequired", "Escribe tu correo.")
      : !EMAIL_PATTERN.test(email.trim())
      ? t("auth.modal.emailInvalid", "Revisa el correo: debe tener la forma nombre@dominio.com.")
      : null,
    password:
      password.length < MIN_PASSWORD
        ? t("auth.modal.passwordShort", "La contraseña debe tener al menos 8 caracteres.")
        : null,
  };
  const visibleError = (field: Field) => (touched[field] ? fieldErrors[field] : null);

  function switchMode(next: AuthMode) {
    setMode(next);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setTouched({ email: true, password: true });
    if (fieldErrors.email || fieldErrors.password) return;

    if (mode === "register" && !acceptedTerms) {
      setError(t("auth.modal.termsError"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "register") {
        await register(email.trim(), password, firstName.trim(), lastName.trim());
      } else {
        await login(email.trim(), password);
      }
      navigate("/inicio");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("auth.modal.genericError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClass = (field: Field) => (visibleError(field) ? "invalid" : undefined);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && onClose()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <button type="button" className="modal-close" onClick={onClose} aria-label={t("auth.modal.close")} title={t("auth.modal.close")}>
              <X size={18} />
            </button>
            <h3 id="auth-title">{mode === "register" ? t("auth.modal.registerTitle") : t("auth.modal.loginTitle")}</h3>

            <div className="auth-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>
                {t("auth.modal.loginTab")}
              </button>
              <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")}>
                {t("auth.modal.registerTab")}
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
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
                        autoComplete="given-name"
                        maxLength={60}
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
                        autoComplete="family-name"
                        maxLength={60}
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
                    ref={firstFieldRef}
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((v) => ({ ...v, email: true }))}
                    placeholder={t("auth.modal.emailPlaceholder")}
                    className={fieldClass("email")}
                    aria-invalid={Boolean(visibleError("email"))}
                    aria-describedby={visibleError("email") ? "email-error" : undefined}
                    required
                  />
                  {visibleError("email") && (
                    <p id="email-error" className="field-error">
                      {visibleError("email")}
                    </p>
                  )}
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="password">{t("auth.modal.password")}</label>
                  <div className="password-wrap">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "register" ? "new-password" : "current-password"}
                      maxLength={128}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched((v) => ({ ...v, password: true }))}
                      placeholder="••••••••"
                      className={fieldClass("password")}
                      aria-invalid={Boolean(visibleError("password"))}
                      aria-describedby={visibleError("password") ? "password-error" : mode === "register" ? "password-hint" : undefined}
                      required
                      minLength={MIN_PASSWORD}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? t("auth.modal.hidePassword", "Ocultar contraseña") : t("auth.modal.showPassword", "Mostrar contraseña")}
                      title={showPassword ? t("auth.modal.hidePassword", "Ocultar contraseña") : t("auth.modal.showPassword", "Mostrar contraseña")}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {visibleError("password") ? (
                    <p id="password-error" className="field-error">
                      {visibleError("password")}
                    </p>
                  ) : (
                    mode === "register" && (
                      <p id="password-hint" className="field-hint">
                        {t("auth.modal.passwordHint")}
                      </p>
                    )
                  )}
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
                    <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} required />
                    <span>
                      {t("auth.modal.terms")}{" "}
                      <Link to="/privacidad" target="_blank" rel="noopener noreferrer">
                        {t("auth.modal.termsLink")}
                      </Link>
                      .
                    </span>
                  </motion.label>
                )}
              </AnimatePresence>

              {error && (
                <motion.p className="auth-error" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                  {error}
                </motion.p>
              )}

              <button type="submit" className="btn-primary auth-submit" disabled={isSubmitting || (mode === "register" && !acceptedTerms)} aria-busy={isSubmitting}>
                {isSubmitting && <span className="btn-spinner" aria-hidden="true" />}
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
  );
}
