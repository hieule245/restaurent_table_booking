import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
const SaveConfirmationModal = ({ formData, setShowConfirmModal, onSave, link, setValidationErrors }) => {

  const confirmSave = async () => {
    try {
      await axios.put(
        link,
        formData,
        { withCredentials: true }
      );
      onSave();
    } catch(err) {
      if (err.name === "ValidationError") {
        // Gom lỗi lại theo field
        const fieldErrors = {};
        err.inner.forEach((e) => {
          fieldErrors[e.path] = e.message;
        });

        if (typeof setValidationErrors === "function") {
          setValidationErrors(fieldErrors);
        }
        toast.error("Please correct the highlighted errors.");
        setShowConfirmModal(false); // Tắt modal xác nhận, quay lại form
      } else {
        toast.error("Error saving table");
        console.error("Error saving table:", err.response?.data || err.message);
      }
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
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
  );
};

export default SaveConfirmationModal;