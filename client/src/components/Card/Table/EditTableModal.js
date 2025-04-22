import React from "react";

const EditTableModal = ({ imageUrl, formData, handleChange, setShowModal, setShowDeleteConfirm, validationErrors, onSubmit, setSelectedFile, previewUrl }) => {
  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow-lg border-0">
          <div className="modal-header bg-dark text-white rounded-top-4">
            <h4 className="modal-title fw-bold">Edit Table</h4>
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
          </div>
          <form
            onSubmit={(e) => { onSubmit(e) }}
          >
            <div className="modal-body p-4 bg-white">
              <div className="form-group mb-3">
                <label className="form-label fw-bold text-dark">Table Name</label>
                <input
                  type="text"
                  className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {validationErrors.name && (
                  <div className="invalid-feedback">{validationErrors.name}</div>
                )}
              </div>
              <div className="form-group mb-3">
                <label className="form-label fw-bold text-dark">Image</label>
                <input
                  type="file"
                  className="form-control mb-2"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]); // 👈 gọi handleFileChange từ props
                    }
                  }}
                />
                {(previewUrl || imageUrl) && (
                  <img
                    src={previewUrl || imageUrl}
                    alt="Current table"
                    className="rounded mt-2"
                    style={{ width: "100%", height: "auto", maxHeight: "100%", objectFit: "cover" }}
                  />
                )}
              </div>
              <div className="form-group mb-3">
                <label className="form-label fw-bold text-dark">Seats</label>
                <input
                  type="number"
                  name="seats"
                  className={`form-control ${validationErrors.seats ? 'is-invalid' : ''}`}
                  placeholder="Number of Seats"
                  value={formData.seats}
                  onChange={handleChange}
                />
                {validationErrors.seats && (
                  <div className="invalid-feedback">{validationErrors.seats}</div>
                )}
              </div>
              <div className="form-group mb-3">
                <label className="form-label fw-bold text-dark">Type</label>
                <input
                  type="text"
                  name="type"
                  className={`form-control ${validationErrors.type ? 'is-invalid' : ''}`}
                  placeholder="Table Type"
                  value={formData.type}
                  onChange={handleChange}
                />
                {validationErrors.type && (
                  <div className="invalid-feedback">{validationErrors.type}</div>
                )}
              </div>
              <div className="form-group mb-3">
                <label className="form-label fw-bold text-dark">Description</label>
                <textarea
                  name="Description"
                  className={`form-control ${validationErrors.Description ? 'is-invalid' : ''}`}
                  placeholder="Description"
                  value={formData.Description}
                  onChange={handleChange}
                ></textarea>
                {validationErrors.Description && (
                  <div className="invalid-feedback">{validationErrors.Description}</div>
                )}
              </div>
            </div>
            <div className="modal-footer bg-light rounded-bottom-4 d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-dark fw-bold px-4"
                onClick={() => {
                  setShowModal(false);
                  setShowDeleteConfirm(true);
                }}
              >
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
  );
};

export default EditTableModal;