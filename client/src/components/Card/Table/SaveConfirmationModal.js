import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
const SaveConfirmationModal = ({ imageUrl, formData, setShowConfirmModal, onSave, link, setValidationErrors, selectedFile, previewUrl }) => {
  const [isSaving, setIsSaving] = useState(false);
  const confirmSave = async () => {
    setIsSaving(true);
    try {
      let updatedData = { ...formData };
      if (selectedFile) {
        const imageForm = new FormData();
        imageForm.append("imageTable", selectedFile);

        const uploadRes = await axios.post(
          `${process.env.REACT_APP_API_URL}/image_upload`, // lấy endpoint upload
          imageForm,
          { withCredentials: true }
        );
        updatedData.image_id = uploadRes.data.imageId;
        console.log(updatedData)
      }

      await axios.put(
        link,
        updatedData,
        { withCredentials: true }
      );
      onSave();
    } catch (err) {
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
        toast.error(err.response?.data.message || err.response.data.error);
        console.error("Error saving table:", err.response?.data.message || err.response.data.error);
      }
    } finally {
      setIsSaving(false); // Dừng loading dù thành công hay lỗi
      setShowConfirmModal(false); // Đóng modal
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow-lg border-0">
          <div className="modal-header text-dark rounded-top-4">
            <h4 className="modal-title fw-bold">Are you sure want to save?</h4>
            <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
          </div>
          <div className="modal-body p-4 bg-white">
            <ul className="p-0 m-0">
              <li>
                <img
                  src={previewUrl || imageUrl}
                  alt="Table Image"
                  style={{ width: "100%", height: "100% ", objectFit: "cover", borderRadius: "0.5rem" }}
                />
              </li>
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
            <button
              type="button"
              className="btn btn-success fw-bold px-4 d-flex align-items-center justify-content-center gap-2"
              onClick={confirmSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveConfirmationModal;