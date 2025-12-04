# 🔧 Kế Hoạch Tái Cấu Trúc Frontend - Component-Based Architecture

## 📋 Phân Tích Cấu Trúc Hiện Tại

### ❌ Vấn Đề Hiện Tại
```
frontend/src/
├── components/
│   ├── AdminPostBox.js
│   ├── Chat.js
│   ├── HomeBanner.js  ← Chỉ có JS, không có SCSS
│   ├── HomeHeader.js  ← Chỉ có JS, không có SCSS
│   └── ... (16 files chỉ có JS)
├── Page/
│   ├── AllJobs.js
│   ├── HiringDashboard.js
│   ├── HiringDashboard.scss  ← SCSS tách riêng
│   ├── ApplicantDashboard/   ← Mới (đã có cấu trúc mô-đun)
│   └── ...
├── styles/              ← ⚠️ SCSS bị tập trung ở đây
│   ├── global.scss
│   ├── page/
│   │   ├── JobDetail.scss
│   │   ├── Login.scss
│   │   └── Register.scss
│   ├── hiring/
│   │   ├── variables.scss
│   │   └── main.scss
│   └── components/
│       └── HomeStats.scss
└── ...
```

### ✅ Cấu Trúc Mục Tiêu (Target)
```
frontend/src/
├── assets/
│   ├── images/
│   └── styles/                      ← Global styles chỉ
│       ├── _variables.scss          (Màu sắc, typography, spacing)
│       ├── _mixins.scss             (Hàm SCSS dùng chung)
│       ├── _reset.scss              (CSS Reset)
│       └── global.scss              (Global rules)
│
├── components/                      ← Reusable Components (Size nhỏ)
│   ├── AdminPostBox/
│   │   ├── AdminPostBox.jsx
│   │   └── AdminPostBox.module.scss
│   ├── Chat/
│   │   ├── Chat.jsx
│   │   ├── Chat.module.scss
│   │   └── index.js
│   ├── HomeHeader/
│   │   ├── HomeHeader.jsx
│   │   ├── HomeHeader.module.scss
│   │   └── index.js
│   ├── HomeBanner/
│   │   ├── HomeBanner.jsx
│   │   ├── HomeBanner.module.scss
│   │   └── index.js
│   ├── ImageSlideBox/
│   │   ├── ImageSlideBox.jsx
│   │   ├── ImageSlideBox.module.scss
│   │   └── index.js
│   ├── RecommendJobs/
│   │   ├── RecommendJobs.jsx
│   │   ├── RecommendJobs.module.scss
│   │   └── index.js
│   ├── FeaturedIndustries/
│   │   ├── FeaturedIndustries.jsx
│   │   ├── FeaturedIndustries.module.scss
│   │   └── index.js
│   ├── Footer/
│   │   ├── Footer.jsx
│   │   ├── Footer.module.scss
│   │   └── index.js
│   ├── CVPrintTemplate/
│   │   ├── CVPrintTemplate.jsx
│   │   ├── CVPrintTemplate.module.scss
│   │   └── index.js
│   ├── CVBuilder/                   (keep folder structure)
│   │   ├── index.jsx
│   │   ├── CVBuilder.module.scss
│   │   └── ... (sub-components)
│   ├── hiring/                      (keep folder structure - domain)
│   │   ├── HiringHeader/
│   │   ├── HiringHero/
│   │   ├── JobPostingForm/
│   │   ├── JobCard/
│   │   ├── ... (all with module.scss)
│   │   └── index.js
│   ├── news/                        (keep folder structure)
│   ├── model/                       (keep folder structure)
│   ├── Applications/                (keep folder structure)
│   └── index.js                     ← Re-export all components
│
├── pages/                           ← Page Components (Size lớn, Route-based)
│   ├── Home/
│   │   ├── Home.jsx
│   │   ├── Home.module.scss
│   │   └── index.js
│   ├── AllJobs/
│   │   ├── AllJobs.jsx
│   │   ├── AllJobs.module.scss
│   │   └── index.js
│   ├── JobDetail/
│   │   ├── JobDetail.jsx
│   │   ├── JobDetail.module.scss
│   │   └── index.js
│   ├── Company/
│   │   ├── Company.jsx
│   │   ├── Company.module.scss
│   │   └── index.js
│   ├── CompanyDetail/
│   │   ├── CompanyDetail.jsx
│   │   ├── CompanyDetail.module.scss
│   │   └── index.js
│   ├── CompanyLanding/
│   │   ├── CompanyLanding.jsx
│   │   ├── CompanyLanding.module.scss
│   │   └── index.js
│   ├── CVBuilder/
│   │   ├── CVBuilder.jsx
│   │   ├── CVBuilder.module.scss
│   │   └── index.js
│   ├── CVList/
│   │   ├── CVList.jsx
│   │   ├── CVList.module.scss
│   │   └── index.js
│   ├── CVManager/
│   │   ├── CVManager.jsx
│   │   ├── CVManager.module.scss
│   │   └── index.js
│   ├── ViewCV/
│   │   ├── ViewCV.jsx
│   │   ├── ViewCV.module.scss
│   │   └── index.js
│   ├── Login/
│   │   ├── Login.jsx
│   │   ├── Login.module.scss
│   │   └── index.js
│   ├── Register/
│   │   ├── Register.jsx
│   │   ├── Register.module.scss
│   │   └── index.js
│   ├── HiringDashboard/
│   │   ├── HiringDashboard.jsx
│   │   ├── HiringDashboard.module.scss
│   │   └── index.js
│   ├── HiringPage/
│   │   ├── HiringPage.jsx
│   │   ├── HiringPage.module.scss
│   │   └── index.js
│   ├── ApplicantDashboard/
│   │   ├── ApplicantDashboard.jsx
│   │   ├── ApplicantDashboard.module.scss
│   │   ├── components/
│   │   │   ├── StatCard.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── ApplicantTable.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── Modal.jsx
│   │   ├── styles/
│   │   │   ├── _variables.scss
│   │   │   ├── ApplicantDashboard.module.scss
│   │   │   ├── ApplicantTable.module.scss
│   │   │   ├── StatCard.module.scss
│   │   │   ├── FilterBar.module.scss
│   │   │   ├── Badge.module.scss
│   │   │   └── Modal.module.scss
│   │   └── index.js
│   ├── Profile/
│   │   ├── Profile.jsx
│   │   ├── Profile.module.scss
│   │   └── index.js
│   ├── SavedJobsPage/
│   │   ├── SavedJobsPage.jsx
│   │   ├── SavedJobsPage.module.scss
│   │   └── index.js
│   ├── News/
│   │   ├── News.jsx
│   │   ├── News.module.scss
│   │   └── index.js
│   ├── UserBlogPage/
│   │   ├── UserBlogPage.jsx
│   │   ├── UserBlogPage.module.scss
│   │   └── index.js
│   └── index.js
│
├── utils/
│   ├── helpers.js
│   ├── validators.js
│   └── ...
├── services/
├── context/
├── data/
├── api/
├── App.jsx
├── index.js
└── reportWebVitals.js
```

