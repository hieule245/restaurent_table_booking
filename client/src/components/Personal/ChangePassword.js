import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Kiểm tra mật khẩu có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
  const isValidPassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    let validationErrors = {};

    if (!oldPassword) {
      validationErrors.oldPassword = "Old password is required.";
    }
    if (!newPassword) {
      validationErrors.newPassword = "New password is required.";
    } else if (!isValidPassword(newPassword)) {
      validationErrors.newPassword =
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character (@$!%*?&_).";
    }
    if (!confirmPassword) {
      validationErrors.confirmPassword = "Confirm password is required.";
    } else if (newPassword !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/change-password`,
        {
          OldPassword: oldPassword,
          NewPassword: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (res.status === 200 || res.status === 201) {
        toast.success("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
      } else {
        toast.error(`Unexpected response: ${res.status}`);
      }
    } catch (error) {
      // Nếu backend trả về lỗi, hiển thị thông báo từ backend lên giao diện
      if (error.response && error.response.data.error) {
        toast.error(error.response.data.error);
      } else if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to change password.");
      }
    }
  };

  return (
    <div className="container mt-4 text-center">
      <ToastContainer />
      <h3>
        <strong>Change Password</strong>
      </h3>
      <div className="container px-5 my-4">
        <form onSubmit={handleChangePassword}>
          <div className="mb-3 input-group">
            <input
              type={showOldPassword ? "text" : "password"}
              className="form-control"
              placeholder="Old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <span
              className="input-group-text bg-white"
              onClick={() => setShowOldPassword(!showOldPassword)}
            >
              <FontAwesomeIcon icon={showOldPassword ? faEye : faEyeSlash} />
            </span>
          </div>
          {errors.oldPassword && (
            <small className="text-danger">{errors.oldPassword}</small>
          )}

          <div className="mb-3 input-group">
            <input
              type={showNewPassword ? "text" : "password"}
              className="form-control"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span
              className="input-group-text bg-white"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              <FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} />
            </span>
          </div>
          {errors.newPassword && (
            <small className="text-danger">{errors.newPassword}</small>
          )}

          <div className="mb-3 input-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-control"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="input-group-text bg-white"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEye : faEyeSlash}
              />
            </span>
          </div>
          {errors.confirmPassword && (
            <small className="text-danger">{errors.confirmPassword}</small>
          )}

          <div className="d-flex justify-content-center gap-3 mt-3">
            <button
              type="submit"
              className="btn btn-danger rounded-pill px-4 py-3"
            >
              <h5 className="mb-0">
                <strong>Save</strong>
              </h5>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
