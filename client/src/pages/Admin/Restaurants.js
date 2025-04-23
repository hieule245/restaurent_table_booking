import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  FaStoreAlt,
} from "react-icons/fa";
import Sidebar from "./SideBar";
import SearchBar from "../../components/SearchBar/SearchBar.js";
import SortDropdown from "../../components/Sort/SortDropdown.js";
import RestaurantCard from "../../components/Card/RestaurantCard.js";
import Pagination from "../../components/Pagination/Pagination.js";

const Admin = () => {
  const [restaurants, setRestaurants] = useState([]); // Dùng để hiển thị danh sách
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const filteredRestaurants = (Array.isArray(restaurants) ? restaurants : []).filter((restaurant) =>
    restaurant && restaurant.Name && restaurant.Name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const paginatedRestaurants = filteredRestaurants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  return (
    <div className="bg-black">
      <ToastContainer />
      <div className="p-4 text-white row h-100">
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
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>

            {/* Actions */}
            <div className="gap-3">
              {/* Sort */}
              <SortDropdown handleSort={handleSort} />
            </div>
          </div>

          {/* Restaurant cards */}
          <div className="restaurant-list-container">
            <div className="row">
              {paginatedRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.Id} restaurant={restaurant} formatTime={formatTime} link={`/admin/restaurants/${restaurant.Id}/detail`} />
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
