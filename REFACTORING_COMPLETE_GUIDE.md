# Complete Project Refactoring Guide - Nested Component Architecture

## Overview

Transforming from **flat/scattered** structure to **modular nested component-based** structure for better scalability and maintainability.

---

## Target Architecture

```
src/
├── pages/                          # NEW: All page-level components
│   ├── Home/                       # Main homepage
│   │   ├── Home.jsx               # Or HomeMain.jsx
│   │   ├── components/             # Home-specific sub-components
│   │   │   ├── HomeBanner.jsx
│   │   │   ├── HomeHeader.jsx
│   │   │   ├── HomeJobs.jsx
│   │   │   ├── HomeSearch.jsx
│   │   │   └── HomeFilters.jsx    # (if extracted)
│   │   └── styles/
│   │       ├── Home.scss
│   │       ├── HomeBanner.scss
│   │       └── _variables.scss
│   │
│   ├── Login/
│   │   ├── Login.jsx
│   │   └── styles/
│   │       └── Login.scss
│   │
│   ├── Register/
│   │   ├── Register.jsx
│   │   └── styles/
│   │       └── Register.scss
│   │
│   ├── AllJobs/
│   │   ├── AllJobs.jsx
│   │   ├── components/
│   │   │   ├── JobFilter.jsx
│   │   │   ├── JobCard.jsx
│   │   │   └── Pagination.jsx
│   │   └── styles/
│   │       └── AllJobs.scss
│   │
│   ├── JobDetail/
│   │   ├── JobDetail.jsx
│   │   ├── components/
│   │   │   ├── JobHeader.jsx
│   │   │   ├── JobDescription.jsx
│   │   │   ├── ApplicationModal.jsx
│   │   │   └── SaveButton.jsx
│   │   └── styles/
│   │       └── JobDetail.scss
│   │
│   ├── Profile/
│   │   ├── Profile.jsx
│   │   ├── components/
│   │   │   ├── ProfileInfo.jsx
│   │   │   ├── ChangePassword.jsx
│   │   │   └── ProfileSettings.jsx
│   │   └── styles/
│   │       └── Profile.scss
│   │
│   ├── CVBuilder/
│   │   ├── CVBuilder.jsx
│   │   ├── components/
│   │   │   ├── CVDocument.jsx
│   │   │   ├── CVInputSidebar.jsx
│   │   │   ├── CVPreviewArea.jsx
│   │   │   ├── CVTopTabs.jsx
│   │   │   ├── forms/
│   │   │   │   ├── CVFormInfo.jsx
│   │   │   │   ├── CVFormEducation.jsx
│   │   │   │   ├── CVFormExperience.jsx
│   │   │   │   ├── CVFormSkills.jsx
│   │   │   │   ├── CVFormSummary.jsx
│   │   │   │   └── CVFormStyle.jsx
│   │   │   └── sections/
│   │   │       ├── CVHeader.jsx
│   │   │       ├── CVSummary.jsx
│   │   │       ├── CVEducation.jsx
│   │   │       ├── CVExperience.jsx
│   │   │       └── CVSkills.jsx
│   │   └── styles/
│   │       ├── CVBuilder.scss
│   │       ├── CVDocument.scss
│   │       ├── CVInputSidebar.scss
│   │       └── forms/
│   │
│   ├── CVList/
│   │   ├── CVList.jsx
│   │   └── styles/
│   │       └── CVList.scss
│   │
│   ├── ViewCV/
│   │   ├── ViewCV.jsx
│   │   └── styles/
│   │       └── ViewCV.scss
│   │
│   ├── Company/
│   │   ├── Company.jsx
│   │   ├── components/
│   │   │   ├── CompanyFilter.jsx
│   │   │   └── CompanyCard.jsx
│   │   └── styles/
│   │       └── Company.scss
│   │
│   ├── CompanyDetail/
│   │   ├── CompanyDetail.jsx
│   │   ├── components/
│   │   │   ├── CompanyHeader.jsx
│   │   │   ├── CompanyInfo.jsx
│   │   │   └── CompanyJobs.jsx
│   │   └── styles/
│   │       └── CompanyDetail.scss
│   │
│   ├── CompanyLanding/
│   │   ├── CompanyLanding.jsx
│   │   ├── components/
│   │   │   ├── CompanyBanner.jsx
│   │   │   ├── TopCompanies.jsx
│   │   │   └── AllCompanies.jsx
│   │   └── styles/
│   │       └── CompanyLanding.scss
│   │
│   ├── Hiring/
│   │   ├── Hiring.jsx
│   │   ├── components/
│   │   │   ├── HiringHeader.jsx
│   │   │   ├── HiringHero.jsx
│   │   │   ├── JobPostingForm.jsx
│   │   │   ├── JobManagementList.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── JobEditModal.jsx
│   │   │   ├── JobDetailModal.jsx
│   │   │   ├── ApplicantsList.jsx
│   │   │   ├── HiringFooter.jsx
│   │   │   └── index.js (exports all)
│   │   └── styles/
│   │       ├── Hiring.scss
│   │       ├── HiringHeader.scss
│   │       ├── JobPostingForm.scss
│   │       └── variables.scss
│   │
│   ├── HiringDashboard/
│   │   ├── HiringDashboard.jsx
│   │   ├── components/
│   │   │   ├── DashboardHeader.jsx
│   │   │   ├── DashboardStats.jsx
│   │   │   ├── QuickActions.jsx
│   │   │   └── RecentActivity.jsx
│   │   └── styles/
│   │       └── HiringDashboard.scss
│   │
│   ├── ApplicantDashboard/
│   │   ├── ApplicantDashboard.jsx
│   │   ├── components/
│   │   │   ├── ApplicantTable.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── applicantService.js
│   │   └── styles/
│   │       ├── ApplicantDashboard.module.scss
│   │       ├── ApplicantTable.module.scss
│   │       ├── FilterBar.module.scss
│   │       ├── StatCard.module.scss
│   │       ├── Badge.module.scss
│   │       ├── Modal.module.scss
│   │       └── _variables.scss
│   │
│   ├── SavedJobs/
│   │   ├── SavedJobs.jsx
│   │   └── styles/
│   │       └── SavedJobs.scss
│   │
│   ├── News/
│   │   ├── News.jsx
│   │   ├── components/
│   │   │   ├── NewsArticle.jsx
│   │   │   ├── NewsAdvertisement.jsx
│   │   │   ├── NewsSidebar.jsx
│   │   │   └── index.js
│   │   └── styles/
│   │       ├── News.scss
│   │       ├── newsArticle.scss
│   │       ├── newsAdvertisement.scss
│   │       └── newsSidebar.scss
│   │
│   └── UserBlog/
│       ├── UserBlog.jsx
│       └── styles/
│           └── UserBlog.scss
│
├── components/
│   ├── shared/                     # NEW: Truly shared components
│   │   ├── Header/
│   │   │   ├── Header.jsx
│   │   │   └── Header.scss
│   │   ├── Footer/
│   │   │   ├── Footer.jsx
│   │   │   └── Footer.scss
│   │   ├── Chat/
│   │   │   ├── Chat.jsx
│   │   │   ├── chatRealtime.jsx
│   │   │   └── Chat.scss
│   │   ├── CVPrintTemplate/
│   │   │   ├── CVPrintTemplate.jsx
│   │   │   └── CVPreview.scss
│   │   ├── Navigation/
│   │   │   ├── Navigation.jsx
│   │   │   └── Navigation.scss
│   │   ├── FeaturedIndustries/
│   │   │   ├── FeaturedIndustries.jsx
│   │   │   └── FeaturedIndustries.scss
│   │   ├── RecommendJobs/
│   │   │   ├── RecommendJobs.jsx
│   │   │   └── RecommendJobs.scss
│   │   ├── ImageSlide/
│   │   │   ├── ImageSlide.jsx
│   │   │   └── ImageSlide.scss
│   │   ├── ImageSlideBox/
│   │   │   ├── ImageSlideBox.jsx
│   │   │   └── ImageSlideBox.scss
│   │   ├── AdminPostBox/
│   │   │   ├── AdminPostBox.jsx
│   │   │   └── AdminPostBox.scss
│   │   ├── AdminPostItem/
│   │   │   ├── AdminPostItem.jsx
│   │   │   └── AdminPostItem.scss
│   │   ├── EmployerRegistration/
│   │   │   ├── EmployerRegistration.jsx
│   │   │   └── EmployerRegistration.scss
│   │   └── index.js (barrel export all)
│   │
│   └── Shared/                     # Keep existing structure for now
│       ├── Button/
│       ├── Input/
│       ├── Modal/
│       └── etc...
│
├── assets/
│   ├── styles/
│   │   ├── global.scss             # KEEP: Global styles
│   │   ├── variables.scss          # KEEP: Global color/spacing variables
│   │   ├── mixins.scss             # KEEP: Global SCSS mixins
│   │   └── reset.scss              # KEEP: CSS reset
│   ├── images/
│   └── fonts/
│
├── context/
│   ├── AuthContext.jsx
│   └── index.js
│
├── hooks/
│   ├── useAuth.js
│   ├── useJobs.js
│   └── useAPI.js
│
├── services/
│   ├── ChatService.js
│   ├── api.js
│   └── index.js
│
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
│
├── data/
│   └── db.json
│
├── App.jsx                         # KEEP: Main app file
├── index.js                        # KEEP: Entry point
└── index.css                       # KEEP: Root styles
```

