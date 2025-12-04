/**
 * src/utils/cvNormalizer.js
 * * Hàm chuẩn hóa dữ liệu CV từ CVBuilder
 * Logic mới: Tách biệt dữ liệu để lưu vào cột SQL (Search) và dữ liệu Meta (Restore)
 */

export const normalizeCVData = (cvData, fontSize) => {
  // 1. TẠO SNAPSHOT (Bản chụp) ĐẦY ĐỦ
  // Đây là dữ liệu quan trọng nhất để khôi phục giao diện y hệt lúc lưu (colors, fonts, layout...)
  const metaDataSnapshot = {
    personalInfo: cvData.personalInfo,
    summary: cvData.summary,
    education: cvData.education,
    experience: cvData.experience,
    skills: cvData.skills,
    // Gom các setting giao diện vào một chỗ
    settings: {
      fontSize: fontSize || 11,
      font: cvData.font || "Arial",
      colors: cvData.colors || {
        primary: "#0066cc",
        secondary: "#374151",
        text: "#111827",
        bg: "#ffffff",
        accent: "#e5e7eb",
      },
    },
  };

  // 2. TẠO PAYLOAD GỬI API
  return {
    // --- PHẦN CHO CỘT SQL (Phục vụ tìm kiếm/lọc trong DB) ---
    title: cvData.personalInfo?.title || "Untitled CV",
    summary: (cvData.summary || "").trim(),

    // Gửi nguyên mảng, Backend sẽ tự JSON.stringify để lưu vào cột TEXT
    education: Array.isArray(cvData.education) ? cvData.education : [],
    experience: Array.isArray(cvData.experience) ? cvData.experience : [],
    skills: Array.isArray(cvData.skills) ? cvData.skills : [],
    certifications: [], // Nếu có thì thêm vào

    file_url: cvData.personalInfo?.photo || null,

    // --- PHẦN CHO CỘT META_DATA (Phục vụ load lại giao diện) ---
    // Gửi object này lên, Backend sẽ lưu vào cột JSON `meta_data`
    meta_data: metaDataSnapshot,

    // Metadata bổ sung
    createdAt: new Date().toISOString(),
  };
};

/**
 * Hàm gửi CV data lên backend
 */
export const submitCVToBackend = async (
  cvData,
  fontSize,
  apiUrl = "http://localhost:8080/api/cv" // Đảm bảo đúng port backend của bạn
) => {
  try {
    const normalizedData = normalizeCVData(cvData, fontSize);

    console.log("📤 Sending CV data to:", apiUrl);
    // console.log("📦 Payload:", normalizedData);

    // Lấy token
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        error: "No authentication token",
        message: "Vui lòng đăng nhập để lưu CV",
      };
    }

    const response = await fetch(apiUrl, {
      method: "POST", // API route của bạn hỗ trợ cả POST tạo mới và logic save
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(normalizedData),
    });

    const responseText = await response.text();

    // Xử lý trường hợp lỗi Server trả về HTML
    if (!responseText.startsWith("{") && !responseText.startsWith("[")) {
      console.error("❌ Backend returned HTML/error page:", responseText);
      return {
        success: false,
        error: "Server error",
        message: "❌ Lỗi Server. Vui lòng kiểm tra lại kết nối.",
      };
    }

    const result = JSON.parse(responseText);

    if (!response.ok) {
      throw new Error(result.message || `Lỗi HTTP: ${response.status}`);
    }

    console.log("✅ CV submitted successfully:", result);

    return {
      success: true,
      data: result,
      message: result.message || "CV đã được lưu thành công!",
    };
  } catch (error) {
    console.error("❌ Error submitting CV:", error);
    return {
      success: false,
      error: error.message,
      message: "❌ " + (error.message || "Lỗi khi lưu CV."),
    };
  }
};

/**
 * Hàm chuyển đổi dữ liệu từ Backend -> Frontend State
 * (Dùng khi người dùng bấm vào xem/sửa CV cũ)
 */
export const denormalizeCVData = (backendData) => {
  // TRƯỜNG HỢP 1: Dữ liệu mới (Có meta_data)
  // Ưu tiên dùng cái này vì nó chính xác 100% với lúc lưu
  if (
    backendData.meta_data &&
    typeof backendData.meta_data === "object" &&
    Object.keys(backendData.meta_data).length > 0
  ) {
    const saved = backendData.meta_data;

    return {
      personalInfo: saved.personalInfo || {},
      summary: saved.summary || "",
      education: saved.education || [],
      experience: saved.experience || [],
      skills: saved.skills || [],

      // Khôi phục Style
      colors: saved.settings?.colors || {
        primary: "#0066cc",
        secondary: "#374151",
        text: "#111827",
        bg: "#ffffff",
        accent: "#e5e7eb",
      },
      font: saved.settings?.font || "Arial",
      fontSize: saved.settings?.fontSize || 11,
    };
  }

  // TRƯỜNG HỢP 2: Dữ liệu cũ (Legacy - Chưa có meta_data)
  // Phải map thủ công từ các cột rời rạc
  console.warn("⚠️ Data cũ không có meta_data, đang map thủ công...");

  return {
    personalInfo: {
      fullName: backendData.title || "", // Tạm lấy title làm tên
      title: backendData.title || "",
      email: "", // Data cũ có thể không lưu email trong cột riêng
      phone: "",
      address: "",
      photo: backendData.file_url || null,
    },
    summary: backendData.summary || "",

    // Backend cũ trả về JSON array hoặc string, cần parse an toàn
    education: safeParse(backendData.education),
    experience: safeParse(backendData.experience),
    skills: safeParse(backendData.skills),

    // Default style cho data cũ
    colors: {
      primary: "#0066cc",
      secondary: "#374151",
      text: "#111827",
      bg: "#ffffff",
      accent: "#e5e7eb",
    },
    font: "Arial",
    fontSize: 11,
  };
};

// Helper để parse JSON an toàn
const safeParse = (data) => {
  if (Array.isArray(data)) return data;
  try {
    return typeof data === "string" ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Giữ nguyên các hàm tiện ích khác
 */
export const downloadCVAsJSON = (cvData, fontSize, fileName = null) => {
  const normalizedData = normalizeCVData(cvData, fontSize);
  const jsonString = JSON.stringify(normalizedData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || `CV-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const validateCVData = (cvData) => {
  const errors = [];
  if (!cvData.personalInfo.fullName?.trim())
    errors.push("Họ và tên không được để trống");

  // Validation lỏng hơn chút để user dễ lưu nháp
  if (
    !cvData.personalInfo.email?.trim() &&
    !cvData.personalInfo.phone?.trim()
  ) {
    // errors.push("Cần có ít nhất Email hoặc Số điện thoại");
  }

  return { isValid: errors.length === 0, errors };
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
