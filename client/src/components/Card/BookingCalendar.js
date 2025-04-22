import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
const BookingCalendar = ({ table, restaurant }) => {
  const [isLoading, setIsLoading] = useState(false);
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
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [numberOfCustomer, setNumberOfCustomer] = useState(table.seats);
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
  const convertTo12HourFormat = (hour) => {
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:00 ${period}`;
  };

  const getStartHourIn24Format = (timeSlot) => {
    const [start, meridiem] = timeSlot.split(" - ")[0].split(" ");
    let hour = parseInt(start);
    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
    return hour;
  };

  const extractHour = (timeStr) => {
    const [hourStr] = timeStr.split(":");
    return parseInt(hourStr, 10);
  };

  const generateTimeSlots = () => {
    if (!restaurant?.Started || !restaurant?.Ended) return [];

    const openHour = extractHour(restaurant.Started);
    const closeHour = extractHour(restaurant.Ended);
    const slots = [];

    for (let hour = openHour; hour + 2 <= closeHour; hour += 2) {
      const start = convertTo12HourFormat(hour);
      const end = convertTo12HourFormat(hour + 2);
      slots.push(`${start} - ${end}`);
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Fetch thông tin user
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/me`, { withCredentials: true })
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
    {
      console.log("restaurant id", restaurant.id);
    }

    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/restaurants/${restaurant_id}/tables/${table_id}/booked-times`,
          {
            params: {
              book_date: `${currentYear}-${selectedMonth}-${selectedDay}`,
            },
          }
        );

        const reservations = response.data.reservations || [];
        // Lọc chỉ lấy những reservation có status khác 0
        const validReservations = reservations.filter(
          (reservation) => reservation.status !== "0"
        );
        // Chuyển đổi mỗi reservation thành dạng "HH:MM - HH:MM"
        const format24To12 = (timeStr) => {
          const [hour, minute] = timeStr.split(":").map(Number);
          console.log("minute", minute);
          const period = hour >= 12 ? "PM" : "AM";
          const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
          return `${formattedHour}:00 ${period}`;
        };

        const formattedBookings = validReservations.map((reservation) => {
          const startLabel = format24To12(reservation.time_start.slice(0, 5));
          const endLabel = format24To12(reservation.time_end.slice(0, 5));
          return `${startLabel} - ${endLabel}`;
        });
        // Lưu kết quả cho ngày được chọn
        setPreBooked((prev) => ({
          ...prev,
          [`${selectedMonth}-${selectedDay}`]: formattedBookings,
        }));
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

      if (isAlreadySelected) {
        const updated = prevSelected.filter((slot) => slot !== timeSlot);
        setHasBooking(updated.length > 0);
        return updated;
      }

      if (prevSelected.length === 0) {
        setHasBooking(true);
        return [timeSlot];
      }

      // Nếu có slot đang chọn rồi, chỉ cho chọn thêm nếu liền kề
      const getStartHour = (slot) => getStartHourIn24Format(slot);
      const getEndHour = (slot) => getStartHour(slot) + 2;

      const sorted = [...prevSelected].sort(
        (a, b) => getStartHour(a) - getStartHour(b)
      );
      const earliest = sorted[0];
      const latest = sorted[sorted.length - 1];

      const newStart = getStartHour(timeSlot);
      const newEnd = newStart + 2;

      const canAdd =
        newStart === getEndHour(latest) || newEnd === getStartHour(earliest);
      if (canAdd) {
        const updated = [...prevSelected, timeSlot];
        setHasBooking(true);
        return updated;
      }

      // Không cho chọn nếu không liền kề
      return prevSelected;
    });
  };

  // Hàm xác nhận đặt bàn

  const ConfirmBooking = async () => {
    if (!selectedDay || !hasBooking) return;

    try {
      // Cập nhật thông tin user
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/me`, {
        withCredentials: true,
      });
      if (res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        console.warn("API không trả về thông tin user hợp lệ.");
        setUser(null);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Lỗi khi lấy thông tin user:", error);
      setUser(null);
    }

    const formattedMonth = String(selectedMonth).padStart(2, "0");
    const formattedDay = String(selectedDay).padStart(2, "0");
    const book_date = `${currentYear}-${formattedMonth}-${formattedDay}`;

    const price = 0.0;
    const status = 1;
    const formatTime = (hour) => String(hour).padStart(2, "0");
    // Tạo dữ liệu đặt bàn từ các khung giờ được chọn
    const parse12HourTo24 = (timeLabel) => {
      const [hourStr, meridiem] = timeLabel.split(" ");
      let hour = parseInt(hourStr);
      if (meridiem === "PM" && hour !== 12) hour += 12;
      if (meridiem === "AM" && hour === 12) hour = 0;
      return hour;
    };

    const bookingData = selectedSlots.map((timeSlot) => {
      const [startLabel, endLabel] = timeSlot.split(" - ");
      const startHour = parse12HourTo24(startLabel);
      const endHour = parse12HourTo24(endLabel);
      return {
        customer_id: user?.Id,
        table_id: parseInt(table_id),
        book_date,
        time_start: `${formatTime(startHour)}:00`,
        time_end: `${formatTime(endHour)}:00`,
        actual_end: `${formatTime(endHour)}:00`,
        price,
        customer_email: user?.Email,
        status,
        numberOfCustomer: numberOfCustomer,
      };
    });

    const bookingStaffData = selectedSlots.map((timeSlot) => {
      const [startLabel, endLabel] = timeSlot.split(" - ");
      const startHour = parse12HourTo24(startLabel);
      const endHour = parse12HourTo24(endLabel);
      return {
        staff_id: user?.Id,
        table_id: parseInt(table_id),
        numberOfCustomer,
        book_date,
        time_start: `${formatTime(startHour)}:00`,
        time_end: `${formatTime(endHour)}:00`,
        actual_end: `${formatTime(endHour)}:00`,
        price,
        customer_email: user?.Role === "staff" ? customerEmail : user?.Email,
        status,
      };
    });

    if (user?.Role === "staff") {
      if (!customerEmail.trim()) {
        Swal.fire({
          title: "Thiếu email khách hàng",
          text: "Vui lòng nhập email khách hàng để đặt bàn.",
          icon: "warning",
        });
        return;
      }

      if (!customerPhone.trim()) {
        Swal.fire({
          title: "Thiếu số điện thoại khách hàng",
          text: "Vui lòng nhập số điện thoại khách hàng để đặt bàn.",
          icon: "warning",
        });
        return;
      }

      // Có thể check định dạng email hoặc số điện thoại nếu muốn kỹ hơn:
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        Swal.fire({
          title: "Email không hợp lệ",
          text: "Vui lòng nhập đúng định dạng email.",
          icon: "warning",
        });
        return;
      }

      const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
      if (!phoneRegex.test(customerPhone)) {
        Swal.fire({
          title: "Số điện thoại không hợp lệ",
          text: "Vui lòng nhập đúng định dạng số điện thoại Việt Nam.",
          icon: "warning",
        });
        return;
      }
    }

    const sortedBookings = [...bookingData].sort(
      (a, b) => parseInt(a.time_start) - parseInt(b.time_start)
    );
    const firstSlot = sortedBookings[0];
    const lastSlot = sortedBookings[sortedBookings.length - 1];

    bookingData[0].time_start = firstSlot.time_start;
    bookingData[0].time_end = lastSlot.time_end;

    // Hiển thị hộp thoại xác nhận trước khi gửi request
    Swal.fire({
      title: "Xác nhận đặt bàn",
      html: `
      <hr>
        <div style="display: flex; justify-content: space-between; text-align: left; gap: 10px; padding: 20px">
          <div>
            <p><strong>User Name :</strong> </p>
            <p><strong>Email Address :</strong> </p>
            <p><strong>Phone Number :</strong> </p>
            <p><strong>Book Date :</strong> </p>
            <p><strong>Time Start :</strong> </p>
            <p><strong>Time End :</strong> </p>
            <p><strong>Time Duration :</strong> </p>
            <p><strong>Number of Seats :</strong> </p>
            <p><strong>Number of Customer :</strong> </p>
          </div>
          <div>
            <p>${user.Name}</p>
            <p>${user?.Role === "staff" ? customerEmail : user.Email}</p>
            <p>${user?.Role === "staff" ? customerPhone : user.Phone}</p>
            <p>${book_date}</p>
            <p>${firstSlot.time_start}</p>
            <p>${lastSlot.time_end}</p>
            <p>${selectedSlots.length * 2 + " Hours"}</p>
            <p>${numberOfCustomer}</p>
            <p>${bookingData[0].time_start}</p>
            <p>${bookingData[0].time_end}</p>
            <p>${table.seats}</p>
            <p>
              <input 
                id="numCustomerInput"
                type="number"
                min="${table.seats - 1}"
                max="${table.seats + 1}"
                value="${numberOfCustomer}"
                placeholder="${table.seats}"
                style="width: 60px; padding: 3px; border: 1px solid #ccc; border-radius: 4px;"
              />
            </p>
          </div>
        </div>
        <hr>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const numInput = document.getElementById("numCustomerInput");
        try {
          const newNum = parseInt(numInput?.value);

          const min = table.seats - 1;
          const max = table.seats + 1;

          if (isNaN(newNum) || newNum < min || newNum > max) {
            return Swal.fire({
              title: "Lỗi!",
              text: `Số lượng khách phải từ ${min} đến ${max}`,
              icon: "error",
            });
          }

          setNumberOfCustomer(newNum); // cập nhật state nếu bạn cần

          bookingData[0].numberOfCustomer = newNum.toString();

          // Gửi request đặt bàn
          setIsLoading(true);
          user.Role === "staff"
            ? await axios.post(
                `${process.env.REACT_APP_API_URL}/staff/${restaurant_id}/bookings`,
                bookingStaffData[0],
                { withCredentials: true }
              )
            : await axios.post(
                `${process.env.REACT_APP_API_URL}/restaurants/${restaurant_id}/bookings`,
                bookingData[0],
                { withCredentials: true }
              );
          // Hiển thị thông báo thành công
          setIsLoading(false);
          Swal.fire({
            title: "Thành công!",
            text: "Đặt bàn thành công!",
            icon: "success",
            confirmButtonText: "OK",
          });

          // Reset các state sau khi đặt bàn
          setSelectedSlots([]);
          setHasBooking(false);
          setSelectedDay(null);
        } catch (error) {
          setIsLoading(false);
          Swal.fire({
            title: "Lỗi!",
            text: error.response?.data?.error || "Đặt bàn thất bại!",
            icon: "error",
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  return (
    <div>
      <div className="row bg-white m-2 rounded text-dark">
        {isLoading && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 9999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {/* Danh sách tháng */}
        <div className="col-md-1 border-end" style={{ height: "100vh" }}>
          <div className="mt-4">
            <h5 className="text-center fw-bold">Month</h5>
            <div className="d-grid gap-2 mt-2">
              {months.map((month) => (
                <button
                  key={month}
                  className={`btn btn-sm fw-bold ${
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
            <h5 className="text-center fw-bold">Date</h5>
            <hr />
            <div className="d-flex flex-wrap justify-content-center mt-2 w-100 shadow py-4 rounded">
              {days.map((day) => (
                <button
                  key={day}
                  className={`border d-flex justify-content-center align-items-center fs-6 ${
                    selectedDay === day ? "bg-success text-white" : "bg-light"
                  }`}
                  style={{ width: "40px", height: "40px" }}
                  onClick={() => setSelectedDay(day)}
                  disabled={selectedMonth === currentMonth && day < currentDay} // Không cho chọn ngày trước
                >
                  {day}
                </button>
              ))}
            </div>
            {/* Danh sách khung giờ */}
            {selectedDay && (
              <div className="p-4 mt-5">
                <h5 className="text-center fw-bold">
                  Chọn khung giờ cho ngày {selectedDay}/{selectedMonth}
                </h5>
                <hr />

                <div className="d-flex flex-wrap justify-content-center mt-2 p-5 rounded shadow">
                  {timeSlots.map((timeSlot) => {
                    const startHour = getStartHourIn24Format(timeSlot);
                    const isPastTime =
                      selectedMonth === currentMonth &&
                      selectedDay === currentDay &&
                      startHour <= currentHour;

                    const dayKey = `${selectedMonth}-${selectedDay}`;
                    const preBookedForDay = preBooked[dayKey] || [];
                    const isPreBooked = preBookedForDay.includes(timeSlot);
                    const isSelected = selectedSlots.includes(timeSlot);

                    const buttonClass = `border ${
                      isPreBooked
                        ? "bg-secondary text-white" // Đã đặt từ backend
                        : isSelected
                        ? "bg-danger text-white" // Đang được chọn
                        : "bg-white"
                    }`;

                    return (
                      <button
                        key={timeSlot}
                        className={buttonClass + " fs-6"}
                        style={{ width: "120px", height: "40px" }}
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
                {user?.Role === "staff" && (
                  <div>
                    <div className="text-center mt-4">
                      <label
                        htmlFor="customerEmail"
                        className="form-label fw-bold"
                      >
                        Nhập email khách hàng:
                      </label>
                      <input
                        type="email"
                        id="customerEmail"
                        className="form-control w-50 mx-auto"
                        placeholder="customer@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="text-center my-4">
                      <label
                        htmlFor="customerPhone"
                        className="form-label fw-bold"
                      >
                        Nhập số điện thoại khách hàng:
                      </label>
                      <input
                        type="tel"
                        id="customerPhone"
                        className="form-control w-50 mx-auto"
                        placeholder="09********"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={ConfirmBooking}
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
