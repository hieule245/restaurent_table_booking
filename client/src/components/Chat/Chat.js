import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import "./Chat.css";
import axios from "axios";
function Chat() {
  const [loadingWs, setLoadingWs] = useState(true); // loading trong lúc kết nối
  const [connectedMessage, setConnectedMessage] = useState(""); // thông báo kết nối thành công

  const [people, setPeople] = useState([]);

  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState({});
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const getSockets = () => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    return [
      `${protocol}://192.168.16.55:8080/ws`,
      `${protocol}://100.84.223.32:8080/ws`,
      `${protocol}://giolang.cloud.runsystem.site/ws`,
    ];
  };

  const [sockets] = useState(getSockets());
  const [isConnected, setIsConnected] = useState(false);
  const [receiverId, setReceiverId] = useState(null); // người nhận
  const [receiverRole, setReceiverRole] = useState(null); // người nhận

  const navigate = useNavigate();

  useEffect(() => {
    if (!user.Id || !user.Role) return;

    const fetchPeople = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/chat/people`,
          {
            params: { role: user.Role, user_id: user.Id },
            withCredentials: true,
          }
        );
        console.log("Danh sách người chat được:", res.data);
        setPeople(res.data);
      } catch (error) {
        console.error("Lỗi khi gọi API /api/chat/people:", error);
      }
    };

    fetchPeople();
  }, [user.Id, user.Role]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/me`, {
          withCredentials: true,
        });
        const currentUser = res.data.user;
        console.log("Thông tin user:", res.data.user);
        setUser(currentUser);
        console.log("Bắt đầu kết nối WebSocket với user ID:", res.data.user);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };

    fetchUser();
  }, []);

  // ✅ Khi user.Id đã có → kết nối WebSocket
  useEffect(() => {
    if (!user.Id) return;

    let socket;

    const connectWebSocket = async () => {
      const validSocketUrl = await getValidSocket(user.Id, user.Role);
      if (validSocketUrl) {
        socket = new WebSocket(validSocketUrl);
        setWs(socket);
        setIsConnected(true);
        setLoadingWs(false);
        setConnectedMessage("✅ Đã kết nối WebSocket thành công!");

        socket.onmessage = (event) => {
          console.log("📩 Received WebSocket message:", event.data); // ← log để kiểm tra
          const newMessage = JSON.parse(event.data);
          if (
            (newMessage.sender_id === user.Id &&
              newMessage.sender_role === user.Role) ||
            (newMessage.receiver_id === user.Id &&
              newMessage.receiver_role === user.Role)
          ) {
            setMessages((prev) => [...prev, newMessage]);
          }
        };
      } else {
        console.error("Không tìm được WebSocket hợp lệ.");
        setLoadingWs(false);
        setConnectedMessage("❌ Không thể kết nối WebSocket.");
      }
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [user.Id]); // 🔁 Theo dõi user.Id

  const getValidSocket = async (userID, userRole) => {
    for (let i = 0; i < sockets.length; i++) {
      const urlWithUserID = `${sockets[i]}?user_id=${userID}&user_role=${userRole}`;
      const isAvailable = await testWebSocket(urlWithUserID);
      if (isAvailable) return urlWithUserID;
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
    console.log("Sending message with:", {
      input,
      ws,
      userID: user.Id,
      userRole: user.Role,
      receiverId,
      receiverRole,
    });

    if (input.trim() !== "" && ws && user?.Id && receiverId) {
      const message = {
        sender_id: user.Id,
        sender_role: user.Role,
        receiver_id: receiverId,
        receiver_role: receiverRole,
        content: input,
      };
      ws.send(JSON.stringify(message));
      setMessages((prev) => [...prev, message]);
      setInput("");
      console.log("Message sented", message);
    }
    console.log("Message not sent");
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (loadingWs) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
        <div className="text-center">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Đang kết nối...</span>
          </div>
          <p className="mt-3">Đang kết nối đến WebSocket...</p>
        </div>
      </div>
    );
  }

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
            <div className="bg-secondary rounded py-1 px-1">
              <ul>
                {people.map((person) => (
                  <li
                    key={`${person.id}-${person.role}`}
                    className={`active-user p-1 rounded  d-flex justify-content-start align-items-center mt-1 ${
                      receiverId === person.id && receiverRole === person.role
                        ? "bg-primary text-white"
                        : "bg-white text-dark"
                    }  `}
                    onClick={() => {
                      setReceiverId(person.id);
                      setReceiverRole(person.role);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className="bg-success rounded-circle mx-3 shadow-sm"
                      style={{ height: "12px", width: "12px" }}
                    ></div>
                    {person.name + " (" + person.role + ") "}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
      <div className="chat-main d-flex flex-column flex-grow-1">
        <div className="chat-header bg-black text-white text-start py-2 fw-bold">
          <h2 className="d-flex align-items-center justify-content-center">
            {connectedMessage && (
              <div className="alert alert-info text-center m-2 py-2 rounded-pill">
                {connectedMessage}
              </div>
            )}

            <p className="text-primary fs-2 fw-bold">CHAT</p>
            <p className="fw-bold"> |</p>
            <p className="text-danger">Table booker</p>
          </h2>

          <div className="bg-light text-dark rounded">
            <div className="bg-light text-dark rounded p-2 m-2">
              <div className="row">
                <div className="col-1">
                  <p className="mb-0">Chatting as</p>
                </div>
                <div className="col">
                  <p className="mb-0 text-danger">{": " + user.Name}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-1">
                  <p className="mb-0">Email </p>
                </div>
                <div className="col">
                  <p className="mb-0 text-primary">{": " + user.Email}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-1">
                  <p className="mb-0">Role </p>
                </div>
                <div className="col">
                  <p className="mb-0 text-success">{": " + user.Role}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-1">
                  <p className="mb-0">ID </p>
                </div>
                <div className="col">
                  <p className="mb-0 text-danger">{": " + user.Id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="chat-messages flex-grow-1 p-2 overflow-auto d-flex flex-column">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message rounded-pill px-3 py-1 mb-1 fs-6 ${
                msg.sender_id === user.Id && msg.sender_role === user.Role
                  ? "bg-primary text-white align-self-end"
                  : "bg-danger text-white align-self-start"
              }`}
            >
              {msg.content}
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
