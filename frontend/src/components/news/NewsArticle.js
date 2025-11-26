import React, { useEffect, useState } from "react";
import "../../styles/components/newsArticle.scss";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function NewsArticle() {
  const { id } = useParams(); // 🧭 Lấy ID bài viết từ URL
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟢 Gọi API lấy chi tiết bài viết theo ID
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/admin/posts/${id}`
        );
        setArticle(res.data);
      } catch (err) {
        console.error("❌ Lỗi tải bài viết:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchArticle();
  }, [id]);

  if (loading) return <div className="loading">⏳ Đang tải bài viết...</div>;
  if (!article)
    return <div className="no-article">❌ Không tìm thấy bài viết</div>;

  return (
    <article className="news-article">
      {/* 🧩 Header - Tiêu đề và ngày đăng */}
      <header className="article-header">
        <div className="article-meta">
          <span className="article-tag">{article.category || "Tin Tức"}</span>
          <time className="article-date">
            {new Date(article.created_at).toLocaleString("vi-VN")}
          </time>
        </div>
        <h1 className="article-title">{article.title}</h1>
      </header>

      {/* 🖼️ Ảnh bài viết */}
      {article.images && article.images.length > 0 && (
        <div className="article-image">
          {article.images.map((img, index) => (
            <img
              key={index}
              src={`http://localhost:8080${img}`}
              alt={`Ảnh ${index + 1}`}
              className="article-photo"
            />
          ))}
        </div>
      )}

      {/* 📄 Nội dung bài viết */}
      <div className="article-body">
        <div className="article-content">
          {article.content ? (
            <div
              dangerouslySetInnerHTML={{
                __html: article.content.replace(/\n/g, "<br/>"),
              }}
            />
          ) : (
            <p>Không có nội dung hiển thị.</p>
          )}
        </div>

        {/* 👤 Thông tin tác giả + hành động */}
        <footer className="article-footer">
          <div className="article-author">
            <span>
              Tác giả: {article.full_name || article.author || "Admin"}
            </span>
          </div>
          <div className="article-share">
            <button onClick={() => window.print()}>🖨️ In</button>
            <button
              onClick={() =>
                navigator.share({
                  title: article.title,
                  url: window.location.href,
                })
              }
            >
              📤 Chia sẻ
            </button>
          </div>
        </footer>
      </div>
    </article>
  );
}
