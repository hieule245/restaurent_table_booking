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

  const isValidPhone = (phone) => {
    const phoneRegex = /^(0[1-9][0-9]{8})$/;
    return phoneRegex.test(phone);
  };

  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    let validationErrors = {};

    // Validation checks
    if (!name) {
      validationErrors.name = "Name is required.";
    } else if (name.length > 50) {
      validationErrors.name = "Name must not exceed 50 characters.";
    }
    if (!email) {
      validationErrors.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      validationErrors.email = "Invalid email format.";
    }
    if (!phone) {
      validationErrors.phone = "Phone number is required.";
    } else if (!isValidPhone(phone)) {
      validationErrors.phone = "Phone number must be exactly 10 digits.(e.g. 093*******)";
    }
    if (!password) {
      validationErrors.password = "Password is required.";
    } else if (!isValidPassword(password)) {
      validationErrors.password = "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&).";
    }
    if (!confirmPassword) {
      validationErrors.confirmpassword = "Confirm password is required.";
    }
    if (password !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    console.log(role);
    try {
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
    } catch (error) {
      console.log(error);
      toast.error("Registration failed. Please try again.");
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
                    required
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
