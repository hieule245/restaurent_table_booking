import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useEffect, useCallback } from "react";
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNavigation = useCallback(
    (Role) => {
      console.log(Role)
      if (Role === "admin") {
        navigate("/admin/dashboard");
      } else if (Role === "owner") {
        navigate("/owner");
      } else if (Role === "staff") {
        navigate("/staff");
      } else if (Role === "customer") {
        navigate("/");
      }
    },
    [navigate]
  );

  useEffect(() => {
    axios
      .get("http://localhost:8080/me", { withCredentials: true })
      .then((res) => {
        // console.log(res.data.user.Role)
        handleNavigation(res.data.user.Role);
      })
      .catch((err) => {
        console.log("login dum tui", err);
      });
  }, [handleNavigation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true)
    try {
      const response = await axios.post("http://localhost:8080/forgot-password", { email });
      if (response.status === 200) {
        localStorage.setItem("resetEmail", email); // Email
        localStorage.setItem("canVerifyPin", "true"); // Cho phép vào trang verify PIN
        navigate("/verify-pin");
      }
    } catch (error) {
      setIsSubmitting(false);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
        console.log(error.response.data.message)
      } else {
        // await toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
        console.log("Đã xảy ra lỗi. Vui lòng thử lại.")
      }
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setEmail(email);
    setIsEmailValid(validateEmail(email));
  };


  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <ToastContainer />
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="card-body">
          <h3 className="text-center mb-4">
            <i className="fas fa-lock text-primary"></i> Forgot Password?
          </h3>
          <p className="text-center text-muted">
            Input your email
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
                onChange={handleEmailChange}
                required

              />
            </div>
            <button type="submit" id="forgotpassword" className="btn btn-primary w-100" disabled={isSubmitting | !isEmailValid}>
              Send request
            </button>
          </form>
          <div className="text-center mt-3">
            <a href="/login" className="text-decoration-none">
              <i className="fas fa-arrow-left"></i> Back to Login Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
