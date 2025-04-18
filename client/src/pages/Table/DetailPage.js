import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import CalendarRow from "../../components/Card/BookingCalendar";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantLayout from "../Restaurant/restaurantLayout";
import "./DetailRestaurant.css";

const DetailRestaurant = () => {
  const [restaurant, setRestaurant] = useState({});
  const { restaurant_id } = useParams();
  const navigate = useNavigate();
  const { table_id } = useParams();
  console.log("table id", table_id);
  const [table, setTable] = useState({});
  const [bookings, setBookings] = useState({});

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/table/${table_id}`)
      .then((response) => {
        setTable(response.data.table);
      });

    if (!restaurant_id) return;

    // Lấy thông tin nhà hàng
    axios
      .get(`${process.env.REACT_APP_API_URL}/restaurant/${restaurant_id}`)
      .then((responseRestaurant) => {
        setRestaurant(responseRestaurant.data.restaurant);
      })
      .catch((error) => console.error("Error fetching restaurant:", error));
  }, [table_id, restaurant_id]);

  return (
    <RestaurantLayout>
      <div className="detail-restaurant-container">
        <div className="header-row shadow">
          <div className="back-icon">
            <FontAwesomeIcon
              onClick={() => navigate(-1)}
              icon={faArrowLeft}
              className="arrow-icon"
            />
          </div>
          <div className="table-info">
            <h4 className="table-title">{table.name + " #" + table.id}</h4>
            <p className="table-details">
              <small>
                Số chỗ: {table.seats} - Loại bàn: {table.type}
              </small>
            </p>
          </div>
        </div>
        <div className="calendar-row-container">
          <CalendarRow
            table={table}
            bookings={bookings}
            setBookings={setBookings}
            restaurant={restaurant}
          />
        </div>
      </div>
    </RestaurantLayout>
  );
};

export default DetailRestaurant;
