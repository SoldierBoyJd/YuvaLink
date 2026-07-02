import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Send, MessageSquare, Search, ArrowLeft, Loader } from "lucide-react";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";
import { deriveConversationKey, encryptMessage, decryptMessage } from "../utils/crypto";

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face";

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Chat() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const withUserId = searchParams.get("with");

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [activePeer, setActivePeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [convKey, setConvKey] = useState(null); // AES-GCM key for active conversation
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Scroll to bottom ─────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ── Load conversations ────────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConvs(true);
    const { data } = await supabase
      .from("conversations")
      .select("id, user_a, user_b, last_message, updated_at")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (!data) { setLoadingConvs(false); return; }

    // Fetch peer profiles for each conversation
    const peerIds = data.map(c => c.user_a === user.id ? c.user_b : c.user_a);
    const uniquePeerIds = [...new Set(peerIds)];
    const { data: peers } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, title, department")
      .in("id", uniquePeerIds);

    const peerMap = {};
    (peers || []).forEach(p => { peerMap[p.id] = p; });

    // Decrypt last_message for each conversation using per-peer key
    const convs = await Promise.all(data.map(async c => {
      const peerId = c.user_a === user.id ? c.user_b : c.user_a;
      const peer = peerMap[peerId];
      let last_message_preview = null;
      if (c.last_message) {
        try {
          const key = await deriveConversationKey(user.id, peerId);
          last_message_preview = await decryptMessage(c.last_message, key);
        } catch {
          last_message_preview = "Message";
        }
      }
      return { ...c, peer, last_message_preview };
    }));

    setConversations(convs);
    setLoadingConvs(false);
  }, [user]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // ── Open conversation from ?with= param ──────────────────────────────────────
  useEffect(() => {
    if (!withUserId || !user) return;
    const openChat = async () => {
      const convId = await supabase.rpc("get_or_create_conversation", {
        p_user_a: user.id, p_user_b: withUserId,
      });
      if (convId.error) {
        // Not connected — redirect to Discover
        navigate("/discover");
        return;
      }
      if (convId.data) {
        setActiveConvId(convId.data);
        // Fetch peer info
        const { data: peer } = await supabase
          .from("profiles").select("id, full_name, avatar_url, title, department")
          .eq("id", withUserId).single();
        setActivePeer(peer);
        await loadConversations();
        setSearchParams({}, { replace: true });
      }
    };
    openChat();
  }, [withUserId, user, loadConversations, setSearchParams]);

  // ── Derive encryption key for active conversation ────────────────────────────
  useEffect(() => {
    if (!user || !activePeer) { setConvKey(null); return; }
    deriveConversationKey(user.id, activePeer.id).then(setConvKey).catch(console.error);
  }, [user, activePeer]);

  // ── Load messages for active conversation ────────────────────────────────────
  useEffect(() => {
    if (!activeConvId || !convKey) return;
    const loadMessages = async () => {
      setLoadingMessages(true);
      const { data } = await supabase
        .from("messages")
        .select("id, content, sender_id, read, created_at")
        .eq("conversation_id", activeConvId)
        .order("created_at", { ascending: true });

      // Decrypt each message
      const decrypted = await Promise.all(
        (data || []).map(async m => ({
          ...m,
          content: await decryptMessage(m.content, convKey),
        }))
      );
      setMessages(decrypted);
      setLoadingMessages(false);
      // Mark unread messages as read
      supabase.from("messages")
        .update({ read: true })
        .eq("conversation_id", activeConvId)
        .neq("sender_id", user.id)
        .eq("read", false);
    };
    loadMessages();
  }, [activeConvId, convKey, user]);

  // ── Realtime messages subscription ───────────────────────────────────────────
  useEffect(() => {
    if (!activeConvId) return;
    const channel = supabase
      .channel(`messages:${activeConvId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${activeConvId}`,
      }, async (payload) => {
        // Avoid duplicates (own messages already added optimistically)
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return prev; // will be replaced async below
        });
        // Decrypt and add
        const plaintext = convKey
          ? await decryptMessage(payload.new.content, convKey)
          : payload.new.content;
        const decryptedMsg = { ...payload.new, content: plaintext };
        setMessages(prev => {
          if (prev.some(m => m.id === decryptedMsg.id)) return prev;
          return [...prev, decryptedMsg];
        });
        // Mark as read if from peer
        if (payload.new.sender_id !== user?.id) {
          supabase.from("messages").update({ read: true }).eq("id", payload.new.id);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [activeConvId, user]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || !activeConvId || !user || sending || !convKey) return;
    setSending(true);

    // Show plaintext optimistically in UI
    const optimistic = {
      id: `temp-${Date.now()}`,
      content: text,           // plaintext for display
      sender_id: user.id,
      read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setInput("");

    // Encrypt before sending to DB
    const encrypted = await encryptMessage(text, convKey);

    const { data: msg } = await supabase
      .from("messages")
      .insert({ conversation_id: activeConvId, sender_id: user.id, content: encrypted })
      .select("id, content, sender_id, read, created_at")
      .single();

    if (msg) {
      // Replace optimistic with real (keep plaintext content — no need to decrypt own message)
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...msg, content: text } : m));
      // Store encrypted preview in conversation
      await supabase.from("conversations")
        .update({ last_message: encrypted, updated_at: new Date().toISOString() })
        .eq("id", activeConvId);
      // Notify the recipient only for the first message (avoid spam per conversation)
      // Check if there's already a recent unread notification from this conversation
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", activePeer.id)
        .eq("actor_id", user.id)
        .eq("type", "message")
        .eq("read", false);
      if (!count || count === 0) {
        await supabase.from("notifications").insert({
          user_id: activePeer.id,
          actor_id: user.id,
          type: "message",
          message: `${profile?.full_name || "Someone"} sent you a message`,
        });
      }
      await loadConversations();
    }
    setSending(false);
    inputRef.current?.focus();
  };

  // ── Select conversation ───────────────────────────────────────────────────────
  const selectConversation = async (conv) => {
    setActiveConvId(conv.id);
    setActivePeer(conv.peer);
    // Mark all unread messages in this conversation as read immediately
    if (user) {
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conv.id)
        .neq("sender_id", user.id)
        .eq("read", false);
    }
  };

  const filteredConvs = conversations.filter(c =>
    !searchQuery || (c.peer?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", height: "calc(100vh - 70px - 32px)", gap: "0", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--card-border)" }}>

      {/* ── Conversations sidebar ── */}
      <div style={{ width: "300px", flexShrink: 0, borderRight: "1px solid var(--card-border)", display: "flex", flexDirection: "column", background: "var(--bg-secondary)" }}>
        {/* Header */}
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--card-border)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={18} style={{ color: "var(--primary)" }} /> Messages
          </h2>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input type="text" placeholder="Search conversations..." className="glass-input"
              style={{ width: "100%", padding: "8px 10px 8px 30px", fontSize: "13px" }}
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loadingConvs ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "32px" }}>
              <Loader size={18} className="animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No conversations yet.</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Go to Connections and click Message.</p>
            </div>
          ) : filteredConvs.map(conv => (
            <div key={conv.id} onClick={() => selectConversation(conv)}
              style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", cursor: "pointer",
                background: activeConvId === conv.id ? "var(--primary-glow)" : "transparent",
                borderLeft: activeConvId === conv.id ? "3px solid var(--primary)" : "3px solid transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (activeConvId !== conv.id) e.currentTarget.style.background = "var(--bg-tertiary)"; }}
              onMouseLeave={e => { if (activeConvId !== conv.id) e.currentTarget.style.background = "transparent"; }}
            >
              <img src={conv.peer?.avatar_url || FALLBACK_AVATAR} alt={conv.peer?.full_name}
                style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conv.peer?.full_name || "Unknown"}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0, marginLeft: "8px" }}>
                    {conv.updated_at ? timeAgo(conv.updated_at) : ""}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {conv.last_message_preview || conv.peer?.title || conv.peer?.department || "Student"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
        {!activeConvId ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", color: "var(--text-muted)" }}>
            <MessageSquare size={48} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-secondary)" }}>Select a conversation</p>
            <p style={{ fontSize: "13px" }}>Or go to Connections → Message to start a new chat</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--card-border)", display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-secondary)" }}>
              <button onClick={() => { setActiveConvId(null); setActivePeer(null); }}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: "4px" }}>
                <ArrowLeft size={18} />
              </button>
              <img src={activePeer?.avatar_url || FALLBACK_AVATAR} alt={activePeer?.full_name}
                style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }} />
              <div>
                <p style={{ fontSize: "15px", fontWeight: "700" }}>{activePeer?.full_name || "Chat"}</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{activePeer?.title || activePeer?.department || "Student"}</p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {loadingMessages ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "32px" }}>
                  <Loader size={18} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "14px" }}>
                  Say hi to {activePeer?.full_name?.split(" ")[0] || "them"}! 👋
                </div>
              ) : messages.map(msg => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", gap: "8px", alignItems: "flex-end" }}>
                    {!isMe && (
                      <img src={activePeer?.avatar_url || FALLBACK_AVATAR} alt=""
                        style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    )}
                    <div style={{
                      maxWidth: "65%",
                      padding: "10px 14px",
                      borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: isMe ? "var(--primary-gradient)" : "var(--bg-tertiary)",
                      color: isMe ? "#fff" : "var(--text-primary)",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      wordBreak: "break-word",
                      boxShadow: "var(--shadow-sm)",
                    }}>
                      {msg.content}
                      <div style={{ fontSize: "10px", opacity: 0.6, marginTop: "4px", textAlign: isMe ? "right" : "left" }}>
                        {timeAgo(msg.created_at)}
                      </div>
                    </div>
                    {isMe && (
                      <img src={profile?.avatar_url || FALLBACK_AVATAR} alt=""
                        style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: "16px 20px", borderTop: "1px solid var(--card-border)", display: "flex", gap: "10px", background: "var(--bg-secondary)" }}>
              <input
                ref={inputRef}
                type="text"
                placeholder={`Message ${activePeer?.full_name?.split(" ")[0] || ""}...`}
                className="glass-input"
                style={{ flex: 1, padding: "10px 16px", fontSize: "14px" }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
                autoComplete="off"
              />
              <button type="submit" disabled={!input.trim() || sending} className="btn btn-primary"
                style={{ padding: "10px 16px", height: "auto", gap: "6px", flexShrink: 0 }}>
                {sending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
