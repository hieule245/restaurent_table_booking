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

import axios from "axios";
import TestUser from "./TestUsers/TestUsers";
import TestAdmin from "./TestAdmin/TestAdmin";
import TestOwner from "./TestOwner/TestOwner";
import TestCustomer from "./TestCustomer/TestCustomer";
import TestStaff from "./TestStaff/TestStaff";

import { REST_API_URL } from "../data";
function TestAPI() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const baseURL = REST_API_URL; // Thay đổi thành URL backend của bạn

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
    <>
      <TestApiAll />
      {/* <TestBookTimeTable /> */}
    </>
  );
};
export default TestAPI;

// <div name="container" className="">
//   <h2>👤 Test REST API cho Owner - RESTAURANT</h2>
//   <button
//     className="btn btn-success mx-2"
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
//     className="btn btn-primary mx-2"
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
//     className="btn btn-primary mx-2"
//     onClick={() => callAPI("GET", "/owners/1/restaurants")}
//   >
//     GET / All Restaurants
//   </button>

//   <button
//     className="btn btn-primary mx-2"
//     onClick={() => callAPI("GET", "/owners/1/restaurants/2")}
//   >
//     GET / Restaurant ID 2
//   </button>

//   <button
//     className="btn btn-danger mx-2"
//     onClick={() => callAPI("DELETE", "/owners/1/restaurants/2")}
//   >
//     DELETE / Restaurant ID 2
//   </button>
// </div>
// <hr />

// <div name="container" className="">
//   <h2>🪑 Test REST API cho Owner - TABLES (Bàn ăn)</h2>

//   <button
//     className="btn btn-success mx-2"
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
//     className="btn btn-primary mx-2"
//     onClick={() => callAPI("GET", "/owners/1/restaurants/2/tables")}
//   >
//     GET / All Tables (Nhà hàng ID 2)
//   </button>

//   <button
//     className="btn btn-primary mx-2"
//     onClick={() => callAPI("GET", "/owners/1/restaurants/2/tables/5")}
//   >
//     GET / Table ID 5 (Nhà hàng ID 2)
//   </button>

//   <button
//     className="btn btn-danger mx-2"
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
//     className="btn btn-primary mx-2"
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
//     className="btn btn-primary mx-2"
//     onClick={() => callAPI("GET", "/customers/1/bookings")}
//   >
//     GET / Bookings for Customer ID 1
//   </button>
// </div>
