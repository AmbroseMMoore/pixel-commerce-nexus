
import { supabase } from "@/integrations/supabase/client";

export const handleSupabaseError = (error: any) => {
  console.error("Supabase error:", error);
  
  if (error.code === "23505") {
    error.message = "A record with this value already exists. Please use unique values.";
  } else if (error.code === "42501") {
    error.message = "You don't have permission to perform this action. Please check your admin credentials and make sure you're logged in with admin privileges.";
    supabase.auth.refreshSession();
  } else if (error.code === "23503") {
    error.message = "Invalid reference. The item you're referencing may not exist.";
  }
  
  throw error;
};
