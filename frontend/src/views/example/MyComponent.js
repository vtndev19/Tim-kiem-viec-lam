import React from "react";
import { GoogleGenAI } from "@google/genai";

// ⚠️ Tạm thời hardcode API key để test
const ai = new GoogleGenAI({
    apiKey: "AIzaSyCaBp3RKm1cwBlbrmx2sPnA6tTao2IlTjU", // thay bằng API key thật của bạn
});


class MyComponent extends React.Component {
    state = { name: "" };

    handleChangeName = (event) => {
        this.setState({ name: event.target.value });
    };

    render() {
        return (
            <div>
                <p>Nhập tên</p>
                <input
                    id="textName"
                    value={this.state.name}
                    type="text"
                    onChange={this.handleChangeName}
                />
                <p>xin chào {this.state.name}</p>
            </div>
        );
    }
}

class Header extends React.Component {
    render() {
        return (
            <div id="header">
                <h1>Tìm kiếm việc làm phù hợp với bạn</h1>
            </div>
        );
    }
}

class BoxChat extends React.Component {
    state = {
        input: "",
        messages: [],
        loading: false, // ✅ thêm trạng thái loading
    };

    handleChangeInput = (event) => {
        this.setState({ input: event.target.value });
    };

    handleSendMessage = async () => {
        if (this.state.input.trim() === "") return;

        const userMsg = { role: "user", text: this.state.input };
        this.setState((prev) => ({
            messages: [...prev.messages, userMsg],
            input: "",
            loading: true,
        }));

        try {
            // ✅ Gọi API Gemini
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: userMsg.text,
            });

            const aiMsg = { role: "ai", text: response.text || "Không có phản hồi" };

            this.setState((prev) => ({
                messages: [...prev.messages, aiMsg],
                loading: false,
            }));
        } catch (error) {
            console.error("Lỗi API:", error);
            const errMsg = { role: "ai", text: "❌ Có lỗi khi gọi API" };
            this.setState((prev) => ({
                messages: [...prev.messages, errMsg],
                loading: false,
            }));
        }
    };

    render() {
        return (
            <div
                style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    width: "350px",
                    marginTop: "20px",
                }}
            >
                <h3>Box Chat</h3>

                <div
                    style={{
                        border: "1px solid #eee",
                        height: "200px",
                        overflowY: "auto",
                        padding: "5px",
                        marginBottom: "10px",
                    }}
                >
                    {this.state.messages.map((msg, i) => (
                        <p
                            key={i}
                            style={{
                                margin: "5px 0",
                                color: msg.role === "ai" ? "blue" : "black",
                            }}
                        >
                            <b>{msg.role === "ai" ? "AI" : "Bạn"}:</b> {msg.text}
                        </p>
                    ))}

                    {/* ✅ Hiện loading khi chờ API */}
                    {this.state.loading && <p style={{ color: "gray" }}>AI đang trả lời...</p>}
                </div>

                <input
                    type="text"
                    value={this.state.input}
                    onChange={this.handleChangeInput}
                    placeholder="Nhập tin nhắn..."
                    style={{ width: "220px", marginRight: "5px" }}
                />
                <button onClick={this.handleSendMessage} disabled={this.state.loading}>
                    Gửi
                </button>
            </div>
        );
    }
}

export { Header, BoxChat };
export default MyComponent;
