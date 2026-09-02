import { Microscope } from "lucide-react";

/** Preloader de pantalla completa para esperas largas: auth inicial, chunks lazy, etc. */
export function PageLoader({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-surface">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-brand-100" />
        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-600 animate-spin" />
        <Microscope size={20} className="text-brand-600" />
      </div>
      <p className="text-sm text-ink-muted animate-pulse">{label}</p>
    </div>
  );
}
