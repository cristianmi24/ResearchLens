import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { AIResearchAssistant } from "@/components/assistant/AIResearchAssistant";

export function AppShell() {
  return (
    <div className="min-h-dvh bg-surface">
      <Sidebar />
      <MobileNav />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
      <AIResearchAssistant />
    </div>
  );
}
