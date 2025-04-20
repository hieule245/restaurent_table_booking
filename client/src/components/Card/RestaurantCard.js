import React from "react";
import { useNavigate } from "react-router-dom";

const RestaurantCard = ({ restaurant, formatTime, link }) => {
    const navigate = useNavigate();

    return (
        <div
            className="col-md-3 mb-3"
            onClick={() => navigate(link)}
        >
            <div className="card restaurant-card h-100">
                <div className="image-container">
                    <img
                        src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/c9/02/06/discovering-sky-view.jpg?w=900&h=500&s=1"
                        alt={restaurant.Name}
                        className="card-img-top restaurant-image"
                    />
                </div>
                <div className="card-body text-center">
                    <h5 className="card-title text-muted text-truncate" style={{ maxWidth: "100%" }} title={restaurant.Name}>
                        {restaurant.Name}
                    </h5>
                    <p
                        className="card-text text-muted text-truncate"
                        style={{ maxWidth: '100%' }}
                    >
                        {restaurant.Description || '\u00A0'}
                    </p>

                    <div className="restaurant-hours">
                        <span className="open-time">🕒 {formatTime(restaurant.Started)} - {formatTime(restaurant.Ended)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantCard;