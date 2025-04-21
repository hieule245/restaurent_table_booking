import React from "react";

const BookingRow = ({ booking, index, onEdit, onCancel, formatTo12Hour }) => {
  // Mapping trạng thái đặt bàn
  const statusMapping = {
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

  return (
    <tr>
      <td>{index + 1}</td>
      <td>{booking.book_date}</td>
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
              className="action-button edit"
              onClick={() => onEdit(booking)}
            >
              Edit
            </button>
            <button
              className="action-button cancel"
              onClick={() => onCancel(booking)}
            >
              Cancel
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

export default BookingRow;
