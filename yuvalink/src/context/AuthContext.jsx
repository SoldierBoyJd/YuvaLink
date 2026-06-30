import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../config/supabase";

const AuthContext = createContext(null);

const parseJsonField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
};

// Compute profile completion % based on filled fields
function computeCompletion(data) {
  const fields = [
    data.full_name, data.department, data.bio, data.avatar_url,
    data.location, data.title, data.github || data.github_url,
    data.linkedin || data.linkedin_url,
  ];
  const arrayFields = [
    parseJsonField(data.skills).length > 0,
    parseJsonField(data.projects).length > 0,
  ];
  const filled = fields.filter(Boolean).length + arrayFields.filter(Boolean).length;
  return Math.round((filled / (fields.length + arrayFields.length)) * 100);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // Cache: avoid re-fetching if userId hasn't changed
  const lastFetchedUserId = useRef(null);

  const fetchProfile = async (userId) => {
    if (!userId) { setProfile(null); lastFetchedUserId.current = null; return; }

    // Fetch profile + connections count in parallel
    const [profileResult, connResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("connections").select("id", { count: "exact", head: true })
        .eq("user_id", userId).eq("status", "accepted"),
    ]);

    if (profileResult.error) {
      console.error("Error fetching profile:", profileResult.error);
      return;
    }

    const data = profileResult.data;
    if (data) {
      const connectionsCount = connResult.count ?? 0;
      const completion = computeCompletion(data);
      setProfile({
        ...data,
        github: data.github || data.github_url || "",
        linkedin: data.linkedin || data.linkedin_url || "",
        skills: parseJsonField(data.skills),
        projects: parseJsonField(data.projects),
        experience: parseJsonField(data.experience),
        connections_count: connectionsCount,
        profile_completion: completion,
      });
      lastFetchedUserId.current = userId;
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      fetchProfile(currentUser?.id).finally(() => setLoading(false));
    });

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
