import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// Styles (không thay đổi scss của bạn)
import "../styles/components/Chat.scss";
import chatIcon from "../assets/images/chatImg.png";

// ==================================================================
// CẤU HÌNH
// ==================================================================
const API_ENDPOINTS = {
  PREDICT_SALARY: "http://localhost:8080/api/salary/predict",
  ANALYZE_PROFILE: "http://localhost:8080/api/salary/analyze-profile",
  NOTIFICATIONS: "http://localhost:8080/api/notifications",
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
};

// ==================================================================
// COMPONENT: Chat
// ==================================================================
export default function Chat() {
  // ================= STATE =================
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn?" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Flow state
  const [activeFlow, setActiveFlow] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [collectedData, setCollectedData] = useState({
    title: "",
    location: "",
    workType: "",
  });

  // Notification state (giữ nếu bạn dùng sau)
  const [hasNotification, setHasNotification] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Refs
  const messagesEndRef = useRef(null);
  const notificationRef = useRef(null);

  // ================= EFFECTS =================
  useEffect(() => {
    // Tự cuộn xuống khi có tin nhắn mới
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    // Đóng popup thông báo khi click ra ngoài
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

  // ================= HANDLERS =================

  // Mở / đóng chat
  const toggleChat = () => setIsOpen((prev) => !prev);

  // Xử lý click chuông (hiển thị/ẩn notifications)
  const handleBellClick = () => {
    setHasNotification(false);
    setShowNotifications((prev) => !prev);
  };

  // Xử lý khi user chọn 1 gợi ý (suggestion)
  const handleSuggestionClick = async (flowId) => {
    // Reset dữ liệu flow
    setCollectedData({ title: "", location: "", workType: "" });
    setCurrentStepIndex(0);

    const suggestionText =
      SUGGESTIONS.find((s) => s.id === flowId)?.text || flowId;
    setMessages((prev) => [...prev, { sender: "user", text: suggestionText }]);

    if (flowId === "analyze_cv") {
      setActiveFlow(null);
      await triggerProfileAnalysis();
      return;
    }

    if (flowId === "predict_salary") {
      setActiveFlow(flowId);
      const firstQuestion = STEPS_CONFIG[flowId][0].question;
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: firstQuestion },
        ]);
      }, 250);
    }
  };

  // Normalize workType để đảm bảo dữ liệu đầu vào
  const normalizeWorkType = (text) => {
    const lower = text.trim().toLowerCase();
    if (["full-time", "full time", "fulltime", "ft"].includes(lower))
      return "Full-time";
    if (["part-time", "part time", "parttime", "pt"].includes(lower))
      return "Part-time";
    return null;
  };

  // Gửi message từ input
  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text) return;

    // Thêm tin nhắn user vào UI
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInputValue("");

    // Nếu đang trong flow (predict_salary) -> xử lý theo từng bước
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
        // Hoàn tất flow -> gọi API dự đoán
        await triggerSalaryPrediction(newData);
      }

      return; // kết thúc xử lý khi trong flow
    }

    // Nếu không ở trong flow thì gửi tới bot service (sendMessageToBot hoặc API)
    setIsLoading(true);
    try {
      // Nếu bạn có service gửi tới bot, giữ nguyên; nếu không, thay bằng call API khác
      // Lưu ý: original có import sendMessageToBot từ ChatService; nếu bạn muốn dùng nó thì uncomment dòng import
      // const botResponse = await sendMessageToBot(text);
      // setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);

      // Tạm thời echo trả lời đơn giản (nếu bạn dùng sendMessageToBot, hãy bật lại)
      const botResponse = await (async () => {
        // Ví dụ: gọi API nội bộ nếu bạn có endpoint; giữ nguyên logic ban đầu
        return "Đã nhận tin nhắn: '" + text + "' (bot trả về giả lập)";
      })();

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

  // ================= API: DỰ ĐOÁN LƯƠNG =================
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

      if (response.data?.success && salary_prediction) {
        const minSalary =
          salary_prediction.min_salary != null
            ? salary_prediction.min_salary.toLocaleString()
            : "0";
        const maxSalary =
          salary_prediction.max_salary != null
            ? salary_prediction.max_salary.toLocaleString()
            : "0";
        const currency = salary_prediction.currency || "USD";

        let botReply = `🎯 KẾT QUẢ DỰ ĐOÁN LƯƠNG\n`;
        botReply += `💰 Mức lương: ${minSalary} - ${maxSalary} ${currency}/năm\n`;
        botReply += `📄 Dựa trên CV: ${used_cv?.title || "CV mặc định"}\n`;
        botReply += `--------------------------------\n`;

        if (analysis) {
          botReply += `📊 ĐÁNH GIÁ TỪ AI:\n${
            analysis.evaluation || "Đang cập nhật..."
          }\n\n`;
          botReply += `✅ Điểm mạnh: ${analysis.pros || "N/A"}\n`;
          if (analysis.cons) botReply += `⚠️ Lưu ý: ${analysis.cons}\n`;
          botReply += `\n💡 LỜI KHUYÊN:\n${
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

  // ================= API: PHÂN TÍCH PROFILE =================
  const triggerProfileAnalysis = async () => {
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "🤖 Đang đọc và tổng hợp dữ liệu từ toàn bộ CV của bạn...",
      },
    ]);

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(API_ENDPOINTS.ANALYZE_PROFILE, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const { profile_analysis, total_cvs } = response.data?.data || {};

      if (response.data?.success && profile_analysis) {
        const cvCount = total_cvs || 0;

        const formatList = (items) => {
          if (!items) return "Không có dữ liệu";
          return Array.isArray(items) ? items.join(", ") : items;
        };

        let botReply = `📂 KẾT QUẢ PHÂN TÍCH TỔNG HỢP (Dựa trên ${cvCount} CV)\n\n`;

        botReply += `🗣️ Nhận định chiến lược:\n${profile_analysis.general_assessment}\n`;
        botReply += `────────────────────────\n\n`;

        if (Array.isArray(profile_analysis.domains)) {
          profile_analysis.domains.forEach((domain, idx) => {
            const icon = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"][idx] || "🔹";

            botReply += `${icon} Lĩnh vực: ${domain.field_name}\n`;
            botReply += `   • Cấp độ: ${domain.current_level} (${domain.estimated_experience})\n`;
            botReply += `   • Thế mạnh: ${formatList(domain.strengths)}\n`;
            botReply += `   • Hạn chế: ${formatList(domain.weaknesses)}\n`;
            botReply += `   💡 Lời khuyên: ${domain.advice}\n\n`;
          });
        }

        setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
      } else {
        throw new Error("Không nhận được dữ liệu phân tích từ server.");
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý lỗi API chung
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

  // ================= RENDER =================
  return (
    <div className="chat-container">
      <button
        className={`chat-toggle-button ${isOpen ? "hidden" : ""}`}
        onClick={toggleChat}
      >
        <img src={chatIcon} alt="ChatBot" />
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="header-info">
              <h3>Job Assistant AI</h3>
              <span className="status">Online</span>
            </div>
            <button
              className="close-chat"
              onClick={toggleChat}
              aria-label="Đóng chat"
            >
              ×
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message-wrapper ${msg.sender}`}>
                {/* Avatar: không dùng hình, dùng chữ tường minh */}
                {msg.sender === "bot" && <div className="bot-avatar">AI</div>}
                <div className="message-bubble">{msg.text}</div>
              </div>
            ))}

            {/* Gợi ý (suggestions) */}
            {!activeFlow && !isLoading && (
              <div className="suggestion-container">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSuggestionClick(s.id)}
                    className="chip"
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="message-wrapper bot">
                <div className="bot-avatar">AI</div>
                <div className="message-bubble loading">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={
                activeFlow ? "Nhập câu trả lời..." : "Nhập tin nhắn..."
              }
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="send-btn"
              aria-label="Gửi"
            >
              {/* Ícon gửi bị loại theo yêu cầu workflow không dùng icon */}
              <span>Gửi</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
