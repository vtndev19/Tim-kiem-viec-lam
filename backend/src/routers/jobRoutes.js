import express from "express";
import {
  getIndustries,
  getAllJobs,
  getJobById,
  predictJobSalaries,
  getRecommendCache,
  createJobUsingProcedure,
  getJobsByCurrentUser,
} from "../controller/jobController.js";
import { getFeaturedJobs } from "../controller/featuredJobController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// 📌 NHÓM GET (LẤY DỮ LIỆU)
// ⚠️ QUAN TRỌNG: Các route cụ thể phải đặt TRƯỚC route /:id
// ==========================================

// 1. Lấy danh sách ngành nghề
router.get("/industries", getIndustries);

// 2. Lấy danh sách job nổi bật
router.get("/featured", getFeaturedJobs);

// 3. Lấy job gợi ý (Cache)
router.get("/recommend", getRecommendCache);

// Lấy list công việc đã đăng của người dùng hiện tại
router.get("/list-jobs", verifyToken, getJobsByCurrentUser);

// ==========================================
// 📌 NHÓM POST (GỬI DỮ LIỆU / TẠO MỚI)
// ==========================================

// 4. Tạo công việc mới (Đã sửa tên route từ 'creatJobs' thành 'create')
// Route này cần Token xác thực
router.post("/create", verifyToken, createJobUsingProcedure);

// 5. Dự đoán lương (Machine Learning)
router.post("/predict", predictJobSalaries);

// ==========================================
// 📌 NHÓM CHUNG & DYNAMIC (ĐẶT CUỐI CÙNG)
// ==========================================

// 6. Lấy tất cả công việc (Có thể kèm ?page=1&limit=10)
router.get("/", getAllJobs);

// 7. Lấy chi tiết công việc theo ID
// ⚠️ BẮT BUỘC ĐỂ CUỐI CÙNG trong nhóm GET
// Vì nếu để lên đầu, nó sẽ hiểu "industries" hay "recommend" là một cái :id
router.get("/:id", getJobById);

export default router;
