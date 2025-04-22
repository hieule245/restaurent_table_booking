import React, { useState } from "react";
import EditTableModal from "./EditTableModal.js";
import DeleteConfirmationModal from "./DeleteConfirmationModal.js";
import SaveConfirmationModal from "./SaveConfirmationModal.js";
import "../TableCard.styles.css";
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
    image_file: table.image_file || "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const imageUrl = table && table.image_file ? table.image_file : "https://images.squarespace-cdn.com/content/v1/5e1b73fb6eeb973ee1becfc4/1592675020070-2CPPWG2J34ZWURFKJC6P/custom-restaurant-tables-david-stine+4.jpg";
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

  const handleFileChange = (file) => {
    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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
      <div className="card table-card" onClick={() => setShowModal(true)}>
        <div className="position-relative">
          <img
            src={imageUrl}
            alt={table.name || "Table"}
          />
        </div>
        <div className="card-body table-card-body text-truncate">
          <h5>{table.name || "Table Name"}</h5>
          <div className="d-flex justify-content-around align-items-center">
            <p className="text-muted text-truncate">🪑 Seats: <span className="fw-semibold">{table.seats || "N/A"}</span></p>
            <p className="text-muted text-truncate">Type: <span className="fw-semibold">{table.type}</span></p>
          </div>
          <p className="small text-muted text-truncate">✨ {table.Description || "No description available"}</p>
        </div>
      </div>

      {showModal && (
        <EditTableModal
          imageUrl={imageUrl}
          formData={formData}
          handleChange={handleChange}
          setShowModal={setShowModal}
          setShowDeleteConfirm={setShowDeleteConfirm}
          setShowConfirmModal={setShowConfirmModal}
          validationErrors={validationErrors}
          onSubmit={handleSubmit}
          setSelectedFile={handleFileChange}
          previewUrl = {previewUrl}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmationModal
          link={`${process.env.REACT_APP_API_URL}/owners/:owner_id/restaurants/${restaurant_id}/tables/${table.id}`}
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
          imageUrl={imageUrl}
          formData={formData}
          setShowConfirmModal={setShowConfirmModal}
          onSave={() => {
            setShowConfirmModal(false);
            toast.success("Table updated successfully");
            onUpdate();
          }}
          link={`${process.env.REACT_APP_API_URL}/owners/:owner_id/restaurants/${restaurant_id}/tables/${table.id}`}
          setValidationErrors={setValidationErrors}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          previewUrl = {previewUrl}
        />
      )}
    </>
  );
};

export default TableCard;