import React from "react";
import "../styles/components/HomeBanner.scss";
import HomeStats from "./HomeStats";
import ImageCarousel from "./ImageSlide";

export default function HomeBanner() {
  return (
    <div className="banner">
      {/* Additional blob for extra animation */}
      <div className="banner-blob-extra"></div>
      <div className="banner-content container">
        <h2>Tìm việc nhanh — Liên hệ trực tiếp nhà tuyển dụng</h2>
        <p>Hàng ngàn cơ hội việc làm tại Hà Nội, TP.HCM, Đà Nẵng...</p>
        <ImageCarousel />
        <HomeStats />
      </div>
    </div>
  );
}
