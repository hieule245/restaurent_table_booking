import React, { useState } from "react";
import axios from "axios";

const TestAPI = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const baseURL = "http://localhost:8080"; // Thay đổi thành URL backend của bạn

  // Hàm gọi API với Axios
  const callAPI = async (method, endpoint, data = null) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await axios({
        method,
        url: `${baseURL}${endpoint}`,
        data,
        withCredentials: true, // Bật gửi cookie nếu cần
      });
      setResponse(res.data);
    } catch (err) {
      console.log(
        "Lỗi chi tiết:",
        err.response ? err.response.data : err.message
      );
      setError(err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div className="text-center">
        <h1>API Tester</h1>

        <h2>🔍 Test REST API bằng Axios</h2>
      </div>

      <div name="container" className="">
        <h2>👤 Test REST API cho User (Người dùng)</h2>
        {/* Phần test cho các API khác (ví dụ login, nhà hàng, bàn ăn) */}
        <button
          className="btn btn-outline-primary mx-2"
          onClick={() =>
            callAPI("POST", "/login", {
              Email: "lamtvt@runsystem.nett",
              Password: "1",
            })
          }
        >
          POST / owner login
        </button>
        <button
          className="btn btn-outline-primary mx-2"
          onClick={() =>
            callAPI("POST", "/login", {
              Email: "lamtvt@runsystem.net",
              Password: "1",
            })
          }
        >
          POST / cus login
        </button>
        <button
          className="btn btn-outline-primary mx-2"
          onClick={() =>
            callAPI("POST", "/login", {
              Email: "lamtvt@runsystem.nettt",
              Password: "1",
            })
          }
        >
          POST / admin login
        </button>

        <button
          className="btn btn-outline-primary mx-2"
          onClick={() => callAPI("GET", "/me")}
        >
          GET /me
        </button>

        <button
          className="btn btn-outline-primary mx-2"
          onClick={() =>
            callAPI("POST", "/register", {
              Email: "lamtvt@runsystem.nettt",
              Password: "1",
              Name: "Tran Vu Thanh Lam",
              Phone: "0921658465",
              Role: "owner",
            })
          }
        >
          POST / admin register
        </button>
      </div>
      <hr />

      <div name="container" className="">
        <h2>👤 Test REST API cho ADMIN</h2>

        <button
          className="btn btn-outline-primary mx-2"
          onClick={() => callAPI("GET", "restaurants")}
        >
          GET / All Restaurants
        </button>

        {/* <button
          className="btn btn-outline-primary mx-2"
          onClick={() => callAPI("GET", "/owners/1/restaurants/2")}
        >
          GET / Restaurant ID 2
        </button> */}
      </div>
      <hr />

      <div name="container" className="">
        <h2>👤 Test REST API cho Owner - RESTAURANT</h2>
        <button
          className="btn btn-outline-success mx-2"
          onClick={() =>
            callAPI("POST", "/owners/1/restaurants", {
              name: "Lam's Restaurant 2",
              description: "Nhà hàng ngon hơn",
              owner_id: 1,
              Started: "08:00",
              Ended: "22:00",
            })
          }
        >
          POST / Create Restaurant
        </button>

        <button
          className="btn btn-outline-primary mx-2"
          onClick={() =>
            callAPI("PUT", "/owners/1/restaurants/2", {
              name: "Lam's Restaurant UPDATED",
              description: "Nhà hàng đã cập nhật",
              owner_id: 1,
              Started: "09:00",
              Ended: "23:00",
            })
          }
        >
          PUT / Edit Restaurant
        </button>

        <button
          className="btn btn-outline-primary mx-2"
          onClick={() => callAPI("GET", "/owners/1/restaurants")}
        >
          GET / All Restaurants
        </button>

        <button
          className="btn btn-outline-primary mx-2"
          onClick={() => callAPI("GET", "/owners/1/restaurants/2")}
        >
          GET / Restaurant ID 2
        </button>

        <button
          className="btn btn-outline-danger mx-2"
          onClick={() => callAPI("DELETE", "/owners/1/restaurants/2")}
        >
          DELETE / Restaurant ID 2
        </button>
      </div>
      <hr />

      <div name="container" className="">
        <h2>🪑 Test REST API cho Owner - TABLES (Bàn ăn)</h2>

        <button
          className="btn btn-outline-success mx-2"
          onClick={() =>
            callAPI("POST", "/owners/1/restaurants/2/tables", {
              name: "Bàn VIP 1",
              type: "VIP",
              seats: 6,
              restaurant_id: 2,
            })
          }
        >
          POST / Create Table
        </button>

        <button
          className="btn btn-outline-primary mx-2"
          onClick={() => callAPI("GET", "/owners/1/restaurants/2/tables")}
        >
          GET / All Tables (Nhà hàng ID 2)
        </button>

        <button
          className="btn btn-outline-primary mx-2"
          onClick={() => callAPI("GET", "/owners/1/restaurants/2/tables/5")}
        >
          GET / Table ID 5 (Nhà hàng ID 2)
        </button>

        <button
          className="btn btn-outline-danger mx-2"
          onClick={() => callAPI("DELETE", "/owners/1/restaurants/2/tables/5")}
        >
          DELETE / Table ID 5 (Nhà hàng ID 2)
        </button>
      </div>

      <hr />
      <div name="container" className="">
        <h2>📦 Test API cho Customer Bookings</h2>
        {/* Tạo đơn đặt bàn: Gửi POST /restaurants/:restaurant_id/bookings */}
        <button
          className="btn btn-outline-primary mx-2"
          onClick={() =>
            callAPI("POST", "/restaurants/2/bookings", {
              customer_id: 1,
              table_id: 5,
              numberOfCustomer: "4", // Số lượng khách dưới dạng string (theo định nghĩa VARCHAR(50))
              book_date: "2023-03-20", // Ngày đặt bàn (YYYY-MM-DD)
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
          className="btn btn-outline-primary mx-2"
          onClick={() => callAPI("GET", "/customers/1/bookings")}
        >
          GET / Bookings for Customer ID 1
        </button>
      </div>

      {/* Hiển thị trạng thái */}
      {loading && <p>⏳ Đang tải...</p>}
      {error && <p style={{ color: "red" }}>❌ Lỗi: {JSON.stringify(error)}</p>}
      {response && (
        <pre
          style={{
            background: "#f4f4f4",
            padding: "10px",
            borderRadius: "5px",
            marginTop: "10px",
            fontSize: "1.2em",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default TestAPI;

// <div name="container" className="">
//   <h2>👤 Test REST API cho Owner - RESTAURANT</h2>
//   <button
//     className="btn btn-outline-success mx-2"
//     onClick={() =>
//       callAPI("POST", "/owners/1/restaurants", {
//         name: "Lam's Restaurant 2",
//         description: "Nhà hàng ngon hơn",
//         owner_id: 1,
//         Started: "08:00",
//         Ended: "22:00",
//       })
//     }
//   >
//     POST / Create Restaurant
//   </button>

//   <button
//     className="btn btn-outline-primary mx-2"
//     onClick={() =>
//       callAPI("PUT", "/owners/1/restaurants/2", {
//         name: "Lam's Restaurant UPDATED",
//         description: "Nhà hàng đã cập nhật",
//         owner_id: 1,
//         Started: "09:00",
//         Ended: "23:00",
//       })
//     }
//   >
//     PUT / Edit Restaurant
//   </button>

//   <button
//     className="btn btn-outline-primary mx-2"
//     onClick={() => callAPI("GET", "/owners/1/restaurants")}
//   >
//     GET / All Restaurants
//   </button>

//   <button
//     className="btn btn-outline-primary mx-2"
//     onClick={() => callAPI("GET", "/owners/1/restaurants/2")}
//   >
//     GET / Restaurant ID 2
//   </button>

//   <button
//     className="btn btn-outline-danger mx-2"
//     onClick={() => callAPI("DELETE", "/owners/1/restaurants/2")}
//   >
//     DELETE / Restaurant ID 2
//   </button>
// </div>
// <hr />

// <div name="container" className="">
//   <h2>🪑 Test REST API cho Owner - TABLES (Bàn ăn)</h2>

//   <button
//     className="btn btn-outline-success mx-2"
//     onClick={() =>
//       callAPI("POST", "/owners/1/restaurants/2/tables", {
//         name: "Bàn VIP 1",
//         type: "VIP",
//         seats: 6,
//         restaurant_id: 2,
//       })
//     }
//   >
//     POST / Create Table
//   </button>

//   <button
//     className="btn btn-outline-primary mx-2"
//     onClick={() => callAPI("GET", "/owners/1/restaurants/2/tables")}
//   >
//     GET / All Tables (Nhà hàng ID 2)
//   </button>

//   <button
//     className="btn btn-outline-primary mx-2"
//     onClick={() => callAPI("GET", "/owners/1/restaurants/2/tables/5")}
//   >
//     GET / Table ID 5 (Nhà hàng ID 2)
//   </button>

//   <button
//     className="btn btn-outline-danger mx-2"
//     onClick={() => callAPI("DELETE", "/owners/1/restaurants/2/tables/5")}
//   >
//     DELETE / Table ID 5 (Nhà hàng ID 2)
//   </button>
// </div>

// <hr />
// <div name="container" className="">
//   <h2>📦 Test API cho Customer Bookings</h2>
//   {/* Tạo đơn đặt bàn: Gửi POST /restaurants/:restaurant_id/bookings */}
//   <button
//     className="btn btn-outline-primary mx-2"
//     onClick={() =>
//       callAPI("POST", "/restaurants/2/bookings", {
//         customer_id: 1,
//         table_id: 5,
//         numberOfCustomer: "4", // Số lượng khách dưới dạng string (theo định nghĩa VARCHAR(50))
//         book_date: "2023-03-20", // Ngày đặt bàn (YYYY-MM-DD)
//         time_start: "12:00:00", // Thời gian bắt đầu (TIME format)
//         time_end: "14:00:00", // Thời gian kết thúc (TIME format)
//         actual_end: "14:00:00", // Thời gian kết thúc thực tế (TIME format)
//         price: 50.0, // Giá đặt bàn
//         customer_email: "customer@example.com", // Email của khách hàng
//         status: 1, // ID trạng thái của đơn đặt bàn
//       })
//     }
//   >
//     POST / Create Booking (Restaurant ID 2)
//   </button>

//   {/* Lấy danh sách đặt bàn của khách hàng: GET /customers/:customer_id/bookings */}
//   <button
//     className="btn btn-outline-primary mx-2"
//     onClick={() => callAPI("GET", "/customers/1/bookings")}
//   >
//     GET / Bookings for Customer ID 1
//   </button>
// </div>