---

## 📊 Mapping: File Cũ → File Mới

| Loại | File Cũ | File Mới | Ghi Chú |
|------|---------|---------|--------|
| Component | `components/AdminPostBox.js` | `components/AdminPostBox/AdminPostBox.jsx` | → index.js re-export |
| Component | `components/Chat.js` | `components/Chat/Chat.jsx` | → CSS Modules |
| Component | `components/HomeBanner.js` | `components/HomeBanner/HomeBanner.jsx` | → Tìm SCSS |
| Component | `components/HomeHeader.js` | `components/HomeHeader/HomeHeader.jsx` | → Tìm SCSS |
| Component | `components/HomeJobs.js` | `components/HomeJobs/HomeJobs.jsx` | → Tìm SCSS |
| Component | `components/HomeSearch.js` | `components/HomeSearch/HomeSearch.jsx` | → Tìm SCSS |
| Component | `components/ImageSlideBox.js` | `components/ImageSlideBox/ImageSlideBox.jsx` | → Tìm SCSS |
| Component | `components/RecommendJobs.js` | `components/RecommendJobs/RecommendJobs.jsx` | → Tìm SCSS |
| Component | `components/FeaturedIndustries.js` | `components/FeaturedIndustries/FeaturedIndustries.jsx` | → Tìm SCSS |
| Component | `components/Footer.js` | `components/Footer/Footer.jsx` | → Tìm SCSS |
| Component | `components/CVPrintTemplate.js` | `components/CVPrintTemplate/CVPrintTemplate.jsx` | → Tìm SCSS |
| Component | `components/employerRegistration.js` | `components/EmployerRegistration/EmployerRegistration.jsx` | → Tìm SCSS |
| Page | `Page/AllJobs.js` | `pages/AllJobs/AllJobs.jsx` | + `AllJobs.module.scss` |
| Page | `Page/Company.js` | `pages/Company/Company.jsx` | + `Company.module.scss` |
| Page | `Page/companyDetail.js` | `pages/CompanyDetail/CompanyDetail.jsx` | + `CompanyDetail.module.scss` |
| Page | `Page/CompanyLanding.js` | `pages/CompanyLanding/CompanyLanding.jsx` | + migrate SCSS |
| Page | `Page/CVBuilder.js` | `pages/CVBuilder/CVBuilder.jsx` | + CVBuilder.module.scss |
| Page | `Page/CVList.js` | `pages/CVList/CVList.jsx` | + CVList.module.scss |
| Page | `Page/CVManager.js` | `pages/CVManager/CVManager.jsx` | + CVManager.module.scss |
| Page | `Page/ViewCV.js` | `pages/ViewCV/ViewCV.jsx` | + ViewCV.module.scss |
| Page | `Page/Login.js` | `pages/Login/Login.jsx` | + migrate `styles/page/Login.scss` |
| Page | `Page/Register.js` | `pages/Register/Register.jsx` | + migrate `styles/page/Register.scss` |
| Page | `Page/HiringDashboard.js` | `pages/HiringDashboard/HiringDashboard.jsx` | + migrate HiringDashboard.scss |
| Page | `Page/HiringPage.js` | `pages/HiringPage/HiringPage.jsx` | + HiringPage.module.scss |
| Page | `Page/ApplicantDashboard/ApplicantDashboard.js` | `pages/ApplicantDashboard/ApplicantDashboard.jsx` | ✅ Keep (already modular) |
| Page | `Page/Profile.js` | `pages/Profile/Profile.jsx` | + Profile.module.scss |
| Page | `Page/SavedJobsPage.js` | `pages/SavedJobsPage/SavedJobsPage.jsx` | + SavedJobsPage.module.scss |
| Page | `Page/News.js` | `pages/News/News.jsx` | + News.module.scss |
| Page | `Page/UserBlogPage.js` | `pages/UserBlogPage/UserBlogPage.jsx` | + UserBlogPage.module.scss |
| Style | `styles/global.scss` | `assets/styles/global.scss` | ✅ Move (global) |
| Style | `styles/page/JobDetail.scss` | `pages/JobDetail/JobDetail.module.scss` | Rename → module |
| Style | `styles/components/HomeStats.scss` | `components/HomeStats/HomeStats.module.scss` | Rename → module |
| Style | `styles/hiring/` | `components/hiring/` + module naming | ✅ Move + rename |

