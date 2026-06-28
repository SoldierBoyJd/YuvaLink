import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Compass, 
  Users, 
  Briefcase, 
  ArrowRight, 
  ArrowUpRight, 
  Trophy, 
  Search, 
  MessageSquare, 
  MapPin, 
  Code, 
  Cpu, 
  Star, 
  Award, 
  Activity, 
  ChevronRight,
  Globe
} from "lucide-react";
import toast from "react-hot-toast";

const UNIVERSITY_PARTNERS = [
  "MIT Tech Club", "Stanford Founders", "IIT Hackers", "Berkeley AI", "CMU Builders", "Harvard CS"
];

const STATS_DATA = [
  { value: "10K+", label: "Active Students", desc: "Top campus creators & builders", color: "var(--primary)" },
  { value: "2.5K+", label: "Projects Created", desc: "Startups, SaaS, and ML engines", color: "#818cf8" },
  { value: "1.2K+", label: "Hackathons Joined", desc: "Global hacker houses represented", color: "#14b8a6" },
  { value: "800+", label: "Opportunities Posted", desc: "Startup slots, jobs, mentorship", color: "#f59e0b" }
];

const FEATURED_STUDENTS = [
  {
    id: 1,
    name: "Zara Chen",
    title: "UI/UX Student & Product Designer",
    college: "Design Institute of Tech",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    skills: ["Figma", "UI/UX", "Design Systems", "Prototyping"],
    project: "Designing YuvaLink's design system & premium assets",
    connected: false
  },
  {
    id: 2,
    name: "Marcus Johnson",
    title: "Machine Learning & Python Engineer",
    college: "ScienceTech University",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    skills: ["Python", "PyTorch", "TensorFlow", "Scikit-Learn"],
    project: "Building multi-agent LLM systems for project matchmaking",
    connected: false
  },
  {
    id: 3,
    name: "Priya Sharma",
    title: "Frontend Intern & React Developer",
    college: "Delhi College of Engineering",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    project: "Optimizing dashboard loading speeds and real-time sockets",
    connected: false
  }
];

const FEATURED_OPPORTUNITIES = [
  {
    id: 1,
    title: "Aura - Collaborative AI Drawing Board",
    type: "Startup Idea",
    badgeColor: "rgba(139, 92, 246, 0.15)",
    badgeText: "#8b5cf6",
    teamSize: "2/4 members",
    skills: ["Next.js", "WebSockets", "Framer Motion", "PyTorch"],
    desc: "Building a shared, canvas-based tool that uses real-time generative diffusions to complete designs on the fly.",
    author: "Zara Chen",
    applied: false
  },
  {
    id: 2,
    title: "HackMIT 2026 - Fintech Core Protocol",
    type: "Hackathon Team",
    badgeColor: "rgba(99, 102, 241, 0.15)",
    badgeText: "#6366f1",
    teamSize: "1/3 members",
    skills: ["Go", "Solidity", "React", "Rust"],
    desc: "Creating a high-performance decentralized ledger project for the HackMIT fintech track. Target: 1st prize.",
    author: "Alex Rivera",
    applied: false
  },
  {
    id: 3,
    title: "Mentorship Circle: YC W26 Prep",
    type: "Mentorship",
    badgeColor: "rgba(20, 184, 166, 0.15)",
    badgeText: "#14b8a6",
    teamSize: "Unlimited slots",
    skills: ["Pitch Deck", "Product Market Fit", "SaaS Economics"],
    desc: "A group of senior students and alumni who went through YC mentoring early-stage student builders to prep decks.",
    author: "Marcus Johnson",
    applied: false
  }
];

