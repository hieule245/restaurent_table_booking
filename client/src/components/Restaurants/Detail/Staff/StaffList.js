import { useEffect, useState } from "react";
import { FaLock, FaUnlock, FaPhone, FaEnvelope, FaSearch, FaSortAmountDown, FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";
import './StaffList.style.css'
import axios from "axios";
import { Modal } from "bootstrap";
import AddStaff from "./AddStaff"


export default function StaffList({ restaurant_id }) {
    const [staff, setStaff] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [modalInstance, setModalInstance] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortType, setSortType] = useState(null);
    const itemsPerPage = 12;
    useEffect(() => {
        if (!restaurant_id) return;
        fetchStaff();

        // Đợi DOM sẵn sàng trước khi khởi tạo modal
        setTimeout(() => {
            const modalElement = document.getElementById("confirmModal");
            if (modalElement) {
                setModalInstance(new Modal(modalElement));
            }
        }, 500);
    }, [restaurant_id]);

    const fetchStaff = () => {
        axios.get(`http://localhost:8080/owners/:owner_id/${restaurant_id}/staffs`, { withCredentials: true })
            .then((res) => {
                setStaff(res.data.staff || []);
            })
            .catch((err) => {
                toast.error("Error fetching staff list!");
                console.error("Error:", err);
            });
    };

    const handleSort = (type) => {
        setSortType(type);
        let sortedStaff = [...staff];
        if (type === "name-asc") {
            sortedStaff.sort((a, b) => a.name.localeCompare(b.name));
        } else if (type === "name-desc") {
            sortedStaff.sort((a, b) => b.name.localeCompare(a.name));
        }
        setStaff(sortedStaff);
    };

    // Hàm này sẽ được truyền xuống AddStaffForm
    const handleStaffAdded = (newStaff) => {
        setStaff((prevStaff) => [...prevStaff, newStaff]); // Cập nhật danh sách mà không cần load lại trang
    };

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
                `http://localhost:8080/owners/:owner_id/${restaurant_id}/staffs/${id}`,
                { Status: status, Id: id },
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

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = staff.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container mt-5">
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
                            <li><button className="dropdown-item" onClick={() => handleSort("name-asc")}><FaSortAlphaDown className="me-2 text-danger" /> Name (A-Z)</button></li>
                            <li><button className="dropdown-item" onClick={() => handleSort("name-desc")}><FaSortAlphaUp className="me-2 text-danger" /> Name (Z-A)</button></li>
                        </ul>
                    </div>

                </div>
            </div>

            {restaurant_id && <AddStaff restaurant_id={restaurant_id} onStaffAdded={handleStaffAdded} />}

            <div className="staff-container">
                <div className="row">
                    {currentItems.map(({ id, name, gmail, phone, status }) => (
                        <div key={id} className="col-md-3 mb-4">
                            <div className="card w-100 h-100 shadow-lg border-2 border-danger rounded-4 bg-light text-dark position-relative p-3">
                                <button
                                    className={`btn btn-square position-absolute top-0 end-0 m-2 
                                ${status === "ban" ? "btn-secondary" : status === "active" ? "btn-outline-danger" : "btn-danger"}`}
                                    onClick={() => status !== "ban" && handleOpenModal({ id, name, status })}
                                    disabled={status === "ban"}
                                >
                                    {status === "active" ? <FaUnlock /> : status === "inactive" ? <FaLock /> : <FaUnlock />}
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
            {/* Modal xác nhận khóa/mở khóa */}
            <div className="modal fade" id="confirmModal" tabIndex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-4 shadow-lg border-0">
                        <div className="modal-header bg-dark text-white rounded-top-4">
                            <h4 className="modal-title fw-bold" id="confirmModalLabel">
                                {selectedStaff?.status === "active" ? "Lock Staff" : "Unlock Staff"}
                            </h4>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>

                        <div className="modal-body p-4 bg-white">
                            <p className="text-dark">
                                Are you sure you want to <strong>{selectedStaff?.status === "active" ? "lock" : "unlock"} </strong>
                                staff <strong className="text-danger">{selectedStaff?.name}</strong>?
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

            {staff.length > itemsPerPage && (
                <div className="pagination-container">
                    <button className="btn btn-outline-dark me-2" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                        &laquo;
                    </button>
                    {[...Array(Math.ceil(staff.length / itemsPerPage)).keys()].map(number => (
                        <button
                            key={number + 1}
                            className={`btn ${currentPage === number + 1 ? "btn-dark" : "btn-outline-dark"} mx-1`}
                            onClick={() => paginate(number + 1)}
                        >
                            {number + 1}
                        </button>
                    ))}
                    <button className="btn btn-outline-dark ms-2" onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(staff.length / itemsPerPage)}>
                        &raquo;
                    </button>
                </div>
            )}
        </div>
    );
}