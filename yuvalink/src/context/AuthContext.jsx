import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../config/supabase";

const AuthContext = createContext(null);

const parseJsonField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    } else if (data) {
      // Normalize json fields — column may be text type instead of jsonb
      // Also handle both github_url/linkedin_url (old) and github/linkedin (new) column names
      setProfile({
        ...data,
        github: data.github || data.github_url || "",
        linkedin: data.linkedin || data.linkedin_url || "",
        skills: parseJsonField(data.skills),
        projects: parseJsonField(data.projects),
        experience: parseJsonField(data.experience),
      });
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      fetchProfile(currentUser?.id).finally(() => setLoading(false));
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await fetchProfile(currentUser?.id);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Call this after updating the profile in Supabase to refresh context
  const refreshProfile = () => fetchProfile(user?.id);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
