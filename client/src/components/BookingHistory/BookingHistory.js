import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchBookings();
    fetchUser();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/bookings", {
        withCredentials: true,
      });
      setBookings(response.data);
      setFilteredBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/user", {
        withCredentials: true,
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleMonthChange = (e) => {
    const selectedMonthValue = e.target.value;
    setSelectedMonth(selectedMonthValue);

    if (selectedMonthValue === "") {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter((booking) => {
        const bookingMonth = new Date(booking.date).getMonth() + 1;
        return bookingMonth === parseInt(selectedMonthValue);
      });
      setFilteredBookings(filtered);
    }
    setCurrentPage(1);
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className="container mt-5 text-light">
      <h2 className="mb-4">Lịch Sử Đặt Bàn</h2>

      {user?.Name ? (
        <>
          {/* Month Filter */}
          <div className="mb-3">
            <label className="form-label">Chọn tháng:</label>
            <select
              className="form-select w-auto d-inline-block ms-2"
              value={selectedMonth}
              onChange={handleMonthChange}
            >
              <option value="">Tất cả</option>
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  Tháng {index + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Spinner */}
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Booking Table */}
              <table className="table table-dark table-striped border mt-4">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Giờ</th>
                    <th>Bàn</th>
                    <th>Ghi chú</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.date}</td>
                      <td>{booking.time}</td>
                      <td>{booking.table_number}</td>
                      <td>{booking.note}</td>
                      <td>{booking.status}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-light"
                          onClick={() => handleEdit(booking)}
                        >
                          Chỉnh sửa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {filteredBookings.length > itemsPerPage && (
                <div className="pagination-container mt-4">
                  <button
                    className="btn btn-outline-secondary me-2"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &laquo;
                  </button>
                  {Array.from({
                    length: Math.ceil(filteredBookings.length / itemsPerPage),
                  }).map((_, index) => (
                    <button
                      key={index + 1}
                      className={`btn ${
                        currentPage === index + 1
                          ? "btn-light"
                          : "btn-outline-light"
                      } mx-1`}
                      onClick={() => paginate(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    className="btn btn-outline-secondary ms-2"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={
                      currentPage ===
                      Math.ceil(filteredBookings.length / itemsPerPage)
                    }
                  >
                    &raquo;
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <p>Bạn chưa đăng nhập.</p>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa đặt bàn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bàn số: {selectedBooking?.table_number} <br />
            Ngày: {selectedBooking?.date} <br />
            Giờ: {selectedBooking?.time}
          </p>
          {/* Có thể thêm form chỉnh sửa ở đây */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Đóng
          </Button>
          <Button variant="primary">Lưu thay đổi</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default BookingHistory;
