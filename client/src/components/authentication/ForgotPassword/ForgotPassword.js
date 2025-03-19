import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post("http://localhost:8080/forgot-password", { email });
      if (response.status === 200) {
        localStorage.setItem("resetEmail", email); // Lưu email vào localStorage
        navigate("/verify-pin"); // Chuyển hướng đến trang nhập mã PIN
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
    }
  };
  

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="card-body">
          <h3 className="text-center mb-4">
            <i className="fas fa-lock text-primary"></i> Quên Mật Khẩu?
          </h3>
          <p className="text-center text-muted">
            Nhập email của bạn.
          </p>
          {message && (
            <div className="alert alert-success" role="alert">
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="formEmail" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="formEmail"
                className="form-control"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Gửi Yêu Cầu
            </button>
          </form>
          <div className="text-center mt-3">
            <a href="/login" className="text-decoration-none">
              <i className="fas fa-arrow-left"></i> Quay lại đăng nhập
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
