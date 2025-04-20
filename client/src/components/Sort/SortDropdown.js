import React from "react";
import { FaSortAlphaDown, FaSortAlphaUp, FaSortAmountDown } from "react-icons/fa";

const SortDropdown = ({ handleSort }) => {
    return (
        <div className="dropdown">
            <button
                type="button"
                className="btn btn-danger fw-bolder d-flex align-items-center px-3"
                data-bs-toggle="dropdown"
            >
                <FaSortAmountDown className="me-2" />
                Sort
            </button>
            <ul className="dropdown-menu shadow rounded-3">
                <li>
                    <button className="dropdown-item" onClick={() => handleSort("name-asc")}>
                        <FaSortAlphaDown className="me-2 text-danger" /> Name (A-Z)
                    </button>
                </li>
                <li>
                    <button className="dropdown-item" onClick={() => handleSort("name-desc")}>
                        <FaSortAlphaUp className="me-2 text-danger" /> Name (Z-A)
                    </button>
                </li>
                <li>
                    <button className="dropdown-item" onClick={() => handleSort("started-asc")}>
                        <FaSortAlphaDown className="me-2 text-danger" /> Started (Ascending)
                    </button>
                </li>
                <li>
                    <button className="dropdown-item" onClick={() => handleSort("started-desc")}>
                        <FaSortAlphaUp className="me-2 text-danger" /> Started (Descending)
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default SortDropdown;