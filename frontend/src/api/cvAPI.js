import axios from "axios";

const API_URL = "http://localhost:8080/api/cv";

export const saveCV = async (token, cvData) => {
  try {
    const res = await axios.post(`${API_URL}/save`, cvData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi lưu CV:", err);
    throw err.response?.data || { message: "Không thể lưu CV" };
  }
};
