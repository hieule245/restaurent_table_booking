import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import TableCard from "../../Card/TableCard";
import "./Tablelist.styles.css";
import { FaPen, FaStoreSlash } from "react-icons/fa";

const TableRestaurant = (ownerId, restaurant_id) => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Lấy ngày hiện tại khi component mount
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // Format YYYY-MM-DD
    setSelectedDate(formattedDate);
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

  return (
    <div className="container-fluid row align-items-center">
      <div className="col-9">
        <div className="row justify-content-center">
          {/* Nội dung chính */}
          <div className="p-4">
            <div className="restaurant-details">
              <h1 className="restaurant-name text-dark mb-2">Restaurant Name</h1>
              <p className="restaurant-description text-muted">
                A delightful place to enjoy the best food experience.
              </p>
              <p className="restaurant-address-text">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="text-danger me-2"
                />
                <span className="text-dark">123 Main Street, City, Country</span>
              </p>
            </div>

          </div>
        </div>
      </div>
      <div className="col-3 text-end pe-5">
        <button className="btn btn-outline-primary me-3" title="Edit restaurant information"><FaPen/></button>
        <button className="btn btn-outline-danger" title="Close a restaurant "><FaStoreSlash/></button>
      </div>

      {/* Danh sách bàn */}
      <div className="row mt-4">
        {[...Array(6)].map((_, index) => (
          <div className="col-md-4 mb-3" key={index}>
            <TableCard />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableRestaurant;
