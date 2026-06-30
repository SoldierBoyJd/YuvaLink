import { useState, useEffect, useCallback } from "react";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from("notifications")
            .select(`
        id, type, message, read, created_at,
        actor:actor_id ( id, full_name, avatar_url )
      `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(30);

        if (!error) setNotifications(data || []);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Realtime subscription — new notifications push instantly
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`notifications:${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                async (payload) => {
                    // Fetch the full row with actor join
                    const { data } = await supabase
                        .from("notifications")
                        .select(`id, type, message, read, created_at, actor:actor_id ( id, full_name, avatar_url )`)
                        .eq("id", payload.new.id)
                        .single();
                    if (data) setNotifications(prev => [data, ...prev]);
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [user]);

    const markAllRead = async () => {
        if (!user) return;
        await supabase
            .from("notifications")
            .update({ read: true })
            .eq("user_id", user.id)
            .eq("read", false);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markOneRead = async (id) => {
        await supabase.from("notifications").update({ read: true }).eq("id", id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return { notifications, loading, unreadCount, markAllRead, markOneRead, refetch: fetchNotifications };
}
