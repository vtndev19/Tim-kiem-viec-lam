// ✅ src/controllers/companyController.js
import db from "../configs/data.js";

/**
 * @desc Lấy danh sách tất cả công ty
 * @route GET /api/companies
 */
export const getAllCompanies = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.company_id AS id,
        c.company_name,
        c.industry,
        c.company_size,
        c.address,
        c.description,
        c.website,
        c.email,
        c.phone,
        c.founded_year,
        c.logo_url,
        l.city AS location,
        c.created_at,
        COUNT(j.job_id) AS total_jobs
      FROM companies c
      LEFT JOIN locations l ON c.location_id = l.location_id
      LEFT JOIN jobs j ON c.company_id = j.company_id
      GROUP BY c.company_id
      ORDER BY c.company_id ASC;
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách công ty:", error.message);
    res.status(500).json({ message: "Lỗi khi truy vấn danh sách công ty" });
  }
};

/**
 * @desc Lấy chi tiết 1 công ty theo ID + các job của công ty
 * @route GET /api/companies/:id
 */
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Lấy thông tin công ty
    const [companyRows] = await db.query(
      `
      SELECT 
        c.company_id AS id,
        c.company_name,
        c.industry,
        c.company_size,
        c.address,
        c.description,
        c.website,
        c.email,
        c.phone,
        c.founded_year,
        c.logo_url,
        l.city AS location,
        c.created_at
      FROM companies c
      LEFT JOIN locations l ON c.location_id = l.location_id
      WHERE c.company_id = ?
    `,
      [id]
    );

    if (companyRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy công ty" });
    }

    const company = companyRows[0];

    // ✅ Lấy danh sách việc làm thuộc công ty
    const [jobs] = await db.query(
      `
      SELECT 
        j.job_id AS id,
        j.title,
        j.salary_range AS salary,
        j.description,
        j.posted_date,
        jt.type_name AS job_type,
        i.name AS industry
      FROM jobs j
      LEFT JOIN job_types jt ON j.job_type_id = jt.job_type_id
      LEFT JOIN industries i ON j.industry_id = i.industry_id
      WHERE j.company_id = ?
      ORDER BY j.posted_date DESC
    `,
      [id]
    );

    // ✅ Trả về gộp chung
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
