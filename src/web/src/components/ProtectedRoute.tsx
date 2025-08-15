import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth";

export default function ProtectedRoute() {
  const { user } = useAuth();
  const loc = useLocation();
  
  if (!user) return <Navigate to="/" replace state={{ from: loc }} />;
  
  return <Outlet />;
}