// ================================================
// ✅ FEATURED JOB CONTROLLER - LẤY 20 VIỆC LÀM NỔI BẬT
// ================================================
import db from "../configs/data.js";

export const getFeaturedJobs = async (req, res) => {
  try {
    // 🔹 Truy vấn SQL đã tối ưu theo cấu trúc User -> Company -> Job
    // Lưu ý: Location và Job Type lấy trực tiếp từ bảng jobs
    const sql = `
      SELECT 
        j.job_id AS id,
        j.title,
        c.company_name AS company,
        c.logo,               -- Thêm Logo để hiển thị đẹp hơn
        j.location,           -- Lấy trực tiếp cột location (không cần JOIN bảng locations)
        j.salary_range AS salary,
        j.job_type AS type,   -- Lấy loại hình công việc
        j.posted_date,
        j.requirements,       -- Chọn thêm nếu bảng jobs của bạn có cột này
        j.benefits            -- Chọn thêm nếu bảng jobs của bạn có cột này
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      ORDER BY j.posted_date DESC
      LIMIT 20
    `;

    const [jobs] = await db.query(sql);

    // 🔹 Chuẩn hoá dữ liệu trả về
    const formatted = jobs.map((job) => ({
      ...job,
      // Xử lý an toàn: Nếu không có dữ liệu thì trả về mảng rỗng []
      requirements: job.requirements
        ? job.requirements
            .split("\n")
            .map((r) => r.trim())
            .filter(Boolean)
        : [],
      benefits: job.benefits
        ? job.benefits
            .split(/[;\n,]+/)
            .map((b) => b.trim())
            .filter(Boolean)
        : [],
    }));

    res.json(formatted);
  } catch (error) {
    console.error("❌ Lỗi khi lấy việc làm nổi bật:", error.message);
    res.status(500).json({
      message: "Lỗi khi truy vấn việc làm nổi bật",
      error: error.message,
    });
  }
};
