import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { REST_API_URL } from "../../data";
ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ["Bàn do khách đặt", "Bàn do staff đặt", "Others"],
  datasets: [
    {
      data: [236, 593, 371],
      backgroundColor: ["#00D25B", "#FC424A", "#FBBF24"],
      hoverBackgroundColor: ["#00FF80", "#FF5C6C", "#FFD966"],
      borderWidth: 0,
    },
  ],
};

const options = {
  cutout: "70%",
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
};

const Dashboard = () => {
  const [revenues, SetRevenues] = useState([]);
  const fetch = () => {
    try {
      axios
        .get(`${REST_API_URL}/owners/:owner_id`, { withCredentials: true })
        .then((res) => {
          console.log("API Response:", res.data); // Kiểm tra dữ liệu trả về
          SetRevenues(res.data.message || {}); // Gán dữ liệu vào state
        })
        .catch((err) => toast.error(err));
    } catch (err) {
      toast.error(err);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div
      className="container-fluid min-vh-100 p-4"
      style={{ background: "#F1F8FF" }}
    >
      {/* Statistics Cards */}
      <div className="row">
        {[
          {
            title: "Revenue for this week",
            amount: revenues?.WeeklyRevenue
              ? revenues.WeeklyRevenue.toLocaleString() + " VND"
              : "0 VND",
            change: "+3.5%",
            up: true,
          },
          ,
          {
            title: "Booked and used tables",
            amount: revenues.BookNumber,
            change: "+11%",
            up: true,
          },
          {
            title: "Cancelled tables",
            amount: revenues.CanceledBook,
            change: "-2.4%",
            up: false,
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
                <h5 className="text-dark mb-0">$1200</h5>
                <p className="small text-muted">Total</p>
              </div>
            </div>

            {/* Danh sách giao dịch */}
            <div className="d-flex flex-column gap-3">
              {[
                { name: "Paypal", amount: "$236" },
                { name: "Stripe", amount: "$593" },
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
            <h5 className="pb-2 text-primary">Danh sách đơn kiếm được nhất</h5>
            {[
              {
                title: "Tên người đặt",
                desc: "Số thời gian dư",
                time: "15 minutes ago",
                tasks: 30,
                issues: 5,
              },
              {
                title: "Wordpress Development",
                desc: "Upload new design",
                time: "1 hour ago",
                tasks: 23,
                issues: 5,
              },
              {
                title: "Project meeting",
                desc: "New project discussion",
                time: "35 minutes ago",
                tasks: 15,
                issues: 2,
              },
              {
                title: "Broadcast Mail",
                desc: "Sent release details to team",
                time: "55 minutes ago",
                tasks: 35,
                issues: 7,
              },
              {
                title: "UI Design",
                desc: "New application planning",
                time: "50 minutes ago",
                tasks: 27,
                issues: 4,
              },
            ].map((project, index) => (
              <div
                key={index}
                className="d-flex justify-content-between p-2 mt-2 rounded shadow-sm"
                style={{ backgroundColor: "#E3F2FD", borderRadius: "8px" }}
              >
                <div>
                  <strong className="text-dark">{project.title}</strong>
                  <p className="mb-0 text-muted">{project.desc}</p>
                </div>
                <div className="text-end">
                  <small className="text-muted">{project.time}</small>
                  <p className="mb-0 text-dark">
                    {project.tasks} tasks, {project.issues} issues
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
