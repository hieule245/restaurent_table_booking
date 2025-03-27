import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useParams } from "react-router-dom";

const BookingCalendar = ({ table }) => {
  // Lấy thông tin thời gian hiện tại
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const currentHour = today.getHours();

  // State cho user, preBooked và selectedSlots
  const [user, setUser] = useState(null);
  const [preBooked, setPreBooked] = useState({}); // { "month-day": [timeSlot, ...] }
  const [selectedSlots, setSelectedSlots] = useState([]); // Các khung giờ đang chọn cho ngày hiện tại
  const [hasBooking, setHasBooking] = useState(false);

  // Lấy tham số từ URL
  const { table_id, restaurant_id } = useParams();

  // Khởi tạo state cho tháng và ngày được chọn
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDay, setSelectedDay] = useState(null);

  // Tính số ngày trong tháng đã chọn
  const getDaysInMonth = (month) => new Date(currentYear, month, 0).getDate();
  const days = Array.from(
    { length: getDaysInMonth(selectedMonth) },
    (_, i) => i + 1
  );

  // Tạo danh sách các khung giờ, từ 7:00 đến 21:00 (15 khung giờ, mỗi khung 2 tiếng)
  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const startHour = i + 7;
    return `${startHour}:00 - ${startHour + 2}:00`;
  });

  // Fetch thông tin user
  useEffect(() => {
    axios
      .get("http://localhost:8080/me", { withCredentials: true })
      .then((res) => {
        if (res.data && res.data.user) {
          setUser(res.data.user);
        } else {
          console.warn("API không trả về thông tin user hợp lệ.");
          setUser(null);
        }
      })
      .catch((error) => {
        console.error("Lỗi khi lấy thông tin user:", error);
        setUser(null);
      });
  }, []);

  // Fetch các khung giờ đã đặt từ backend cho ngày được chọn
  useEffect(() => {
    if (!selectedDay) return;

    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/restaurants/${restaurant_id}/tables/${table_id}/booked-times`,
          {
            params: {
              book_date: `${currentYear}-${selectedMonth}-${selectedDay}`,
            },
          }
        );

        const reservations = response.data.reservations || [];
        // Chuyển đổi mỗi reservation thành dạng "HH:MM - HH:MM"
        const formattedBookings = reservations.map((reservation) => {
          const startHour = reservation.time_start.slice(0, 5); // "10:00"
          const endHour = reservation.time_end.slice(0, 5); // "12:00"
          return `${startHour} - ${endHour}`;
        });

        // Lưu kết quả cho ngày được chọn
        setPreBooked({
          [`${selectedMonth}-${selectedDay}`]: formattedBookings,
        });
      } catch (error) {
        console.error("Lỗi khi lấy booking times:", error);
      }
    };

    fetchBookings();
    // Reset selectedSlots khi ngày hoặc tháng thay đổi
    setSelectedSlots([]);
    setHasBooking(false);
  }, [selectedDay, selectedMonth, restaurant_id, table_id, currentYear]);

  // Hàm toggle lựa chọn khung giờ (chỉ cập nhật selectedSlots)
  const toggleBooking = (timeSlot) => {
    if (!selectedDay) return;
    // Nếu khung giờ đã được đặt từ backend thì không cho chọn
    const dayKey = `${selectedMonth}-${selectedDay}`;
    if (preBooked[dayKey]?.includes(timeSlot)) return;

    setSelectedSlots((prevSelected) => {
      const isAlreadySelected = prevSelected.includes(timeSlot);
      const updatedSelected = isAlreadySelected
        ? prevSelected.filter((slot) => slot !== timeSlot)
        : [...prevSelected, timeSlot];

      setHasBooking(updatedSelected.length > 0);
      return updatedSelected;
    });
  };

  // Hàm xác nhận đặt bàn
  const confirmBooking = async () => {
    if (!selectedDay || !hasBooking) return;

    try {
      // Cập nhật thông tin user
      const res = await axios.get("http://localhost:8080/me", {
        withCredentials: true,
      });
      if (res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        console.warn("API không trả về thông tin user hợp lệ.");
        setUser(null);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user:", error);
      setUser(null);
    }
    console.log("User", user);

    const formattedMonth = String(selectedMonth).padStart(2, "0");
    const formattedDay = String(selectedDay).padStart(2, "0");
    const book_date = `${currentYear}-${formattedMonth}-${formattedDay}`;

    const numberOfCustomer = "4"; // Hoặc lấy từ input người dùng
    const price = 0.0;
    const status = 1;
    const formatTime = (hour) => String(hour).padStart(2, "0");

    // Tạo dữ liệu đặt bàn từ các khung giờ được chọn
    const bookingData = selectedSlots.map((timeSlot) => {
      const [startHour] = timeSlot.split(":");
      const formattedStartHour = formatTime(startHour);
      const formattedEndHour = formatTime(parseInt(startHour) + 2);
      return {
        customer_id: user?.Id,
        table_id: parseInt(table_id),
        numberOfCustomer,
        book_date,
        time_start: `${formattedStartHour}:00:00`,
        time_end: `${formattedEndHour}:00:00`,
        actual_end: `${formattedEndHour}:00:00`,
        price,
        customer_email: user?.Email,
        status,
      };
    });
    console.log("Booking data", bookingData);

    try {
      // Giả sử chỉ đặt một khung giờ, bạn có thể điều chỉnh nếu đặt nhiều giờ cùng lúc
      await axios.post(
        `http://localhost:8080/restaurants/${restaurant_id}/bookings`,
        bookingData[0]
      );
      alert("Đặt bàn thành công!");
      // Reset các state sau khi đặt bàn
      setSelectedSlots([]);
      setHasBooking(false);
      setSelectedDay(null);
    } catch (error) {
      alert("Đặt bàn thất bại: " + error.response.data.error);
    }
  };

  return (
    <div>
      <div className="row">
        {/* Danh sách tháng */}
        <div className="col-md-1 border-end" style={{ height: "100vh" }}>
          <div className="mt-4">
            <h5 className="text-center fw-bold">Tháng</h5>
            <div className="d-grid gap-2 mt-2">
              {months.map((month) => (
                <button
                  key={month}
                  className={`btn btn-sm ${
                    selectedMonth === month
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setSelectedMonth(month)}
                  disabled={month < currentMonth} // Không cho chọn tháng trước
                >
                  Tháng {month}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Danh sách ngày */}
        <div className="col-md-10">
          <div className="mt-4">
            <h5 className="text-center fw-bold">Ngày</h5>
            <div className="d-flex flex-wrap gap-2 justify-content-center mt-2 w-100">
              {days.map((day) => (
                <button
                  key={day}
                  className={`btn btn-sm ${
                    selectedDay === day
                      ? "btn-success text-white"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setSelectedDay(day)}
                  disabled={selectedMonth === currentMonth && day < currentDay} // Không cho chọn ngày trước
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Danh sách khung giờ */}
            {selectedDay && (
              <div className="p-4">
                <h5 className="text-center fw-bold">
                  Chọn khung giờ cho ngày {selectedDay}/{selectedMonth}
                </h5>
                <div className="d-flex flex-wrap gap-2 justify-content-center mt-2">
                  {timeSlots.map((timeSlot) => {
                    const startHour = parseInt(timeSlot.split(":")[0]);
                    const isPastTime =
                      selectedMonth === currentMonth &&
                      selectedDay === currentDay &&
                      startHour <= currentHour;

                    const dayKey = `${selectedMonth}-${selectedDay}`;
                    const preBookedForDay = preBooked[dayKey] || [];
                    const isPreBooked = preBookedForDay.includes(timeSlot);
                    const isSelected = selectedSlots.includes(timeSlot);

                    const buttonClass = `btn btn-sm ${
                      isPreBooked
                        ? "btn-secondary text-white" // Đã đặt từ backend
                        : isSelected
                        ? "btn-outline-danger bg-danger text-white" // Đang được chọn
                        : "btn-outline-secondary"
                    }`;

                    return (
                      <button
                        key={timeSlot}
                        className={buttonClass}
                        onClick={() => toggleBooking(timeSlot)}
                        disabled={isPastTime || isPreBooked}
                      >
                        {timeSlot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nút xác nhận đặt bàn */}
            {hasBooking && (
              <div className="text-center mt-4">
                <button
                  onClick={confirmBooking}
                  className="btn btn-primary fw-bold"
                >
                  Xác nhận đặt bàn
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
