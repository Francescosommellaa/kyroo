import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import AppShell from "../../components/AppShell";
import { useAuth } from "../../contexts/auth";
import {
  ProfileForm,
  PasswordChange,
  ProfileSettings,
  ProfileFormData,
  PasswordFormData,
  MessageState,
  ShowPasswordsState,
  PLAN_INFO,
} from "../../components/profile";

export default function Account() {
  const { user, profile, updateProfile, updatePassword } =
    useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<MessageState | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: "",
    display_name: "",
    phone: "",
    first_name: "",
    last_name: "",
    email: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState<ShowPasswordsState>({
    current: false,
    new: false,
    confirm: false,
  });

  // Sync form data with profile when profile changes
  useEffect(() => {
    if (profile && !hasUnsavedChanges && !isUpdatingPassword) {
      setFormData({
        full_name: profile.full_name || "",
        display_name: profile.display_name || "",
        phone: profile.phone || "",
        first_name: "",
        last_name: "",
        email: user?.email || "",
      });
    }
  }, [profile, hasUnsavedChanges, isUpdatingPassword, user?.email]);

  // Get user plan from profile
  const userPlan = profile?.plan || "free";

  // Handle profile form submission
  const handleProfileSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      setMessage(null);

      const { error } = await updateProfile({
        full_name: data.full_name.trim() || null,
        display_name: data.display_name.trim() || null,
        phone: data.phone.trim() || null,
      });

      if (error) {
        setMessage({ type: "error", text: error });
      } else {
        setMessage({
          type: "success",
          text: "Profilo aggiornato con successo!",
        });
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "Errore durante l'aggiornamento del profilo",
      });
    } finally {
      setLoading(false);
    }
  };



  // Handle password change
  const handlePasswordChange = async (data: PasswordFormData) => {
    try {
      setPasswordLoading(true);
      setIsUpdatingPassword(true);
      setPasswordMessage(null);

      const { error } = await updatePassword(data.newPassword);

      if (error) {
        setPasswordMessage({ type: "error", text: error });
      } else {
        setPasswordMessage({
          type: "success",
          text: "Password aggiornata con successo!",
        });
        // Reset form data
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      setPasswordMessage({
        type: "error",
        text: "Errore durante l'aggiornamento della password",
      });
    } finally {
      setPasswordLoading(false);
      setIsUpdatingPassword(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Ciao, {profile?.display_name || "Utente"}!
            </h1>
            <p className="text-foreground-secondary">
              Gestisci il tuo profilo, preferenze e impostazioni di sicurezza
            </p>
          </div>

          {/* Message */}
          {(message || passwordMessage) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                message?.type === "success" ||
                passwordMessage?.type === "success"
                  ? "bg-green-500/10 border border-green-500/20 text-green-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
            >
              {message?.type === "success" ||
              passwordMessage?.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              {message?.text || passwordMessage?.text}
            </motion.div>
          )}

          {/* Main Layout - 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Informazioni Profilo e Sicurezza */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Form Component */}
              <ProfileForm
                formData={formData}
                loading={loading}
                message={message}
                onInputChange={(e) => {
                  const { name, value } = e.target;
                  setFormData(prev => ({ ...prev, [name]: value }));
                  setHasUnsavedChanges(true);
                }}
                onSubmit={handleProfileSubmit}
                userEmail={user?.email || ''}
              />

              {/* Password Change Component */}
              <PasswordChange
                passwordData={passwordData}
                showPasswords={showPasswords}
                loading={passwordLoading}
                message={passwordMessage}
                onInputChange={(e) => {
                  const { name, value } = e.target;
                  setPasswordData(prev => ({ ...prev, [name]: value }));
                }}
                onSubmit={handlePasswordChange}
                onToggleVisibility={(field) => {
                  setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
                }}
              />
            </div>

            {/* Right Column - Profile Settings */}
            <div className="space-y-6">
              <ProfileSettings
                userPlan={userPlan}
                planInfo={PLAN_INFO}
                profile={profile}
                user={user}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
