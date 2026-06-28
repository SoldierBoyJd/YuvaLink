import { useState } from "react";
import { Search, MapPin, BookOpen, UserPlus, Check, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

const PEER_DATABASE = [
  {
    id: 1,
    name: "Zara Chen",
    title: "UI/UX Student & Graphic Enthusiast",
    college: "Design Institute of Tech",
    location: "San Francisco, CA",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=120&fit=crop",
    skills: ["Figma", "UI/UX", "Adobe XD", "Design Systems"],
    connected: false
  },
  {
    id: 2,
    name: "Marcus Johnson",
    title: "Machine Learning & Python Engineer",
    college: "ScienceTech University",
    location: "Boston, MA",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
    cover: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=120&fit=crop",
    skills: ["Python", "TensorFlow", "Pandas", "Scikit-Learn"],
    connected: false
  },
  {
    id: 3,
    name: "Priya Sharma",
    title: "Frontend Intern & React Builder",
    college: "Delhi College of Engineering",
    location: "New Delhi, IN",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
    cover: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&h=120&fit=crop",
    skills: ["React", "JavaScript", "CSS Grid", "Tailwind CSS"],
    connected: false
  },
  {
    id: 4,
    name: "Kofi Mensah",
    title: "Flutter & Mobile Developer",
    college: "Accra Tech Academy",
    location: "Accra, GH",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
    cover: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&h=120&fit=crop",
    skills: ["Flutter", "Dart", "Firebase", "State Management"],
    connected: false
  },
  {
    id: 5,
    name: "Elena Rostova",
    title: "Node.js & Backend Enthusiast",
    college: "Moscow State Engineering",
    location: "Moscow, RU",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop",
    cover: "https://images.unsplash.com/photo-1618005198143-d5a8bd57fbe?w=400&h=120&fit=crop",
    skills: ["NodeJS", "Express", "MongoDB", "Docker"],
    connected: false
  },
  {
    id: 6,
    name: "Hiroshi Tanaka",
    title: "Cybersecurity Undergrad",
    college: "Tokyo Institute of Tech",
    location: "Tokyo, JP",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop",
    cover: "https://images.unsplash.com/photo-1579783922612-42da0f5a770a?w=400&h=120&fit=crop",
    skills: ["Linux", "Penetration Testing", "Wireshark", "Python"],
    connected: false
  }
];

function Discover() {
  const [peers, setPeers] = useState(PEER_DATABASE);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");

  const handleConnect = (id, name) => {
    setPeers(prev => prev.map(p => {
      if (p.id === id) {
        if (!p.connected) {
          toast.success(`Connection request sent to ${name}!`);
        } else {
          toast.success(`Cancelled request to ${name}`);
        }
        return { ...p, connected: !p.connected };
      }
      return p;
    }));
  };

  const handleSendDM = (name) => {
    toast.success(`Opened mockup chat drawer with ${name}!`);
  };

  // Filter peers based on Search and Selected Skill
  const filteredPeers = peers.filter(peer => {
    const matchesSearch = peer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          peer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          peer.college.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSkill = selectedSkill === "All" || peer.skills.includes(selectedSkill);
    
    return matchesSearch && matchesSkill;
  });

  // Get list of all skills for the filter pills
  const allSkills = ["All", ...new Set(peers.flatMap(p => p.skills))];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header Info */}
      <div style={{ textAlign: "left" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>Discover Peers</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
          Find, filter, and connect with talented students and collaborators in your fields of study.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* Search */}
        <div style={{ position: "relative", width: "100%" }}>
          <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text" 
            placeholder="Search by name, university role, or bio..." 
            className="glass-input" 
            style={{ width: "100%", paddingLeft: "48px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Skill Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", borderTop: "1px solid var(--card-border)", paddingTop: "14px" }}>
          {allSkills.map(skill => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className="badge"
              style={{
                cursor: "pointer",
                border: "1px solid var(--card-border)",
                background: selectedSkill === skill ? "var(--primary-gradient)" : "var(--bg-tertiary)",
                color: selectedSkill === skill ? "#fff" : "var(--text-secondary)",
                padding: "6px 14px",
                transition: "all var(--transition-fast)"
              }}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Peers Grid */}
      {filteredPeers.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "24px"
        }}>
          {filteredPeers.map(peer => (
            <div key={peer.id} className="glass-card" style={{
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              position: "relative"
            }}>
              
              {/* Card Cover */}
              <div style={{ height: "90px", position: "relative" }}>
                <img 
                  src={peer.cover} 
                  alt="cover" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
                <div style={{
                  position: "absolute",
                  top: "0", left: "0", right: "0", bottom: "0",
                  background: "linear-gradient(to bottom, rgba(0,0,0,0) 20%, var(--bg-secondary) 100%)"
                }}></div>
              </div>

              {/* Card Profile Info */}
              <div style={{ padding: "0 20px 20px", marginTop: "-36px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                
                <img 
                  src={peer.avatar} 
                  alt={peer.name} 
                  className="avatar avatar-ring" 
                  style={{ width: "72px", height: "72px", marginBottom: "12px", zIndex: 1 }}
                />
                
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{peer.name}</h3>
                <p style={{ fontSize: "13px", color: "var(--primary)", fontWeight: "600", marginTop: "2px" }}>{peer.title}</p>
                
                {/* School */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px" }}>
                  <BookOpen size={12} style={{ color: "var(--text-muted)" }} />
                  <span>{peer.college}</span>
                </div>

                {/* Location */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  <MapPin size={12} />
                  <span>{peer.location}</span>
                </div>

                {/* Skills tags */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px", margin: "16px 0", width: "100%" }}>
                  {peer.skills.map(s => (
                    <span key={s} className="badge badge-primary" style={{ fontSize: "10px", padding: "4px 8px" }}>
                      {s}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", width: "100%", gap: "10px", marginTop: "auto" }}>
                  <button 
                    onClick={() => handleConnect(peer.id, peer.name)}
                    className="btn"
                    style={{
                      flex: 1,
                      fontSize: "13px",
                      padding: "8px 12px",
                      background: peer.connected ? "var(--bg-tertiary)" : "var(--primary-gradient)",
                      color: peer.connected ? "var(--text-primary)" : "#fff",
                      border: peer.connected ? "1px solid var(--card-border)" : "none"
                    }}
                  >
                    {peer.connected ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                        <Check size={14} /> Connected
                      </span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                        <UserPlus size={14} /> Connect
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => handleSendDM(peer.name)}
                    className="btn btn-secondary" 
                    style={{ padding: "8px 12px" }}
                    aria-label="Message peer"
                  >
                    <MessageSquare size={14} />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
          <h3 style={{ fontSize: "18px", color: "var(--text-secondary)" }}>No peers found matching "{searchQuery}" or "{selectedSkill}"</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "6px" }}>Try searching with different keywords or clearing filters.</p>
        </div>
      )}
    </div>
  );
}

export default Discover;