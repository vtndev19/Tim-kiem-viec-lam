import express from "express";
import {
  getAllCompanies,
  getCompanyById,
} from "../controller/companyController.js";

const router = express.Router();

// ✅ Lấy danh sách tất cả công ty
router.get("/", getAllCompanies);

// ✅ Lấy chi tiết 1 công ty theo ID
router.get("/:id", getCompanyById);

export default router;
