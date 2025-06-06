import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = useCallback(async (userId: string): Promise<boolean> => {
    console.log("[Auth] 🔍 Loading profile for user:", userId);
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("[Auth] ❌ Profile loading error:", error.message, "Code:", error.code);
        // Allow app to continue if this is just a missing profile row
        if (error.code === "PGRST116" || error.message.includes("No rows")) {
          console.warn("[Auth] ⚠️ Profile not found (trigger will handle creation if applicable)");
          return false;
        }
        return false;
      }

      if (profile) {
        const userData: User = {
          id: profile.id,
          name: profile.name || profile.email,
          email: profile.email,
          isAdmin: profile.role === "admin",
        };

        console.log("[Auth] ✅ Profile loaded:", userData);

        setUser(userData);
        setIsAdmin(userData.isAdmin);
        return true;
      }
    } catch (err: any) {
      console.error("[Auth] 💥 Unexpected error loading profile:", err.message || err);
      setUser(null);
      setIsAdmin(false);
    }

    return false;
  }, []);

  useEffect(() => {
    let mounted = true;

    const handleSession = async (sessionUser: any) => {
      if (!mounted) return;
      const userId = sessionUser.id;

      setLoading(true);
      const profileLoaded = await loadUserProfile(userId);

      if (!profileLoaded) {
        toast({
          title: "⚠️ Profile not found",
          description: "Your account was authenticated but the profile is missing.",
        });
      }

      if (mounted) setLoading(false);
    };

    const init = async () => {
      console.log("[Auth] 🔄 Initializing Auth...");
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("[Auth] ❌ Session fetch error:", error.message);
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log("[Auth] 🔐 Existing session found for:", session.user.email);
        handleSession(session.user);
      } else {
        console.log("[Auth] 🚫 No session found.");
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[Auth] 🔁 Auth state changed: ${event}`);

        if (!mounted) return;

        if (event === "SIGNED_IN" && session?.user) {
          console.log("[Auth] ✅ Signed in:", session.user.email);
          handleSession(session.user);
        }

        if (event === "SIGNED_OUT") {
          console.log("[Auth] 🚪 Signed out");
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }

        if (event === "TOKEN_REFRESHED") {
          console.log("[Auth] ♻️ Token refreshed");
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const login = useCallback((userData: User) => {
    console.log("[Auth] 🔑 Manual login triggered:", userData);
    setUser(userData);
    setIsAdmin(userData.isAdmin || false);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    console.log("[Auth] 🔒 Logging out...");
    try {
      setUser(null);
      setIsAdmin(false);
      setLoading(true);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      console.log("[Auth] ✅ Logout successful");
    } catch (err: any) {
      console.error("[Auth] ❌ Logout error:", err.message || err);
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
