import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import TableCard from "../../components/Card/TableCard";

const DetailRestaurant = () => {
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [currentTime, setCurrentTime] = useState("");

    // Tạo danh sách khung giờ từ 07:00 đến 22:00, mỗi 2 giờ
    useEffect(() => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        let roundedHour = hours;

        // Nếu phút > 0, làm tròn lên giờ tiếp theo (để tránh chọn giờ đã qua)
        if (minutes > 0) {
            roundedHour += 1;
        }

        setCurrentTime(roundedHour.toString().padStart(2, "0") + ":00");
    }, []);

    // Tạo danh sách khung giờ từ 07:00 đến 22:00, mỗi 2 giờ
    const generateTimeSlots = (start, end, step) => {
        const slots = [];
        for (let hour = start; hour <= end; hour += step) {
            const formattedHour = hour.toString().padStart(2, "0") + ":00"; // Định dạng HH:00
            slots.push(formattedHour);
        }
        return slots;
    };

    const timeSlots = generateTimeSlots(7, 22, 2);

    return (

        <div className="container-fluid">
            <div className="row justify-content-center">
                <div className="col-3 p-4 shadow-lg "  style={{ height: "100vh", background: '#495e57' }}>
                    <div className="restaurant-image-container mb-3">
                        <img
                            src="https://neworienthoteldanang.com/wp-content/uploads/2024/06/z5496513588493_2736a1328dc694c6e6492e775f73da09.jpg"
                            alt="restaurant"
                            className="restaurant-image rounded-3"
                            style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }}
                        />
                    </div>
                    <form>
                        <h4 className="text-center mb-3 fw-bolder" style={{ color: '#f4ce14' }}>RESERVATION</h4>
                        <div className="form-group mb-3">
                            <label className="form-label fw-semibold text-white">Arrival Date</label>
                            <input type="date" className="form-control" placeholder="Arrival Date" />
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

                        <div className="mt-4 text-center">
                            <button type="submit" className="btn btn-primary w-75 py-2 shadow-sm text-dark fw-bolder" style={{ background: '#f4ce14' }}>
                                Search Availables
                            </button>
                        </div>
                    </form>
                </div>
                <div className='col-md-9'>
                    <div className='restaurant-details '>
                        <h1 className='restaurant-name mb-1'>Restaurant Name</h1>
                        <p className='restaurant-description mb-1'>Description</p>
                        <p className='restaurant-address-text mb-1'><FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger me-2" /> Address</p>
                    </div>
                    <div className="row">
                        <div className="col-md-3">
                            <TableCard />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailRestaurant;
