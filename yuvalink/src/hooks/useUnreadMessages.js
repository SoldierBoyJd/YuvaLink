import { useState, useEffect, useCallback } from "react";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

export function useUnreadMessages() {
    const { user } = useAuth();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnread = useCallback(async () => {
        if (!user) return;

        // Get all conversations the user is part of
        const { data: convs } = await supabase
            .from("conversations")
            .select("id")
            .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

        if (!convs || convs.length === 0) { setUnreadCount(0); return; }

        const convIds = convs.map(c => c.id);

        // Count unread messages not sent by user
        const { count } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .in("conversation_id", convIds)
            .neq("sender_id", user.id)
            .eq("read", false);

        setUnreadCount(count ?? 0);
    }, [user]);

    useEffect(() => {
        fetchUnread();
    }, [fetchUnread, location.pathname]); // re-fetch when navigating (e.g. leaving chat)

    useEffect(() => {
        if (!user) return;

        // Realtime subscription
        const channel = supabase
            .channel(`unread-messages:${user.id}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" },
                () => fetchUnread()
            )
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" },
                () => fetchUnread()
            )
            .subscribe();

        // Polling fallback every 10s in case realtime UPDATE misses
        const interval = setInterval(fetchUnread, 10000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [user, fetchUnread]);

    return unreadCount;
}
