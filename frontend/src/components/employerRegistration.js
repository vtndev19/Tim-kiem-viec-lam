import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable"; // 📦 Import thư viện này

// ⭐ CẤU HÌNH API BASE URL
const API_BASE = "http://localhost:8080/api";

const EmployerRegistration = () => {
  const [step, setStep] = useState(1);

  // State form
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    address: "",
    otp: "",
  });

  // State riêng cho Industry (để tương thích với react-select)
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  const [industryOptions, setIndustryOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🟢 1. Lấy danh sách ngành nghề khi load trang
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const res = await fetch(`${API_BASE}/industries`);
        if (res.ok) {
          const data = await res.json();
          // Chuyển đổi dữ liệu API thành format của react-select { value, label }
          const options = data.map((ind) => ({
            value: ind.industry_id, // ID là số
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

  // Xử lý nhập liệu các trường text thường
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý khi chọn hoặc tạo mới ngành nghề
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
        window.location.href = "/login"; // Chuyển hướng về trang login
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

      // LOGIC QUAN TRỌNG: Chuẩn bị industry_input gửi về Backend
      // Nếu user chọn có sẵn -> value là ID (số)
      // Nếu user tạo mới -> value là Tên ngành (chuỗi) - react-select tự xử lý việc này
      let industryValue = "";
      if (selectedIndustry) {
        // Nếu là option có sẵn (value là ID), ta gửi ID
        // Nếu là option tạo mới (do react-select tạo ra), value chính là chuỗi user nhập
        // Tuy nhiên, react-select creatable khi tạo mới sẽ trả về { value: 'string', label: 'string', __isNew__: true }
        industryValue = selectedIndustry.value;
      }

      const payload = {
        otp: formData.otp,
        company_name: formData.companyName,
        company_email: formData.companyEmail,
        company_address: formData.address,
        industry_input: industryValue, // Gửi về backend (ID hoặc String)
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

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        padding: "30px",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        backgroundColor: "#fff",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <h2
        style={{ textAlign: "center", color: "#2c3e50", marginBottom: "10px" }}
      >
        Đăng Ký Nhà Tuyển Dụng
      </h2>
      <p
        style={{
          textAlign: "center",
          color: "#7f8c8d",
          fontSize: "14px",
          marginBottom: "25px",
        }}
      >
        Nâng cấp tài khoản để đăng tin và tìm kiếm ứng viên.
      </p>

      {message && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "6px",
            backgroundColor: message.startsWith("✅") ? "#e8f5e9" : "#ffebee",
            color: message.startsWith("✅") ? "#2e7d32" : "#c62828",
            fontSize: "14px",
            border: message.startsWith("✅")
              ? "1px solid #c8e6c9"
              : "1px solid #ffcdd2",
          }}
        >
          {message}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                fontWeight: "600",
                display: "block",
                marginBottom: "6px",
                color: "#34495e",
              }}
            >
              Tên Công Ty <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              placeholder="VD: Công Ty Cổ Phần Tech Việt"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                fontWeight: "600",
                display: "block",
                marginBottom: "6px",
                color: "#34495e",
              }}
            >
              Lĩnh Vực Hoạt Động <span style={{ color: "red" }}>*</span>
            </label>
            {/* 🔥 Dropdown thông minh: Tìm kiếm hoặc Tạo mới */}
            <CreatableSelect
              isClearable
              options={industryOptions}
              onChange={handleIndustryChange}
              value={selectedIndustry}
              placeholder="Chọn hoặc nhập ngành nghề mới..."
              formatCreateLabel={(inputValue) =>
                `Tạo mới ngành: "${inputValue}"`
              }
              styles={{
                control: (base) => ({
                  ...base,
                  padding: "2px",
                  borderColor: "#ccc",
                  borderRadius: "6px",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#007bff" },
                }),
              }}
            />
            <small
              style={{
                display: "block",
                marginTop: "5px",
                color: "#999",
                fontSize: "12px",
              }}
            >
              * Gõ tên ngành nghề của bạn và nhấn Enter nếu chưa có trong danh
              sách.
            </small>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                fontWeight: "600",
                display: "block",
                marginBottom: "6px",
                color: "#34495e",
              }}
            >
              Email Công Ty (Nhận OTP) <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="email"
              name="companyEmail"
              required
              value={formData.companyEmail}
              onChange={handleChange}
              placeholder="contact@company.com"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                fontWeight: "600",
                display: "block",
                marginBottom: "6px",
                color: "#34495e",
              }}
            >
              Địa chỉ trụ sở <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Số 1, Đường X, Quận Y, TP.Z..."
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              background: loading ? "#95a5a6" : "#007bff",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Đang xử lý..." : "Tiếp Tục (Gửi OTP)"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerify}>
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <p style={{ color: "#555" }}>Mã xác thực 6 số đã được gửi đến:</p>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#007bff",
                marginTop: "5px",
              }}
            >
              {formData.companyEmail}
            </div>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                fontWeight: "600",
                display: "block",
                marginBottom: "6px",
                textAlign: "center",
              }}
            >
              Nhập mã OTP
            </label>
            <input
              type="text"
              name="otp"
              required
              maxLength="6"
              value={formData.otp}
              onChange={handleChange}
              placeholder="• • • • • •"
              style={{
                ...inputStyle,
                textAlign: "center",
                fontSize: "24px",
                letterSpacing: "10px",
                fontWeight: "bold",
                color: "#333",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                ...buttonStyle,
                flex: 1,
                background: "#ecf0f1",
                color: "#333",
                border: "1px solid #ccc",
              }}
            >
              Quay lại
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                flex: 2,
                background: loading ? "#95a5a6" : "#27ae60",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Đang xác thực..." : "Hoàn Tất Đăng Ký"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// CSS Styles (Inline cho gọn)
const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px",
  outline: "none",
  transition: "border 0.3s",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  transition: "background 0.3s",
};

export default EmployerRegistration;
