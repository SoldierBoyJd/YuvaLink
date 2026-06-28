import { useState } from "react";
import { Users, UserCheck, MessageSquare, Search, Sparkles, UserMinus } from "lucide-react";
import toast from "react-hot-toast";

const INITIAL_CONNECTIONS = [
  {
    id: 101,
    name: "Emma Watson",
    title: "Data Science Student",
    college: "Stanford University",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    location: "Stanford, CA"
  },
  {
    id: 102,
    name: "Liam Neeson",
    title: "Systems Engineer Undergrad",
    college: "MIT",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
    location: "Cambridge, MA"
  },
  {
    id: 103,
    name: "Sophia Martinez",
    title: "UI/UX Student",
    college: "Creative College",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    location: "San Francisco, CA"
  },
  {
    id: 104,
    name: "Priya Sharma",
    title: "Frontend Intern & React Builder",
    college: "Delhi College of Engineering",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    location: "New Delhi, IN"
  }
];

const INITIAL_INVITATIONS = [
  {
    id: 201,
    name: "Oliver Twist",
    title: "Backend Dev Aspirant",
    college: "London Tech",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    mutualCount: 3
  },
  {
    id: 202,
    name: "Charlotte Bronte",
    title: "Technical Writer & CS Minor",
    college: "Oxford College",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    mutualCount: 1
  }
];

function Connections() {
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS);
  const [invitations, setInvitations] = useState(INITIAL_INVITATIONS);
  const [activeTab, setActiveTab] = useState("connections"); // "connections" or "invitations"
  const [searchQuery, setSearchQuery] = useState("");

  const handleAccept = (invitation) => {
    // Remove from invitations
    setInvitations(prev => prev.filter(item => item.id !== invitation.id));
    // Add to connections list
    const newConnection = {
      id: invitation.id,
      name: invitation.name,
      title: invitation.title,
      college: invitation.college,
      avatar: invitation.avatar,
      location: "Remote"
    };
    setConnections(prev => [...prev, newConnection]);
    toast.success(`You are now connected with ${invitation.name}!`);
  };

  const handleDecline = (invitation) => {
    setInvitations(prev => prev.filter(item => item.id !== invitation.id));
    toast.error(`Declined invitation from ${invitation.name}`);
  };

  const handleDisconnect = (id, name) => {
    setConnections(prev => prev.filter(item => item.id !== id));
    toast.success(`Removed ${name} from your connections`);
  };

  const handleMessage = (name) => {
    toast.success(`Opening chat room with ${name}...`);
  };

  const filteredConnections = connections.filter(conn => 
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.college.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Info */}
      <div style={{ textAlign: "left" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>My Network</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
          Manage your student connections, view pending invites, and start chat interactions.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="network-tabs">
        <button 
          onClick={() => setActiveTab("connections")}
          className="network-tab"
          style={{
            color: activeTab === "connections" ? "var(--primary)" : "var(--text-secondary)",
            borderBottom: activeTab === "connections" ? "2px solid var(--primary)" : "2px solid transparent",
          }}
        >
          <Users size={16} />
          <span>Connections ({connections.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab("invitations")}
          className="network-tab"
          style={{
            color: activeTab === "invitations" ? "var(--primary)" : "var(--text-secondary)",
            borderBottom: activeTab === "invitations" ? "2px solid var(--primary)" : "2px solid transparent",
          }}
        >
          <Sparkles size={16} style={{ color: activeTab === "invitations" ? "var(--secondary)" : "inherit" }} />
          <span>Invitations ({invitations.length})</span>
        </button>
      </div>

      {/* Search Filter for Connections */}
      {activeTab === "connections" && (
        <div className="glass-card" style={{ padding: "16px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
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
      )}

      {/* Display Lists */}
      {activeTab === "connections" ? (
        filteredConnections.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px"
          }}>
            {filteredConnections.map(conn => (
              <div key={conn.id} className="glass-card" style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                position: "relative"
              }}>
                {/* Remove connection button */}
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
                    borderRadius: "8px"
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

                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{conn.name}</h3>
                <p style={{ fontSize: "13px", color: "var(--primary)", fontWeight: "600", marginTop: "2px" }}>{conn.title}</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{conn.college}</p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{conn.location}</p>

                {/* Actions */}
                <div style={{ display: "flex", width: "100%", gap: "10px", marginTop: "20px" }}>
                  <button 
                    onClick={() => handleMessage(conn.name)}
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: "13px", padding: "8px 12px", gap: "6px" }}
                  >
                    <MessageSquare size={14} />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
            <h3 style={{ fontSize: "18px", color: "var(--text-secondary)" }}>No connections found</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "6px" }}>
              {searchQuery ? "Try refining your search keyword." : "Head over to Discover to find peer connections."}
            </p>
          </div>
        )
      ) : (
        invitations.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px"
          }}>
            {invitations.map(invite => (
              <div key={invite.id} className="glass-card" style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center"
              }}>
                <img 
                  src={invite.avatar} 
                  alt={invite.name} 
                  className="avatar" 
                  style={{ width: "80px", height: "80px", marginBottom: "16px", border: "2px solid var(--secondary)" }}
                />

                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{invite.name}</h3>
                <p style={{ fontSize: "13px", color: "var(--secondary)", fontWeight: "600", marginTop: "2px" }}>{invite.title}</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{invite.college}</p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Sparkles size={12} style={{ color: "var(--secondary)" }} />
                  <span>{invite.mutualCount} mutual connections</span>
                </p>

                {/* Accept / Decline actions */}
                <div style={{ display: "flex", width: "100%", gap: "10px", marginTop: "20px" }}>
                  <button 
                    onClick={() => handleAccept(invite)}
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: "13px", padding: "8px 12px", gap: "4px" }}
                  >
                    <UserCheck size={14} />
                    <span>Accept</span>
                  </button>
                  <button 
                    onClick={() => handleDecline(invite)}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: "13px", padding: "8px 12px", gap: "4px" }}
                  >
                    <span style={{ color: "var(--danger)" }}>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
            <h3 style={{ fontSize: "18px", color: "var(--text-secondary)" }}>All caught up!</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "6px" }}>You have no pending connection requests at the moment.</p>
          </div>
        )
      )}
    </div>
  );
}

export default Connections;