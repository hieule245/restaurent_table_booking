import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import "./Chat.css";
import axios from "axios";

function Chat() {
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState({});
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [sockets] = useState([
    "ws://192.168.16.55:8080/ws",
    "ws://100.84.223.32:8080/ws",
  ]);
  const [isConnected, setIsConnected] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8080/me", { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("user_name", res.data.user.Name);
      });

    const connectWebSocket = async () => {
      const validSocketUrl = await getValidSocket();
      if (validSocketUrl) {
        const socket = new WebSocket(validSocketUrl);
        setIsConnected(true);

        socket.onmessage = (event) => {
          const newMessage = JSON.parse(event.data);
          setMessages((prev) => [...prev, newMessage]);
        };

        setWs(socket);
      } else {
        console.error("Không tìm được WebSocket hợp lệ.");
      }
    };

    connectWebSocket();
    return () => ws && ws.close();
  }, []);

  const getValidSocket = async () => {
    for (let i = 0; i < sockets.length; i++) {
      const isAvailable = await testWebSocket(sockets[i]);
      if (isAvailable) return sockets[i];
    }
    return null;
  };

  const testWebSocket = (url) => {
    return new Promise((resolve) => {
      const socket = new WebSocket(url);
      socket.onopen = () => {
        socket.close();
        resolve(true);
      };
      socket.onerror = () => resolve(false);
    });
  };

  const handleSendMessage = () => {
    if (input.trim() !== "" && ws && user?.Name) {
      const message = {
        username: user.Name,
        content: input,
      };
      ws.send(JSON.stringify(message));
      setInput("");
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="vh-100 d-flex">
      <div
        className={`chat-sidebar bg-dark text-white p-2 ${
          isSidebarOpen ? "col-2" : "col-1"
        }`}
      >
        <div className="px-3">
          <button
            className="btn btn-dark text-white d-flex align-items-center mb-3 fw-bold fs-5 rounded-pill"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-2 fs-4"></i> Back
          </button>
          <button
            className="btn btn-light d-flex align-items-center justify-content-center mb-3 rounded-pill"
            onClick={toggleSidebar}
          >
            <i className="bi bi-list fs-4"></i>
          </button>
        </div>
        {isSidebarOpen && (
          <>
            <h5 className="fw-bold text-center mt-5">People</h5>
            <hr />
            <div className="bg-secondary rounded">
              <ul>
                <li className="active-user p-1 rounded bg-white text-dark">
                  {user.Name || "Me"}
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
      <div className="chat-main d-flex flex-column flex-grow-1">
        <div className="chat-header bg-black text-white text-center py-2 fw-bold">
          <h2>Chat - table booker</h2>
          <div className="bg-light text-dark rounded p-2 mt-2">
            <p className="mb-0">Chatting as: {user.Name}</p>
            <p className="mb-0">Email: {user.Email}</p>
          </div>
        </div>
        <div className="chat-messages flex-grow-1 p-2 overflow-auto d-flex flex-column">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message rounded-pill px-3 py-1 mb-1 fs-6 ${
                msg.username === user.Name
                  ? "bg-primary text-white align-self-end"
                  : "bg-danger text-white align-self-start"
              }`}
            >
              {msg.username} | {msg.content}
            </div>
          ))}
        </div>
        <footer className="chat-footer bg-dark text-white d-flex p-2">
          <input
            type="text"
            className="form-control me-1 rounded-pill px-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            className="btn bg-success rounded-pill d-flex align-items-center mx-2"
            onClick={handleSendMessage}
          >
            <i className="bi bi-send me-1 px-2"></i>
          </button>
        </footer>
      </div>
    </div>
  );
}

export default Chat;