function Landing() {
  const [selectedMockSkill, setSelectedMockSkill] = useState("React");
  const [students, setStudents] = useState(FEATURED_STUDENTS);
  const [opportunities, setOpportunities] = useState(FEATURED_OPPORTUNITIES);
  const [demoMatchScore, setDemoMatchScore] = useState(94);
  const [connectedMock, setConnectedMock] = useState(false);

  const handleMockSkillClick = (skill) => {
    setSelectedMockSkill(skill);
    if (skill === "React") {
      setDemoMatchScore(94);
    } else if (skill === "PyTorch") {
      setDemoMatchScore(98);
    } else {
      setDemoMatchScore(87);
    }
    toast.success(`Mockup filtered: Swapped builder stack to ${skill}`);
  };

  const handleConnectClick = (id, name) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        if (!s.connected) {
          toast.success(`Connection request sent to ${name}!`);
        } else {
          toast.success(`Cancelled request to ${name}`);
        }
        return { ...s, connected: !s.connected };
      }
      return s;
    }));
  };

  const handleApplyClick = (id, title) => {
    setOpportunities(prev => prev.map(o => {
      if (o.id === id) {
        if (!o.applied) {
          toast.success(`Applied to join team for "${title}"!`);
        } else {
          toast.success(`Application withdrawn for "${title}"`);
        }
        return { ...o, applied: !o.applied };
      }
      return o;
    }));
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "var(--bg-primary)",
      color: "var(--text-primary)",
      overflowX: "hidden" 
    }} className="grid-background">
      
      {/* Decorative Space Blur Orbs */}
      <div className="glow-orb pulse-glow-slow" style={{
        top: "5%",
        left: "-5%",
        width: "45vw",
        height: "45vw",
        background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
      }}></div>
      <div className="glow-orb pulse-glow-slow" style={{
        top: "35%",
        right: "-10%",
        width: "40vw",
        height: "40vw",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(0, 0, 0, 0) 70%)",
        animationDelay: "-5s"
      }}></div>
      <div className="glow-orb pulse-glow-slow" style={{
        top: "70%",
        left: "15%",
        width: "50vw",
        height: "50vw",
        background: "radial-gradient(circle, rgba(20, 184, 166, 0.08) 0%, rgba(0, 0, 0, 0) 70%)",
        animationDelay: "-10s"
      }}></div>

      {/* 1. HERO SECTION (Split screen layout) */}
      <section className="landing-section" style={{ 
        position: "relative",
        zIndex: 2,
        maxWidth: "1280px",
        margin: "0 auto",
      }}>
        <div className="hero-grid" style={{
          minHeight: "calc(80vh - 100px)"
        }}>
          {/* Hero Content Left */}
          <div className="animate-fade-in" style={{ textAlign: "left" }}>
            {/* SaaS Style Announcement Badge */}
            <div className="badge badge-primary" style={{ 
              gap: "8px", 
              padding: "6px 14px", 
              marginBottom: "24px", 
              border: "1px solid rgba(139, 92, 246, 0.25)",
              background: "rgba(139, 92, 246, 0.08)",
              cursor: "pointer"
            }} onClick={() => toast("Welcome to the next generation of student building!")}>
              <Sparkles size={13} style={{ color: "var(--primary)" }} />
              <span style={{ fontSize: "12.5px", fontWeight: "600", letterSpacing: "0.02em" }}>
                Introducing the Student Skill Network
              </span>
              <ChevronRight size={13} style={{ opacity: 0.6 }} />
            </div>

            <h1 style={{ 
              fontSize: "clamp(38px, 4.5vw, 64px)", 
              fontWeight: "800", 
              lineHeight: "1.08", 
              letterSpacing: "-0.04em",
              marginBottom: "20px",
              color: "#ffffff"
            }}>
              Find Teammates.<br />
              Build Projects.<br />
              <span className="gradient-text-brand" style={{ display: "inline-block" }}>
                Grow Together.
              </span>
            </h1>

            <p style={{ 
              fontSize: "clamp(16px, 2vw, 18px)", 
              color: "var(--text-secondary)", 
              maxWidth: "520px", 
              marginBottom: "36px",
              lineHeight: "1.6"
            }}>
              YuvaLink connects ambitious student builders to discover hackathon co-pilots, join early-stage startup ideas, and showcase real builds. No vanity titles, just practical skills.
            </p>

            <div style={{ 
              display: "flex", 
              flexWrap: "wrap", 
              gap: "16px",
              marginBottom: "36px"
            }}>
              <Link to="/register" className="btn btn-primary shine-button" style={{ 
                padding: "14px 28px", 
                fontSize: "16px",
                borderRadius: "12px",
                boxShadow: "0 0 25px rgba(139, 92, 246, 0.25)"
              }}>
                <span>Start Building Now</span>
                <ArrowRight size={16} />
              </Link>
              <a href="#features" className="btn btn-secondary" style={{ 
                padding: "14px 28px", 
                fontSize: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.06)"
              }}>
                <span>Explore Features</span>
              </a>
            </div>

            {/* Live Indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-secondary)", fontSize: "14px" }}>
              <span style={{ position: "relative", display: "flex", height: "8px", width: "8px" }}>
                <span className="animate-float" style={{ 
                  position: "absolute", 
                  display: "inline-flex", 
                  height: "100%", 
                  width: "100%", 
                  borderRadius: "50%", 
                  backgroundColor: "var(--success)", 
                  opacity: 0.75,
                  transform: "scale(1.8)"
                }}></span>
                <span style={{ position: "relative", display: "inline-flex", borderRadius: "50%", height: "8px", width: "8px", backgroundColor: "var(--success)" }}></span>
              </span>
              <span>⚡ Join <strong>10,240+</strong> students building right now</span>
            </div>
          </div>

          {/* Hero Visual Dashboard Mockup Right */}
          <div style={{ position: "relative", zIndex: 3 }} className="animate-fade-in">
            {/* Subtle Gradient Glow Behind Dashboard */}
            <div style={{
              position: "absolute",
              top: "-15px",
              left: "5%",
              width: "90%",
              height: "105%",
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)",
              filter: "blur(60px)",
              borderRadius: "24px",
              zIndex: -1
            }}></div>

            {/* Main Mockup Window Container */}
            <div className="glass-card-premium" style={{
              borderRadius: "16px",
              padding: "18px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              background: "rgba(8, 10, 22, 0.75)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)",
              textAlign: "left"
            }}>
              {/* Header Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: "12px", marginBottom: "14px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }}></div>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#eab308" }}></div>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }}></div>
                </div>
                <div style={{ background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px", padding: "4px 12px", fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Search size={10} />
                  <span>Search peer directories...</span>
                </div>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700" }}>AR</div>
              </div>

              {/* Layout Split */}
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "16px" }}>
                {/* Micro Sidebar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderRight: "1px solid rgba(255, 255, 255, 0.06)", pr: "8px" }}>
                  <div style={{ padding: "6px", borderRadius: "6px", background: "rgba(139, 92, 246, 0.15)", color: "var(--primary)", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "600" }}>
                    <Compass size={12} />
                    <span>Feed</span>
                  </div>
                  <div style={{ padding: "6px", borderRadius: "6px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                    <Users size={12} />
                    <span>Peers</span>
                  </div>
                  <div style={{ padding: "6px", borderRadius: "6px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                    <Briefcase size={12} />
                    <span>Jobs</span>
                  </div>
                </div>

                {/* Dashboard Main Widget */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700" }}>🎯 Smart Matchmaking</span>
                      <span className="badge badge-primary" style={{ fontSize: "10px", padding: "2px 6px" }}>{demoMatchScore}% Match</span>
                    </div>

                    <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "10px", lineHeight: "1.4" }}>
                      Alex R. seeking teammate with expertise in:
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                      <button 
                        onClick={() => handleMockSkillClick("React")}
                        style={{ 
                          padding: "4px 8px", 
                          fontSize: "11px", 
                          borderRadius: "6px", 
                          border: "none",
                          background: selectedMockSkill === "React" ? "var(--primary-gradient)" : "rgba(255,255,255,0.05)",
                          color: "#fff",
                          cursor: "pointer"
                        }}
                      >React</button>
                      <button 
                        onClick={() => handleMockSkillClick("PyTorch")}
                        style={{ 
                          padding: "4px 8px", 
                          fontSize: "11px", 
                          borderRadius: "6px", 
                          border: "none",
                          background: selectedMockSkill === "PyTorch" ? "var(--primary-gradient)" : "rgba(255,255,255,0.05)",
                          color: "#fff",
                          cursor: "pointer"
                        }}
                      >PyTorch</button>
                      <button 
                        onClick={() => handleMockSkillClick("Figma")}
                        style={{ 
                          padding: "4px 8px", 
                          fontSize: "11px", 
                          borderRadius: "6px", 
                          border: "none",
                          background: selectedMockSkill === "Figma" ? "var(--primary-gradient)" : "rgba(255,255,255,0.05)",
                          color: "#fff",
                          cursor: "pointer"
                        }}
                      >Figma</button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Target: Generative Canvas App</span>
                      <button 
                        onClick={() => {
                          setConnectedMock(!connectedMock);
                          toast.success(connectedMock ? "Withdrew join request!" : "Request to join project sent!");
                        }}
                        style={{ 
                          padding: "5px 12px", 
                          fontSize: "11px", 
                          fontWeight: "600",
                          borderRadius: "6px", 
                          border: "none",
                          background: connectedMock ? "rgba(255,255,255,0.1)" : "var(--primary)",
                          color: "#fff",
                          cursor: "pointer"
                        }}
                      >
                        {connectedMock ? "Request Sent" : "Form Team"}
                      </button>
                    </div>
                  </div>

                  {/* Active activity logs */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "10px", color: "var(--text-secondary)" }}>
                    <Activity size={10} style={{ color: "var(--success)" }} />
                    <span>Marcus Johnson accepted invitation for HackMIT hackathon</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Orbiting Floating Student Card */}
            <div className="glass-card-premium animate-float-slow hide-on-mobile" style={{
              position: "absolute",
              bottom: "-25px",
              left: "-30px",
              width: "230px",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              background: "rgba(10, 13, 30, 0.9)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop" 
                  alt="Student Profile" 
                  style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                />
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "700" }}>Zara Chen</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>UI/UX • Stanford University</div>
                </div>
              </div>
              <p style={{ fontSize: "10px", color: "var(--text-secondary)", marginBottom: "8px", lineHeight: "1.3" }}>
                Looking for React developer to form a team for AI mockup launch.
              </p>
              <div style={{ display: "flex", gap: "4px" }}>
                <span style={{ fontSize: "9px", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px", color: "var(--text-secondary)" }}>Figma</span>
                <span style={{ fontSize: "9px", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px", color: "var(--text-secondary)" }}>Design Systems</span>
              </div>
            </div>

            {/* Orbiting Floating Project Card */}
            <div className="glass-card-premium animate-float-medium hide-on-mobile" style={{
              position: "absolute",
              top: "-25px",
              right: "-20px",
              width: "230px",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              background: "rgba(10, 13, 30, 0.9)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span className="badge badge-secondary" style={{ fontSize: "9px", padding: "1px 6px" }}>Hackathon Team</span>
                <span style={{ fontSize: "10px", color: "var(--success)", fontWeight: "600" }}>GSoC 2026</span>
              </div>
              <div style={{ fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>Core Rust Protocol</div>
              <p style={{ fontSize: "10px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Needs backend contributor. Form team to co-author codebase.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ display: "flex", marginLeft: "4px" }}>
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=40&h=40&fit=crop" style={{ width: "16px", height: "16px", borderRadius: "50%", objectFit: "cover" }} />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" style={{ width: "16px", height: "16px", borderRadius: "50%", objectFit: "cover", marginLeft: "-6px" }} />
                </div>
                <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>Matches PyTorch skill</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SOCIAL PROOF & STATS SECTION */}
      <section style={{ 
        borderTop: "1px solid rgba(255, 255, 255, 0.04)", 
        borderBottom: "1px solid rgba(255, 255, 255, 0.04)", 
        background: "rgba(8, 10, 24, 0.4)", 
        padding: "60px 24px",
        position: "relative",
        zIndex: 2
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Partners Loop */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.15em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "20px" }}>
              Builders from elite student organizations and chapters globally
            </p>
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              flexWrap: "wrap", 
              gap: "28px 48px",
              opacity: 0.65 
            }}>
              {UNIVERSITY_PARTNERS.map((univ, index) => (
                <div key={index} style={{ 
                  fontSize: "14px", 
                  fontWeight: "700", 
                  color: "#ffffff", 
                  letterSpacing: "-0.01em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)" }}></div>
                  <span>{univ}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grid Stats */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
            gap: "24px",
            marginTop: "60px"
          }}>
            {STATS_DATA.map((stat, i) => (
              <div key={i} className="glass-card-premium" style={{ 
                padding: "24px 20px", 
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.03)",
                background: "rgba(10, 13, 30, 0.45)",
                textAlign: "left"
              }}>
                <h4 style={{ 
                  fontSize: "36px", 
                  fontWeight: "800", 
                  color: stat.color, 
                  marginBottom: "4px",
                  letterSpacing: "-0.03em"
                }}>{stat.value}</h4>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", marginBottom: "4px" }}>
                  {stat.label}
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURES BENTO GRID */}
      <section id="features" className="landing-section" style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
      }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "16px", letterSpacing: "-0.03em" }}>
            The Builder Ecosystem
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
            Everything ambitious creators need to team up, share their builds, and gain reputation without traditional college walls.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          
          {/* Card 1: Discovery (Large) */}
          <div className="glass-card-premium bento-span-2" style={{ 
            padding: "32px", 
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "24px",
            overflow: "hidden"
          }}>
            <div style={{ maxWidth: "480px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(139, 92, 246, 0.12)", color: "var(--primary)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Search size={18} />
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Smart Student Discovery</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5" }}>
                Browse a directory of builders filtered by technical proficiency, location, interest groups, and verified credentials. Instantly review profiles and invite peers to form code groups.
              </p>
            </div>
            
            {/* Visual simulation block */}
            <div style={{ 
              background: "rgba(0, 0, 0, 0.2)", 
              border: "1px solid rgba(255, 255, 255, 0.03)", 
              borderRadius: "12px", 
              padding: "16px"
            }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <span className="badge badge-primary" style={{ padding: "4px 10px" }}>React</span>
                <span className="badge badge-secondary" style={{ padding: "4px 10px" }}>Next.js</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>• 24 developers matched</span>
              </div>
            </div>
          </div>

          {/* Card 2: Skill-Based Matchmaking (Small) */}
          <div className="glass-card-premium" style={{ 
            padding: "32px", 
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "24px"
          }}>
            <div>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.12)", color: "var(--secondary)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Cpu size={18} />
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Skill Matching</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5" }}>
                Get automatically matched with designers or ML engineers that complement your coding capabilities perfectly.
              </p>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "-6px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--primary)", border: "2px solid #000" }}></div>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--secondary)", border: "2px solid #000", marginLeft: "-8px" }}></div>
              </div>
              <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: "600" }}>96% compatibility</span>
            </div>
          </div>

          {/* Card 3: Opportunities Hub (Small) */}
          <div className="glass-card-premium" style={{ 
            padding: "32px", 
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "24px"
          }}>
            <div>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(20, 184, 166, 0.12)", color: "#14b8a6", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Briefcase size={18} />
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Opportunity Board</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5" }}>
                Discover startup concepts, early-stage designs, GSoC projects, and mentorship events. Post your own and grow teams fast.
              </p>
            </div>
            <Link to="/opportunities" style={{ fontSize: "13px", fontWeight: "600", color: "var(--primary)", display: "flex", alignItems: "center", gap: "4px" }}>
              <span>Browse board</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Card 4: Workspaces & Collaboration (Large) */}
          <div className="glass-card-premium bento-span-2" style={{ 
            padding: "32px", 
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "24px"
          }}>
            <div style={{ maxWidth: "480px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <MessageSquare size={18} />
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Real-Time Workspaces</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5" }}>
                Communicate directly with peer builders, exchange files, create instant group workspaces, and coordinate hackathon schedules via our integrated real-time student hubs.
              </p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "10px", padding: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary)" }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11px", fontWeight: "700" }}>Priya Sharma</div>
                <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Hey! I just pushed the repo links. Let's form the team!</div>
              </div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Just now</span>
            </div>
          </div>

          {/* Card 5: Student Profiles (Large) */}
          <div className="glass-card-premium bento-span-2" style={{ 
            padding: "32px", 
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "24px"
          }}>
            <div style={{ maxWidth: "480px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(139, 92, 246, 0.12)", color: "var(--primary)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Users size={18} />
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Practical Student Profiles</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5" }}>
                Import repository histories, live demo links, and UX Figma portfolios. Show off your real skills instead of bullet-point resume lists.
              </p>
            </div>

            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.04)", padding: "10px 16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                <Code size={12} style={{ color: "var(--primary)" }} />
                <span>GitHub synced</span>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.04)", padding: "10px 16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                <Globe size={12} style={{ color: "var(--success)" }} />
                <span>4 live projects</span>
              </div>
            </div>
          </div>

          {/* Card 6: Project Showcase (Small) */}
          <div className="glass-card-premium" style={{ 
            padding: "32px", 
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "24px"
          }}>
            <div>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(236, 72, 153, 0.12)", color: "#ec4899", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Trophy size={18} />
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Project Showroom</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5" }}>
                Publish demo walkthroughs, get upvoted by the student cohort, and lead the campus builder leaderboard.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#f59e0b" }}>
              <Star size={12} fill="#f59e0b" />
              <Star size={12} fill="#f59e0b" />
              <Star size={12} fill="#f59e0b" />
              <Star size={12} fill="#f59e0b" />
              <Star size={12} fill="#f59e0b" />
              <span style={{ fontSize: "12px", color: "#fff", marginLeft: "4px", fontWeight: "600" }}>42 upvotes</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="landing-section" style={{ 
        borderTop: "1px solid rgba(255, 255, 255, 0.03)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
        background: "rgba(10, 13, 30, 0.2)",
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "16px", letterSpacing: "-0.03em" }}>
              How YuvaLink Works
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
              Four simple steps to shift your university journey from passive observer to active builder.
            </p>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "32px",
            position: "relative"
          }}>
            {/* Step 1 */}
            <div style={{ textAlign: "left", position: "relative" }}>
              <div style={{ fontSize: "52px", fontWeight: "900", color: "rgba(139, 92, 246, 0.15)", lineHeight: "1", marginBottom: "12px" }}>01</div>
              <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Create Profile</h4>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                Add your university, highlight your stacks (React, PyTorch, Figma), and import your GitHub builds.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ textAlign: "left", position: "relative" }}>
              <div style={{ fontSize: "52px", fontWeight: "900", color: "rgba(99, 102, 241, 0.15)", lineHeight: "1", marginBottom: "12px" }}>02</div>
              <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Connect Peers</h4>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                Use smart search filters to find students with specific stack expertise or matching project goals.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ textAlign: "left", position: "relative" }}>
              <div style={{ fontSize: "52px", fontWeight: "900", color: "rgba(20, 184, 166, 0.15)", lineHeight: "1", marginBottom: "12px" }}>03</div>
              <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Form Workspaces</h4>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                Join listed hackathon teams or startup ideas, or spawn your own. Connect instantly in group channels.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{ textAlign: "left", position: "relative" }}>
              <div style={{ fontSize: "52px", fontWeight: "900", color: "rgba(245, 158, 11, 0.15)", lineHeight: "1", marginBottom: "12px" }}>04</div>
              <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Launch Builds</h4>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                Deploy your demo links, upload video mockups, get upvoted, and build verified campus repute.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED STUDENTS */}
      <section id="students" className="landing-section" style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
      }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div className="badge badge-primary" style={{ gap: "6px", padding: "4px 12px", marginBottom: "16px", background: "rgba(139, 92, 246, 0.1)" }}>
            <Award size={12} style={{ color: "var(--primary)" }} />
            <span>Active Builders Directory</span>
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "16px", letterSpacing: "-0.03em" }}>
            Connect with Ambition
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
            Reach out directly to high-performing student developers, designers, and builders in our active network.
          </p>
        </div>

        <div className="responsive-grid">
          {students.map((student) => (
            <div key={student.id} className="glass-card-premium" style={{ 
              padding: "24px", 
              borderRadius: "16px", 
              display: "flex", 
              flexDirection: "column",
              border: "1px solid rgba(255, 255, 255, 0.04)"
            }}>
              {/* Header profile details */}
              <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
                <img 
                  src={student.avatar} 
                  alt={student.name} 
                  className="avatar avatar-ring" 
                  style={{ width: "52px", height: "52px" }}
                />
                <div>
                  <h4 style={{ fontSize: "17px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{student.name}</span>
                    <span style={{ display: "inline-flex", width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)" }} title="Active Builder"></span>
                  </h4>
                  <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>{student.title}</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", mt: "2px" }}>
                    <MapPin size={10} />
                    <span>{student.college}</span>
                  </p>
                </div>
              </div>

              {/* Skill set tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                {student.skills.map((skill, index) => (
                  <span key={index} className="badge badge-secondary" style={{ 
                    fontSize: "10.5px", 
                    padding: "3px 8px",
                    background: "rgba(99, 102, 241, 0.08)",
                    border: "1px solid rgba(99, 102, 241, 0.15)"
                  }}>{skill}</span>
                ))}
              </div>

              {/* Ongoing project description */}
              <div style={{ 
                background: "rgba(0, 0, 0, 0.15)", 
                borderRadius: "10px", 
                padding: "12px", 
                fontSize: "12.5px", 
                color: "var(--text-secondary)", 
                marginBottom: "20px", 
                lineHeight: "1.4",
                border: "1px solid rgba(255, 255, 255, 0.02)",
                flex: 1
              }}>
                <div style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "4px" }}>
                  Current Project
                </div>
                {student.project}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                <button 
                  onClick={() => handleConnectClick(student.id, student.name)}
                  className="btn" 
                  style={{ 
                    flex: 1, 
                    padding: "10px", 
                    fontSize: "13px", 
                    borderRadius: "10px",
                    background: student.connected ? "rgba(255, 255, 255, 0.05)" : "var(--primary-gradient)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  {student.connected ? "Connection Pending" : "Connect"}
                </button>
                <Link 
                  to="/discover" 
                  className="btn btn-secondary" 
                  style={{ 
                    padding: "10px", 
                    fontSize: "13px", 
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.05)"
                  }}
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link to="/discover" style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            fontSize: "15px", 
            fontWeight: "700", 
            color: "var(--primary)" 
          }}>
            <span>Discover more student builders</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 6. FEATURED OPPORTUNITIES */}
      <section id="opportunities" className="landing-section" style={{ 
        borderTop: "1px solid rgba(255, 255, 255, 0.03)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
        background: "rgba(8, 10, 24, 0.2)",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <div className="badge badge-primary" style={{ gap: "6px", padding: "4px 12px", marginBottom: "16px", background: "rgba(20, 184, 166, 0.1)" }}>
              <Trophy size={12} style={{ color: "#14b8a6" }} />
              <span style={{ color: "#14b8a6" }}>Live Opportunity Board</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", marginBottom: "16px", letterSpacing: "-0.03em" }}>
              Join Ongoing Builds
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
              Form teams for global student hackathons, co-pilot emerging startup ideas, or apply to GSoC projects.
            </p>
          </div>

          <div className="responsive-grid">
            {opportunities.map((op) => (
              <div key={op.id} className="glass-card-premium" style={{ 
                padding: "24px", 
                borderRadius: "16px", 
                display: "flex", 
                flexDirection: "column",
                border: "1px solid rgba(255, 255, 255, 0.04)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <span style={{ 
                    fontSize: "11px", 
                    fontWeight: "700", 
                    color: op.badgeText, 
                    background: op.badgeColor,
                    padding: "3px 10px",
                    borderRadius: "999px"
                  }}>{op.type}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Slot: {op.teamSize}</span>
                </div>

                <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>{op.title}</h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>Posted by {op.author}</p>

                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "20px", flex: 1 }}>
                  {op.desc}
                </p>

                {/* Tags required */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                  {op.skills.map((skill, index) => (
                    <span key={index} style={{ 
                      fontSize: "10px", 
                      padding: "2px 8px", 
                      borderRadius: "6px", 
                      background: "rgba(255,255,255,0.03)", 
                      color: "var(--text-secondary)",
                      border: "1px solid rgba(255,255,255,0.04)"
                    }}>{skill}</span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    onClick={() => handleApplyClick(op.id, op.title)}
                    className="btn" 
                    style={{ 
                      flex: 1, 
                      padding: "10px", 
                      fontSize: "13px", 
                      borderRadius: "10px",
                      background: op.applied ? "rgba(255, 255, 255, 0.05)" : "var(--primary-gradient)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    {op.applied ? "Application Sent" : "Request to Join"}
                  </button>
                  <Link 
                    to="/opportunities" 
                    className="btn btn-secondary" 
                    style={{ 
                      padding: "10px", 
                      fontSize: "13px", 
                      borderRadius: "10px",
                      border: "1px solid rgba(255, 255, 255, 0.05)"
                    }}
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link to="/opportunities" style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "8px", 
              fontSize: "15px", 
              fontWeight: "700", 
              color: "#14b8a6" 
            }}>
              <span>Browse opportunity board</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA SECTION */}
      <section className="landing-section" style={{ 
        maxWidth: "1000px", 
        margin: "0 auto", 
        textAlign: "center",
      }}>
        {/* Glow backdrop behind final CTA */}
        <div style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "60%",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
          filter: "blur(50px)",
          zIndex: -1
        }}></div>

        <div className="glass-card-premium" style={{ 
          padding: "80px 40px", 
          borderRadius: "24px",
          background: "linear-gradient(135deg, rgba(8, 10, 22, 0.8) 0%, rgba(99, 102, 241, 0.04) 100%)", 
          border: "1px solid rgba(139, 92, 246, 0.2)" 
        }}>
          <h2 style={{ 
            fontSize: "clamp(26px, 4.5vw, 44px)", 
            fontWeight: "800", 
            marginBottom: "20px",
            letterSpacing: "-0.03em"
          }}>
            This is where ambitious students<br />
            meet and build cool things.
          </h2>
          <p style={{ 
            color: "var(--text-secondary)", 
            fontSize: "16.5px", 
            maxWidth: "600px", 
            margin: "0 auto 40px", 
            lineHeight: "1.6" 
          }}>
            Join the skill network today. Form your hackathon rosters, test your startup drafts, and connect with peer engineers globally.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px" }}>
            <Link to="/register" className="btn btn-primary shine-button" style={{ 
              padding: "16px 36px", 
              fontSize: "16px", 
              borderRadius: "12px",
              boxShadow: "0 0 25px rgba(139, 92, 246, 0.25)"
            }}>
              <span>Get Started For Free</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ 
              padding: "16px 36px", 
              fontSize: "16px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.06)"
            }}>
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ 
        padding: "50px 24px", 
        borderTop: "1px solid rgba(255, 255, 255, 0.04)", 
        textAlign: "center", 
        color: "var(--text-muted)", 
        fontSize: "14px",
        position: "relative",
        zIndex: 2
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", alignItems: "center", marginBottom: "14px" }}>
          <Sparkles size={16} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 4px var(--primary-glow))" }} />
          <span style={{ fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em" }}>YuvaLink</span>
        </div>
        <p style={{ marginBottom: "8px" }}>© 2026 YuvaLink. Built with ❤️ for student builders globally.</p>
        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Not affiliated with LinkedIn Corporation.</p>
      </footer>
    </div>
  );
}

export default Landing;
