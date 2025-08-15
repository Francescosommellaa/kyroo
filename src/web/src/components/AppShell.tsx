import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  MessageSquare,
  Calendar,
  Play,
  Brain,
  Download,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Lock,
} from "lucide-react";
import { useAuth } from "../contexts/auth";
import { usePlan } from "../hooks/usePlan";
import { SidebarPlanBadge } from "./PlanBadge";
import type { PlanType } from "../../../shared/plans";

interface AppShellProps {
  children: ReactNode;
}

// Define which features are available for each plan
const getFeatureAvailability = (planType: PlanType, isTrialPro: boolean) => {
  const effectivePlan = isTrialPro ? "pro" : planType;

  return {
    chat: true, // Available for all plans
    planner: true, // Available for all plans (Free has limited executions)
    executions: true, // Available for all plans (Free has limited executions)
    knowledge: effectivePlan !== "free", // Pro and Enterprise only (Knowledge Base)
    ingestion: effectivePlan !== "free", // Pro and Enterprise only (File analysis)
    billing: true, // Available for all plans
    account: true, // Available for all plans
  };
};

const navItems = [
  {
    path: "/app/chat",
    label: "Chat",
    icon: MessageSquare,
    feature: "chat" as const,
  },
  {
    path: "/app/planner",
    label: "Planner",
    icon: Calendar,
    feature: "planner" as const,
  },
  {
    path: "/app/executions",
    label: "Executions",
    icon: Play,
    feature: "executions" as const,
  },
  {
    path: "/app/knowledge",
    label: "Knowledge",
    icon: Brain,
    feature: "knowledge" as const,
  },
  {
    path: "/app/ingestion",
    label: "Ingestion",
    icon: Download,
    feature: "ingestion" as const,
  },
  {
    path: "/app/billing",
    label: "Billing",
    icon: CreditCard,
    feature: "billing" as const,
  },
  {
    path: "/app/account",
    label: "Account",
    icon: User,
    feature: "account" as const,
  },
];

