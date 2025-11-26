import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// 🔑 Đặt hằng cho key localStorage để tái sử dụng
const TOKEN_KEY = "authToken";
const USER_KEY = "user";

// ✅ Tạo Context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Khi ứng dụng khởi động → kiểm tra token trong localStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      axios
        .get("http://localhost:8080/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
        })
        .catch((err) => {
          console.error("❌ Token không hợp lệ:", err);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // 🔹 Hàm đăng nhập
  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Đăng nhập thất bại, vui lòng thử lại.",
      };
    }
  };

  // 🔹 Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  // ✅ Truyền xuống cho toàn app
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
