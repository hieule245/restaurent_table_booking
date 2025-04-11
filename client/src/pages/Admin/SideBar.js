// src/components/Sidebar/Sidebar.js
import React from "react";
import { FaTachometerAlt, FaUsers, FaUtensils, FaCalendarCheck, FaStoreAlt } from "react-icons/fa";
import HandleLogout from "../../components/authentication/Logout/Logout";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();
    return (
        <div className="position-sticky top-0 start-0 bg-dark rounded-4 d-flex flex-column justify-content-between py-4 align-items-center h-100" style={{ position: "sticky"}}>
            <div className="d-flex flex-column align-items-center gap-3">
                <button className="text-white text-decoration-none cursor-pointer fs-2 fw-bolder border-0 bg-transparent d-flex align-items-center">
                    <FaUtensils className="me-1" /> TableBooker
                </button>
                <hr className="border-secondary my-2" />

                <button className="btn btn-outline-light w-100 d-flex align-items-center gap-2 px-3 py-2 rounded-3 sidebar-btn" onClick={() => navigate("/admin/dashboard")}>
                    <FaTachometerAlt /> Dashboard
                </button>
                <button className="btn btn-outline-light w-100 d-flex align-items-center gap-2 px-3 py-2 rounded-3 sidebar-btn" onClick={() => navigate("/admin/accounts")}>
                    <FaUsers /> Accounts
                </button>
                <button className="btn btn-outline-light w-100 d-flex align-items-center gap-2 px-3 py-2 rounded-3 sidebar-btn" onClick={() => navigate("/admin/restaurants")}>
                    <FaStoreAlt /> Restaurants
                </button>
                <button className="btn btn-outline-light w-100 d-flex align-items-center gap-2 px-3 py-2 rounded-3 sidebar-btn" onClick={() => navigate("/admin/revenues")}>
                    <FaCalendarCheck /> Revenues
                </button>
            </div>
            <button className="btn btn-outline-danger me-2" onClick={() => HandleLogout()}>
                Logout
            </button>
        </div>
    );
};

export default Sidebar;
