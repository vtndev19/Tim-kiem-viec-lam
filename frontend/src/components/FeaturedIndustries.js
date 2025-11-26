import React from "react";
import { Link } from "react-router-dom";
import "../styles/components/FeaturedIndustries.scss";
import db from "../data/db.json";

// Import industry icons
import itIcon from "../assets/images/information-technology.svg";
import marketingIcon from "../assets/images/marketing-advertising.svg";
import financeIcon from "../assets/images/finance-banking.svg";
import retailIcon from "../assets/images/retail-ecommerce.svg";
import manufacturingIcon from "../assets/images/manufacturing-processing.svg";
import constructionIcon from "../assets/images/construction-real-estate.svg";
import educationIcon from "../assets/images/education-training.svg";
import tourismIcon from "../assets/images/tourism-hospitality.svg";

// Video demo (thay bằng file thật của bạn)
import introVideo from "../assets/images/video/industriesVideo.mp4";

const industryIcons = {
  1: itIcon,
  2: marketingIcon,
  3: financeIcon,
  4: retailIcon,
  5: manufacturingIcon,
  6: constructionIcon,
  7: educationIcon,
  8: tourismIcon,
};

const FeaturedIndustries = () => {
  const { industries } = db;

  return (
    <section className="featured-industries">
      <div className="container">
        <div className="section-header">
          <h2>Top ngành nghề nổi bật</h2>
          <Link to="/industries" className="view-all">
            Xem tất cả
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* 🆕 Thêm video intro trên phần trượt */}
        <div className="industry-video">
          <video src={introVideo} autoPlay loop muted playsInline />
        </div>

        {/* Danh sách ngành trượt ngang */}
        <div className="industries-grid">
          {industries.concat(industries).map((industry) => (
            <Link
              to={`/jobs/industry/${industry.id}`}
              key={`${industry.id}-${Math.random()}`}
              className="industry-card"
              data-industry={industry.id}
            >
              <div className="industry-icon">
                <img src={industryIcons[industry.id]} alt={industry.name} />
              </div>
              <h3>{industry.name}</h3>
              <p>{industry.job_count.toLocaleString()} việc làm</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedIndustries;
