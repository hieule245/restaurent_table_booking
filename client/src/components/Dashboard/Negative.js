import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
    labels: ["Bàn do khách đặt", "Bàn do staff đặt", "Others"],
    datasets: [
        {
            data: [236, 593, 371], // Số liệu từng loại giao dịch
            backgroundColor: ["#00D25B", "#FC424A", "#FBBF24"], // Màu từng phần
            hoverBackgroundColor: ["#00FF80", "#FF5C6C", "#FFD966"],
            borderWidth: 0,
        },
    ],
};

const options = {
    cutout: "70%", // Điều chỉnh độ dày vòng tròn
    plugins: {
        legend: { display: false }, // Ẩn legend
        tooltip: { enabled: true },
    },
};

const Dashboard = () => {
    return (
        <div className="container-fluid bg-black text-light min-vh-100 p-4">

            {/* Statistics Cards */}
            <div className="row">
                {[
                    { title: "Số lượng người đặt bàn", amount: "$12.34", change: "+3.5%", up: true },
                    { title: "Số tiền kiếm được", amount: "$17.34", change: "+11%", up: true },
                    { title: "Số bàn bị hủy", amount: "$12.34", change: "-2.4%", up: false }
                ].map((stat, index) => (
                    <div key={index} className="col-md-4 mb-3">
                        <div className="p-3 py-4 rounded" style={{ backgroundColor: '#23272F' }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">
                                    {stat.amount} {" "}
                                    <span style={{ color: stat.up ? "#00D25B" : "#FC424A" }}>
                                        <sup><small>{stat.change}</small></sup>
                                    </span>
                                </h4>
                                {/* Icon trong khung tròn */}
                                <div
                                    className="rounded d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        backgroundColor: stat.up ? "#1D3D35" : "#45151B"
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={stat.up ? faArrowUp : faArrowDown}
                                        style={{ color: stat.up ? "#00D25B" : "#FC424A" }}
                                    />
                                </div>
                            </div>
                            <p className="mb-0" style={{ color: '#6C7293' }}>{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row">
                {/* Transaction History */}
                <div className="col-md-6 mb-4">
                    <div className="p-3 rounded" style={{ backgroundColor: "#191C24" }}>
                        <h5 className="text-light">Transaction History</h5>

                        {/* Biểu đồ Doughnut */}
                        <div className="position-relative d-flex justify-content-center">
                            <Doughnut data={data} options={options} className="w-25 h-25" />
                            <div className="position-absolute d-flex flex-column align-items-center" style={{ top: "45%" }}>
                                <h5 className="text-light mb-0">$1200</h5>
                                <p className="small" style={{ color: '#6C7293' }}>Total</p>
                            </div>
                        </div>

                        {/* Danh sách giao dịch */}
                        {[
                            { name: "Paypal", amount: "$236" },
                            { name: "Stripe", amount: "$593" },
                        ].map((service, index) => (
                            <div key={index} className="d-flex justify-content-between bg-dark p-3 mt-3 rounded">
                                <span className="text-light">Transfer to {service.name}</span>
                                <strong className="text-light">{service.amount}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Open Projects */}
                <div className="col-md-6 mb-4">
                    <div className="p-3 rounded" style={{ backgroundColor: '#191C24' }}>
                        <h5 className="pb-2">Danh sách đơn kiếm được nhất</h5>
                        {[
                            { title: "Tên người đặt", desc: "Số thời gian dư", time: "15 minutes ago", tasks: 30 /*số chỗ ngồi*/ , issues: 5 /*loại bàn*/ },
                            { title: "Wordpress Development", desc: "Upload new design", time: "1 hour ago", tasks: 23, issues: 5 },
                            { title: "Project meeting", desc: "New project discussion", time: "35 minutes ago", tasks: 15, issues: 2 },
                            { title: "Broadcast Mail", desc: "Sent release details to team", time: "55 minutes ago", tasks: 35, issues: 7 },
                            { title: "UI Design", desc: "New application planning", time: "50 minutes ago", tasks: 27, issues: 4 }
                        ].map((project, index) => (
                            <div key={index} className="d-flex justify-content-between bg-dark p-2 mt-2 rounded">
                                <div>
                                    <strong>{project.title}</strong>
                                    <p className="mb-0 " style={{ color: '#6C7293' }}>{project.desc}</p>
                                </div>
                                <div className="text-end">
                                    <small className="" style={{ color: '#6C7293' }}>{project.time}</small>
                                    <p className="mb-0">{project.tasks} tasks, {project.issues} issues</p>
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