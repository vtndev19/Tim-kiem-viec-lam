import React, { useState, useEffect } from "react";
import "./JobPostingForm.scss";

// ⭐ CẤU HÌNH API
const API_BASE = "http://localhost:8080/api";

const JobPostingForm = ({ onJobPost }) => {
  // 1. State chứa dữ liệu form (Không cần companyName nữa)
  const [formData, setFormData] = useState({
    title: "", // Backend: title
    industry_id: "", // Backend: industry_id
    city: "", // Backend: city
    type_name: "", // Backend: type_name
    salary_range: "", // Backend: salary_range
    description: "", // Backend: description
    requirements: "", // Backend: requirements
    benefits: "", // Backend: benefits
  });

  // State hiển thị thông tin công ty (Read-only)
  const [myCompany, setMyCompany] = useState(null);

  // State danh sách ngành nghề
  const [industries, setIndustries] = useState([]);

  // State xử lý lỗi/loading
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({
    loading: false,
    success: "",
    error: "",
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 2. Lấy dữ liệu ban đầu (Ngành nghề + Công ty của tôi)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Hoặc authToken
        if (!token) return;

        // Gọi song song 2 API
        const [resInd, resComp] = await Promise.all([
          fetch(`${API_BASE}/companies/industries`),
          fetch(`${API_BASE}/companies/mine`, {
            // API mới tạo ở Bước 1
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (resInd.ok) {
          const resBody = await resInd.json();
          // LOGIC KHỚP VỚI CONTROLLER:
          // Controller trả về { success: true, data: [...] }
          // Nên ta phải lấy resBody.data
          if (resBody.success && Array.isArray(resBody.data)) {
            setIndustries(resBody.data);
          } else {
            // Fallback nếu API trả về mảng trực tiếp (trường hợp hiếm)
            setIndustries([]);
          }
        }

        // Xử lý thông tin công ty
        if (resComp.ok) {
          const dataComp = await resComp.json();
          setMyCompany(dataComp); // Lưu thông tin công ty để hiển thị
        } else {
          setStatus({
            ...status,
            error:
              "Bạn chưa tạo hồ sơ công ty. Vui lòng tạo trước khi đăng tin.",
          });
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // 3. Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi khi nhập
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // 4. Validate
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Vui lòng nhập tên vị trí";
    if (!formData.industry_id)
      newErrors.industry_id = "Vui lòng chọn ngành nghề";
    if (!formData.city.trim()) newErrors.city = "Vui lòng nhập địa điểm";
    if (!formData.type_name) newErrors.type_name = "Vui lòng chọn loại hình";
    if (!formData.description.trim())
      newErrors.description = "Vui lòng nhập mô tả";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 5. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: false, success: "", error: "" });

    if (!myCompany) {
      setStatus({
        loading: false,
        success: "",
        error: "Bạn chưa có công ty, không thể đăng tin.",
      });
      return;
    }

    if (!validateForm()) return;

    const token = localStorage.getItem("authToken");
    setStatus({ ...status, loading: true });

    try {
      const response = await fetch(`${API_BASE}/jobs/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData), // Backend tự lấy Company ID từ Token
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Lỗi server");

      setStatus({
        loading: false,
        success: "🎉 Đăng tin tuyển dụng thành công!",
        error: "",
      });

      // Reset form (trừ các trường select có thể giữ lại nếu muốn)
      setFormData({
        title: "",
        industry_id: "",
        city: "",
        type_name: "",
        salary_range: "",
        description: "",
        requirements: "",
        benefits: "",
      });

      if (onJobPost) onJobPost(data.data);
    } catch (error) {
      setStatus({ loading: false, success: "", error: error.message });
    }
  };

  return (
    <section className="job-posting-form-section">
      <div className="container">
        <h2 className="section-title">Đăng Tin Tuyển Dụng Mới</h2>

        {/* Thông báo lỗi/thành công */}
        {status.success && (
          <div className="alert alert-success">{status.success}</div>
        )}
        {status.error && (
          <div className="alert alert-error">{status.error}</div>
        )}

        <div className="form-wrapper card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* --- DÒNG 1: CÔNG TY (HIỂN THỊ SẴN) & VỊ TRÍ --- */}
              <div className="form-row">
                <div className="form-group">
                  <label>Công Ty Đang Tuyển</label>
                  <input
                    type="text"
                    disabled //Khóa không cho sửa
                    value={myCompany ? myCompany.company_name : "Đang tải..."}
                    className="input-readonly"
                    style={{
                      backgroundColor: "#f0f0f0",
                      color: "#666",
                      cursor: "not-allowed",
                    }}
                  />
                  {!myCompany && !isLoadingData && (
                    <small style={{ color: "red" }}>
                      * Bạn chưa đăng ký hồ sơ công ty.
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Vị Trí Công Việc <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="VD: Senior React Developer"
                  />
                  {errors.title && (
                    <div className="form-error">{errors.title}</div>
                  )}
                </div>
              </div>

              {/* --- DÒNG 2: NGÀNH NGHỀ & LOẠI HÌNH --- */}
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Ngành Nghề <span className="required">*</span>
                  </label>
                  <select
                    name="industry_id"
                    value={formData.industry_id}
                    onChange={handleChange}
                    className="form-control" // Thêm class nếu cần style
                  >
                    <option value="">-- Chọn Ngành Nghề --</option>

                    {/* SỬA ĐOẠN NÀY: Thêm dấu ? trước .map và kiểm tra độ dài */}
                    {industries?.length > 0 &&
                      industries.map((ind) => (
                        <option key={ind.industry_id} value={ind.industry_id}>
                          {ind.name}
                        </option>
                      ))}
                  </select>
                  {errors.industry_id && (
                    <div className="form-error">{errors.industry_id}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Loại Hình <span className="required">*</span>
                  </label>
                  <select
                    name="type_name"
                    value={formData.type_name}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn Loại Hình --</option>
                    <option value="Full-time">Toàn thời gian</option>
                    <option value="Part-time">Bán thời gian</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Thực tập</option>
                  </select>
                  {errors.type_name && (
                    <div className="form-error">{errors.type_name}</div>
                  )}
                </div>
              </div>

              {/* --- DÒNG 3: ĐỊA ĐIỂM & LƯƠNG --- */}
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Địa Điểm Làm Việc <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="VD: Hà Nội"
                  />
                  {errors.city && (
                    <div className="form-error">{errors.city}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Mức Lương</label>
                  <input
                    type="text"
                    name="salary_range"
                    value={formData.salary_range}
                    onChange={handleChange}
                    placeholder="VD: 15 - 20 Triệu"
                  />
                </div>
              </div>

              {/* --- CÁC TRƯỜNG TEXTAREA --- */}
              <div className="form-group full-width">
                <label>
                  Mô Tả Công Việc <span className="required">*</span>
                </label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết trách nhiệm..."
                />
                {errors.description && (
                  <div className="form-error">{errors.description}</div>
                )}
              </div>

              <div className="form-group full-width">
                <label>Yêu Cầu Ứng Viên</label>
                <textarea
                  name="requirements"
                  rows="3"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Kỹ năng, kinh nghiệm cần thiết..."
                />
              </div>

              <div className="form-group full-width">
                <label>Quyền Lợi</label>
                <textarea
                  name="benefits"
                  rows="3"
                  value={formData.benefits}
                  onChange={handleChange}
                  placeholder="Bảo hiểm, thưởng, chế độ..."
                />
              </div>
            </div>

            <div className="form-actions">
              {/* Nếu chưa có công ty thì Disable nút đăng */}
              <button
                type="submit"
                className="button button-primary button-large"
                disabled={status.loading || !myCompany}
              >
                {status.loading ? "Đang xử lý..." : "Đăng Tin Tuyển Dụng"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default JobPostingForm;
