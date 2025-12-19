# Admin Dashboard - Hướng dẫn Sử Dụng

## 📋 Tổng Quan

Đây là một Admin Dashboard chuyên nghiệp, đẹp mắt và responsive được xây dựng với React. Dashboard cung cấp các tính năng quản lý toàn diện cho quản trị viên của ứng dụng.

## 📁 Cấu Trúc Thư Mục

```
AdminManager/
├── main.js                           # File chính (export tất cả components)
├── components/
│   ├── Dashboard.js                  # Trang chính (kết hợp tất cả components)
│   ├── Sidebar.js                    # Thanh điều hướng bên trái
│   ├── UserManagement.js             # Quản lý người dùng
│   ├── NewsPost.js                   # Đăng tin tức
│   ├── EmailMarketing.js             # Gửi quảng cáo qua email
│   └── NotificationPanel.js          # Gửi thông báo
└── styles/
    ├── Dashboard.css                 # CSS cho trang chính
    ├── Sidebar.css                   # CSS cho sidebar
    ├── UserManagement.css            # CSS cho quản lý người dùng
    ├── NewsPost.css                  # CSS cho đăng tin tức
    ├── EmailMarketing.css            # CSS cho gửi quảng cáo
    └── NotificationPanel.css         # CSS cho thông báo
```

## 🚀 Hướng Dẫn Cài Đặt

### 1. Cài đặt Dependencies

Đảm bảo bạn đã cài đặt `react-icons` (được sử dụng cho tất cả icons):

```bash
npm install react-icons
```

### 2. Import Dashboard vào App của bạn

```jsx
import { AdminDashboard } from "./components/AdminManager/main";

function App() {
  return (
    <div className="App">
      <AdminDashboard />
    </div>
  );
}

export default App;
```

Hoặc import component cụ thể:

```jsx
import Dashboard from "./components/AdminManager/components/Dashboard";

function App() {
  return <Dashboard />;
}
```

## 🎨 Các Tính Năng

### 1. **Sidebar Navigation** (Thanh điều hướng)

- ✅ Dashboard chính
- ✅ Quản lý người dùng
- ✅ Đăng tin tức
- ✅ Gửi quảng cáo
- ✅ Gửi thông báo
- ✅ Cài đặt
- ✅ Đăng xuất

**Tính năng:**

- Toggle sidebar trên mobile
- Active menu indication
- Smooth animations
- Fully responsive

### 2. **Dashboard Home**

Hiển thị:

- 📊 Thống kê chính (Users, Jobs, Applications, Revenue)
- 📈 Hoạt động gần đây
- 📋 Tóm tắt nhanh

### 3. **User Management** (Quản lý người dùng)

**Tính năng:**

- 📋 Danh sách người dùng với thông tin chi tiết
- 🔍 Tìm kiếm theo tên hoặc email
- 🏷️ Lọc theo vai trò (User, Recruiter, Admin)
- ➕ Thêm người dùng mới
- ✏️ Chỉnh sửa thông tin người dùng
- 🔒 Khóa/Mở khóa tài khoản
- 🗑️ Xóa người dùng
- 📅 Hiển thị ngày tham gia

### 4. **News Post** (Đăng tin tức)

**Tính năng:**

- 📝 Viết bài viết mới
- ✏️ Chỉnh sửa bài viết
- 📸 Hỗ trợ hình ảnh thumbnail
- 🏷️ Phân loại tin tức (IT, HR, Career, Tips)
- 📊 Hiển thị lượt xem
- 🔄 Chuyển đổi giữa nháp và công bố
- 🔍 Tìm kiếm bài viết

### 5. **Email Marketing** (Gửi quảng cáo)

**Tính năng:**

- 📧 Tạo chiến dịch email
- 👥 Chọn nhóm người nhận (Tất cả, Users, Recruiters)
- 📅 Lên lịch gửi email
- 📊 Theo dõi tỷ lệ mở/click
- 📈 Thống kê chiến dịch
- 🔄 Quản lý trạng thái (Draft, Scheduled, Completed)

### 6. **Notification Panel** (Gửi thông báo)

**Tính năng:**

- 🔔 Gửi thông báo tới người dùng
- 🎯 Chọn loại thông báo (Info, Success, Warning, Error)
- 👥 Chọn nhóm người nhận
- 📋 Danh sách thông báo
- ✅ Đánh dấu đã đọc/chưa đọc
- 🗑️ Xóa thông báo

## 🎨 Design Features

