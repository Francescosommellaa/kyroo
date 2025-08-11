import { createContext, useContext, useMemo, useState, ReactNode } from "react";

type User = { id: string; email?: string } | null;

type AuthCtx = { 
  user: User; 
  loginDemo: () => void; 
  logout: () => void; 
  demo: boolean; 
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const demo = (import.meta as any).env?.VITE_DEMO_AUTH === "true";
  const [user, setUser] = useState<User>(null);
  
  const value = useMemo<AuthCtx>(() => ({
    user,
    demo,
    loginDemo: () => { if (demo) setUser({ id: "demo" }); },
    logout: () => setUser(null),
  }), [user, demo]);
  
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const v = useContext(Ctx); 
  if (!v) throw new Error("AuthContext missing");
  return v;
};