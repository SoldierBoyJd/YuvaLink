import { useState } from "react";
import { 
  User, 
  MapPin, 
  BookOpen, 
  Plus, 
  X, 
  Edit3, 
  Check, 
  Globe, 
  Briefcase, 
  Code,
  Sparkles,
  Camera
} from "lucide-react";
import toast from "react-hot-toast";

const Github = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const INITIAL_PROFILE = {
  name: "Alex Rivera",
  title: "Computer Science Undergrad",
  college: "Tech University",
  location: "San Francisco, CA",
  bio: "Passionate full-stack developer and student builder. Love collaborating on hackathons, exploring AI tools, and designing clean interfaces. Currently seeking a summer frontend intern role!",
  avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face",
  cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop",
  github: "alexrivera-dev",
  linkedin: "alexrivera",
  website: "alexrivera.dev",
  skills: ["React", "CSS Grid", "TypeScript", "NodeJS", "Figma", "Python"],
  projects: [
    {
      id: 1,
      title: "YuvaLink Portal",
      description: "Responsive networking hub concept designed for student builders and youth professionals.",
      tech: "React, CSS, Lucide"
    },
    {
      id: 2,
      title: "StudySpace Chrome Extension",
      description: "Productivity companion for college students featuring pomodoro timer and focus dashboard.",
      tech: "JavaScript, HTML5, Chrome APIs"
    }
  ],
  experience: [
    {
      id: 1,
      role: "Frontend Dev Intern",
      organization: "WebCraft Studio",
      duration: "Jun 2025 - Aug 2025"
    },
    {
      id: 2,
      role: "Open Source Contributor",
      organization: "Hacktoberfest",
      duration: "Oct 2024"
    }
  ]
};

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
];

