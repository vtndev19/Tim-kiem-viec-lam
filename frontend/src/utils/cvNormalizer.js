/**
 * Hàm chuẩn hóa dữ liệu CV từ CVBuilder
 * Chuyển đổi từ format nội bộ sang format API backend
 *
 * Schema đơn giản: Lưu toàn bộ dữ liệu dưới dạng JSON trong text fields
 */

export const normalizeCVData = (cvData, fontSize) => {
  return {
    // Thông tin cơ bản
    title: cvData.personalInfo?.fullName || "CV",
    summary: (cvData.summary || "").trim(),

    // Thông tin cá nhân
    personalInfo: {
      fullName: (cvData.personalInfo?.fullName || "").trim(),
      title: (cvData.personalInfo?.title || "").trim(),
      email: (cvData.personalInfo?.email || "").trim(),
      phone: (cvData.personalInfo?.phone || "").trim(),
      address: (cvData.personalInfo?.address || "").trim(),
      photo: cvData.personalInfo?.photo || null,
    },

    // Học vấn - lưu nguyên dạng từ form
    education: Array.isArray(cvData.education)
      ? cvData.education.map((edu) => ({
          school: (edu?.school || "").trim(),
          degree: (edu?.degree || "").trim(),
          year: (edu?.year || "").trim(),
          details: (edu?.details || "").trim(),
        }))
      : [],

    // Kinh nghiệm làm việc - lưu nguyên dạng từ form
    experience: Array.isArray(cvData.experience)
      ? cvData.experience.map((exp) => ({
          company: (exp?.company || "").trim(),
          position: (exp?.position || "").trim(),
          period: (exp?.period || "").trim(),
          details: (exp?.details || "").trim(),
        }))
      : [],

    // Kỹ năng
    skills: Array.isArray(cvData.skills)
      ? cvData.skills
          .flatMap((skillGroup) =>
            typeof skillGroup?.items === "string"
              ? skillGroup.items
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter((skill) => skill.length > 0)
              : []
          )
          .filter((s) => s.length > 0)
      : [],

    // Styling
    style: {
      font: cvData.font || "Arial",
      fontSize: fontSize || 11,
      colors: cvData.colors || {
        primary: "#0066cc",
        secondary: "#374151",
        text: "#111827",
        bg: "#ffffff",
        accent: "#e5e7eb",
      },
    },

    // Metadata
    file_url: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Hàm gửi CV data lên backend
 * @param {object} cvData - Dữ liệu CV từ state
 * @param {number} fontSize - Kích thước font
 * @param {string} apiUrl - URL của backend API (mặc định: /api/cv)
 * @returns {Promise} - Response từ backend
 */
export const submitCVToBackend = async (
  cvData,
  fontSize,
  apiUrl = "/api/cv"
) => {
  try {
    const normalizedData = normalizeCVData(cvData, fontSize);

    console.log(" Sending CV data to:", apiUrl);
    console.log(" Payload:", normalizedData);

    // Lấy token từ localStorage
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        error: "No authentication token",
        message: "Vui lòng đăng nhập để lưu CV",
      };
    }

    console.log("🔑 Token:", token.substring(0, 20) + "...");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(normalizedData),
    });

    const responseText = await response.text();
    console.log("📥 Backend response status:", response.status);
    console.log(
      "📥 Backend response (first 500 chars):",
      responseText.substring(0, 500)
    );

    // Nếu response không phải JSON (server error)
    if (!responseText.startsWith("{") && !responseText.startsWith("[")) {
      console.error("❌ Backend returned HTML/error page");
      console.error("Full response:", responseText);
      return {
        success: false,
        error: "Server error",
        message:
          "❌ Server lỗi. Kiểm tra backend logs:\n" +
          responseText.substring(0, 200),
      };
    }

    const result = JSON.parse(responseText);

    if (!response.ok) {
      throw new Error(
        result.message ||
          result.error ||
          `HTTP error! status: ${response.status}`
      );
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
      message: "❌ " + (error.message || "Lỗi khi lưu CV. Vui lòng thử lại."),
    };
  }
};

/**
 * Hàm lưu CV dưới dạng JSON file
 * @param {object} cvData - Dữ liệu CV
 * @param {number} fontSize - Kích thước font
 * @param {string} fileName - Tên file (mặc định: CV-{timestamp})
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

  console.log("✅ CV downloaded as JSON");
};

/**
 * Hàm validate dữ liệu CV trước khi gửi
 * @param {object} cvData - Dữ liệu CV
 * @returns {object} - { isValid: boolean, errors: array }
 */
export const validateCVData = (cvData) => {
  const errors = [];

  // Kiểm tra thông tin cá nhân
  if (!cvData.personalInfo.fullName?.trim()) {
    errors.push("Họ và tên không được để trống");
  }
  if (!cvData.personalInfo.email?.trim()) {
    errors.push("Email không được để trống");
  }
  if (cvData.personalInfo.email && !isValidEmail(cvData.personalInfo.email)) {
    errors.push("Email không hợp lệ");
  }

  // Kiểm tra ít nhất một phần
  if (
    cvData.education.length === 0 &&
    cvData.experience.length === 0 &&
    cvData.skills.length === 0
  ) {
    errors.push("Cần có ít nhất một phần (học vấn, kinh nghiệm hoặc kỹ năng)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Hàm kiểm tra email hợp lệ
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Hàm chuyển đổi định dạng từ backend sang format CVBuilder
 * (Nếu muốn load CV từ backend)
 * @param {object} backendData - Dữ liệu từ backend
 * @returns {object} - Format cho CVBuilder
 */
export const denormalizeCVData = (backendData) => {
  return {
    personalInfo: {
      fullName: backendData.personalInfo?.fullName || "",
      title: backendData.personalInfo?.title || "",
      email: backendData.personalInfo?.email || "",
      phone: backendData.personalInfo?.phone || "",
      address: backendData.personalInfo?.address || "",
      photo: backendData.personalInfo?.photo || null,
    },
    summary: backendData.summary || "",
    education: (backendData.education || []).map((edu, idx) => ({
      id: edu.id || idx,
      school: edu.school || "",
      degree: edu.major || "",
      year: `${edu.startDate} - ${edu.endDate}`,
      details: edu.description || "",
    })),
    experience: (backendData.experience || []).map((exp, idx) => ({
      id: exp.id || idx,
      company: exp.company || "",
      position: exp.role || "",
      period: `${exp.startDate} - ${exp.endDate}`,
      details: exp.description || "",
    })),
    skills: (backendData.skills || []).map((skill, idx) => ({
      id: idx,
      category: "Skills",
      items: skill,
    })),
    colors: backendData.style?.colors || {
      primary: "#0066cc",
      secondary: "#374151",
      text: "#111827",
      bg: "#ffffff",
      accent: "#e5e7eb",
    },
    font: backendData.style?.font || "Arial",
  };
};
