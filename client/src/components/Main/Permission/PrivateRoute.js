// PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const PrivateRoute = ({ allowedRoles }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8080/me", { withCredentials: true })
      .then((res) => {
        setRole(res.data.user.Role);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Auth error:", err);
        setRole(null);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
