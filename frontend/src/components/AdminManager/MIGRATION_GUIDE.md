# Migration Guide: CSS to SCSS Conversion & Layout Fix

## 📋 Tóm tắt thay đổi

Tất cả các file CSS trong AdminManager đã được chuyển đổi thành SCSS với cấu trúc lồng nhau, đồng thời sửa lỗi layout khi sidebar đè lên nội dung.

## 🔄 Các file đã chuyển đổi

### SCSS Files (6 files)

```
✅ Dashboard.scss      - Layout chính với fix overlap
✅ Sidebar.scss        - Navigation sidebar với biến màu
✅ UserManagement.scss - Quản lý người dùng
✅ NewsPost.scss       - Quản lý bài viết
✅ EmailMarketing.scss - Quản lý chiến dịch email
✅ NotificationPanel.scss - Quản lý thông báo
```

### Component Files (6 files)

Tất cả đã được cập nhật imports từ `.css` → `.scss`:

```
✅ Dashboard.js
✅ Sidebar.js
✅ UserManagement.js
✅ NewsPost.js
✅ EmailMarketing.js
✅ NotificationPanel.js
```

## 🎨 Cấu trúc SCSS

Mỗi file SCSS bây giờ có:

### 1. **Variables Section**

```scss
// Color Variables
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$bg-primary: #f5f7fa;
$text-primary: #1a202c;
$text-secondary: #718096;
// ... và nhiều biến khác
```

### 2. **Nested Selectors**

```scss
.dashboard-container {
  .dashboard-content {
    // nested styles
  }

  .stat-card {
    &:hover {
      // pseudo-class styles
    }
  }
}
```

### 3. **Mixins & Functions** (có thể thêm sau)

```scss
@mixin button-base {
  border: none;
  border-radius: 8px;
  // ... common styles
}
```

## 🔧 Fix Layout Overlap

### Vấn đề cũ:

- Sidebar: `position: fixed` (280px width)
- Content: `flex: 1` → bị đè lên bởi sidebar

### Giải pháp mới:

```scss
.dashboard-container {
  display: flex;

  .dashboard-content {
    flex: 1;
    margin-left: $sidebar-width; // ← Cách xa sidebar
    width: calc(100% - $sidebar-width); // ← Chiều rộng điều chỉnh

    @media (max-width: 768px) {
      margin-left: 0; // ← Mobile: không cách
      width: 100%; // ← Mobile: full width
    }
  }
}
```

## 📱 Responsive Design

Layout giờ đã sửa đúng cho cả desktop và mobile:

### Desktop (≥768px)

```
┌─────────────────────────────────────────┐
│ SIDEBAR (280px) │ CONTENT (calc width)  │
│                 │                       │
│                 │ Không bị đè lên       │
│                 │                       │
└─────────────────────────────────────────┘
```

### Mobile (<768px)

```
┌──────────────────────────┐
│  SIDEBAR (toggle)        │
├──────────────────────────┤
│ CONTENT (full width)     │
│                          │
└──────────────────────────┘
```

## ✨ Lợi ích SCSS

1. **Variables** - Quản lý màu sắc tập trung
2. **Nesting** - Cấu trúc rõ ràng, giảm lặp lại
3. **Mixins** - Tái sử dụng code (thêm sau)
4. **Functions** - Tính toán động (thêm sau)
5. **Imports** - Chia nhỏ file (thêm sau)

## 🚀 Cách sử dụng

### Import trong Component:

```javascript
import "../styles/Dashboard.scss";
import "../styles/Sidebar.scss";
```

### Biến toàn cầu:

Bạn có thể tạo file `_variables.scss` để chia sẻ biến:

```scss
// src/components/AdminManager/styles/_variables.scss
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$sidebar-width: 280px;
// ...
```

Rồi import trong các file SCSS khác:

```scss
@import "variables";
```

## 📝 Cấu trúc thư mục hiện tại

```
AdminManager/
├── components/
│   ├── Dashboard.js
│   ├── Sidebar.js
│   ├── UserManagement.js
│   ├── NewsPost.js
│   ├── EmailMarketing.js
│   ├── NotificationPanel.js
│   └── main.js
└── styles/
    ├── Dashboard.scss       ✅
    ├── Sidebar.scss        ✅
    ├── UserManagement.scss ✅
    ├── NewsPost.scss       ✅
    ├── EmailMarketing.scss ✅
    └── NotificationPanel.scss ✅
```

## ⚠️ Lưu ý quan trọng

1. **Xóa file CSS cũ** - Sau khi verify SCSS hoạt động tốt:

   ```bash
   # Các file CSS cũ có thể xóa hoặc giữ backup
   Dashboard.css
   Sidebar.css
   UserManagement.css
   NewsPost.css
   EmailMarketing.css
   NotificationPanel.css
   ```

2. **SCSS Compiler** - Create React App tự động compile SCSS, không cần config thêm

3. **Testing** - Kiểm tra layout trên:
   - Desktop (≥1200px, 1024px, 768px)
   - Tablet (768px)
   - Mobile (<768px)

## 🧪 Test Checklist

- [ ] Sidebar hiển thị ở bên trái (desktop)
- [ ] Content không bị đè lên sidebar
- [ ] Scroll content mà sidebar cố định
- [ ] Mobile: sidebar ẩn, content full width
- [ ] Màu sắc giống hệt cũ
- [ ] Hover effects hoạt động
- [ ] Modals hiển thị đúng
- [ ] Tables responsive đúng

## 📚 Tài liệu SCSS

- **Sass Guide**: https://sass-lang.com/guide
- **SCSS vs CSS**: https://sass-lang.com/documentation/syntax
- **Nested Selectors**: https://sass-lang.com/documentation/nesting

## 🎯 Next Steps

1. ✅ Chuyển CSS → SCSS xong
2. ✅ Fix layout overlap xong
3. ⬜ Có thể thêm: File \_variables.scss chung
4. ⬜ Có thể thêm: Mixins cho buttons, cards
5. ⬜ Có thể thêm: Animation library

---

**Date**: 2025-12-17  
**Status**: ✅ Hoàn thành
