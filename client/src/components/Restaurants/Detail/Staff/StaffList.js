import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaLock, FaUnlock, FaPhone, FaEnvelope, FaEye, FaEyeSlash, FaSearch, FaSortAmountDown, FaSortAlphaDown, FaSortAlphaUp, FaSortNumericDown, FaSortNumericUp } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";
import './StaffList.style.css'
import axios from "axios";
import { Modal } from "bootstrap/dist/js/bootstrap.bundle.min";
import AddStaff from "./AddStaff"
import { useNavigate } from "react-router-dom";

export default function StaffList({ owner_id, restaurant_id }) {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [modalInstance, setModalInstance] = useState(null);
    console.log(restaurant_id)
    useEffect(() => {
        if (!restaurant_id) return;

        axios.get(`http://localhost:8080/owners/${ownerId}/${restaurant_id}/staffs`, { withCredentials: true })
            .then((res) => {
                setStaff(res.data.staff || []);
            })
            .catch((err) => {
                if (err.response?.status === 401) {
                    toast.error("Bạn phải đăng nhập trước!");
                    navigate("/login"); // Chuyển hướng về trang login
                } else {
                    toast.error("Error fetching staff list!");
                    console.error("Error:", err);
                }
            });

        // Khởi tạo modal Bootstrap
        const modalElement = document.getElementById("confirmModal");
        if (modalElement) {
            setModalInstance(new Modal(modalElement));
        }
    }, [restaurant_id, navigate]); // Thêm navigate vào dependency để tránh cảnh báo

    const handleOpenModal = (staff) => {
        setSelectedStaff(staff);
        modalInstance?.show();
    };

    const handleConfirmToggle = async () => {
        if (!selectedStaff) return;

        const { id, status } = selectedStaff;
        const newStatus = status === "active" ? "inactive" : "active";

        try {
            await axios.post(
                `http://localhost:8080/owners/${ownerId}/${restaurant_id}/staffs/${id}`,
                { Status: newStatus, Id: id },
                { withCredentials: true }
            );

            setStaff((prevStaff) =>
                prevStaff.map((s) =>
                    s.id === id ? { ...s, status: newStatus } : s
                )
            );
            toast.success(`Staff ${newStatus === "active" ? "unlocked" : "locked"} successfully!`);
        } catch (error) {
            toast.error(`Failed to update staff status! Error: ${error.message}`);
            console.error(error);
        }

        modalInstance?.hide();
    };

    return (
        <div className="container mt-4">
            <ToastContainer />
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

            <AddStaff restaurantId={restaurant_id} ownerId={ownerId} />

            <div className="row">
                {Array.isArray(staff) && staff.map(({ id, name, gmail, phone, status }) => (
                    <div key={id} className="col-md-3 mb-4">
                        <div className="card w-100 h-100 shadow-lg border-2 border-danger rounded-4 bg-light text-dark position-relative p-3">
                            <button
                                className={`btn btn-square position-absolute top-0 end-0 m-2 ${status === "active" ? "btn-danger" : "btn-outline-danger"}`}
                                onClick={() => handleOpenModal({ id, name, status })}
                            >
                                {status === "active" ? <FaLock /> : <FaUnlock />}
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
            {/* Modal xác nhận khóa/mở khóa */}
            <div className="modal fade" id="confirmModal" tabIndex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-4 shadow-lg border-0">
                        {/* Header */}
                        <div className="modal-header bg-dark text-white rounded-top-4">
                            <h4 className="modal-title fw-bold" id="confirmModalLabel">
                                {selectedStaff?.status === "active" ? "Lock Staff" : "Unlock Staff"}
                            </h4>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body p-4 bg-white">
                            <p className="text-dark">
                                Are you sure you want to <strong>{selectedStaff?.status === "active" ? "lock" : "unlock"}</strong> staff <strong className="text-danger">{selectedStaff?.name}</strong>?
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer bg-light rounded-bottom-4 d-flex justify-content-between">
                            <button type="button" className="btn btn-outline-dark fw-bold px-4" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button type="button" className="btn btn-danger fw-bold px-4" onClick={handleConfirmToggle}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}