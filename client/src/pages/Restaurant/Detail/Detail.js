import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import TableCard from "../../../components/Card/TableCustomerCard";
import "./Detail.styles.css";
import { useParams } from "react-router-dom";
import axios from "axios";

const DetailRestaurant = () => {
  // State cho thông tin form và dữ liệu
  const [startTime, setStartTime] = useState(""); // Mặc định trống
  const [endTime, setEndTime] = useState(""); // Mặc định trống
  const [selectedDate, setSelectedDate] = useState("");
  const [restaurant, setRestaurant] = useState({});
  const { restaurant_id } = useParams();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy thông tin nhà hàng và danh sách tất cả bàn khi component mount
  useEffect(() => {
    if (!restaurant_id) return;

    // Lấy thông tin nhà hàng
    axios
      .get(`http://localhost:8080/restaurant/${restaurant_id}`)
      .then((responseRestaurant) => {
        setRestaurant(responseRestaurant.data.restaurant);
      })
      .catch((error) => console.error("Error fetching restaurant:", error));

    // Lấy danh sách tất cả bàn (mặc định hiển thị)
    axios
      .get(`http://localhost:8080/restaurant/${restaurant_id}/tables`) 
      .then((responseTables) => {
        if (responseTables.data.tables) {
          setTables(responseTables.data.tables);
        } else {
          console.log("No tables available");
        }
      })
      .catch((error) => console.error("Error fetching tables:", error));

    // Lấy ngày hiện tại
    const today = new Date();
    setSelectedDate(today.toISOString().split("T")[0]);
  }, [restaurant_id]);

  // Tạo danh sách khung giờ từ 07:00 đến 22:00, mỗi 2 giờ
  const generateTimeSlots = (start, end, step) => {
    return Array.from(
      { length: (end - start) / step + 1 },
      (_, i) => (start + i * step).toString().padStart(2, "0") + ":00"
    );
  };
  const timeSlots = generateTimeSlots(7, 22, 2);

  // Hàm gọi API tìm bàn trống theo ngày, startTime và endTime
  const searchAvailableTables = async (e) => {
    e.preventDefault();

    // Nếu người dùng chưa nhập startTime và endTime, giữ nguyên danh sách tất cả bàn
    if (!selectedDate || (!startTime && !endTime)) {
      alert(
        "Please select a date and at least one time (start or end) to filter, or leave both empty to show all tables."
      );
      return;
    }

    // Nếu chỉ có 1 trong 2 ô được nhập, yêu cầu nhập đủ
    if (!startTime || !endTime) {
      alert(
        "Please fill in both start time and end time to search for available tables."
      );
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/restaurant/${restaurant_id}/available-tables`,
        {
          params: {
            date: selectedDate,
            // Chuyển định dạng nếu cần (ví dụ, thêm ":00" nếu giá trị chỉ có "HH:00")
            time_start: startTime.length === 5 ? startTime + ":00" : startTime,
            time_end: endTime.length === 5 ? endTime + ":00" : endTime,
          },
        }
      );
      setTables(response.data.tables || []);
    } catch (error) {
      console.error("Error fetching available tables:", error);
      alert("Failed to fetch available tables. Please try again.");
    }
    setLoading(false);
  };

  // Render danh sách bàn
  function renderTables() {
    if (loading) {
      return <h4 className="text-center mt-4 text-primary">Loading...</h4>;
    }
    if (tables.length === 0) {
      return (
        <h4 className="text-center mt-4 text-dark fw-bold">
          No tables available
        </h4>
      );
    }
    return (
      <div className="row mt-4">
        {tables.map((table, index) => (
          <div className="col-md-3 mb-3" key={index}>
            <TableCard table={table} />
          </div>
        ))}
      </div>
    );
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
          <form onSubmit={searchAvailableTables}>
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
                  <option key={index} value={time}>
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
                  <option key={index} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center mt-4">
              <button
                type="submit"
                className="btn btn-warning w-100 fw-bold"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search Availables"}
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
