import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import BookingRow from "../BookingRow/BookingRow";
import "react-toastify/dist/ReactToastify.css";
import "./BookingHistory.css";
import RestaurantLayout from "../../pages/Restaurant/restaurantLayout";

const BookingHistory = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const navigate = useNavigate();

  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = bookings && bookings.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/me`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
    if (!user?.Id) return;
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/booking-history?user_gmail=${user.Email}`,
        { withCredentials: true }
      )
      .then((res) => setBookings(res.data.bookings))
      .catch((err) => {
        console.error(err);
        toast.error("Error fetching booking history");
      });
  }, [user]);

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
          .delete(
            `${process.env.REACT_APP_API_URL}/reservation/${booking.id}`,
            {
              withCredentials: true,
            }
          )
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

  const filteredBookings =
    selectedMonth === "All"
      ? bookings
      : bookings.filter((booking) => {
          const bookingDate = new Date(booking.book_date);
          const bookingMonth = String(bookingDate.getMonth() + 1).padStart(
            2,
            "0"
          );
          return bookingMonth === selectedMonth;
        });

  return (
    <RestaurantLayout>
      <div className="booking-history-container mt-2">
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
        <h5 className="text-muted">Current: {currentTime.toLocaleString()}</h5>
        {user ? (
          <p className="booking-history-welcome">
            <hr />
            Welcome,<strong> {user.Name}! </strong>
            <p> Here is your booking history:</p>
          </p>
        ) : (
          <p className="booking-history-loading">Loading user info...</p>
        )}
        {!Array.isArray(filteredBookings) || filteredBookings.length === 0 ? (
          <p className="booking-history-no">No bookings found.</p>
        ) : (
          <>
            <motion.div
              className="table-responsive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <table className="booking-history-table table table-striped table-bordered my-2">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Day</th>
                    <th>Month</th>
                    <th>Year</th>
                    <th>Number of customer</th>
                    <th>Table ID</th>
                    <th>Price (VND)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems?.map((booking, index) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      index={index}
                      onCancel={handleCancel}
                    />
                  ))}
                </tbody>
              </table>
            </motion.div>
            {bookings.length > itemsPerPage && (
              <div className="pagination-container mt-3">
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &laquo;
                </button>
                {[
                  ...Array(Math.ceil(bookings.length / itemsPerPage)).keys(),
                ].map((number) => (
                  <button
                    key={number + 1}
                    className={`btn ${
                      currentPage === number + 1
                        ? "btn-dark"
                        : "btn-outline-dark"
                    } mx-1`}
                    onClick={() => paginate(number + 1)}
                  >
                    {number + 1}
                  </button>
                ))}
                <button
                  className="btn btn-outline-secondary ms-2"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={
                    currentPage === Math.ceil(bookings.length / itemsPerPage)
                  }
                >
                  &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </RestaurantLayout>
  );
};

export default BookingHistory;
