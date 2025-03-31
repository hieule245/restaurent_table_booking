import React, { useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import avatar from '../../assets/image/avatar.jpeg'
import axios from "axios";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

const Information = () => {
  const [originalUser, setOriginalUser] = useState(null);
  
  const [user, setUser] = useState({
    Id: "",
    Name: "",
    Email: "",
    Phone: "",
    Role: "",
    Status: "",
    Orther_id: 0
  });
  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    if (isEditing) {
      let validationErrors = {};
      if (!user.Name) {
        validationErrors.Name = "Name is required.";
      } else if (!isValidName(user.Name)) {
        validationErrors.Name = "Full name only contain letters and space"
      }
      if (!user.Phone) {
        validationErrors.Phone = "Phone number is required.";
      } else if (!isValidPhone(user.Phone)) {
        validationErrors.Phone = "Phone number must be exactly 10 digits.";
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      axios.post("http://localhost:8080/me", user, { withCredentials: true })
        .then((res) => {
          toast.success("Profile updated successfully:", res.data);
          setIsEditing(false); // Tắt chế độ chỉnh sửa
          setErrors({});
          setOriginalUser(user);
        })
        .catch((err) => toast.error("Error updating profile:", err.response?.data || err.message));
    } else {
      setIsEditing(true); // Bật chế độ chỉnh sửa
    }
  }

  useEffect(() => {
    axios.get("http://localhost:8080/me", { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
        setOriginalUser(res.data.user); // Lưu lại dữ liệu gốc để khôi phục nếu hủy
      })
      .catch((err) => {
        toast.error("Error fetching user data:", err.response?.data || err.message);
      });
  }, []);

  // Kiểm tra định dạng họ tên (chỉ chứa chữ và khoảng trắng)
  const isValidName = (name) => /^[A-Za-zÀ-ỹ\s]+$/.test(name);

  //  Kiểm tra định dạng số điện thoại (10 chữ số)
  const isValidPhone = (phone) => /^\d{10}$/.test(phone);

  const handleCancel = () => {
    setUser(originalUser); // Khôi phục dữ liệu ban đầu
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="container mt-4 text-center">
      <ToastContainer />
      <h3><strong>Profile</strong></h3>
      <div className="d-flex justify-content-center mt-4">
        <div className="position-relative d-inline-block">
          <img
            src={avatar}
            alt="Avatar"
            className="rounded-circle border border-3 border-white"
            style={{ width: "200px", height: "200px", objectFit: "cover" }}
          />
          <FaPlusCircle
            className="position-absolute bottom-0 end-0 text-dark bg-light rounded-circle"
            style={{ fontSize: "24px", cursor: "pointer" }}
          />
        </div>
      </div>
      <div className="container px-5 my-4">
        <form>
          <div className="mb-3">
            <input type="text" className="form-control rounded-pill" placeholder="Full Name" name="Name" value={user.Name} disabled={!isEditing} onChange={handleChange} />
            {errors.Name && <small className="text-danger">{errors.Name}</small>}
          </div>
          <div className="mb-3">
            <input type="email" className="form-control rounded-pill" placeholder="Email address" name="Email" value={user.Email} disabled />
          </div>
          <div className="mb-3">
            <input type="text" className="form-control rounded-pill" placeholder="Contact number" name="Phone" value={user.Phone} disabled={!isEditing} onChange={handleChange} />
            {errors.Phone && <small className="text-danger">{errors.Phone}</small>}
          </div>
          <div className="mb-3">
            <input type="text" className="form-control rounded-pill" placeholder="Role" name="Role" value={user.Role} readOnly disabled />
          </div>
        </form>
        <div className="d-flex justify-content-center gap-3 mt-3">
          {isEditing ? (
            <>
              <button className="btn btn-danger rounded-pill px-4 py-3" onClick={handleUpdate}>
                <h5 className="mb-0"><strong>Save</strong></h5>
              </button>
              <button className="btn btn-secondary rounded-pill px-4 py-3" onClick={handleCancel}>
                <h5 className="mb-0"><strong>Cancel</strong></h5>
              </button>
            </>
          ) : (
            <button className="btn btn-danger rounded-pill px-4 py-3" onClick={() => setIsEditing(true)}>
              <h5 className="mb-0"><strong>Update Profile</strong></h5>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Information;