import React from "react";

const BookingRow = ({ booking, index, onCancel }) => {
  const statusMapping = {
    0: {
      label: "Cancelled",
      className: "rounded-pill text-white bg-secondary",
    },
    1: { label: "Pending", className: "rounded-pill text-white bg-warning" },
    2: { label: "Confirmed", className: "rounded-pill text-white bg-success" },
    3: { label: "Occupied", className: "rounded-pill text-white bg-primary" },
    4: { label: "Done", className: "rounded-pill text-white bg-info" },
  };

  const statusInfo = statusMapping[booking.status] || {
    label: "Unknown",
    className: "badge bg-dark",
  };

  const dateObj = new Date(booking.book_date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  return (
    <tr className="fs-5">
      <td>{index + 1}</td>
      <td>{day}</td>
      <td>{month}</td>
      <td>{year}</td>
      <td>{booking.numberOfCustomer}</td>
      <td>{booking.table_id}</td>
      <td>{booking.price}</td>
      <td>
        <span className={statusInfo.className + " px-2"}>
          {statusInfo.label}
        </span>
      </td>
      <td>
        {(booking.status === 1 || booking.status === 2) && (
          <button
            className="action-button bg-danger text-white fs-5"
            onClick={() => onCancel(booking)}
            title="Cancel booking"
          >
            ❌ Cancel
          </button>
        )}
      </td>
    </tr>
  );
};

export default BookingRow;
