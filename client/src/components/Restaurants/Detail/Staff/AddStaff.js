import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FaPen, FaStoreSlash } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import TableCard from "../../../Card/TableCard";
// import "./Tablelist.styles.css";

const TableRestaurant = ({ restaurant_id }) => {
  const [tables, setTables] = useState([]);
  const [restaurant, setRestaurant] = useState({});
  const [formData, setFormData] = useState({});
  const modalRef = useRef(null);

  useEffect(() => {
    axios.get(`http://localhost:8080/owners/:owner_id/restaurants/${restaurant_id}/tables`, { withCredentials: true })
      .then((res) => setTables(res.data.tables || []))
      .catch(() => toast.error("Error fetching table list!"));
  }, [restaurant_id]);

  useEffect(() => {
    axios.get(`http://localhost:8080/owners/:owner_id/restaurants/${restaurant_id}`, { withCredentials: true })
      .then((res) => {
        setRestaurant(res.data.restaurant || {});
        setFormData(res.data.restaurant || {});
      })
      .catch(() => toast.error("Error fetching restaurant!"));
  }, [restaurant_id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:8080/owners/:owner_id/restaurants/${restaurant_id}`, formData, { withCredentials: true })
      .then(() => {
        setRestaurant(formData);
        toast.success("Restaurant updated successfully!");
      })
      .catch(() => toast.error("Error updating restaurant!"));
  };

  return (
    <div className="container-fluid row align-items-center">
      <div className="col-9">
        <div className="p-4">
          <div className="restaurant-details">
            <h1 className="restaurant-name text-dark mb-2">{restaurant.Name}</h1>
            <p className="restaurant-description text-muted">{restaurant.Description}</p>
            <p className="restaurant-address-text">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger me-2" />
              <span className="text-dark">{restaurant.Location}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="col-3 text-end pe-5">
        <button className="btn btn-outline-primary me-3" data-bs-toggle="modal" data-bs-target="#editRestaurantModal"><FaPen /></button>
        <button className="btn btn-outline-danger"><FaStoreSlash /></button>
      </div>
      <div className="row mt-4">
        {tables.length > 0 ? tables.map((table) => (
          <div className="col-md-4 mb-3" key={table.id}><TableCard restaurant_id={restaurant_id} table={table} /></div>
        )) : (<p className="text-center text-muted">No tables available.</p>)}
      </div>

      {/* Modal chỉnh sửa nhà hàng */}
      <div ref={modalRef} className="modal fade" id="editRestaurantModal" tabIndex="-1" aria-labelledby="editRestaurantModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow-lg border-0">
            <div className="modal-header bg-dark text-white rounded-top-4">
              <h4 className="modal-title fw-bold" id="editRestaurantModalLabel">Edit Restaurant</h4>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4 bg-white">
                <div className="form-group mb-3">
                  <label className="form-label fw-bold text-dark">Name</label>
                  <input type="text" name="Name" className="form-control border-secondary rounded-3" value={formData.Name} onChange={handleChange} />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label fw-bold text-dark">Description</label>
                  <input type="text" name="Description" className="form-control border-secondary rounded-3" value={formData.Description} onChange={handleChange} />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label fw-bold text-dark">Location</label>
                  <input type="text" name="Location" className="form-control border-secondary rounded-3" value={formData.Location} onChange={handleChange} />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label fw-bold text-dark">Opening Time</label>
                  <input type="time" name="Started" className="form-control border-secondary rounded-3" value={formData.Started} onChange={handleChange} />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label fw-bold text-dark">Closing Time</label>
                  <input type="time" name="Ended" className="form-control border-secondary rounded-3" value={formData.Ended} onChange={handleChange} />
                </div>
              </div>
              <div className="modal-footer bg-light rounded-bottom-4 d-flex justify-content-between">
                <button type="button" className="btn btn-outline-dark fw-bold px-4" data-bs-dismiss="modal">Close</button>
                <button type="submit" className="btn btn-danger fw-bold px-4">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableRestaurant;
