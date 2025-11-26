import React from "react";
import "../../styles/components/newsAdvertisement.scss";

export default function NewsAdvertisement() {
  return (
    <aside className="news-advertisement">
      <div className="ad-container">
        <div className="ad-item featured">
          <img
            src="https://via.placeholder.com/300x400?text=Hãy+Tìm+Việc+Làm"
            alt="Job Opportunities"
          />
          <h3>Tìm Việc Làm Ngay</h3>
          <p>Cơ hội nghề nghiệp đang chờ bạn</p>
          <button className="ad-button">Khám Phá Ngay</button>
        </div>

        <div className="ad-item">
          <h4>💼 Những Việc Làm Hot</h4>
          <ul>
            <li>
              <a href="#jobs">Frontend Developer</a>
            </li>
            <li>
              <a href="#jobs">Full Stack Developer</a>
            </li>
            <li>
              <a href="#jobs">Product Manager</a>
            </li>
            <li>
              <a href="#jobs">Data Scientist</a>
            </li>
          </ul>
        </div>

        <div className="ad-item">
          <h4>🏆 Công Ty Hàng Đầu</h4>
          <ul>
            <li>
              <a href="#companies">Google</a>
            </li>
            <li>
              <a href="#companies">Facebook</a>
            </li>
            <li>
              <a href="#companies">Microsoft</a>
            </li>
            <li>
              <a href="#companies">Amazon</a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
