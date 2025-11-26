import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/components/AdminPostBox.scss";

const AdminPostBox = () => {
  const adminId = 1021; // ✅ ID admin
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Lấy danh sách bài viết
  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/posts");
      setPosts(res.data || []);
    } catch (err) {
      console.error("❌ Lỗi tải bài viết:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ✅ Chọn ảnh
  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  // ✅ Gửi bài viết mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return setMessage("⚠️ Nhập nội dung!");

    const formData = new FormData();
    formData.append("admin_id", adminId);
    formData.append("content", content);
    images.forEach((img) => formData.append("images", img));

    try {
      setLoading(true);
      await axios.post("http://localhost:8080/api/admin/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ Đăng bài thành công!");
      setContent("");
      setImages([]);
      fetchPosts();
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi đăng bài.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Hàm chuẩn hóa images (vì backend có thể trả string, null hoặc array)
  const normalizeImages = (images) => {
    if (!images) return []; // null
    if (typeof images === "string") return [images]; // 1 ảnh
    if (Array.isArray(images)) return images; // mảng ảnh
    return []; // fallback
  };

  return (
    <div className="post-box-container">
      {/* 🔹 Form đăng bài */}
      <div className="admin-post-box">
        <h3>📝 Đăng bài viết mới</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bạn đang nghĩ gì?"
            rows="4"
          />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />

          {images.length > 0 && (
            <div className="preview-images">
              {images.map((img, i) => (
                <img key={i} src={URL.createObjectURL(img)} alt="preview" />
              ))}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Đang đăng..." : "Đăng bài"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>

      {/* 🔹 Danh sách bài viết */}
      <div className="list-admin-posts">
        <h3>📋 Danh sách bài viết</h3>
        {posts.length > 0 ? (
          posts.map((p) => {
            const imgs = normalizeImages(p.images);
            return (
              <div key={p.post_id} className="post-item">
                <p className="content">{p.content}</p>
                <p className="meta">
                  👤 {p.full_name} • 🕒{" "}
                  {new Date(p.created_at).toLocaleString("vi-VN")}
                </p>
                {imgs.length > 0 && (
                  <div className="post-images">
                    {imgs.map((img, i) => (
                      <img
                        key={i}
                        src={`http://localhost:8080${img}`}
                        alt={`post-${i}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>Chưa có bài viết nào.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPostBox;
