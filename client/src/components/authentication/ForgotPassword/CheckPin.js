import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { REST_API_URL } from "../../../data";
const EnterPin = () => {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error] = useState("");
  const [timer, setTimer] = useState(120); // 2 phút
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

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
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/verify-pin`,
        {
          email: email, // Gửi email kèm theo
          pin: parseInt(enteredPin), // Chuyển pin từ string sang int
        }
      );

      if (response.status === 200) {
        navigate("/reset-password");
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error.response.data.message);
      if (error.response.status === 403) {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    }
  };

  const handleResendPin = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/resend-pin`, {
        email,
      });
      toast.success("Mã PIN mới đã được gửi!");
      setTimer(120); // Đặt lại bộ đếm 2 phút
      setCanResend(false);
    } catch (error) {
      toast.error("Lỗi khi gửi lại mã PIN!");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center  vh-100">
      <ToastContainer />
      <div className="card shadow p-4 w-50">
        <div className="card-body">
          <h3 className="text-center mb-4">Input PIN</h3>
          <p className="text-center text-muted">
            Input PIN which was sent to your email: <strong>{email}</strong>
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
            <button type="submit" className="btn btn-primary w-50">
              Confirm
            </button>
          </form>
          <div className="text-center mt-3">
            <button
              className="btn btn-link"
              onClick={handleResendPin}
              disabled={!canResend}
            >
              {canResend ? "Gửi lại mã PIN" : `Chờ ${timer}s để gửi lại`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterPin;
