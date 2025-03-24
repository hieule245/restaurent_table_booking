import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "../../components/Specials/Specials.styles.css"
const RestaurantList = () => {
    const navigate = useNavigate
    const [restaurants, setRestaurants] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [Started, setStarted] = useState("");
    const [Ended, setEnded] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        axios.get("http://localhost:8080/restaurants")
            .then(response => {
                console.log(response.data); // Debug để kiểm tra API trả về
                setRestaurants(response.data.restaurants); // Đúng key "restaurants"
            })
            .catch(error => console.error("Error fetching restaurants:", error));
    }, []);


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
        <div className="container mt-4">
            <h2 className="text-center mb-4">Restaurant List</h2>
            <div className="row mb-3">
                <div className="col-md-4">
                    <div className="input-group">
                        <span className="input-group-text"><FontAwesomeIcon icon={faSearch} /></span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="input-group">
                        <span className="input-group-text"><FontAwesomeIcon icon={faClock} /></span>
                        <input
                            type="time"
                            className="form-control"
                            value={Started}
                            onChange={(e) => setStarted(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="input-group">
                        <span className="input-group-text"><FontAwesomeIcon icon={faClock} /></span>
                        <input
                            type="time"
                            className="form-control"
                            value={Ended}
                            onChange={(e) => setEnded(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="row">
                {paginatedRestaurants.map((restaurant) => (
                    <div
                        key={restaurant.Id}
                        className="col-md-3 mb-4 card-container"
                        onClick={() => navigate(`/restaurants/${restaurant.Id}/detail`)}
                    >
                        <div className="specials-image-container">
                            <img src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/c9/02/06/discovering-sky-view.jpg?w=900&h=500&s=1"
                            alt={restaurant.Name} className="specials-image" />
                        </div>
                        <div className="specials-details">
                            <div className="specials-name">
                                <h3>{restaurant.Name}</h3>
                                <p className="specials-price"></p>
                            </div>
                            <p className="specials-description">{restaurant.Description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <nav>
                <ul className="pagination justify-content-center">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <li className={`page-item ${currentPage === index + 1 ? "active" : ""}`} key={index}>
                            <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
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
