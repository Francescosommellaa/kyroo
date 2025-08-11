import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";

  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to="/app/chat" replace /> : <LandingPage />} 
      />
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