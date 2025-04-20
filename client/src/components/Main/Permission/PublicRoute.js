// PublicRoute.jsx
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

const PublicRoute = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8080/me", { withCredentials: true })
      .then((res) => {
        setRole(res.data.user.Role);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false); // not logged in
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  if (role) {
    // Chuyển hướng theo Role
    switch (role.toLowerCase()) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "staff":
        return <Navigate to="/staff" replace />;
      case "owner":
        return <Navigate to="/owner" replace />;
      case "customer":
        return <Navigate to="/" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default PublicRoute;
