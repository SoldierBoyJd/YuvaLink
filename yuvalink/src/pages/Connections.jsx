import { useState, useEffect } from "react";
import {
  Users, UserCheck, MessageSquare, Search, Sparkles, UserMinus, Loader, Bell
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face";

function Connections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("connections");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchConnections = async () => {
      setLoading(true);

      // Accepted connections (my side)
      const { data: connData, error } = await supabase
        .from("connections")
        .select("connected_user_id")
        .eq("user_id", user.id)
        .eq("status", "accepted");

      if (error) {
        console.error("Connections fetch error:", error);
        // Don't block the whole page — still try to load invitations
      }

      const ids = (connData || []).map(c => c.connected_user_id);
      if (ids.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles").select("id, full_name, title, department, location, avatar_url").in("id", ids);
        setConnections((profilesData || []).map(p => ({
          id: p.id, name: p.full_name || "Unknown", title: p.title || p.department || "Student",
          college: p.department || "", avatar: p.avatar_url || FALLBACK_AVATAR, location: p.location || ""
        })));
      } else {
        setConnections([]);
      }

      // Pending invitations sent TO me (other user sent request, I haven't accepted yet)
      const { data: pendingData, error: pendingErr } = await supabase
        .from("connections")
        .select("user_id")
        .eq("connected_user_id", user.id)
        .eq("status", "pending");

      if (pendingErr) console.error("Pending fetch error:", pendingErr);

      if (pendingData && pendingData.length > 0) {
        const senderIds = pendingData.map(c => c.user_id);
        const { data: senderProfiles } = await supabase
          .from("profiles").select("id, full_name, title, department, avatar_url").in("id", senderIds);
        setInvitations((senderProfiles || []).map(p => ({
          id: p.id, name: p.full_name || "Unknown", title: p.title || p.department || "Student",
          college: p.department || "", avatar: p.avatar_url || FALLBACK_AVATAR
        })));
      } else {
        setInvitations([]);
      }

      setLoading(false);
    };

    fetchConnections();

    // Re-fetch whenever the window regains focus (user switches tabs/windows)
    const onFocus = () => fetchConnections();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user]);

  const handleDisconnect = async (peerId, name) => {
    const { error } = await supabase.rpc("disconnect_users", {
      p_user_id: user.id,
      p_peer_id: peerId,
    });
    if (!error) {
      setConnections((prev) => prev.filter((c) => c.id !== peerId));
      toast.success(`Removed ${name} from connections`);
    } else {
      toast.error("Could not remove connection");
    }
  };

  const handleAccept = async (inviter) => {
    const { error } = await supabase.rpc("accept_connection", {
      p_user_id: user.id,
      p_requester_id: inviter.id,
    });
    if (!error) {
      setInvitations(prev => prev.filter(i => i.id !== inviter.id));
      setConnections(prev => [...prev, { ...inviter, location: "" }]);
      toast.success(`You're now connected with ${inviter.name}!`);
    } else {
      toast.error("Could not accept: " + error.message);
    }
  };

  const handleDecline = async (inviter) => {
    await supabase.rpc("disconnect_users", { p_user_id: user.id, p_peer_id: inviter.id });
    setInvitations(prev => prev.filter(i => i.id !== inviter.id));
    toast.success(`Declined request from ${inviter.name}`);
  };

  const handleMessage = (name) => toast.success(`Chat with ${name} coming soon!`);

  const filteredConnections = connections.filter(conn =>
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.college.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ textAlign: "left" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>My Network</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Manage your student connections and start chat interactions.</p>
      </div>

      {/* Tabs */}
      <div className="network-tabs">
        <button onClick={() => setActiveTab("connections")} className="network-tab"
          style={{ color: activeTab === "connections" ? "var(--primary)" : "var(--text-secondary)", borderBottom: activeTab === "connections" ? "2px solid var(--primary)" : "2px solid transparent" }}>
          <Users size={16} /><span>Connections ({connections.length})</span>
        </button>
        <button onClick={() => setActiveTab("invitations")} className="network-tab"
          style={{ color: activeTab === "invitations" ? "var(--primary)" : "var(--text-secondary)", borderBottom: activeTab === "invitations" ? "2px solid var(--primary)" : "2px solid transparent" }}>
          <Bell size={16} />
          <span>Invitations</span>
          {invitations.length > 0 && (
            <span style={{ background: "var(--danger)", color: "#fff", borderRadius: "999px", padding: "1px 6px", fontSize: "10px", fontWeight: "700", marginLeft: "4px" }}>
              {invitations.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", gap: "10px", color: "var(--text-secondary)" }}>
          <Loader size={20} className="animate-spin" /><span>Loading...</span>
        </div>
      ) : activeTab === "connections" ? (
        <>
          <div className="glass-card" style={{ padding: "16px" }}>
            <div style={{ position: "relative", width: "100%" }}>
              <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input type="text" placeholder="Search connections..." className="glass-input" style={{ width: "100%", paddingLeft: "48px" }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          {filteredConnections.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
              {filteredConnections.map(conn => (
                <div key={conn.id} className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative" }}>
                  <button onClick={() => handleDisconnect(conn.id, conn.name)} className="btn-icon" style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }} title="Remove">
                    <UserMinus size={14} style={{ color: "var(--danger)" }} />
                  </button>
                  <img src={conn.avatar} alt={conn.name} className="avatar avatar-ring" style={{ width: "80px", height: "80px", marginBottom: "16px" }} />
                  <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{conn.name}</h3>
                  <p style={{ fontSize: "13px", color: "var(--primary)", fontWeight: "600", marginTop: "2px" }}>{conn.title}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{conn.college}</p>
                  <div style={{ display: "flex", width: "100%", gap: "10px", marginTop: "20px" }}>
                    <button onClick={() => handleMessage(conn.name)} className="btn btn-primary" style={{ flex: 1, fontSize: "13px", padding: "8px 12px", gap: "6px" }}>
                      <MessageSquare size={14} /><span>Message</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
              <h3 style={{ fontSize: "18px", color: "var(--text-secondary)" }}>{connections.length === 0 ? "No connections yet" : "No connections found"}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "6px" }}>{connections.length === 0 ? "Head to Discover to find and connect with peers." : "Try a different search."}</p>
            </div>
          )}
        </>
      ) : (
        invitations.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
            {invitations.map(invite => (
              <div key={invite.id} className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <img src={invite.avatar} alt={invite.name} style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", marginBottom: "16px", border: "2px solid var(--secondary)" }} />
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{invite.name}</h3>
                <p style={{ fontSize: "13px", color: "var(--secondary)", fontWeight: "600", marginTop: "2px" }}>{invite.title}</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{invite.college}</p>
                <div style={{ display: "flex", width: "100%", gap: "10px", marginTop: "20px" }}>
                  <button onClick={() => handleAccept(invite)} className="btn btn-primary" style={{ flex: 1, fontSize: "13px", padding: "8px 12px", gap: "4px" }}>
                    <UserCheck size={14} /><span>Accept</span>
                  </button>
                  <button onClick={() => handleDecline(invite)} className="btn btn-secondary" style={{ flex: 1, fontSize: "13px", padding: "8px 12px" }}>
                    <span style={{ color: "var(--danger)" }}>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
            <h3 style={{ fontSize: "18px", color: "var(--text-secondary)" }}>No pending invitations</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "6px" }}>You're all caught up!</p>
          </div>
        )
      )}
    </div>
  );
}

export default Connections;
