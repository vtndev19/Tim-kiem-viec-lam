# 🎯 CVBuilder Integration Testing Guide

## 📋 Pre-Testing Checklist

### Backend Setup

- [ ] Backend server running on `http://localhost:8080`
- [ ] MySQL database connected
- [ ] Environment variables configured (JWT_SECRET, DB credentials)
- [ ] CV tables created in database:
  - `cv` table with columns: user_id, title, summary, full_name, email, phone, address, photo_url, font_family, font_size, primary_color, created_at, updated_at
  - `cv_education` table with columns: education_id, cv_id, school, major, start_date, end_date, description
  - `cv_experience` table with columns: experience_id, cv_id, company, role, start_date, end_date, description
  - `cv_skills` table with columns: cv_id, skill_id (junction table)

### Frontend Setup

- [ ] Frontend dev server running on `http://localhost:3000`
- [ ] Node modules installed
- [ ] Browser DevTools open (Console + Network tabs)
- [ ] User logged in (JWT token available in localStorage)

---

## 🧪 Test Cases

### Test 1: Form Validation

**Objective**: Ensure validation catches invalid data before submission

**Steps**:

1. Go to CVBuilder page
2. Clear "Full Name" field
3. Click "💾 Lưu" (Save) button

**Expected Result**:

- Alert shows: "Họ và tên không được để trống"
- No API request is made

**Test Status**: ⬜ [ ]

---

### Test 2: Email Validation

**Objective**: Verify email format validation

**Steps**:

1. Go to CVBuilder page
2. Change email to invalid format (e.g., "not-an-email")
3. Click "💾 Lưu" (Save) button

**Expected Result**:

- Alert shows: "Email không hợp lệ"
- No API request is made

**Test Status**: ⬜ [ ]

---

### Test 3: Required Sections Validation

**Objective**: Ensure at least one section has content

**Steps**:

1. Go to CVBuilder page
2. Delete all education entries
3. Delete all experience entries
4. Delete all skills entries
5. Click "💾 Lưu" (Save) button

**Expected Result**:

- Alert shows: "Cần có ít nhất một phần (học vấn, kinh nghiệm hoặc kỹ năng)"
- No API request is made

**Test Status**: ⬜ [ ]

---

### Test 4: No Authentication Token

**Objective**: Verify error handling when user is not logged in

**Steps**:

1. Clear localStorage: `localStorage.clear()`
2. Try to save CV
3. Check console

**Expected Result**:

- Alert shows: "Vui lòng đăng nhập để lưu CV"
- No API request is made
- Console logs: "❌ Error submitting CV: No authentication token"

**Test Status**: ⬜ [ ]

---

### Test 5: Successful CV Submission

**Objective**: Verify valid data is submitted to backend

**Steps**:

1. Fill in all required fields with valid data
2. Add at least 1 education entry
3. Click "💾 Lưu" (Save) button
4. Check Network tab in DevTools
5. Check Browser Console

**Expected Outcomes**:

- **Network Tab**:
  - POST request to `http://localhost:8080/api/cv`
  - Status: 201 Created
  - Request Headers include: `Authorization: Bearer <token>`
  - Request Body contains normalized CV data with personalInfo, education, experience, skills, style
- **Browser Console**:
  - Logs: "📤 Sending CV data: {...}" (normalized data structure)
  - Logs: "✅ CV submitted successfully: {...}"
- **Alert Dialog**:
  - Shows: "CV đã được lưu thành công!"
- **Database Check**:
  - New row in `cv` table with correct user_id
  - New rows in `cv_education` table
  - Verify data matches submitted form

**Test Status**: ⬜ [ ]

---

### Test 6: Data Normalization

**Objective**: Verify frontend converts data correctly to backend format

**Steps**:

1. Fill CV form:

   - Full Name: "Nguyễn Trọng Việt"
   - Email: "viet@example.com"
   - Education Degree: "Cử nhân"
   - Education Year: "2018 - 2022"
   - Experience Position: "Frontend Developer"
   - Experience Period: "01/2023 - 05/2024"

2. Open Browser Console and look for "📤 Sending CV data" log
3. Expand the logged object

**Expected Result**:

- Degree is normalized to "major" field
- Position is normalized to "role" field
- Year "2018 - 2022" is split into startDate: "2018" and endDate: "2022"
- Period "01/2023 - 05/2024" is normalized to startDate: "2023-01" and endDate: "2024-05"

**Test Status**: ⬜ [ ]

---

### Test 7: Print Functionality

**Objective**: Verify print shows only A4 preview

**Steps**:

1. Fill CV with data
2. Click "🖨️ In" (Print) button
3. A new window opens with A4 preview
4. Try to print or just close the window

**Expected Result**:

- New window shows only the CV preview (no sidebar)
- Layout is A4 size (210mm × 297mm)
- All content fits within A4 bounds
- Sidebar is NOT visible in print

**Test Status**: ⬜ [ ]

---

### Test 8: Download JSON

**Objective**: Verify JSON export functionality

**Steps**:

1. Fill CV with data
2. Click "📥 Tải JSON" (Download JSON) button
3. Check Downloads folder

**Expected Result**:

- File downloaded with name: `CV-<timestamp>.json`
- File contains valid JSON structure with normalized data
- Can open file and view JSON content in text editor

**Test Status**: ⬜ [ ]

---

