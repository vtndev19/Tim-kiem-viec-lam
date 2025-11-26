import React from "react";
import { Link } from "react-router-dom";
import "../../styles/components/newsSidebar.scss";

export default function NewsSidebar({
  articles,
  selectedArticle,
  onSelectArticle,
}) {
  return (
    <div className="news-sidebar-wrapper">
      <div className="sidebar-header">
        <h3>📰 Tin Tức Mới</h3>
      </div>

      <div className="news-list">
        {articles.map((article) => (
          <div
            key={article.id}
            className={`news-list-item ${
              selectedArticle?.id === article.id ? "active" : ""
            }`}
            onClick={() => onSelectArticle(article)}
          >
            <Link to={`/news/${article.id}`} className="news-item-link">
              {article.featured_image && (
                <div className="item-thumbnail">
                  <img
                    src={
                      article.featured_image.startsWith("http")
                        ? article.featured_image
                        : `http://localhost:8080${article.featured_image}`
                    }
                    alt={article.title}
                  />
                </div>
              )}
              <div className="item-content">
                <h4 className="item-title">{article.title}</h4>
                <p className="item-date">
                  {new Date(article.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
