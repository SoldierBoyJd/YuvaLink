import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Home,
  Search,
  Users,
  Briefcase,
  User,
  LogOut,
  Bell,
  Compass,
  TrendingUp,
  Sparkles,
  ChevronRight,
  UserPlus
} from "lucide-react";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";


// Fallback avatar when profile has no avatar_url
const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face";


const SUGGESTED_CONNECTIONS = [
  { id: 1, name: "Zara Chen", title: "UI/UX Student", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" },
  { id: 2, name: "Marcus Johnson", title: "ML Enthusiast", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" },
  { id: 3, name: "Priya Sharma", title: "Fullstack Intern", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop" }
];

const TRENDING_OPPORTUNITIES = [
  { id: 1, title: "Google Summer of Code 2026", type: "Open Source", deadline: "In 5 days" },
  { id: 2, title: "Figma UX Design Mentorship", type: "Mentorship", deadline: "In 2 weeks" },
  { id: 3, title: "Stripe Backend Engineering Intern", type: "Internship", deadline: "In 8 days" }
];

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = "dark";
  const { profile } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [connectedIds, setConnectedIds] = useState([]);

  // Check path - bypass layout for Landing, Login, and Register
  const isAuthOrLanding = ["/", "/login", "/register"].includes(location.pathname);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }, []);

  const handleConnect = (id) => {
    setConnectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleLogout = async () => {
    try {
      // 1. Sign out the user from Supabase Auth
      await supabase.auth.signOut();

      // 2. Clear old mock storage keys
      localStorage.removeItem("isLoggedIn");

      // 3. Redirect user back to the sign in page
      navigate("/login");
      toast.success("Successfully logged out!");
    } catch (error) {
      toast.error("Error signing out: " + error.message);
    }
  };


  if (isAuthOrLanding) {
    return (
      <div style={{ position: "relative", minHeight: "100vh" }}>
        {/* Premium Navbar for Landing/Auth pages */}
        <nav className="topbar" style={{
          background: "rgba(5, 8, 22, 0.4)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.04)"
        }}>
          <div className="topbar-brand" onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <Sparkles size={22} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }} />
            <span className="brand-text" style={{
              fontWeight: "800",
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #ffffff 40%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>YuvaLink</span>
          </div>

          {location.pathname === "/" && (
            <div className="hide-on-mobile" style={{
              display: "flex",
              gap: "32px",
              alignItems: "center",
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--text-secondary)"
            }}>
              <a href="#features" className="nav-anchor" style={{ color: "var(--text-secondary)", transition: "color var(--transition-fast)" }}>Features</a>
              <a href="#how-it-works" className="nav-anchor" style={{ color: "var(--text-secondary)", transition: "color var(--transition-fast)" }}>How It Works</a>
              <a href="#students" className="nav-anchor" style={{ color: "var(--text-secondary)", transition: "color var(--transition-fast)" }}>Builders</a>
              <a href="#opportunities" className="nav-anchor" style={{ color: "var(--text-secondary)", transition: "color var(--transition-fast)" }}>Opportunities</a>
            </div>
          )}

          <div className="topbar-actions" style={{ gap: "12px" }}>

            {location.pathname === "/" && (
              <>
                <Link to="/login" className="btn btn-secondary nav-btn" style={{ padding: "8px 16px", fontSize: "14px", borderRadius: "10px" }}>Sign In</Link>
                <Link to="/register" className="btn btn-primary nav-btn hide-on-mobile shine-button" style={{ padding: "8px 18px", fontSize: "14px", borderRadius: "10px" }}>Join Now</Link>
              </>
            )}
            {location.pathname === "/login" && (
              <Link to="/register" className="btn btn-primary nav-btn" style={{ padding: "8px 18px", fontSize: "14px", borderRadius: "10px" }}>Register</Link>
            )}
            {location.pathname === "/register" && (
              <Link to="/login" className="btn btn-primary nav-btn" style={{ padding: "8px 18px", fontSize: "14px", borderRadius: "10px" }}>Login</Link>
            )}
          </div>
        </nav>
        <main style={{ paddingTop: "70px" }}>{children}</main>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="topbar">
        <div className="topbar-brand" onClick={() => navigate("/dashboard")}>
          <Sparkles size={24} style={{ color: "var(--primary)" }} />
          <span>YuvaLink</span>
        </div>

        {/* Global Search */}
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search peers, skills, hackathons..."
            className="search-input"
          />
        </div>

        <div className="topbar-actions">

          <button className="btn-icon" aria-label="Notifications" style={{ position: "relative" }}>
            <Bell size={18} />
            <span style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              width: "8px",
              height: "8px",
              backgroundColor: "var(--danger)",
              borderRadius: "50%"
            }}></span>
          </button>

          {/* User Profile Dropdown Toggle */}
          <div style={{ position: "relative" }}>
            <img
              src={profile?.avatar_url || FALLBACK_AVATAR}
              alt={profile?.full_name || "User"}
              className="avatar"
              style={{ width: "38px", height: "38px", cursor: "pointer" }}
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            />
            {showProfileDropdown && (
              <div className="glass-card" style={{
                position: "absolute",
                top: "50px",
                right: 0,
                width: "200px",
                padding: "8px",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                background: "var(--bg-tertiary)",
                boxShadow: "var(--shadow-lg)"
              }}>
                <Link
                  to="/profile"
                  className="sidebar-link"
                  style={{ padding: "8px 12px", fontSize: "14px" }}
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <User size={16} />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="sidebar-link"
                  style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "8px 12px", fontSize: "14px", cursor: "pointer" }}
                >
                  <LogOut size={16} style={{ color: "var(--danger)" }} />
                  <span style={{ color: "var(--danger)" }}>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Layout Grid */}
      <div className="main-layout">

        {/* Left Navigation Sidebar */}
        <aside className="sidebar">
          {/* Quick Profile Summary Widget */}
          <div className="glass-card" style={{ padding: "16px", textAlign: "center", marginBottom: "10px" }}>
            <img
              src={profile?.avatar_url || FALLBACK_AVATAR}
              alt={profile?.full_name || "User"}
              className="avatar avatar-ring"
              style={{ width: "68px", height: "68px", marginBottom: "12px" }}
            />
            <h4 style={{ fontSize: "16px", fontWeight: "700" }}>{profile?.full_name || "—"}</h4>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>
              {profile?.department || profile?.title || "Student"}
            </p>
            <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "12px", display: "flex", justifyContent: "space-around" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "700" }}>{profile?.connections_count ?? 0}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Peers</div>
              </div>
              <div style={{ borderLeft: "1px solid var(--card-border)" }}></div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "700" }}>{profile?.profile_completion ?? 0}%</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Setup</div>
              </div>
            </div>
          </div>

          <ul className="sidebar-menu">
            <li>
              <Link to="/dashboard" className={`sidebar-link ${location.pathname === "/dashboard" ? "active" : ""}`}>
                <Home size={20} />
                <span>Home Feed</span>
              </Link>
            </li>
            <li>
              <Link to="/discover" className={`sidebar-link ${location.pathname === "/discover" ? "active" : ""}`}>
                <Compass size={20} />
                <span>Discover</span>
              </Link>
            </li>
            <li>
              <Link to="/opportunities" className={`sidebar-link ${location.pathname === "/opportunities" ? "active" : ""}`}>
                <Briefcase size={20} />
                <span>Opportunities</span>
              </Link>
            </li>
            <li>
              <Link to="/connections" className={`sidebar-link ${location.pathname === "/connections" ? "active" : ""}`}>
                <Users size={20} />
                <span>My Connections</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className={`sidebar-link ${location.pathname === "/profile" ? "active" : ""}`}>
                <User size={20} />
                <span>Profile</span>
              </Link>
            </li>
          </ul>
        </aside>

        {/* Dynamic Center Feed */}
        <main className="content-wrapper">
          {children}
        </main>

        {/* Right Sidebar Suggestions & Trends panel */}
        <aside className="right-sidebar">
          {/* Suggested Peers Widget */}
          <div className="glass-card widget">
            <h3 className="widget-title">
              <span>Suggested Peers</span>
              <Sparkles size={16} style={{ color: "var(--secondary)" }} />
            </h3>
            <div className="widget-list">
              {SUGGESTED_CONNECTIONS.map(peer => (
                <div key={peer.id} className="widget-item">
                  <img src={peer.avatar} alt={peer.name} className="avatar" style={{ width: "36px", height: "36px" }} />
                  <div className="widget-item-info">
                    <div className="widget-item-name">{peer.name}</div>
                    <div className="widget-item-sub">{peer.title}</div>
                  </div>
                  <button
                    onClick={() => handleConnect(peer.id)}
                    className="btn"
                    style={{
                      padding: "6px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      background: connectedIds.includes(peer.id) ? "var(--bg-tertiary)" : "var(--primary-gradient)",
                      color: "#fff",
                      minWidth: "32px",
                      height: "32px"
                    }}
                    aria-label="Connect"
                  >
                    <UserPlus size={14} />
                  </button>
                </div>
              ))}
            </div>
            <Link to="/discover" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", fontSize: "13px", fontWeight: "600", color: "var(--primary)", marginTop: "14px" }}>
              <span>View All Peers</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Trending opportunities Widget */}
          <div className="glass-card widget">
            <h3 className="widget-title">
              <span>Trending Opportunities</span>
              <TrendingUp size={16} style={{ color: "var(--primary)" }} />
            </h3>
            <div className="widget-list">
              {TRENDING_OPPORTUNITIES.map(op => (
                <div key={op.id} className="widget-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="badge badge-primary">{op.type}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{op.deadline}</span>
                  </div>
                  <div className="widget-item-name" style={{ whiteSpace: "normal", fontSize: "13px", fontWeight: "600", width: "100%" }}>{op.title}</div>
                </div>
              ))}
            </div>
            <Link to="/opportunities" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", fontSize: "13px", fontWeight: "600", color: "var(--primary)", marginTop: "14px" }}>
              <span>Browse All Openings</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </aside>

      </div>

      {/* Mobile Responsive Navigation Bar */}
      <nav className="mobile-nav">
        <Link to="/dashboard" className={`mobile-nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}>
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link to="/discover" className={`mobile-nav-item ${location.pathname === "/discover" ? "active" : ""}`}>
          <Compass size={20} />
          <span>Discover</span>
        </Link>
        <Link to="/opportunities" className={`mobile-nav-item ${location.pathname === "/opportunities" ? "active" : ""}`}>
          <Briefcase size={20} />
          <span>Jobs</span>
        </Link>
        <Link to="/connections" className={`mobile-nav-item ${location.pathname === "/connections" ? "active" : ""}`}>
          <Users size={20} />
          <span>Peers</span>
        </Link>
        <Link to="/profile" className={`mobile-nav-item ${location.pathname === "/profile" ? "active" : ""}`}>
          <User size={20} />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}

export default Layout;
