import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import TableCard from "../../../components/Card/TableCard";
import "./Detail.styles.css";
import { useParams } from "react-router-dom";
import axios from "axios";

const DetailRestaurant = () => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [restaurant, setRestaurant] = useState({});
  const { restaurant_id } = useParams();  
  const [tables, setTables] = useState([]);
  // Lấy ngày hiện tại khi component mount
  useEffect(() => {
    if (restaurant_id == null) {
      return;
    } else {
      axios
        .get(`http://localhost:8080/restaurant/${restaurant_id}`)
        .then((responseRestaurant) => {
          setRestaurant(responseRestaurant.data.restaurant);
          axios
            .get(`http://localhost:8080/restaurant/${restaurant_id}/tables`)
            .then((responseTables) => {
              if (responseTables.data.tables == null) {
                console.log("No tables available");
              } else {
                setTables(responseTables.data.tables);
              }
            });
        });
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0]; // Format YYYY-MM-DD
      setSelectedDate(formattedDate);
    }
  }, []);

  // Lấy thời gian hiện tại
  useEffect(() => {
    const now = new Date();
    let roundedHour = now.getHours() + (now.getMinutes() > 0 ? 1 : 0);
    setCurrentTime(roundedHour.toString().padStart(2, "0") + ":00");
  }, []);

  // Tạo danh sách khung giờ từ 07:00 đến 22:00, mỗi 2 giờ
  const generateTimeSlots = (start, end, step) => {
    return Array.from(
      { length: (end - start) / step + 1 },
      (_, i) => (start + i * step).toString().padStart(2, "0") + ":00"
    );
  };

  const timeSlots = generateTimeSlots(7, 22, 2);

  function renderTables() {
    if (tables.length == 0) {
      return (
        <div className="text-center mt-4">
          <h4 className="text-dark fw-bold">No tables available</h4>
        </div>
      );
    } else {
      return (
        <div className="row mt-4">
          {/* Danh sách bàn */}
          {tables.map((table, index) => (
            <div className="col-md-3 mb-3 " key={index}>
              <TableCard table={table} />
            </div>
          ))}
        </div>
      );
    }
  }

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        {/* Sidebar đặt bàn */}
        <div className="col-md-3 p-4 shadow-lg sidebar">
          <div className="restaurant-image-container mb-3">
            <img
              src="https://neworienthoteldanang.com/wp-content/uploads/2024/06/z5496513588493_2736a1328dc694c6e6492e775f73da09.jpg"
              alt="restaurant"
              className="restaurant-image rounded-3"
            />
          </div>
          <form>
            <h4 className="text-center mb-3 fw-bolder text-warning">
              RESERVATION
            </h4>

            <div className="form-group mb-3">
              <label className="form-label fw-semibold text-white">
                Arrival Date
              </label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Start Time */}
            <div className="form-group mb-3">
              <label className="form-label fw-semibold text-white">
                Start Time
              </label>
              <select
                className="form-select"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                <option value="">Select Time</option>
                {timeSlots.map((time, index) => (
                  <option
                    key={index}
                    value={time}
                    disabled={
                      time < currentTime || (endTime && time >= endTime)
                    }
                  >
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* End Time */}
            <div className="form-group mb-3">
              <label className="form-label fw-semibold text-white">
                End Time
              </label>
              <select
                className="form-select"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              >
                <option value="">Select Time</option>
                {timeSlots.map((time, index) => (
                  <option
                    key={index}
                    value={time}
                    disabled={
                      time < currentTime || (startTime && time <= startTime)
                    }
                  >
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center mt-4">
              <button type="submit" className="btn btn-warning w-100 fw-bold">
                Search Availables
              </button>
            </div>
          </form>
        </div>

        {/* Nội dung chính */}
        <div className="col-md-9 p-4">
          <div className="restaurant-details">
            <h1 className="restaurant-name text-dark mb-2">
              {restaurant.Name + " #" + restaurant.Id}
            </h1>
            <p className="restaurant-description text-muted">
              {restaurant.Description}
            </p>
            <p className="restaurant-address-text">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="text-danger me-2"
              />
              <span className="text-dark">{restaurant.Location}</span>
            </p>
          </div>

          {renderTables()}
        </div>
      </div>
    </div>
  );
};

export default DetailRestaurant;
