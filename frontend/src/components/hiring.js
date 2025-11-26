import React, { useEffect, useRef } from "react";
import "../styles/components/hiring.scss";
import hiringBg from "../assets/images/hiring.png";
import { Link } from "react-router-dom";

export default function Hiring({ imageUrl, onPost }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cardRef.current.classList.add("show");
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(cardRef.current);
  }, []);

  const bg = imageUrl || hiringBg;

  return (
    <div
      ref={cardRef}
      className="employer-card"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="overlay" />

      <div className="content">
        <h2>Bạn là nhà tuyển dụng</h2>
        <p>Tìm ứng viên phù hợp chỉ trong vài bước</p>

        {/* ⭐ Dùng Link đúng cách */}
        <Link to="/hiring-dashboard" className="post-job-btn">
          <button className="post-btn" onClick={onPost}>
            Đăng tuyển ngay
          </button>
        </Link>
      </div>
    </div>
  );
}
