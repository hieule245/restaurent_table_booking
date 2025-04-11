import React from "react";

const DashboardCard = ({ icon, title, value, growth, color = "danger" }) => {
    return (
        <div className="col-3">
            <div className="card h-100 shadow-bg"
                style={{ cursor: "pointer" }}>
                <div className="card-header row align-items-center pb-5 px-4 pt-4">
                    <div className="col-3">
                        <div className={`bg-${color} rounded w-100 py-2 text-center`}>
                            {icon}
                        </div>
                    </div>
                    <div className="col-9 text-end">
                        <p className="m-0">{title}</p>
                        <h4 className="m-0 text-danger">{value}</h4>
                    </div>
                </div>
                <div className="card-body">
                    <p className="m-0 text-danger">{growth}</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;
