import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import BookingRow from "../BookingRow/BookingRow";
import "react-toastify/dist/ReactToastify.css";
import "./BookingHistory.css";
import RestaurantLayout from "../../pages/Restaurant/restaurantLayout";
import { REST_API_URL } from "../../data";
const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();

  // Fetch user info
  const [user, setUser] = useState({});
  useEffect(() => {
    axios
      .get(`${REST_API_URL}/me`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => navigate("/login"));
  }, [navigate]);

  // Fetch booking history
  useEffect(() => {
    if (!user?.Id) return;
    axios
      .get(`${REST_API_URL}/booking-history?user_id=${user.Id}`, {
        withCredentials: true,
      })
      .then((res) => setBookings(res.data.bookings))
      .catch((err) => {
        console.error(err);
        toast.error("Error fetching booking history");
      });
  }, [user]);

  // Mở modal chỉnh sửa
  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    const modalElement = document.getElementById("editBookingModal");
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  };

  const handleSaveChanges = () => {
    if (!selectedBooking) return;
    const updatedBooking = {
      numberOfCustomer: selectedBooking.numberOfCustomer,
      book_date: selectedBooking.book_date,
      time_start: selectedBooking.time_start,
      time_end: selectedBooking.time_end,
      status: selectedBooking.status,
    };

    axios
      .put(
        `${REST_API_URL}/reservation/${selectedBooking.id}`,
        updatedBooking,
        { withCredentials: true }
      )
      .then(() => {
        setBookings((prev) =>
          prev.map((b) => (b.id === selectedBooking.id ? selectedBooking : b))
        );
        Swal.fire("Success", "Booking updated successfully!", "success");
      })
      .catch((err) =>
        Swal.fire(
          "Error",
          err.response?.data?.error || "Update failed",
          "error"
        )
      );
  };

  const handleCancel = (booking) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to cancel this booking?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${REST_API_URL}/reservation/${booking.id}`, {
            withCredentials: true,
          })
          .then(() => {
            setBookings((prev) => prev.filter((b) => b.id !== booking.id));
            Swal.fire(
              "Cancelled!",
              "Your booking has been cancelled.",
              "success"
            );
          })
          .catch((err) =>
            Swal.fire(
              "Error",
              err.response?.data?.error || "Cancellation failed",
              "error"
            )
          );
      }
    });
  };

  const [selectedMonth, setSelectedMonth] = useState("All");
  const filteredBookings =
    selectedMonth === "All"
      ? bookings
      : bookings.filter((booking) => {
          const month = new Date(booking.book_date).getMonth() + 1;
          return String(month).padStart(2, "0") === selectedMonth;
        });
  return (
    <RestaurantLayout>
      <div className="booking-history-container">
        <ToastContainer position="top-right" autoClose={3000} />
        <h2 className="booking-history-title text-danger fs-1">
          Booking History
        </h2>
        <div className="d-flex align-items-center mb-3 gap-2">
          <label className="fw-bold">Filter theo tháng:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-select w-auto"
          >
            <option value="All">Tất cả</option>
            {[...Array(12)].map((_, i) => (
              <option key={i} value={String(i + 1).padStart(2, "0")}>
                Tháng {i + 1}
              </option>
            ))}
          </select>
        </div>

        {user ? (
          <p className="booking-history-welcome">
            Welcome, {user.Name}! Here is your booking history:
            <hr />
          </p>
        ) : (
          <p className="booking-history-loading">Loading user info...</p>
        )}
        {bookings.length === 0 ? (
          <p className="booking-history-no">No bookings found.</p>
        ) : (
          <motion.div
            className="table-responsive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <table className="booking-history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Day</th>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Time Start</th>
                  <th>Time End</th>
                  <th style={{ width: "10%" }}>Number of customer</th>
                  <th>Table ID</th>
                  <th>Price ($)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, index) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    index={index}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                  />
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
        {/* Modal chỉnh sửa booking */}
        <div
          className="modal fade"
          id="editBookingModal"
          tabIndex="-1"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content booking-modal-content">
              <div className="modal-header booking-modal-header">
                <h5 className="modal-title">Edit Booking</h5>
                <button
                  type="button"
                  className="btn-close booking-modal-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body booking-modal-body">
                {selectedBooking && (
                  <>
                    <label>Book Date:</label>
                    <input
                      type="date"
                      className="form-control"
                      value={selectedBooking.book_date}
                      onChange={(e) =>
                        setSelectedBooking({
                          ...selectedBooking,
                          book_date: e.target.value,
                        })
                      }
                    />

                    <label>Time Start:</label>
                    <input
                      type="time"
                      className="form-control"
                      value={selectedBooking.time_start}
                      onChange={(e) =>
                        setSelectedBooking({
                          ...selectedBooking,
                          time_start: e.target.value,
                        })
                      }
                    />

                    <label>Time End:</label>
                    <input
                      type="time"
                      className="form-control"
                      value={selectedBooking.time_end}
                      onChange={(e) =>
                        setSelectedBooking({
                          ...selectedBooking,
                          time_end: e.target.value,
                        })
                      }
                    />

                    <label>Seats:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedBooking.numberOfCustomer}
                      onChange={(e) =>
                        setSelectedBooking({
                          ...selectedBooking,
                          numberOfCustomer: e.target.value,
                        })
                      }
                    />
                  </>
                )}
              </div>
              <div className="modal-footer booking-modal-footer">
                <button
                  type="button"
                  className="btn booking-modal-btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn booking-modal-btn-primary"
                  onClick={handleSaveChanges}
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RestaurantLayout>
  );
};

export default BookingHistory;
