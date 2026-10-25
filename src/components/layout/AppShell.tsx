import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { AIResearchAssistant } from "@/components/assistant/AIResearchAssistant";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { useLanguage } from "@/i18n/LanguageContext";

export function AppShell() {
  const { t } = useLanguage();
  return (
    <div className="min-h-dvh bg-surface">
      {/* Enlace oculto que aparece al tabular: salta el menú y va directo al contenido. */}
      <a href="#contenido" className="skip-link">
        {t("a11y.skipToContent", "Saltar al contenido")}
      </a>
      <Sidebar />
      <MobileNav />
      <div className="lg:pl-64">
        <main id="contenido" tabIndex={-1} className="w-full px-4 py-8 lg:px-10 lg:py-10 focus:outline-none">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
      <AIResearchAssistant />
    </div>
  );
}
