import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortAlphaDown, faSearch, faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router-dom";
import "../Specials/Specials.styles.css";
import "../../pages/Restaurant/Restaurant.styles.css";
import { toast } from "react-toastify";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const RestaurantList = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]); // Dùng để hiển thị danh sách
    const [restaurantData, setRestaurantData] = useState({
        name: "",
        description: "",
        started: "",
        ended: "",
        location: "",
    });
    const handleChange = (e) => {
        setRestaurantData({
            ...restaurantData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://localhost:8080/owners/${ownerId}/restaurants`, restaurantData, { withCredentials: true })
            console.log("Response", response.data);
            toast.success("Create restaurant succesfully !!!")
            setRestaurantData({
                name: "",
                description: "",
                started: "",
                ended: "",
                location: "",
            });
        } catch (error) {
            console.log("Error:", error)
            toast.error("Fail to create!!")
        }
    }

    const [searchTerm, setSearchTerm] = useState("");
    const [Started] = useState("");
    const [Ended] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const { ownerId } = useParams();
    useEffect(() => {
        axios
            .get(`http://localhost:8080/owners/${ownerId}/restaurants`, { withCredentials: true })
            .then((response) => {
                console.log("API Response:", response.data);
                if (response.data && Array.isArray(response.data["Owner restaurants"])) {
                    setRestaurants(response.data["Owner restaurants"]); // Gán đúng dữ liệu
                } else {
                    console.error("Expected array but got:", response.data);
                    setRestaurants([]); // Đặt giá trị mặc định để tránh lỗi
                }
            })
            .catch((error) => {
                console.error("Error fetching restaurants:", error);
                setRestaurants([]); // Đảm bảo `restaurants` luôn là mảng
            });
    }, []);



    const filteredRestaurants = (Array.isArray(restaurants) ? restaurants : []).filter((restaurant) => {
        return restaurant.Name.toLowerCase().includes(searchTerm.toLowerCase());
    });


    const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
    const paginatedRestaurants = filteredRestaurants.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container mt-3">
            <div className="row mb-3 justify-content-end">
                <div className="col-md-2 mx-0">
                    <button type="button" className="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#myModal">
                        Add restaurant
                    </button>
                </div>
                <div className="modal" id="myModal">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Create restaurant</h4>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-group my-2">
                                        <label className="form-label">Name</label>
                                        <input
                                            name="name"
                                            type="text"
                                            className="form-control"
                                            placeholder="Full Name"
                                            onChange={handleChange}
                                            value={restaurantData.name}
                                        />
                                    </div>
                                    <div className="form-group my-2">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            name="description"
                                            type="text"
                                            className="form-control"
                                            placeholder="Description"
                                            onChange={handleChange}
                                            value={restaurantData.description}
                                        />
                                    </div>
                                    <div className="form-group my-2 row">
                                        <div className="col-6">
                                            <label className="form-label">Opened</label>
                                            <input
                                                name="started"
                                                type="time"
                                                className="form-control"
                                                onChange={handleChange}
                                                value={restaurantData.started}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label">Closed</label>
                                            <input
                                                name="ended"
                                                type="time"
                                                className="form-control"
                                                onChange={handleChange}
                                                value={restaurantData.ended}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group my-2">
                                        <label className="form-label">Location</label>
                                        <input
                                            name="location"
                                            type="text"
                                            className="form-control"
                                            placeholder="Location"
                                            onChange={handleChange}
                                            value={restaurantData.location}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-outline-danger p-2">Create</button>
                                    <button type="button" className="btn btn-danger border-0 p-2" data-bs-dismiss="modal">Close</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="input-group">
                        <span className="input-group-text">
                            <FontAwesomeIcon icon={faSearch} />
                        </span>
                        <input
                            type="text"
                            className="form-control h-100"
                            placeholder="Search by name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-1 mx-0">
                    <div className="h-100">
                        <FontAwesomeIcon icon={faSortAlphaDown} className="fs-5 btn btn-danger" />
                    </div>
                </div>
            </div>

            <div className="row restaurant-list-container">
                {paginatedRestaurants.map((restaurant) => (
                    <div
                        key={restaurant.Id}
                        className="col-md-3 mb-4"
                        onClick={() => {
                            navigate(`/owner/${ownerId}/restaurants/${restaurant.Id}/detail`);
                        }}
                    >
                        <div className="card restaurant-card h-100">
                            {/* Hình ảnh */}
                            <div className="image-container">
                                <img
                                    src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/c9/02/06/discovering-sky-view.jpg?w=900&h=500&s=1"
                                    alt={restaurant.Name}
                                    className="card-img-top restaurant-image"
                                />
                            </div>

                            {/* Nội dung */}
                            <div className="card-body text-center">
                                <h5 className="card-title">{restaurant.Name}</h5>
                                <p className="card-text text-muted">
                                    {restaurant.Description}
                                </p>

                                {/* Giờ mở cửa */}
                                <div className="restaurant-hours">
                                    <span className="open-time">
                                        🕒 {restaurant.Started} - {restaurant.Ended}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <nav>
                <ul className="pagination justify-content-center">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <li
                            className={`page-item ${currentPage === index + 1 ? "active" : ""
                                }`}
                            key={index}
                        >
                            <button
                                className="page-link"
                                onClick={() => setCurrentPage(index + 1)}
                            >
                                {index + 1}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default RestaurantList;
