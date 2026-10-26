import type { AuthUser } from "@/types/auth";
import { useLanguage } from "@/i18n/LanguageContext";

function initials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName || lastName) {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
  }
  return (email?.[0] ?? "?").toUpperCase();
}

/** Tarjeta de perfil: avatar con aro de color pastel, saludo con el nombre y el correo. */
export function UserCard({ user }: { user: AuthUser }) {
  const { t } = useLanguage();
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pastel-sky via-pastel-lavender to-pastel-aqua p-3.5">
      {/* Burbujas decorativas */}
      <span className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/40" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-8 right-10 h-16 w-16 rounded-full bg-pastel-mint/70" aria-hidden="true" />
      <div className="relative flex items-center gap-3">
        <div className="rounded-full bg-[conic-gradient(from_200deg,#9cc8ff,#b5a9fb,#8fe3e6,#9ee6c6,#9cc8ff)] p-[2.5px] shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white font-serif text-sm font-bold text-brand-700">
            {initials(user.firstName, user.lastName, user.email)}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-700/80">{t("nav.greeting", "Hola")} 👋</p>
          <p className="truncate font-serif text-sm font-semibold leading-tight text-ink-primary">{name || user.email}</p>
          {name && (
            <p className="truncate text-[11px] leading-tight text-ink-secondary" title={user.email}>
              {user.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
