import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Personal = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8080/me", { withCredentials: true })
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.log("Error fetching user data", err);
      });
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Personal Information</h1>
      {user ? (
        <div className="card p-4 shadow">
          <p>
            <strong>Name:</strong> {user.Name}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          {user.role === "customer" && (
            <>
              <p>
                <strong>Email:</strong> {user.Email}
              </p>
              <p>
                <strong>Phone:</strong> {user.Phone}
              </p>
              <p>
                <strong>Other ID:</strong> {user.orther_id}
              </p>
              <a href="/reset-password" className="btn btn-primary mt-3">
                Reset Password
              </a>
            </>
          )}
          {user.role === "owner" && (
            <>
              <p>
                <strong>Email:</strong> {user.Email}
              </p>
              <p>
                <strong>Phone:</strong> {user.Phone}
              </p>
              <p>
                <strong>Other ID:</strong> {user.orther_id}
              </p>
              <p className="text-muted">Owner-specific information here</p>
            </>
          )}
          {user.role === "staff" && (
            <>
              <p>
                <strong>Email:</strong> {user.Email}
              </p>
              <p>
                <strong>Phone:</strong> {user.Phone}
              </p>
              <p>
                <strong>Other ID:</strong> {user.orther_id}
              </p>
              <p className="text-muted">Staff-specific information here</p>
            </>
          )}
          {user.role === "admin" && (
            <>
              <p>
                <strong>Email:</strong> {user.Email}
              </p>
              <p>
                <strong>Phone:</strong> {user.Phone}
              </p>
              <p>
                <strong>Other ID:</strong> {user.orther_id}
              </p>
              <p className="text-muted">Admin-specific information here</p>
            </>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-danger">Chưa đăng nhập</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
};

export default Personal;
