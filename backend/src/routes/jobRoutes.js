import express from "express";
import {
  getIndustries,
  getAllJobs,
  getJobById, // Bạn có thể bỏ cái cũ này nếu thay thế hoàn toàn
  predictJobSalaries,
  getRecommendCache,
  createJobUsingProcedure,
  getJobsByCurrentUser,
  getJobDetailWithCount, // ⚠️ Chú ý: Đảm bảo tên này khớp với bên controller (đang để số ít)
} from "../controller/jobController.js";
import { getFeaturedJobs } from "../controller/featuredJobController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// 📌 NHÓM GET (LẤY DỮ LIỆU)
// ==========================================

// 1. Lấy danh sách ngành nghề
router.get("/industries", getIndustries);

// 2. Lấy danh sách job nổi bật
router.get("/featured", getFeaturedJobs);

// 3. Lấy job gợi ý (Cache)
// 🔴 SỬA LỖI: Thêm verifyToken vì controller cần user_id
router.get("/recommend", verifyToken, getRecommendCache);

// 4. Lấy list công việc đã đăng của người dùng hiện tại
router.get("/list-jobs", verifyToken, getJobsByCurrentUser);

// ==========================================
// 📌 NHÓM POST (GỬI DỮ LIỆU / TẠO MỚI)
// ==========================================

// 5. Tạo công việc mới
router.post("/create", verifyToken, createJobUsingProcedure);

// 6. Dự đoán lương (Machine Learning)
router.post("/predict", predictJobSalaries);

// ==========================================
// 📌 NHÓM DYNAMIC (CÓ ID) - PHẢI ĐỂ CUỐI
// ==========================================

// 7. Lấy chi tiết công việc (Đã thay thế hàm cũ bằng hàm mới có Count)
// Logic: Frontend gọi /api/jobs/123 -> Sẽ trả về cả thông tin job + số lượng apply
// Bạn không cần tạo route riêng /detail-with-counts nữa cho rườm rà.
router.get("/:id", getJobDetailWithCount);

// 8. Lấy tất cả công việc (Root của router này)
// Đặt ở đây hoặc trên cùng đều được, nhưng tránh đặt nhầm thành /:id
router.get("/", getAllJobs);

export default router;
