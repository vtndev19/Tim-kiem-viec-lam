import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// Import Styles & Assets
import "../styles/components/Chat.scss";
import chatIcon from "../assets/images/chatImg.png";
import notificationIcon from "../assets/images/notification-bell.png";
// Import Services
import { sendMessageToBot } from "../services/ChatService";

// ==================================================================
// CẤU HÌNH CONFIG
// ==================================================================

// Cấu hình các Endpoint API
const API_ENDPOINTS = {
  PREDICT_SALARY: "http://localhost:8080/api/salary/predict",
  ANALYZE_PROFILE: "http://localhost:8080/api/salary/analyze-profile", // Route mới bạn đã thêm
};

const SUGGESTIONS = [
  { id: "predict_salary", text: "Dự đoán mức lương tương lai" },
  { id: "analyze_cv", text: "Phân tích tổng quan hồ sơ" },
];

const STEPS_CONFIG = {
  predict_salary: [
    {
      key: "title",
      question: "Vị trí việc làm bạn mong muốn là gì? (Ví dụ: React Developer)",
    },
    {
      key: "location",
      question:
        "Bạn muốn làm việc tại địa điểm nào? (Ví dụ: Hồ Chí Minh, Hà Nội...)",
    },
    {
      key: "workType",
      question: "Hình thức làm việc bạn mong muốn? (Full-time hoặc Part-time)",
    },
  ],
  // analyze_cv không cần steps vì nó tự lấy hết CV trong DB
};

