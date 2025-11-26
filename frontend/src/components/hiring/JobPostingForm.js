import React, { useState } from "react";
import "./JobPostingForm.scss";

// ⭐ ĐIỀN ĐƯỜNG DẪN API CHÍNH XÁC CỦA BẠN (Ví dụ đường dẫn tới controller createJobUsingProcedure)
const API_URL = "http://localhost:8080/api/jobs/create";

const JobPostingForm = ({ onJobPost }) => {
  // 1. Khởi tạo State
  const [formData, setFormData] = useState({
    jobTitle: "", // Backend cần: title
    companyName: "", // Backend cần: company_name
    industry: "", // Backend cần: industry_name
    location: "", // Backend cần: city
    jobType: "", // Backend cần: type_name
    salary: "", // Backend cần: salary_range
    description: "", // Backend cần: description
    requirements: "", // Backend cần: requirements
    benefits: "", // Backend cần: benefits
    deadline: "", // (Optional: Procedure hiện tại chưa dùng, nhưng cứ giữ để mở rộng sau này)
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Validate Form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.jobTitle.trim())
      newErrors.jobTitle = "Vui lòng nhập tên vị trí";
    if (!formData.companyName.trim())
      newErrors.companyName = "Vui lòng nhập tên công ty";
    if (!formData.industry.trim())
      newErrors.industry = "Vui lòng chọn ngành nghề";
    if (!formData.location.trim())
      newErrors.location = "Vui lòng nhập địa điểm";
    if (!formData.jobType.trim()) newErrors.jobType = "Vui lòng chọn loại hình";
    if (!formData.description.trim())
      newErrors.description = "Vui lòng nhập mô tả";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 3. Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Xóa lỗi khi user nhập
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setErrorMessage("");
  };

  // 4. Handle Submit (QUAN TRỌNG NHẤT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) return;

    // A. Lấy Token (Key phải khớp với lúc bạn lưu khi Login, ví dụ 'accessToken' hoặc 'authToken')
    const token = localStorage.getItem("authToken");

    if (!token) {
      setErrorMessage("⚠️ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    setIsSubmitting(true);

    // B. CHUẨN BỊ PAYLOAD (Mapping dữ liệu React -> Node.js API)
    // Bên trái: Tên field API cần. Bên phải: State hiện tại của Form.
    const payload = {
      title: formData.jobTitle,
      company_name: formData.companyName,
      industry_name: formData.industry,
      city: formData.location,
      type_name: formData.jobType,
      salary_range: formData.salary,
      description: formData.description,
      requirements: formData.requirements,
      benefits: formData.benefits,
      // deadline: formData.deadline // Procedure AddNewJob hiện chưa có tham số này, có thể bỏ qua hoặc update Procedure sau
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Gửi Token để Backend lấy user_id
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Lỗi server không xác định");
      }

      // C. Xử lý Thành công
      setSuccessMessage("🎉 Đăng tin tuyển dụng thành công!");

      // Reset Form
      setFormData({
        jobTitle: "",
        companyName: "",
        industry: "",
        location: "",
        jobType: "",
        salary: "",
        description: "",
        requirements: "",
        benefits: "",
        deadline: "",
      });

      // Callback ra ngoài (nếu cần cập nhật list jobs)
      if (onJobPost) onJobPost(data.data); // data.data là object job trả về từ API
    } catch (error) {
      console.error("Submit Error:", error);
      setErrorMessage(error.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="form" className="job-posting-form-section">
      <div className="container">
        <h2 className="section-title">Đăng Tin Tuyển Dụng</h2>
        <p className="section-subtitle">
          Thông tin sẽ được lưu trữ và phân loại tự động vào hệ thống.
        </p>

        {/* Thông báo trạng thái */}
        {successMessage && (
          <div className="alert alert-success fade-in-up">
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="alert alert-error fade-in-up">
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="form-wrapper card">
          <form onSubmit={handleSubmit} className="job-posting-form">
            <div className="form-grid">
              {/* Row 1: Vị trí & Công ty */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="jobTitle">
                    Vị Trí Công Việc <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="VD: Senior React Developer"
                    maxLength="150"
                  />
                  {errors.jobTitle && (
                    <div className="form-error">{errors.jobTitle}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="companyName">
                    Tên Công Ty <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="VD: Tech Corp Vietnam"
                    maxLength="255"
                  />
                  {errors.companyName && (
                    <div className="form-error">{errors.companyName}</div>
                  )}
                </div>
              </div>

              {/* Row 2: Loại hình & Ngành nghề (Lookup Fields) */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="jobType">
                    Loại Hình <span className="required">*</span>
                  </label>
                  <select
                    id="jobType"
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn Loại Hình --</option>
                    <option value="Toàn thời gian">Toàn thời gian</option>
                    <option value="Bán thời gian">Bán thời gian</option>
                    <option value="Thực tập">Thực tập</option>
                    <option value="Remote">Remote (Làm từ xa)</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                  {errors.jobType && (
                    <div className="form-error">{errors.jobType}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="industry">
                    Ngành Nghề <span className="required">*</span>
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn Ngành Nghề --</option>
                    <option value="Công nghệ thông tin">
                      Công nghệ thông tin
                    </option>
                    <option value="Marketing - Truyền thông">
                      Marketing - Truyền thông
                    </option>
                    <option value="Kinh doanh - Bán hàng">
                      Kinh doanh - Bán hàng
                    </option>
                    <option value="Tài chính - Ngân hàng">
                      Tài chính - Ngân hàng
                    </option>
                    <option value="Nhân sự - Hành chính">
                      Nhân sự - Hành chính
                    </option>
                    <option value="Thiết kế - Sáng tạo">
                      Thiết kế - Sáng tạo
                    </option>
                  </select>
                  {errors.industry && (
                    <div className="form-error">{errors.industry}</div>
                  )}
                </div>
              </div>

              {/* Row 3: Lương & Địa điểm */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="salary">Mức Lương</label>
                  <input
                    type="text"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="VD: 15 - 25 Triệu"
                    maxLength="50"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">
                    Thành Phố / Tỉnh <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="VD: Hồ Chí Minh"
                    maxLength="255"
                  />
                  {errors.location && (
                    <div className="form-error">{errors.location}</div>
                  )}
                </div>
              </div>

              {/* Row 4: Các trường Textarea */}
              <div className="form-group full-width">
                <label htmlFor="description">
                  Mô Tả Công Việc <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Mô tả chi tiết trách nhiệm công việc..."
                />
                {errors.description && (
                  <div className="form-error">{errors.description}</div>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="requirements">Yêu Cầu Ứng Viên</label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Kỹ năng, kinh nghiệm, bằng cấp..."
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="benefits">Quyền Lợi</label>
                <textarea
                  id="benefits"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Bảo hiểm, thưởng, du lịch..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() =>
                  setFormData({
                    jobTitle: "",
                    companyName: "",
                    industry: "",
                    location: "",
                    jobType: "",
                    salary: "",
                    description: "",
                    requirements: "",
                    benefits: "",
                    deadline: "",
                  })
                }
              >
                Làm mới
              </button>

              <button
                type="submit"
                className="button button-primary button-large"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Đăng Tin Tuyển Dụng"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default JobPostingForm;
