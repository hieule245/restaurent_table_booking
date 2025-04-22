import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import "../../components/Specials/Specials.styles.css";
import "./Restaurant.styles.css";
import SortDropdown from "../../components/Sort/SortDropdown";
import SearchBar from "../../components/SearchBar/SearchBar";
const RestaurantList = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [Started] = useState("");
  const [Ended] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/restaurants`)
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

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hour), parseInt(minute));
    const formatted = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return formatted
      .replace(" ", "")
      .replace("AM", "AM")
      .replace("PM", "PM")
      .replace(":", "h");
  };

  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (type) => {
    let sortedRes = [...restaurants];
    if (type === "name-asc") {
      sortedRes.sort((a, b) => (a.Name || "").localeCompare(b.Name || ""));
    } else if (type === "name-desc") {
      sortedRes.sort((a, b) => (b.Name || "").localeCompare(a.Name || ""));
    } else if (type === "started-asc") {
      sortedRes.sort((a, b) =>
        (a.Started || "").localeCompare(b.Started || "")
      );
    } else if (type === "started-desc") {
      sortedRes.sort((a, b) =>
        (b.Started || "").localeCompare(a.Started || "")
      );
    }
    setRestaurants(sortedRes);
  };

  return (
    <div className="bg-light">
      <div className="container">
        <div className="">
          <h2 className="text-center my-4 fs-1 fw-bold">Restaurant List</h2>
          <hr />
          <div className="row mb-3 justify-content-end">
            <div className="col-2 flex-grow-1">
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
            <div className="col-md-1">
              <div className="col-md-2 position-relative">
                <SortDropdown handleSort={handleSort} />
              </div>
            </div>
          </div>

          <div className="row restaurant-list-container">
            {paginatedRestaurants.map((restaurant) => (
              <div
                key={restaurant.Id}
                className="col-md-3 mb-2"
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
                    <h5
                      className="card-title text-muted text-truncate"
                      title={restaurant.Name}
                      style={{ maxWidth: "100%" }}
                    >
                      {restaurant.Name}
                    </h5>
                    <p
                      className="card-text text-muted text-truncate"
                      style={{ maxWidth: "100%" }}
                    >
                      {restaurant.Description || "\u00A0"}
                    </p>

                    {/* Giờ mở cửa */}
                    <div className="restaurant-hours">
                      <span className="open-time">
                        🕒 {formatTime(restaurant.Started)} -{" "}
                        {formatTime(restaurant.Ended)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-container d-flex justify-content-center mt-3">
              <button
                className="btn btn-outline-secondary me-2"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  className={`btn ${
                    currentPage === index + 1
                      ? "btn-secondary"
                      : "btn-outline-secondary"
                  } mx-1`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className="btn btn-outline-secondary ms-2"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &raquo;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantList;
