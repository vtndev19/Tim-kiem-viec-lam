import "../styles/page/HiringPage.scss";
import React, { useState } from "react";

export default function PostJobPage() {
  const [job, setJob] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    type: "",
    description: "",
    requirements: "",
    benefits: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob({ ...job, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Job Posted:", job);
    alert("🎉 Đăng tuyển thành công!");
  };

  return (
    <div className="post-job-container">
      <h1>Đăng Tin Tuyển Dụng</h1>

      <form className="post-job-form" onSubmit={handleSubmit}>
        {/* JOB TITLE */}
        <div className="form-group">
          <label>Vị trí tuyển dụng</label>
          <input
            type="text"
            name="title"
            placeholder="VD: AI Engineer"
            value={job.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* COMPANY */}
        <div className="form-group">
          <label>Tên công ty</label>
          <input
            type="text"
            name="company"
            placeholder="VD: VisionTech AI"
            value={job.company}
            onChange={handleChange}
            required
          />
        </div>

        {/* LOCATION */}
        <div className="form-group">
          <label>Địa điểm làm việc</label>
          <input
            type="text"
            name="location"
            placeholder="VD: Hà Nội"
            value={job.location}
            onChange={handleChange}
            required
          />
        </div>

        {/* SALARY */}
        <div className="form-group">
          <label>Mức lương</label>
          <input
            type="text"
            name="salary"
            placeholder="VD: 30-45 triệu"
            value={job.salary}
            onChange={handleChange}
          />
        </div>

        {/* JOB TYPE */}
        <div className="form-group">
          <label>Loại công việc</label>
          <select name="type" value={job.type} onChange={handleChange} required>
            <option value="">-- Chọn loại hình --</option>
            <option value="Toàn thời gian">Toàn thời gian</option>
            <option value="Bán thời gian">Bán thời gian</option>
            <option value="Remote">Remote</option>
            <option value="Hợp đồng">Hợp đồng</option>
          </select>
        </div>

        {/* DESCRIPTION */}
        <div className="form-group">
          <label>Mô tả công việc</label>
          <textarea
            name="description"
            placeholder="Mô tả chi tiết công việc..."
            value={job.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        {/* REQUIREMENTS */}
        <div className="form-group">
          <label>Yêu cầu ứng viên</label>
          <textarea
            name="requirements"
            placeholder="VD: Biết TensorFlow, Python..."
            value={job.requirements}
            onChange={handleChange}
            rows={3}
          />
        </div>

        {/* BENEFITS */}
        <div className="form-group">
          <label>Quyền lợi</label>
          <textarea
            name="benefits"
            placeholder="Môi trường startup, stock option..."
            value={job.benefits}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <button type="submit" className="submit-btn">
          Đăng tuyển ngay
        </button>
      </form>
    </div>
  );
}
