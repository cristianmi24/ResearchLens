import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AuthProvider } from "@/hooks/useAuth";
import { ResearchProvider } from "@/hooks/useResearch";
import { ProjectsProvider } from "@/hooks/useProjects";
import { Welcome } from "@/pages/Welcome";
import { Home } from "@/pages/Home";
import { Idea } from "@/pages/Idea";
import { Analysis } from "@/pages/Analysis";
import { Results } from "@/pages/Results";
import { Articles } from "@/pages/Articles";
import { ResearchMap } from "@/pages/ResearchMap";
import { Opportunities } from "@/pages/Opportunities";
import { Refine } from "@/pages/Refine";
import { Projects } from "@/pages/Projects";
import { ProjectDetail } from "@/pages/ProjectDetail";
import { History } from "@/pages/History";
import { Settings } from "@/pages/Settings";
import { PrivacyPolicy } from "@/pages/PrivacyPolicy";

export default function App() {
  return (
    <AuthProvider>
      <ResearchProvider>
        <ProjectsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/privacidad" element={<PrivacyPolicy />} />
              <Route element={<RequireAuth />}>
                <Route element={<AppShell />}>
                  <Route path="/inicio" element={<Home />} />
                  <Route path="/idea" element={<Idea />} />
                  <Route path="/analysis" element={<Analysis />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/map" element={<ResearchMap />} />
                  <Route path="/opportunities" element={<Opportunities />} />
                  <Route path="/refine" element={<Refine />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </ProjectsProvider>
      </ResearchProvider>
    </AuthProvider>
  );
}
