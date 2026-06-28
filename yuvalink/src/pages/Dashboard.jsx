import { useState } from "react";
import { 
  Send, 
  Heart, 
  MessageSquare, 
  Share2, 
  Image, 
  Code, 
  Lightbulb, 
  HelpCircle,
  Clock,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

const INITIAL_POSTS = [
  {
    id: 1,
    author: {
      name: "Sophia Martinez",
      title: "UI/UX Student at Creative College",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    content: "Just finalized the wireframes for our team's project on YuvaLink! Looking for a frontend developer who knows React + CSS Grid to co-build. DM me if interested! 🚀",
    tag: "Project Partner",
    likes: 18,
    comments: [
      { author: "Zara Chen", text: "Wow, wireframes look extremely neat! Sending you a request." },
      { author: "Marcus Johnson", text: "I'd love to help out with the React logic!" }
    ],
    timestamp: "2 hours ago",
    liked: false
  },
  {
    id: 2,
    author: {
      name: "Marcus Johnson",
      title: "ML Engineering Student at ScienceTech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    content: "Has anyone explored the new OpenAI API updates? I am writing a wrapper in Node.js for a student helper tool. Hit me up if you want to collaborate or check the repo out.",
    tag: "Code Help",
    likes: 8,
    comments: [],
    timestamp: "5 hours ago",
    liked: false
  },
  {
    id: 3,
    author: {
      name: "Dhruv Mehta",
      title: "Full Stack Developer at Delhi College of Eng.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
    },
    content: "Super thrilled to share that we won 2nd place at the CityHack 2026! Huge shoutout to my co-builders whom I met through local peer groups. Networking pays off!",
    tag: "Achievement",
    likes: 34,
    comments: [
      { author: "Sophia Martinez", text: "Big congratulations Dhruv! Well deserved." }
    ],
    timestamp: "1 day ago",
    liked: true
  }
];

function Dashboard() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedTag, setSelectedTag] = useState("Idea");
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedPostIds, setExpandedPostIds] = useState([]);

  const toggleComments = (postId) => {
    setExpandedPostIds(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      toast.error("Please write something to share!");
      return;
    }

    const newPost = {
      id: posts.length + 1,
      author: {
        name: "Alex Rivera",
        title: "Computer Science Undergrad",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face"
      },
      content: newPostContent,
      tag: selectedTag,
      likes: 0,
      comments: [],
      timestamp: "Just now",
      liked: false
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    toast.success("Post published successfully!");
  };

  const handleLike = (id) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === id) {
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      })
    );
  };

  const handleCommentSubmit = (postId, e) => {
    e.preventDefault();
    const commentText = commentInputs[postId] || "";
    if (!commentText.trim()) return;

    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, { author: "Alex Rivera", text: commentText }]
          };
        }
        return post;
      })
    );

    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    toast.success("Comment added!");
  };

  return (
    <div className="feed-grid animate-fade-in">
      
      {/* Create Post Section */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <form onSubmit={handleCreatePost} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <img 
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face" 
              alt="Alex" 
              className="avatar" 
              style={{ width: "42px", height: "42px" }}
            />
            <textarea
              placeholder="What project are you building? Looking for collaborators?"
              className="glass-input"
              style={{ 
                width: "100%", 
                minHeight: "80px", 
                resize: "none", 
                border: "none", 
                background: "rgba(255,255,255,0.01)",
                padding: "8px 0"
              }}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
          </div>

          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            justifyContent: "space-between", 
            alignItems: "center",
            borderTop: "1px solid var(--card-border)",
            paddingTop: "16px",
            gap: "12px"
          }}>
            {/* Tag Selection pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                { name: "Idea", icon: <Lightbulb size={12} /> },
                { name: "Project Partner", icon: <Code size={12} /> },
                { name: "Code Help", icon: <HelpCircle size={12} /> },
                { name: "Achievement", icon: <Sparkles size={12} /> }
              ].map(tag => (
                <button
                  key={tag.name}
                  type="button"
                  onClick={() => setSelectedTag(tag.name)}
                  className="badge"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer",
                    border: "1px solid var(--card-border)",
                    background: selectedTag === tag.name ? "var(--primary-glow)" : "transparent",
                    color: selectedTag === tag.name ? "var(--primary)" : "var(--text-secondary)",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  {tag.icon}
                  <span>{tag.name}</span>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                type="button" 
                className="btn-icon" 
                style={{ width: "38px", height: "38px" }}
                onClick={() => toast.success("Mock image attachment trigger!")}
                aria-label="Add image"
              >
                <Image size={16} />
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "14px", height: "38px" }}>
                <span>Post</span>
                <Send size={14} />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Feed Posts */}
      {posts.map(post => (
        <div key={post.id} className="glass-card animate-fade-in" style={{ padding: "24px" }}>
          
          {/* Post Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <img src={post.author.avatar} alt={post.author.name} className="avatar" style={{ width: "42px", height: "42px" }} />
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: "700" }}>{post.author.name}</h4>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px", lineHeight: "1.4", textAlign: "left" }}>
                  {post.author.title}
                </p>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                  <Clock size={10} />
                  <span>{post.timestamp}</span>
                </div>
              </div>
            </div>
            
            <span className={`badge ${
              post.tag === "Achievement" ? "badge-secondary" :
              post.tag === "Project Partner" ? "badge-primary" :
              post.tag === "Code Help" ? "badge-danger" : "badge-primary"
            }`} style={{ padding: "6px 12px" }}>
              {post.tag}
            </span>
          </div>

          {/* Post Content */}
          <p style={{ fontSize: "15px", color: "var(--text-primary)", lineHeight: "1.6", marginBottom: "18px", textAlign: "left" }}>
            {post.content}
          </p>

          {/* Post Stats & Actions */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            paddingTop: "12px",
            borderTop: "1px solid var(--card-border)",
            fontSize: "13px",
            color: "var(--text-secondary)"
          }}>
            <button 
              onClick={() => handleLike(post.id)}
              style={{ 
                background: "none", 
                border: "none", 
                cursor: "pointer", 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                color: post.liked ? "var(--danger)" : "var(--text-secondary)",
                fontWeight: "600",
                transition: "transform 0.2s"
              }}
              className="glow-effect"
            >
              <Heart size={16} fill={post.liked ? "var(--danger)" : "transparent"} />
              <span>{post.likes} Likes</span>
            </button>

            <div style={{ display: "flex", gap: "16px" }}>
              <button 
                onClick={() => toggleComments(post.id)}
                style={{ 
                  background: "none", 
                  border: "none", 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px", 
                  color: "var(--text-secondary)",
                  fontWeight: expandedPostIds.includes(post.id) ? "700" : "500"
                }}
              >
                <MessageSquare size={16} style={{ color: expandedPostIds.includes(post.id) ? "var(--primary)" : "inherit" }} />
                <span>{post.comments.length} Comments</span>
              </button>
              <button 
                onClick={() => toast.success("Copied post share link!")}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}
                aria-label="Share post"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Comments section (visible only when clicked/expanded) */}
          {expandedPostIds.includes(post.id) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              {post.comments.map((comment, index) => (
                <div key={index} style={{ 
                  display: "flex", 
                  gap: "10px", 
                  background: "var(--bg-tertiary)", 
                  padding: "10px 14px", 
                  borderRadius: "10px",
                  fontSize: "13px",
                  textAlign: "left"
                }}>
                  <span style={{ fontWeight: "700", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{comment.author}:</span>
                  <span style={{ color: "var(--text-secondary)" }}>{comment.text}</span>
                </div>
              ))}

              {/* Comment Form */}
              <form onSubmit={(e) => handleCommentSubmit(post.id, e)} style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <input 
                  type="text" 
                  placeholder="Write a comment..." 
                  className="glass-input" 
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px", borderRadius: "8px" }}
                  value={commentInputs[post.id] || ""}
                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                />
                <button type="submit" className="btn btn-secondary" style={{ padding: "8px 12px", fontSize: "13px", borderRadius: "8px" }}>
                  Reply
                </button>
              </form>
            </div>
          )}

        </div>
      ))}
    </div>
  );
}

export default Dashboard;