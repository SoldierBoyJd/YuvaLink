import { useState } from "react";
import { Search, Calendar, DollarSign, Check, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const OPPORTUNITY_DATABASE = [
  {
    id: 1,
    title: "Frontend Engineering Intern",
    company: "Stripe",
    logoText: "S",
    logoColor: "#635bff",
    type: "Internship",
    location: "Remote (Global)",
    duration: "3 Months",
    stipend: "$1500 / month",
    deadline: "5 days left",
    tags: ["React", "CSS Grid", "TypeScript"],
    applied: false
  },
  {
    id: 2,
    title: "Global Tech Hackathon 2026",
    company: "GitHub Sponsor",
    logoText: "G",
    logoColor: "#171515",
    type: "Hackathon",
    location: "Online",
    duration: "48 Hours",
    stipend: "$10,000 Prizes",
    deadline: "12 days left",
    tags: ["Full Stack", "AI API", "Open Source"],
    applied: false
  },
  {
    id: 3,
    title: "Figma UX Design Mentor Circle",
    company: "Designers Hub",
    logoText: "F",
    logoColor: "#f24e1e",
    type: "Mentorship",
    location: "Remote",
    duration: "6 Weeks",
    stipend: "Unpaid (Certify)",
    deadline: "2 weeks left",
    tags: ["Figma", "UI/UX", "Portfolio Review"],
    applied: false
  },
  {
    id: 4,
    title: "Python Backend Developer (Contract)",
    company: "Veridian Corp",
    logoText: "V",
    logoColor: "#10b981",
    type: "Project",
    location: "Hybrid (New York)",
    duration: "2 Months",
    stipend: "$2500 / month",
    deadline: "8 days left",
    tags: ["Python", "Django", "PostgreSQL"],
    applied: false
  },
  {
    id: 5,
    title: "Youth Tech Leadership Scholarship",
    company: "Future Leaders Org",
    logoText: "L",
    logoColor: "#a855f7",
    type: "Scholarship",
    location: "Global",
    duration: "1 Academic Year",
    stipend: "$5000 grant",
    deadline: "3 weeks left",
    tags: ["Undergrad", "Community Work", "Essay"],
    applied: false
  }
];

function Opportunities() {
  const [opportunities, setOpportunities] = useState(OPPORTUNITY_DATABASE);
  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedOp, setSelectedOp] = useState(null);
  const [resumeLink, setResumeLink] = useState("");

  const handleApplyClick = (op) => {
    setSelectedOp(op);
    setShowApplyModal(true);
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!resumeLink.trim()) {
      toast.error("Please enter your portfolio or resume URL");
      return;
    }

    setOpportunities(prev => prev.map(op => {
      if (op.id === selectedOp.id) {
        return { ...op, applied: true };
      }
      return op;
    }));

    toast.success(`Application sent to ${selectedOp.company} successfully!`);
    setShowApplyModal(false);
    setSelectedOp(null);
    setResumeLink("");
  };

  // Filtering opportunities
  const filteredOps = opportunities.filter(op => {
    const matchesSearch = op.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          op.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          op.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === "All" || op.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header Info */}
      <div style={{ textAlign: "left" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>Opportunities Hub</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
          Explore, track, and apply for high-value student internships, open projects, scholarship programs, and global hackathons.
        </p>
      </div>

      {/* Filter panel */}
      <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* Search */}
        <div style={{ position: "relative", width: "100%" }}>
          <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text" 
            placeholder="Search by job title, company, or tech stack..." 
            className="glass-input" 
            style={{ width: "100%", paddingLeft: "48px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", borderTop: "1px solid var(--card-border)", paddingTop: "14px" }}>
          {["All", "Internship", "Hackathon", "Project", "Mentorship", "Scholarship"].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className="badge"
              style={{
                cursor: "pointer",
                border: "1px solid var(--card-border)",
                background: filterType === type ? "var(--primary-gradient)" : "var(--bg-tertiary)",
                color: filterType === type ? "#fff" : "var(--text-secondary)",
                padding: "6px 14px",
                transition: "all var(--transition-fast)"
              }}
            >
              {type}s
            </button>
          ))}
        </div>
      </div>

      {/* Card Grid */}
      {filteredOps.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
          gap: "24px"
        }}>
          {filteredOps.map(op => (
            <div key={op.id} className="glass-card" style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              textAlign: "left"
            }}>
              
              {/* Card Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "8px",
                    background: op.logoColor,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    fontSize: "16px"
                  }}>
                    {op.logoText}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: "700" }}>{op.company}</h4>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{op.location}</span>
                  </div>
                </div>

                <span className={`badge ${
                  op.type === "Internship" ? "badge-primary" :
                  op.type === "Hackathon" ? "badge-secondary" :
                  op.type === "Project" ? "badge-danger" : "badge-success"
                }`} style={{ fontSize: "11px" }}>
                  {op.type}
                </span>
              </div>

              {/* Title & Info */}
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>{op.title}</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "var(--text-secondary)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={13} style={{ color: "var(--text-muted)" }} />
                    <span>Duration: {op.duration}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <DollarSign size={13} style={{ color: "var(--text-muted)" }} />
                    <span>Compensation: {op.stipend}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {op.tags.map(tag => (
                  <span key={tag} className="badge badge-primary" style={{ fontSize: "10px", padding: "4px 8px" }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Card Footer & Apply CTA */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid var(--card-border)",
                paddingTop: "14px",
                marginTop: "auto"
              }}>
                <span className="badge badge-danger" style={{ 
                  fontSize: "11px", 
                  background: "rgba(239,68,68,0.08)", 
                  color: "#f87171",
                  border: "1px solid rgba(239,68,68,0.2)"
                }}>
                  {op.deadline}
                </span>

                <button
                  onClick={() => op.applied ? null : handleApplyClick(op)}
                  className="btn"
                  style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    background: op.applied ? "var(--bg-tertiary)" : "var(--primary-gradient)",
                    color: op.applied ? "var(--success)" : "#fff",
                    border: op.applied ? "1px solid var(--card-border)" : "none",
                    cursor: op.applied ? "default" : "pointer"
                  }}
                >
                  {op.applied ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Check size={14} /> Applied
                    </span>
                  ) : (
                    <span>Apply Now</span>
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
          <h3 style={{ fontSize: "18px", color: "var(--text-secondary)" }}>No opportunities found matching your query.</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "6px" }}>Try removing filter tags or expanding search query keywords.</p>
        </div>
      )}

      {/* Quick Application Modal/Popup Backdrop */}
      {showApplyModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          padding: "16px"
        }} className="animate-fade-in">
          
          <div className="glass-card" style={{
            width: "100%",
            maxWidth: "480px",
            padding: "32px",
            position: "relative"
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setShowApplyModal(false)}
              style={{
                position: "absolute",
                top: "16px", right: "16px",
                background: "none", border: "none",
                color: "var(--text-muted)", cursor: "pointer"
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Modal Title */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Sparkles size={20} style={{ color: "var(--secondary)" }} />
              <h3 style={{ fontSize: "20px", fontWeight: "700" }}>Apply to {selectedOp?.company}</h3>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
              Apply for the position of <strong>{selectedOp?.title}</strong>. Provide your portfolio, GitHub profile, or resume PDF link to proceed.
            </p>

            {/* Apply Form */}
            <form onSubmit={handleApplySubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="input-group">
                <label className="input-label" htmlFor="resumeUrl">Resume or Portfolio Link</label>
                <input 
                  id="resumeUrl"
                  type="url" 
                  placeholder="https://github.com/your-username or https://myportfolio.dev" 
                  className="glass-input" 
                  required
                  value={resumeLink}
                  onChange={(e) => setResumeLink(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button 
                  type="button" 
                  onClick={() => setShowApplyModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Submit Application
                </button>
              </div>
            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Opportunities;