import React, { useState, useEffect } from "react";
import "./JobEditModal.scss";

const JobEditModal = ({ job, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        jobTitle: job.jobTitle || "",
        companyName: job.companyName || "",
        salary: job.salary || "",
        location: job.location || "",
        description: job.description || "",
        requirements: job.requirements || "",
        benefits: job.benefits || "",
        deadline: job.deadline || "",
      });
      setErrors({});
    }
  }, [job, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Vui lòng nhập tên vị trí công việc";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Vui lòng nhập tên công ty";
    }

    if (!formData.salary.trim()) {
      newErrors.salary = "Vui lòng nhập mức lương";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Vui lòng nhập địa điểm công việc";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả công việc";
    } else if (formData.description.length < 20) {
      newErrors.description = "Mô tả công việc phải có ít nhất 20 ký tự";
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = "Vui lòng nhập yêu cầu công việc";
    } else if (formData.requirements.length < 20) {
      newErrors.requirements = "Yêu cầu công việc phải có ít nhất 20 ký tự";
    }

    if (!formData.benefits.trim()) {
      newErrors.benefits = "Vui lòng nhập lợi ích công việc";
    } else if (formData.benefits.length < 10) {
      newErrors.benefits = "Lợi ích công việc phải có ít nhất 10 ký tự";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Vui lòng chọn hạn chót ứng tuyển";
    } else {
      const selectedDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        newErrors.deadline = "Hạn chót phải là ngày trong tương lai";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      onSave({
        ...job,
        ...formData,
      });
      setIsSubmitting(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal job-edit-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Chỉnh Sửa Tin Tuyển Dụng</h2>
          <button type="button" className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-jobTitle">Vị Trí Công Việc *</label>
                <input
                  type="text"
                  id="edit-jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  maxLength="100"
                />
                {errors.jobTitle && (
                  <div className="form-error">{errors.jobTitle}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="edit-companyName">Tên Công Ty *</label>
                <input
                  type="text"
                  id="edit-companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  maxLength="100"
                />
                {errors.companyName && (
                  <div className="form-error">{errors.companyName}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-salary">Mức Lương *</label>
                <input
                  type="text"
                  id="edit-salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  maxLength="100"
                />
                {errors.salary && (
                  <div className="form-error">{errors.salary}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="edit-location">Địa Điểm *</label>
                <input
                  type="text"
                  id="edit-location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  maxLength="100"
                />
                {errors.location && (
                  <div className="form-error">{errors.location}</div>
                )}
              </div>
            </div>

            <div className="form-row full-width">
              <div className="form-group">
                <label htmlFor="edit-description">Mô Tả Công Việc *</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength="2000"
                />
                <div className="char-count">
                  {formData.description.length} / 2000
                </div>
                {errors.description && (
                  <div className="form-error">{errors.description}</div>
                )}
              </div>
            </div>

            <div className="form-row full-width">
              <div className="form-group">
                <label htmlFor="edit-requirements">Yêu Cầu *</label>
                <textarea
                  id="edit-requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  maxLength="2000"
                />
                <div className="char-count">
                  {formData.requirements.length} / 2000
                </div>
                {errors.requirements && (
                  <div className="form-error">{errors.requirements}</div>
                )}
              </div>
            </div>

            <div className="form-row full-width">
              <div className="form-group">
                <label htmlFor="edit-benefits">Lợi Ích *</label>
                <textarea
                  id="edit-benefits"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  maxLength="1500"
                />
                <div className="char-count">
                  {formData.benefits.length} / 1500
                </div>
                {errors.benefits && (
                  <div className="form-error">{errors.benefits}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-deadline">Hạn Chót *</label>
                <input
                  type="date"
                  id="edit-deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                />
                {errors.deadline && (
                  <div className="form-error">{errors.deadline}</div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="button button-secondary"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="button button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span> Đang lưu...
                  </>
                ) : (
                  <>✓ Lưu Thay Đổi</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobEditModal;
