import { Routes, Route } from "react-router-dom";
import HomePage from "../../pages/HomePage";
import Login from "../authentication/Login/Login";
import RegisterPage from "../authentication/Register/Register";
import ForgotPassword from "../authentication/ForgotPassword/ForgotPassword";
import CheckPin from "../authentication/ForgotPassword/CheckPin";
import ResetPassword from "../authentication/ForgotPassword/ResetPassword";
import DashboardAdmin from "../../pages/Admin/Dashboard";
import PersonalPage from "../Personal/Personal";
import Restaurants from "../../pages/Restaurant/RestaurantPage";
import RestaurantDetailPage from "../../pages/Restaurant/Detail/DetailRestaurantPage";
import TableDetailPage from "../../pages/Table/DetailPage";
import OwnerControll from "../../pages/Owner/Owner";
import BookingHistory from "../BookingHistory/BookingHistory";
import RestaurantPage from "../../pages/Staff/Restaurant/Staff";
import Reservation from "../../pages/Staff/HistoryReservation/HistoryReservationPage";
import AccountList from "../../pages/Admin/AccountList";
import RestaurantList from "../../pages/Admin/Restaurants";
import Revenues from "../../pages/Admin/Revenues";
import Chat from "../Chat/Chat";
import RestaurantAdminDetail from "../Restaurants_Admin/Detail/DetailRestaurantPage";
import RestaurantOwnerDetail from "../Restaurants_Owner/Detail/DetailRestaurantPage";
import PrivateRoute from "./Permission/PrivateRoute";
import PublicRoute from "./Permission/PublicRoute";

const Main = () => {
  return (
    <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Route path="/" element={<HomePage />} />
      {/* Authentication */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-pin" element={<CheckPin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      {/* Admin */}
      <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        <Route path="/admin/accounts" element={<AccountList />} />
        <Route path="/admin/restaurants" element={<RestaurantList />} />
        <Route
          path="/admin/restaurants/:restaurant_id/detail"
          element={<RestaurantAdminDetail />}
        />
        <Route path="/admin/revenues" element={<Revenues />} />
      </Route>
      <Route
        element={
          <PrivateRoute
            allowedRoles={["admin", "customer", "staff", "owner"]}
          />
        }
      >
        <Route path="/personal" element={<PersonalPage />} />
      </Route>

      {/* Restaurant */}
      <Route path="/restaurants" element={<Restaurants />} />
      <Route
        path="/restaurants/:restaurant_id/detail"
        element={<RestaurantDetailPage />}
      />
      <Route element={<PrivateRoute allowedRoles={["customer", "staff"]} />}>
        <Route
          path="/restaurants/:restaurant_id/tables/:table_id/detail"
          element={<TableDetailPage />}
        />
      </Route>

      {/* Owner */}
      <Route element={<PrivateRoute allowedRoles={["owner"]} />}>
        <Route path="/owner" element={<OwnerControll />} />
        <Route
          path="/owner/restaurants/:restaurant_id/detail"
          element={<RestaurantOwnerDetail />}
        />
      </Route>
      {/* Staff */}
      <Route element={<PrivateRoute allowedRoles={["staff"]} />}>
        <Route path="/staff" element={<RestaurantPage />} />
        <Route path="/staff/booking-history" element={<Reservation />} />
      </Route>

      {/* websocket Chat */}
      <Route path="/chat" element={<Chat />} />
      <Route
        element={
          <PrivateRoute
            allowedRoles={["admin", "customer", "staff", "owner"]}
          />
        }
      >
        <Route path="/booking-history" element={<BookingHistory />} />
      </Route>
    </Routes>
  );
};

export default Main;
