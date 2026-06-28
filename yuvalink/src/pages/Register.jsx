import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff, User, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../config/supabase";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !college) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign up the user inside Supabase Auth
      // Store name/college in user metadata so they are available after email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
            department: college,
          }
        }
      });

      if (authError) throw authError;

      // 2. If email confirmation is enabled, session will be null.
      // Show the email verification screen and skip profile insert for now.
      if (authData?.user && !authData.session) {
        setIsEmailSent(true);
        toast.success("Verification email sent!");
        return;
      }

      // 3. If signed up and logged in automatically, insert the profile
      if (authData?.user && authData.session) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: authData.user.id,          // Primary Key (uuid)
              user_id: authData.user.id,     // Foreign key reference
              full_name: name,               // Map "name" state to "full_name"
              department: college,           // Map "college" state to "department"
              avatar_url: `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop`
            }
          ]);
        if (profileError) throw profileError;
      }

      toast.success("Account created successfully!");
      navigate("/dashboard");

    } catch (error) {
      // Display any registration or database insertion errors
      console.error("Detailed registration error:", error);
      const errorMessage = error?.message || (typeof error === "string" ? error : JSON.stringify(error)) || "An error occurred during registration";
      toast.error(errorMessage);
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
        {isEmailSent ? (
          <div className="animate-fade-in" style={{ padding: "10px 0" }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(139, 92, 246, 0.1)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              color: "var(--primary)",
              boxShadow: "0 0 20px rgba(139, 92, 246, 0.15)"
            }}>
              <Mail size={26} className="animate-pulse" />
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px" }}>Verify Your Email</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6", marginBottom: "28px" }}>
              We've sent a verification link to <strong style={{ color: "var(--text-primary)" }}>{email}</strong>. 
              Please click the link in your inbox to activate your account and build your student connection profile.
            </p>

            <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "20px" }}>
              <Link to="/login" className="btn btn-secondary" style={{ width: "100%", padding: "12px", justifyContent: "center" }}>
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
