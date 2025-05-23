
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          return;
        }
        
        if (data.session) {
          // Updated admin emails - only the new admin user
          const adminEmails = ["mail.trulle@gmail.com"];
          
          const userData: User = {
            id: data.session.user.id,
            email: data.session.user.email || "",
            name: data.session.user.user_metadata?.name || data.session.user.email || "Admin",
            isAdmin: adminEmails.includes(data.session.user.email || "")
          };
          setUser(userData);
        }
      } catch (error) {
        console.error("Error in auth check:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      if (session) {
        // Updated admin emails - only the new admin user
        const adminEmails = ["mail.trulle@gmail.com"];
        
        const userData: User = {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name || session.user.email || "Admin",
          isAdmin: adminEmails.includes(session.user.email || "")
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      return Promise.resolve();
    } catch (error) {
      console.error("Error signing out:", error);
      return Promise.reject(error);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = !!user?.isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