---

## Migration Steps (Detailed)

### Phase 1: Setup Path Aliases ✅ (DO FIRST)

Create `jsconfig.json` in `frontend/` (or use `tsconfig.json` if TypeScript):

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@pages/*": ["pages/*"],
      "@components/*": ["components/*"],
      "@shared/*": ["components/shared/*"],
      "@styles/*": ["assets/styles/*"],
      "@context/*": ["context/*"],
      "@services/*": ["services/*"],
      "@utils/*": ["utils/*"],
      "@hooks/*": ["hooks/*"],
      "@data/*": ["data/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

**Benefits:**

- `import Header from '@shared/Header/Header'` instead of `../../../components/shared/Header/Header`
- Cleaner, more maintainable imports
- Same structure across all files

### Phase 2: Move Shared Components → src/components/shared/

| Old Path                             | New Path                                                          |
| ------------------------------------ | ----------------------------------------------------------------- |
| `components/HomeHeader.js`           | `components/shared/Header/Header.jsx`                             |
| `components/Footer.js`               | `components/shared/Footer/Footer.jsx`                             |
| `components/Chat.js`                 | `components/shared/Chat/Chat.jsx`                                 |
| `components/chatRealtime.js`         | `components/shared/Chat/chatRealtime.jsx`                         |
| `components/CVPrintTemplate.js`      | `components/shared/CVPrintTemplate/CVPrintTemplate.jsx`           |
| `components/ImageSlide.js`           | `components/shared/ImageSlide/ImageSlide.jsx`                     |
| `components/ImageSlideBox.js`        | `components/shared/ImageSlideBox/ImageSlideBox.jsx`               |
| `components/FeaturedIndustries.js`   | `components/shared/FeaturedIndustries/FeaturedIndustries.jsx`     |
| `components/RecommendJobs.js`        | `components/shared/RecommendJobs/RecommendJobs.jsx`               |
| `components/HomeJobs.js`             | `components/shared/HomeJobs/HomeJobs.jsx`                         |
| `components/HomeSearch.js`           | `components/shared/HomeSearch/HomeSearch.jsx`                     |
| `components/AdminPostBox.js`         | `components/shared/AdminPostBox/AdminPostBox.jsx`                 |
| `components/adminPostItem.js`        | `components/shared/AdminPostItem/AdminPostItem.jsx`               |
| `components/employerRegistration.js` | `components/shared/EmployerRegistration/EmployerRegistration.jsx` |

**Corresponding styles** (create folder structure):

```
components/shared/Header/Header.scss
components/shared/Footer/Footer.scss
components/shared/Chat/Chat.scss
... etc
```

### Phase 3: Move Pages → src/pages/

| Old Path                    | New Path                                                        |
| --------------------------- | --------------------------------------------------------------- |
| `Page/Login.js`             | `pages/Login/Login.jsx`                                         |
| `Page/Register.js`          | `pages/Register/Register.jsx`                                   |
| `Page/AllJobs.js`           | `pages/AllJobs/AllJobs.jsx`                                     |
| `Page/JobDetail.js`         | `pages/JobDetail/JobDetail.jsx`                                 |
| `Page/Profile.js`           | `pages/Profile/Profile.jsx`                                     |
| `Page/CVBuilder.js`         | `pages/CVBuilder/CVBuilder.jsx`                                 |
| `Page/CVList.js`            | `pages/CVList/CVList.jsx`                                       |
| `Page/ViewCV.js`            | `pages/ViewCV/ViewCV.jsx`                                       |
| `Page/cvManager.js`         | `pages/CVManager/CVManager.jsx`                                 |
| `Page/Company.js`           | `pages/Company/Company.jsx`                                     |
| `Page/companyDetail.js`     | `pages/CompanyDetail/CompanyDetail.jsx`                         |
| `Page/CompanyLanding.js`    | `pages/CompanyLanding/CompanyLanding.jsx`                       |
| `Page/HiringPage.js`        | `pages/Hiring/Hiring.jsx`                                       |
| `Page/HiringDashboard.js`   | `pages/HiringDashboard/HiringDashboard.jsx`                     |
| `Page/SavedJobsPage.js`     | `pages/SavedJobs/SavedJobs.jsx`                                 |
| `Page/News.js`              | `pages/News/News.jsx`                                           |
| `Page/UserBlogPage.js`      | `pages/UserBlog/UserBlog.jsx`                                   |
| `Page/ApplicantDashboard/*` | `pages/ApplicantDashboard/*` (KEEP AS-IS - already refactored!) |

**For each page, create structure:**

```
pages/PageName/
├── PageName.jsx (renamed from Page*.js)
├── components/ (move page-specific components here)
└── styles/ (move page-specific .scss files here)
```

### Phase 4: Move Page-Specific Components

#### CVBuilder Module:

```
components/CVBuilder/*       →  pages/CVBuilder/components/
├─ forms/*                  →  pages/CVBuilder/components/forms/
├─ sections/*               →  pages/CVBuilder/components/sections/
└─ styles/*                 →  pages/CVBuilder/styles/
```

#### Hiring Module:

```
components/hiring/*         →  pages/Hiring/components/
├─ HiringHeader.js         →  pages/Hiring/components/HiringHeader.jsx
├─ HiringHero.js           →  pages/Hiring/components/HiringHero.jsx
├─ JobPostingForm.js       →  pages/Hiring/components/JobPostingForm.jsx
├─ index.js                →  pages/Hiring/components/index.js (export barrel)
└─ styles/                 →  pages/Hiring/styles/
```

#### News Module:

```
components/news/*          →  pages/News/components/
├─ NewsArticle.js         →  pages/News/components/NewsArticle.jsx
├─ NewsAdvertisement.js   →  pages/News/components/NewsAdvertisement.jsx
├─ NewsSidebar.js         →  pages/News/components/NewsSidebar.jsx
└─ styles/*               →  pages/News/styles/
```

#### Applications Module:

```
components/Applications/*   →  pages/JobDetail/components/ApplicationModal.jsx
```

#### Model Module:

```
components/model/*         →  pages/ (or shared - determine based on usage)
```

### Phase 5: Update Imports in All Files

#### Pattern 1: Component imports (OLD → NEW)

```javascript
// OLD
import HomeHeader from "../components/HomeHeader";

// NEW
import Header from "@shared/Header/Header";
```

#### Pattern 2: Style imports (OLD → NEW)

```javascript
// OLD
import "../styles/global.scss";
import "../styles/page/AllJobs.scss";

// NEW - GLOBAL STYLES (in App.jsx)
import "@styles/global.scss";

// NEW - PAGE SPECIFIC (in pages/AllJobs/AllJobs.jsx)
import "../styles/AllJobs.scss";
// OR with alias:
import "./styles/AllJobs.scss";
```

#### Pattern 3: Page imports (in App.jsx) (OLD → NEW)

```javascript
// OLD
import Login from "../Page/Login";
import AllJobs from "../Page/AllJobs";
import ApplicantDashboard from "../Page/ApplicantDashboard/ApplicantDashboard";

// NEW
import Login from "@pages/Login/Login";
import AllJobs from "@pages/AllJobs/AllJobs";
import ApplicantDashboard from "@pages/ApplicantDashboard/ApplicantDashboard";
```

#### Pattern 4: Context imports (OLD → NEW)

```javascript
// OLD
import { AuthContext } from "../context/AuthContext";

// NEW
import { AuthContext } from "@context/AuthContext";
```

---

## File Move Strategy (Using Terminal)

Since there are 60+ files to move, use PowerShell commands:

```powershell
# Move shared components (Windows PowerShell)
$components = @(
    "HomeHeader",
    "Footer",
    "Chat",
    "CVPrintTemplate",
    "ImageSlide",
    "ImageSlideBox",
    "FeaturedIndustries",
    "RecommendJobs",
    "HomeJobs",
    "HomeSearch",
    "AdminPostBox",
    "adminPostItem",
    "employerRegistration"
)

foreach ($comp in $components) {
    # Create folder: components/shared/ComponentName/
    # Move file: components/$comp.js → components/shared/ComponentName/$comp.jsx
    # Move styles: styles/components/$comp.scss → components/shared/ComponentName/$comp.scss
}

# Move pages (example for a few)
$pages = @(
    @{old="Page/Login.js"; new="pages/Login/Login.jsx"},
    @{old="Page/Register.js"; new="pages/Register/Register.jsx"},
    @{old="Page/AllJobs.js"; new="pages/AllJobs/AllJobs.jsx"}
)

foreach ($page in $pages) {
    # Move files and reorganize structure
}
```

---

## Import Update Strategy

### 1. Update views/App.jsx

Replace all Page imports:

```javascript
// BEFORE
import HomeHeader from "../components/HomeHeader";
import HomeBanner from "../components/HomeBanner";
import Footer from "../components/Footer";
import Login from "../Page/Login";
import AllJobs from "../Page/AllJobs";
import ApplicantDashboard from "../Page/ApplicantDashboard/ApplicantDashboard";

// AFTER
import Header from "@shared/Header/Header";
import HomeBanner from "@shared/HomeBanner/HomeBanner";
import Footer from "@shared/Footer/Footer";
import Login from "@pages/Login/Login";
import AllJobs from "@pages/AllJobs/AllJobs";
import ApplicantDashboard from "@pages/ApplicantDashboard/ApplicantDashboard";
```

### 2. Update each page file

Example for `pages/AllJobs/AllJobs.jsx`:

```javascript
// BEFORE
import "../styles/page/AllJobs.scss";
import ApplyModal from "../components/Applications/ApplyModal";

// AFTER
import "./styles/AllJobs.scss";
import ApplyModal from "../components/ApplicationModal";
// OR with full path:
// import ApplyModal from "@pages/JobDetail/components/ApplicationModal";
```

### 3. Find & Replace Strategy (VS Code)

Use Find & Replace (Ctrl+H) with regex:

```
// Replace all relative imports with @alias
Find: from "\.\./\.\./components/(\w+)";
Replace: from "@shared/$1/$1";

// Replace page imports
Find: from "\.\./Page/(\w+)";
Replace: from "@pages/$1/$1";
```

---

## Recommended Execution Order

1. ✅ **Create jsconfig.json** (Phase 1) - IMMEDIATE
2. ✅ **Create new directory structure** (src/pages/, src/components/shared/) - IMMEDIATE
3. **Move shared components** (Phase 2) - Batch file operations
4. **Move pages** (Phase 3) - Batch file operations
5. **Move page-specific components** (Phase 4) - Per-page operations
6. **Update imports** (Phase 5) - Find & Replace, then per-file fixes
7. **Update App.jsx** - Last (to avoid breaking routes early)
8. **Test** - Run dev server, verify all routes work

---

## Testing Checklist

After refactoring:

- [ ] Dev server starts with `npm start` (no errors)
- [ ] Browser loads `http://localhost:3000/` without errors
- [ ] All routes load:
  - [ ] `/` (home)
  - [ ] `/login`
  - [ ] `/register`
  - [ ] `/jobs`
  - [ ] `/job/:jobId`
  - [ ] `/profile`
  - [ ] `/companies`
  - [ ] `/hiring`
  - [ ] `/applicant-dashboard`
  - [ ] `/news`
- [ ] Header/Footer/Chat display on all pages
- [ ] Search functionality works
- [ ] No console errors
- [ ] Styles load correctly (no FOUC - Flash of Unstyled Content)
- [ ] API calls still work

---

## Key Principles

### ✅ DO:

1. Keep all folder names **PascalCase** (e.g., `components/shared/Header/`)
2. Keep file names **lowercase with camelCase** for components or **PascalCase** for React components
3. Use **path aliases** consistently in imports
4. Keep **co-located styles** with their components
5. Use **barrel exports** (index.js) for easy module imports:
   ```javascript
   // components/shared/index.js
   export { default as Header } from "./Header/Header";
   export { default as Footer } from "./Footer/Footer";
   export { default as Chat } from "./Chat/Chat";
   ```
6. Keep page-specific logic in page folders
7. Move only truly shared components to `shared/`

### ❌ DON'T:

1. Use relative imports (`../../`) - use @aliases
2. Mix camelCase and PascalCase randomly
3. Scatter related components across different folders
4. Leave orphaned style files
5. Break circular imports

---

## Breaking Change Mitigation

This refactoring **should NOT break functionality** if done correctly:

- All component logic remains unchanged
- All styles remain the same
- Only file locations and import paths change
- API endpoints unchanged
- Routes unchanged

**Before going live:**

- Run full test suite (if available)
- Manual testing on all major pages
- Check mobile responsiveness
- Verify API integration still works

---

## Maintenance Benefits After Refactoring

1. **Scalability**: Easy to add new pages/features
2. **Clarity**: Know exactly where to find components
3. **Reusability**: Clear distinction between shared vs. page-specific
4. **Performance**: Easier code-splitting and lazy loading
5. **Testing**: Isolated component testing
6. **Onboarding**: New developers understand structure quickly

---

## Next Steps

1. **Immediate**: Create jsconfig.json and directory structure ✅
2. **Today**: Create a PowerShell script for batch file moves
3. **Today**: Use VS Code Find & Replace for import updates
4. **Testing**: Verify app runs after each phase
5. **Documentation**: Update team documentation with new structure

---

## Support Resources

- VS Code Find & Replace: `Ctrl+H`
- PowerShell file operations: `Move-Item`, `Copy-Item`
- React Router docs: https://reactrouter.com
- Path alias setup: https://create-react-app.dev/docs/importing-a-component/
