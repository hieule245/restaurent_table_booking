import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import { resetPasswordSchema } from "../../../validations/AccountSchema";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({});
  const navigate = useNavigate();

  let [showPassword, setShowPassword] = useState(false); // State for showing password
  let [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for showing password

  useEffect(() => {
    const canResetPassword = Cookies.get("canResetPassword");
    console.log("canVerifyPin", canResetPassword)
    if (canResetPassword === "false" || canResetPassword === undefined) {
      navigate("/forgot-password"); // Nếu không có cookie, chuyển hướng về trang forgot-password
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = Cookies.get("resetEmail"); // Lấy email đã lưu
    console.log("email", email)

    try {
      await resetPasswordSchema.validate({ password, confirmPassword }, { abortEarly: false });
      const response = await axios.post("http://localhost:8080/reset-password", {
        email: email, // Gửi email kèm theo
        password: password // Gửi mật khẩu mới
      });
      if (response.status === 200) {
        toast.success("Password reset successfully");
        Cookies.remove("resetEmail");
        Cookies.remove("canResetPassword");
        setTimeout(() => {
          navigate("/login");
        }, 1000); // chờ 2 giây rồi mới chuyển trang
      }
    } catch (error) {
      toast.error("Mật khẩu không hợp lệ:", error.response.data.message || error.response.data.error);
    }
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem("resetEmail"); // Xóa email khi rời trang
    };
  }, []);

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <ToastContainer />
      <div className="card shadow p-4 w-50">
        <div className="card-body">
          <h3 className="text-center mb-4">Reset your password</h3>
          <form onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <label htmlFor="password" className="form-label">
                New password
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="form-control"
                  placeholder="Input new password"
                  style={{ borderRight: 0 }}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError((prev) => ({ ...prev, password: "" }));
                  }}
                />
                <span
                  className="input-group-text bg-white"
                  style={{ cursor: "pointer", borderLeft: 0 }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                </span>
              </div>
              {error.password && (
                <small className="text-danger">{error.password}</small>
              )}
            </div>
            <div className="input-group mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confim new password
              </label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  className="form-control"
                  placeholder="Input confirm new password"
                  style={{ borderRight: 0 }}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                />
                <span
                  className="input-group-text bg-white"
                  style={{ cursor: "pointer", borderLeft: 0 }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEye : faEyeSlash}
                  />
                </span>
              </div>
              {error.confirmpassword && (
                <small className="text-danger">{error.confirmpassword}</small>
              )}
            </div>
            <button type="submit" className="btn btn-success w-100">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
