"use client";
import { createContext, useContext, useState, useEffect } from "react";

// Create the context
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ role: null, fullName: null });
  const [loading, setLoading] = useState(true);

  // Load from localStorage on startup so refresh doesn't log you out
  useEffect(() => {
    const role = localStorage.getItem("role");
    const fullName = localStorage.getItem("fullName");
    
    if (role) {
      setUser({ role: role, fullName: fullName || null });
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth state
export function useAuth() {
  const context = useContext(AuthContext);
  
  // If the hook is used outside of a provider, return empty defaults 
  // to prevent the "cannot destructure" error.
  if (context === undefined) {
    return { 
      user: { role: null, fullName: null }, 
      setUser: () => {},
      loading: false,
    };
  }
  return context;
}