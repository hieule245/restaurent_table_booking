import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import TableCard from "../../../components/Card/TableCard";
import './Detail.styles.css'

const DetailRestaurant = () => {
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
        return Array.from({ length: (end - start) / step + 1 }, (_, i) =>
            (start + i * step).toString().padStart(2, "0") + ":00"
        );
    };

    const timeSlots = generateTimeSlots(7, 22, 2);

    return (
        <div className="container-fluid mt-4">
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
                        <h4 className="text-center mb-3 fw-bolder text-warning">RESERVATION</h4>

                        <div className="form-group mb-3">
                            <label className="form-label fw-semibold text-white">Arrival Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />

                        </div>

                        {/* Start Time */}
                        <div className="form-group mb-3">
                            <label className="form-label fw-semibold text-white">Start Time</label>
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
                                        disabled={time < currentTime || (endTime && time >= endTime)}
                                    >
                                        {time}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* End Time */}
                        <div className="form-group mb-3">
                            <label className="form-label fw-semibold text-white">End Time</label>
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
                                        disabled={time < currentTime || (startTime && time <= startTime)}
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
                        <h1 className="restaurant-name text-dark mb-2">Restaurant Name</h1>
                        <p className="restaurant-description text-muted">
                            A delightful place to enjoy the best food experience.
                        </p>
                        <p className="restaurant-address-text">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger me-2" />
                            <span className="text-dark">123 Main Street, City, Country</span>
                        </p>
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
            </div>
        </div>
    );
};

export default DetailRestaurant;
