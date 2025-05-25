
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, validateSession } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('🔄 Loading profile for user:', userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("❌ Error loading profile:", error);
        if (error.code === 'PGRST116') {
          console.log('⚠️ Profile not found, will be created by trigger');
          return null;
        }
        throw error;
      }

      if (profile) {
        console.log('✅ Profile loaded:', profile);
        const userData: User = {
          id: profile.id,
          name: profile.name || profile.email,
          email: profile.email,
          isAdmin: profile.role === 'admin'
        };
        
        setUser(userData);
        setIsAdmin(profile.role === 'admin');
        console.log('✅ User set with admin status:', profile.role === 'admin');
        return userData;
      }
    } catch (error) {
      console.error("❌ Error loading user profile:", error);
      // Don't throw here, let the auth flow continue
    }
    return null;
  }, []);

  const clearAuthState = useCallback(() => {
    console.log('🧹 Clearing auth state');
    setUser(null);
    setIsAdmin(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth...');
        setLoading(true);

        // Validate current session
        const session = await validateSession();
        
        if (session?.user && mounted) {
          console.log('✅ Valid session found:', session.user.email);
          await loadUserProfile(session.user.id);
        } else {
          console.log('❌ No valid session found');
          clearAuthState();
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        clearAuthState();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event, session?.user?.email);
        
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in');
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (event === 'SIGNED_OUT') {
            console.log('👋 User signed out');
            clearAuthState();
          } else if (session?.user) {
            console.log('🔄 Token refreshed');
            await loadUserProfile(session.user.id);
          }
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile, clearAuthState]);

  const login = useCallback((userData: User) => {
    console.log('👤 Manual login:', userData);
    setUser(userData);
    setIsAdmin(userData.isAdmin || false);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('👋 Logging out...');
      setLoading(true);
      
      // Clear local state first
      clearAuthState();
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("❌ Logout error:", error);
      } else {
        console.log('✅ Logout successful');
      }
    } catch (error) {
      console.error("❌ Error during logout:", error);
    } finally {
      setLoading(false);
    }
  }, [clearAuthState]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
