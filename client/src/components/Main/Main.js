import { Routes, Route } from "react-router-dom";
import HomePage from "../../pages/HomePage";
import BookingPage from "../../pages/BookingPage";
import ConfirmedBookingPage from "../../pages/ConfirmedBookingPage";
import Login from "../authentication/Login/Login";
import RegisterPage from "../authentication/Register/Register";
import ForgotPassword from "../authentication/ForgotPassword/ForgotPassword";
import CheckPin from "../authentication/ForgotPassword/CheckPin";
import ResetPassword from "../authentication/ForgotPassword/ResetPassword";
import Admin from "../Admin/Admin";
import PersonalPage from "../Personal/Personal";
import Restaurants from "../../pages/Restaurant/RestaurantPage"
import RestaurantDetailPage from "../../pages/Restaurant/Detail/DetailRestaurantPage";
import TableDetailPage from "../../pages/Table/DetailPage";
import OwnerControll from "../../pages/Owner/Owner"
import RestaurantOwnerDetailPage from "../../components/Restaurants/Detail/DetailRestaurantPage"
import BookingHistory from "../BookingHistory/BookingHistory";
const Main = () => {
  return (
    <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Route path="/" element={<HomePage />} />
      <Route path="/bookings" element={<BookingPage />} />
      <Route path="/confirmed" element={<ConfirmedBookingPage />} />
      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-pin" element={<CheckPin />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/personal" element={<PersonalPage />} />

      {/* Restaurant */}
      <Route path="/restaurants" element={<Restaurants />} />
      <Route path="/restaurants/:restaurant_id/tables/:table_id/detail" element={<TableDetailPage />} />

      {/* Owner */}
      <Route path="/owner" element={<OwnerControll />} />
      <Route path="/owner/restaurants/:restaurant_id/detail" element={<RestaurantDetailPage />} />
      <Route path="/restaurants/:restaurant_id/detail" element={<RestaurantDetailPage />} />
      <Route path="/restaurants/:restaurant_id/tables/:table_id/detail" element={ <TableDetailPage />} />


      {/* Customer */}
      <Route path="/booking-history" element={<BookingHistory />} />
    </Routes>
  );
};

export default Main;
