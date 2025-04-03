import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { restaurants } from "../../data";
import HandleLogout from "../authentication/Logout/Logout";
import { REST_API_URL } from "../../data";
const Admin = () => {
  const [reservations] = useState([]);
  const [users, setUsers] = useState([]);
  //   const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // // Fetch reservations from the server
    // axios
    //   .get("/api/reservations")
    //   .then((response) => {
    //     setReservations(response.data);
    //   })
    //   .catch((error) => {
    //     console.error("There was an error fetching the reservations!", error);
    //     setReservations(null);
    //   });

    // Fetch users from the server
    axios
      .get(`${REST_API_URL}/user_list`)
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((error) => {
        console.error("There was an error fetching the users!", error);
        setUsers(null);
      });

    // Fetch restaurants owned by the admin
    // axios
    //   .get(`${REST_API_URL}/restaurants")
    //   .then((response) => {
    //     setRestaurants(response.data.restaurants);
    //   })
    //   .catch((error) => {
    //     console.error("There was an error fetching the restaurants!", error);
    //     setRestaurants(null);
    //   });
  }, []);

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/admin/restaurants/${restaurantId}`);
  };

  return (
    <div className="bg-secondary min-vh-100 d-flex py-5">
      <div className="container bg-dark text-white p-4 rounded">
        <div className="row">
          <div className="col">
            <h1 className="mb-4">Admin Page</h1>
          </div>
          <div className="col-auto">
            <button className="btn btn-danger" onClick={() => HandleLogout()}>
              Logout
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Home
            </button>
          </div>
        </div>
        <hr className="border-light"></hr>

        <h2 className="mb-3">Restaurants</h2>
        <div className="row">
          {restaurants ? (
            restaurants.length > 0 ? (
              restaurants.map((restaurant) => (
                <div className="col-md-4 mb-3" key={restaurant.id}>
                  <div
                    className="card bg-light text-dark"
                    onClick={() => handleRestaurantClick(restaurant.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="card-body">
                      <h5 className="card-title">{restaurant.name}</h5>
                      <p className="card-text">{restaurant.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No restaurants available</p>
            )
          ) : (
            <p>Error fetching restaurants</p>
          )}
        </div>

        <h2 className="mb-3">Users</h2>
        {users ? (
          users.length > 0 ? (
            <table className="table table-dark table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.Id}>
                    <td>{user.Id}</td>
                    <td>{user.Name}</td>
                    <td>{user.Email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No users available</p>
          )
        ) : (
          <p>Error fetching users</p>
        )}

        <h2 className="mb-3">Reservations</h2>
        {reservations ? (
          reservations.length > 0 ? (
            <table className="table table-dark table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Guests</th>
                  <th>Restaurant</th>
                  <th>Table ID</th>
                  <th>Arrival Time</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>{reservation.id}</td>
                    <td>{reservation.name}</td>
                    <td>{reservation.date}</td>
                    <td>{reservation.time}</td>
                    <td>{reservation.guests}</td>
                    <td>{reservation.restaurant}</td>
                    <td>{reservation.tableId}</td>
                    <td>{reservation.arrivalTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No reservations available</p>
          )
        ) : (
          <p>Error fetching reservations</p>
        )}
      </div>
    </div>
  );
};

export default Admin;
