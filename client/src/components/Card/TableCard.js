import { useState } from "react";
import "./TableCard.styles.css"; // Import CSS riêng
import axios from "axios";
const TableCard = ({ restaurant_id, table, onUpdate }) => {
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState({
        name: table.name || "",
        seats: table.seats || "",
        type: table.type || "",
        Description: table.Description || ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === "seats" ? Number(value) : value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirmModal(true); // Hiện modal xác nhận thay đổi
    };

    const confirmSave = async () => {
        try {
            const response = await axios.put(
                `http://localhost:8080/owners/:owner_id/restaurants/${restaurant_id}/tables/${table.id}`,
                formData, { withCredentials: true }
            );
            console.log("Table updated:", response.data);
            setShowConfirmModal(false);
            setShowModal(false); // Đóng cả hai modal sau khi cập nhật thành công
            if (onUpdate) {
                onUpdate(); // Gọi callback cập nhật danh sách bàn
            }
        } catch (error) {
            console.error("Error updating table:", error.response?.data || error.message);
        }
    };

    const confirmDelete = async () => {
        try {
            const response = await axios.delete(
                `http://localhost:8080/owners/:owner_id/restaurants/${restaurant_id}/tables/${table.id}`,
                { withCredentials: true }
            );
            setShowConfirmModal(false);
            setShowModal(false); // Đóng cả hai modal sau khi cập nhật thành công
            if (onUpdate) {
                onUpdate(); // Gọi callback cập nhật danh sách bàn
            }
        } catch (error) {
            console.error("Error updating table:", error.response?.data || error.message);
        }
    };

    return (
        <>
            <div className="card table-card" onClick={() => setShowModal(true)}>
                <div className="position-relative">
                    <img
                        src="https://images.squarespace-cdn.com/content/v1/5e1b73fb6eeb973ee1becfc4/1592675020070-2CPPWG2J34ZWURFKJC6P/custom-restaurant-tables-david-stine+4.jpg"
                        alt={table.name || "Table"}
                    />
                </div>
                <div className="card-body table-card-body">
                    <h5>{table.name || "Table Name"}</h5>
                    <div className="d-flex justify-content-around align-items-center">
                        <p className="text-muted">🪑 Seats: <span className="fw-semibold">{table.seats || "N/A"}</span></p>
                        <p className="text-muted">Type: <span className="fw-semibold">{table.type}</span></p>
                    </div>
                    <p className="small">✨ {table.Description || "No description available"}</p>
                </div>
            </div>
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 shadow-lg border-0">
                            <div className="modal-header bg-dark text-white rounded-top-4">
                                <h4 className="modal-title fw-bold">Edit Table</h4>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4 bg-white">
                                    <div className="form-group mb-3">
                                        <label className="form-label fw-bold text-dark">Table Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control border-secondary rounded-3"
                                            placeholder="Table Name"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="form-label fw-bold text-dark">Seats</label>
                                        <input
                                            type="number"
                                            name="seats"
                                            className="form-control border-secondary rounded-3"
                                            placeholder="Number of Seats"
                                            value={formData.seats}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="form-label fw-bold text-dark">Type</label>
                                        <input
                                            type="text"
                                            name="type"
                                            className="form-control border-secondary rounded-3"
                                            placeholder="Table Name"
                                            value={formData.type}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="form-label fw-bold text-dark">Description</label>
                                        <textarea
                                            name="Description"
                                            className="form-control border-secondary rounded-3"
                                            placeholder="Description"
                                            value={formData.Description}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light rounded-bottom-4 d-flex justify-content-between">
                                    <button type="button" class="btn btn-outline-dark fw-bold px-4" onClick={confirmDelete}>
                                        Delete
                                    </button>
                                    <button type="submit" className="btn btn-danger fw-bold px-4">
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Xác Nhận Lưu */}
            {showConfirmModal && (
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 shadow-lg border-0">
                            <div className="modal-header bg-warning text-dark rounded-top-4">
                                <h4 className="modal-title fw-bold">Confirm Changes</h4>
                                <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 bg-white">
                                <p>Are you sure you want to save these changes?</p>
                                <ul>
                                    <li><strong>Table Name:</strong> {formData.name}</li>
                                    <li><strong>Seats:</strong> {formData.seats}</li>
                                    <li><strong>Type:</strong> {formData.type}</li>
                                    <li><strong>Description:</strong> {formData.Description}</li>
                                </ul>
                            </div>
                            <div className="modal-footer bg-light rounded-bottom-4 d-flex justify-content-between">
                                <button type="button" className="btn btn-outline-dark fw-bold px-4" onClick={() => setShowConfirmModal(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-success fw-bold px-4" onClick={confirmSave}>
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TableCard;
