import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/page/UserBlogPage.scss";

// --- Sub-Components (Nên tách ra file riêng trong dự án thực tế) ---

// 1. Sidebar Trái: Thông tin User & Menu
const LeftSidebar = ({ user }) => (
  <aside className="layout-sidebar left">
    <div className="card user-summary-card">
      <div className="cover-photo"></div>
      <div className="user-info">
        <div className="avatar-wrapper">
          <img
            src={user?.avatar_url || "https://via.placeholder.com/150"}
            alt="User Avatar"
            className="avatar"
          />
        </div>
        <h3 className="user-name">{user ? user.full_name : "Guest User"}</h3>
        <p className="user-bio">Software Engineer @ TechCorp</p>
      </div>
      <div className="stats-row">
        <div className="stat-item">
          <strong>120</strong>
          <span>Bài viết</span>
        </div>
        <div className="stat-item">
          <strong>1.5k</strong>
          <span>Người theo dõi</span>
        </div>
      </div>
    </div>

    <nav className="nav-menu card">
      <a href="#feed" className="nav-item active">
        Bảng tin
      </a>
      <a href="#topics" className="nav-item">
        Cuộc thảo luận
      </a>
      <a href="#saved" className="nav-item">
        Bài viết đã lưu
      </a>
      <a href="#settings" className="nav-item">
        Cài đặt
      </a>
    </nav>
  </aside>
);

// 2. Sidebar Phải: Quảng bá & Trending
const RightSidebar = () => (
  <aside className="layout-sidebar right">
    <div className="card widget-card">
      <h4 className="widget-title">Trending</h4>
      <ul className="tag-list">
        <li>#Javascript</li>
        <li>#SystemDesign</li>
        <li>#CareerGrowth</li>
        <li>#ReactJS</li>
      </ul>
    </div>

    <div className="card widget-card promotion">
      <h4 className="widget-title">Advertives</h4>
      <div className="promo-content">
        <div className="promo-placeholder">Ad Banner</div>
        <p>Master Cloud Computing with our new course.</p>
        <button className="btn-link">Learn More</button>
      </div>
    </div>

    <div className="card widget-card">
      <h4 className="widget-title">Cộng đồng</h4>
      <p className="text-small text-muted">
        Please be respectful. No hate speech. Share knowledge, not spam.
      </p>
    </div>
  </aside>
);

// 3. Form Đăng bài
const CreatePostWidget = ({ user, onPostSubmit, loading }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPostSubmit({ title, content, tags, image }, () => {
      // Callback to reset form
      setTitle("");
      setContent("");
      setTags("");
      setImage(null);
      setPreview(null);
    });
  };

  return (
    <div className="card create-post-card">
      <h4 className="card-header-title">Tạo bài viết mới</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            className="form-input title-input"
            placeholder="Tiêu đề..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <textarea
            className="form-input content-input"
            rows={3}
            placeholder="Chia sẻ của bạn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {preview && (
          <div className="image-preview-area">
            <img src={preview} alt="Preview" />
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setPreview(null);
                setImage(null);
              }}
            >
              Remove
            </button>
          </div>
        )}

        <div className="form-actions">
          <div className="action-left">
            <input
              type="text"
              className="form-input tag-input"
              placeholder="Tags (e.g., java, css)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div className="action-right">
            <label htmlFor="file-upload" className="btn btn-secondary">
              Upload Image
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// 4. Card hiển thị bài viết
const PostCard = ({ post, onLike }) => {
  const imageUrl = post.image_url
    ? post.image_url.startsWith("http")
      ? post.image_url
      : `http://localhost:8080${post.image_url}`
    : null;

  return (
    <article className="card post-card">
      <header className="post-header">
        <img
          src={post.avatar_url || "https://via.placeholder.com/40"}
          alt={post.full_name}
          className="user-avatar-small"
        />
        <div className="post-meta">
          <h4 className="author-name">{post.full_name}</h4>
          <span className="post-date">
            {new Date(post.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </header>

      <div className="post-body">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-text">{post.content}</p>
        {imageUrl && (
          <div className="post-media">
            <img src={imageUrl} alt="Post content" />
          </div>
        )}
      </div>

      <footer className="post-footer">
        <div className="post-stats">
          <span>{post.likes} Likes</span>
          <span>0 Comments</span>
        </div>
        <div className="post-actions-bar">
          <button className="action-btn" onClick={() => onLike(post.post_id)}>
            Like
          </button>
          <button className="action-btn">Comment</button>
          <button className="action-btn">Share</button>
        </div>

        {/* Placeholder comment section - Thêm vào theo yêu cầu giao diện diễn đàn */}
        <div className="comment-section-placeholder">
          <input
            type="text"
            placeholder="Write a comment..."
            className="comment-input"
          />
        </div>
      </footer>
    </article>
  );
};

// --- Main Page Component ---

const UserBlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // API Utilities
  const getAuthHeader = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : null;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const headers = getAuthHeader();
      if (!headers) return;
      try {
        const res = await axios.get("http://localhost:8080/api/auth/me", {
          headers,
        });
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/user-posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostSubmit = async (data, onSuccess) => {
    if (!data.title.trim() || !data.content.trim()) {
      alert("Title and content are required.");
      return;
    }
    if (!user) {
      alert("Please login to post.");
      return;
    }

    const headers = getAuthHeader();
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    if (data.image) formData.append("image", data.image);
    if (data.tags) formData.append("tags", data.tags);

    try {
      setLoading(true);
      await axios.post("http://localhost:8080/api/user-posts", formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      await fetchPosts();
      onSuccess();
    } catch (err) {
      console.error("Post creation failed", err);
      alert(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (post_id) => {
    try {
      const headers = getAuthHeader();
      await axios.put(
        `http://localhost:8080/api/user-posts/${post_id}/like`,
        {},
        { headers }
      );
      setPosts((prev) =>
        prev.map((p) =>
          p.post_id === post_id ? { ...p, likes: p.likes + 1 } : p
        )
      );
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  return (
    <div className="tech-forum-layout">
      <div className="layout-container">
        {/* Left Column */}
        <LeftSidebar user={user} />

        {/* Center Column: Feed */}
        <main className="layout-main">
          <CreatePostWidget
            user={user}
            onPostSubmit={handlePostSubmit}
            loading={loading}
          />

          <div className="feed-list">
            {posts.length === 0 ? (
              <div className="empty-state card">
                <h3>No discussions yet</h3>
                <p>Be the first to share your knowledge!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.post_id} post={post} onLike={handleLike} />
              ))
            )}
          </div>
        </main>

        {/* Right Column */}
        <RightSidebar />
      </div>
    </div>
  );
};

export default UserBlogPage;