const Chat = () => {
  // ================= STATE =================
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn?" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Flow State
  const [activeFlow, setActiveFlow] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [collectedData, setCollectedData] = useState({
    title: "",
    location: "",
    workType: "",
  });

  // Notification State
  const [hasNotification, setHasNotification] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Refs
  const messagesEndRef = useRef(null);
  const notificationRef = useRef(null);
  const socketRef = useRef(null);

  // ================= EFFECTS =================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Socket logic (Mockup)
  useEffect(() => {
    if (!socketRef.current) return;
    const handleNotification = (data) => {
      setHasNotification(true);
      setIsShaking(true);
      setNotifications((prev) => [
        { id: Date.now(), message: data?.message || "Thông báo mới!" },
        ...prev,
      ]);
      setTimeout(() => setIsShaking(false), 2000);
    };
    socketRef.current.on("notification", handleNotification);
    return () => {
      socketRef.current?.off("notification", handleNotification);
    };
  }, []);

  // ================= HANDLERS =================

  const toggleChat = () => setIsOpen((prev) => !prev);
  const handleBellClick = () => {
    setHasNotification(false);
    setShowNotifications((prev) => !prev);
  };

  /**
   * 1. XỬ LÝ KHI CHỌN GỢI Ý (SUGGESTION)
   */
  const handleSuggestionClick = async (flowId) => {
    // Reset Data
    setCollectedData({ title: "", location: "", workType: "" });
    setCurrentStepIndex(0);

    const suggestionText =
      SUGGESTIONS.find((s) => s.id === flowId)?.text || flowId;
    setMessages((prev) => [...prev, { sender: "user", text: suggestionText }]);

    // LOGIC 1: PHÂN TÍCH PROFILE (Gọi API ngay, không cần hỏi)
    if (flowId === "analyze_cv") {
      setActiveFlow(null); // Không cần flow steps
      await triggerProfileAnalysis(); // Gọi hàm xử lý riêng
      return;
    }

    // LOGIC 2: DỰ ĐOÁN LƯƠNG (Cần hỏi từng bước)
    if (flowId === "predict_salary") {
      setActiveFlow(flowId);
      const firstQuestion = STEPS_CONFIG[flowId][0].question;
      setMessages((prev) => [...prev, { sender: "bot", text: firstQuestion }]);
    }
  };

  /**
   * 2. XỬ LÝ NHẬP LIỆU & FLOW CÂU HỎI
   */
  const normalizeWorkType = (text) => {
    const lower = text.trim().toLowerCase();
    if (["full-time", "full time", "fulltime", "ft"].includes(lower))
      return "Full-time";
    if (["part-time", "part time", "parttime", "pt"].includes(lower))
      return "Part-time";
    return null;
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInputValue("");

    // --- CASE A: ĐANG TRONG FLOW HỎI ĐÁP (Predict Salary) ---
    if (activeFlow && STEPS_CONFIG[activeFlow]) {
      const currentSteps = STEPS_CONFIG[activeFlow];
      const stepConfig = currentSteps[currentStepIndex];
      let processedValue = text;

      // Validate WorkType
      if (stepConfig.key === "workType") {
        const normalized = normalizeWorkType(text);
        if (!normalized) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Vui lòng chỉ nhập 'Full-time' hoặc 'Part-time'.",
            },
          ]);
          return;
        }
        processedValue = normalized;
      }

      const newData = { ...collectedData, [stepConfig.key]: processedValue };
      setCollectedData(newData);

      const nextIndex = currentStepIndex + 1;
      if (nextIndex < currentSteps.length) {
        setCurrentStepIndex(nextIndex);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: currentSteps[nextIndex].question },
          ]);
        }, 500);
      } else {
        // Đã hỏi xong -> Gọi API Dự đoán
        await triggerSalaryPrediction(newData);
      }
      return;
    }

    // --- CASE B: CHAT THƯỜNG (Gọi Chatbot API) ---
    setIsLoading(true);
    try {
      const botResponse = await sendMessageToBot(text);
      setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Xin lỗi, tôi đang gặp sự cố kết nối." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 3. API: DỰ ĐOÁN LƯƠNG
   */
  const triggerSalaryPrediction = async (finalData) => {
    setActiveFlow(null);
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: `✅ Đã ghi nhận:\n- Vị trí: ${finalData.title}\n- Nơi làm: ${finalData.location}\n- Hình thức: ${finalData.workType}\n\n🤖 Đang phân tích CV và dự đoán lương...`,
      },
    ]);

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        API_ENDPOINTS.PREDICT_SALARY,
        finalData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const { salary_prediction, analysis, used_cv } =
        response.data?.data || {};

      if (response.data.success && salary_prediction) {
        const minSalary = salary_prediction.min_salary?.toLocaleString() || "0";
        const maxSalary = salary_prediction.max_salary?.toLocaleString() || "0";
        const currency = salary_prediction.currency || "USD";

        // Format Message
        let botReply = `🎯 **KẾT QUẢ DỰ ĐOÁN LƯƠNG**\n`;
        botReply += `💰 **Mức lương:** ${minSalary} - ${maxSalary} ${currency}/tháng\n`;
        // 🔥 Lấy Title CV chính xác từ backend đã sửa
        botReply += `📄 **Dựa trên CV:** ${used_cv?.title || "CV mặc định"}\n`;
        botReply += `--------------------------------\n`;

        if (analysis) {
          botReply += `📊 **ĐÁNH GIÁ TỪ AI:**\n${
            analysis.evaluation || "Đang cập nhật..."
          }\n\n`;
          botReply += `✅ **Điểm mạnh:** ${analysis.pros || "N/A"}\n`;
          if (analysis.cons) botReply += `⚠️ **Lưu ý:** ${analysis.cons}\n`;
          botReply += `\n💡 **LỜI KHUYÊN:**\n${
            analysis.advice || "Tiếp tục phát huy!"
          }`;
        }

        setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
      } else {
        throw new Error("Invalid Response Data");
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 4. API: PHÂN TÍCH PROFILE ĐA NGÀNH
   */
  const triggerProfileAnalysis = async () => {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "🤖 Đang đọc toàn bộ CV của bạn để phân tích tổng quan...",
      },
    ]);

    try {
      const token = localStorage.getItem("authToken");
      // Gọi GET Method (vì route này chỉ cần lấy data)
      const response = await axios.get(API_ENDPOINTS.ANALYZE_PROFILE, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const { profile_analysis, total_cvs_analyzed } =
        response.data?.data || {};

      if (response.data.success && profile_analysis) {
        // Format text hiển thị
        let botReply = `📂 **PHÂN TÍCH TỔNG QUAN (${total_cvs_analyzed} CV)**\n\n`;
        botReply += `🗣️ **Nhận xét chung:**\n${profile_analysis.general_assessment}\n\n`;
        botReply += `--------------------------------\n`;

        // Loop qua các Domain
        if (
          profile_analysis.domains &&
          Array.isArray(profile_analysis.domains)
        ) {
          profile_analysis.domains.forEach((domain, idx) => {
            botReply += `🔹 **Lĩnh vực ${idx + 1}: ${domain.field_name}**\n`;
            botReply += `   • Level: ${domain.current_level} (${domain.estimated_experience})\n`;
            botReply += `   • Điểm mạnh: ${
              Array.isArray(domain.strengths)
                ? domain.strengths.join(", ")
                : domain.strengths
            }\n`;
            botReply += `   • Cần cải thiện: ${
              Array.isArray(domain.weaknesses)
                ? domain.weaknesses.join(", ")
                : domain.weaknesses
            }\n`;
            botReply += `   💡 *Lời khuyên: ${domain.advice}*\n\n`;
          });
        }

        setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
      } else {
        throw new Error("Dữ liệu phân tích trống");
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiError = (err) => {
    console.error("❌ API Error:", err);
    let errorMsg = "Có lỗi xảy ra khi xử lý.";
    if (err.response?.status === 404) {
      errorMsg = "Bạn chưa có CV nào trong hệ thống. Vui lòng tạo CV trước!";
    } else {
      errorMsg =
        err.response?.data?.message ||
        "Hệ thống đang bận, vui lòng thử lại sau.";
    }
    setMessages((prev) => [...prev, { sender: "bot", text: `⚠️ ${errorMsg}` }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  // ================= RENDER =================
  return (
    <>
      <div className="chat-container chat-bot">
        <button className="chat-toggle-button" onClick={toggleChat}>
          <img src={chatIcon} alt="ChatBot" />
        </button>

        {isOpen && (
          <div className="chat-window">
            <div className="chat-header">
              <h3>Job Assistant AI</h3>
              <button className="close-chat" onClick={toggleChat}>
                ×
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`message ${msg.sender}`}
                  style={{ whiteSpace: "pre-wrap" }} // pre-wrap để giữ format xuống dòng
                >
                  {msg.text}
                </div>
              ))}

              {!activeFlow && !isLoading && (
                <div
                  className="suggestion-container"
                  style={{
                    marginTop: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                  }}
                >
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSuggestionClick(s.id)}
                      className="suggestion-chip"
                      style={{
                        padding: "8px 12px",
                        borderRadius: "16px",
                        border: "1px solid #007bff",
                        background: "#f0f8ff",
                        color: "#007bff",
                        cursor: "pointer",
                        fontSize: "13px",
                        textAlign: "left",
                      }}
                    >
                      {s.text}
                    </button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="message bot loading">
                  <span>●</span>
                  <span>●</span>
                  <span>●</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeFlow ? "Nhập câu trả lời..." : "Nhập tin nhắn..."
                }
                disabled={isLoading}
              />
              <button onClick={handleSendMessage} disabled={isLoading}>
                Gửi
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Area */}
      <div ref={notificationRef}>
        <div
          className={`notification-bell ${hasNotification ? "active" : ""} ${
            isShaking ? "shake" : ""
          }`}
          onClick={handleBellClick}
        >
          <img src={notificationIcon} alt="notification" />
        </div>

        {showNotifications && (
          <div className="notification-box">
            <h4>Thông báo</h4>
            {notifications.length === 0 ? (
              <p className="no-noti">Không có thông báo mới</p>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li key={n.id}>{n.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Chat;
