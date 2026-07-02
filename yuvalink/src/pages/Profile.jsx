import { useState, useEffect, useRef } from "react";
import { 
  User, MapPin, BookOpen, Plus, X, Edit3, Check, Globe, Briefcase, Code, Sparkles, Camera, Loader, Upload
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop";
const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face";

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
];

// Normalize a social URL — accepts full URL or just username/path, returns full https URL
const normalizeUrl = (value, baseUrl) => {
  if (!value) return "";
  const v = value.trim();
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `${baseUrl}/${v.replace(/^\/+/, "")}`;
};

const Github = ({ size = 20, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 20, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

function Profile() {
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarFileInputRef = useRef(null);

  // Local editable state — initialised from authProfile once loaded
  const [profileData, setProfileData] = useState(null);
  const [editGithub, setEditGithub] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editWebsite, setEditWebsite] = useState("");

  // UI state
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Form states
  const [editName, setEditName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editCollege, setEditCollege] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editBio, setEditBio] = useState("");

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

  // Track whether the profile has been loaded at least once
  const [initialized, setInitialized] = useState(false);

  // Sync local state from authProfile.
  // Runs on mount (profileData is null) AND whenever authProfile changes after a
  // refreshProfile() call (e.g. after saving name/avatar).
  // For skills/projects/experience/bio we update local state directly AND write to DB,
  // so there is no stale-read risk — the DB always has the latest value.
  useEffect(() => {
    if (authProfile) {
      const p = {
        name: authProfile.full_name || "",
        title: authProfile.title || authProfile.department || "",
        college: authProfile.department || "",
        location: authProfile.location || "",
        bio: authProfile.bio || "",
        avatar: authProfile.avatar_url || FALLBACK_AVATAR,
        cover: authProfile.cover_url || FALLBACK_COVER,
        github: authProfile.github || "",
        linkedin: authProfile.linkedin || "",
        website: authProfile.website || "",
        skills: Array.isArray(authProfile.skills) ? authProfile.skills : [],
        projects: Array.isArray(authProfile.projects) ? authProfile.projects : [],
        experience: Array.isArray(authProfile.experience) ? authProfile.experience : [],
      };
      setProfileData(p);
      // Only reset edit form fields on first load — not after every DB refresh,
      // so in-progress modal edits are not interrupted.
      if (!initialized) {
        setEditName(p.name);
        setEditTitle(p.title);
        setEditCollege(p.college);
        setEditLocation(p.location);
        setEditBio(p.bio);
        setEditGithub(p.github);
        setEditLinkedin(p.linkedin);
        setEditWebsite(p.website);
        setInitialized(true);
      }
    }
  }, [authProfile]); // re-sync whenever authProfile updates (navigation or refreshProfile)

  // Helper: persist a partial update to Supabase then re-fetch the profile so
  // AuthContext (and this component on next mount) reflects the saved data.
  const persistUpdate = async (updates, refreshContext = true) => {
    if (!user) return false;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Save failed: " + error.message);
      console.error("Supabase update error:", error);
      return false;
    }
    if (refreshContext) await refreshProfile();
    return true;
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editTitle.trim()) { toast.error("Name and title are required!"); return; }
    const ok = await persistUpdate({
      full_name: editName,
      title: editTitle,
      department: editCollege,
      location: editLocation,
      github: editGithub,
      linkedin: editLinkedin,
      website: editWebsite,
    }, true); // refresh context so sidebar name/avatar updates
    if (ok) {
      setProfileData(prev => ({ ...prev, name: editName, title: editTitle, college: editCollege, location: editLocation, github: editGithub, linkedin: editLinkedin, website: editWebsite }));
      setIsEditingInfo(false);
      toast.success("Profile updated!");
    }
  };

  const handleSaveBio = async () => {
    const ok = await persistUpdate({ bio: editBio });
    if (ok) {
      setProfileData(prev => ({ ...prev, bio: editBio }));
      setIsEditingBio(false);
      toast.success("Bio updated!");
    }
  };

  const selectAvatar = async (url) => {
    const ok = await persistUpdate({ avatar_url: url }); // refresh context so topbar avatar updates
    if (ok) {
      setProfileData(prev => ({ ...prev, avatar: url }));
      setShowAvatarModal(false);
      toast.success("Avatar updated!");
    }
  };

  const handleAvatarFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 3 * 1024 * 1024) { toast.error("Photo must be under 3 MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // Bust cache by appending timestamp
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      const ok = await persistUpdate({ avatar_url: publicUrl });
      if (ok) {
        setProfileData(prev => ({ ...prev, avatar: publicUrl }));
        setShowAvatarModal(false);
        toast.success("Profile photo updated!");
      }
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploadingAvatar(false);
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = "";
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const currentSkills = profileData?.skills || [];
    if (currentSkills.includes(newSkill.trim())) { toast.error("Skill already exists!"); return; }
    const updated = [...currentSkills, newSkill.trim()];
    const ok = await persistUpdate({ skills: updated });
    if (ok) {
      setProfileData(prev => ({ ...prev, skills: updated }));
      setNewSkill("");
      toast.success("Skill added!");
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updated = (profileData?.skills || []).filter(s => s !== skillToRemove);
    const ok = await persistUpdate({ skills: updated });
    if (ok) {
      setProfileData(prev => ({ ...prev, skills: updated }));
      toast.success("Skill removed");
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProjTitle.trim() || !newProjDesc.trim()) { toast.error("Title and description required!"); return; }
    const updated = [...(profileData?.projects || []), { id: Date.now(), title: newProjTitle, description: newProjDesc, tech: newProjTech || "General Stack" }];
    const ok = await persistUpdate({ projects: updated });
    if (ok) {
      setProfileData(prev => ({ ...prev, projects: updated }));
      setNewProjTitle(""); setNewProjDesc(""); setNewProjTech(""); setShowAddProj(false);
      toast.success("Project added!");
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!newExpRole.trim() || !newExpOrg.trim() || !newExpDur.trim()) { toast.error("All fields required!"); return; }
    const updated = [...(profileData?.experience || []), { id: Date.now(), role: newExpRole, organization: newExpOrg, duration: newExpDur }];
    const ok = await persistUpdate({ experience: updated });
    if (ok) {
      setProfileData(prev => ({ ...prev, experience: updated }));
      setNewExpRole(""); setNewExpOrg(""); setNewExpDur(""); setShowAddExp(false);
      toast.success("Experience added!");
    }
  };

  if (!profileData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-secondary)", gap: "10px" }}>
        <Loader size={20} className="animate-spin" />
        <span>Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {saving && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "var(--bg-tertiary)", border: "1px solid var(--card-border)", borderRadius: "10px", padding: "10px 16px", fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px", zIndex: 300 }}>
          <Loader size={14} className="animate-spin" /> Saving...
        </div>
      )}

      {/* Banner & Basic Info */}
      <div className="glass-card" style={{ overflow: "hidden", position: "relative" }}>
        <div style={{ height: "180px", position: "relative" }}>
          <img src={profileData.cover} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <button onClick={() => toast.success("Cover upload coming soon!")} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", padding: "6px 12px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <Camera size={14} /><span>Change Cover</span>
          </button>
        </div>

        <div style={{ padding: "0 28px 28px", position: "relative", textAlign: "left" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", marginTop: "-50px", marginBottom: "16px", gap: "16px" }}>
            <div style={{ position: "relative" }}>
              <img src={profileData.avatar} alt={profileData.name} className="avatar avatar-ring" style={{ width: "110px", height: "110px", background: "var(--bg-secondary)", zIndex: 2, position: "relative" }} />
              <button onClick={() => setShowAvatarModal(true)} style={{ position: "absolute", bottom: "4px", right: "4px", background: "var(--primary)", border: "none", borderRadius: "50%", color: "#fff", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }} aria-label="Change Avatar">
                <Camera size={13} />
              </button>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <a href={profileData.github ? normalizeUrl(profileData.github, "https://github.com") : "#"}
                target={profileData.github ? "_blank" : undefined} rel="noopener noreferrer"
                className="btn btn-secondary" style={{ padding: "8px 12px", fontSize: "13px", opacity: profileData.github ? 1 : 0.4 }}
                title={profileData.github || "Add GitHub in Edit Profile"}><Github size={15} /></a>
              <a href={profileData.linkedin ? normalizeUrl(profileData.linkedin, "https://linkedin.com/in") : "#"}
                target={profileData.linkedin ? "_blank" : undefined} rel="noopener noreferrer"
                className="btn btn-secondary" style={{ padding: "8px 12px", fontSize: "13px", opacity: profileData.linkedin ? 1 : 0.4 }}
                title={profileData.linkedin || "Add LinkedIn in Edit Profile"}><Linkedin size={15} /></a>
              <a href={profileData.website ? normalizeUrl(profileData.website, "https://") : "#"}
                target={profileData.website ? "_blank" : undefined} rel="noopener noreferrer"
                className="btn btn-secondary" style={{ padding: "8px 12px", fontSize: "13px", opacity: profileData.website ? 1 : 0.4 }}
                title={profileData.website || "Add website in Edit Profile"}><Globe size={15} /></a>
              <button onClick={() => setIsEditingInfo(true)} className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "13px", gap: "6px" }}>
                <Edit3 size={14} /><span>Edit Profile</span>
              </button>
            </div>
          </div>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800" }}>{profileData.name || "—"}</h1>
            <p style={{ fontSize: "15px", color: "var(--primary)", fontWeight: "600", marginTop: "2px" }}>{profileData.title || "Student"}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "12px", fontSize: "13px", color: "var(--text-secondary)" }}>
              {profileData.college && <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><BookOpen size={14} style={{ color: "var(--text-muted)" }} /><span>{profileData.college}</span></div>}
              {profileData.location && <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={14} style={{ color: "var(--text-muted)" }} /><span>{profileData.location}</span></div>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>

        {/* Left: Bio & Skills */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Bio */}
          <div className="glass-card" style={{ padding: "28px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}><User size={18} style={{ color: "var(--primary)" }} /><span>About Me</span></h2>
              {!isEditingBio && <button onClick={() => { setEditBio(profileData.bio); setIsEditingBio(true); }} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: "600" }}><Edit3 size={14} /><span>Edit</span></button>}
            </div>
            {isEditingBio ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <textarea className="glass-input" style={{ width: "100%", minHeight: "100px", resize: "vertical" }} value={editBio} onChange={(e) => setEditBio(e.target.value)} />
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button onClick={() => setIsEditingBio(false)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }}>Cancel</button>
                  <button onClick={handleSaveBio} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "13px", gap: "4px" }}><Check size={14} /><span>Save</span></button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "14px", color: profileData.bio ? "var(--text-secondary)" : "var(--text-muted)", lineHeight: "1.6", fontStyle: profileData.bio ? "normal" : "italic" }}>
                {profileData.bio || "No bio yet. Click Edit to add one."}
              </p>
            )}
          </div>

          {/* Skills */}
          <div className="glass-card" style={{ padding: "28px", textAlign: "left" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Code size={18} style={{ color: "var(--secondary)" }} /><span>Skills & Interest Areas</span></h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
              {(profileData.skills || []).length === 0 && <p style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>No skills added yet.</p>}
              {(profileData.skills || []).map(skill => (
                <span key={skill} className="badge badge-primary" style={{ padding: "6px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>{skill}</span>
                  <button onClick={() => handleRemoveSkill(skill)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }} aria-label={`Remove ${skill}`}><X size={12} style={{ color: "var(--text-muted)" }} /></button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddSkill} style={{ display: "flex", gap: "10px" }}>
              <input type="text" placeholder="Add skill (e.g. Docker)..." className="glass-input" style={{ flex: 1, padding: "8px 12px", fontSize: "13px" }} value={newSkill} onChange={(e) => setNewSkill(e.target.value)} />
              <button type="submit" className="btn btn-secondary" style={{ padding: "8px 12px", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={16} /></button>
            </form>
          </div>
        </div>

        {/* Right: Projects & Experience */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Projects */}
          <div className="glass-card" style={{ padding: "28px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}><Sparkles size={18} style={{ color: "var(--accent)" }} /><span>Featured Projects</span></h2>
              <button onClick={() => setShowAddProj(true)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}><Plus size={14} /><span>Add Project</span></button>
            </div>
            {showAddProj && (
              <form onSubmit={handleAddProject} className="glass-card" style={{ padding: "16px", marginBottom: "20px", background: "var(--bg-tertiary)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700" }}>New Project</h3>
                <input type="text" placeholder="Project title" className="glass-input" style={{ padding: "8px 12px", fontSize: "13px" }} value={newProjTitle} onChange={(e) => setNewProjTitle(e.target.value)} required />
                <input type="text" placeholder="Brief description" className="glass-input" style={{ padding: "8px 12px", fontSize: "13px" }} value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)} required />
                <input type="text" placeholder="Tech stack (e.g. React, Node)" className="glass-input" style={{ padding: "8px 12px", fontSize: "13px" }} value={newProjTech} onChange={(e) => setNewProjTech(e.target.value)} />
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowAddProj(false)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }}>Save Project</button>
                </div>
              </form>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {(profileData.projects || []).length === 0 && <p style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>No projects yet. Add your first one!</p>}
              {(profileData.projects || []).map(proj => (
                <div key={proj.id} style={{ borderLeft: "3px solid var(--accent)", paddingLeft: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: "700" }}>{proj.title}</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{proj.description}</p>
                  <span className="badge badge-primary" style={{ fontSize: "10px", background: "rgba(20,184,166,0.08)", color: "var(--accent)", border: "1px solid rgba(20,184,166,0.2)", width: "fit-content" }}>{proj.tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="glass-card" style={{ padding: "28px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}><Briefcase size={18} style={{ color: "var(--primary)" }} /><span>Experience / Activities</span></h2>
              <button onClick={() => setShowAddExp(true)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}><Plus size={14} /><span>Add Info</span></button>
            </div>
            {showAddExp && (
              <form onSubmit={handleAddExperience} className="glass-card" style={{ padding: "16px", marginBottom: "20px", background: "var(--bg-tertiary)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700" }}>New Experience</h3>
                <input type="text" placeholder="Role / Title" className="glass-input" style={{ padding: "8px 12px", fontSize: "13px" }} value={newExpRole} onChange={(e) => setNewExpRole(e.target.value)} required />
                <input type="text" placeholder="Organization" className="glass-input" style={{ padding: "8px 12px", fontSize: "13px" }} value={newExpOrg} onChange={(e) => setNewExpOrg(e.target.value)} required />
                <input type="text" placeholder="Duration (e.g. Summer 2025)" className="glass-input" style={{ padding: "8px 12px", fontSize: "13px" }} value={newExpDur} onChange={(e) => setNewExpDur(e.target.value)} required />
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowAddExp(false)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }}>Save Info</button>
                </div>
              </form>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {(profileData.experience || []).length === 0 && <p style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>No experience added yet.</p>}
              {(profileData.experience || []).map(exp => (
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

      {/* Edit Info Modal */}
      {isEditingInfo && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "16px" }} className="animate-fade-in">
          <div className="glass-card" style={{ width: "100%", maxWidth: "480px", padding: "32px", position: "relative", textAlign: "left" }}>
            <button onClick={() => setIsEditingInfo(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Close"><X size={20} /></button>
            <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}><User size={20} style={{ color: "var(--primary)" }} /><span>Edit Profile Details</span></h3>
            <form onSubmit={handleSaveInfo} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="input-group"><label className="input-label">Full Name</label><input type="text" className="glass-input" value={editName} onChange={(e) => setEditName(e.target.value)} required /></div>
              <div className="input-group"><label className="input-label">Headline / Major</label><input type="text" className="glass-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required /></div>
              <div className="input-group"><label className="input-label">College / Institution</label><input type="text" className="glass-input" value={editCollege} onChange={(e) => setEditCollege(e.target.value)} /></div>
              <div className="input-group"><label className="input-label">Location</label><input type="text" className="glass-input" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} /></div>
              <div className="input-group"><label className="input-label">GitHub URL or Username</label><input type="text" className="glass-input" placeholder="https://github.com/username or just username" value={editGithub} onChange={(e) => setEditGithub(e.target.value)} /></div>
              <div className="input-group"><label className="input-label">LinkedIn URL or Username</label><input type="text" className="glass-input" placeholder="https://linkedin.com/in/username or just username" value={editLinkedin} onChange={(e) => setEditLinkedin(e.target.value)} /></div>
              <div className="input-group"><label className="input-label">Website URL</label><input type="text" className="glass-input" placeholder="https://yoursite.dev" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} /></div>
              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsEditingInfo(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Avatar Picker Modal */}
      {showAvatarModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "16px" }} className="animate-fade-in">
          <div className="glass-card" style={{ width: "100%", maxWidth: "420px", padding: "32px", position: "relative", textAlign: "center" }}>
            <button onClick={() => setShowAvatarModal(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Close"><X size={20} /></button>
            <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>Choose Avatar</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>Upload your own photo or pick one below</p>

            {/* Upload custom photo */}
            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarFileUpload}
            />
            <button
              onClick={() => avatarFileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="btn btn-primary"
              style={{ width: "100%", padding: "10px", marginBottom: "20px", gap: "8px", justifyContent: "center" }}
            >
              {uploadingAvatar
                ? <><Loader size={15} className="animate-spin" /><span>Uploading...</span></>
                : <><Upload size={15} /><span>Upload Your Photo</span></>
              }
            </button>

            <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "16px", marginBottom: "12px" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px" }}>Or choose a preset avatar</p>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "14px" }}>
                {AVATAR_OPTIONS.map((url, i) => (
                  <img key={i} src={url} alt={`Avatar option ${i + 1}`} onClick={() => selectAvatar(url)}
                    className="avatar"
                    style={{ width: "72px", height: "72px", cursor: "pointer", border: profileData.avatar === url ? "3px solid var(--primary)" : "3px solid transparent", transition: "border-color 0.2s", borderRadius: "50%" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
