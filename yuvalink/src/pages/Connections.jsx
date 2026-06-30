import { useState, useEffect } from "react";
import {
  Users,
  MessageSquare,
  Search,
  UserMinus,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face";

function Connections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("connections");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchConnections = async () => {
      setLoading(true);
      // Step 1: get connected user IDs
      const { data: connData, error } = await supabase
        .from("connections")
        .select("connected_user_id")
        .eq("user_id", user.id)
        .eq("status", "accepted");

      if (error) {
        console.error("Connections fetch error:", error);
        toast.error("Failed to load connections");
        setLoading(false);
        return;
      }

      const ids = (connData || []).map(c => c.connected_user_id);
      if (ids.length === 0) { setConnections([]); setLoading(false); return; }

      // Step 2: fetch those profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, title, department, location, avatar_url")
        .in("id", ids);

      const mapped = (profilesData || []).map(p => ({
        id: p.id,
        name: p.full_name || "Unknown User",
        title: p.title || p.department || "Student",
        college: p.department || "",
        avatar: p.avatar_url || FALLBACK_AVATAR,
        location: p.location || ""
      }));
      setConnections(mapped);
      setLoading(false);
    };
    fetchConnections();
  }, [user]);

  const handleDisconnect = async (peerId, name) => {
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("user_id", user.id)
      .eq("connected_user_id", peerId);
    await supabase
      .from("connections")
      .delete()
      .eq("user_id", peerId)
      .eq("connected_user_id", user.id);
    if (!error) {
      setConnections((prev) => prev.filter((c) => c.id !== peerId));
      toast.success(`Removed ${name} from connections`);
    } else {
      toast.error("Could not remove connection");
    }
  };

  const handleMessage = (name) =>
    toast.success(`Chat with ${name} coming soon!`);

  const filteredConnections = connections.filter(
    (conn) =>
      conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.college.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className="animate-fade-in"
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >
      <div style={{ textAlign: "left" }}>
        <h2
          style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}
        >
          My Network
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
          Manage your student connections and start chat interactions.
        </p>
      </div>

      {/* Tabs */}
      <div className="network-tabs">
        <button
          onClick={() => setActiveTab("connections")}
          className="network-tab"
          style={{
            color:
              activeTab === "connections"
                ? "var(--primary)"
                : "var(--text-secondary)",
            borderBottom:
              activeTab === "connections"
                ? "2px solid var(--primary)"
                : "2px solid transparent",
          }}
        >
          <Users size={16} />
          <span>Connections ({connections.length})</span>
        </button>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ padding: "16px" }}>
        <div style={{ position: "relative", width: "100%" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search connections by name, college, or role..."
            className="glass-input"
            style={{ width: "100%", paddingLeft: "48px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px",
            gap: "10px",
            color: "var(--text-secondary)",
          }}
        >
          <Loader size={20} className="animate-spin" />
          <span>Loading connections...</span>
        </div>
      ) : filteredConnections.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredConnections.map((conn) => (
            <div
              key={conn.id}
              className="glass-card"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                position: "relative",
              }}
            >
              <button
                onClick={() => handleDisconnect(conn.id, conn.name)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                }}
                className="btn-icon"
                title="Remove Connection"
                aria-label="Remove Connection"
              >
                <UserMinus size={14} style={{ color: "var(--danger)" }} />
              </button>
              <img
                src={conn.avatar}
                alt={conn.name}
                className="avatar avatar-ring"
                style={{ width: "80px", height: "80px", marginBottom: "16px" }}
              />
              <h3 style={{ fontSize: "18px", fontWeight: "700" }}>
                {conn.name}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--primary)",
                  fontWeight: "600",
                  marginTop: "2px",
                }}
              >
                {conn.title}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  marginTop: "4px",
                }}
              >
                {conn.college}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginTop: "2px",
                }}
              >
                {conn.location}
              </p>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={() => handleMessage(conn.name)}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    fontSize: "13px",
                    padding: "8px 12px",
                    gap: "6px",
                  }}
                >
                  <MessageSquare size={14} />
                  <span>Message</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="glass-card"
          style={{ padding: "40px", textAlign: "center" }}
        >
          <h3 style={{ fontSize: "18px", color: "var(--text-secondary)" }}>
            {connections.length === 0
              ? "No connections yet"
              : "No connections found"}
          </h3>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "14px",
              marginTop: "6px",
            }}
          >
            {connections.length === 0
              ? "Head to Discover to find and connect with peers."
              : "Try refining your search keyword."}
          </p>
        </div>
      )}
    </div>
  );
}

export default Connections;
