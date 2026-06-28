import { useState, useEffect } from "react";
import { Search, MapPin, BookOpen, UserPlus, Check, MessageSquare, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face";
const FALLBACK_COVER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=120&fit=crop";

function Discover() {
  const { user } = useAuth();
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [connectingIds, setConnectingIds] = useState(new Set());

  useEffect(() => {
    const fetchPeers = async () => {
      setLoading(true);
      // Fetch all profiles except current user
      const query = supabase
        .from("profiles")
        .select("id, full_name, title, department, location, avatar_url, cover_url, skills, bio");

      if (user) query.neq("id", user.id);

      const { data, error } = await query;
      if (error) {
        toast.error("Failed to load peers");
        console.error(error);
      } else {
        // Check which ones the user is already connected to
        let connectedSet = new Set();
        if (user) {
          const { data: conns } = await supabase
            .from("connections")
            .select("connected_user_id")
            .eq("user_id", user.id)
            .eq("status", "accepted");
          if (conns) conns.forEach(c => connectedSet.add(c.connected_user_id));
        }
        setPeers((data || []).map(p => ({ ...p, connected: connectedSet.has(p.id) })));
      }
      setLoading(false);
    };
    fetchPeers();
  }, [user]);

  const handleConnect = async (peerId, peerName) => {
    if (!user) return;
    setConnectingIds(prev => new Set(prev).add(peerId));
    const peer = peers.find(p => p.id === peerId);

    if (peer?.connected) {
      // Remove connection
      await supabase.from("connections").delete()
        .eq("user_id", user.id).eq("connected_user_id", peerId);
      await supabase.from("connections").delete()
        .eq("user_id", peerId).eq("connected_user_id", user.id);
      setPeers(prev => prev.map(p => p.id === peerId ? { ...p, connected: false } : p));
      toast.success(`Removed connection with ${peerName}`);
    } else {
      // Send connection request (insert both sides as accepted for simplicity)
      const { error } = await supabase.from("connections").upsert([
        { user_id: user.id, connected_user_id: peerId, status: "accepted" },
        { user_id: peerId, connected_user_id: user.id, status: "accepted" }
      ]);
      if (error) { toast.error("Could not connect: " + error.message); }
      else {
        setPeers(prev => prev.map(p => p.id === peerId ? { ...p, connected: true } : p));
        toast.success(`Connected with ${peerName}!`);
      }
    }
    setConnectingIds(prev => { const s = new Set(prev); s.delete(peerId); return s; });
  };

  const handleSendDM = (name) => toast.success(`Chat with ${name} coming soon!`);

  const filteredPeers = peers.filter(peer => {
    const name = peer.full_name || "";
    const title = peer.title || peer.department || "";
    const college = peer.department || "";
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          college.toLowerCase().includes(searchQuery.toLowerCase());
    const peerSkills = peer.skills || [];
    const matchesSkill = selectedSkill === "All" || peerSkills.includes(selectedSkill);
    return matchesSearch && matchesSkill;
  });

  const allSkills = ["All", ...new Set(peers.flatMap(p => p.skills || []))];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ textAlign: "left" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>Discover Peers</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
          Find, filter, and connect with talented students and collaborators in your fields of study.
        </p>
      </div>

      <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ position: "relative", width: "100%" }}>
          <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input type="text" placeholder="Search by name, university, or role..." className="glass-input" style={{ width: "100%", paddingLeft: "48px" }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", borderTop: "1px solid var(--card-border)", paddingTop: "14px" }}>
          {allSkills.map(skill => (
            <button key={skill} onClick={() => setSelectedSkill(skill)} className="badge" style={{ cursor: "pointer", border: "1px solid var(--card-border)", background: selectedSkill === skill ? "var(--primary-gradient)" : "var(--bg-tertiary)", color: selectedSkill === skill ? "#fff" : "var(--text-secondary)", padding: "6px 14px", transition: "all var(--transition-fast)" }}>
              {skill}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", gap: "10px", color: "var(--text-secondary)" }}>
          <Loader size={20} className="animate-spin" /><span>Loading peers...</span>
        </div>
      ) : filteredPeers.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
          {filteredPeers.map(peer => (
            <div key={peer.id} className="glass-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
              <div style={{ height: "90px", position: "relative" }}>
                <img src={peer.cover_url || FALLBACK_COVER} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 20%, var(--bg-secondary) 100%)" }}></div>
              </div>
              <div style={{ padding: "0 20px 20px", marginTop: "-36px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <img src={peer.avatar_url || FALLBACK_AVATAR} alt={peer.full_name} className="avatar avatar-ring" style={{ width: "72px", height: "72px", marginBottom: "12px", zIndex: 1 }} />
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{peer.full_name || "Unknown User"}</h3>
                <p style={{ fontSize: "13px", color: "var(--primary)", fontWeight: "600", marginTop: "2px" }}>{peer.title || peer.department || "Student"}</p>
                {peer.department && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px" }}>
                    <BookOpen size={12} style={{ color: "var(--text-muted)" }} /><span>{peer.department}</span>
                  </div>
                )}
                {peer.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    <MapPin size={12} /><span>{peer.location}</span>
                  </div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px", margin: "16px 0", width: "100%" }}>
                  {(peer.skills || []).slice(0, 4).map(s => (
                    <span key={s} className="badge badge-primary" style={{ fontSize: "10px", padding: "4px 8px" }}>{s}</span>
                  ))}
                </div>
                <div style={{ display: "flex", width: "100%", gap: "10px", marginTop: "auto" }}>
                  <button
                    onClick={() => handleConnect(peer.id, peer.full_name)}
                    disabled={connectingIds.has(peer.id)}
                    className="btn"
                    style={{ flex: 1, fontSize: "13px", padding: "8px 12px", background: peer.connected ? "var(--bg-tertiary)" : "var(--primary-gradient)", color: peer.connected ? "var(--text-primary)" : "#fff", border: peer.connected ? "1px solid var(--card-border)" : "none" }}
                  >
                    {peer.connected
                      ? <span style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}><Check size={14} /> Connected</span>
                      : <span style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}><UserPlus size={14} /> Connect</span>
                    }
                  </button>
                  <button onClick={() => handleSendDM(peer.full_name)} className="btn btn-secondary" style={{ padding: "8px 12px" }} aria-label="Message"><MessageSquare size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
          <h3 style={{ fontSize: "18px", color: "var(--text-secondary)" }}>
            {peers.length === 0 ? "No other users yet." : `No peers found for "${searchQuery || selectedSkill}"`}
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "6px" }}>
            {peers.length === 0 ? "Invite friends to join YuvaLink!" : "Try different search terms or clear filters."}
          </p>
        </div>
      )}
    </div>
  );
}

export default Discover;
