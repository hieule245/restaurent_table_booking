import React from "react";

const BookingRow = ({ booking, index, onEdit, onCancel, formatTo12Hour }) => {
  // Mapping trạng thái đặt bàn
  const statusMapping = {
    // -1: la khong cap nhat
    0: { label: "Cancelled", className: "badge bg-secondary" },
    1: { label: "Pending", className: "badge bg-warning" },
    2: { label: "Confirmed", className: "badge bg-success" },
    3: { label: "Occupied", className: "badge bg-primary" },
    4: { label: "Done", className: "badge bg-info" },
  };

  const statusInfo = statusMapping[booking.status] || {
    label: "Unknown",
    className: "badge bg-dark",
  };
  // Xử lý ngày tháng năm
  const dateObj = new Date(booking.book_date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Tháng 0-11 => Cộng 1
  const day = String(dateObj.getDate()).padStart(2, "0"); // Thêm số 0 trước nếu ngày nhỏ hơn 10

  return (
    <tr>
      <td>{index + 1}</td>
      <td>{day}</td>
      <td>{month}</td>
      <td>{year}</td>
      {/* Format ngày theo "DD/MM/YYYY" */}
      <td>{formatTo12Hour(booking.time_start)}</td>
      <td>{formatTo12Hour(booking.time_end)}</td>
      <td>{booking.numberOfCustomer}</td>
      <td>{booking.table_id}</td>
      <td>{booking.price}</td>
      <td>
        <span className={statusInfo.className}>{statusInfo.label}</span>
      </td>
      <td>
        {(booking.status === 1 || booking.status === 2) && (
          <>
            <button
              className="action-button bg-success text-white me-2"
              onClick={() => onEdit(booking)}
              title="Edit booking"
            >
              ✏️ Edit
            </button>
            <button
              className="action-button bg-danger text-white"
              onClick={() => onCancel(booking)}
              title="Cancel booking"
            >
              ❌ Cancel
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

export default BookingRow;
