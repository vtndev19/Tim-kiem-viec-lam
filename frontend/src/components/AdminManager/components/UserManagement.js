import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios để gọi API
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaEye,
  FaLock,
  FaUnlock,
} from "react-icons/fa";
import "../styles/UserManagement.scss";

// Cấu hình URL API (Thay đổi port tùy theo backend của bạn)
const API_URL = "http://localhost:8080/api/users";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "applicant", // Khớp với enum trong MySQL
    status: "active",
  });
  const [loading, setLoading] = useState(false);

  // 1. Fetch Users từ Database
  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách user:", error);
      alert("Không thể tải dữ liệu từ server");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter logic (Client-side filter như cũ)
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "applicant", // Default value khớp với DB
        status: "active",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 2. Handle Save (Create or Update)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingUser) {
        // Update User
        await axios.put(`${API_URL}/${editingUser.id}`, formData);
        alert("Cập nhật thành công!");
      } else {
        // Create User
        await axios.post(API_URL, formData);
        alert("Thêm mới thành công!");
      }
      // Refresh list
      await fetchUsers();
      handleCloseModal();
    } catch (error) {
      console.error("Lỗi lưu user:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Delete
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await axios.delete(`${API_URL}/${userId}`);
        // Cập nhật UI ngay lập tức
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Lỗi xóa user:", error);
        alert("Không thể xóa user này.");
      }
    }
  };

  // 4. Handle Toggle Status
  const handleToggleStatus = async (userId) => {
    const userToUpdate = users.find((u) => u.id === userId);
    if (!userToUpdate) return;

    const newStatus = userToUpdate.status === "active" ? "inactive" : "active";

    try {
      // Gửi request lên server
      await axios.patch(`${API_URL}/${userId}/status`, { status: newStatus });

      // Cập nhật UI
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Không thể cập nhật trạng thái.");
    }
  };

  return (
    <div className="user-management">
      <div className="management-header">
        <div className="header-content">
          <h1>Quản lý người dùng</h1>
          <p>Quản lý thông tin và quyền hạn của tất cả người dùng</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <FaPlus /> Thêm người dùng
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="applicant">Người tìm việc (Applicant)</option>
          <option value="recruiter">Nhà tuyển dụng</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Điện thoại</th>
              <th>Vai trò</th>
              <th>Ngày tham gia</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className={`user-row ${user.status}`}>
                  <td className="name-cell">
                    <div className="user-avatar"></div>
                    {user.name}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role === "applicant"
                        ? "Ứng viên"
                        : user.role === "recruiter"
                        ? "Nhà tuyển dụng"
                        : user.role === "admin"
                        ? "Quản trị viên"
                        : user.role}
                    </span>
                  </td>
                  <td>{user.joinDate}</td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status === "active"
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon btn-view" title="Xem chi tiết">
                      <FaEye />
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleOpenModal(user)}
                      title="Chỉnh sửa"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`btn-icon ${
                        user.status === "active" ? "btn-lock" : "btn-unlock"
                      }`}
                      onClick={() => handleToggleStatus(user.id)}
                      title={user.status === "active" ? "Khóa" : "Mở khóa"}
                    >
                      {user.status === "active" ? <FaLock /> : <FaUnlock />}
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Xóa"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="empty-row">
                <td colSpan="7" className="empty-message">
                  {loading
                    ? "Đang tải dữ liệu..."
                    : "Không tìm thấy người dùng nào"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Tên người dùng</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập tên người dùng"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Điện thoại</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Vai trò</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="applicant">Người tìm việc</option>
                    <option value="recruiter">Nhà tuyển dụng</option>
                    <option value="admin">Quản trị viên</option>
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
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>
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
                  {loading ? "Đang lưu..." : editingUser ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
