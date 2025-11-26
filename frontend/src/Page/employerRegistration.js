import React, { useState, useEffect } from "react";

// ⭐ CẤU HÌNH API BASE URL
const API_BASE = "http://localhost:8080/api";

const EmployerRegistration = () => {
  const [step, setStep] = useState(1); // 1: Nhập thông tin, 2: Nhập OTP

  // Thêm industry_id vào state
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    address: "",
    industry_id: "", // 🆕 Trường mới bắt buộc
    otp: "",
  });

  const [industries, setIndustries] = useState([]); // List ngành nghề cho dropdown
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🟢 1. Lấy danh sách ngành nghề khi component load
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const res = await fetch(`${API_BASE}/industries`);
        if (res.ok) {
          const data = await res.json();
          setIndustries(data);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách ngành:", err);
      }
    };
    fetchIndustries();
  }, []);

  // Xử lý nhập liệu
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🟢 BƯỚC 1: Gửi thông tin để lấy OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Lưu ý: Key token phải khớp với lúc Login (authToken hoặc accessToken)
      const token = localStorage.getItem("authToken");

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
        setStep(2); // Chuyển sang bước nhập OTP
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

  // 🟢 BƯỚC 2: Xác thực OTP và Hoàn tất
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      // Chuẩn bị payload khớp 100% với Backend verifyAndUpgrade
      const payload = {
        otp: formData.otp,
        company_name: formData.companyName,
        company_email: formData.companyEmail,
        company_address: formData.address,
        industry_id: formData.industry_id, // 🆕 Gửi thêm ID ngành
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
        alert("🎉 " + data.message);
        // Chuyển hướng hoặc reload trang để cập nhật quyền
        window.location.href = "/dashboard";
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
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#333" }}>
        Đăng Ký Nhà Tuyển Dụng
      </h2>
      <p style={{ textAlign: "center", color: "#666", fontSize: "14px" }}>
        Tạo hồ sơ công ty và bắt đầu đăng tin tuyển dụng ngay hôm nay.
      </p>

      {message && (
        <div
          style={{
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "4px",
            backgroundColor: message.startsWith("✅") ? "#d4edda" : "#f8d7da",
            color: message.startsWith("✅") ? "#155724" : "#721c24",
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
                fontWeight: "bold",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Tên Công Ty:
            </label>
            <input
              type="text"
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              placeholder="VD: Công Ty Cổ Phần ABC"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                fontWeight: "bold",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Lĩnh Vực Hoạt Động (Ngành):
            </label>
            <select
              name="industry_id"
              required
              value={formData.industry_id}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">-- Chọn ngành nghề --</option>
              {industries.map((ind) => (
                <option key={ind.industry_id} value={ind.industry_id}>
                  {ind.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                fontWeight: "bold",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Email Công Ty (Nhận OTP):
            </label>
            <input
              type="email"
              name="companyEmail"
              required
              value={formData.companyEmail}
              onChange={handleChange}
              placeholder="contact@company.com"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                fontWeight: "bold",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Địa chỉ trụ sở:
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Số 1, Đường X, Quận Y..."
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {loading ? "Đang xử lý..." : "Tiếp Tục (Gửi OTP)"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerify}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <p>Mã xác thực 6 số đã được gửi đến:</p>
            <b style={{ color: "#007bff" }}>{formData.companyEmail}</b>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontWeight: "bold",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Nhập mã OTP:
            </label>
            <input
              type="text"
              name="otp"
              required
              maxLength="6"
              value={formData.otp}
              onChange={handleChange}
              placeholder="------"
              style={{
                width: "100%",
                padding: "10px",
                letterSpacing: "8px",
                fontSize: "24px",
                textAlign: "center",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                flex: 1,
                padding: "12px",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Quay lại
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                padding: "12px",
                background: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "bold",
              }}
            >
              {loading ? "Đang kiểm tra..." : "Xác Nhận & Hoàn Tất"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EmployerRegistration;
