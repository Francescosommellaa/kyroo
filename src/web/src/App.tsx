import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Chat from "./pages/app/Chat";
import Planner from "./pages/app/Planner";
import Executions from "./pages/app/Executions";
import Knowledge from "./pages/app/Knowledge";
import Ingestion from "./pages/app/Ingestion";
import Billing from "./pages/app/Billing";
import Account from "./pages/app/Account";
import TermsOfService from "./pages/TermsOfService";
import ContactsPage from "./pages/ContactsPage";

function RootRedirect() {
  const { user, loading } = useAuth();
  const loc = useLocation();
  
  console.log('🔄 RootRedirect:', { user: !!user, loading })
  
  if (loading) {
    console.log('🔄 RootRedirect: Still loading...')
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-violet border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (user) {
    console.log('🔄 RootRedirect: User found, redirecting to /app/chat')
    return <Navigate to="/app/chat" replace state={{ from: loc }} />;
  }
  
  console.log('🔄 RootRedirect: No user, showing landing page')
  return <LandingPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="/app" element={<ProtectedRoute />}>
        <Route path="chat" element={<Chat />} />
        <Route path="planner" element={<Planner />} />
        <Route path="executions" element={<Executions />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="ingestion" element={<Ingestion />} />
        <Route path="billing" element={<Billing />} />
        <Route path="account" element={<Account />} />
        <Route index element={<Navigate to="chat" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}