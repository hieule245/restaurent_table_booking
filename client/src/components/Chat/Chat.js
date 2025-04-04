import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // Import Bootstrap icons
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./Chat.css"; // Additional custom styles

function Chat() {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you?", sender: "receiver" },
    { text: "Can you tell me about your services?", sender: "user" },
    {
      text: "Sure! We offer table booking for restaurants.",
      sender: "receiver",
    },
  ]); // Added fake messages
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to toggle sidebar
  const navigate = useNavigate(); // Initialize navigate function

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="vh-100 d-flex">
      <div
        className={`chat-sidebar bg-dark text-white p-2 ${
          isSidebarOpen ? "col-2" : "col-1" // Use col-2 when expanded
        }`}
      >
        <div className="px-3">
          <button
            className="btn btn-dark text-white d-flex align-items-center mb-3 fw-bold fs-5 rounded-pill"
            onClick={() => navigate(-1)} // Navigate to the previous page
          >
            <i className="bi bi-arrow-left me-2 fs-4"></i> Back
          </button>
          <button
            className="btn btn-light d-flex align-items-center justify-content-center mb-3 rounded-pill"
            onClick={toggleSidebar}
          >
            <i className="bi bi-list fs-4"></i>{" "}
            {/* Updated icon to "menu" style */}
          </button>
        </div>
        {isSidebarOpen && (
          <>
            <h5 className="fw-bold text-center mt-5">People</h5>
            <hr />
            <div className="bg-secondary rounded">
              <ul>
                <li className="active-user p-1 rounded bg-white text-dark">
                  User 1
                </li>
                <li className="p-1">User 2</li>
                <li className="p-1">User 3</li>
              </ul>
            </div>
          </>
        )}
      </div>
      <div className="chat-main d-flex flex-column flex-grow-1">
        <div className="chat-header bg-black text-white text-center py-2 fw-bold">
          <h2>Chat - table booker</h2>
          <p className="mb-0">Chatting with: User 1</p>
        </div>
        <div className="chat-messages flex-grow-1 p-2 overflow-auto d-flex flex-column">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message rounded-pill px-3 py-1 mb-1 fs-6 ${
                message.sender === "user"
                  ? "bg-primary text-white align-self-end" // Sent messages on the right
                  : "bg-danger text-white align-self-start" // Received messages on the left
              }`}
            >
              {message.text}
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
            <i className="bi bi-send me-1 px-2"></i> {/* Added send icon */}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default Chat;