function Profile() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // Form states
  const [editName, setEditName] = useState(profile.name);
  const [editTitle, setEditTitle] = useState(profile.title);
  const [editCollege, setEditCollege] = useState(profile.college);
  const [editLocation, setEditLocation] = useState(profile.location);
  const [editBio, setEditBio] = useState(profile.bio);
  
  // New entry states
  const [newSkill, setNewSkill] = useState("");
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjTech, setNewProjTech] = useState("");
  const [showAddProj, setShowAddProj] = useState(false);

  const [newExpRole, setNewExpRole] = useState("");
  const [newExpOrg, setNewExpOrg] = useState("");
  const [newExpDur, setNewExpDur] = useState("");
  const [showAddExp, setShowAddExp] = useState(false);

  const handleSaveInfo = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editTitle.trim()) {
      toast.error("Name and title are required!");
      return;
    }
    setProfile(prev => ({
      ...prev,
      name: editName,
      title: editTitle,
      college: editCollege,
      location: editLocation
    }));
    setIsEditingInfo(false);
    toast.success("Profile basic info updated!");
  };

  const handleSaveBio = () => {
    setProfile(prev => ({ ...prev, bio: editBio }));
    setIsEditingBio(false);
    toast.success("Biography updated!");
  };

  const selectAvatar = (url) => {
    setProfile(prev => ({ ...prev, avatar: url }));
    setShowAvatarModal(false);
    toast.success("Avatar updated!");
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (profile.skills.includes(newSkill.trim())) {
      toast.error("Skill already exists!");
      return;
    }
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }));
    setNewSkill("");
    toast.success("Skill added!");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
    toast.success("Skill removed");
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProjTitle.trim() || !newProjDesc.trim()) {
      toast.error("Project title and description are required!");
      return;
    }
    const newProjectItem = {
      id: Date.now(),
      title: newProjTitle,
      description: newProjDesc,
      tech: newProjTech || "General Stack"
    };
    setProfile(prev => ({
      ...prev,
      projects: [...prev.projects, newProjectItem]
    }));
    setNewProjTitle("");
    setNewProjDesc("");
    setNewProjTech("");
    setShowAddProj(false);
    toast.success("New project added to portfolio!");
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!newExpRole.trim() || !newExpOrg.trim() || !newExpDur.trim()) {
      toast.error("All experience fields are required!");
      return;
    }
    const newExpItem = {
      id: Date.now(),
      role: newExpRole,
      organization: newExpOrg,
      duration: newExpDur
    };
    setProfile(prev => ({
      ...prev,
      experience: [...prev.experience, newExpItem]
    }));
    setNewExpRole("");
    setNewExpOrg("");
    setNewExpDur("");
    setShowAddExp(false);
    toast.success("Experience timeline updated!");
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Banner & Basic Info Card */}
      <div className="glass-card" style={{ overflow: "hidden", position: "relative" }}>
        {/* Banner Cover */}
        <div style={{ height: "180px", position: "relative" }}>
          <img 
            src={profile.cover} 
            alt="cover banner" 
            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          />
          <button 
            onClick={() => toast.success("Mock cover banner upload triggered!")}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
              padding: "6px 12px",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Camera size={14} />
            <span>Change Cover</span>
          </button>
        </div>

        {/* Profile Details area */}
        <div style={{ padding: "0 28px 28px", position: "relative", textAlign: "left" }}>
          {/* Avatar Container positioned overlapping the banner */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", marginTop: "-50px", marginBottom: "16px", gap: "16px" }}>
            <div style={{ position: "relative" }}>
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="avatar avatar-ring" 
                style={{ width: "110px", height: "110px", background: "var(--bg-secondary)", zIndex: 2, position: "relative" }}
              />
              <button 
                onClick={() => setShowAvatarModal(true)}
                style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "4px",
                  background: "var(--primary)",
                  border: "none",
                  borderRadius: "50%",
                  color: "#fff",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 3,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
                }}
                aria-label="Change Avatar"
              >
                <Camera size={13} />
              </button>
            </div>

            {/* Quick social links */}
            <div style={{ display: "flex", gap: "8px" }}>
              <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: "8px 12px", fontSize: "13px" }}>
                <Github size={15} />
              </a>
              <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: "8px 12px", fontSize: "13px" }}>
                <Linkedin size={15} />
              </a>
              <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: "8px 12px", fontSize: "13px" }}>
                <Globe size={15} />
              </a>
              <button 
                onClick={() => setIsEditingInfo(true)}
                className="btn btn-primary"
                style={{ padding: "8px 16px", fontSize: "13px", gap: "6px" }}
              >
                <Edit3 size={14} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* User Info Texts */}
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800" }}>{profile.name}</h1>
            <p style={{ fontSize: "15px", color: "var(--primary)", fontWeight: "600", marginTop: "2px" }}>{profile.title}</p>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "12px", fontSize: "13px", color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <BookOpen size={14} style={{ color: "var(--text-muted)" }} />
                <span>{profile.college}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={14} style={{ color: "var(--text-muted)" }} />
                <span>{profile.location}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: Left Column (Bio, Skills), Right Column (Projects, Experience) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "28px"
      }}>
        
        {/* Left Side: About & Skills */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* About Bio Card */}
          <div className="glass-card" style={{ padding: "28px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <User size={18} style={{ color: "var(--primary)" }} />
                <span>About Me</span>
              </h2>
              {!isEditingBio && (
                <button 
                  onClick={() => setIsEditingBio(true)}
                  style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: "600" }}
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditingBio ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <textarea 
                  className="glass-input"
                  style={{ width: "100%", minHeight: "100px", resize: "vertical" }}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                />
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button onClick={() => setIsEditingBio(false)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }}>
                    Cancel
                  </button>
                  <button onClick={handleSaveBio} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "13px", gap: "4px" }}>
                    <Check size={14} />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Skills Management Card */}
          <div className="glass-card" style={{ padding: "28px", textAlign: "left" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Code size={18} style={{ color: "var(--secondary)" }} />
              <span>Skills & Interest Areas</span>
            </h2>

            {/* Existing Skills List */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
              {profile.skills.map(skill => (
                <span 
                  key={skill} 
                  className="badge badge-primary" 
                  style={{ 
                    padding: "6px 12px", 
                    fontSize: "12px", 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: "6px" 
                  }}
                >
                  <span>{skill}</span>
                  <button 
                    onClick={() => handleRemoveSkill(skill)}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                    aria-label={`Remove skill ${skill}`}
                  >
                    <X size={12} style={{ color: "var(--text-muted)" }} />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} style={{ display: "flex", gap: "10px" }}>
              <input 
                type="text" 
                placeholder="Add skill (e.g. Docker)..." 
                className="glass-input" 
                style={{ flex: 1, padding: "8px 12px", fontSize: "13px" }}
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <button 
                type="submit" 
                className="btn btn-secondary" 
                style={{ padding: "8px 12px", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Plus size={16} />
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Projects & Experience */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* Projects Card */}
          <div className="glass-card" style={{ padding: "28px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={18} style={{ color: "var(--accent)" }} />
                <span>Featured Projects</span>
              </h2>
              <button 
                onClick={() => setShowAddProj(true)}
                className="btn btn-secondary"
                style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Plus size={14} />
                <span>Add Project</span>
              </button>
            </div>

            {/* Add Project Form (Inline) */}
            {showAddProj && (
              <form onSubmit={handleAddProject} className="glass-card" style={{ padding: "16px", marginBottom: "20px", background: "var(--bg-tertiary)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700" }}>New Project</h3>
                
                <div className="input-group">
                  <label className="input-label" htmlFor="projTitle" style={{ fontSize: "11px" }}>Project Title</label>
                  <input 
                    id="projTitle"
                    type="text" 
                    placeholder="e.g. Chat App" 
                    className="glass-input" 
                    style={{ padding: "8px 12px", fontSize: "13px" }}
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="projDesc" style={{ fontSize: "11px" }}>Description</label>
                  <input 
                    id="projDesc"
                    type="text" 
                    placeholder="Brief project details..." 
                    className="glass-input" 
                    style={{ padding: "8px 12px", fontSize: "13px" }}
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="projTech" style={{ fontSize: "11px" }}>Tech Stack</label>
                  <input 
                    id="projTech"
                    type="text" 
                    placeholder="e.g. React, Express, MongoDB" 
                    className="glass-input" 
                    style={{ padding: "8px 12px", fontSize: "13px" }}
                    value={newProjTech}
                    onChange={(e) => setNewProjTech(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
                  <button type="button" onClick={() => setShowAddProj(false)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                    Save Project
                  </button>
                </div>
              </form>
            )}

            {/* Projects List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {profile.projects.map(proj => (
                <div key={proj.id} style={{ borderLeft: "3px solid var(--accent)", paddingLeft: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: "700" }}>{proj.title}</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{proj.description}</p>
                  <div>
                    <span className="badge badge-primary" style={{ fontSize: "10px", background: "rgba(20, 184, 166, 0.08)", color: "var(--accent)", border: "1px solid rgba(20, 184, 166, 0.2)" }}>
                      {proj.tech}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Timeline Card */}
          <div className="glass-card" style={{ padding: "28px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <Briefcase size={18} style={{ color: "var(--primary)" }} />
                <span>Experience / Activities</span>
              </h2>
              <button 
                onClick={() => setShowAddExp(true)}
                className="btn btn-secondary"
                style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Plus size={14} />
                <span>Add Info</span>
              </button>
            </div>

            {/* Add Experience Form */}
            {showAddExp && (
              <form onSubmit={handleAddExperience} className="glass-card" style={{ padding: "16px", marginBottom: "20px", background: "var(--bg-tertiary)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700" }}>New Experience</h3>
                
                <div className="input-group">
                  <label className="input-label" htmlFor="expRole" style={{ fontSize: "11px" }}>Role / Title</label>
                  <input 
                    id="expRole"
                    type="text" 
                    placeholder="e.g. Intern Developer" 
                    className="glass-input" 
                    style={{ padding: "8px 12px", fontSize: "13px" }}
                    value={newExpRole}
                    onChange={(e) => setNewExpRole(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="expOrg" style={{ fontSize: "11px" }}>Organization</label>
                  <input 
                    id="expOrg"
                    type="text" 
                    placeholder="e.g. Open Source Club" 
                    className="glass-input" 
                    style={{ padding: "8px 12px", fontSize: "13px" }}
                    value={newExpOrg}
                    onChange={(e) => setNewExpOrg(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="expDur" style={{ fontSize: "11px" }}>Duration</label>
                  <input 
                    id="expDur"
                    type="text" 
                    placeholder="e.g. Summer 2025" 
                    className="glass-input" 
                    style={{ padding: "8px 12px", fontSize: "13px" }}
                    value={newExpDur}
                    onChange={(e) => setNewExpDur(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
                  <button type="button" onClick={() => setShowAddExp(false)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                    Save Info
                  </button>
                </div>
              </form>
            )}

            {/* Experience List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {profile.experience.map(exp => (
                <div key={exp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderLeft: "3px solid var(--primary)", paddingLeft: "14px" }}>
                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: "700" }}>{exp.role}</h4>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>{exp.organization}</p>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{exp.duration}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Edit Profile Modal backdrop */}
      {isEditingInfo && (
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
            position: "relative",
            textAlign: "left"
          }}>
            {/* Close */}
            <button 
              onClick={() => setIsEditingInfo(false)}
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

            <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <User size={20} style={{ color: "var(--primary)" }} />
              <span>Edit Profile Details</span>
            </h3>

            <form onSubmit={handleSaveInfo} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="input-group">
                <label className="input-label" htmlFor="editNameInput">Full Name</label>
                <input 
                  id="editNameInput"
                  type="text" 
                  className="glass-input" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="editTitleInput">Headline / Major</label>
                <input 
                  id="editTitleInput"
                  type="text" 
                  className="glass-input" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="editCollegeInput">College / Institution</label>
                <input 
                  id="editCollegeInput"
                  type="text" 
                  className="glass-input" 
                  value={editCollege}
                  onChange={(e) => setEditCollege(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="editLocInput">Location</label>
                <input 
                  id="editLocInput"
                  type="text" 
                  className="glass-input" 
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsEditingInfo(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Select Avatar Modal Backdrop */}
      {showAvatarModal && (
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
            maxWidth: "420px",
            padding: "32px",
            position: "relative",
            textAlign: "center"
          }}>
            <button 
              onClick={() => setShowAvatarModal(false)}
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

            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px" }}>Choose Avatar</h3>

            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
              {AVATAR_OPTIONS.map((url, i) => (
                <img 
                  key={i}
                  src={url}
                  alt={`Option ${i+1}`}
                  onClick={() => selectAvatar(url)}
                  className="avatar"
                  style={{
                    width: "64px",
                    height: "64px",
                    cursor: "pointer",
                    border: profile.avatar === url ? "3px solid var(--primary)" : "1px solid var(--card-border)",
                    transition: "transform var(--transition-fast)"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
              ))}
            </div>

            <button onClick={() => setShowAvatarModal(false)} className="btn btn-secondary" style={{ width: "100%" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;