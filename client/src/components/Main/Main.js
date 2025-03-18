import { Routes, Route } from "react-router-dom";
import HomePage from "../../pages/HomePage";
import BookingPage from "../../pages/BookingPage";
import ConfirmedBookingPage from "../../pages/ConfirmedBookingPage";
import Login from "../authentication/Login/Login";
import RegisterPage from "../authentication/Register/Register";
import Admin from "../Admin/Admin";
import PersonalPage from "../Personal/Personal";
import RestaurantDetailPage from "../../pages/Restaurant/DetailRestaurantPage"; 
import TableDetailPage from "../../pages/Table/DetailPage";
const Main = () => {
  return (
    <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Route path="/" element={<HomePage />} />
      <Route path="/bookings" element={<BookingPage />} />
      <Route path="/confirmed" element={<ConfirmedBookingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/personal" element={<PersonalPage />} />
      <Route path="/restaurants/:id/detail" element={<RestaurantDetailPage />} />
      <Route path="/restaurants/:id/tables/:id/detail" element={<TableDetailPage />} />
    </Routes>
  );
};

export default Main;
