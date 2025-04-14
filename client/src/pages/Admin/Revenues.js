import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarCheck } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "./SideBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faClock, faChair, faUser, faStoreAlt } from "@fortawesome/free-solid-svg-icons";
const Admin = () => {
    const [reservations, setReservations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const reservationsPerPage = 14;

    // Tính toán chỉ số trang hiện tại
    const indexOfLastReservation = currentPage * reservationsPerPage;
    const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
    const currentRes = reservations.slice(indexOfFirstReservation, indexOfLastReservation);

    // Hàm phân trang
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const [finish, setFinish] = useState({
        Id: 0,
        Price: 1
    });

    useEffect(() => {
        fetch();
    }, []);

    const fetch = () => {
        try {
            axios
                .get(`http://localhost:8080/admin/reservations`, { withCredentials: true })
                .then((res) => {
                    if (res.data && Array.isArray(res.data.booking)) {
                        setReservations(res.data.booking);
                    } else {
                        setReservations([]); // fallback an toàn
                        toast.info("No reservations found.");
                    }
                })
                .catch((err) => toast.error(err));
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        axios
            .post(`http://localhost:8080/owners/:owner_id/reservations/finish_booking`, finish, { withCredentials: true })
            .then(() => {
                toast.success("Update successfully!!");
                fetch();
            })
            .catch((err) => {
                if (err.response && err.response.data && err.response.data.message) {
                    // Nếu backend trả về lỗi chi tiết trong response
                    toast.error(`Error: ${err.response.data.message}`);
                }
            });
    };

    const handleOpen = (reservation) => {
        const currentTime = new Date().toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        setFinish({
            Id: reservation.Id,
            Price: parseFloat(reservation.Price) || 0,
            ActualEnd: currentTime
        });
    };

    return (
        <div className="bg-black">
            <ToastContainer />
            <div className="p-4 text-white row vh-100">
                <div className="col-2">
                    <Sidebar />
                </div>
                <div className="bg-dark rounded-4 shadow-lg col-10 py-4 px-5">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <h1 className="text-danger fw-bold d-flex justify-content-center gap-2"><FaCalendarCheck className="pt-2" /> Revenues</h1>
                    </div>
                    <hr className="border-secondary" />
                    <div className="bg-white rounded-4 shadow-sm p-3" style={{ minHeight: "73vh" }}>
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-danger text-white text-center">
                                <tr>
                                    <th><FontAwesomeIcon icon={faUser} /> Guest</th>
                                    <th><FontAwesomeIcon icon={faStoreAlt} /> Restaurant</th>
                                    <th><FontAwesomeIcon icon={faCalendarAlt} /> Date</th>
                                    <th><FontAwesomeIcon icon={faClock} /> Booking</th>
                                    <th><FontAwesomeIcon icon={faClock} /> Arrival</th>
                                    <th><FontAwesomeIcon icon={faChair} /> Table</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {currentRes.map((res, index) => (
                                    <tr key={index}>
                                        <td className="fw-semibold">{res.UserBook}</td>
                                        <td>{res.RestaurantName}</td>
                                        <td>{new Date(res.BookingDate).toLocaleDateString()}</td>
                                        <td>{res.BookingTime}</td>
                                        <td>{res.ActualTime || <span className="text-muted">--</span>}</td>
                                        <td>{res.TableName}</td>
                                        <td className="text-danger fw-bold">{res.Price.toLocaleString()} VND</td>
                                        <td>
                                            <span className={`badge px-3 py-2 rounded-pill
                            ${res.Status === 0 ? "bg-danger" :
                                                    res.Status === 1 ? "bg-secondary" :
                                                        res.Status === 2 ? "bg-dark" :
                                                            res.Status === 3 ? "bg-primary" :
                                                                res.Status === 4 ? "bg-success" : "bg-light text-dark"}`}>
                                                {res.Status === 0 ? "Cancelled" :
                                                    res.Status === 1 ? "Pending" :
                                                        res.Status === 2 ? "Confirmed" :
                                                            res.Status === 3 ? "Occupied" :
                                                                res.Status === 4 ? "Done" : "Unknown"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {reservations.length > reservationsPerPage && (
                        <div className="pagination-container mt-3">
                            <button
                                className="btn btn-outline-secondary me-2"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                &laquo;
                            </button>
                            {[...Array(Math.ceil(reservations.length / reservationsPerPage)).keys()].map(number => (
                                <button
                                    key={number + 1}
                                    className={`btn ${currentPage === number + 1 ? "btn-secondary" : "btn-outline-secondary"} mx-1`}
                                    onClick={() => paginate(number + 1)}
                                >
                                    {number + 1}
                                </button>
                            ))}
                            <button
                                className="btn btn-outline-secondary ms-2"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === Math.ceil(reservations.length / reservationsPerPage)}
                            >
                                &raquo;
                            </button>
                        </div>
                    )}

                    <div className="modal fade" id="myCompleteModal">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h4 className="modal-title">Reservation Completed</h4>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <form onSubmit={handleUpdate}>
                                    <div className="modal-body">
                                        <div className="form-group mb-3">
                                            <label className="form-label fw-bold text-dark">Price of reservation</label>
                                            <input
                                                placeholder="Input price"
                                                value={finish.Price}
                                                onChange={(e) => setFinish({ ...finish, Price: Number(e.target.value) })}
                                                type="number"
                                                min={0}
                                                name="price"
                                                className="form-control border-secondary rounded-3"
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-outline-danger" data-bs-dismiss="modal">Close</button>
                                        <button type="submit" className="btn btn-danger" data-bs-dismiss="modal">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal fade" id="myUpdateModal">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h4 className="modal-title">Update Reservation</h4>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <form onSubmit={handleUpdate}>
                                    <div className="modal-body">
                                        <div className="form-group mb-3">
                                            <label className="form-label fw-bold text-dark">Price of reservation</label>
                                            <input
                                                placeholder="Input price"
                                                value={finish.Price}
                                                onChange={(e) => setFinish({ ...finish, Price: Number(e.target.value) })}
                                                type="number"
                                                min={0}
                                                name="price"
                                                className="form-control border-secondary rounded-3"
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-outline-danger" data-bs-dismiss="modal">Close</button>
                                        <button type="submit" className="btn btn-danger" data-bs-dismiss="modal">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
