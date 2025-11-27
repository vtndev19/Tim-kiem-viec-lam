import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";

/* 🧩 Components */
import HomeHeader from "../components/HomeHeader";
import HomeBanner from "../components/HomeBanner";
import HomeFilters from "../components/HomeFilters";
import HomeJobs from "../components/HomeJobs";
import Footer from "../components/Footer";
import Chat from "../components/Chat";
import FeaturedIndustries from "../components/FeaturedIndustries";
import AdminPostItem from "../components/adminPostItem";
import RecommendJobs from "../components/RecommendJobs";
import Hiring from "../components/hiring";
import EmployerRegistration from "../components/employerRegistration.js";
/* 🧭 Pages */
import Login from "../Page/Login";
import Register from "../Page/Register";
import JobDetail from "../Page/JobDetail";
import AllJobs from "../Page/AllJobs";
import Company from "../Page/Company";
import CompanyDetail from "../Page/companyDetail";
import Profile from "../Page/Profile";
import UserBlogPage from "../Page/UserBlogPage"; // ✅ đường dẫn chuẩn (Page/UserBlogPage.jsx)
import SavedJobsPage from "../Page/SavedJobsPage.js";
import HiringPage from "../Page/HiringPage.js";

/* 📄 CV Manager (tích hợp từ App tạo CV) */
import ReactCVManager from "../Page/cvManager.js";
import News from "../Page/News.js";
/* 💼 Hiring Dashboard - Landing Page cho Nhà Tuyển Dụng */
import HiringDashboard from "../Page/HiringDashboard.js";
/* 🎨 Styles */
import "../styles/global.scss";
import "../styles/Home.scss";

/* 🧠 Mock data */
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
          {/* Trang chủ */}
          <Route path="/" element={<HomeMain jobs={db.jobs} />} />
          {/* Tài khoản */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Việc làm */}
          <Route path="/jobs" element={<AllJobs />} />
          <Route path="/job/:jobId" element={<JobDetail />} />
          {/* Công ty */}
          <Route path="/companies" element={<Company />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          {/* Trang CV Manager */}
          <Route path="/cv" element={<ReactCVManager />} />
          {/* Trang hồ sơ */}
          <Route path="/profile" element={<Profile />} />
          {/* ✅ Trang mạng xã hội mini (Blog người dùng) */}
          <Route path="/blog" element={<UserBlogPage />} />
          {/* ✅ Trang việc làm đã lưu */}
          <Route path="/saved-jobs" element={<SavedJobsPage />} />
          {/* Trang tin tức */}
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<News />} />{" "}
          {/* cùng component, khác id */}
          <Route path="/hiring" element={<HiringPage />} />
          {/* 💼 Hiring Dashboard - Landing Page cho Nhà Tuyển Dụng */}
          <Route path="/hiring-dashboard" element={<HiringDashboard />} />
          {/* Trang xác thực nhà tuyển dụng */}
        </Routes>
      </main>
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

  // ✅ Lấy bài đăng mới nhất từ API backend
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

  // Danh sách thành phố & ngành nghề
  const cities = Array.from(new Set(jobs.map((j) => j.location)));
  const industries = Array.from(new Set(db.industries.map((i) => i.name)));

  // Lọc việc làm
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
          {/* Bộ lọc việc làm */}
          <HomeFilters
            cities={cities}
            industries={industries}
            cityFilter={cityFilter}
            setCityFilter={setCityFilter}
            industryFilter={industryFilter}
            setIndustryFilter={setIndustryFilter}
          />

          {/* Danh sách việc làm */}
          <HomeJobs jobs={filtered.slice(0, 10)} />

          {/* Gợi ý việc làm */}
          <div className="recommend-section">
            <RecommendJobs userId={1021} />
          </div>

          {/* Bài đăng admin mới nhất */}
          {latestPost && <AdminPostItem post={latestPost} />}
          <Hiring />
          {/* Ngành nghề nổi bật */}
          <FeaturedIndustries jobs={jobs} />
          <EmployerRegistration />
        </section>
      </div>
    </>
  );
}
