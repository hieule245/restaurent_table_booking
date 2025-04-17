import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion"; // Import animation
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useCallback } from "react";
import { AccountSchema } from "../../../validations/AccountSchema";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("customer");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state for confirm password
  let [showPassword, setShowPassword] = useState(false); // State for showing password
  let [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for showing password
  const [errors, setErrors] = useState({});

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min");
  }, []);

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

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Validate toàn bộ form
      await AccountSchema.validate({ name, email, phone, password, confirmPassword, role }, { abortEarly: false });
      setErrors({}); // Xoá lỗi cũ

      const res = await axios.post("http://localhost:8080/register", {
        Name: name,
        Email: email,
        Password: password,
        Phone: phone,
        Role: role,
      });

      if (res.status === 201) {
        toast.success("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        const newErrors = {};
        err.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      } else {
        const errorMessage =
          err.response?.data?.message || "Registration failed. Please try again.";

        if (errorMessage.toLowerCase().includes("email")) {
          setErrors((prev) => ({ ...prev, email: errorMessage }));
        } else {
          toast.error(errorMessage);
        }
      }
    }
  };

  return (
    <div>
      <motion.div
        className="d-flex"
        initial={{ opacity: 0, x: -100 }} // Bắt đầu từ bên trái
        animate={{ opacity: 1, x: 0 }} // Di chuyển vào giữa
        exit={{ opacity: 0, x: 100 }} // Rời khỏi sang phải
        transition={{ duration: 0.5 }}
      >
        <ToastContainer />
        <div className="main container d-flex align-items-center justify-content-center">
          <div className="col-md-6 col-sm-12">
            <div className="register-form">
              <form onSubmit={handleRegister}>
                <div className="form-group my-2">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && (
                    <small className="text-danger">{errors.name}</small>
                  )}
                </div>
                <div className="form-group my-2">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
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
                      <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                    </span>
                  </div>
                  {errors.password && (
                    <small className="text-danger">{errors.password}</small>
                  )}
                </div>
                <div className="form-group my-2">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Confirm Password"
                      style={{ borderRight: 0 }}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span
                      className="input-group-text bg-white"
                      style={{ cursor: "pointer", borderLeft: 0 }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                    </span>
                  </div>
                  {errors.confirmPassword && (
                    <small className="text-danger">
                      {errors.confirmPassword}
                    </small>
                  )}
                </div>
                <div className="form-group my-2">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  {errors.phone && (
                    <small className="text-danger">{errors.phone}</small>
                  )}
                </div>
                <div className="form-group my-2">
                  <label className="form-label">Role</label>
                  <select
                    className="form-control"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="customer">Customer</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                <div className="mt-4">
                  <button type="submit" className="btn btn-dark w-100 mb-2">
                    Register
                  </button>
                  <div className="d-flex align-items-center my-2">
                    <hr className="flex-grow-1" />
                    <span className="mx-2">or</span>
                    <hr className="flex-grow-1" />
                  </div>
                  <button
                    onClick={() => navigate("/login")}
                    className="btn btn-light w-100"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="sidenav d-flex align-items-center justify-content-center text-white text-center">
          <div className="register-main-text">
            <h1>Restaurant</h1>
            <h3>Register Page</h3>
            <p>Create an account to get started.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
