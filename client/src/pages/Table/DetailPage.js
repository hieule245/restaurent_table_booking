import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import CalendarRow from "../../components/Card/BookingCalendar";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantLayout from "../Restaurant/restaurantLayout";
import "./DetailRestaurant.css";

const DetailRestaurant = () => {
  const navigate = useNavigate();
  const { table_id, restaurant_id } = useParams();
  const [table, setTable] = useState({});
  const [bookings, setBookings] = useState({});

  useEffect(() => {
    axios.get(`http://localhost:8080/table/${table_id}`).then((response) => {
      setTable(response.data.table);
    });
  }, [table_id]);

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
          />
        </div>
      </div>
    </RestaurantLayout>
  );
};

export default DetailRestaurant;
