import { FaUtensils } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import TableList from "./Table/TableList";
import StaffList from "./Staff/StaffList";
import HistoryReservation from "./History/HistoryReservation"

const RestaurantPage = () => {
  const navigate = useNavigate();
  const { restaurant_id } = useParams();
  console.log("restaurant",restaurant_id);
  const [activeComponent, setActiveComponent] = useState(() => {
    return sessionStorage.getItem("activeComponent") || "Detail";
  });

  useEffect(() => {
    sessionStorage.setItem("activeComponent", activeComponent);
  }, [activeComponent]);

  const renderComponent = () => {
    switch (activeComponent) {
      case "TableList":
        return <TableList restaurant_id={restaurant_id} />;
      case "StaffList":
        return <StaffList restaurant_id={restaurant_id} />;
      case "Reservation":
        return <HistoryReservation restaurant_id={restaurant_id} />;
      default:
        return <TableList restaurant_id={restaurant_id} />
    }
  }; 

  return (
    <div className="row">
      <div className="col-2">
        <div className="bg-dark w-100 vh-100 d-flex flex-column justify-content-between align-items-center">
          <div className="text-center">
            <div className="d-flex justify-content-center align-items-center p-4">
              <FaUtensils className="nav-icon fs-1 col-1 text-white" />
              <span className="fw-bolder fs-3 col-9 d-flex justify-content-end text-white">TableBooker</span>
            </div>
            <button className="btn btn-danger w-75 fw-bolder fs-5 mb-3" onClick={() => setActiveComponent("TableList")}>Table list</button>
            <button className="btn btn-danger w-75 fw-bolder fs-5 mb-3" onClick={() => setActiveComponent("StaffList")}>Staff list</button>
            <button className="btn btn-danger w-75 fw-bolder fs-5" onClick={() => setActiveComponent("Reservation")}>History reservation</button>
          </div>
          <button className="btn btn-outline-danger w-75 fw-bolder fs-5 my-4" onClick={() => { navigate(-1) }}><FaArrowLeft /> Back</button>
        </div>
      </div>
      <div className="col-10">
        {renderComponent()}
      </div>
    </div>
  );
};

export default RestaurantPage;
