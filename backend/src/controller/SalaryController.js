import db from "../configs/data.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ==================================================================
// PHẦN 1: UTILS & HELPERS (CÁC HÀM TIỆN ÍCH)
// ==================================================================

/**
 * Helper: Làm sạch dữ liệu Skills
 */
const parseSkills = (skillsInput) => {
  if (!skillsInput) return "";
  try {
    if (
      typeof skillsInput === "string" &&
      !skillsInput.trim().startsWith("[")
    ) {
      return skillsInput;
    }
    const parsed =
      typeof skillsInput === "string" ? JSON.parse(skillsInput) : skillsInput;
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => `${item.category || ""} ${item.items || ""}`.trim())
        .filter((str) => str.length > 0)
        .join("; ");
    }
    return skillsInput;
  } catch (e) {
    return skillsInput || "";
  }
};

/**
 * Helper: Log dữ liệu đẹp mắt ra Terminal (Debug)
 */
const logSection = (title, data) => {
  console.log(`\n============== [DEBUG] ${title} ==============`);
  if (typeof data === "object") {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(data);
  }
  console.log("====================================================\n");
};

/**
 * Helper: Parse JSON an toàn từ AI Response
 * (Xử lý các ký tự xuống dòng/tab gây lỗi JSON)
 */
const cleanAIResponse = (text) => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    let jsonString = match[0];
    // Xóa các ký tự điều khiển (control characters) gây lỗi parse
    jsonString = jsonString.replace(/[\u0000-\u0019]+/g, "");

    return JSON.parse(jsonString); // Parse lần 1 và duy nhất tại đây
  } catch (error) {
    console.warn("⚠️ JSON Parse Error (cleanAIResponse):", error.message);
    return null;
  }
};

// ==================================================================
// PHẦN 2: AI SERVICES (GIAO TIẾP VỚI GROQ/LLAMA)
// ==================================================================

/**
 * AI SERVICE 1: Matching & Extraction (Chọn CV & Trích xuất dữ liệu)
 */
