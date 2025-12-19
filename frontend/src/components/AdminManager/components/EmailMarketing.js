import React, { useState, useEffect } from "react";
import {
  FaTrash,
  FaPlus,
  FaSearch,
  FaEye,
  FaEnvelopeOpen,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import "../styles/EmailMarketing.scss";

const EmailMarketing = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    recipientGroup: "all",
    content: "",
    sendTime: "",
    status: "draft",
  });
  const [loading, setLoading] = useState(false);

  // Mock data
  useEffect(() => {
    const mockCampaigns = [
      {
        id: 1,
        title: "Khuyến mãi mùa Giáng sinh",
        subject: "Giảm giá 50% cho tất cả vị trí việc làm",
        recipientGroup: "all",
        sentDate: "2024-12-10",
        openRate: 45.8,
        clickRate: 12.5,
        status: "completed",
        recipients: 5240,
      },
      {
        id: 2,
        title: "Tuyên bố công khai mới",
        subject: "Chúng tôi vừa ra mắt tính năng AI tìm kiếm việc",
        recipientGroup: "users",
        sentDate: "2024-12-05",
        openRate: 38.2,
        clickRate: 8.9,
        status: "completed",
        recipients: 3250,
      },
      {
        id: 3,
        title: "Khuyến mãi cuối năm",
        subject: "Cơ hội tuyệt vời chỉ còn vài ngày",
        recipientGroup: "recruiters",
        sentDate: null,
        openRate: 0,
        clickRate: 0,
        status: "scheduled",
        recipients: 450,
      },
      {
        id: 4,
        title: "Bản cập nhật tính năng mới",
        subject: "Khám phá những tính năng mới nhất",
        recipientGroup: "all",
        sentDate: null,
        openRate: 0,
        clickRate: 0,
        status: "draft",
        recipients: 0,
      },
    ];
    setCampaigns(mockCampaigns);
  }, []);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (campaign = null) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        title: campaign.title,
        subject: campaign.subject,
        recipientGroup: campaign.recipientGroup,
        content: "",
        sendTime: "",
        status: campaign.status,
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        title: "",
        subject: "",
        recipientGroup: "all",
        content: "",
        sendTime: "",
        status: "draft",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCampaign(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (editingCampaign) {
        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign.id === editingCampaign.id
              ? { ...campaign, ...formData }
              : campaign
          )
        );
      } else {
        const newCampaign = {
          id: Math.max(...campaigns.map((c) => c.id), 0) + 1,
          ...formData,
          sentDate: null,
          openRate: 0,
          clickRate: 0,
          recipients: 0,
        };
        setCampaigns((prev) => [newCampaign, ...prev]);
      }
      handleCloseModal();
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = (campaignId) => {
    if (
      window.confirm("Bạn có chắc chắn muốn gửi chiến dịch này ngay bây giờ?")
    ) {
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === campaignId
            ? {
                ...campaign,
                status: "completed",
                sentDate: new Date().toISOString().split("T")[0],
              }
            : campaign
        )
      );
    }
  };

  const handleDeleteCampaign = (campaignId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chiến dịch này?")) {
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    }
  };

  return (
    <div className="email-marketing">
      <div className="management-header">
        <div className="header-content">
          <h1>Quảng cáo qua Email</h1>
          <p>Quản lý và gửi chiến dịch quảng cáo đến khách hàng</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <FaPlus /> Tạo chiến dịch mới
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm chiến dịch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="scheduled">Lên lịch</option>
          <option value="completed">Đã gửi</option>
        </select>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon draft">
            <FaClock />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {campaigns.filter((c) => c.status === "draft").length}
            </div>
            <div className="stat-label">Nháp</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon scheduled">
            <FaEnvelopeOpen />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {campaigns.filter((c) => c.status === "scheduled").length}
            </div>
            <div className="stat-label">Lên lịch</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {campaigns.filter((c) => c.status === "completed").length}
            </div>
            <div className="stat-label">Đã gửi</div>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="table-container">
        <table className="campaigns-table">
          <thead>
            <tr>
              <th>Chiến dịch</th>
              <th>Chủ đề Email</th>
              <th>Nhóm người nhận</th>
              <th>Trạng thái</th>
              <th>Ngày gửi</th>
              <th>Mở</th>
              <th>Click</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className={`campaign-row ${campaign.status}`}
                >
                  <td className="campaign-title">{campaign.title}</td>
                  <td>{campaign.subject}</td>
                  <td>
                    <span className="badge-group">
                      {campaign.recipientGroup === "all"
                        ? "Tất cả"
                        : campaign.recipientGroup === "users"
                        ? "Người dùng"
                        : "Nhà tuyển dụng"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${campaign.status}`}>
                      {campaign.status === "draft"
                        ? "Nháp"
                        : campaign.status === "scheduled"
                        ? "Lên lịch"
                        : "Đã gửi"}
                    </span>
                  </td>
                  <td>
                    {campaign.sentDate ? (
                      campaign.sentDate
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <span className="metric">
                      {campaign.openRate.toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    <span className="metric">
                      {campaign.clickRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon btn-view" title="Xem chi tiết">
                      <FaEye />
                    </button>
                    {campaign.status !== "completed" && (
                      <button
                        className="btn-icon btn-send"
                        onClick={() => handleSendCampaign(campaign.id)}
                        title="Gửi"
                      >
                        <FaEnvelopeOpen />
                      </button>
                    )}
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      title="Xóa"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="empty-row">
                <td colSpan="8" className="empty-message">
                  Không tìm thấy chiến dịch nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>
                {editingCampaign
                  ? "Chỉnh sửa chiến dịch"
                  : "Tạo chiến dịch mới"}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Tên chiến dịch</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập tên chiến dịch"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Chủ đề Email</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập chủ đề email"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="recipientGroup">Nhóm người nhận</label>
                  <select
                    id="recipientGroup"
                    name="recipientGroup"
                    value={formData.recipientGroup}
                    onChange={handleInputChange}
                  >
                    <option value="all">Tất cả người dùng</option>
                    <option value="users">Chỉ người dùng</option>
                    <option value="recruiters">Chỉ nhà tuyển dụng</option>
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
                    <option value="scheduled">Lên lịch</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="sendTime">Thời gian gửi (nếu lên lịch)</label>
                <input
                  type="datetime-local"
                  id="sendTime"
                  name="sendTime"
                  value={formData.sendTime}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Nội dung Email</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập nội dung email"
                  rows="12"
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
                  {loading ? "Đang lưu..." : "Lưu chiến dịch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailMarketing;
