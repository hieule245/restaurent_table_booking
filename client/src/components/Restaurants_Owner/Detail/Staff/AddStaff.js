import { useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { staffValidationSchema } from "../../../../validations/AccountSchema";
import { useRef } from "react";

export default function AddStaffForm({ restaurant_id, fetchStaff }) {
  const closeBtnRef = useRef();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gmail: "",
    password: "",
    phone: "",
    restaurant_id: 0,
    status: "active",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      await staffValidationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      setIsSubmitting(true); // ✅ CHỈ SET SAU KHI VALIDATE THÀNH CÔNG

      console.log("Form submitting...");
      await axios.post(
        `${process.env.REACT_APP_API_URL}/owners/:owner_id/${restaurant_id}/staffs`,
        { ...formData, restaurant_id: restaurant_id },
        { withCredentials: true }
      );

      toast.success("Staff created successfully!");
      fetchStaff();
      setFormData({
        name: "",
        gmail: "",
        password: "",
        phone: "",
        restaurant_id: 0,
      });

      closeBtnRef.current?.click();
    } catch (err) {
      if (err.name === "ValidationError") {
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      } else {
        console.log(err.response?.data?.error);
        toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to create staff.");
      }
    } finally {
      setIsSubmitting(false); // ✅ luôn reset lại sau khi xong
    }
  };

  return (
    <div
      className="modal fade"
      id="myModal"
      tabIndex="-1"
      aria-labelledby="myModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow-lg border-0">
          <div className="modal-header bg-dark text-white rounded-top-4">
            <h4 className="modal-title fw-bold" id="myModalLabel">
              Create New Staff
            </h4>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
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
                {errors.name && (
                  <small className="text-danger">{errors.name}</small>
                )}
              </div>
              <div className="form-group mb-3">
                <label className="form-label fw-bold text-dark">Gmail</label>
                <input
                  type="text"
                  name="gmail"
                  className="form-control border-secondary rounded-3"
                  placeholder="Gmail"
                  value={formData.gmail}
                  onChange={handleChange}
                />
                {errors.gmail && (
                  <small className="text-danger">{errors.gmail}</small>
                )}
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
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </span>
                </div>
                {errors.password && (
                  <small className="text-danger">{errors.password}</small>
                )}
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
                {errors.phone && (
                  <small className="text-danger">{errors.phone}</small>
                )}
              </div>
            </div>
            <div className="modal-footer bg-light rounded-bottom-4 d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-danger fw-bold px-4"
                ref={closeBtnRef}
              >
                {isSubmitting ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
