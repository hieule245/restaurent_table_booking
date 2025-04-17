import React, { useCallback, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";

const CheckPin = () => {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error] = useState("");
  const [timer, setTimer] = useState(120); // 2 phút
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const email = Cookies.get("resetEmail");

  useEffect(() => {
    const canVerifyPin = Cookies.get("canVerifyPin");
    console.log("canVerifyPin", canVerifyPin)
    if (canVerifyPin === "false"||canVerifyPin === undefined) {
      navigate("/forgot-password"); // Nếu không có cookie, chuyển hướng về trang forgot-password
    }
  }, [navigate]);

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
      const response = await axios.post("http://localhost:8080/verify-pin", {
        email: email, // Gửi email kèm theo
        pin: parseInt(enteredPin) // Chuyển pin từ string sang int
      });

      if (response.status === 200) {
        Cookies.remove("canVerifyPin");
        Cookies.set("canResetPassword", true, { expires: (1 / 720) }); // 2 phút
        toast.success("Verify PIN successfully");
        setTimeout(() => {
          navigate("/reset-password");
        }, 1000);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error.response.data.message);
    }
  };

  const handleResendPin = async () => {
    try {
      await axios.post("http://localhost:8080/resend-pin", { email });
      toast.success("Mã PIN mới đã được gửi!");
      setTimer(120); // Đặt lại bộ đếm 2 phút
      setCanResend(false);
    } catch (error) {
      toast.error(error.response.data.message);
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
            <button type="submit" className="btn btn-primary w-50">Confirm</button>
          </form>
          <div className="text-center mt-3">
            <small>The PIN will be deleted after 2 minutes.</small>
            <br />
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

export default CheckPin;
