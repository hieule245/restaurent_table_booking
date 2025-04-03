import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortAlphaDown, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "../../components/Specials/Specials.styles.css";
import "./Restaurant.styles.css";
import { REST_API_URL } from "../../data";
const RestaurantList = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [Started, setStarted] = useState("");
  const [Ended, setEnded] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    axios
      .get(`${REST_API_URL}/restaurants`)
      .then((response) => {
        // console.log(response.data); // Debug để kiểm tra API trả về
        setRestaurants(response.data.restaurants); // Đúng key "restaurants"
      })
      .catch((error) => console.error("Error fetching restaurants:", error));
  }, []);

  if (restaurants.length === 0) {

  }
  const filteredRestaurants = restaurants.filter((restaurant) => {
    return (
      restaurant.Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (Started ? restaurant.Started >= Started : true) &&
      (Ended ? restaurant.Ended <= Ended : true)
    );
  });

  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-light">
      <div className="container">
        <div className="">
          <h2 className="text-center my-4 fs-1 fw-bold">Restaurant List</h2>
          <hr />
          <div className="row mb-3 justify-content-end">
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
            <div className="col-md-1">
              <div className="btn btn-danger h-75 w-75 p-1 d-flex justify-content-center align-items-center">
                <FontAwesomeIcon icon={faSortAlphaDown} className="h-75 w-75" />
              </div>
            </div>
          </div>

          <div className="row restaurant-list-container">
            {paginatedRestaurants.map((restaurant) => (
              <div
                key={restaurant.Id}
                className="col-md-3 mb-4"
                onClick={() => navigate(`/restaurants/${restaurant.Id}/detail`)}
              >
                <div className="card restaurant-card ">
                  {/* Hình ảnh */}
                  <div className="">
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
                  className={`page-item ${
                    currentPage === index + 1 ? "active" : ""
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
      </div>
    </div>
  );
};

export default RestaurantList;
