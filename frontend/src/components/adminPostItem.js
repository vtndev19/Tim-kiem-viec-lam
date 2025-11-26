import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, User, Clock } from "lucide-react";
import "../styles/components/adminPostItem.scss";
import { Link } from "react-router-dom";

const AdminPostItem = ({ post }) => {
  const [current, setCurrent] = useState(0);

  // ✅ Xử lý an toàn cho trường hợp post.images không tồn tại hoặc sai định dạng
  const images = Array.isArray(post.images) ? post.images : [];

  // Tự động chuyển ảnh sau 4 giây
  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [images.length]);

  const next = (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra card
    setCurrent((c) => (c + 1) % images.length);
  };
  const prev = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  };

  // ✅ Trả về null nếu không có post
  if (!post) return null;

  return (
    <Link to={`/news/${post.id}`} className="admin-post-link">
      <div className="news-card">
        {/* Phần ảnh */}
        {images.length > 0 && (
          <div className="news-image-container">
            {/* Sử dụng transform để tạo hiệu ứng trượt */}
            <div
              className="image-slider"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {images.map((img, index) => (
                <img
                  key={index}
                  src={`http://localhost:8080${img}`}
                  alt={`Post image ${index + 1}`}
                  className="news-image"
                />
              ))}
            </div>

            {images.length > 1 && (
              <>
                <button className="nav-btn left" onClick={prev}>
                  <ChevronLeft />
                </button>
                <button className="nav-btn right" onClick={next}>
                  <ChevronRight />
                </button>
                <div className="dots-indicator">
                  {images.map((_, i) => (
                    <div
                      key={i}
                      className={`dot ${current === i ? "active" : ""}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Phần nội dung */}
        <div className="news-content">
          <div className="news-header">
            <span className="news-tag">Tin tức</span>
            <h3 className="news-title">
              {post.title || `Bài viết #${post.post_id}`}
            </h3>
          </div>
          <p className="news-text">{post.content}</p>
          <div className="news-footer">
            <span className="time">
              <Clock size={14} />{" "}
              {new Date(post.created_at).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AdminPostItem;
