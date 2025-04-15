import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

export default function AddStaffForm({ restaurant_id, onStaffAdded }) {

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", gmail: "", password: "", phone: "", restaurant_id: 0 });
  const [errors, setErrors] = useState({});

  const isValidGmail = (gmail) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gmail);
  const isValidPassword = (password) =>
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/.test(password);
  const isValidPhone = (phone) =>
    /^(0[1-9][0-9]{8})$/.test(phone);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validationErrors = {};

    if (!formData.name) validationErrors.name = "Name is required.";
    if (!formData.gmail) validationErrors.gmail = "Gmail is required.";
    else if (!isValidGmail(formData.gmail)) validationErrors.gmail = "Invalid gmail format.";
    if (!formData.password) validationErrors.password = "Password is required.";
    else if (!isValidPassword(formData.password))
      validationErrors.password =
        "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.";
    if (!formData.phone) validationErrors.phone = "Phone number is required.";
    else if (!isValidPhone(formData.phone))
      validationErrors.phone = "Phone number must be exactly 10 digits.(e.g. 093*******)";
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080/owners/:owner_id/${restaurant_id}/staffs`,
        { ...formData, restaurant_id: restaurant_id},
        { withCredentials: true }
      );

      toast.success("Staff created successfully!");

      onStaffAdded(formData);

      // Reset form
      setFormData({ name: "", gmail: "", password: "", phone: "", restaurant_id: 0 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create staff.");
    }
  };

 
  return (
    <div className="modal fade" id="myModal" tabIndex="-1" aria-labelledby="myModalLabel" aria-hidden="true">
      <ToastContainer />
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow-lg border-0">
          <div className="modal-header bg-dark text-white rounded-top-4">
            <h4 className="modal-title fw-bold" id="myModalLabel">Create New Staff</h4>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 bg-white">
              <div className="form-group mb-3">
                <label className="form-label fw-bold text-dark">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control border-secondary rounded-3"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <small className="text-danger">{errors.name}</small>}
              </div>
              <div className="form-group mb-3">
                <label className="form-label fw-bold text-dark">Gmail</label>
                <input
                  type="email"
                  name="gmail"
                  className="form-control border-secondary rounded-3"
                  placeholder="Gmail"
                  value={formData.gmail}
                  onChange={handleChange}
                />
                {errors.gmail && <small className="text-danger">{errors.gmail}</small>}
              </div>
              <div className="form-group mb-3">
                <label className="form-label fw-bold text-dark">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control border-secondary rounded-3"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <span
                    className="input-group-text bg-white"
                    style={{ cursor: "pointer", borderLeft: 0 }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? FaEye : FaEyeSlash} />
                  </span>
                </div>
                {errors.password && <small className="text-danger">{errors.password}</small>}
              </div>
              <div className="form-group mb-3">
                <label className="form-label fw-bold text-dark">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control border-secondary rounded-3"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <small className="text-danger">{errors.phone}</small>}
              </div>
            </div>
            <div className="modal-footer bg-light rounded-bottom-4 d-flex justify-content-between">
              <button type="button" className="btn btn-outline-dark fw-bold px-4" data-bs-dismiss="modal">
                Close
              </button>
              <button type="submit" className="btn btn-danger fw-bold px-4" {...(Object.keys(errors).length === 0 ? { "data-bs-dismiss": "modal" } : "")}>
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

