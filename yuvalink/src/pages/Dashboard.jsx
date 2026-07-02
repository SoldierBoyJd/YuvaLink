import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Send, Heart, MessageSquare, Share2, Image, Code,
  Lightbulb, HelpCircle, Clock, Sparkles, Loader, X, Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../config/supabase";

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face";

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const TAGS = [
  { name: "Idea",           icon: <Lightbulb size={12} /> },
  { name: "Project Partner",icon: <Code size={12} /> },
  { name: "Code Help",      icon: <HelpCircle size={12} /> },
  { name: "Achievement",    icon: <Sparkles size={12} /> },
];

function Dashboard() {
  const { user, profile } = useAuth();
  const [posts, setPosts]               = useState([]);
  const [feedLoading, setFeedLoading]   = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedTag, setSelectedTag]   = useState("Idea");
  const [posting, setPosting]           = useState(false);
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [commentInputs, setCommentInputs]   = useState({});
  const [expandedPostIds, setExpandedPostIds] = useState([]);
  const [commentsMap, setCommentsMap]   = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const fileInputRef = useRef(null);

  // ── Fetch feed ──────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    setFeedLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id, content, tag, image_url, likes_count, created_at, user_id,
        profiles!posts_user_id_fkey ( full_name, title, department, avatar_url )
      `)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) { console.error("Failed to load feed:", error); setFeedLoading(false); return; }

    // Fetch real like counts + current user's liked posts in parallel
    const postIds = (data || []).map(p => p.id);
    const [likesCountResult, userLikesResult] = await Promise.all([
      postIds.length > 0
        ? supabase.from("post_likes").select("post_id").in("post_id", postIds)
        : { data: [] },
      user && postIds.length > 0
        ? supabase.from("post_likes").select("post_id").in("post_id", postIds).eq("user_id", user.id)
        : { data: [] },
    ]);

    // Build real count map
    const countMap = {};
    (likesCountResult.data || []).forEach(l => {
      countMap[l.post_id] = (countMap[l.post_id] || 0) + 1;
    });

    const likedSet = new Set((userLikesResult.data || []).map(l => l.post_id));

    setPosts((data || []).map(p => ({
      ...p,
      liked: likedSet.has(p.id),
      likes_count: countMap[p.id] ?? 0,  // real count from post_likes, never stale
      author: {
        name:   p.profiles?.full_name  || "Unknown",
        title:  p.profiles?.title      || p.profiles?.department || "Student",
        avatar: p.profiles?.avatar_url || FALLBACK_AVATAR,
      },
    })));
    setFeedLoading(false); 
     
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!cancelled) await fetchPosts();
    };
    load();
    return () => { cancelled = true; };
  }, [fetchPosts]);

  // ── Realtime: new posts appear instantly ─────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("realtime:posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" },
        async (payload) => {
          // Fetch the full post with profile join
          const { data } = await supabase
            .from("posts")
            .select(`id, content, tag, image_url, likes_count, created_at, user_id,
                     profiles!posts_user_id_fkey ( full_name, title, department, avatar_url )`)
            .eq("id", payload.new.id)
            .single();
          if (data && data.user_id !== user.id) { // own posts already added optimistically
            setPosts(prev => [{
              ...data,
              liked: false,
              author: {
                name:   data.profiles?.full_name  || "Unknown",
                title:  data.profiles?.title      || data.profiles?.department || "Student",
                avatar: data.profiles?.avatar_url || FALLBACK_AVATAR,
              }
            }, ...prev]);
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user]);

  // ── Realtime: like counts update live from other users ───────────────────────
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("realtime:post_likes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "post_likes" },
        async (payload) => {
          const postId = payload.new.post_id;
          const { count } = await supabase
            .from("post_likes")
            .select("post_id", { count: "exact", head: true })
            .eq("post_id", postId);
          setPosts(prev => prev.map(p =>
            p.id === postId
              ? { ...p, likes_count: count ?? p.likes_count, liked: p.liked || payload.new.user_id === user.id }
              : p
          ));
        }
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "post_likes" },
        async (payload) => {
          const postId = payload.old.post_id;
          const { count } = await supabase
            .from("post_likes")
            .select("post_id", { count: "exact", head: true })
            .eq("post_id", postId);
          setPosts(prev => prev.map(p =>
            p.id === postId
              ? { ...p, likes_count: count ?? Math.max(0, p.likes_count - 1), liked: p.liked && payload.old.user_id !== user.id }
              : p
          ));
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user]);

  // ── Image picker ─────────────────────────────────────────────────────────────
  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Upload image to Supabase Storage ─────────────────────────────────────────
  const uploadImage = async (file) => {
    const ext  = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    return data.publicUrl;
  };

  // ── Create post ──────────────────────────────────────────────────────────────
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() && !imageFile) {
      toast.error("Write something or attach an image!");
      return;
    }
    if (!user) return;
    setPosting(true);
    try {
      let image_url = null;
      if (imageFile) image_url = await uploadImage(imageFile);

      const { data, error } = await supabase
        .from("posts")
        .insert({ user_id: user.id, content: newPostContent, tag: selectedTag, image_url })
        .select(`id, content, tag, image_url, likes_count, created_at, user_id,
                 profiles!posts_user_id_fkey ( full_name, title, department, avatar_url )`)
        .single();

      if (error) throw error;

      setPosts(prev => [{
        ...data,
        liked: false,
        author: {
          name:   data.profiles?.full_name   || profile?.full_name || "You",
          title:  data.profiles?.title       || data.profiles?.department || "Student",
          avatar: data.profiles?.avatar_url  || profile?.avatar_url || FALLBACK_AVATAR,
        },
      }, ...prev]);

      setNewPostContent("");
      clearImage();
      toast.success("Post published!");
    } catch (err) {
      toast.error("Failed to post: " + err.message);
    }
    setPosting(false);
  };

  // ── Like / unlike ────────────────────────────────────────────────────────────
  const handleLike = async (postId) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic toggle immediately
    const wasLiked = post.liked;
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked: !wasLiked, likes_count: Math.max(0, wasLiked ? p.likes_count - 1 : p.likes_count + 1) }
        : p
    ));

    // Atomic toggle via DB function — returns the real count
    const { data: realCount, error } = await supabase.rpc("toggle_like", {
      p_post_id: postId,
      p_user_id: user.id,
    });

    if (error) {
      // Revert optimistic update on error
      console.error("Like error:", error);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, liked: wasLiked, likes_count: post.likes_count } : p
      ));
      return;
    }

    // Sync with the real count from DB (never negative)
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked: !wasLiked, likes_count: Math.max(0, realCount ?? p.likes_count) }
        : p
    ));
  };

  // ── Delete own post ──────────────────────────────────────────────────────────
  const handleDeletePost = async (postId) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success("Post deleted");
    }
  };

  // ── Load comments for a post ─────────────────────────────────────────────────
  const loadComments = async (postId) => {
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    const { data } = await supabase
      .from("comments")
      .select("id, content, created_at, user_id, profiles!comments_user_id_fkey ( full_name, avatar_url )")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setCommentsMap(prev => ({ ...prev, [postId]: data || [] }));
    setLoadingComments(prev => ({ ...prev, [postId]: false }));
  };

  const toggleComments = (postId) => {
    const isExpanded = expandedPostIds.includes(postId);
    if (isExpanded) {
      setExpandedPostIds(prev => prev.filter(id => id !== postId));
    } else {
      setExpandedPostIds(prev => [...prev, postId]);
      if (!commentsMap[postId]) loadComments(postId);
    }
  };

  // ── Submit comment ───────────────────────────────────────────────────────────
  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    const text = (commentInputs[postId] || "").trim();
    if (!text || !user) return;
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: user.id, content: text })
      .select("id, content, created_at, user_id, profiles!comments_user_id_fkey ( full_name, avatar_url )")
      .single();
    if (!error && data) {
      setCommentsMap(prev => ({ ...prev, [postId]: [...(prev[postId] || []), data] }));
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    }
  };

  // ── Delete comment ────────────────────────────────────────────────────────────
  const handleDeleteComment = async (postId, commentId) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (!error) {
      setCommentsMap(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
      }));
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="feed-grid animate-fade-in">

      {/* ── Create Post ── */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <form onSubmit={handleCreatePost} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <img src={profile?.avatar_url || FALLBACK_AVATAR} alt="You" className="avatar" style={{ width: "42px", height: "42px" }} />
            <textarea
              placeholder="What project are you building? Looking for collaborators?"
              className="glass-input"
              style={{ width: "100%", minHeight: "80px", resize: "none", border: "none", background: "rgba(255,255,255,0.01)", padding: "8px 0" }}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", maxHeight: "200px" }}>
              <img src={imagePreview} alt="preview" style={{ width: "100%", objectFit: "cover", maxHeight: "200px" }} />
              <button type="button" onClick={clearImage} style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", color: "#fff", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={14} />
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--card-border)", paddingTop: "16px", gap: "12px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {TAGS.map(tag => (
                <button key={tag.name} type="button" onClick={() => setSelectedTag(tag.name)} className="badge"
                  style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", border: "1px solid var(--card-border)", background: selectedTag === tag.name ? "var(--primary-glow)" : "transparent", color: selectedTag === tag.name ? "var(--primary)" : "var(--text-secondary)", transition: "all var(--transition-fast)" }}>
                  {tag.icon}<span>{tag.name}</span>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {/* Hidden file input */}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImagePick} />
              <button type="button" className="btn-icon" style={{ width: "38px", height: "38px", color: imageFile ? "var(--primary)" : undefined }} onClick={() => fileInputRef.current?.click()} aria-label="Add image">
                <Image size={16} />
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "14px", height: "38px" }} disabled={posting}>
                {posting ? <Loader size={14} className="animate-spin" /> : <><span>Post</span><Send size={14} /></>}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Feed ── */}
      {feedLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", gap: "10px", color: "var(--text-secondary)" }}>
          <Loader size={20} className="animate-spin" /><span>Loading feed...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>No posts yet. Be the first to share something!</p>
        </div>
      ) : posts.map(post => (
        <div key={post.id} className="glass-card animate-fade-in" style={{ padding: "24px" }}>

          {/* Post Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <img src={post.author.avatar} alt={post.author.name} className="avatar" style={{ width: "42px", height: "42px" }} />
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: "700" }}>{post.author.name}</h4>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px", lineHeight: "1.4", textAlign: "left" }}>{post.author.title}</p>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                  <Clock size={10} /><span>{timeAgo(post.created_at)}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={`badge ${post.tag === "Achievement" ? "badge-secondary" : post.tag === "Code Help" ? "badge-danger" : "badge-primary"}`} style={{ padding: "6px 12px" }}>
                {post.tag}
              </span>
              {post.user_id === user?.id && (
                <button onClick={() => handleDeletePost(post.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: "4px" }} aria-label="Delete post">
                  <Trash2 size={14} style={{ color: "var(--danger)" }} />
                </button>
              )}
            </div>
          </div>

          {/* Post Content */}
          {post.content && (
            <p style={{ fontSize: "15px", color: "var(--text-primary)", lineHeight: "1.6", marginBottom: "16px", textAlign: "left" }}>
              {post.content}
            </p>
          )}

          {/* Post Image */}
          {post.image_url && (
            <div style={{ marginBottom: "16px", borderRadius: "10px", overflow: "hidden" }}>
              <img src={post.image_url} alt="post attachment" style={{ width: "100%", maxHeight: "400px", objectFit: "cover", display: "block" }} />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--card-border)", fontSize: "13px", color: "var(--text-secondary)" }}>
            <button onClick={() => handleLike(post.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: post.liked ? "var(--danger)" : "var(--text-secondary)", fontWeight: "600" }}>
              <Heart size={16} fill={post.liked ? "var(--danger)" : "transparent"} />
              <span>{post.likes_count} Likes</span>
            </button>
            <div style={{ display: "flex", gap: "16px" }}>
              <button onClick={() => toggleComments(post.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontWeight: expandedPostIds.includes(post.id) ? "700" : "500" }}>
                <MessageSquare size={16} style={{ color: expandedPostIds.includes(post.id) ? "var(--primary)" : "inherit" }} />
                <span>{commentsMap[post.id]?.length ?? ""} Comments</span>
              </button>
              <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/dashboard#post-${post.id}`); toast.success("Link copied!"); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                <Share2 size={16} /><span>Share</span>
              </button>
            </div>
          </div>

          {/* Comments */}
          {expandedPostIds.includes(post.id) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              {loadingComments[post.id] ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "12px" }}><Loader size={16} className="animate-spin" style={{ color: "var(--text-muted)" }} /></div>
              ) : (commentsMap[post.id] || []).map((comment) => (
                <div key={comment.id} style={{ display: "flex", gap: "10px", background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", textAlign: "left", alignItems: "flex-start" }}>
                  <img src={comment.profiles?.avatar_url || FALLBACK_AVATAR} alt={comment.profiles?.full_name} style={{ width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0, objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{comment.profiles?.full_name || "User"}: </span>
                    <span style={{ color: "var(--text-secondary)" }}>{comment.content}</span>
                  </div>
                  {comment.user_id === user?.id && (
                    <button onClick={() => handleDeleteComment(post.id, comment.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex", flexShrink: 0 }} aria-label="Delete comment">
                      <Trash2 size={12} style={{ color: "var(--danger)" }} />
                    </button>
                  )}
                </div>
              ))}
              <form onSubmit={(e) => handleCommentSubmit(post.id, e)} style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <input type="text" placeholder="Write a comment..." className="glass-input" style={{ width: "100%", padding: "8px 12px", fontSize: "13px", borderRadius: "8px" }}
                  value={commentInputs[post.id] || ""} onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))} />
                <button type="submit" className="btn btn-secondary" style={{ padding: "8px 12px", fontSize: "13px", borderRadius: "8px" }}>Reply</button>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
