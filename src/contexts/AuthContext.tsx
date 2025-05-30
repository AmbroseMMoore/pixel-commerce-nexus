
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
        
        console.log('Setting user state with:', userData);
        setUser(userData);
        setIsAdmin(profile.role === 'admin');
        console.log('User set with admin status:', profile.role === 'admin');
        return true;
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Clear user state on error
      setUser(null);
      setIsAdmin(false);
    }
    return false;
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('=== Initializing Auth ===');
        
        // First, get the current session to check if user is already authenticated
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('Current session status:', !!session);
        
        if (session?.user) {
          console.log('Session found for user:', session.user.email);
          console.log('Session user credentials:', {
            id: session.user.id,
            email: session.user.email,
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at
          });
          
          if (mounted) {
            console.log('Proceeding with profile verification for authenticated user...');
            const profileLoaded = await loadUserProfile(session.user.id);
            console.log('Profile verification result:', profileLoaded);
          }
        } else {
          console.log('No active session found');
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
        console.log("=== Auth state changed ===", event);
        
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user.email);
          console.log('New session user credentials:', {
            id: session.user.id,
            email: session.user.email,
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at
          });
          
          setLoading(true);
          console.log('Proceeding with profile verification...');
          
          const profileLoaded = await loadUserProfile(session.user.id);
          console.log('Profile verification result after sign in:', profileLoaded);
          
          if (mounted) {
            console.log('Setting loading to false after profile verification');
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing state...');
          setUser(null);
          setIsAdmin(false);
          if (mounted) {
            setLoading(false);
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('Token refreshed for user:', session.user.email);
          console.log('Refreshed session user credentials:', {
            id: session.user.id,
            email: session.user.email,
            last_sign_in_at: session.user.last_sign_in_at
          });
          // No need to reload profile on token refresh, just log the credentials
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const login = useCallback((userData: User) => {
    console.log('Manual login with user credentials:', userData);
    setUser(userData);
    setIsAdmin(userData.isAdmin || false);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('Logging out current user...');
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
