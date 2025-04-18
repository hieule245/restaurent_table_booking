import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
// import $ from "jquery";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./Login.style.css";
const LoginPage = () => {
  const navigate = useNavigate();

  const handleNavigation = useCallback(
    (Role) => {
      console.log(Role);
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

  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [showPassword, setShowPassword] = useState(false); // State for showing password
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/me`, { withCredentials: true })
      .then((res) => {
        // console.log(res.data.user.Role)
        handleNavigation(res.data.user.Role);
      })
      .catch((err) => {
        console.log("login dum tui", err);
      });
  }, [handleNavigation]);

  const isValidPassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/;
    return passwordRegex.test(password);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const HandleLogin = async (e) => {
    e.preventDefault();
    let validationErrors = {};
    if (!email) {
      validationErrors.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      validationErrors.email = "Invalid email format.";
    }
    if (!password) {
      validationErrors.password = "Password is required.";
    } else if (!isValidPassword(password)) {
      validationErrors.password =
        "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&_).";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      let res = await axios.post(
        `${process.env.REACT_APP_API_URL}/login`,
        { Email: email, Password: password },
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success("Login successful!");

        axios
          .get(`${process.env.REACT_APP_API_URL}/me`, { withCredentials: true })
          .then((res) => {
            setTimeout(() => {
              const userRole = res.data.user.Role;
              console.log(userRole);
              if (userRole === "admin") {
                navigate("/admin/dashboard");
              } else if (userRole === "owner") {
                navigate("/owner");
              } else if (userRole === "staff") {
                navigate("/staff");
              } else if (userRole === "customer") {
                navigate("/");
              } else {
                navigate("/");
              }
            }, 1000);
          })
          .catch((err) => {
            console.log("login dum tui", err);
          });
      }
    } catch (error) {
      console.log(error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div>
      <ToastContainer />
      <motion.div
        className="d-flex"
        initial={{ opacity: 0, x: 100 }} // Bắt đầu từ bên phải
        animate={{ opacity: 1, x: 0 }} // Di chuyển vào giữa
        exit={{ opacity: 0, x: -100 }} // Rời khỏi sang trái
        transition={{ duration: 0.5 }}
      >
        <div className="sidenav d-flex align-items-center justify-content-center text-white text-center">
          <div className="login-main-text">
            <h1>Restaurant</h1>
            <h3>Login Page</h3>
            <p>Login or register from here to access.</p>
          </div>
        </div>
        <div className="main container d-flex align-items-center justify-content-center">
          <div className="col-md-6 col-sm-12">
            <div className="login-form">
              <form onSubmit={HandleLogin}>
                <div className="form-group my-2">
                  <label className="form-label">Email</label>{" "}
                  {/* Added Bootstrap class "form-label" */}
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <small className="text-danger">{errors.email}</small>
                  )}
                </div>
                <div className="form-group my-2">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Password"
                      style={{ borderRight: 0 }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      className="input-group-text bg-white"
                      style={{ cursor: "pointer", borderLeft: 0 }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEye : faEyeSlash}
                      />
                    </span>
                  </div>
                  {errors.password && (
                    <small className="text-danger">{errors.password}</small>
                  )}
                </div>
                <div className="form-group my-2">
                  <a href="/forgot-password">
                    <label>Forgot Password?</label>
                  </a>
                </div>
                <div className="mt-4">
                  <button type="submit" className="btn btn-dark w-100 mb-2">
                    Login
                  </button>
                  <div className="d-flex align-items-center my-2">
                    <hr className="flex-grow-1" />
                    <span className="mx-2">or</span>
                    <hr className="flex-grow-1" />
                  </div>{" "}
                  {/* Added line dividers */}
                  <button
                    type="submit"
                    className="btn btn-light w-100"
                    onClick={() => navigate("/register")}
                  >
                    Register
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
