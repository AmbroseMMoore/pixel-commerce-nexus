
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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

  const loadUserProfile = useCallback(async (userId: string): Promise<boolean> => {
    try {
      console.log('Loading profile for user:', userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, this should be created by the trigger');
          return false;
        }
        return false;
      }

      if (profile) {
        console.log('Profile loaded successfully:', profile);
        const userData: User = {
          id: profile.id,
          name: profile.name || profile.email,
          email: profile.email,
          isAdmin: profile.role === 'admin'
        };
        
        setUser(userData);
        setIsAdmin(profile.role === 'admin');
        console.log('User set with admin status:', profile.role === 'admin');
        return true;
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
    return false;
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('=== Initializing Auth ===');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('Initial session:', !!session, session?.user?.email);

        if (session?.user && mounted) {
          console.log('Initial session found, loading profile...');
          const profileLoaded = await loadUserProfile(session.user.id);
          console.log('Initial profile loading result:', profileLoaded);
        }
        
        if (mounted) {
          console.log('Setting initial loading to false');
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("=== Auth state changed ===", event, session?.user?.email);
        
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, setting loading to true and loading profile...');
          setLoading(true);
          
          const profileLoaded = await loadUserProfile(session.user.id);
          console.log('Profile loading result after sign in:', profileLoaded);
          
          if (mounted) {
            console.log('Setting loading to false after profile load attempt');
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing state...');
          setUser(null);
          setIsAdmin(false);
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const login = useCallback((userData: User) => {
    console.log('Manual login:', userData);
    setUser(userData);
    setIsAdmin(userData.isAdmin || false);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('Logging out...');
      setLoading(true);
      
      // Clear local state first
      setUser(null);
      setIsAdmin(false);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
      } else {
        console.log('Logout successful');
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setLoading(false);
    }
  }, []);

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
