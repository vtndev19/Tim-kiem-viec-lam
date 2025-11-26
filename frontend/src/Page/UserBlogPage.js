import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/page/UserBlogPage.scss";

const UserBlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  /* ======================================
     🔑 Lấy thông tin user từ token
  ====================================== */
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:8080/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("❌ Lỗi lấy thông tin user:", err);
      }
    };
    fetchProfile();
  }, []);

  /* ======================================
     📰 Lấy danh sách bài viết
  ====================================== */
  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/user-posts");
      setPosts(res.data);
    } catch (err) {
      console.error("❌ Lỗi tải bài viết:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  /* ======================================
     📸 Xử lý chọn ảnh
  ====================================== */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  /* ======================================
     📝 Đăng bài viết
  ====================================== */
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("⚠️ Vui lòng nhập tiêu đề và nội dung!");
      return;
    }
    if (!user) {
      alert("⚠️ Vui lòng đăng nhập để đăng bài!");
      return;
    }

    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);
    if (tags) formData.append("tags", tags);

    try {
      setLoading(true);
      await axios.post("http://localhost:8080/api/user-posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset form
      setContent("");
      setTitle("");
      setTags("");
      setImage(null);
      setPreview(null);

      await fetchPosts();
    } catch (err) {
      console.error("❌ Lỗi khi đăng bài:", err.response || err);
      alert(err.response?.data?.message || "Đăng bài thất bại!");
    } finally {
      setLoading(false);
    }
  };

  /* ======================================
     ❤️ Like bài viết
  ====================================== */
  const handleLike = async (post_id) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `http://localhost:8080/api/user-posts/${post_id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPosts((prev) =>
        prev.map((p) =>
          p.post_id === post_id ? { ...p, likes: p.likes + 1 } : p
        )
      );
    } catch (err) {
      console.error("❌ Lỗi khi like bài:", err);
    }
  };

  /* ======================================
     🧱 JSX HIỂN THỊ GIAO DIỆN
  ====================================== */
  return (
    <div className="user-blog-page">
      <h2 className="page-title">🌐 Mạng xã hội mini</h2>

      {/* ===== FORM ĐĂNG BÀI ===== */}
      <div className="post-form card">
        <div className="form-header">
          <img
            src={
              user?.avatar_url ||
              "https://cdn-icons-png.flaticon.com/512/219/219986.png"
            }
            alt="avatar"
            className="avatar"
          />
          <span className="username">{user ? user.full_name : "Khách"}</span>
        </div>

        <form onSubmit={handlePostSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề bài viết..."
            className="title-input"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bạn đang nghĩ gì thế?"
            rows={3}
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Thẻ bài viết (vd: phỏng vấn, kỹ năng, CV)"
            className="tag-input"
          />

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="preview" />
              <button
                type="button"
                className="remove-image"
                onClick={() => {
                  setPreview(null);
                  setImage(null);
                }}
              >
                ×
              </button>
            </div>
          )}

          <div className="form-actions">
            <label htmlFor="file-upload" className="upload-btn">
              📷 Ảnh
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "⏳ Đang đăng..." : "Đăng"}
            </button>
          </div>
        </form>
      </div>

      {/* ===== DANH SÁCH BÀI VIẾT ===== */}
      <div className="post-list">
        {posts.length === 0 ? (
          <p className="no-posts">✨ Chưa có bài viết nào.</p>
        ) : (
          posts.map((post) => (
            <div key={post.post_id} className="post-card card">
              <div className="post-header">
                <img
                  src={
                    post.avatar_url ||
                    "https://cdn-icons-png.flaticon.com/512/219/219986.png"
                  }
                  alt="avatar"
                  className="avatar"
                />
                <div>
                  <h4>{post.full_name}</h4>
                  <small>
                    {new Date(post.created_at).toLocaleString("vi-VN")}
                  </small>
                </div>
              </div>

              <div className="post-content">
                <p className="post-title">{post.title}</p>
                <p>{post.content}</p>

                {/* ✅ Hiển thị ảnh bài viết */}
                {post.image_url && (
                  <img
                    src={
                      post.image_url.startsWith("http")
                        ? post.image_url
                        : `http://localhost:8080${post.image_url}`
                    }
                    alt="post"
                    className="post-image"
                  />
                )}
              </div>

              <div className="post-actions">
                <button onClick={() => handleLike(post.post_id)}>
                  👍 Thích ({post.likes})
                </button>
                <button>💬 Bình luận</button>
                <button>↗️ Chia sẻ</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserBlogPage;
