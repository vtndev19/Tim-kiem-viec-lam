# Admin Dashboard - Cấu Trúc Hoàn Chỉnh

## 📂 Cây Thư Mục

```
src/
└── components/
    └── AdminManager/
        ├── main.js                                   # File chính (entry point)
        ├── README.md                                 # Hướng dẫn chi tiết
        ├── USAGE_EXAMPLES.md                         # Ví dụ sử dụng
        ├── STRUCTURE.md                              # File này
        │
        ├── components/
        │   ├── Dashboard.js                          # Trang chính (kết hợp)
        │   ├── Sidebar.js                            # Menu bên trái
        │   ├── UserManagement.js                     # Quản lý người dùng
        │   ├── NewsPost.js                           # Quản lý tin tức
        │   ├── EmailMarketing.js                     # Gửi quảng cáo email
        │   └── NotificationPanel.js                  # Gửi thông báo
        │
        └── styles/
            ├── Dashboard.css                         # CSS trang chính
            ├── Sidebar.css                           # CSS sidebar
            ├── UserManagement.css                    # CSS quản lý người dùng
            ├── NewsPost.css                          # CSS tin tức
            ├── EmailMarketing.css                    # CSS email
            └── NotificationPanel.css                 # CSS thông báo
```

## 📋 Chi Tiết Từng Component

### 🏠 Dashboard.js

**Mục đích**: Trang chính quản lý
**Tính năng**:

- ✅ Hiển thị trang chính với thống kê
- ✅ Quản lý activeMenu state
- ✅ Render component dựa trên menu được chọn
- ✅ Hoạt động gần đây (Activity Feed)
- ✅ Tóm tắt nhanh (Quick Summary)

**State**:

```javascript
{
  activeMenu: string; // 'dashboard', 'users', 'news', 'email', 'notification'
}
```

---

### 👥 Sidebar.js

**Mục đích**: Thanh điều hướng
**Tính năng**:

- ✅ Danh sách menu items
- ✅ Toggle sidebar trên mobile
- ✅ Active menu indication
- ✅ Logout button
- ✅ Smooth animations

**Props**:

```javascript
{
  activeMenu: string,
  setActiveMenu: function,
  onLogout: function
}
```

**Menu Items**:

- Dashboard
- Quản lý người dùng
- Đăng tin tức
- Gửi quảng cáo
- Thông báo
- Cài đặt
- Đăng xuất

---

### 👤 UserManagement.js

**Mục đích**: Quản lý tài khoản người dùng
**Tính năng**:

- ✅ Danh sách người dùng với table
- ✅ Tìm kiếm theo tên/email
- ✅ Lọc theo vai trò
- ✅ Thêm/sửa/xóa người dùng
- ✅ Khóa/mở khóa tài khoản
- ✅ Modal form
- ✅ Responsive table

**Data Fields**:

```javascript
{
  id: number,
  name: string,
  email: string,
  phone: string,
  role: string, // 'user' | 'recruiter' | 'admin'
  status: string, // 'active' | 'inactive'
  joinDate: string
}
```

---

### 📰 NewsPost.js

**Mục đích**: Quản lý bài viết tin tức
**Tính năng**:

- ✅ Grid hiển thị bài viết (card layout)
- ✅ Tìm kiếm bài viết
- ✅ Viết bài mới/chỉnh sửa
- ✅ Chuyên đổi draft/published
- ✅ Hiển thị lượt xem
- ✅ Phân loại (Category)
- ✅ Rich text editor support

**Data Fields**:

```javascript
{
  id: number,
  title: string,
  content: string,
  author: string,
  category: string, // 'IT' | 'HR' | 'Career' | 'Tips'
  status: string, // 'draft' | 'published'
  createdDate: string,
  views: number,
  thumbnail: string
}
```

---

### 📧 EmailMarketing.js

**Mục đích**: Gửi chiến dịch quảng cáo email
**Tính năng**:

- ✅ Danh sách chiến dịch
- ✅ Tạo chiến dịch mới
- ✅ Chọn nhóm người nhận
- ✅ Lên lịch gửi
- ✅ Thống kê (Open Rate, Click Rate)
- ✅ Trạng thái chiến dịch
- ✅ Tìm kiếm/lọc

**Data Fields**:

```javascript
{
  id: number,
  title: string,
  subject: string,
  recipientGroup: string, // 'all' | 'users' | 'recruiters'
  content: string,
  sendTime: string,
  status: string, // 'draft' | 'scheduled' | 'completed'
  sentDate: string,
  openRate: number,
  clickRate: number,
  recipients: number
}
```

---

### 🔔 NotificationPanel.js

**Mục đích**: Gửi thông báo tới người dùng
**Tính năng**:

- ✅ Danh sách thông báo
- ✅ Gửi thông báo mới
- ✅ Các loại thông báo (Info/Success/Warning/Error)
- ✅ Đánh dấu đã đọc
- ✅ Xóa thông báo
- ✅ Chọn nhóm người nhận

