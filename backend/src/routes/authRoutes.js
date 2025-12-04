import express from "express";
import {
  register,
  login,
  getProfile,
  changePassword,
} from "../controller/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Đăng ký
router.post("/register", register);

// ✅ Đăng nhập
router.post("/login", login);

// ✅ Lấy thông tin người dùng qua token
router.get("/me", verifyToken, getProfile);
router.put("/change-password", verifyToken, changePassword);
export default router;
