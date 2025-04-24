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
const BookingHistory = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // phân trang
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = bookings && bookings.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getUpdatedStatus = (booking, timeNow) => {
    const startSeconds = convertTimeToSeconds(booking.time_start);
    const endSeconds = convertTimeToSeconds(booking.time_end);

    switch (booking.status) {
      case 1: // Pending
        return timeNow >= startSeconds ? 0 : booking.status;
      case 2: // Confirmed
        if (timeNow >= startSeconds && timeNow < endSeconds) return 3;
        if (timeNow >= endSeconds) return 4;
        return booking.status;
      case 3: // Occupied
        return timeNow >= endSeconds ? 4 : booking.status;
      default:
        return booking.status;
    }
  };

  // cập nhật thời gian mỗi 5 giây và kiểm tra trạng thái
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Cập nhật trạng thái đặt bàn
      setBookings((prevBookings) =>
        prevBookings.map((booking) => {
          const bookDate = new Date(booking.book_date);
          const today = new Date();

          if (
            bookDate.getFullYear() !== today.getFullYear() ||
            bookDate.getMonth() !== today.getMonth() ||
            bookDate.getDate() !== today.getDate()
          ) {
            return booking;
          }

          const currentSeconds = convertTimeToSeconds(
            now.toTimeString().split(" ")[0]
          );
          const newStatus = getUpdatedStatus(booking, currentSeconds);
          if (newStatus !== booking.status) {
            updateStatusOnServer(booking.id, newStatus);
            return { ...booking, status: newStatus };
          }

          return booking;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch user info
  const [user, setUser] = useState({});
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/me`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => navigate("/login"));
  }, [navigate]);

  // Fetch booking history
  useEffect(() => {
    if (!user?.Id) return;
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/booking-history?user_gmail=${user.Email}`,
        {
          withCredentials: true,
        }
      )
      .then((res) => setBookings(res.data.bookings))
      .catch((err) => {
        console.error(err);
        toast.error("Error fetching booking history");
      });
  }, [user]);

  const updateStatusOnServer = (id, newStatus) => {
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/reservation/${id}/server`,
        { status: newStatus },
        { withCredentials: true }
      )
      .then(() => {
        console.log(`✅ Booking ${id} updated to status ${newStatus}`);
      })
      .catch((err) => {
        console.error(`❌ Failed to update booking ${id}`, err);
      });
  };

  const convertTimeToSeconds = (timeStr) => {
    const [h, m, s] = timeStr.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };

  const timeSlots = Array.from({ length: 9 }, (_, i) => {
    const hour = 7 + i * 2;
    return `${hour.toString().padStart(2, "0")}:00:00`;
  });

  const formatTo12Hour = (time24) => {
    const [hourStr, minuteStr] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, "0")}:${minuteStr} ${ampm}`;
  };
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
        `${process.env.REACT_APP_API_URL}/reservation/${selectedBooking.id}`,
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

  const [selectedMonth, setSelectedMonth] = useState("All");

  // Lọc booking theo tháng
  const filteredBookings =
    selectedMonth === "All"
      ? bookings // Nếu chọn "All", không lọc
      : bookings.filter((booking) => {
          const bookingDate = new Date(booking.book_date); // Chuyển đổi ngày của booking thành đối tượng Date
          const bookingMonth = String(bookingDate.getMonth() + 1).padStart(
            2,
            "0"
          ); // Lấy tháng từ ngày và thêm 0 nếu cần
          return bookingMonth === selectedMonth; // So sánh tháng với tháng đã chọn
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
                    <th>
                      <strong>Start</strong>
                    </th>
                    <th>
                      <strong>End</strong>
                    </th>
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
                      onEdit={handleEdit}
                      onCancel={handleCancel}
                      formatTo12Hour={formatTo12Hour}
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
                      disabled
                      type="date"
                      className="form-control bg-secondary"
                      value={selectedBooking.book_date?.split("T")[0] || ""}
                      onChange={(e) =>
                        setSelectedBooking({
                          ...selectedBooking,
                          book_date: e.target.value,
                        })
                      }
                    />
                    <small className="text-secondary p-0 mb-3">
                      * Can't change another day.
                    </small>
                    <br />

                    {/* Time slots select */}
                    <label>Time Start:</label>
                    <select
                      className="form-control"
                      value={selectedBooking.time_start}
                      onChange={(e) =>
                        setSelectedBooking({
                          ...selectedBooking,
                          time_start: e.target.value,
                        })
                      }
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {formatTo12Hour(slot)}
                        </option>
                      ))}
                    </select>

                    <label className="mt-1">Time End:</label>
                    <select
                      className="form-control"
                      value={selectedBooking.time_end}
                      onChange={(e) =>
                        setSelectedBooking({
                          ...selectedBooking,
                          time_end: e.target.value,
                        })
                      }
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {formatTo12Hour(slot)}
                        </option>
                      ))}
                    </select>

                    <small className="text-secondary p-0">
                      * Please update the end time first if you want to
                      reschedule.
                    </small>
                    <br />

                    <label className="mt-1">Seats:</label>
                    <input
                      disabled
                      type="number"
                      className="form-control bg-secondary"
                      value={selectedBooking.numberOfCustomer}
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
