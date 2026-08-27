import { Link } from "react-router-dom";
import { ArrowLeft, Microscope } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export function PrivacyPolicy() {
  return (
    <div className="min-h-dvh bg-surface px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Microscope size={18} />
          </div>
          <span className="font-semibold text-ink-primary">ResearchLens</span>
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-ink-primary">Políticas y privacidad</h1>
          <p className="text-ink-secondary mt-2 leading-relaxed">
            Este resumen explica, en términos simples, qué datos guardamos y con quién los compartimos.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Qué guardamos de ti</CardTitle>
            <CardDescription>
              Tu nombre, apellido y correo (para identificar tu cuenta), y tu contraseña, que nunca se guarda en
              texto plano: se almacena con un hash bcrypt irreversible. También guardamos las ideas de investigación
              que analizas y los proyectos que decides guardar, asociados únicamente a tu cuenta.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quién puede ver tus datos</CardTitle>
            <CardDescription>
              Solo tú. Cada análisis, proyecto y conversación con el asistente queda ligado a tu usuario mediante
              autenticación (JWT); el backend valida en cada solicitud que los datos pedidos te pertenezcan antes de
              devolverlos.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Con qué servicios de terceros trabajamos</CardTitle>
            <CardDescription>
              Para buscar literatura académica real consultamos OpenAlex, Crossref, arXiv y Semantic Scholar. Para el
              análisis y el asistente usamos Qwen (Alibaba Cloud). Ninguno de estos servicios recibe tu identidad:
              solo reciben el texto de tu idea de investigación para poder buscar y razonar sobre ella.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dónde se almacena todo</CardTitle>
            <CardDescription>
              En una base de datos Postgres administrada (Neon), con conexión cifrada (TLS). No compartimos ni
              vendemos tus datos a terceros con fines comerciales.
            </CardDescription>
          </CardHeader>
        </Card>

        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline">
          <ArrowLeft size={16} />
          Volver
        </Link>
      </div>
    </div>
  );
}