### Test 9: A4 Preview Updates in Real-time

**Objective**: Verify changes in form immediately reflect in preview

**Steps**:

1. Go to CVBuilder
2. Modify "Full Name" in the form
3. Observe the preview area on the right

**Expected Result**:

- Name changes immediately in the preview
- No page refresh needed
- Styling (font, color) also updates in real-time

**Test Status**: ⬜ [ ]

---

### Test 10: Styling Options

**Objective**: Verify font and color settings are applied

**Steps**:

1. Go to CVBuilder "Styling" tab
2. Change Font from "Arial" to "Times New Roman"
3. Change Font Size from "11" to "14"
4. Change Primary Color
5. Observe preview

**Expected Result**:

- Font changes immediately in preview
- Font size increases
- Primary color changes text/heading colors
- Changes are included when submitting to backend

**Test Status**: ⬜ [ ]

---

### Test 11: Styling Data in Database

**Objective**: Verify styling information is persisted

**Steps**:

1. Complete Test 5 (successful submission)
2. Query database: `SELECT font_family, font_size, primary_color FROM cv WHERE cv_id = <last_saved_cv_id>`

**Expected Result**:

- font_family: "Arial" (or selected font)
- font_size: 11 (or selected size)
- primary_color: "#0066cc" (or selected color)

**Test Status**: ⬜ [ ]

---

### Test 12: Multiple CV Support

**Objective**: Verify user can save multiple CVs

**Steps**:

1. Save CV with Title: "CV 2024"
2. Change Title to "CV 2025"
3. Modify some content
4. Save again
5. Query backend: `GET /api/cv` (requires auth)
6. Check database

**Expected Result**:

- Both CVs visible in API response
- Each has different cv_id but same user_id
- API GET /api/cv returns array with 2+ entries
- Database has 2 rows in cv table with same user_id

**Test Status**: ⬜ [ ]

---

### Test 13: User ID Isolation (Security)

**Objective**: Verify user can only see their own CVs

**Precondition**: Have 2 logged-in user accounts

**Steps**:

1. Log in with User A
2. Save a CV (note the cv_id)
3. Log out
4. Log in with User B
5. Try to GET or UPDATE User A's CV using cv_id
6. Check console/network response

**Expected Result**:

- User B cannot access User A's CV
- API returns 403 Forbidden or error message
- Database isolation verified through user_id matching

**Test Status**: ⬜ [ ]

---

### Test 14: Error Handling - Network Failure

**Objective**: Verify graceful error when backend is unavailable

**Steps**:

1. Stop backend server
2. Try to save CV
3. Check console and alert

**Expected Result**:

- Alert shows: "Lỗi khi lưu CV. Vui lòng thử lại."
- Console logs: "❌ Error submitting CV: [network error]"
- No crash, page remains functional

**Test Status**: ⬜ [ ]

---

### Test 15: Skills Normalization (Flattening)

**Objective**: Verify skills are properly flattened from groups to array

**Steps**:

1. Go to Skills tab
2. Add skills in different skill groups (if available)
3. Example: Skills group 1: "JavaScript, React, Vue"
4. Save CV
5. Check Network tab - Skills in normalized data

**Expected Result**:

- Skills normalized to flat array: ["JavaScript", "React", "Vue"]
- Not grouped anymore
- Can be directly inserted into cv_skills junction table

**Test Status**: ⬜ [ ]

---

### Test 16: Date Format Consistency

**Objective**: Verify all dates are stored consistently

**Steps**:

1. Add education with year "2020 - 2022"
2. Add experience with period "01/2020 - 12/2022"
3. Submit
4. Query database dates

**Expected Result**:

- Education: startDate = "2020", endDate = "2022"
- Experience: startDate = "2020-01", endDate = "2022-12"
- Consistent format across all CV sections

**Test Status**: ⬜ [ ]

---

## 📊 Summary

**Total Tests**: 16
**Passed**: **_ / 16
**Failed**: _** / 16
**Not Tested**: \_\_\_ / 16

---

## 🐛 Known Issues & Notes

(Fill in any issues discovered during testing)

---

## ✅ Sign-off

- [ ] All critical tests passed (1-7, 12)
- [ ] Database data verified
- [ ] Security checks passed (13)
- [ ] Error handling working (14)
- [ ] Ready for production

**Tested By**: ******\_\_\_\_******  
**Date**: ******\_\_\_\_******  
**Status**: ⬜ In Progress | 🟨 Partial | ✅ Complete

---

## 📞 Quick Reference

### API Endpoints

```
POST   /api/cv              → Save new CV
GET    /api/cv              → Get all user CVs
PUT    /api/cv/:cv_id       → Update CV
DELETE /api/cv/:cv_id       → Delete CV
```

### Environment Checks

```javascript
// Check token in console
localStorage.getItem("token") || localStorage.getItem("authToken");

// Clear all data
localStorage.clear();

// View database
// MySQL: SELECT * FROM cv WHERE user_id = <user_id>;
```

### Frontend Files

- Main Component: `frontend/src/Page/CVBuilder.js`
- Data Normalizer: `frontend/src/utils/cvNormalizer.js`
- Components: `frontend/src/components/CVBuilder/`

### Backend Files

- Controller: `backend/src/controller/cvController.js`
- Routes: `backend/src/routers/cvRoutes.js`
- Auth Middleware: `backend/src/middleware/auth.js`
