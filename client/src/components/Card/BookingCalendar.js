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

    const openHour = extractHour(restaurant.Started); // ví dụ 17
    const closeHour = extractHour(restaurant.Ended); // ví dụ 6
    const slots = [];

    const formatSlot = (startHour, endHour) => {
      const start = convertTo12HourFormat(startHour);
      const end = convertTo12HourFormat(endHour);
      return `${start} - ${end}`;
    };

    if (openHour < closeHour) {
      // Nhà hàng mở và đóng trong cùng 1 ngày
      for (let hour = openHour; hour + 2 <= closeHour; hour += 2) {
        slots.push(formatSlot(hour, hour + 2));
      }
    } else {
      // Nhà hàng mở từ chiều hôm nay đến sáng hôm sau
      // Phần từ openHour đến 24h
      for (let hour = openHour; hour + 2 <= 24; hour += 2) {
        slots.push(formatSlot(hour, hour + 2));
      }

      // Phần từ 0h đến closeHour
      for (let hour = 0; hour + 2 <= closeHour; hour += 2) {
        slots.push(formatSlot(hour, hour + 2));
      }
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
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/me`, {
        withCredentials: true,
      });
      setUser(res.data?.user || null);
      if (!res.data?.user)
        console.warn("API không trả về thông tin user hợp lệ.");
    } catch (error) {
      setIsLoading(false);
      console.error("Lỗi khi lấy thông tin user:", error);
      setUser(null);
      return;
    }

    const book_date = `${currentYear}-${String(selectedMonth).padStart(
      2,
      "0"
    )}-${String(selectedDay).padStart(2, "0")}`;
    const price = 0.0;
    const formatTime = (hour) => String(hour).padStart(2, "0");

    const buildBooking = (isStaff = false) =>
      selectedSlots.map((slot) => {
        const [startLabel, endLabel] = slot.split(" - ");
        const startHour = parse12HourTo24(startLabel);
        const endHour = parse12HourTo24(endLabel);
        return {
          [`${isStaff ? "staff" : "customer"}_id`]: user?.Id,
          table_id: parseInt(table_id),
          book_date,
          time_start: `${formatTime(startHour)}:00`,
          time_end: `${formatTime(endHour)}:00`,
          actual_end: `${formatTime(endHour)}:00`,
          price,
          customer_email: isStaff ? customerEmail : user?.Email,
          status: isStaff ? 2 : 1,
          numberOfCustomer,
        };
      });

    if (user?.Role === "staff") {
      if (!customerEmail.trim() || !customerPhone.trim()) {
        return Swal.fire({
          title: "Thiếu thông tin",
          text: "Vui lòng nhập đầy đủ email và số điện thoại khách hàng.",
          icon: "warning",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
      if (!emailRegex.test(customerEmail)) {
        return Swal.fire({
          title: "Email không hợp lệ",
          text: "Vui lòng nhập đúng định dạng email.",
          icon: "warning",
        });
      }
      if (!phoneRegex.test(customerPhone)) {
        return Swal.fire({
          title: "Số điện thoại không hợp lệ",
          text: "Vui lòng nhập đúng định dạng số điện thoại Việt Nam.",
          icon: "warning",
        });
      }
    }

    const bookingData = buildBooking(false);
    const bookingStaffData = buildBooking(true);

    const sorted = [...bookingData].sort(
      (a, b) => parseInt(a.time_start) - parseInt(b.time_start)
    );
    bookingData[0].time_start = sorted[0].time_start;
    bookingData[0].time_end = sorted[sorted.length - 1].time_end;

    Swal.fire({
      title: "Xác nhận đặt bàn",
      html: `
      <hr>
      <div style="display: flex; text-align: left; padding: 20px">
        <div>
          ${[
            "User Name",
            "Email Address",
            "Phone Number",
            "Book Date",
            "Time Start",
            "Time End",
            "Time Duration",
            "Number of Seats",
            "Number of Customer",
          ]
            .map((label) => `<p><strong>${label} :</strong></p>`)
            .join("")}
        </div>
        <div style="margin-left: 10px;">
          <p>${user.Name}</p>
          <p>${user?.Role === "staff" ? customerEmail : user.Email}</p>
          <p>${user?.Role === "staff" ? customerPhone : user.Phone}</p>
          <p>${book_date}</p>
          <p>${bookingData[0].time_start}</p>
          <p>${bookingData[0].time_end}</p>
          <p>${selectedSlots.length * 2} Hours</p>
          <p>${table.seats}</p>
          <p>
            <input 
              id="numCustomerInput"
              type="number"
              min="${table.seats - 1}"
              max="${table.seats + 1}"
              value="${numberOfCustomer}"
              placeholder="Number of customers"
              style="width: 100%; padding: 3px; border: 1px solid #ccc; border-radius: 4px;"
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
      if (!result.isConfirmed) return;

      const input = document.getElementById("numCustomerInput");
      const newNum = parseInt(input?.value);
      const min = Math.max(1, table.seats - 1); // đảm bảo min luôn >= 1
      const max = table.seats + 1;

      if (isNaN(newNum) || newNum < min || newNum > max) {
        return Swal.fire({
          title: "Lỗi!",
          text: `Số lượng khách phải từ ${min} đến ${max}`,
          icon: "error",
        });
      }

      setNumberOfCustomer(newNum);
      bookingData[0].numberOfCustomer = newNum.toString();

      try {
        setIsLoading(true);
        const url =
          user.Role === "staff"
            ? `/staff/${restaurant_id}/bookings`
            : `/restaurants/${restaurant_id}/bookings`;
        const data =
          user.Role === "staff" ? bookingStaffData[0] : bookingData[0];

        await axios.post(`${process.env.REACT_APP_API_URL}${url}`, data, {
          withCredentials: true,
        });

        Swal.fire({
          title: "Thành công!",
          text: "Đặt bàn thành công!",
          icon: "success",
          confirmButtonText: "OK",
        });

        setSelectedSlots([]);
        setHasBooking(false);
        setSelectedDay(null);
      } catch (error) {
        Swal.fire({
          title: "Lỗi!",
          text: error.response?.data?.error || "Đặt bàn thất bại!",
          icon: "error",
        });
      } finally {
        setIsLoading(false);
      }
    });
  };

  const parse12HourTo24 = (label) => {
    let [hour, meridiem] = label.split(" ");
    hour = parseInt(hour);
    return meridiem === "PM" && hour !== 12
      ? hour + 12
      : meridiem === "AM" && hour === 12
      ? 0
      : hour;
  };

  const isSlotBooked = (timeSlot) => {
    const dayKey = `${selectedMonth}-${selectedDay}`;
    const bookedRanges = preBooked[dayKey] || [];

    const [startLabel, endLabel] = timeSlot.split(" - ");
    const startHour = parse12HourTo24(startLabel);
    const endHour = parse12HourTo24(endLabel);

    return bookedRanges.some(([bookedStart, bookedEnd]) => {
      return !(endHour <= bookedStart || startHour >= bookedEnd);
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
                        className={`btn ${buttonClass} fs-6 mx-2 mb-2`}
                        style={{ width: "175px", height: "40px" }}
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
