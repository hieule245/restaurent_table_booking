import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import { useNavigate } from "react-router-dom";
import BookingRow from "../BookingRow/BookingRow";

const BookingHistory = () => {
  const [user, setUser] = useState({});
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();

  // Fetch user info
  useEffect(() => {
    axios
      .get("http://localhost:8080/me", { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => navigate("/login"));
  }, [navigate]);

  // Fetch booking history
  useEffect(() => {
    if (!user?.Id) return;

    axios
      .get(`http://localhost:8080/booking-history?user_id=${user.Id}`, {
        withCredentials: true,
      })
      .then((res) => setBookings(res.data.bookings))
      .catch(console.error);
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
        `http://localhost:8080/reservation/${selectedBooking.id}`,
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
          .delete(`http://localhost:8080/reservation/${booking.id}`, {
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

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Booking History</h2>
      {user ? (
        <p className="text-center">
          Welcome, {user.Name}! Here is your booking history:
        </p>
      ) : (
        <p className="text-center">Loading user info...</p>
      )}

      {bookings.length === 0 ? (
        <p className="text-center text-muted">No bookings found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Book Date</th>
                <th>Time Start</th>
                <th>Time End</th>
                <th>Seats</th>
                <th>Table ID</th>
                <th>Price ($)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
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
        </div>
      )}

      {/* Modal chỉnh sửa booking */}
      <div
        className="modal fade"
        id="editBookingModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Booking</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
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
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveChanges}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
