import React from "react";
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
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  // dùng biến import
  const images = [img1, img2, img3, img4, img5, img6];

  return (
    <div className="carousel-wrapper carousel--16-9">
      <Slider {...settings}>
        {images.map((src, i) => (
          <div key={i} className="slide-item">
            {/* nếu trình duyệt hỗ trợ aspect-ratio thì .slide-ratio sẽ làm việc
              slide-ratio-fallback dùng padding-top cho trình duyệt cũ */}
            <div className="slide-ratio">
              <img src={src} alt={`slide-${i}`} className="slide-image" />
            </div>

            {/* fallback (nếu bạn không muốn dùng aspect-ratio, giữ phần này) */}
            {/* <div className="slide-ratio-fallback">
            <img src={src} alt={`slide-${i}`} className="slide-image" />
          </div> */}
          </div>
        ))}
      </Slider>
    </div>
  );
}
