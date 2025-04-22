import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";

import { REST_API_URL } from "../../../data";
const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({});
  let [showPassword, setShowPassword] = useState(false); // State for showing password
  let [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for showing password

  const navigate = useNavigate();

  const isValidPassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem("resetEmail"); // Lấy email đã lưu

    let validationErrors = {};
    if (!confirmPassword) {
      validationErrors.confirmpassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      validationErrors.confirmpassword =
        "Confirm password is not same at password.";
    }

    if (!password) {
      validationErrors.password = "Password is required.";
    } else if (!isValidPassword(password)) {
      validationErrors.password =
        "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&_).";
    }
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/reset-password`,
        {
          email: email, // Gửi email kèm theo
          password: password, // Gửi mật khẩu mới
        }
      );

      if (response.status === 200) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Mật khẩu không hợp lệ:", error);
    }
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem("resetEmail"); // Xóa email khi rời trang
    };
  }, []);

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
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
                  placeholder="Nhập mật khẩu mới"
                  style={{ borderRight: 0 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
                  placeholder="Nhập lại mật khẩu"
                  style={{ borderRight: 0 }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
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
