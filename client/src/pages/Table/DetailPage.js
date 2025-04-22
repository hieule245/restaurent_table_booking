import CalendarRow from "../../components/Card/BookingCalendar";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantLayout from "../Restaurant/restaurantLayout";
import "./DetailRestaurant.css";

const DetailRestaurant = () => {
  const { table_id, restaurant_id } = useParams();
  console.log("table id", table_id);
  const [restaurant, setRestaurant] = useState({});
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

  // Lấy thông tin nhà hàng và danh sách tất cả bàn khi component mount
  useEffect(() => {
    if (!restaurant_id) return;

    // Lấy thông tin nhà hàng
    axios
      .get(`${process.env.REACT_APP_API_URL}/restaurant/${restaurant_id}`)
      .then((responseRestaurant) => {
        setRestaurant(responseRestaurant.data.restaurant);
      })
      .catch((error) => console.error("Error fetching restaurant:", error));
  }, [restaurant_id]);
  return (
    <RestaurantLayout>
      <div className="detail-restaurant-container bg-light">
        <div className="header-row bg-light shadow mt-4">
          <div className="table-info">
            <h4 className="table-title text-danger fw-bold">
              {table.name + " #" + table.id}
            </h4>
            <p className="table-details text-secondary">
              <small>
                Số chỗ: {table.seats} - Loại bàn: {table.type}
              </small>
            </p>
          </div>
        </div>
        <div className="calendar-row-container">
          <CalendarRow
            table={table}
            restaurant={restaurant}
            bookings={bookings}
            setBookings={setBookings}
          />
        </div>
      </div>
    </RestaurantLayout>
  );
};

export default DetailRestaurant;
