import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/components/ImageSlide.scss";

// import ảnh trực tiếp
import img1 from "../assets/images/img (1).jpg";
import img2 from "../assets/images/img (2).jpg";
import img3 from "../assets/images/img (3).jpg";
import img4 from "../assets/images/img (4).jpg";
import img5 from "../assets/images/img (5).jpg";
import img6 from "../assets/images/img (6).jpg";

export default function ImageCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    fade: false,
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    afterChange: (index) => setActiveSlide(index),
    // Custom arrow styling
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
  };

  // dùng biến import
  const images = [img1, img2, img3, img4, img5, img6];

  return (
    <div className="carousel-wrapper carousel--16-9">
      <Slider {...settings}>
        {images.map((src, i) => (
          <div key={i} className="slide-item">
            <div className="slide-ratio">
              <img src={src} alt={`slide-${i}`} className="slide-image" />
              <div className="slide-overlay-gradient"></div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Progress Bar */}
      <div className="carousel-progress">
        <div
          className="progress-bar-fill"
          style={{
            width: `${((activeSlide + 1) / images.length) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}

// Custom Arrow Components
function CustomNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <button
      className={`${className} custom-arrow next-arrow`}
      style={style}
      onClick={onClick}
      aria-label="Next slide"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  );
}

function CustomPrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <button
      className={`${className} custom-arrow prev-arrow`}
      style={style}
      onClick={onClick}
      aria-label="Previous slide"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
  );
}
