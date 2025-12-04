import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import "../styles/components/employerRegistration.scss"; // 📦 Import SCSS

// ⭐ CẤU HÌNH API BASE URL
const API_BASE = "http://localhost:8080/api";

const EmployerRegistrationModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);

  // State form
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    address: "",
    otp: "",
  });

  // State riêng cho Industry
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [industryOptions, setIndustryOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🟢 1. Reset state khi mở modal
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setMessage("");
      setFormData({
        companyName: "",
        companyEmail: "",
        address: "",
        otp: "",
      });
      setSelectedIndustry(null);
    }
  }, [isOpen]);

  // 🟢 2. Lấy danh sách ngành nghề
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const res = await fetch(`${API_BASE}/industries`);
        if (res.ok) {
          const data = await res.json();
          const options = data.map((ind) => ({
            value: ind.industry_id,
            label: ind.name,
          }));
          setIndustryOptions(options);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách ngành:", err);
      }
    };
    fetchIndustries();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIndustryChange = (newValue) => {
    setSelectedIndustry(newValue);
  };

  // 🟢 BƯỚC 1: Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!selectedIndustry) {
      setMessage("❌ Vui lòng chọn hoặc nhập lĩnh vực hoạt động.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
        window.location.href = "/login";
        return;
      }
      const res = await fetch(`${API_BASE}/employer/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ company_email: formData.companyEmail }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep(2);
        setMessage("✅ Đã gửi mã OTP! Vui lòng kiểm tra email.");
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (err) {
      setMessage("❌ Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 BƯỚC 2: Xác thực & Hoàn tất
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      let industryValue = "";
      if (selectedIndustry) {
        industryValue = selectedIndustry.value;
      }

      const payload = {
        otp: formData.otp,
        company_name: formData.companyName,
        company_email: formData.companyEmail,
        company_address: formData.address,
        industry_input: industryValue,
      };

      const res = await fetch(`${API_BASE}/employer/verify-upgrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        alert("" + data.message);
        onClose(); // Đóng modal trước khi chuyển trang
        window.location.href = "/hiring-dashboard";
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (err) {
      setMessage("❌ Lỗi xử lý xác thực");
    } finally {
      setLoading(false);
    }
  };

  // ⛔ Nếu isOpen = false, không render gì cả
  if (!isOpen) return null;

  // Custom style cho React-Select (giữ lại trong JS vì khó override hoàn toàn bằng class)
  const selectCustomStyles = {
    control: (base) => ({
      ...base,
      padding: "2px",
      borderColor: "#ccc",
      borderRadius: "6px",
      boxShadow: "none",
      "&:hover": { borderColor: "#007bff" },
    }),
  };

  return (
    <div className="employer-modal-overlay" onClick={onClose}>
      <div
        className="employer-modal-content"
        onClick={(e) => e.stopPropagation()} // Ngăn click vào modal bị đóng
      >
        {/* Nút đóng X */}
        <button className="btn-close-modal" onClick={onClose}>
          &times;
        </button>

        <h2>Đăng Ký Nhà Tuyển Dụng</h2>
        <p className="modal-subtitle">
          Nâng cấp tài khoản để đăng tin và tìm kiếm ứng viên.
        </p>

        {message && (
          <div
            className={`message-box ${
              message.startsWith("✅") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label>
                Tên Công Ty <span className="required">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="VD: Công Ty Cổ Phần Tech Việt"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>
                Lĩnh Vực Hoạt Động <span className="required">*</span>
              </label>
              <CreatableSelect
                isClearable
                options={industryOptions}
                onChange={handleIndustryChange}
                value={selectedIndustry}
                placeholder="Chọn hoặc nhập ngành nghề mới..."
                formatCreateLabel={(inputValue) =>
                  `Tạo mới ngành: "${inputValue}"`
                }
                styles={selectCustomStyles}
              />
              <small className="helper-text">
                * Gõ tên ngành nghề của bạn và nhấn Enter nếu chưa có trong danh
                sách.
              </small>
            </div>

            <div className="form-group">
              <label>
                Email Công Ty (Nhận OTP) <span className="required">*</span>
              </label>
              <input
                type="email"
                name="companyEmail"
                required
                value={formData.companyEmail}
                onChange={handleChange}
                placeholder="contact@company.com"
                className="form-control"
              />
            </div>

            <div className="form-group mb-25">
              <label>
                Địa chỉ trụ sở <span className="required">*</span>
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Số 1, Đường X, Quận Y, TP.Z..."
                className="form-control"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary ${loading ? "loading" : ""}`}
            >
              {loading ? "Đang xử lý..." : "Tiếp Tục (Gửi OTP)"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify}>
            <div className="otp-info">
              <p>Mã xác thực 6 số đã được gửi đến:</p>
              <div className="email-highlight">{formData.companyEmail}</div>
            </div>

            <div className="form-group mb-25">
              <label style={{ textAlign: "center" }}>Nhập mã OTP</label>
              <input
                type="text"
                name="otp"
                required
                maxLength="6"
                value={formData.otp}
                onChange={handleChange}
                placeholder="• • • • • •"
                className="form-control otp-input"
              />
            </div>

            <div className="button-group">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`btn btn-success ${loading ? "loading" : ""}`}
                style={{ flex: 2 }}
              >
                {loading ? "Đang xác thực..." : "Hoàn Tất Đăng Ký"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmployerRegistrationModal;
