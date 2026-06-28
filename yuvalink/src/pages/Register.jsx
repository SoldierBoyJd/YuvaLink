import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff, User, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !college) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    // Simulate register
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("isLoggedIn", "true");
      toast.success("Account created! Welcome to YuvaLink!");
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 70px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary)",
      padding: "40px 24px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative Blur Orbs */}
      <div style={{
        position: "absolute",
        top: "15%",
        right: "10%",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "rgba(168, 85, 247, 0.1)",
        filter: "blur(80px)",
        pointerEvents: "none",
        zIndex: 0
      }}></div>
      <div style={{
        position: "absolute",
        bottom: "15%",
        left: "10%",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "var(--primary-glow)",
        filter: "blur(80px)",
        pointerEvents: "none",
        zIndex: 0
      }}></div>

      <div className="glass-card animate-fade-in" style={{
        width: "100%",
        maxWidth: "450px",
        padding: "40px 32px",
        textAlign: "center",
        position: "relative",
        zIndex: 1,
        borderWidth: "1.5px"
      }}>
        {/* Logo and header */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Sparkles size={28} style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: "24px", fontWeight: "800", background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>YuvaLink</span>
        </div>
        
        <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>Create Account</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "32px" }}>
          Join the community of next-gen student creators
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div className="input-group">
            <label className="input-label" htmlFor="fullName">Full Name</label>
            <div style={{ position: "relative", width: "100%" }}>
              <User size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input 
                id="fullName"
                type="text" 
                placeholder="Alex Rivera" 
                className="glass-input" 
                style={{ width: "100%", paddingLeft: "42px" }}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="collegeName">College / University</label>
            <div style={{ position: "relative", width: "100%" }}>
              <BookOpen size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input 
                id="collegeName"
                type="text" 
                placeholder="Tech University" 
                className="glass-input" 
                style={{ width: "100%", paddingLeft: "42px" }}
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="emailAddress">Email Address</label>
            <div style={{ position: "relative", width: "100%" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input 
                id="emailAddress"
                type="email" 
                placeholder="you@university.edu" 
                className="glass-input" 
                style={{ width: "100%", paddingLeft: "42px" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="regPassword">Password</label>
            <div style={{ position: "relative", width: "100%" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input 
                id="regPassword"
                type={showPassword ? "text" : "password"} 
                placeholder="At least 8 characters" 
                className="glass-input" 
                style={{ width: "100%", paddingLeft: "42px", paddingRight: "42px" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: "absolute", 
                  right: "14px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  background: "none", 
                  border: "none", 
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "12px", marginTop: "8px", gap: "10px" }}
            disabled={isLoading}
          >
            <span>{isLoading ? "Creating Account..." : "Join YuvaLink"}</span>
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ borderTop: "1px solid var(--card-border)", margin: "24px 0 16px", paddingTop: "16px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: "600" }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
