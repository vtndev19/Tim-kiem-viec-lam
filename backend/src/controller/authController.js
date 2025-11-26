import db from "../configs/data.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";

/**
 * ✅ Đăng ký người dùng mới
 */
export const register = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // Kiểm tra email đã tồn tại chưa
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm user mới vào DB
    const [result] = await db.query(
      "INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, hashedPassword, phone || null, "applicant"]
    );

    // Lấy lại user vừa tạo
    const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [
      result.insertId,
    ]);
    const newUser = rows[0];

    // Tạo token
    const token = generateToken(newUser);

    res.status(201).json({
      message: "Đăng ký thành công!",
      token,
      user: {
        user_id: newUser.user_id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        name: newUser.full_name,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi khi đăng ký:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi đăng ký" });
  }
};

/**
 * ✅ Đăng nhập người dùng
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Tìm user theo email
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    const user = rows[0];

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    // Tạo token
    const token = generateToken(user);

    // Trả về thông tin user
    res.json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        name: user.full_name,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi khi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi đăng nhập" });
  }
};

/**
 * ✅ Lấy thông tin user hiện tại (qua token)
 */
export const getProfile = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const [rows] = await db.query(
      "SELECT user_id, full_name, email, phone, role, created_at FROM users WHERE user_id = ?",
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Lỗi khi lấy profile:", error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ khi lấy thông tin người dùng" });
  }
};
/**
 * ✅ Đổi mật khẩu người dùng
 */
export const changePassword = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    // Lấy đúng key frontend đang gửi
    const { old_password, new_password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!old_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ mật khẩu",
      });
    }

    // Lấy mật khẩu hiện tại từ DB
    const [rows] = await db.query(
      "SELECT password FROM users WHERE user_id = ?",
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const hashedPassword = rows[0].password;

    // So sánh mật khẩu hiện tại
    const isMatch = await bcrypt.compare(old_password, hashedPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    // Hash mật khẩu mới
    const newHashed = await bcrypt.hash(new_password, 10);

    // Cập nhật DB
    await db.query("UPDATE users SET password = ? WHERE user_id = ?", [
      newHashed,
      user_id,
    ]);

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công!",
    });
  } catch (error) {
    console.error("❌ Lỗi đổi mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi đổi mật khẩu",
    });
  }
};
