import React, { useState, useRef } from "react";
import { FaPlusCircle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import avatar from "../../assets/image/avatar.png";
import axios from "axios";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { profileSchema } from "../../validations/AccountSchema";

const Information = () => {
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({
    Id: "",
    Name: "",
    Email: "",
    Phone: "",
    Role: "",
    Status: "",
    Orther_id: 0,
    ImageFile: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (isEditing) {
      try {
        setIsLoading(true);
        await profileSchema.validate(
          { Name: user.Name, Phone: user.Phone },
          { abortEarly: false }
        );

        let imageUrl = user.ImageFile;

        // Nếu người dùng có chọn ảnh mới
        if (selectedImage) {
          const formData = new FormData();
          formData.append("file", selectedImage);

          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/me/image-upload`,
            formData,
            {
              withCredentials: true,
            }
          );
          imageUrl = response.data.imageUrl;
        }

        // Gửi dữ liệu cập nhật user (gồm cả URL ảnh mới nếu có)
        const updatedUser = { ...user, ImageFile: imageUrl };

        axios
          .post(`${process.env.REACT_APP_API_URL}/me`, user, {
            withCredentials: true,
          })
          .then((res) => {
            toast.success("Profile updated successfully:", res.data);
            setIsEditing(false); // Tắt chế độ chỉnh sửa
            setErrors({});
            setOriginalUser(updatedUser);
            setSelectedImage(null);
          })
          .catch((err) =>
            toast.error(
              "Error updating profile:",
              err.response?.data || err.message
            )
          );
      } catch (err) {
        if (err.name === "ValidationError") {
          const validationErrors = {};
          err.inner.forEach((error) => {
            validationErrors[error.path] = error.message;
          });
          setErrors(validationErrors);
        } else {
          toast.error("Error updating profile: " + (err.response?.data || err.message));
        }
      } finally {
        setIsLoading(false);  // Tắt loading sau khi hoàn thành
      }
    } else {
      setIsEditing(true);
    }
  };

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/me`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
        setOriginalUser(res.data.user); // Lưu lại dữ liệu gốc để khôi phục nếu hủy
      })
      .catch((err) => {
        toast.error(
          "Error fetching user data:",
          err.response?.data || err.message
        );
      });
  }, []);

  const imageUrl = user.ImageFile ? user.ImageFile : avatar;

  const handleCancel = () => {
    setUser(originalUser);
    setIsEditing(false);
    setErrors({});
    setSelectedImage(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setSelectedImage(selectedFile);
      // Hiển thị ảnh ngay cho người dùng xem trước (không upload ngay)
      const tempUrl = URL.createObjectURL(selectedFile);
      setUser(prev => ({ ...prev, ImageFile: tempUrl }));
    }
  };

  return (
    <div className="container mt-4 text-center">
      <ToastContainer />
      <h3>
        <strong>Profile</strong>
      </h3>
      <div className="d-flex justify-content-center mt-4">
        {user && user.Role === "admin" ? <></> :
          <div className="position-relative d-inline-block">
            <img src={imageUrl} alt="User Avatar" className="rounded-circle" style={{ width: "200px", height: "200px", objectFit: "cover" }} />
            <FaPlusCircle
              className={`position-absolute bottom-0 end-0 text-dark bg-light rounded-circle ${!isEditing ? 'd-none' : ''}`}
              onClick={handleButtonClick}
              style={{ fontSize: "24px", cursor: "pointer" }}
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>}
      </div>
      <div className="container px-5 my-4">
        <form>
          <div className="mb-3">
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="Full Name"
              name="Name"
              value={user.Name}
              disabled={!isEditing}
              onChange={handleChange}
            />
            {errors.Name && (
              <small className="text-danger">{errors.Name}</small>
            )}
          </div>
          <div className="mb-3">
            <input
              type="email"
              className="form-control rounded-pill"
              placeholder="Email address"
              name="Email"
              value={user.Email}
              disabled
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="Contact number"
              name="Phone"
              value={user.Phone}
              disabled={!isEditing}
              onChange={handleChange}
            />
            {errors.Phone && (
              <small className="text-danger">{errors.Phone}</small>
            )}
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="Role"
              name="Role"
              value={user.Role}
              readOnly
              disabled
            />
          </div>
        </form>
        <div className="d-flex justify-content-center gap-3 mt-3">
          {isEditing ? (
            isLoading ? (
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <>
                <button className="btn btn-danger rounded-pill px-4 py-3" onClick={handleUpdate}>
                  <h5 className="mb-0"><strong>Save</strong></h5>
                </button>
                <button className="btn btn-secondary rounded-pill px-4 py-3" onClick={handleCancel}>
                  <h5 className="mb-0"><strong>Cancel</strong></h5>
                </button>
              </>
            )
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
