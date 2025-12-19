/**
 * Admin Dashboard - Main Entry Point
 *
 * Cấu trúc:
 * - AdminManager/
 *   - main.js (file này)
 *   - components/
 *     - Dashboard.js (trang chính chứa các component)
 *     - Sidebar.js (thanh điều hướng)
 *     - UserManagement.js (quản lý người dùng)
 *     - NewsPost.js (đăng tin tức)
 *     - EmailMarketing.js (gửi quảng cáo)
 *     - NotificationPanel.js (quản lý thông báo)
 *   - styles/
 *     - Dashboard.css
 *     - Sidebar.css
 *     - UserManagement.css
 *     - NewsPost.css
 *     - EmailMarketing.css
 *     - NotificationPanel.css
 */

// Export chính từ components
export { default as AdminDashboard } from "./components/Dashboard";
export { default as Sidebar } from "./components/Sidebar";
export { default as UserManagement } from "./components/UserManagement";
export { default as NewsPost } from "./components/NewsPost";
export { default as EmailMarketing } from "./components/EmailMarketing";
export { default as NotificationPanel } from "./components/NotificationPanel";

// Export tất cả CSS
import "./styles/Dashboard.css";
import "./styles/Sidebar.css";
import "./styles/UserManagement.css";
import "./styles/NewsPost.css";
import "./styles/EmailMarketing.css";
import "./styles/NotificationPanel.css";
