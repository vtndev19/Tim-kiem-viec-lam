import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import NewsSidebar from "../components/news/NewsSidebar";
import NewsArticle from "../components/news/NewsArticle";
import NewsAdvertisement from "../components/news/NewsAdvertisement";
import "../styles/page/News.scss";

export default function News() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Lấy danh sách bài viết
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/admin/posts");
        setArticles(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách bài viết:", err);
      }
    };
    fetchArticles();
  }, []);

  // ✅ Lấy chi tiết bài viết khi có id
  useEffect(() => {
    const fetchArticleById = async () => {
      if (!id) return; // Nếu không có id thì bỏ qua
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:8080/api/admin/posts/${id}`
        );
        setArticle(res.data);
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết bài viết:", err);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleById();
  }, [id]);

  // ✅ Khi click chọn bài từ sidebar
  const handleArticleSelect = async (selectedArticle) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:8080/api/admin/posts/${selectedArticle.post_id}`
      );
      setArticle(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi chọn bài viết:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="news-page">
      <div className="news-container">
        {/* 🔹 Khu vực hiển thị nội dung bài viết */}
        <main className="news-main">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : article ? (
            <NewsArticle article={article} />
          ) : (
            <div className="no-article">Chưa có bài viết nào</div>
          )}
        </main>
        {/* 🔹 Sidebar hiển thị danh sách bài */}
        <aside className="news-sidebar">
          <NewsSidebar
            articles={articles}
            selectedArticle={article}
            onSelectArticle={handleArticleSelect}
          />
          <NewsAdvertisement />
        </aside>
      </div>
    </div>
  );
}
