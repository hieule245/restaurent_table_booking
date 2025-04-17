import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router-dom";
import "../Specials/Specials.styles.css";
import "../../pages/Restaurant/Restaurant.styles.css";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import {
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSortAmountDown,
} from "react-icons/fa";
import "./RestaurantList.styles.css";

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
  const modalRef = useRef(null);
  const [setSortType] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/owners/${ownerId}/restaurants`,
        restaurantData,
        { withCredentials: true }
      );

      console.log("Response", response.data);
      toast.success("Create restaurant successfully!!!");

      fetchRestaurant();

      // Reset form
      setRestaurantData({
        name: "",
        description: "",
        started: "",
        ended: "",
        location: "",
      });
    } catch (error) {
      console.log("Error:", error);
      toast.error("Fail to create!!");
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { ownerId } = useParams();

  const fetchRestaurant = useCallback(async () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/owners/${ownerId}/restaurants`, {
        withCredentials: true,
      })
      .then((response) => {
        console.log("API Response:", response.data);
        if (
          response.data &&
          Array.isArray(response.data["Owner restaurants"])
        ) {
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
  }, [ownerId]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  const handleSort = (type) => {
    setSortType(type);
    let sortedRes = [...restaurants];
    if (type === "name-asc") {
      sortedRes.sort((a, b) => (a.Name || "").localeCompare(b.Name || ""));
    } else if (type === "name-desc") {
      sortedRes.sort((a, b) => (b.Name || "").localeCompare(a.Name || ""));
    }
    setRestaurants(sortedRes);
  };

  const filteredRestaurants = (
    Array.isArray(restaurants) ? restaurants : []
  ).filter(
    (restaurant) =>
      restaurant &&
      restaurant.Name &&
      restaurant.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

    const filteredRestaurants = (Array.isArray(restaurants) ? restaurants : []).filter((restaurant) =>
        restaurant && restaurant.Name && restaurant.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
    const paginatedRestaurants = filteredRestaurants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="container mt-5">
            <ToastContainer />
            <div className="row mb-0">
                {/* Thanh công cụ */}
                <div className="d-flex mb-3 justify-content-between align-items-center">
                    <div className="me-2">
                        <div className="input-group">
                            <span className="input-group-text">
                                <FontAwesomeIcon icon={faSearch} />
                            </span>
                            <input type="text" className="form-control" placeholder="Search by name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <div className="me-2">
                            <button className="btn btn-outline-danger py-2" data-bs-toggle="modal" data-bs-target="#myModal">
                                Add restaurant
                            </button>
                        </div>
                        {/* Nút sắp xếp có cùng chiều cao với input */}
                        <div className="dropdown">
                            {/* Button dropdown */}
                            <button
                                type="button"
                                className="btn btn-danger fw-bolder d-flex align-items-center px-3"
                                data-bs-toggle="dropdown"
                            // Đảm bảo đồng bộ chiều cao
                            >
                                <FaSortAmountDown className="me-2" />
                                Sort
                            </button>

                            {/* Dropdown menu */}
                            <ul className="dropdown-menu shadow rounded-3">
                                <li><button className="dropdown-item" onClick={() => handleSort("name-asc")}><FaSortAlphaDown className="me-2 text-danger" /> Name (A-Z)</button></li>
                                <li><button className="dropdown-item" onClick={() => handleSort("name-desc")}><FaSortAlphaUp className="me-2 text-danger" /> Name (Z-A)</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div ref={modalRef} className="modal fade" id="myModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Create restaurant</h4>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {/* <div className="form-group my-2">
                                        <label className="form-label">Image</label>
                                        <input
                                            name="image"
                                            type="file"
                                            className="form-control"
                                            placeholder="Image URL"
                                            onChange={handleChange}
                                            value={restaurantData.image}
                                        />
                                    </div> */}
                                    <div className="form-group my-2">
                                        <label className="form-label">Name</label>
                                        <input
                                            name="name"
                                            type="text"
                                            className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                                            placeholder="Full Name"
                                            onChange={handleChange}
                                            value={restaurantData.name}
                                        />
                                        {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
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
                                                className={`form-control ${formErrors.started ? "is-invalid" : ""}`}
                                                onChange={handleChange}
                                                value={restaurantData.started}
                                            />
                                            {formErrors.started && <div className="invalid-feedback">{formErrors.started}</div>}
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label">Closed</label>
                                            <input
                                                name="ended"
                                                type="time"
                                                className={`form-control ${formErrors.ended ? "is-invalid" : ""}`}
                                                onChange={handleChange}
                                                value={restaurantData.ended}
                                            />
                                            {formErrors.ended && <div className="invalid-feedback">{formErrors.ended}</div>}
                                        </div>
                                    </div>
                                    <div className="form-group my-2">
                                        <label className="form-label">Location</label>
                                        <input
                                            name="location"
                                            type="text"
                                            className={`form-control ${formErrors.location ? "is-invalid" : ""}`}
                                            placeholder="Location"
                                            onChange={handleChange}
                                            value={restaurantData.location}
                                        />
                                        {formErrors.location && <div className="invalid-feedback">{formErrors.location}</div>}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-outline-danger">Create</button>
                                    <button type="button" className="btn btn-danger border-0 p-2" data-bs-dismiss="modal">Close</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <div className="me-2">
              <button
                className="btn btn-outline-danger py-2"
                data-bs-toggle="modal"
                data-bs-target="#myModal"
              >
                Add restaurant
              </button>
            </div>
            {/* Nút sắp xếp có cùng chiều cao với input */}
            <div className="dropdown">
              {/* Button dropdown */}
              <button
                type="button"
                className="btn btn-danger fw-bolder d-flex align-items-center px-3"
                data-bs-toggle="dropdown"
                // Đảm bảo đồng bộ chiều cao
              >
                <FaSortAmountDown className="me-2" />
                Sort
              </button>

              {/* Dropdown menu */}
              <ul className="dropdown-menu shadow rounded-3">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleSort("name-asc")}
                  >
                    <FaSortAlphaDown className="me-2 text-danger" /> Name (A-Z)
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleSort("name-desc")}
                  >
                    <FaSortAlphaUp className="me-2 text-danger" /> Name (Z-A)
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div
          ref={modalRef}
          className="modal fade"
          id="myModal"
          tabIndex="-1"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Create restaurant</h4>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group my-2">
                    <label className="form-label">Image</label>
                    <input
                      name="image"
                      type="file"
                      className="form-control"
                      placeholder="Image URL"
                      onChange={handleChange}
                      value={restaurantData.image}
                    />
                  </div>
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
                  <button
                    type="submit"
                    className="btn btn-outline-danger"
                    data-bs-dismiss="modal"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger border-0 p-2"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="restaurant-list-container">
        <div className="row">
          {paginatedRestaurants.map((restaurant) => (
            <div
              key={restaurant.Id}
              className="col-md-3 mb-3"
              onClick={() => {
                navigate(`/owner/restaurants/${restaurant.Id}/detail`);
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
      </div>

      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-3">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link text-dark"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li
                key={index}
                className={`page-item ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link text-dark"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default RestaurantList;
