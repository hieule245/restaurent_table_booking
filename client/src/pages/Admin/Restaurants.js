import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "./SideBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import {
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSortAmountDown,
  FaStoreAlt,
} from "react-icons/fa";

const Admin = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]); // Dùng để hiển thị danh sách
  const [setSortType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchRestaurant = useCallback(async () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/restaurants`, {
        withCredentials: true,
      })
      .then((response) => {
        console.log("API Response:", response.data);
        if (response.data && Array.isArray(response.data.restaurants)) {
          setRestaurants(response.data.restaurants); // Gán đúng dữ liệu
        } else {
          toast.error("Expected array but got:", response.data);
          setRestaurants([]); // Đặt giá trị mặc định để tránh lỗi
        }
      })
      .catch((error) => {
        toast.error("Error fetching restaurants:", error);
        setRestaurants([]); // Đảm bảo `restaurants` luôn là mảng
      });
  }, []);

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
  return (
    <div className="bg-black">
      <ToastContainer />
      <div className="p-4 text-white row vh-100">
        <div className="col-2">
          <Sidebar />
        </div>
        <div className="bg-dark rounded-4 shadow-lg col-10 pt-4 px-5">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center w-100">
            <h1 className="text-danger fw-bold d-flex align-items-center gap-3">
              <FaStoreAlt className="fs-1" />
              Restaurants
            </h1>
          </div>
          <hr className="border-secondary mt-0" />
          {/* Toolbar */}
          <div className="d-flex flex-wrap justify-content-between align-items-center rounded-3 shadow-sm mb-3">
            {/* Search */}
            <div className="input-group w-auto">
              <span className="input-group-text bg-light border-end-0">
                <FontAwesomeIcon icon={faSearch} className="text-secondary" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ minWidth: "220px" }}
              />
            </div>

            {/* Actions */}
            <div className="gap-3">
              {/* Sort */}
              <div className="dropdown">
                <button
                  type="button"
                  className="btn btn-danger fw-bold d-flex align-items-center gap-2 px-4 py-2"
                  data-bs-toggle="dropdown"
                >
                  <FaSortAmountDown />
                  Sort
                </button>
                <ul className="dropdown-menu shadow rounded-3 ">
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => handleSort("name-asc")}
                    >
                      <FaSortAlphaDown className="me-2 text-danger" /> Name
                      (A-Z)
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

          {/* Restaurant cards */}
          <div className="">
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
                      <h5 className="card-title text-muted text-truncate" style={{ maxWidth: "100%" }} title={restaurant.Name}>{restaurant.Name}</h5>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-3">
              <ul className="pagination">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
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
                    <button className="page-link">{index + 1}</button>
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
      </div>
    </div>
  );
};

export default Admin;
