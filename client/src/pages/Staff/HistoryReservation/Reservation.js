import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faClock,
  faChair,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reservationsPerPage = 12;
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Tính toán chỉ số trang hiện tại
  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentRes = reservations.slice(
    indexOfFirstReservation,
    indexOfLastReservation
  );

  // Hàm phân trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const [finish, setFinish] = useState({
    Id: 0,
    Price: 1,
  });

  useEffect(() => {
    fetch();
  }, []);

  const fetch = () => {
    try {
      axios
        .get(
          `${process.env.REACT_APP_API_URL}/staff/:restaurant_id/reservation`,
          { withCredentials: true }
        )
        .then((res) => {
          if (res.data && Array.isArray(res.data.reservation)) {
            setReservations(res.data.reservation);
            console.log(res.data.reservation)
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
      .post(
        `${process.env.REACT_APP_API_URL}/staff/:restaurant_id/reservation/finish_booking`,
        finish,
        { withCredentials: true }
      )
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

    setSelectedReservation(reservation);
  };

  const handleConfirm = async (id) => {
    console.log("res", selectedReservation)
    if (!selectedReservation) return;

    const data = {
      Id: selectedReservation.Id,
      RoleBook: selectedReservation.RoleBook,
      RestaurantName: selectedReservation.RestaurantName,
    };
    console.log(data.CustomerRole)
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/staff/reservations/${id}/confirm_booking`,
        data,
        { withCredentials: true }
      );
      toast.success("Confirmed successfully");
      fetch(); // reload danh sách
    } catch (err) {
      toast.error("Failed to confirm");
    }
  };

  const handleCancel = async (id) => {
    console.log("res", selectedReservation)
    if (!selectedReservation) return;

    const data = {
      Id: selectedReservation.Id,
      RoleBook: selectedReservation.RoleBook,
      RestaurantName: selectedReservation.RestaurantName,
    };
    console.log(data.CustomerRole)
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/staff/reservations/${id}/cancel_booking`,
        data,
        { withCredentials: true }
      );
      toast.success("Cancelled successfully");
      fetch(); // reload danh sách
    } catch (err) {
      toast.error("Failed to confirm");
    }
  };

  return (
    <div className="mt-5">
      <div className="container mt-5">
        <ToastContainer />
        <h2 className="text-center mb-2 mt-5" style={{ color: "#dc3545" }}>
          Reservation List
        </h2>
        <div style={{ minHeight: "76vh" }}>
          <table className="table table-striped border">
            <thead className="bg-danger text-white">
              <tr className="text-center">
                <th>
                  <FontAwesomeIcon icon={faUser} /> Guest
                </th>
                <th>
                  <FontAwesomeIcon icon={faCalendarAlt} /> Date
                </th>
                <th>
                  <FontAwesomeIcon icon={faClock} /> Booking Time
                </th>
                <th>
                  <FontAwesomeIcon icon={faClock} /> Actual Time
                </th>
                <th>
                  <FontAwesomeIcon icon={faChair} /> Table Name
                </th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Usage End</th>
              </tr>
            </thead>
            <tbody>
              {currentRes.map((res, index) => (
                <tr key={index} className="text-center">
                  <td>{res.UserBook}</td>
                  <td>{new Date(res.BookingDate).toLocaleDateString()}</td>
                  <td>{res.BookingTime}</td>
                  <td>{res.ActualTime}</td>
                  <td>{res.TableName}</td>
                  <td className="text-danger font-weight-bold">
                    {res.Price} VND
                  </td>
                  <td
                    className={
                      res.Status === 0
                        ? "text-danger"
                        : res.Status === 1
                          ? "text-secondary"
                          : res.Status === 2
                            ? "text-body"
                            : res.Status === 3
                              ? "text-primary"
                              : res.Status === 4
                                ? "text-success"
                                : ""
                    }
                  >
                    {res.Status === 0
                      ? "Cancelled"
                      : res.Status === 1
                        ? "Pending"
                        : res.Status === 2
                          ? "Confirm"
                          : res.Status === 3
                            ? "Occupied"
                            : res.Status === 4
                              ? "Done"
                              : "Undefined"}
                  </td>
                  <td>
                    <button
                      type="button"
                      data-bs-toggle="modal"
                      data-bs-target={res.Status === 4 ? "#myUpdateModal" : res.Status === 0 ? "" : res.Status === 1 ? "#actionModal" : "#myCompleteModal"}
                      onClick={() => handleOpen(res)}
                      className={
                        res.Status === 4
                          ? "btn btn-outline-danger"
                          : res.Status === 3
                            ? "btn btn-danger"
                            : res.Status === 1
                              ? "btn btn-primary"
                              : res.Status === 0
                                ? "btn btn-outline-secondary disabled"
                                : "btn btn success disabled"
                      }
                    >
                      {res.Status === 4 ? "Edit" : res.Status === 3 ? "Finish?" : res.Status === 1 ? "Confirm?" : res.Status === 0 ? "Cancelled" : "Waitting"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {reservations.length > reservationsPerPage && (
          <div className="pagination-container m-0">
            <button
              className="btn btn-outline-dark me-2"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo;
            </button>
            {[
              ...Array(
                Math.ceil(reservations.length / reservationsPerPage)
              ).keys(),
            ].map((number) => (
              <button
                key={number + 1}
                className={`btn ${currentPage === number + 1 ? "btn-dark" : "btn-outline-dark"
                  } mx-1`}
                onClick={() => paginate(number + 1)}
              >
                {number + 1}
              </button>
            ))}
            <button
              className="btn btn-outline-dark ms-2"
              onClick={() => paginate(currentPage + 1)}
              disabled={
                currentPage ===
                Math.ceil(reservations.length / reservationsPerPage)
              }
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
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold text-dark">
                      Price of reservation
                    </label>
                    <input
                      placeholder="Input price"
                      value={finish.Price}
                      onChange={(e) =>
                        setFinish({ ...finish, Price: Number(e.target.value) })
                      }
                      type="number"
                      min={0}
                      name="price"
                      className="form-control border-secondary rounded-3"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger"
                    data-bs-dismiss="modal"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Modal confirm*/}
        <div className="modal fade" id="actionModal" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Update Reservation Status</h4>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <p>Do you want to <strong>Confirm</strong> or <strong>Cancel</strong> this reservation?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  data-bs-dismiss="modal"
                  onClick={() => handleCancel(selectedReservation?.id)}
                >
                  Cancel Booking
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  data-bs-dismiss="modal"
                  onClick={() => handleConfirm(selectedReservation?.id)}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal fade" id="myUpdateModal">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Update Reservation</h4>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold text-dark">
                      Price of reservation
                    </label>
                    <input
                      placeholder="Input price"
                      value={finish.Price}
                      onChange={(e) =>
                        setFinish({ ...finish, Price: Number(e.target.value) })
                      }
                      type="number"
                      min={0}
                      name="price"
                      className="form-control border-secondary rounded-3"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger"
                    data-bs-dismiss="modal"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationList;
