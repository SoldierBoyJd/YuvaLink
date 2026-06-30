import { useState, useEffect, useRef, useCallback } from "react";
import { Search, User, BookOpen, Loader, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function GlobalSearch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  // Search Supabase profiles — fetch all, filter client-side for full skill support
  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); setOpen(false); return; }

    const search = async () => {
      setLoading(true);
      const exclude = user?.id ?? "00000000-0000-0000-0000-000000000000";
      const q = debouncedQuery.trim().toLowerCase();

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, title, department, avatar_url, skills");

      if (error) { setLoading(false); return; }

      const filtered = (data || []).filter(p => {
        const name = (p.full_name || "").toLowerCase();
        const dept = (p.department || "").toLowerCase();
        const title = (p.title || "").toLowerCase();
        const skills = (p.skills || []).map(s => s.toLowerCase());
        return (
          name.includes(q) ||
          dept.includes(q) ||
          title.includes(q) ||
          skills.some(s => s.includes(q))
        );
      });

      const withMeta = filtered.map(p => ({
        ...p,
        isMe: p.id === exclude,
        skillMatch: (p.skills || []).find(s => s.toLowerCase().includes(q)) || null,
      }));

      // Sort: own profile last
      withMeta.sort((a, b) => (a.isMe ? 1 : 0) - (b.isMe ? 1 : 0));

      setResults(withMeta.slice(0, 8));
      setOpen(true);
      setLoading(false);
    };

    search();
  }, [debouncedQuery, user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(!!query);
      }
      if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [query]);

  const handleSelect = (peer) => {
    setQuery("");
    setOpen(false);
    if (peer.isMe) navigate("/profile");
    else navigate("/discover");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    navigate(`/discover?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  return (
    <div ref={wrapperRef} className="search-wrapper" style={{ position: "relative" }}>
      <form onSubmit={handleSubmit} style={{ display: "contents" }}>
        <Search size={18} className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search peers, skills, hackathons..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults([]); setOpen(false); inputRef.current?.focus(); }}
            style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: 0 }}
            aria-label="Clear search"
          >
            {loading ? <Loader size={14} className="animate-spin" /> : <X size={14} />}
          </button>
        )}
      </form>

      {/* Results dropdown */}
      {open && (
        <div
          className="glass-card animate-fade-in"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 300,
            background: "var(--bg-tertiary)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
            maxHeight: "380px",
            overflowY: "auto",
          }}
        >
          {results.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No results for "{debouncedQuery}"
            </div>
          ) : (
            <>
              <div style={{ padding: "8px 12px 4px", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                People
              </div>
              {results.map(peer => (
                <div
                  key={peer.id}
                  onClick={() => handleSelect(peer)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderTop: "1px solid var(--card-border)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <img
                    src={peer.avatar_url || FALLBACK_AVATAR}
                    alt={peer.full_name}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {peer.full_name || "Unknown"}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                      <BookOpen size={10} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {peer.title || peer.department || "Student"}
                      </span>
                    </div>
                  </div>
                  {peer.skillMatch && (
                    <span className="badge badge-primary" style={{ fontSize: "10px", padding: "3px 8px", flexShrink: 0 }}>
                      {peer.skillMatch}
                    </span>
                  )}
                  {peer.isMe && (
                    <span style={{ fontSize: "10px", padding: "3px 8px", flexShrink: 0, color: "var(--text-muted)", fontWeight: "600" }}>
                      You
                    </span>
                  )}
                </div>
              ))}
              <div
                onClick={() => { navigate(`/discover?q=${encodeURIComponent(query)}`); setQuery(""); setOpen(false); }}
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "var(--primary)",
                  fontWeight: "600",
                  cursor: "pointer",
                  textAlign: "center",
                  borderTop: "1px solid var(--card-border)",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                See all results for "{query}" →
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
