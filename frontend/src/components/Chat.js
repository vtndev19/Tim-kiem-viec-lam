import React, { useState, useEffect, useRef } from "react";
import "../styles/components/Chat.scss";
import chatIcon from "../assets/images/chatImg.png";
import { sendMessageToBot } from "../services/ChatService";
import { io } from "socket.io-client";
import chat from "../assets/images/chat.png";
import notification from "../assets/images/notification-bell.png";

const Chat = () => {
  // ====== CHAT BOT ======
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);
  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;
    const userMessage = { sender: "user", text: inputValue };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    const botResponseText = await sendMessageToBot(currentInput);
    const botResponse = { sender: "bot", text: botResponseText };
    setMessages((prevMessages) => [...prevMessages, botResponse]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  // ====== CHAT REALTIME ======
  const [isRealtimeOpen, setIsRealtimeOpen] = useState(false);
  const [realtimeMessages, setRealtimeMessages] = useState([]);
  const [realtimeInput, setRealtimeInput] = useState("");
  const token = localStorage.getItem("token");
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:8080", { auth: { token } });
    socketRef.current.on("receive_message", (data) => {
      setRealtimeMessages((prev) => [
        ...prev,
        { user: data.user || "Khách", text: data.text },
      ]);
    });
    return () => socketRef.current.disconnect();
  }, [token]);

  const sendRealtimeMessage = () => {
    if (realtimeInput.trim() === "") return;
    const msg = { text: realtimeInput, time: new Date() };
    socketRef.current.emit("send_message", msg);
    setRealtimeMessages((prev) => [
      ...prev,
      { user: "Tôi", text: realtimeInput },
    ]);
    setRealtimeInput("");
  };

  // ====== THÔNG BÁO ======
  const [hasNotification, setHasNotification] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);

  // Khi nhận thông báo mới từ socket
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("notification", (data) => {
      console.log("📩 Nhận thông báo:", data);
      setHasNotification(true);
      setIsShaking(true);
      setNotifications((prev) => [
        { id: Date.now(), message: data.message || "Thông báo mới!" },
        ...prev,
      ]);

      // Dừng rung sau 2 giây
      setTimeout(() => setIsShaking(false), 2000);
    });
  }, []);

  // Bấm vào chuông -> mở/đóng box thông báo
  const handleBellClick = () => {
    setHasNotification(false);
    setShowNotifications((prev) => !prev);
  };

  // Ẩn box khi click ra ngoài
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
  return (
    <>
      {/* ================= CHAT BOT BOX ================= */}
      <div className="chat-container chat-bot">
        <button className="chat-toggle-button" onClick={toggleChat}>
          <img src={chatIcon} alt="ChatBot" />
        </button>

        {isOpen && (
          <div className="chat-window">
            <div className="chat-header">
              <h3>🤖 Hỗ trợ tự động</h3>
              <button className="close-chat" onClick={toggleChat}>
                ×
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
              {isLoading && (
                <div className="message bot loading">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
              />
              <button onClick={handleSendMessage}>Gửi</button>
            </div>
          </div>
        )}
      </div>

      {/* ================= CHAT REALTIME BOX ================= */}
      <div className="chat-container chat-realtime">
        <button
          className="chat-toggle-button"
          onClick={() => setIsRealtimeOpen(!isRealtimeOpen)}
        >
          <img src={chat} alt="chat" />
        </button>

        {isRealtimeOpen && (
          <div className="chat-window">
            <div className="chat-header">
              <h3>Tin nhắn</h3>
              <button
                className="close-chat"
                onClick={() => setIsRealtimeOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="chat-messages">
              {realtimeMessages.map((msg, i) => (
                <div key={i} className="message user">
                  <strong>{msg.user}: </strong>
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                value={realtimeInput}
                onChange={(e) => setRealtimeInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendRealtimeMessage()}
                placeholder="Nhập tin nhắn ..."
              />
              <button onClick={sendRealtimeMessage}>Gửi</button>
            </div>
          </div>
        )}
      </div>

      {/* ICON THÔNG BÁO + BOX THÔNG BÁO */}
      <div ref={notificationRef}>
        <div
          className={`notification-bell ${hasNotification ? "active" : ""} ${
            isShaking ? "shake" : ""
          }`}
          onClick={handleBellClick}
          title="Thông báo mới"
        >
          <img src={notification} alt="notification" />
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
