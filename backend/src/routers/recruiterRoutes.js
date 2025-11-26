import express from "express";
import {
  sendRecruiterOtp,
  verifyAndUpgrade,
} from "../controller/recruiterController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route: Gửi OTP
router.post("/send-otp", verifyToken, sendRecruiterOtp);

// Route: Xác thực và Nâng cấp
router.post("/verify-upgrade", verifyToken, verifyAndUpgrade);

export default router;
