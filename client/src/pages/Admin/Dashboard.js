import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaTachometerAlt,
  FaUsers,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import Card from "../../components/Card/AdminCard";
import Sidebar from "./SideBar";
const Admin = () => {
  const [revenues, SetRevenues] = useState([]);
  const [top, SetTop] = useState([]);
  const fetch = () => {
    try {
      axios
        .get(`${process.env.REACT_APP_API_URL}/admin`, {
          withCredentials: true,
        })
        .then((res) => {
          console.log("API Response:", res.data); // Kiểm tra dữ liệu trả về
          SetRevenues(res.data.message || {}); // Gán dữ liệu vào state
        })
        .catch((err) => {
          if (err.response) {
            // Backend trả lỗi có thông điệp cụ thể
            toast.error(err.response.data.error);
          } else if (err.request) {
            // Gửi request đi nhưng không có phản hồi
            console.error("No response received:", err.request);
            toast.error("Không nhận được phản hồi từ server");
          } else {
            // Lỗi khi thiết lập request
            console.error("Request setup error:", err.message);
            toast.error("Lỗi khi gửi request: " + err.message);
          }
        });
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Lỗi không xác định: " + err.message);
    }
  };

  const topReservation = () => {
    try {
      axios
        .get(`${process.env.REACT_APP_API_URL}/admin/top`, {
          withCredentials: true,
        })
        .then((res) => {
          console.log("API Response:", res.data.top); // Kiểm tra dữ liệu trả về
          SetTop(res.data.top || {}); // Gán dữ liệu vào state
        })
        .catch((err) => {
          if (err.response) {
            // Backend trả lỗi có thông điệp cụ thể
            toast.error(err.response.data.error);
          } else if (err.request) {
            // Gửi request đi nhưng không có phản hồi
            console.error("No response received:", err.request);
            toast.error("Không nhận được phản hồi từ server");
          } else {
            // Lỗi khi thiết lập request
            console.error("Request setup error:", err.message);
            toast.error("Lỗi khi gửi request: " + err.message);
          }
        });
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Lỗi không xác định: " + err.message);
    }
  };

  useEffect(() => {
    fetch();
    topReservation();
  }, []);

  return (
    <div className="bg-black">
      <ToastContainer />
      <div className="p-4 text-white row vh-100">
        <div className="col-2">
          <Sidebar />
        </div>
        <div className="bg-dark rounded-4 shadow-lg col-10 py-4 px-5">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center w-100">
            <h1 className="text-danger fw-bold d-flex justify-content-center gap-2">
              <FaTachometerAlt className="pt-2" /> Dashboard
            </h1>
          </div>

          <hr className="border-secondary" />

          {/* Restaurants */}
          <div className="row">
            <Card
              icon={<FaUsers className="text-white fs-4" />}
              title="Weekly Revenue"
              value={
                revenues.WeeklyRevenue
                  ? `${revenues.WeeklyRevenue.toLocaleString()} VND`
                  : 0
              }
              growth="+55% than last week"
              color="danger"
            />
            <Card
              icon={<FaUsers className="text-white fs-4" />}
              title="Total Accounts"
              value={
                revenues.ActiveStaff
                  ? `${revenues.ActiveStaff} accounts`
                  : "0 account"
              }
              growth="+55% than last week"
              color="danger"
            />
            <Card
              icon={<FaUsers className="text-white fs-4" />}
              title="Dropped Users"
              value={revenues.OutStaff ? revenues.OutStaff : 0}
              growth="+55% than last week"
              color="danger"
            />
            <Card
              icon={<FaUsers className="text-white fs-4" />}
              title="Weekly Table Bookings"
              value={
                revenues.BookNumber && revenues.CanceledBook
                  ? `${revenues.BookNumber - revenues.CanceledBook
                  } reservations`
                  : "0 reservation"
              }
              growth="+55% than last week"
              color="danger"
            />
          </div>

          <h3 className="mt-3">Revenues</h3>
          <div className="row d-flex align-items-stretch">
            {/* Transaction History */}
            <div className="col-md-6 mb-4 d-flex">
              <div
                className="p-3 rounded shadow-sm w-100 h-100"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  border: "2px solid #D1E7FF",
                }}
              >
                <h5 className="pb-2 text-primary">
                  Top {top.length} Performing Restaurants
                </h5>
                {top.map((restaurant, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-between p-2 mt-2 rounded shadow-sm"
                    style={{ backgroundColor: "#E3F2FD", borderRadius: "8px" }}
                  >
                    <div>
                      <strong className="text-dark text-muted text-truncate" style={{ maxWidth: "100%" }} title={restaurant.Name}>
                        {restaurant.Name}
                      </strong>
                      <p className="mb-0 text-muted">
                        {restaurant.TotalRevenue
                          ? restaurant.TotalRevenue.toLocaleString()
                          : 0}{" "}
                        VND
                      </p>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">
                        {restaurant.TotalCustomer
                          ? restaurant.TotalCustomer
                          : 0}{" "}
                        customers
                      </small>
                      <p className="mb-0 text-dark">
                        {restaurant.TotalReservation
                          ? restaurant.TotalReservation
                          : 0}{" "}
                        reservations
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Projects */}
            <div className="col-md-6 mb-4 d-flex">
              <div
                className="p-3 rounded shadow-sm w-100 h-100"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  border: "2px solid #D1E7FF",
                }}
              >
                <h5 className="pb-2 text-primary">
                  Top {top.length} Performing Restaurants
                </h5>
                {top.map((restaurant, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-between p-2 mt-2 rounded shadow-sm"
                    style={{ backgroundColor: "#E3F2FD", borderRadius: "8px" }}
                  >
                    <div>
                      <strong className="text-dark text-muted text-truncate" style={{ maxWidth: "100%" }} title={restaurant.Name}>
                        {restaurant.Name}
                      </strong>
                      <p className="mb-0 text-muted">
                        {restaurant.TotalRevenue
                          ? restaurant.TotalRevenue.toLocaleString()
                          : 0}{" "}
                        VND
                      </p>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">
                        {restaurant.TotalCustomer
                          ? restaurant.TotalCustomer
                          : 0}{" "}
                        customers
                      </small>
                      <p className="mb-0 text-dark">
                        {restaurant.TotalReservation
                          ? restaurant.TotalReservation
                          : 0}{" "}
                        reservations
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
