import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../config/supabase";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      // Sign in the user using Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // Check if user has a profile record (e.g. if email confirmation was ON during registration)
      if (data?.user) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (!existingProfile) {
          // If no profile exists, create a default one
          const defaultName = email.split("@")[0];
          await supabase
            .from("profiles")
            .insert([
              {
                id: data.user.id,
                user_id: data.user.id,
                full_name: defaultName,
                avatar_url: `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop`
              }
            ]);
        }
      }

      toast.success("Welcome back to YuvaLink!");
      navigate("/dashboard");

    } catch (error) {
      // Display error toast on incorrect password/email or connection failures
      toast.error(error.message || "Invalid login credentials");
    } finally {
      setIsLoading(false);
    }
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
        top: "20%",
        left: "10%",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "var(--primary-glow)",
        filter: "blur(80px)",
        pointerEvents: "none",
        zIndex: 0
      }}></div>
      <div style={{
        position: "absolute",
        bottom: "20%",
        right: "10%",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "rgba(168, 85, 247, 0.1)",
        filter: "blur(80px)",
        pointerEvents: "none",
        zIndex: 0
      }}></div>

      <div className="glass-card animate-fade-in" style={{
        width: "100%",
        maxWidth: "420px",
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

        <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>Welcome Back</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "32px" }}>
          Connect with your peers and explore opportunities
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <div style={{ position: "relative", width: "100%" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                id="email"
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="input-label" htmlFor="password">Password</label>
              <a href="#" style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600" }}>Forgot?</a>
            </div>
            <div style={{ position: "relative", width: "100%" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
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
            <span>{isLoading ? "Signing In..." : "Sign In"}</span>
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ borderTop: "1px solid var(--card-border)", margin: "24px 0 16px", paddingTop: "16px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--primary)", fontWeight: "600" }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;