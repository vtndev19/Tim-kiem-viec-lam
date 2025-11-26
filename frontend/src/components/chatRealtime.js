import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { MessageCircle } from "lucide-react"; // icon đẹp, cài bằng: npm install lucide-react

// ✅ Lấy token từ localStorage
const token = localStorage.getItem("token");

// ✅ Tạo kết nối socket (chỉ tạo 1 lần)
const socket = io("http://localhost:8080", {
  auth: { token },
});

const ChatWidget = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [open, setOpen] = useState(false); // ✅ Trạng thái mở/đóng hộp chat

  // ✅ Lắng nghe tin nhắn và thông tin user
  useEffect(() => {
    socket.on("connect", () => {
      console.log("🔌 Kết nối server:", socket.id);
    });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user_info", (user) => {
      setUsername(user.username);
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_info");
    };
  }, []);

  // ✅ Gửi tin nhắn
  const sendMessage = () => {
    if (message.trim() === "") return;
    socket.emit("send_message", { text: message, time: new Date() });
    setMessage("");
  };

  return (
    <>
      {/* 🔘 Icon chat nổi */}
      <div style={styles.floatingButton} onClick={() => setOpen(!open)}>
        <MessageCircle size={28} color="white" />
      </div>

      {/* 💬 Hộp chat */}
      {open && (
        <div style={styles.chatBox}>
          <div style={styles.header}>
            <strong>Chat Realtime</strong>
            <button onClick={() => setOpen(false)} style={styles.closeBtn}>
              ×
            </button>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={styles.message}>
                <b>{msg.user ? msg.user + ": " : ""}</b>
                {msg.text}
              </div>
            ))}
          </div>

          <div style={styles.inputArea}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              style={styles.input}
            />
            <button onClick={sendMessage} style={styles.sendBtn}>
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  floatingButton: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
    zIndex: 1000,
  },
  chatBox: {
    position: "fixed",
    bottom: "100px",
    right: "20px",
    width: "300px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "10px",
    boxShadow: "0 5px 10px rgba(0,0,0,0.15)",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "8px 12px",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "18px",
    cursor: "pointer",
  },
  messages: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    maxHeight: "250px",
  },
  message: {
    marginBottom: "6px",
    textAlign: "left",
  },
  inputArea: {
    display: "flex",
    borderTop: "1px solid #ddd",
  },
  input: {
    flex: 1,
    padding: "8px",
    border: "none",
    outline: "none",
  },
  sendBtn: {
    background: "#007bff",
    color: "white",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer",
  },
};

export default ChatWidget;
