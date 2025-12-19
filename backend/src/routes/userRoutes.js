// src/routes/userRoutes.js
import express from "express";
// Import các hàm xử lý từ controller (nhớ đuôi .js)
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleStatus,
} from "../controller/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/:id/status", toggleStatus);

export default router; // Thay thế module.exports = router;
