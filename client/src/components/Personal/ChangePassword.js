import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { changePasswordSchema } from "../validations/AccountSchema";
import axios from "axios";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      await changePasswordSchema.validate(
        {
          oldPassword,
          newPassword,
          confirmPassword,
        },
        { abortEarly: false }
      );

      setErrors({}); // Clear all errors nếu validate thành công

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
      // Bắt lỗi từ Yup
      if (error.name === "ValidationError") {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else {
        // Các lỗi khác (API)
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to change password.";

        if (
          errorMessage.toLowerCase().includes("old password") ||
          errorMessage.toLowerCase().includes("not true")
        ) {
          setErrors((prev) => ({ ...prev, oldPassword: errorMessage }));
        } else {
          toast.error(errorMessage);
        }
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
              className={`form-control ${errors.oldPassword ? "is-invalid" : ""}`}
              placeholder="Old password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                setErrors((prev) => ({ ...prev, oldPassword: "" }));
              }}
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
              className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrors((prev) => ({ ...prev, newPassword: "" }));
              }}
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
              className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }}
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
