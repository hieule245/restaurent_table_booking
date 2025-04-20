import React, { useState } from "react";
import EditTableModal from "./EditTableModal.js";
import DeleteConfirmationModal from "./DeleteConfirmationModal.js";
import SaveConfirmationModal from "./SaveConfirmationModal.js";
import "../TableCard.styles.css";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { tableSchema } from "../../../validations/TableSchema";

const TableCard = ({ restaurant_id, table, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    name: table.name || "",
    seats: table.seats || "",
    type: table.type || "",
    Description: table.Description || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = name === "seats" ? Number(value) : value;

    setFormData((prev) => ({ ...prev, [name]: updatedValue }));

    // Xóa lỗi cho field này nếu đã sửa
    if (validationErrors[name]) {
      setValidationErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await tableSchema.validate(formData, { abortEarly: false });
      setValidationErrors({});
      setShowModal(false);
      setShowConfirmModal(true); // chỉ mở khi hợp lệ
    } catch (err) {
      if (err.name === "ValidationError") {
        const errors = {};
        err.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        setValidationErrors(errors);
      }
    }
  };
  

  return (
    <>
      <ToastContainer />
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
        <EditTableModal
          formData={formData}
          handleChange={handleChange}
          setShowModal={setShowModal}
          setShowDeleteConfirm={setShowDeleteConfirm}
          setShowConfirmModal={setShowConfirmModal}
          validationErrors={validationErrors}
          onSubmit={handleSubmit}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmationModal
          link={`http://localhost:8080/admin/restaurants/${restaurant_id}/tables/${table.id}`}
          tableName={table.name}
          setShowDeleteConfirm={setShowDeleteConfirm}
          onDelete={() => {
            setShowDeleteConfirm(false);
            toast.success("Table deleted successfully");
            onUpdate();
          }}
        />
      )}

      {showConfirmModal && (
        <SaveConfirmationModal
          formData={formData}
          setShowConfirmModal={setShowConfirmModal}
          onSave={() => {
            setShowConfirmModal(false);
            toast.success("Table updated successfully");
            onUpdate();
          }}
          link={`http://localhost:8080/admin/restaurants/${restaurant_id}/tables/${table.id}`}
          setValidationErrors={setValidationErrors}
        />
      )}
    </>
  );
};

export default TableCard;