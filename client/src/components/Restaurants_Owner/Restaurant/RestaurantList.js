import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import SearchBar from "../../SearchBar/SearchBar.js";
import SortDropdown from "../../Sort/SortDropdown.js";
import RestaurantCard from "../../Card/RestaurantCard.js";
import Pagination from "../../Pagination/Pagination.js";
import RestaurantModal from "./RestaurantModal.js";
import { restaurantSchema } from "../../../validations/RestaurantSchema.js";
import "../RestaurantList.styles.css";

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [restaurantData, setRestaurantData] = useState({
        name: "",
        description: "",
        started: "",
        ended: "",
        location: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [modalInstance, setModalInstance] = useState(null);
    const modalRef = useRef(null);
    const { ownerId } = useParams();
    const itemsPerPage = 8;

    const formatTime = (timeStr) => {
        if (!timeStr) return "";

        const [hour, minute] = timeStr.split(":");
        const date = new Date();
        date.setHours(parseInt(hour), parseInt(minute));

        // Sử dụng Intl.DateTimeFormat để định dạng thời gian
        const formatted = new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(date);

        // Chuyển ":" thành "h" và loại bỏ khoảng trắng dư thừa
        return formatted.replace(":", "h").trim();
    };

    const fetchRestaurant = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/owners/${ownerId}/restaurants`, { withCredentials: true });
            if (response.data && Array.isArray(response.data["Owner restaurants"])) {
                setRestaurants(response.data["Owner restaurants"]);
            } else {
                setRestaurants([]);
            }
        } catch (error) {
            setRestaurants([]);
        }
    }, [ownerId]);

    useEffect(() => {
        fetchRestaurant();
    }, [fetchRestaurant]);

    useEffect(() => {
        if (modalRef.current) {
            const modal = new window.bootstrap.Modal(modalRef.current);
            setModalInstance(modal);

            // Reset trạng thái khi modal đóng
            modalRef.current.addEventListener("hidden.bs.modal", () => {
                setFormErrors({});
                setRestaurantData({
                    name: "",
                    description: "",
                    started: "",
                    ended: "",
                    location: "",
                });
            });
        }
    }, []);

    const handleChange = (e) => {
        setRestaurantData({
            ...restaurantData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await restaurantSchema.validate(restaurantData, { abortEarly: false });
            setFormErrors({});
            await axios.post(
                `${process.env.REACT_APP_API_URL}/owners/${ownerId}/restaurants`,
                restaurantData,
                { withCredentials: true }
            );
            toast.success("Create restaurant successfully!!!");
            fetchRestaurant();
            setRestaurantData({
                name: "",
                description: "",
                started: "",
                ended: "",
                location: "",
            });
            if (modalInstance) {
                modalInstance.hide();

                // Đợi modal đóng xong rồi cleanup
                setTimeout(() => {
                    document.body.classList.remove("modal-open");
                    document.body.style.overflow = "";
                    document.body.style.paddingRight = "";
                    const backdrops = document.querySelectorAll(".modal-backdrop");
                    backdrops.forEach((el) => el.remove());

                    // Reset form (tuỳ chọn)
                    setFormErrors({});
                    setRestaurantData({
                        name: "",
                        description: "",
                        started: "",
                        ended: "",
                        location: "",
                    });
                }, 50);
            }
        } catch (error) {
            if (error.name === "ValidationError") {
                const errors = {};
                error.inner.forEach((err) => {
                    errors[err.path] = err.message;
                });
                setFormErrors(errors);
            } else {
                toast.error(error.response?.data?.message || "An error occurred");
            }
        }
    };

    const handleSort = (type) => {
        let sortedRes = [...restaurants];
        if (type === "name-asc") {
            sortedRes.sort((a, b) => (a.Name || "").localeCompare(b.Name || ""));
        } else if (type === "name-desc") {
            sortedRes.sort((a, b) => (b.Name || "").localeCompare(a.Name || ""));
        } else if (type === "started-asc") {
            sortedRes.sort((a, b) => (a.Started || "").localeCompare(b.Started || ""));
        }
        else if (type === "started-desc") {
            sortedRes.sort((a, b) => (b.Started || "").localeCompare(a.Started || ""));
        }
        setRestaurants(sortedRes);
    };

    const filteredRestaurants = restaurants.filter((restaurant) =>
        restaurant.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
    const paginatedRestaurants = filteredRestaurants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="container mt-5">
            <ToastContainer />
            <div className="row mb-0">
                <div className="d-flex mb-4 align-items-center justify-content-between gap-2 flex-wrap">
                    {/* Search bar chiếm phần lớn không gian */}
                    <div className="flex-grow-1">
                        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                    </div>

                    {/* Nhóm nút Add và Sort */}
                    <div className="d-flex align-items-center gap-2">
                        <button
                            className="btn btn-outline-danger"
                            onClick={() => {
                                if (modalInstance) {
                                    // Cleanup trước khi mở (phòng trường hợp backdrop cũ)
                                    const backdrops = document.querySelectorAll(".modal-backdrop");
                                    backdrops.forEach((el) => el.remove());
                                    document.body.classList.remove("modal-open");
                                    document.body.style.overflow = "";
                                    document.body.style.paddingRight = "";

                                    modalInstance.show();
                                }
                            }}
                        >
                            Add restaurant
                        </button>

                        <SortDropdown handleSort={handleSort} />
                    </div>
                </div>

                <RestaurantModal
                    modalRef={modalRef}
                    handleSubmit={handleSubmit}
                    handleChange={handleChange}
                    restaurantData={restaurantData}
                    formErrors={formErrors}
                />
            </div>
            <div className="restaurant-list-container">
                <div className="row">
                    {paginatedRestaurants.map((restaurant) => (
                        <RestaurantCard key={restaurant.Id} restaurant={restaurant} formatTime={formatTime} link={`/owner/restaurants/${restaurant.Id}/detail`} />
                    ))}
                </div>
            </div>
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                />
            )}
        </div>
    );
};

export default RestaurantList;