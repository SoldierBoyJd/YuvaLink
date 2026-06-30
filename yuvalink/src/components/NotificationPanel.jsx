import { useEffect, useRef } from "react";
import { Bell, UserPlus, Check, X, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face";

const TYPE_ICON = {
  connection_request:  <UserPlus size={14} style={{ color: "var(--primary)" }} />,
  connection_accepted: <Check size={14} style={{ color: "#10b981" }} />,
  connection:          <UserPlus size={14} style={{ color: "var(--primary)" }} />,
  default:             <Bell size={14} style={{ color: "var(--text-muted)" }} />,
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationPanel({ notifications, loading, unreadCount, onMarkAllRead, onMarkOneRead, onClose }) {
  const navigate = useNavigate();
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleNotifClick = (notif) => {
    onMarkOneRead(notif.id);
    if (notif.type === "connection" || notif.type === "connection_request" || notif.type === "connection_accepted") navigate("/connections");
    onClose();
  };

  return (
    <div
      ref={panelRef}
      className="glass-card animate-fade-in"
      style={{
        position: "absolute",
        top: "50px",
        right: 0,
        width: "340px",
        maxHeight: "480px",
        display: "flex",
        flexDirection: "column",
        zIndex: 200,
        background: "var(--bg-tertiary)",
        boxShadow: "var(--shadow-lg)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 16px 12px",
        borderBottom: "1px solid var(--card-border)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Bell size={16} style={{ color: "var(--primary)" }} />
          <span style={{ fontWeight: "700", fontSize: "15px" }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              background: "var(--danger)",
              color: "#fff",
              borderRadius: "999px",
              padding: "1px 7px",
              fontSize: "11px",
              fontWeight: "700",
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <Check size={12} /> Mark all read
            </button>
          )}
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", gap: "10px", color: "var(--text-secondary)" }}>
            <Loader size={16} className="animate-spin" /><span>Loading...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <Bell size={32} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>All caught up!</p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>No notifications yet.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleNotifClick(notif)}
              style={{
                display: "flex",
                gap: "12px",
                padding: "12px 16px",
                cursor: "pointer",
                borderBottom: "1px solid var(--card-border)",
                background: notif.read ? "transparent" : "rgba(139,92,246,0.06)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
              onMouseLeave={e => e.currentTarget.style.background = notif.read ? "transparent" : "rgba(139,92,246,0.06)"}
            >
              {/* Actor avatar or icon */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img
                  src={notif.actor?.avatar_url || FALLBACK_AVATAR}
                  alt={notif.actor?.full_name || "User"}
                  style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }}
                />
                <div style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  background: "var(--bg-tertiary)",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--card-border)",
                }}>
                  {TYPE_ICON[notif.type] || TYPE_ICON.default}
                </div>
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: "1.4", margin: 0 }}>
                  {notif.message}
                </p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  {timeAgo(notif.created_at)}
                </p>
              </div>

              {/* Unread dot */}
              {!notif.read && (
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)", flexShrink: 0, marginTop: "4px" }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
