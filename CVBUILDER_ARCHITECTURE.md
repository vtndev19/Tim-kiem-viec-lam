# 🏗️ CVBuilder Implementation Architecture

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CVBuilder.js (Main Orchestrator)                              │
│  ├─ State: cvData, activeTab, fontSize, printRef              │
│  ├─ 6 Tabs: Info, Summary, Education, Experience, Skills,    │
│  │          Styling                                           │
│  ├─ Layout: 2-column (Sidebar | A4 Preview)                  │
│  └─ Actions: Print, Save, Download JSON                       │
│                                                                 │
│  Components Structure:                                         │
│  ├─ CVTopTabs.js                  (Horizontal tab navigation)   │
│  ├─ CVInputSidebar.js              (Form inputs + actions)      │
│  ├─ CVPreviewArea.js               (A4 preview container)       │
│  ├─ CVDocument.js                  (Forwarded ref wrapper)      │
│  ├─ sections/                      (Display components)         │
│  │  ├─ CVHeader.js                                             │
│  │  ├─ CVSummary.js                                            │
│  │  ├─ CVEducation.js                                          │
│  │  ├─ CVExperience.js                                         │
│  │  └─ CVSkills.js                                             │
│  ├─ forms/                         (Input components)          │
│  │  ├─ CVFormInfo.js                                           │
│  │  ├─ CVFormSummary.js                                        │
│  │  ├─ CVFormEducation.js                                      │
│  │  ├─ CVFormExperience.js                                     │
│  │  ├─ CVFormSkills.js                                         │
│  │  └─ CVFormStyle.js                                          │
│  └─ styles/                        (Modular SCSS)              │
│     ├─ CVTopTabs.scss                                          │
│     ├─ CVInputSidebar.scss                                     │
│     ├─ CVPreviewArea.scss                                      │
│     ├─ CVDocument.scss                                         │
│     ├─ CVHeader.scss                                           │
│     ├─ CVSummary.scss                                          │
│     ├─ CVEducation.scss                                        │
│     ├─ CVExperience.scss                                       │
│     └─ CVSkills.scss                                           │
│                                                                 │
│  Utilities:                                                    │
│  └─ cvNormalizer.js                (Data conversion layer)     │
│     ├─ normalizeCVData()           (CVBuilder → API format)    │
│     ├─ submitCVToBackend()         (HTTP POST with JWT)       │
│     ├─ downloadCVAsJSON()          (File export)              │
│     ├─ validateCVData()            (Pre-submission check)      │
│     └─ denormalizeCVData()         (API format → CVBuilder)    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /api/cv (with Bearer token)
                              │ Normalized JSON payload
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  server.js                         (Express setup)             │
│  ├─ CORS: http://localhost:3000                               │
│  ├─ JSON parser enabled                                       │
│  └─ Routes mounted at /api/cv                                 │
│                                                                 │
│  cvRoutes.js                       (REST API endpoints)        │
│  ├─ POST   /api/cv         → saveCVBuilder    (verifyToken)   │
│  ├─ GET    /api/cv         → getUserCV       (verifyToken)    │
│  ├─ PUT    /api/cv/:cv_id  → updateCV        (verifyToken)    │
│  └─ DELETE /api/cv/:cv_id  → deleteCV        (verifyToken)    │
│                                                                 │
│  cvController.js                   (Business logic)            │
│  ├─ saveCVBuilder()                (Create new CV)            │
│  │  ├─ Extract user_id from JWT                               │
│  │  ├─ Validate required fields                               │
│  │  ├─ START TRANSACTION                                      │
│  │  ├─ INSERT cv table (header + styling)                     │
│  │  ├─ INSERT cv_education (loop education array)             │
│  │  ├─ INSERT cv_experience (loop experience array)           │
│  │  ├─ Process skills (check exists, create if new)           │
│  │  ├─ INSERT cv_skills (junction table)                      │
│  │  ├─ COMMIT TRANSACTION                                     │
│  │  └─ Return { cv_id, counts }                               │
│  │                                                             │
│  ├─ getUserCV()                    (Fetch all user CVs)       │
│  │  ├─ Query cv table JOIN education, experience, skills      │
│  │  └─ Return array of full CV objects                        │
│  │                                                             │
│  ├─ updateCV()                     (Update existing CV)       │
│  │  ├─ Verify user_id ownership                               │
│  │  ├─ Delete old education, experience, skills               │
│  │  ├─ Re-insert updated records                              │
│  │  └─ Return updated cv_id                                   │
│  │                                                             │
│  └─ deleteCV()                     (Delete CV + cascade)      │
│     ├─ Delete from cv_education, cv_experience, cv_skills     │
│     ├─ Delete from cv table                                   │
│     └─ Return success message                                 │
│                                                                 │
│  auth.js (Middleware)              (JWT verification)         │
│  └─ verifyToken()                  (Extract user_id from JWT) │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Transactions
                              │ Connection pooling
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MYSQL DATABASE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  users (existing)                                              │
│  ├─ user_id (PK)                                              │
│  ├─ email, password, ...                                      │
│  └─ (provides context for JWT user_id)                        │
│                                                                 │
│  cv (NEW)                          (CV Header + Styling)       │
│  ├─ cv_id (PK)                     Auto-increment              │
│  ├─ user_id (FK → users)           User ownership             │
│  ├─ title                          CV title/name              │
│  ├─ summary                        Professional summary        │
│  ├─ full_name                      Full name                  │
│  ├─ email                          Email address              │
│  ├─ phone                          Phone number               │
│  ├─ address                        Address                    │
│  ├─ photo_url                      Profile photo URL          │
│  ├─ font_family                    Font choice (Arial, etc)   │
│  ├─ font_size                      Font size (8-14)           │
│  ├─ primary_color                  Primary color (#XXXXXX)    │
│  ├─ created_at                     Timestamp                  │
│  └─ updated_at                     Timestamp                  │
│                                                                 │
│  cv_education (NEW)                (Education entries)         │
│  ├─ education_id (PK)              Auto-increment              │
│  ├─ cv_id (FK → cv)                Links to CV                 │
│  ├─ school                         School/University name      │
│  ├─ major                          Degree/Major               │
│  ├─ start_date                     Start year/date            │
│  ├─ end_date                       End year/date              │
│  └─ description                    Additional details         │
│                                                                 │
│  cv_experience (NEW)               (Experience entries)        │
│  ├─ experience_id (PK)             Auto-increment              │
│  ├─ cv_id (FK → cv)                Links to CV                 │
│  ├─ company                        Company name               │
│  ├─ role                           Job role/title             │
│  ├─ start_date                     Start date (YYYY-MM)       │
│  ├─ end_date                       End date (YYYY-MM)         │
│  └─ description                    Job description            │
│                                                                 │
│  cv_skills (NEW)                   (Skills junction table)     │
│  ├─ cv_id (FK → cv)                Links to CV                 │
│  ├─ skill_id (FK → skills)         Links to skill             │
│  └─ (composite PK: cv_id + skill_id)                          │
│                                                                 │
│  skills (existing)                 (Skill master list)        │
│  ├─ skill_id (PK)                  Auto-increment              │
│  └─ skill_name                     Skill name                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### 1️⃣ User Fills Form (Frontend)

```javascript
// CVBuilder state
cvData = {
  personalInfo: {
    fullName: "Nguyễn Trọng Việt",
    title: "Frontend Developer",
    email: "viet@example.com",
    phone: "0123456789",
    address: "Hà Nội",
    photo: null
  },
  summary: "Professional summary...",
  education: [
    {
      id: 1,
      school: "Đại học Bách Khoa",
      degree: "Cử nhân CNTT",
      year: "2018 - 2022",
      details: "GPA: 3.5"
    }
  ],
  experience: [
    {
      id: 1,
      company: "Tech Corp",
      position: "Frontend Developer",
      period: "01/2023 - 05/2024",
      details: "Built React apps..."
    }
  ],
  skills: [
    {
      id: 1,
      category: "Languages",
      items: "JavaScript, Python, HTML"
    }
  ],
  colors: { primary: "#0066cc", ... },
  font: "Arial"
}

fontSize = 11
```

### 2️⃣ User Clicks Save Button

```javascript
handleSave() → validateCVData() → submitCVToBackend(cvData, fontSize)
```

### 3️⃣ Frontend Validates Data

```javascript
validateCVData(cvData)
// Returns:
{
  isValid: true,
  errors: []
}

// Checks:
// ✓ fullName not empty
// ✓ email valid format
// ✓ At least 1 section (education/experience/skills) has content
```

### 4️⃣ Frontend Normalizes Data

```javascript
normalizeCVData(cvData, fontSize)

// Conversion rules:
{
  title: "Nguyễn Trọng Việt",
  summary: "Professional summary...",

  personalInfo: {
    fullName: "Nguyễn Trọng Việt",
    title: "Frontend Developer",
    email: "viet@example.com",
    phone: "0123456789",
    address: "Hà Nội",
    photo: null
  },

  education: [
    {
      school: "Đại học Bách Khoa",
      major: "Cử nhân CNTT",           // ← degree → major
      startDate: "2018",               // ← extracted from "2018 - 2022"
      endDate: "2022",                 // ← extracted from "2018 - 2022"
      description: "GPA: 3.5"
    }
  ],

  experience: [
    {
      company: "Tech Corp",
      role: "Frontend Developer",      // ← position → role
      startDate: "2023-01",            // ← "01/2023" → "2023-01"
      endDate: "2024-05",              // ← "05/2024" → "2024-05"
      description: "Built React apps..."
    }
  ],

  skills: [                            // ← flattened from groups
    "JavaScript",
    "Python",
    "HTML"
  ],

  style: {
    font: "Arial",
    fontSize: 11,
    colors: { primary: "#0066cc", ... }
  },

  file_url: null,
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

### 5️⃣ Frontend Sends HTTP Request

```
POST http://localhost:8080/api/cv
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Body: (normalized data above)
```

### 6️⃣ Backend Receives & Validates

```javascript
// cvRoutes.js
POST /api/cv → verifyToken middleware → saveCVBuilder controller

// auth.js - verifyToken middleware:
Authorization header: "Bearer token"
  ↓
  Extract token: "token"
  ↓
  jwt.verify(token, JWT_SECRET)
  ↓
  req.user = { user_id: 123, email: "..." }
  ↓
  next() → proceed to controller
```

### 7️⃣ Backend Saves to Database

```javascript
// cvController.js - saveCVBuilder
user_id = 123 (from JWT)

// Validate
if (!title || !personalInfo.fullName) → error 400

// Start transaction
BEGIN TRANSACTION

// 1. Insert CV header
INSERT INTO cv (
  user_id=123,
  title="Nguyễn Trọng Việt",
  full_name="Nguyễn Trọng Việt",
  email="viet@example.com",
  font_family="Arial",
  font_size=11,
  primary_color="#0066cc"
)
Result: cv_id = 42

// 2. Insert education
INSERT INTO cv_education (
  cv_id=42,
  school="Đại học Bách Khoa",
  major="Cử nhân CNTT",
  start_date="2018",
  end_date="2022",
  description="GPA: 3.5"
)

// 3. Insert experience
INSERT INTO cv_experience (
  cv_id=42,
  company="Tech Corp",
  role="Frontend Developer",
  start_date="2023-01",
  end_date="2024-05",
  description="Built React apps..."
)

// 4. Process skills
SELECT skill_id FROM skills WHERE skill_name="JavaScript" → NOT FOUND
INSERT INTO skills (skill_name="JavaScript") → skill_id = 101
INSERT INTO cv_skills (cv_id=42, skill_id=101)

// (Repeat for Python, HTML)

// Commit transaction
COMMIT

// Return response
Response 201 Created:
{
  success: true,
  message: "🎉 CV đã được lưu thành công!",
  data: {
    cv_id: 42,
    user_id: 123,
    title: "Nguyễn Trọng Việt",
    counts: {
      education: 1,
      experience: 1,
      skills: 3
    }
  }
}
```

### 8️⃣ Frontend Receives Response

```javascript
// submitCVToBackend returns:
{
  success: true,
  data: { cv_id: 42, ... },
  message: "CV đã được lưu thành công!"
}

// Display alert
alert("CV đã được lưu thành công!")
```

### 9️⃣ Database State

```
cv table:
┌────────┬─────────┬──────────────────────────┬──────────────┐
│ cv_id  │ user_id │ title                    │ font_family  │
├────────┼─────────┼──────────────────────────┼──────────────┤
│ 42     │ 123     │ Nguyễn Trọng Việt        │ Arial        │
└────────┴─────────┴──────────────────────────┴──────────────┘

cv_education table:
┌───────────────┬────────┬──────────────────────┬──────────────┐
│ education_id  │ cv_id  │ school               │ major        │
├───────────────┼────────┼──────────────────────┼──────────────┤
│ 1             │ 42     │ Đại học Bách Khoa    │ Cử nhân CNTT │
└───────────────┴────────┴──────────────────────┴──────────────┘

cv_experience table:
┌──────────────────┬────────┬──────────┬──────────────────┐
│ experience_id    │ cv_id  │ company  │ role             │
├──────────────────┼────────┼──────────┼──────────────────┤
│ 1                │ 42     │ Tech Corp│ Frontend Dev     │
└──────────────────┴────────┴──────────┴──────────────────┘

cv_skills table:
┌────────┬──────────┐
│ cv_id  │ skill_id │
├────────┼──────────┤
│ 42     │ 101      │ ← JavaScript
│ 42     │ 102      │ ← Python
│ 42     │ 103      │ ← HTML
└────────┴──────────┘

skills table:
┌──────────┬──────────────┐
│ skill_id │ skill_name   │
├──────────┼──────────────┤
│ 101      │ JavaScript   │
│ 102      │ Python       │
│ 103      │ HTML         │
└──────────┴──────────────┘
```

---

## 🔌 API Contracts

### POST /api/cv (Create CV)

**Request**:

```http
POST /api/cv HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "title": "Nguyễn Trọng Việt",
  "summary": "Professional summary...",
  "personalInfo": {
    "fullName": "Nguyễn Trọng Việt",
    "title": "Frontend Developer",
    "email": "viet@example.com",
    "phone": "0123456789",
    "address": "Hà Nội",
    "photo": null
  },
  "education": [
    {
      "school": "Đại học Bách Khoa",
      "major": "Cử nhân CNTT",
      "startDate": "2018",
      "endDate": "2022",
      "description": "GPA: 3.5"
    }
  ],
  "experience": [
    {
      "company": "Tech Corp",
      "role": "Frontend Developer",
      "startDate": "2023-01",
      "endDate": "2024-05",
      "description": "Built React apps..."
    }
  ],
  "skills": ["JavaScript", "Python", "HTML"],
  "style": {
    "font": "Arial",
    "fontSize": 11,
    "colors": { "primary": "#0066cc" }
  }
}
```

**Response (201 Created)**:

```json
{
  "success": true,
  "message": "🎉 CV đã được lưu thành công!",
  "data": {
    "cv_id": 42,
    "user_id": 123,
    "title": "Nguyễn Trọng Việt",
    "counts": {
      "education": 1,
      "experience": 1,
      "skills": 3
    }
  }
}
```

### GET /api/cv (List User's CVs)

**Request**:

```http
GET /api/cv HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK)**:

