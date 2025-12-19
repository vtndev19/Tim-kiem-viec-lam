// src/controllers/userController.js
import db from "../configs/data.js"; // ⚠️ Lưu ý: Phải có đuôi .js khi import file local
import bcrypt from "bcrypt";

// 1. Lấy danh sách users
export const getUsers = async (req, res) => {
  try {
    const query = `
      SELECT user_id, full_name, email, phone, role, status, created_at, avatar 
      FROM users 
      ORDER BY created_at DESC
    `;
    const [rows] = await db.query(query);

    const users = rows.map((user) => ({
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status || "active",
      joinDate: user.created_at,
      avatar: user.avatar,
    }));

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 2. Tạo user mới
export const createUser = async (req, res) => {
  const { name, email, phone, role, status } = req.body;
  try {
    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const defaultPassword = "123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const insertQuery = `
      INSERT INTO users (full_name, email, password, phone, role, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await db.query(insertQuery, [
      name,
      email,
      hashedPassword,
      phone,
      role,
      status,
    ]);
    res.status(201).json({ id: result.insertId, message: "Tạo thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Cập nhật user
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role, status } = req.body;
  try {
    await db.query(
      "UPDATE users SET full_name=?, email=?, phone=?, role=?, status=? WHERE user_id=?",
      [name, email, phone, role, status, id]
    );
    res.json({ message: "Cập nhật thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Xóa user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM users WHERE user_id=?", [id]);
    res.json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Toggle Status
export const toggleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query("UPDATE users SET status=? WHERE user_id=?", [status, id]);
    res.json({ message: "Đổi trạng thái thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
