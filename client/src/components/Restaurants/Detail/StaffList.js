import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaLock, FaUnlock, FaPhone, FaEnvelope, FaEye, FaEyeSlash, FaSearch, FaSortAmountDown, FaSortAlphaDown, FaSortAlphaUp, FaSortNumericDown, FaSortNumericUp } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";
import './StaffList.style.css'
import axios from "axios";


export default function StaffList({ ownerId, restaurant_id }) {
    const [staff, setStaff] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
    const [errors, setErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    console.log(restaurant_id)
    useEffect(() => {
        if (!restaurant_id) return;

        axios.get(`http://localhost:8080/owners/${ownerId}/${restaurant_id}/staffs`, { withCredentials: true })
            .then((res) => {
                setStaff(res.data.staff || []);
            })
            .catch((err) => {
                toast.error("Error fetching staff list!");
                console.error("Error:", err);
            });
    }, [restaurant_id]);

    const handleToggleStatus = async (staffId, currentStatus) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        try {
            const res = await axios.post(
                `http://localhost:8080/owners/${ownerId}/${restaurant_id}/staffs/${staffId}`,
                { Status: currentStatus, Id: staffId },
                { withCredentials: true }
            );
            setStaff((prevStaff) =>
                prevStaff.map((s) =>
                    s.id === staffId ? { ...s, status: newStatus } : s
                )
            );
        } catch (error) {
            toast.error("Failed to update staff status!");
            console.error(error);
        }
    };



    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPassword = (password) =>
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" }); // Xóa lỗi khi người dùng nhập lại
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let validationErrors = {};

        if (!formData.name) validationErrors.name = "Name is required.";
        if (!formData.email) validationErrors.email = "Email is required.";
        else if (!isValidEmail(formData.email)) validationErrors.email = "Invalid email format.";
        if (!formData.password) validationErrors.password = "Password is required.";
        else if (!isValidPassword(formData.password))
            validationErrors.password =
                "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.";
        if (!formData.phone) validationErrors.phone = "Phone number is required.";

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        toast.success("Staff created successfully!");
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                {/* Nút thêm nhân viên */}
                <button
                    type="button"
                    className="btn btn-outline-danger fw-bold"
                    data-bs-toggle="modal"
                    data-bs-target="#myModal"
                >
                    Add Staff
                </button>

                {/* Ô tìm kiếm và nút sắp xếp tách biệt */}
                <div className="d-flex gap-3 align-items-center">
                    {/* Ô tìm kiếm */}
                    <div className="input-group">
                        <span className="input-group-text bg-white">
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Nút sắp xếp có cùng chiều cao với input */}
                    <div className="dropdown">
                        {/* Button dropdown */}
                        <button
                            type="button"
                            className="btn btn-danger fw-bolder d-flex align-items-center px-3"
                            data-bs-toggle="dropdown"
                        // Đảm bảo đồng bộ chiều cao
                        >
                            <FaSortAmountDown className="me-2" />
                            Sort
                        </button>

                        {/* Dropdown menu */}
                        <ul className="dropdown-menu shadow rounded-3">
                            <li>
                                <a className="dropdown-item d-flex align-items-center" href="#">
                                    <FaSortAlphaDown className="me-2 text-danger" />
                                    Name (A-Z)
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item d-flex align-items-center" href="#">
                                    <FaSortAlphaUp className="me-2 text-danger" />
                                    Name (Z-A)
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item d-flex align-items-center" href="#">
                                    <FaSortNumericDown className="me-2 text-danger" />
                                    Earlier Open
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item d-flex align-items-center" href="#">
                                    <FaSortNumericUp className="me-2 text-danger" />
                                    Laster Open
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>

            <div className="modal fade" id="myModal" tabIndex="-1" aria-labelledby="myModalLabel" aria-hidden="true">
                <ToastContainer />
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-4 shadow-lg border-0">
                        {/* Header */}
                        <div className="modal-header bg-dark text-white rounded-top-4">
                            <h4 className="modal-title fw-bold" id="myModalLabel">Create New Staff</h4>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        {/* Body */}
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body p-4 bg-white">
                                <div className="form-group my-3">
                                    <label className="form-label fw-bold text-dark">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control border-secondary rounded-3"
                                        placeholder="Full Name"
                                        value={staff.name}
                                        onChange={handleChange}
                                    />
                                    {errors.name && <small className="text-danger">{errors.name}</small>}
                                </div>
                                <div className="form-group my-3">
                                    <label className="form-label fw-bold text-dark">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control border-secondary rounded-3"
                                        placeholder="Email"
                                        value={staff.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <small className="text-danger">{errors.email}</small>}
                                </div>
                                <div className="form-group my-3">
                                    <label className="form-label fw-bold text-dark">Password</label>
                                    <div className="input-group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            className="form-control border-secondary rounded-3"
                                            placeholder="Enter password"
                                            value={staff.password}
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
                                <div className="form-group my-3">
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

                            {/* Footer */}
                            <div className="modal-footer bg-light rounded-bottom-4 d-flex justify-content-between">
                                <button type="button" className="btn btn-outline-dark fw-bold px-4" data-bs-dismiss="modal">
                                    Close
                                </button>
                                <button type="submit" className="btn btn-danger fw-bold px-4">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="row">
                {Array.isArray(staff) && staff.map(({ id, name, gmail, phone, status }) => (
                    <div key={id} className="col-md-3 mb-4">
                        <div className="card w-100 h-100 shadow-lg border-2 border-danger rounded-4 bg-light text-dark position-relative p-3">
                            <button
                                className={`btn btn-square position-absolute top-0 end-0 m-2 ${status === "active" ? "btn-danger" : "btn-outline-danger"
                                    }`}
                                onClick={() => handleToggleStatus(id, status)}
                            >
                                {(status === "active") ? <FaLock /> : <FaUnlock />}
                            </button>


                            <div className="text-center">
                                <img src="https://tamanh.net/wp-content/uploads/2023/03/kieu-toc-mini-man-bun.jpg" alt={name} className="rounded-circle border border-danger p-1 mb-3" width={80} height={80} />
                                <h4 className="fw-bold text-danger">{name}</h4>
                                <p className="text-dark mb-1"><FaEnvelope className="text-danger me-2" />{gmail}</p>
                                <p className="d-flex align-items-center mb-1 justify-content-center text-dark">
                                    <FaPhone className="text-danger me-2" />{phone}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}