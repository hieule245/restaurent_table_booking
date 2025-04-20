import React from "react";
import axios from "axios";

const DeleteConfirmationModal = ({ tableName, setShowDeleteConfirm, onDelete, link }) => {
  const confirmDelete = async () => {
    try {await axios.post(
        link,
        {},
        { withCredentials: true }
      );
      onDelete();
    } catch (error) {
      console.error("Error deleting table:", error.response?.data || error.message);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow-lg border-0">
          <div className="modal-header bg-danger text-white rounded-top-4">
            <h4 className="modal-title fw-bold">Confirm Deletion</h4>
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteConfirm(false)}></button>
          </div>
          <div className="modal-body p-4 bg-white">
            <p>Are you sure you want to delete <strong>{tableName}</strong>?</p>
            <p>This action <span className="text-danger fw-bold">cannot be undone.</span></p>
          </div>
          <div className="modal-footer bg-light rounded-bottom-4 d-flex justify-content-between">
            <button type="button" className="btn btn-outline-dark fw-bold px-4" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger fw-bold px-4" onClick={confirmDelete}>
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;