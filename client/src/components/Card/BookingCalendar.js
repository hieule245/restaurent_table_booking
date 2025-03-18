import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const BookingCalendar = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const currentHour = today.getHours();

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedDay, setSelectedDay] = useState(null);
    const [bookings, setBookings] = useState({});

    const getDaysInMonth = (month) => new Date(currentYear, month, 0).getDate();
    const days = Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => i + 1);

    const timeSlots = Array.from({ length: 15 }, (_, i) => {
        const startHour = i + 7;
        return `${startHour}:00 - ${startHour + 2}:00`;
    });

    const toggleBooking = (timeSlot) => {
        if (!selectedDay) return;

        const key = `${selectedMonth}-${selectedDay}`;
        setBookings((prev) => ({
            ...prev,
            [key]: prev[key]?.includes(timeSlot)
                ? prev[key].filter((t) => t !== timeSlot)
                : [...(prev[key] || []), timeSlot],
        }));
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
                                    className={`btn btn-sm ${selectedMonth === month ? "btn-primary" : "btn-outline-secondary"}`}
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
                                    className={`btn btn-sm ${selectedDay === day ? "btn-success text-white" : "btn-outline-secondary"}`}
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

                                        return (
                                            <button
                                                key={timeSlot}
                                                className={`btn btn-sm ${bookings[`${selectedMonth}-${selectedDay}`]?.includes(timeSlot)
                                                    ? "btn-danger text-white"
                                                    : "btn-outline-secondary"
                                                    }`}
                                                onClick={() => toggleBooking(timeSlot)}
                                                disabled={isPastTime} // Không cho chọn giờ đã qua
                                            >
                                                {timeSlot}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingCalendar;
