import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AuthProvider } from "@/hooks/useAuth";
import { ResearchProvider } from "@/hooks/useResearch";
import { ProjectsProvider } from "@/hooks/useProjects";
import { PageLoader } from "@/components/ui/PageLoader";
import { isClerkEnabled } from "@/lib/clerkConfig";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Welcome } from "@/pages/Welcome";

const Home = lazy(() => import("@/pages/Home").then((m) => ({ default: m.Home })));
const Idea = lazy(() => import("@/pages/Idea").then((m) => ({ default: m.Idea })));
const Analysis = lazy(() => import("@/pages/Analysis").then((m) => ({ default: m.Analysis })));
const Results = lazy(() => import("@/pages/Results").then((m) => ({ default: m.Results })));
const ArticleSearch = lazy(() => import("@/pages/ArticleSearch").then((m) => ({ default: m.ArticleSearch })));
const ResearchMap = lazy(() => import("@/pages/ResearchMap").then((m) => ({ default: m.ResearchMap })));
const Opportunities = lazy(() => import("@/pages/Opportunities").then((m) => ({ default: m.Opportunities })));
const Refine = lazy(() => import("@/pages/Refine").then((m) => ({ default: m.Refine })));
const Projects = lazy(() => import("@/pages/Projects").then((m) => ({ default: m.Projects })));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail").then((m) => ({ default: m.ProjectDetail })));
const History = lazy(() => import("@/pages/History").then((m) => ({ default: m.History })));
const Settings = lazy(() => import("@/pages/Settings").then((m) => ({ default: m.Settings })));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy").then((m) => ({ default: m.PrivacyPolicy })));
const NotFound = lazy(() => import("@/pages/NotFound").then((m) => ({ default: m.NotFound })));
const SsoCallback = lazy(() => import("@/pages/SsoCallback").then((m) => ({ default: m.SsoCallback })));
const SsoSync = lazy(() => import("@/pages/SsoSync").then((m) => ({ default: m.SsoSync })));

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ResearchProvider>
          <ProjectsProvider>
            <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/privacidad" element={<PrivacyPolicy />} />
                {isClerkEnabled && (
                  <>
                    <Route path="/sso-callback" element={<SsoCallback />} />
                    <Route path="/sso-sync" element={<SsoSync />} />
                  </>
                )}
                <Route element={<RequireAuth />}>
                  <Route element={<AppShell />}>
                    <Route path="/inicio" element={<Home />} />
                    <Route path="/idea" element={<Idea />} />
                    <Route path="/analysis" element={<Analysis />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/article-search" element={<ArticleSearch />} />
                    <Route path="/map" element={<ResearchMap />} />
                    <Route path="/opportunities" element={<Opportunities />} />
                    <Route path="/refine" element={<Refine />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ProjectsProvider>
      </ResearchProvider>
    </AuthProvider>
  </LanguageProvider>
  );
}
