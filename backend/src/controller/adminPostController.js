import path from "path";
import db from "../configs/data.js";

// 🟢 Tạo bài viết mới
export const createAdminPost = async (req, res) => {
  const { admin_id, content } = req.body;
  const images = req.files;

  if (!content || !admin_id)
    return res.status(400).json({ error: "Thiếu nội dung hoặc ID admin." });

  try {
    const conn = await db.getConnection();
    await conn.beginTransaction();

    const [result] = await conn.query(
      "INSERT INTO admin_posts (admin_id, title, content, status) VALUES (?, ?, ?, 'published')",
      [admin_id, content.slice(0, 50) || "Bài viết mới", content]
    );
    const postId = result.insertId;

    if (images && images.length > 0) {
      for (const img of images) {
        const imgUrl = `/uploads/${path.basename(img.path)}`;
        await conn.query(
          "INSERT INTO admin_post_images (post_id, image_url) VALUES (?, ?)",
          [postId, imgUrl]
        );
      }
    }

    await conn.commit();
    res
      .status(200)
      .json({ message: "✅ Bài viết đã được đăng!", post_id: postId });
  } catch (err) {
    console.error("❌ Lỗi khi tạo bài viết:", err);
    res.status(500).json({ error: "Không thể đăng bài viết." });
  }
};

// 🟡 Lấy danh sách bài viết
export const getAllAdminPosts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.full_name,
      GROUP_CONCAT(i.image_url) AS images
      FROM admin_posts p
      JOIN users u ON u.user_id = p.admin_id
      LEFT JOIN admin_post_images i ON i.post_id = p.post_id
      GROUP BY p.post_id
      ORDER BY p.created_at DESC
    `);

    // ✅ Chuyển chuỗi ảnh thành mảng
    const result = rows.map((r) => ({
      ...r,
      images: r.images ? r.images.split(",").filter(Boolean) : [],
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách bài viết:", err);
    res.status(500).json({ error: "Không thể lấy danh sách bài viết." });
  }
};

// 🟣 Lấy chi tiết 1 bài viết
export const getAdminPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const [postRows] = await db.query(
      `SELECT p.*, u.full_name FROM admin_posts p
       JOIN users u ON u.user_id = p.admin_id
       WHERE p.post_id = ?`,
      [id]
    );
    if (!postRows.length)
      return res.status(404).json({ error: "Không tìm thấy bài viết." });

    const [imageRows] = await db.query(
      `SELECT image_url FROM admin_post_images WHERE post_id = ?`,
      [id]
    );

    res.json({
      ...postRows[0],
      images: imageRows.map((i) => i.image_url),
    });
  } catch (err) {
    res.status(500).json({ error: "Không thể lấy chi tiết bài viết." });
  }
};
