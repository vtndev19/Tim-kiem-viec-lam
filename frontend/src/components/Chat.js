import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

// Styles & Assets
import "../styles/components/Chat.scss";
import chatIcon from "../assets/images/chatImg.png"; // Giữ nguyên icon của bạn

// ==================================================================
// CẤU HÌNH HỆ THỐNG
// ==================================================================
const API_ENDPOINTS = {
  PREDICT_SALARY: "http://localhost:8080/api/salary/predict",
  ANALYZE_PROFILE: "http://localhost:8080/api/salary/analyze-profile",
  NOTIFICATIONS: "http://localhost:8080/api/notifications",
  CHAT_AI: "http://localhost:8080/api/chat/message",
  RECOMMEND_JOBS: "http://localhost:8080/api/salary/recommend-jobs",
};

const SUGGESTIONS = [
  { id: "predict_salary", text: "💰 Dự đoán mức lương" },
  { id: "analyze_cv", text: "📊 Phân tích hồ sơ" },
  { id: "recommend_jobs", text: "💼 Tư vấn việc làm" },
];

const STEPS_CONFIG = {
  predict_salary: [
    {
      key: "title",
      question: "Vị trí việc làm bạn mong muốn là gì? (Ví dụ: React Developer)",
    },
    {
      key: "location",
      question: "Bạn muốn làm việc tại địa điểm nào? (Ví dụ: Hồ Chí Minh)",
    },
    {
      key: "workType",
      question: "Hình thức làm việc? (Full-time / Part-time)",
    },
  ],
};