const callGroqToExtractData = async (jobInfo, listCVs) => {
  console.log("🤖 [AI STEP 1] Đang chọn CV và trích xuất dữ liệu...");

  const candidatesText = listCVs
    .map((cv) => {
      const cleanSkills = parseSkills(cv.skills);
      return `[ID: ${cv.cv_id}] Title: ${cv.title} | Skills: ${cleanSkills} | Exp: ${cv.experience}`;
    })
    .join("\n");

  const prompt = `
    Role: Expert Recruitment Data Analyst.
    Task: Match user's job request: "${jobInfo.title}" with the ONE best CV.
    
    Candidates List:
    ${candidatesText}

    Output JSON strictly:
    {
      "selected_cv_id": "ID",
      "reason": "Reason",
      "extracted_data": {
        "formatted_experience_level": "Entry/Mid/Senior/Executive Level",
        "skills_desc": "Skill1; Skill2",
        "description": "Summary",
        "remote_allowed": "0 or 1"
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
        },
      }
    );

    // ✅ Clean & Parse 1 lần duy nhất
    return cleanAIResponse(response.data.choices[0].message.content);
  } catch (error) {
    console.error("❌ [AI EXTRACT ERROR]:", error.message);
    // Fallback data
    const firstCV = listCVs[0];
    return {
      selected_cv_id: firstCV?.cv_id,
      reason: "System Fallback",
      extracted_data: {
        formatted_experience_level: "Entry Level",
        skills_desc: parseSkills(firstCV?.skills),
        description: firstCV?.summary || "",
        remote_allowed: "0",
      },
    };
  }
};

/**
 * AI SERVICE 2: Salary Analysis (Nhận xét lương chi tiết)
 */
const callGroqToAnalyzeSalary = async (jobPayload, salaryData, cvTitle) => {
  console.log(`🤖 [AI STEP 2] Viết nhận xét cho CV: "${cvTitle}"...`);

  const prompt = `
    Role: Senior HR Specialist.
    Context:
    - Ứng viên: "${cvTitle}"
    - Vị trí: "${jobPayload.title}"
    - Lương dự đoán: ${salaryData.min_salary} - ${salaryData.max_salary} ${salaryData.currency}.

    Task: Viết nhận xét chi tiết bằng Tiếng Việt.
    RULES: Output valid JSON only. Escape newlines with \\n.

    Output JSON Structure:
    {
      "evaluation": "Nhận xét bắt đầu bằng: 'Dựa trên hồ sơ [${cvTitle}]...'",
      "pros": "Điểm mạnh...",
      "cons": "Điểm yếu...",
      "advice": "Lời khuyên..."
    }
  `;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
        },
      }
    );

    const parsedData = cleanAIResponse(
      response.data.choices[0].message.content
    );
    if (!parsedData) throw new Error("JSON Parsing Failed");
    return parsedData;
  } catch (error) {
    console.error("❌ [AI ANALYZE ERROR]:", error.message);
    return {
      evaluation: `Hệ thống nhận thấy hồ sơ "${cvTitle}" phù hợp. Mức lương tham khảo: ${salaryData.min_salary}-${salaryData.max_salary} ${salaryData.currency}.`,
      advice: "Hãy tập trung vào các kỹ năng chuyên môn.",
      pros: "Kỹ năng phù hợp.",
      cons: "Cần thêm kinh nghiệm thực tế.",
    };
  }
};

/**
 * AI SERVICE 3: Phân tích Profile (Đã nâng cấp Prompt: Deep Analysis & Single Persona)
 */
const callGroqToAnalyzeProfile = async (listCVs) => {
  console.log("🤖 [AI STEP 3] Đang phân tích tổng thể hồ sơ đa lĩnh vực...");

  // 1. Chuẩn bị dữ liệu đầu vào
  const candidatesText = listCVs
    .map((cv, index) => {
      const cleanSkills = parseSkills(cv.skills);
      // Không lấy project để tránh lỗi SQL, nhưng lấy Experience chi tiết
      return `
      === HỒ SƠ THÀNH PHẦN SỐ ${index + 1} ===
      - Title (Vị trí): ${cv.title}
      - Summary (Tóm tắt): ${cv.summary || "Không có"}
      - Skills (Kỹ năng): ${cleanSkills}
      - Experience (Kinh nghiệm): ${cv.experience || "Không có"}
      - Education (Học vấn): ${cv.education || "Không có"}
      `;
    })
    .join("\n");

  // 2. Viết Prompt mới (Kỹ thuật Persona & Constraints)
  const prompt = `
    Role: Senior Career Strategist (Chuyên gia chiến lược sự nghiệp cấp cao).
    
    Context:
    Bạn đang phân tích hồ sơ năng lực của **MỘT NGƯỜI DÙNG DUY NHẤT**.
    Người dùng này sở hữu nhiều bản CV khác nhau để ứng tuyển vào các vị trí khác nhau (Slash Career / Đa nghề).
    
    Input Data (Các bản CV của người này):
    ${candidatesText}

    Task:
    Tổng hợp toàn bộ dữ liệu trên thành một báo cáo đánh giá năng lực toàn diện.

    ⛔ STRICT CONSTRAINTS (BẮT BUỘC TUÂN THỦ):
    1. Tuyệt đối KHÔNG dùng từ "các ứng viên", "hai ứng viên", "họ". Phải dùng "Bạn".
    2. KHÔNG đưa ra lời khuyên chung chung như "cần học hỏi thêm", "trau dồi kỹ năng mềm". Lời khuyên phải CHUYÊN SÂU về kỹ thuật (Technical) và cụ thể.
    3. Phải nhận diện được sự liên quan giữa các CV. Ví dụ: Nếu CV 1 là Web, CV 2 là Data -> Đánh giá khả năng làm Fullstack Data hoặc Web-based Data Visualization.
    4. Gom nhóm các kỹ năng trùng lặp từ các CV vào đúng lĩnh vực của nó.

    Output Format (JSON strictly, Vietnamese):
    {
      "general_assessment": "Đánh giá tổng quan về tiềm năng của người này khi kết hợp các kỹ năng lại. (Ví dụ: Sự kết hợp giữa Lập trình và Data Mining tạo nên lợi thế lớn cho vị trí AI Engineer...)",
      "domains": [
        {
          "field_name": "Tên Lĩnh Vực (VD: Software Development)",
          "estimated_experience": "Số năm (Tính toán dựa trên dữ liệu thật)",
          "current_level": "Fresher/Junior/Mid/Senior",
          "strengths": ["Liệt kê kỹ năng cứng cụ thể (VD: React, Python, Scikit-learn)", "Điểm mạnh về tư duy"],
          "weaknesses": ["Lỗ hổng công nghệ cụ thể (VD: Thiếu kiến thức về Cloud/Docker nếu không thấy trong CV)"],
          "advice": "Lời khuyên kỹ thuật cụ thể (VD: Nên học thêm Docker để deploy model Data Mining lên Web)"
        }
      ]
    }
  `;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, // Giữ nhiệt độ thấp để AI tập trung vào sự thật (fact)
        max_tokens: 2500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
        },
      }
    );

    // Xử lý kết quả trả về
    const result = cleanAIResponse(response.data.choices[0].message.content);

    if (!result) throw new Error("AI trả về dữ liệu lỗi.");
    return result;
  } catch (error) {
    console.error("❌ [AI PROFILE ERROR]:", error.message);
    return {
      general_assessment: "Hiện tại chưa thể phân tích chi tiết hồ sơ của bạn.",
      domains: [],
    };
  }
};

// ==================================================================
// PHẦN 3: DB CONTROLLERS (BASIC CRUD)
// ==================================================================

export const getCVDetail = async (req, res) => {
  try {
    const { cv_id } = req.params;
    const [rows] = await db.query("SELECT * FROM cv WHERE cv_id = ?", [cv_id]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy CV" });
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

export const getUserCVs = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [rows] = await db.query(
      "SELECT cv_id, title, summary, created_at FROM cv WHERE user_id = ?",
      [userId]
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

// ==================================================================
// PHẦN 4: MAIN CONTROLLERS (LOGIC CHÍNH)
// ==================================================================

/**
 * CONTROLLER 1: DỰ ĐOÁN LƯƠNG (Predict Salary)
 * - Đã thêm Log nhận dữ liệu từ Python Model
 */
export const predictSalary = async (req, res) => {
  try {
    // --- BƯỚC 1: NHẬN INPUT ---
    const userId = req.user.user_id;
    const { title, location, workType } = req.body;
    logSection("1. CLIENT INPUT", { userId, title });

    if (!title) return res.status(400).json({ message: "Thiếu Job Title" });

    // --- BƯỚC 2: LẤY DỮ LIỆU CV ---
    const [userCVs] = await db.query(
      `SELECT cv_id, title, summary, experience, skills, education FROM cv WHERE user_id = ?`,
      [userId]
    );

    if (!userCVs || userCVs.length === 0) {
      return res.status(404).json({ message: "Bạn chưa có CV nào." });
    }

    // --- BƯỚC 3: GỌI AI ĐỂ CHỌN CV & TRÍCH XUẤT ---
    const aiExtracted = await callGroqToExtractData(
      { title, location, workType },
      userCVs
    );

    // 🔥 LOGIC TÌM TITLE CV TỪ ID AI TRẢ VỀ 🔥
    const aiSelectedIdStr = String(aiExtracted.selected_cv_id).trim();
    let selectedCVOriginal = userCVs.find(
      (cv) => String(cv.cv_id) === aiSelectedIdStr
    );

    // Fallback nếu AI trả ID tào lao
    if (!selectedCVOriginal) {
      console.warn(`⚠️ ID ${aiSelectedIdStr} không khớp. Dùng CV đầu tiên.`);
      selectedCVOriginal = userCVs[0];
    }
    const selectedCVTitle = selectedCVOriginal.title || "Hồ sơ không tên";

    console.log(
      `✅ Selected CV: [${selectedCVTitle}] (ID: ${selectedCVOriginal.cv_id})`
    );

    // --- BƯỚC 4: PAYLOAD PYTHON ---
    const payloadForModel = {
      title: title,
      location: location || "Remote",
      formatted_work_type: workType === "parttime" ? "Part-time" : "Full-time",
      description: aiExtracted.extracted_data.description || "",
      formatted_experience_level:
        aiExtracted.extracted_data.formatted_experience_level || "Entry Level",
      skills_desc: aiExtracted.extracted_data.skills_desc || "",
      remote_allowed: String(aiExtracted.extracted_data.remote_allowed || "0"),
      // Mock params
      company_name: "Prediction Market",
      views: 150.0,
      sponsored: 0,
      application_type: "Simple",
    };

    // --- BƯỚC 5: GỌI PYTHON ---
    let salaryResult;
    try {
      const pythonUrl = "http://127.0.0.1:8000/predict";
      const response = await axios.post(pythonUrl, payloadForModel);

      // 🔥 [MỚI] LOG DỮ LIỆU THÔ TỪ PYTHON 🔥
      logSection("3.1. RAW PYTHON RESPONSE", response.data);

      const rawSalary = response.data.predicted_salary;

      salaryResult = {
        base_salary: Math.round(rawSalary),
        min_salary: Math.round(rawSalary * 0.9),
        max_salary: Math.round(rawSalary * 1.1),
        currency: "USD",
      };

      logSection("3.2. PROCESSED SALARY", salaryResult);
    } catch (pyError) {
      console.warn(
        "⚠️ Python Error. Using Mock Data. Detail:",
        pyError.message
      );
      // Nếu cần log chi tiết lỗi từ Python server:
      if (pyError.response) {
        console.warn("Python Server Response:", pyError.response.data);
      }

      salaryResult = {
        base_salary: 1000,
        min_salary: 900,
        max_salary: 1100,
        currency: "USD",
      };
    }

    // --- BƯỚC 6: GỌI AI PHÂN TÍCH (Truyền Title) ---
    const analysisResult = await callGroqToAnalyzeSalary(
      payloadForModel,
      salaryResult,
      selectedCVTitle
    );

    // --- BƯỚC 7: TRẢ VỀ ---
    return res.status(200).json({
      success: true,
      data: {
        used_cv: {
          id: selectedCVOriginal.cv_id,
          title: selectedCVTitle, // Frontend dùng cái này
          reason: aiExtracted.reason,
        },
        input_details: payloadForModel,
        salary_prediction: salaryResult,
        analysis: analysisResult,
      },
    });
  } catch (error) {
    console.error("❌ SYSTEM ERROR:", error);
    return res
      .status(500)
      .json({ message: "Lỗi Server nội bộ", error: error.message });
  }
};

/**
 * CONTROLLER 2: PHÂN TÍCH HỒ SƠ TỔNG QUÁT (Analyze Profile)
 */
export const analyzeUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    logSection("1. REQUEST PROFILE ANALYSIS", { userId });

    // --- BƯỚC 1: LẤY DỮ LIỆU (Bỏ cột project để tránh lỗi SQL) ---
    const [userCVs] = await db.query(
      `SELECT cv_id, title, summary, experience, skills, education 
       FROM cv 
       WHERE user_id = ?`,
      [userId]
    );

    if (!userCVs || userCVs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bạn chưa có CV nào. Hãy tạo CV trước khi phân tích.",
      });
    }

    // --- BƯỚC 2: GỌI AI PHÂN TÍCH ---
    const analysisResult = await callGroqToAnalyzeProfile(userCVs);
    logSection("2. AI PROFILE RESULT", analysisResult);

    // --- BƯỚC 3: TRẢ VỀ ---
    return res.status(200).json({
      success: true,
      data: {
        total_cvs: userCVs.length,
        profile_analysis: analysisResult,
      },
    });
  } catch (error) {
    console.error("❌ ANALYZE PROFILE ERROR:", error);
    return res
      .status(500)
      .json({ message: "Lỗi phân tích hồ sơ", error: error.message });
  }
};
