import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
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
import AdminDashboard from "./pages/app/AdminDashboard";
import EnterpriseLimits from "./pages/app/EnterpriseLimits";
import Pricing from "./pages/Pricing";
import DebugAuth from "./pages/DebugAuth";

export default function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing page - sempre accessibile */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth pages */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/debug-auth" element={<DebugAuth />} />
      
      {/* Public pages */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="/pricing" element={<Pricing />} />
      
      {/* Protected app routes */}
      <Route path="/app" element={<ProtectedRoute />}>
        <Route path="chat" element={<Chat />} />
        <Route path="planner" element={<Planner />} />
        <Route path="executions" element={<Executions />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="ingestion" element={<Ingestion />} />
        <Route path="billing" element={<Billing />} />
        <Route path="account" element={<Account />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/enterprise-limits/:userId" element={<EnterpriseLimits />} />
        <Route index element={<Navigate to="chat" replace />} />
      </Route>
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

