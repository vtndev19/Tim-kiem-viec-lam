import React, { useState, useEffect, useRef } from "react";
import "../styles/components/hiring.scss";
import hiringBg from "../assets/images/hiring.png";
// import { Link } from "react-router-dom"; // ❌ Không cần Link nữa vì ta mở Modal

// 📦 Import Modal (Giả định nằm cùng thư mục components)
import EmployerRegistrationModal from "./employerRegistration.js";

export default function Hiring({ imageUrl, onPost }) {
  const cardRef = useRef(null);

  // ✨ State điều khiển Modal
  const [showModal, setShowModal] = useState(false);

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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  const bg = imageUrl || hiringBg;

  return (
    <>
      <div
        ref={cardRef}
        className="employer-card"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="overlay" />

        <div className="content">
          <h2>Bạn là nhà tuyển dụng</h2>
          <p>Tìm ứng viên phù hợp chỉ trong vài bước</p>

          {/* ⭐ Thay Link bằng Button mở Modal */}
          <button
            className="post-btn post-job-btn" // Gộp class để giữ style cũ
            onClick={() => {
              setShowModal(true);
              if (onPost) onPost(); // Gọi callback cũ nếu có
            }}
          >
            Xác thực ngay
          </button>
        </div>
      </div>

      {/* ✨ Hiển thị Modal tại đây */}
      <EmployerRegistrationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
