import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ContactsPage from "./pages/ContactsPage";
import Chat from "./pages/app/Chat";
import Planner from "./pages/app/Planner";
import Executions from "./pages/app/Executions";
import Knowledge from "./pages/app/Knowledge";
import Ingestion from "./pages/app/Ingestion";
import Billing from "./pages/app/Billing";
import Account from "./pages/app/Account";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to="/app/chat" replace /> : <LandingPage />} 
      />
      <Route 
        path="/" 
        element={user ? <Navigate to="/app/chat" replace /> : <LandingPage />} 
      />
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