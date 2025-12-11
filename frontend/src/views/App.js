import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";

/* 🧩 Components */
import HomeHeader from "../components/HomeHeader";
import HomeBanner from "../components/HomeBanner";
import HomeJobs from "../components/HomeJobs";
import Footer from "../components/Footer";
import Chat from "../components/Chat";
import FeaturedIndustries from "../components/FeaturedIndustries";
import AdminPostItem from "../components/adminPostItem";
import RecommendJobs from "../components/RecommendJobs";
import Hiring from "../components/hiring";
import EmployerRegistration from "../components/employerRegistration.js";
import Notification from "../components/Notification";

/* 🧭 Pages */
import Login from "../Page/Login";
import Register from "../Page/Register";
import JobDetail from "../Page/JobDetail";
import AllJobs from "../Page/AllJobs";
import Company from "../Page/Company";
import CompanyDetail from "../Page/companyDetail";
import CompanyLanding from "../Page/CompanyLanding";
import Profile from "../Page/Profile";
import UserBlogPage from "../Page/UserBlogPage";
import SavedJobsPage from "../Page/SavedJobsPage";
import HiringPage from "../Page/HiringPage";
import Builder from "../Page/CVBuilder";
import ViewCV from "../Page/ViewCV";
import ReactCVManager from "../Page/cvManager";
import News from "../Page/News";
import HiringDashboard from "../Page/HiringDashboard";

/* ✅ IMPORT DASHBOARD MỚI */
import RecruiterDashboard from "../Page/ApplicantDashboard/RecruiterDashboard.js";

/* 🎨 Styles */
import "../styles/global.scss";

/* 🧠 Mock data & Libs */
import db from "../data/db.json";
import axios from "axios";

/* ===============================
   🏠 App chính – Hệ thống Job Finder
   =============================== */
export default function App() {
  return (
    <AuthProvider>
      <HomeHeader siteName="JobFinder" />
      <main>
        <Routes>
          {/* --- KHU VỰC PUBLIC --- */}
          <Route path="/" element={<HomeMain jobs={db.jobs} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Việc làm */}
          <Route path="/jobs" element={<AllJobs />} />
          <Route path="/job/:jobId" element={<JobDetail />} />

          {/* Công ty */}
          <Route path="/companies" element={<Company />} />
          <Route path="/companies-landing" element={<CompanyLanding />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />

          {/* --- KHU VỰC NGƯỜI DÙNG (CANDIDATE) --- */}
          <Route path="/cv" element={<ReactCVManager />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/blog" element={<UserBlogPage />} />
          <Route path="/saved-jobs" element={<SavedJobsPage />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/view-cv/:id" element={<ViewCV />} />

          {/* --- KHU VỰC TIN TỨC --- */}
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<News />} />

          {/* --- KHU VỰC NHÀ TUYỂN DỤNG (RECRUITER) --- */}
          <Route path="/hiring" element={<HiringPage />} />
          <Route path="/hiring-dashboard" element={<HiringDashboard />} />

          {/* ✅ CẤU HÌNH ROUTE MỚI CHO DASHBOARD QUẢN LÝ ỨNG VIÊN */}
          <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
          <Route
            path="/recruiter-dashboard/:jobId"
            element={<RecruiterDashboard />}
          />
        </Routes>
      </main>
      <Notification />
      <Chat />
      <Footer />
    </AuthProvider>
  );
}

/* ===============================
   🏡 Trang chủ (HomeMain)
   =============================== */
function HomeMain({ jobs }) {
  const [cityFilter, setCityFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [latestPost, setLatestPost] = useState(null);

  // --- API: Lấy bài viết mới nhất ---
  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/admin/posts");
        if (res.data && res.data.length > 0) {
          setLatestPost(res.data[0]);
        }
      } catch (error) {
        console.error("Không thể tải bài viết mới nhất:", error);
      }
    };
    fetchLatestPost();
  }, []);

  // --- LOGIC: LẤY USER ID TỪ LOCALSTORAGE (ĐÃ SỬA) ---

  // 1. Định nghĩa hàm giải mã Token
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  // 2. Lấy dữ liệu và xử lý
  const storedData = localStorage.getItem("user");
  let userId = null;

  if (storedData) {
    // TRƯỜNG HỢP A: Nếu dữ liệu bắt đầu bằng "ey" (là JWT Token string)
    if (storedData.startsWith("ey")) {
      const decoded = parseJwt(storedData);
      userId = decoded ? decoded.user_id || decoded.id : null;
    }
    // TRƯỜNG HỢP B: Nếu dữ liệu bắt đầu bằng "{" (là JSON Object string)
    else if (storedData.startsWith("{")) {
      try {
        const userObj = JSON.parse(storedData);
        userId = userObj.user_id || userObj.id;
      } catch (e) {
        console.error("Lỗi parse JSON user:", e);
      }
    }
  }

  // --- LOGIC: Lọc Job (Giữ nguyên) ---
  const filtered = jobs.filter((j) => {
    const matchCity = cityFilter === "All" || j.location === cityFilter;
    const matchIndustry =
      industryFilter === "All" ||
      db.industries.find((i) => i.id === j.industry_id)?.name ===
        industryFilter;
    return matchCity && matchIndustry;
  });

  return (
    <>
      <HomeBanner />
      <div className="container">
        <section className="home">
          <HomeJobs jobs={filtered.slice(0, 10)} />

          <div className="recommend-section">
            {/* Sử dụng biến userId đã tính toán ở trên */}
            {userId ? (
              <RecommendJobs userId={userId} />
            ) : (
              <p>
                Vui lòng đăng nhập để xem việc làm gợi ý dành riêng cho bạn.
              </p>
            )}
          </div>

          {latestPost && <AdminPostItem post={latestPost} />}
          <Hiring />
          <FeaturedIndustries jobs={jobs} />
          <EmployerRegistration />
        </section>
      </div>
    </>
  );
}