**Data Fields**:

```javascript
{
  id: number,
  title: string,
  message: string,
  type: string, // 'info' | 'success' | 'warning' | 'error'
  targetUsers: string, // 'all' | 'users' | 'recruiters'
  createdDate: string,
  read: boolean
}
```

---

## 🎨 CSS Architecture

### Responsive Breakpoints

```css
/* Desktop */
@media (min-width: 1025px) {
  /* Full width layout */
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  /* 2-3 columns, adjusted padding */
}

/* Mobile */
@media (max-width: 768px) {
  /* 1 column, collapsed sidebar, adjusted padding */
}

/* Small Mobile */
@media (max-width: 480px) {
  /* Further optimizations */
}
```

### Color Palette

```css
/* Primary Colors */
--primary-light: #667eea;
--primary-dark: #764ba2;
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Backgrounds */
--bg-primary: #f5f7fa;
--bg-secondary: #ffffff;
--bg-tertiary: #f7fafc;

/* Text Colors */
--text-primary: #1a202c;
--text-secondary: #718096;
--text-tertiary: #a0aec0;

/* Status Colors */
--success: #48bb78;
--warning: #ed8936;
--error: #f56565;
--info: #4299e1;

/* Borders */
--border-color: #e2e8f0;
```

---

## 🔌 Integration Guide

### Bước 1: Import Component

```jsx
import AdminDashboard from "./components/AdminManager/components/Dashboard";
```

### Bước 2: Thêm vào routing (nếu dùng React Router)

```jsx
<Route path="/admin" element={<AdminDashboard />} />
```

### Bước 3: Kết nối API

Sửa các fetch calls trong components:

- Thay `http://localhost/api/...` bằng URL của bạn
- Thêm authentication token vào headers

---

## 📦 Dependencies

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "react-icons": "^4.10.0"
}
```

### Installation

```bash
npm install react-icons
```

---

## 🚀 Performance Optimizations

### Đã Áp Dụng:

- ✅ CSS Grid & Flexbox layout
- ✅ Hardware-accelerated animations
- ✅ Optimized re-renders
- ✅ Efficient state management

### Có Thể Cải Thiện:

- ⏳ Lazy loading components
- ⏳ Code splitting per feature
- ⏳ Memoization cho expensive renders
- ⏳ Virtual scrolling cho danh sách lớn
- ⏳ Pagination/infinite scroll

---

## 🔒 Security Notes

### Hiện Tại (Mock Data):

- ✅ Mock data chỉ cho demo

### Khi Tích Hợp API:

- ⚠️ Validate user input trước khi submit
- ⚠️ Sanitize HTML content từ users
- ⚠️ Verify authentication token
- ⚠️ Implement rate limiting
- ⚠️ Use HTTPS chỉ
- ⚠️ Implement CORS properly

---

## 🧪 Testing

### Unit Tests (Ví dụ):

```javascript
import { render, screen } from "@testing-library/react";
import UserManagement from "./UserManagement";

describe("UserManagement", () => {
  it("renders user table", () => {
    render(<UserManagement />);
    expect(screen.getByText(/Quản lý người dùng/i)).toBeInTheDocument();
  });
});
```

---

## 📚 File Purposes

| File                  | Mục đích          | Kích thước |
| --------------------- | ----------------- | ---------- |
| main.js               | Export exports    | ~50 lines  |
| Dashboard.js          | Main page         | ~150 lines |
| Sidebar.js            | Navigation        | ~130 lines |
| UserManagement.js     | User crud         | ~300 lines |
| NewsPost.js           | Post crud         | ~280 lines |
| EmailMarketing.js     | Campaign crud     | ~300 lines |
| NotificationPanel.js  | Notification crud | ~250 lines |
| Dashboard.css         | Main styles       | ~350 lines |
| Sidebar.css           | Sidebar styles    | ~250 lines |
| UserManagement.css    | User styles       | ~400 lines |
| NewsPost.css          | Post styles       | ~380 lines |
| EmailMarketing.css    | Email styles      | ~400 lines |
| NotificationPanel.css | Notif styles      | ~350 lines |

---

## 🎯 Next Steps

1. **Integration**

   - [ ] Thêm vào App routing
   - [ ] Setup API endpoints
   - [ ] Implement authentication

2. **Customization**

   - [ ] Thay đổi colors/branding
   - [ ] Thêm more features
   - [ ] Custom modal dialogs

3. **Testing**

   - [ ] Unit tests
   - [ ] Integration tests
   - [ ] E2E tests

4. **Deployment**
   - [ ] Build optimization
   - [ ] Performance testing
   - [ ] Cross-browser testing

---

**Tạo ngày**: 17/12/2024  
**Phiên bản**: 1.0.0  
**Status**: ✅ Hoàn thành
