import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PersonalPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/me`, { withCredentials: true })
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        toast.error("Failed to fetch user data.");
        console.log(err);
      });
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <ToastContainer />
      <h1>Personal Information</h1>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Name: {user.Name}</h5>
          <p className="card-text">Role: {user.Role}</p>
          {user.Role === "customer" && (
            <>
              <p className="card-text">Email: {user.Email}</p>
              <p className="card-text">Phone: {user.Phone}</p>
            </>
          )}
        </div>
      </div>

      <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
        Back to Home
      </button>
    </div>
  );
};

export default PersonalPage;
