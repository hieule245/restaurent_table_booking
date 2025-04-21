import React from "react";

const RestaurantModal = ({
    modalRef,
    handleSubmit,
    handleChange,
    restaurantData,
    formErrors,
}) => {
    return (
        <div ref={modalRef} className="modal fade" id="myModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">Create restaurant</h4>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="form-group my-2">
                                <label className="form-label">Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                                    placeholder="Full Name"
                                    onChange={handleChange}
                                    value={restaurantData.name}
                                />
                                {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                            </div>
                            <div className="form-group my-2">
                                <label className="form-label">Description</label>
                                <textarea
                                    name="description"
                                    type="text"
                                    className="form-control"
                                    placeholder="Description"
                                    onChange={handleChange}
                                    value={restaurantData.description}
                                />
                            </div>
                            <div className="form-group my-2 row">
                                <div className="col-6">
                                    <label className="form-label">Opened</label>
                                    <input
                                        name="started"
                                        type="time"
                                        className={`form-control ${formErrors.started ? "is-invalid" : ""}`}
                                        onChange={handleChange}
                                        value={restaurantData.started}
                                    />
                                    {formErrors.started && <div className="invalid-feedback">{formErrors.started}</div>}
                                </div>
                                <div className="col-6">
                                    <label className="form-label">Closed</label>
                                    <input
                                        name="ended"
                                        type="time"
                                        className={`form-control ${formErrors.ended ? "is-invalid" : ""}`}
                                        onChange={handleChange}
                                        value={restaurantData.ended}
                                    />
                                    {formErrors.ended && <div className="invalid-feedback">{formErrors.ended}</div>}
                                </div>
                            </div>
                            <div className="form-group my-2">
                                <label className="form-label">Location</label>
                                <input
                                    name="location"
                                    type="text"
                                    className={`form-control ${formErrors.location ? "is-invalid" : ""}`}
                                    placeholder="Location"
                                    onChange={handleChange}
                                    value={restaurantData.location}
                                />
                                {formErrors.location && <div className="invalid-feedback">{formErrors.location}</div>}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" className="btn btn-outline-danger">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RestaurantModal;