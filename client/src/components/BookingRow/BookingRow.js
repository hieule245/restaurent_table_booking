const BookingRow = ({ booking, index, onEdit, onCancel }) => {
  // Mapping các trạng thái đặt bàn
  const statusMapping = {
    0: { label: "Cancelled", className: "bg-secondary" },
    1: { label: "Pending", className: "bg-warning" },
    2: { label: "Confirmed", className: "bg-success" },
    3: { label: "Occupied", className: "bg-primary" },
    4: { label: "Done", className: "bg-info" },
  };

  const statusInfo = statusMapping[booking.status] || {
    label: "Unknown",
    className: "bg-dark",
  };

  return (
    <tr>
      <td>{index + 1}</td>
      <td>{booking.book_date}</td>
      <td>{booking.time_start}</td>
      <td>{booking.time_end}</td>
      <td>{booking.numberOfCustomer}</td>
      <td>{booking.table_id}</td>
      <td>{booking.price}</td>
      <td>
        <span className={`badge ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </td>
      <td>
        {(booking.status === 1 || booking.status === 2) && (
          <>
            <button
              className="btn btn-warning btn-sm me-2"
              onClick={() => onEdit(booking)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger btn-sm"
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