### Colors & Gradients

- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Background**: `#f5f7fa` to `#ffffff`
- **Text Primary**: `#1a202c`
- **Text Secondary**: `#718096`

### Responsive Breakpoints

- **Desktop**: Full width (> 1024px)
- **Tablet**: Adjusted grid (768px - 1024px)
- **Mobile**: Single column layout (< 768px)

### Components

- **Cards**: Subtle shadows and hover effects
- **Modals**: Centered overlays with smooth animations
- **Tables**: Striped rows with hover effects
- **Forms**: Clear labels and focus states
- **Badges**: Color-coded status indicators

## 📝 Mock Data

Tất cả components hiện tại sử dụng mock data. Để kết nối với API thực:

### Thay đổi UserManagement.js:

```jsx
// Thay useEffect để fetch từ API
useEffect(() => {
  const fetchUsers = async () => {
    const response = await fetch("/api/users");
    const data = await response.json();
    setUsers(data);
  };
  fetchUsers();
}, []);

// Thay handleSaveUser để call API
const handleSaveUser = async (e) => {
  e.preventDefault();
  if (editingUser) {
    await fetch(`/api/users/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  } else {
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  }
};
```

## 🔧 Customization

### Thay đổi màu sắc:

Tất cả các file CSS chứa các gradient và color variables ở đầu. Bạn có thể:

1. Tìm `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
2. Thay thế với màu của bạn

### Thay đổi Icons:

Tất cả icons sử dụng `react-icons`. Thay đổi imports:

```jsx
import { FaUsers, FaNewspaper } from "react-icons/fa";
// Hoặc sử dụng icon set khác
import { AiOutlineUser } from "react-icons/ai";
```

### Thay đổi Menu Items:

Chỉnh sửa `menuItems` array trong `Sidebar.js`:

```jsx
const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: FaChartBar,
  },
  // Thêm menu item mới
  {
    id: "reports",
    label: "Báo cáo",
    icon: FaFileAlt,
  },
];
```

## 🔗 API Endpoints (Cần Implement)

Sau khi tích hợp với backend, hãy implement các endpoints sau:

### Users

- `GET /api/users` - Lấy danh sách người dùng
- `POST /api/users` - Tạo người dùng mới
- `PUT /api/users/:id` - Cập nhật người dùng
- `DELETE /api/users/:id` - Xóa người dùng

### News

- `GET /api/news` - Lấy danh sách tin tức
- `POST /api/news` - Tạo tin tức mới
- `PUT /api/news/:id` - Cập nhật tin tức
- `DELETE /api/news/:id` - Xóa tin tức

### Email Campaigns

- `GET /api/campaigns` - Lấy danh sách chiến dịch
- `POST /api/campaigns` - Tạo chiến dịch mới
- `PUT /api/campaigns/:id` - Cập nhật chiến dịch
- `DELETE /api/campaigns/:id` - Xóa chiến dịch
- `POST /api/campaigns/:id/send` - Gửi chiến dịch

### Notifications

- `GET /api/notifications` - Lấy danh sách thông báo
- `POST /api/notifications` - Gửi thông báo
- `DELETE /api/notifications/:id` - Xóa thông báo

## ⚙️ Configuration

### Thay đổi số lượng hiển thị trong bảng:

Thêm pagination logic vào các components (hiện tại hiển thị tất cả)

### Thay đổi modal size:

Chỉnh sửa class `modal-large` hoặc thêm size khác

### Thay đổi sidebar width:

Chỉnh sửa giá trị `width: 280px` trong Sidebar.css

## 📱 Responsive Design Notes

- **Mobile**: Sidebar collapsible, tables hiển thị dạng card
- **Tablet**: Grid 2-3 columns
- **Desktop**: Full grid layout

## 🐛 Troubleshooting

### Icons không hiển thị

```bash
npm install react-icons
```

### Styles không load

Đảm bảo tất cả CSS files được import trong main.js

### Modal không responsive

Kiểm tra media queries trong CSS files

## 📚 Dependencies

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "react-icons": "^4.10.0"
}
```

## 🎯 Performance Tips

1. **Lazy load** các components để giảm bundle size
2. **Memoize** các components không cần re-render
3. **Paginate** danh sách lớn
4. **Optimize** images trong NewsPost

## 📞 Support

Để nhận hỗ trợ hoặc báo cáo lỗi, hãy liên hệ với team phát triển.

---

**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: 17/12/2024  
**Tác giả**: Admin Dashboard Team
