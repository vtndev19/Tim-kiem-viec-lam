// src/services/ChatService.js

export const sendMessageToBot = async (message) => {
  const API_KEY = process.env.REACT_APP_GROQ_API_KEY;
  const MODEL = "llama-3.1-8b-instant";
  const API_URL = "https://api.groq.com/openai/v1/chat/completions";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorDetails =
        data?.error?.message || `Lỗi HTTP: ${response.status}`;
      throw new Error(errorDetails);
    }

    const text = data.choices?.[0]?.message?.content;
    return text || "Bot không trả lời. Hãy kiểm tra API hoặc model.";
  } catch (error) {
    console.error("Lỗi khi gọi API Groq:", error);
    return error.message || "Đã có lỗi xảy ra khi gọi API Groq.";
  }
};
