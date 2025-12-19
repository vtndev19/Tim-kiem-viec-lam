import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaEye,
  FaCalendar,
  FaUser,
  FaImage,
} from "react-icons/fa";
import "../styles/NewsPost.scss";

const NewsPost = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    category: "general",
    status: "draft",
    thumbnail: "",
  });
  const [loading, setLoading] = useState(false);

  // Mock data
  useEffect(() => {
    const mockPosts = [
      {
        id: 1,
        title: "Top 10 kỹ năng cần thiết cho lập trình viên năm 2024",
        content:
          "Khám phá những kỹ năng quan trọng nhất để thành công trong ngành công nghệ...",
        author: "Admin",
        category: "IT",
        status: "published",
        createdDate: "2024-12-10",
        views: 1250,
      },
      {
        id: 2,
        title: "Xu hướng tuyển dụng trong ngành bán lẻ",
        content: "Các xu hướng mới trong tuyển dụng và quản lý nhân sự...",
        author: "Admin",
        category: "HR",
        status: "published",
        createdDate: "2024-12-08",
        views: 856,
      },
      {
        id: 3,
        title: "Hướng dẫn viết CV hấp dẫn",
        content: "Cách viết CV để thu hút sự chú ý của nhà tuyển dụng...",
        author: "Admin",
        category: "Career",
        status: "draft",
        createdDate: "2024-12-15",
        views: 0,
      },
    ];
    setPosts(mockPosts);
  }, []);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (post = null) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        content: post.content,
        author: post.author,
        category: post.category,
        status: post.status,
        thumbnail: "",
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: "",
        content: "",
        author: "",
        category: "general",
        status: "draft",
        thumbnail: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPost(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (editingPost) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === editingPost.id ? { ...post, ...formData } : post
          )
        );
      } else {
        const newPost = {
          id: Math.max(...posts.map((p) => p.id), 0) + 1,
          ...formData,
          createdDate: new Date().toISOString().split("T")[0],
          views: 0,
        };
        setPosts((prev) => [newPost, ...prev]);
      }
      handleCloseModal();
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = (postId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    }
  };

  const handlePublish = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              status: post.status === "published" ? "draft" : "published",
            }
          : post
      )
    );
  };

  return (
    <div className="news-post">
      <div className="management-header">
        <div className="header-content">
          <h1>Quản lý tin tức</h1>
          <p>Tạo và quản lý các bài viết trên trang web</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <FaPlus /> Viết bài mới
        </button>
      </div>

      {/* Search */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Posts Grid */}
      <div className="posts-container">
        {filteredPosts.length > 0 ? (
          <div className="posts-grid">
            {filteredPosts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-thumbnail">
                    <FaImage className="thumbnail-icon" />
                    <span className="category-badge">{post.category}</span>
                  </div>
                </div>

                <div className="post-body">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">
                    {post.content.substring(0, 80)}...
                  </p>

                  <div className="post-meta">
                    <div className="meta-item">
                      <FaCalendar className="meta-icon" />
                      <span>{post.createdDate}</span>
                    </div>
                    <div className="meta-item">
                      <FaUser className="meta-icon" />
                      <span>{post.author}</span>
                    </div>
                  </div>

                  <div className="post-stats">
                    <span className={`status-badge ${post.status}`}>
                      {post.status === "published" ? "Đã công bố" : "Nháp"}
                    </span>
                    <span className="view-count">👁️ {post.views} lượt xem</span>
                  </div>
                </div>

                <div className="post-actions">
                  <button className="btn-icon btn-view" title="Xem chi tiết">
                    <FaEye />
                  </button>
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => handleOpenModal(post)}
                    title="Chỉnh sửa"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className={`btn-icon btn-publish ${post.status}`}
                    onClick={() => handlePublish(post.id)}
                    title={
                      post.status === "published" ? "Unpublish" : "Publish"
                    }
                  >
                    {post.status === "published" ? "✓" : "○"}
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDeletePost(post.id)}
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Chưa có bài viết nào</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>{editingPost ? "Chỉnh sửa bài viết" : "Viết bài mới"}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePost} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Tiêu đề</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập tiêu đề bài viết"
                  maxLength="200"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="author">Tác giả</label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Nhập tên tác giả"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Danh mục</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="general">Tổng quát</option>
                    <option value="IT">Công nghệ thông tin</option>
                    <option value="HR">Nhân sự</option>
                    <option value="Career">Sự nghiệp</option>
                    <option value="Tips">Mẹo vặt</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Trạng thái</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="draft">Nháp</option>
                    <option value="published">Công bố</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="content">Nội dung</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập nội dung bài viết"
                  rows="10"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Đang lưu..."
                    : editingPost
                    ? "Cập nhật"
                    : "Công bố"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPost;
