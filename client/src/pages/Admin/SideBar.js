// src/components/Sidebar/Sidebar.js
import React from "react";
import { FaTachometerAlt, FaUsers, FaUtensils, FaCalendarCheck, FaStoreAlt } from "react-icons/fa";
import HandleLogout from "../../components/authentication/Logout/Logout";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import avatar from "../../assets/image/avatar.png";
const Sidebar = () => {
    const [user, setUser] = useState({
        Id: "",
        Name: "",
        Email: "",
        Phone: "",
        Role: "",
        Status: "",
        Orther_id: 0,
        ImageFile: null,
    });
    const imageUrl = user && user.ImageFile ? `data:image/png;base64,${user.ImageFile}` : avatar;

    // Lưu thông tin từ cookie
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("http://localhost:8080/me", {
                    withCredentials: true,
                });
                if (res.data.user) {
                    setUser(res.data.user);
                }
            } catch (err) {
                console.log("User chưa đăng nhập hoặc token hết hạn");
                setUser(null); // Có thể show UI guest ở đây
            }
        };

        fetchUser();
    }, []);
    const navigate = useNavigate();
    return (
        <div className="position-sticky top-0 start-0 bg-dark rounded-4 d-flex flex-column justify-content-between py-4 container" style={{ position: "sticky", height: "95vh" }}>
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
            <div className="d-flex flex-column align-items-center gap-3">
                <h5 className="text-white text-center mb-0">{user?.Name}</h5>
                <button
                    type="button"
                    onClick={() => navigate("/personal")}
                    className="rounded-circle p-0 border-0 overflow-hidden"
                    style={{ width: "48px", height: "48px" }}
                >
                    <img
                        src={user && imageUrl ? imageUrl : avatar}
                        alt="User Avatar"
                        className="w-100 h-100 rounded-circle object-fit-cover"
                    />
                </button>
                <button className="btn btn-outline-danger" onClick={HandleLogout}>
                    Logout
                </button>
            </div>

        </div>
    );
};

export default Sidebar;
