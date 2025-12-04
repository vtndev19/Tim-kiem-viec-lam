# CV Builder - Hướng Dẫn Sử Dụng

## 📋 Tính Năng

### 1. **Thông tin cá nhân**

- Họ và tên
- Chức danh
- Email
- Điện thoại
- Địa chỉ
- Ảnh đại diện (tự động resize)

### 2. **Giới thiệu bản thân**

- Mô tả tổng quát về bản thân
- Hỗ trợ nhiều dòng

### 3. **Học vấn**

- Thêm/xóa nhiều trường học
- Trường học, bằng cấp, năm tốt nghiệp, chi tiết

### 4. **Kinh nghiệm làm việc**

- Thêm/xóa nhiều công ty
- Công ty, chức vị, thời gian, mô tả công việc

### 5. **Kỹ năng**

- Thêm/xóa nhiều lĩnh vực kỹ năng
- Lĩnh vực (Frontend, Backend, Tools, v.v.)
- Chi tiết kỹ năng (danh sách)

### 6. **Thiết kế**

- 5 font chữ lựa chọn (Arial, Times New Roman, Georgia, Verdana, Courier New)
- Điều chỉnh kích thước font (8-14pt)
- 8 màu chính để chọn

## 📄 Tối Ưu In Ấn

### ✅ Chuẩn A4

- Kích thước: 210mm x 297mm
- Padding: 15mm x 12mm
- Không có margin trên/dưới

### ✅ Ảnh Khi In

- Ảnh được tối ưu với `object-fit: cover`
- Không bị tràn ra ngoài khung A4
- Tự động crop đẹp mắt

### ✅ Print Media

```scss
@media print {
  - Ẩn sidebar và preview controls
  - A4 size chuẩn không đổi
  - Margins 0
  - No page breaks inside items
}
```

## 🎨 Layout

### Bên Trái (Sidebar)

- 320px width
- Các tabs chỉnh sửa
- Form inputs
- Nút In / Lưu

### Bên Phải (Preview)

- CV Preview A4
- Real-time update khi chỉnh sửa
- Scroll riêng

## 🖨 In / Lưu

### Nút In CV

- Click "🖨 In CV"
- Mở dialog in
- Chọn "Lưu dưới dạng PDF" hoặc "In ra máy in"
- A4 tự động chuẩn

### Nút Lưu

- Lưu CV vào localStorage (có thể thêm backend API)
- Bảo toàn tất cả dữ liệu

## 📱 Responsive

- Desktop: 2 panel side-by-side
- Tablet: Stack các tab
- Mobile: Full width

## 💡 Tips

1. **Ảnh tốt:** Dùng ảnh chân dung (3x4 ratio) để tránh crop không đẹp
2. **Màu chính:** Chọn một màu sáng để dễ đọc khi in
3. **Font:** Arial hoặc Times New Roman là an toàn nhất
4. **Content:** Giữ CV tối đa 1-2 trang A4

## 🔧 Technical

- State: formData object lưu tất cả dữ liệu
- Real-time rendering: onChange updates CV preview
- Print: CSS media queries tối ưu
- A4 strict: Không margin, padding chính xác
