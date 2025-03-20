import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EnterPin = () => {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Chỉ cho phép nhập số

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus(); // Chuyển sang ô tiếp theo
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus(); // Quay lại ô trước nếu bấm xoá
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredPin = pin.join("");
  
    try {
      const response = await axios.post("http://localhost:8080/verify-pin", {
        email: email, // Gửi email kèm theo
        pin: parseInt(enteredPin) // Chuyển pin từ string sang int
      });
  
      if (response.status === 200) {
        navigate("/reset-password");
      }
    } catch (error) {
      console.error("Mã PIN không hợp lệ:", error);
    }
  };
  

  return (
    <div className="container d-flex justify-content-center align-items-center  vh-100">
      <div className="card shadow p-4 w-50">
        <div className="card-body">
          <h3 className="text-center mb-4">Nhập Mã PIN</h3>
          <p className="text-center text-muted">
            Nhập mã PIN đã gửi đến email: <strong>{email}</strong>
          </p>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit} className="text-center">
            <div className="d-flex justify-content-between mb-3 row">
              {pin.map((num, index) => (
                <div className="col-2">
                    <input
                  key={index}
                  type="text"
                  className="form-control text-center m-1 w-100"
                  style={{ fontSize: "24px" }}
                  maxLength="1"
                  value={num}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => (inputRefs.current[index] = el)}
                />
                </div>
              ))}
            </div>
            <button type="submit" className="btn btn-primary w-50">Xác Nhận</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnterPin;
