import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/ui/PageLoader";

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader label="Verificando tu sesión…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