export default function AppShell({ children }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { logout, profile } = useAuth();
  const { planType, isTrialPro } = usePlan();
  const navigate = useNavigate();

  // Get feature availability based on current plan
  const featureAvailability = getFeatureAvailability(planType, isTrialPro);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = () => {
    logout().then(() => {
      navigate("/");
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopCollapsed(!isDesktopCollapsed);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <motion.aside
          className="fixed left-0 top-0 bg-surface border-r border-border flex flex-col h-screen z-30"
          initial={false}
          animate={{
            width: isDesktopCollapsed ? "80px" : "280px",
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Toggle Button */}
          <button
            onClick={toggleDesktopSidebar}
            className="absolute -right-3 top-6 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center text-foreground-secondary hover:text-foreground hover:bg-surface-elevated transition-colors z-10"
          >
            {isDesktopCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </button>

          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <img
                src="/kyroo-logo.svg"
                alt="KYROO Logo"
                className="w-10 h-10 flex-shrink-0"
              />
              <AnimatePresence>
                {!isDesktopCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h1 className="text-xl font-bold text-foreground whitespace-nowrap">
                      KYROO
                    </h1>
                    <p className="text-xs text-foreground-secondary whitespace-nowrap">
                      Super IA Orchestrator
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isFeatureAvailable = featureAvailability[item.feature];

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-surface group relative ${
                          isActive
                            ? "bg-accent-violet text-white"
                            : "text-foreground-secondary hover:text-foreground hover:bg-surface-elevated"
                        } ${!isFeatureAvailable ? "opacity-60" : ""}`
                      }
                      title={isDesktopCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon size={20} className="flex-shrink-0" />
                        <AnimatePresence>
                          {!isDesktopCollapsed && (
                            <motion.span
                              className="font-medium whitespace-nowrap"
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Lock icon for unavailable features */}
                      {!isFeatureAvailable && (
                        <AnimatePresence>
                          {!isDesktopCollapsed && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Lock
                                size={16}
                                className="text-foreground-secondary"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}

                      {/* Tooltip for collapsed state */}
                      {isDesktopCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-surface-elevated text-foreground text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 flex items-center space-x-2">
                          <span>{item.label}</span>
                          {!isFeatureAvailable && (
                            <Lock
                              size={12}
                              className="text-foreground-secondary"
                            />
                          )}
                        </div>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>

            {/* Admin Section */}
            {profile?.role === "admin" && (
              <>
                <div className="my-4 border-t border-border"></div>
                <ul className="space-y-2">
                  <li>
                    <NavLink
                      to="/app/admin"
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-surface group relative ${
                          isActive
                            ? "bg-accent-violet text-white"
                            : "text-foreground-secondary hover:text-foreground hover:bg-surface-elevated"
                        }`
                      }
                      title={isDesktopCollapsed ? "Admin Dashboard" : undefined}
                    >
                      <Shield size={20} className="flex-shrink-0" />
                      <AnimatePresence>
                        {!isDesktopCollapsed && (
                          <motion.span
                            className="font-medium whitespace-nowrap"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            Admin Dashboard
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Tooltip for collapsed state */}
                      {isDesktopCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-surface-elevated text-foreground text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          Admin Dashboard
                        </div>
                      )}
                    </NavLink>
                  </li>
                </ul>
              </>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-border">
            {/* Profile */}
            <div className="flex items-center space-x-3 mb-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-accent-cyan to-accent-violet rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-white" size={18} />
                </div>
              )}
              <AnimatePresence>
                {!isDesktopCollapsed && (
                  <motion.div
                    className="flex-1 min-w-0"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm font-medium text-foreground truncate">
                      {profile?.display_name || "User"}
                    </p>
                    <SidebarPlanBadge
                      planType={planType}
                      isTrialPro={isTrialPro}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logout */}
            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-foreground-secondary hover:text-foreground hover:bg-surface-elevated rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface group relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title={isDesktopCollapsed ? "Logout" : undefined}
            >
              <LogOut size={20} className="flex-shrink-0" />
              <AnimatePresence>
                {!isDesktopCollapsed && (
                  <motion.span
                    className="font-medium whitespace-nowrap"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {isDesktopCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-surface-elevated text-foreground text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Logout
                </div>
              )}
            </motion.button>
          </div>
        </motion.aside>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.aside
              className="fixed left-0 top-0 w-80 bg-surface border-r border-border flex flex-col z-50 h-screen"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header with close button */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <img
                    src="/kyroo-logo.svg"
                    alt="KYROO Logo"
                    className="w-10 h-10"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-foreground">KYROO</h1>
                    <p className="text-xs text-foreground-secondary">
                      Super IA Orchestrator
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 text-foreground-secondary hover:text-foreground transition-colors rounded-lg hover:bg-surface-elevated"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {navItems.map((item) => {
                    const isFeatureAvailable =
                      featureAvailability[item.feature];

                    return (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-surface ${
                              isActive
                                ? "bg-accent-violet text-white"
                                : "text-foreground-secondary hover:text-foreground hover:bg-surface-elevated"
                            } ${!isFeatureAvailable ? "opacity-60" : ""}`
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          {!isFeatureAvailable && (
                            <Lock
                              size={16}
                              className="text-foreground-secondary"
                            />
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Admin Section Mobile */}
              {profile?.role === "admin" && (
                <>
                  <div className="mx-4 border-t border-border"></div>
                  <nav className="p-4">
                    <ul className="space-y-2">
                      <li>
                        <NavLink
                          to="/app/admin"
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-surface ${
                              isActive
                                ? "bg-accent-violet text-white"
                                : "text-foreground-secondary hover:text-foreground hover:bg-surface-elevated"
                            }`
                          }
                        >
                          <Shield size={20} />
                          <span className="font-medium">Admin Dashboard</span>
                        </NavLink>
                      </li>
                    </ul>
                  </nav>
                </>
              )}

              {/* User Profile & Logout */}
              <div className="p-4 border-t border-border">
                {/* Profile */}
                <div className="flex items-center space-x-3 mb-4">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-cyan to-accent-violet rounded-full flex items-center justify-center">
                      <User className="text-white" size={18} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {profile?.display_name || "User"}
                    </p>
                    <SidebarPlanBadge
                      planType={planType}
                      isTrialPro={isTrialPro}
                    />
                  </div>
                </div>

                {/* Logout */}
                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-foreground-secondary hover:text-foreground hover:bg-surface-elevated rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      )}

      {/* Main Content */}
      <main
        className="overflow-auto"
        style={{
          marginLeft: !isMobile ? (isDesktopCollapsed ? "80px" : "280px") : "0",
          minHeight: "100vh",
        }}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="bg-surface border-b border-border p-4 flex items-center justify-between">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-foreground-secondary hover:text-foreground transition-colors rounded-lg hover:bg-surface-elevated"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-2">
              <img src="/kyroo-logo.svg" alt="KYROO Logo" className="w-8 h-8" />
              <span className="text-lg font-bold text-foreground">KYROO</span>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        )}

        <motion.div
          className="p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
