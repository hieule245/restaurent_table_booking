import React from "react";

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
    return (
        <div className="pagination-container d-flex justify-content-center mt-3">
            <button
                className="btn btn-outline-secondary me-2"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
            >
                &laquo;
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
                <button
                    key={index + 1}
                    className={`btn ${currentPage === index + 1 ? "btn-secondary" : "btn-outline-secondary"} mx-1`}
                    onClick={() => setCurrentPage(index + 1)}
                >
                    {index + 1}
                </button>
            ))}
            <button
                className="btn btn-outline-secondary ms-2"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                &raquo;
            </button>
        </div>
    );
};

export default Pagination;