```json
[
  {
    "cv_id": 42,
    "user_id": 123,
    "title": "Nguyễn Trọng Việt",
    "summary": "Professional summary...",
    "full_name": "Nguyễn Trọng Việt",
    "email": "viet@example.com",
    "font_family": "Arial",
    "font_size": 11,
    "created_at": "2024-01-15T10:30:00Z",
    "education": [...],
    "experience": [...],
    "skills": [...]
  }
]
```

### PUT /api/cv/:cv_id (Update CV)

**Request**:

```http
PUT /api/cv/42 HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "title": "Updated CV Title",
  "summary": "Updated summary...",
  ...
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "message": "CV đã được cập nhật",
  "data": { "cv_id": 42 }
}
```

### DELETE /api/cv/:cv_id (Delete CV)

**Request**:

```http
DELETE /api/cv/42 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK)**:

```json
{
  "success": true,
  "message": "CV đã được xóa"
}
```

---

## 🛡️ Security Features

### 1. Authentication (JWT)

- ✅ Token required for all CV operations
- ✅ Token extracted and verified by middleware
- ✅ user_id embedded in token
- ✅ Invalid/expired tokens rejected

### 2. Authorization (User Isolation)

- ✅ user_id from JWT used to filter queries
- ✅ Users can only access their own CVs
- ✅ UPDATE/DELETE operations verify ownership

### 3. Data Validation

- ✅ Frontend validation before submission
- ✅ Backend validation of required fields
- ✅ Email format validation
- ✅ SQL prepared statements (no SQL injection)

### 4. Transaction Support

- ✅ Atomic operations for CV creation
- ✅ ROLLBACK on any failure
- ✅ Data consistency guaranteed

---

## 📦 Dependencies

**Frontend**:

- React (Hooks)
- SCSS for styling
- Fetch API (built-in)
- localStorage (built-in)

**Backend**:

- Express.js (routing)
- mysql2/promise (database)
- jsonwebtoken (JWT)
- dotenv (configuration)
- cors (cross-origin)

**Database**:

- MySQL 5.7+
- Tables: cv, cv_education, cv_experience, cv_skills, skills

---

## 🚀 Deployment Checklist

- [ ] Database tables created with proper schema
- [ ] Environment variables configured (JWT_SECRET, DB_HOST, etc.)
- [ ] CORS whitelist updated with production domain
- [ ] JWT secret secured and not exposed
- [ ] API endpoints tested with Postman/Thunder Client
- [ ] Frontend/backend servers running
- [ ] SSL/HTTPS enabled for production
- [ ] Rate limiting configured
- [ ] Error logging implemented
- [ ] Database backups configured

---

## 📞 Troubleshooting

| Issue            | Cause                        | Solution                        |
| ---------------- | ---------------------------- | ------------------------------- |
| "No token" error | User not logged in           | Check localStorage has token    |
| 401 Unauthorized | Invalid token                | Verify JWT_SECRET matches       |
| 403 Forbidden    | User doesn't own CV          | Check user_id in URL vs JWT     |
| 400 Bad Request  | Missing required fields      | Verify normalizedData structure |
| Database error   | Connection pool exhausted    | Restart backend server          |
| CORS error       | Frontend URL not whitelisted | Add origin to CORS config       |
