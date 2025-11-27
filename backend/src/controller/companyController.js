// ✅ src/controllers/companyController.js
import db from "../configs/data.js"; // Đảm bảo đường dẫn đúng tới file config/db.js

/**
 * @desc Lấy danh sách tất cả công ty
 * @route GET /api/companies
 */
export const getAllCompanies = async (req, res) => {
  try {
    // Cập nhật SQL:
    // 1. Join industries để lấy tên ngành
    // 2. Lấy address trực tiếp (bỏ location_id)
    // 3. Đổi tên cột email thành contact_email (theo cấu trúc mới)
    const sql = `
      SELECT 
        c.company_id AS id,
        c.company_name,
        i.name AS industry,   -- Lấy tên ngành từ bảng industries
        c.address,            -- Lấy địa chỉ trực tiếp
        c.description,
        c.website,
        c.contact_email AS email, -- Cột mới là contact_email
        c.logo,               -- Cột mới là logo (không phải logo_url)
        COUNT(j.job_id) AS total_jobs
      FROM companies c
      LEFT JOIN industries i ON c.industry_id = i.industry_id
      LEFT JOIN jobs j ON c.company_id = j.company_id
      GROUP BY c.company_id
      ORDER BY c.company_id DESC; -- Sắp xếp mới nhất lên đầu
    `;

    const [rows] = await db.query(sql);

    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách công ty:", error.message);
    res.status(500).json({ message: "Lỗi khi truy vấn danh sách công ty" });
  }
};

/**
 * @desc Lấy chi tiết 1 công ty theo ID + các job của công ty đó
 * @route GET /api/companies/:id
 */
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ 1. Lấy thông tin công ty (Kèm tên ngành)
    const [companyRows] = await db.query(
      `
      SELECT 
        c.company_id AS id,
        c.company_name,
        i.name AS industry,
        c.address,
        c.description,
        c.website,
        c.contact_email AS email,
        c.logo,
        c.created_at
      FROM companies c
      LEFT JOIN industries i ON c.industry_id = i.industry_id
      WHERE c.company_id = ?
    `,
      [id]
    );

    if (companyRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy công ty" });
    }

    const company = companyRows[0];

    // ✅ 2. Lấy danh sách việc làm (Không cần JOIN job_types hay locations nữa)
    // Vì bảng jobs mới đã chứa sẵn: location, job_type (dạng chữ)
    const [jobs] = await db.query(
      `
      SELECT 
        j.job_id AS id,
        j.title,
        j.salary_range AS salary,
        j.location,      -- Lấy trực tiếp
        j.job_type,      -- Lấy trực tiếp (VD: Full-time)
        j.posted_date,
        j.description,
        j.requirements,
        j.benefits
      FROM jobs j
      WHERE j.company_id = ?
      ORDER BY j.posted_date DESC
    `,
      [id]
    );

    // ✅ 3. Trả về kết quả gộp
    res.status(200).json({
      ...company,
      total_jobs: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết công ty:", error.message);
    res.status(500).json({ message: "Lỗi khi truy vấn chi tiết công ty" });
  }
};
export const getAllIndustries = async (req, res) => {
  try {
    // 1. Viết câu query: Chỉ lấy ID và Tên, sắp xếp A-Z
    const sql = `SELECT industry_id, name FROM industries ORDER BY name ASC`;

    // 2. Thực thi query
    // Lưu ý: Cú pháp này phụ thuộc vào thư viện DB bạn dùng (mysql2, sequelize, v.v.)
    // Đây là ví dụ chuẩn với mysql2/promise
    const [rows] = await db.query(sql);

    // 3. Trả về dữ liệu JSON cho Frontend
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách ngành thành công",
      data: rows,
    });
  } catch (error) {
    // 4. Xử lý lỗi
    console.error("Lỗi khi lấy danh sách ngành:", error);
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra ở server",
      error: error.message,
    });
  }
};
/**
 * @desc Lấy thông tin công ty của NGƯỜI DÙNG ĐANG ĐĂNG NHẬP
 * @route GET /api/companies/mine
 * @access Private (Cần Token)
 */

export const getMyCompany = async (req, res) => {
  try {
    // req.user được gán từ middleware verifyToken
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ message: "Chưa xác thực người dùng" });
    }

    const sql = `
      SELECT 
        c.company_id,
        c.company_name,
        c.address,
        c.contact_email,
        c.logo,
        c.industry_id,
        i.name AS industry_name
      FROM companies c
      LEFT JOIN industries i ON c.industry_id = i.industry_id
      WHERE c.user_id = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [user_id]);

    if (rows.length === 0) {
      // Trả về 404 để Frontend biết user này chưa có công ty (để hiện nút tạo mới)
      return res.status(404).json({ message: "Bạn chưa tạo hồ sơ công ty." });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("❌ Lỗi lấy công ty của tôi:", error.message);
    res.status(500).json({ message: "Lỗi server khi lấy thông tin công ty" });
  }
};
