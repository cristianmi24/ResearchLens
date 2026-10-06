import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NotFound() {
  return (
    <div className="min-h-dvh bg-surface px-4 py-10 flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        <div className="flex items-center justify-center gap-2.5">
          <img src="/logo.png" alt="ResearchLens logo" className="h-8 w-8 object-contain rounded-lg shadow-xs" />
          <span className="font-semibold text-ink-primary">ResearchLens</span>
        </div>

        <div className="flex items-center justify-center">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: "color-mix(in srgb, var(--color-brand-500) 12%, white)" }}
          >
            <Compass size={40} className="text-brand-600" />
          </div>
        </div>

        <div>
          <p className="text-6xl font-bold text-ink-primary tracking-tight">404</p>
          <h1 className="mt-2 text-xl font-semibold text-ink-primary">Esta página no existe</h1>
          <p className="text-ink-secondary mt-2 leading-relaxed">
            El enlace que seguiste no corresponde a ninguna sección de ResearchLens. Puede que la ruta haya
            cambiado o que tengas un error de escritura en la URL.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary">
              <ArrowLeft size={16} />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