---

## 🛠 Các Bước Thực Hiện

### Phase 1: Chuẩn Bị
- [ ] Backup toàn bộ `frontend/src` folder
- [ ] Tạo script Node.js để tự động refactor
- [ ] Setup jsconfig.json với alias `@`

### Phase 2: Tái Cấu Trúc File
- [ ] Tạo folder structure mới (components/, pages/, assets/styles/)
- [ ] Move + rename JS files thành JSX
- [ ] Move + rename SCSS files thành module.scss
- [ ] Tạo index.js files cho re-export

### Phase 3: Update Imports
- [ ] Scan và update tất cả import statements
- [ ] Thay đổi style imports từ CSS → CSS Modules
- [ ] Cập nhật className thành {styles.className}

### Phase 4: Kiểm Tra
- [ ] npm start không có error
- [ ] Kiểm tra styling hoạt động đúng
- [ ] Test tất cả routes
- [ ] Verifyno dead imports

---

## 📝 Quy Tắc Đặt Tên

### JavaScript
- **Components**: `ComponentName.jsx`
- **Pages**: `PageName.jsx`
- **Services**: `serviceName.js`
- **Utils**: `utilName.js`
- **Hooks**: `useHookName.js`

### Styles
- **CSS Modules**: `ComponentName.module.scss`
- **Variables**: `_variables.scss`
- **Mixins**: `_mixins.scss`
- **Global**: `global.scss`

### Folders
- `components/ComponentName/` (PascalCase)
- `pages/PageName/` (PascalCase)
- `utils/` (lowercase)
- `services/` (lowercase)

---

## 💾 Lợi Ích Của Tái Cấu Trúc

✅ **Modularity**: Mỗi component = thư mục độc lập  
✅ **Easy to Find**: Tìm code component dễ hơn  
✅ **CSS Isolation**: Không có style conflicts  
✅ **Reusability**: Dễ re-export và dùng lại  
✅ **Scalability**: Dễ thêm features mới  
✅ **Maintenance**: Dễ fix bugs + unit tests  
✅ **Team Collaboration**: Clear structure, less confusion  

---

## ⚠️ Lưu Ý Khi Refactor

1. **Import Paths**: Update đầy đủ tất cả relative imports
2. **CSS Modules**: Thay `className="header"` → `className={styles.header}`
3. **Global Styles**: Import `global.scss` trong `index.js` (một lần duy nhất)
4. **Image Paths**: Nếu import images, update paths từ `src/assets/images` → `@/assets/images`
5. **Context/Services**: Không cần move, chỉ update import paths

---

## 🚀 Tiếp Theo

1. Chạy refactor script (sẽ được tạo tiếp)
2. Fix import errors nếu có
3. Test toàn app
4. Cleanup old folders
5. Commit to git

