function TestCustomer({ callAPI }) {
  return (
    <>
      <div name="container" className="">
        <h2>📦 Test API cho Customer Bookings</h2>
        {/* Tạo đơn đặt bàn: Gửi POST /restaurants/:restaurant_id/bookings */}
        <button
          className="btn btn-primary mx-2"
          onClick={() =>
            callAPI("POST", "/restaurants/2/bookings", {
              customer_id: 1,
              table_id: 5,
              numberOfCustomer: "4", // Số lượng khách dưới dạng string (theo định nghĩa VARCHAR(50))
              book_date: "2025-03-25", // Ngày đặt bàn (YYYY-MM-DD)
              time_start: "12:00:00", // Thời gian bắt đầu (TIME format)
              time_end: "14:00:00", // Thời gian kết thúc (TIME format)
              actual_end: "14:00:00", // Thời gian kết thúc thực tế (TIME format)
              price: 50.0, // Giá đặt bàn
              customer_email: "customer@example.com", // Email của khách hàng
              status: 1, // ID trạng thái của đơn đặt bàn
            })
          }
        >
          POST / Create Booking (Restaurant ID 2)
        </button>

        {/* Lấy danh sách đặt bàn của khách hàng: GET /customers/:customer_id/bookings */}
        <button
          className="btn btn-primary mx-2"
          onClick={() => callAPI("GET", "/customers/1/bookings")}
        >
          GET / Bookings for Customer ID 1
        </button>
      </div>
    </>
  );
}

export default TestCustomer;
