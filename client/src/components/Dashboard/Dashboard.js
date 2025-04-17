import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  cutout: "70%",
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
};

const Dashboard = () => {
  const [revenues, SetRevenues] = useState([]);
  const [index, SetIndex] = useState([]);
  const [top, SetTop] = useState([]);
  const fetch = () => {
    try {
      axios
        .get(`${process.env.REACT_APP_API_URL}/owners/:owner_id`, {
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
        .get(`${process.env.REACT_APP_API_URL}/owners/:owner_id/top`, {
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

  const chart = () => {
    try {
      axios
        .get(`${process.env.REACT_APP_API_URL}/owners/:owner_id/static`, {
          withCredentials: true,
        })
        .then((res) => {
          console.log("API Response:", res.data); // Kiểm tra dữ liệu trả về
          SetIndex(res.data || {}); // Gán dữ liệu vào state
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
    chart();
    topReservation();
  }, []);

  const data = {
    labels: ["Bàn do khách đặt", "Bàn do staff đặt"],
    datasets: [
      {
        data: [index.numCustomer, index.numStaff],
        backgroundColor: ["#00D25B", "#FC424A"],
        hoverBackgroundColor: ["#00FF80", "#FF5C6C"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="container-fluid p-4 mt-3" style={{ background: "#F1F8FF" }}>
      <ToastContainer />
      {/* Statistics Cards */}
      <div className="row">
        {[
          {
            title: "Revenue for this week",
            amount: revenues?.WeeklyRevenue
              ? revenues.WeeklyRevenue.toLocaleString() + " VND"
              : "0 VND",
            change:
              revenues.DiffTotal > 0
                ? "+" + revenues.DiffTotal + "%"
                : revenues.DiffTotal < 0
                ? "-" + revenues.DiffTotal + "%"
                : "",
            up: revenues.DiffTotal >= 0 ? true : false,
          },
          {
            title: "Booked and used tables",
            amount: revenues?.BookNumber ? revenues?.BookNumber : "0",
            change:
              revenues.DiffBookNumber > 0
                ? "+" + revenues.DiffBookNumber + "%"
                : revenues.DiffBookNumber < 0
                ? "-" + revenues.DiffBookNumber + "%"
                : "",
            up: revenues.DiffBookNumber >= 0 ? true : false,
          },
          {
            title: "Cancelled tables",
            amount: revenues?.CanceledBook ? revenues?.CanceledBook : "0",
            change:
              revenues.DiffCanceledBook > 0
                ? "+" + revenues.DiffCanceledBook + "%"
                : revenues.DiffCanceledBook < 0
                ? "-" + revenues.DiffCanceledBook + "%"
                : "",
            up: revenues.DiffCanceledBook >= 0 ? false : true,
          },
        ].map((stat, index) => (
          <div key={index} className="col-md-4 mb-3">
            <div
              className="p-3 py-4 rounded shadow-sm"
              style={{
                backgroundColor: "#FFFFFF",
                border: "2px solid #D1E7FF",
                borderRadius: "12px",
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0 text-primary">
                  {stat.amount}{" "}
                  <span style={{ color: stat.up ? "#00D25B" : "#FC424A" }}>
                    <sup>
                      <small>{stat.change}</small>
                    </sup>
                  </span>
                </h4>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: stat.up ? "#DFF5E3" : "#FFD9D9",
                  }}
                >
                  <FontAwesomeIcon
                    icon={stat.up ? faArrowUp : faArrowDown}
                    style={{ color: stat.up ? "#00D25B" : "#FC424A" }}
                  />
                </div>
              </div>
              <p className="mb-0 text-muted">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="row d-flex align-items-stretch">
        {/* Transaction History */}
        <div className="col-md-6 mb-4 d-flex">
          <div
            className="p-3 rounded shadow-sm w-100 h-100 d-flex flex-column"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "2px solid #D1E7FF",
            }}
          >
            <h5 className="text-primary">Transaction History</h5>

            {/* Biểu đồ Doughnut */}
            <div className="position-relative d-flex justify-content-center align-items-center flex-grow-1">
              <Doughnut data={data} options={options} className="w-25 h-75" />
              <div
                className="position-absolute d-flex flex-column align-items-center"
                style={{ top: "42%" }}
              >
                <h5 className="text-dark mb-0">
                  {revenues.WeeklyRevenue
                    ? revenues.WeeklyRevenue.toLocaleString()
                    : 0}
                </h5>
                <p className="small text-muted">VND</p>
              </div>
            </div>

            {/* Danh sách giao dịch */}
            <div className="d-flex flex-column gap-3">
              {[
                { name: "Customer-reserved table", amount: index.numCustomer },
                { name: "Staff-reserved table", amount: index.numStaff },
              ].map((service, index) => (
                <div
                  key={index}
                  className="d-flex justify-content-between p-3 rounded shadow-sm"
                  style={{ backgroundColor: "#E3F2FD", borderRadius: "8px" }}
                >
                  <span className="text-dark">Transfer to {service.name}</span>
                  <strong className="text-dark">{service.amount}</strong>
                </div>
              ))}
            </div>
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
            {Array.isArray(top) ? (
              top.map((restaurant, index) => (
                <div
                  key={index}
                  className="d-flex justify-content-between p-2 mt-2 rounded shadow-sm"
                  style={{ backgroundColor: "#E3F2FD", borderRadius: "8px" }}
                >
                  <div>
                    <strong className="text-dark">{restaurant.Name}</strong>
                    <p className="mb-0 text-muted">
                      {restaurant.TotalRevenue
                        ? restaurant.TotalRevenue.toLocaleString()
                        : 0}{" "}
                      VND
                    </p>
                  </div>
                  <div className="text-end">
                    <small className="text-muted">
                      {restaurant.TotalCustomer ? restaurant.TotalCustomer : 0}{" "}
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
              ))
            ) : (
              <p className="text-muted">No restaurants available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
