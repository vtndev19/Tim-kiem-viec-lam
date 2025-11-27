import express from "express";
import {
  getAllCompanies,
  getCompanyById,
  getMyCompany,
  getAllIndustries,
} from "../controller/companyController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllCompanies);
router.get("/industries", getAllIndustries);
router.get("/mine", verifyToken, getMyCompany); // 🔥 Route mới
router.get("/:id", getCompanyById);
export default router;