// ==================================================================
// COMPONENT: Chat
// ==================================================================
export default function Chat() {
  // --- STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho sự nghiệp của bạn hôm nay?",
    },
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

  const messagesEndRef = useRef(null);

  // --- EFFECTS ---
  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // --- HANDLERS: UTILS ---
  const toggleChat = () => setIsOpen((prev) => !prev);

  const normalizeWorkType = (text) => {
    const lower = text.trim().toLowerCase();
    if (["full-time", "full time", "fulltime", "ft"].includes(lower))
      return "Full-time";
    if (["part-time", "part time", "parttime", "pt"].includes(lower))
      return "Part-time";
    return null;
  };

  const handleApiError = (err) => {
    let errorMsg = "Có lỗi kết nối server.";
    if (err.response?.status === 404)
      errorMsg = "Hệ thống không tìm thấy dữ liệu CV của bạn.";
    setMessages((prev) => [...prev, { sender: "bot", text: `⚠️ ${errorMsg}` }]);
  };

  // --- HANDLERS: FLOW & API ---
  const handleSuggestionClick = async (flowId) => {
    setCollectedData({ title: "", location: "", workType: "" });
    setCurrentStepIndex(0);

    const suggestionText =
      SUGGESTIONS.find((s) => s.id === flowId)?.text || flowId;
    setMessages((prev) => [...prev, { sender: "user", text: suggestionText }]);

    // 1. Phân tích CV
    if (flowId === "analyze_cv") {
      setActiveFlow(null);
      await triggerProfileAnalysis();
      return;
    }

    // 2. Tư vấn việc làm
    if (flowId === "recommend_jobs") {
      setActiveFlow(null);
      await triggerJobRecommendation();
      return;
    }

    // 3. Dự đoán lương (Flow)
    if (flowId === "predict_salary") {
      setActiveFlow(flowId);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: STEPS_CONFIG[flowId][0].question },
        ]);
      }, 400);
    }
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInputValue("");

    // A. Xử lý Kịch bản (Flow)
    if (activeFlow && STEPS_CONFIG[activeFlow]) {
      const currentSteps = STEPS_CONFIG[activeFlow];
      const stepConfig = currentSteps[currentStepIndex];
      let processedValue = text;

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
        }, 400);
      } else {
        await triggerSalaryPrediction(newData);
      }
      return;
    }

    // B. Xử lý Chat AI tự do
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        API_ENDPOINTS.CHAT_AI,
        { message: text },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      const botReply =
        response.data?.data?.reply ||
        response.data?.message ||
        "Không có phản hồi.";
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Xin lỗi, tôi đang gặp sự cố kết nối." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- API CALLS ---
  const triggerSalaryPrediction = async (finalData) => {
    setActiveFlow(null);
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: `🤖 Đang tính toán mức lương cho vị trí **${finalData.title}**...`,
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
      if (response.data?.success && salary_prediction) {
        const minSalary = salary_prediction.min_salary?.toLocaleString() || "0";
        const maxSalary = salary_prediction.max_salary?.toLocaleString() || "0";
        const currency = salary_prediction.currency || "USD";

        let botReply = `### 🎯 KẾT QUẢ DỰ ĐOÁN\n\n`;
        botReply += `**💰 Mức lương ước tính:** ${minSalary} - ${maxSalary} ${currency}/năm\n\n`;
        botReply += `_Dựa trên CV: ${used_cv?.title || "Mặc định"}_ \n\n`;

        if (analysis) {
          botReply += `#### 📊 Đánh giá chi tiết\n${
            analysis.evaluation || ""
          }\n\n`;
          botReply += `* **Điểm mạnh:** ${analysis.pros || "N/A"}\n`;
          botReply += `* **Lời khuyên:** ${
            analysis.advice || "Tiếp tục phát huy!"
          }`;
        }
        setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
      } else {
        throw new Error("Invalid Data");
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerProfileAnalysis = async () => {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "🤖 Đang phân tích hồ sơ năng lực của bạn..." },
    ]);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(API_ENDPOINTS.ANALYZE_PROFILE, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const { profile_analysis } = response.data?.data || {};
      if (response.data?.success && profile_analysis) {
        let botReply = `### 📂 PHÂN TÍCH HỒ SƠ\n\n${profile_analysis.general_assessment}\n`;
        setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
      } else {
        throw new Error("No data");
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerJobRecommendation = async () => {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "🔍 Đang tìm kiếm cơ hội việc làm phù hợp với Skills của bạn...",
      },
    ]);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        API_ENDPOINTS.RECOMMEND_JOBS,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      const recommendationText = response.data?.data?.recommendation;
      if (response.data?.success && recommendationText) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: recommendationText },
        ]);
      } else {
        throw new Error("No data");
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ================= RENDER =================
  return (
    <div className={`chat-widget-container ${isOpen ? "open" : ""}`}>
      {/* Nút bật/tắt Chat (Giữ nguyên icon của bạn) */}
      <button
        className={`chat-toggle-btn ${isOpen ? "hide" : ""}`}
        onClick={toggleChat}
      >
        <img src={chatIcon} alt="Chat" />
      </button>

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="header-title">
              <span className="sparkle-icon">✨</span>
              <h3>Job Assistant AI</h3>
            </div>
            <button className="close-btn" onClick={toggleChat}>
              ×
            </button>
          </div>

          {/* Nội dung tin nhắn */}
          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.sender}`}>
                {msg.sender === "bot" && (
                  <div className="bot-avatar">
                    {/* Icon Gemini Sparkle cho avatar Bot trong chat */}
                    <img
                      src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg"
                      alt="AI"
                    />
                  </div>
                )}

                <div className="message-content">
                  {msg.sender === "bot" ? (
                    <div className="markdown-renderer">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="user-text">{msg.text}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Hiệu ứng Loading "AI đang gõ..." */}
            {isLoading && (
              <div className="message-row bot">
                <div className="bot-avatar">
                  <img
                    src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg"
                    alt="AI"
                  />
                </div>
                <div className="message-content loading-dots">
                  <span>•</span>
                  <span>•</span>
                  <span>•</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Gợi ý (Chips) - Chỉ hiện khi không trong luồng & không loading */}
          {!activeFlow && !isLoading && (
            <div className="suggestions-area">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSuggestionClick(s.id)}
                  className="suggestion-chip"
                >
                  {s.text}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="chat-footer">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={
                activeFlow ? "Nhập câu trả lời..." : "Hỏi tôi bất cứ điều gì..."
              }
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="send-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
