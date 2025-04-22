import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
    return (
        <div className="input-group">
            <div className="input-group" style={{ maxWidth: '350px' }}>
                <span className="input-group-text bg-white border-dark text-danger">
                    <FontAwesomeIcon icon={faSearch} />
                </span>
                <input
                    type="text"
                    className="form-control border-dark shadow-sm"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        backgroundColor: '#fff',
                        color: '#000',
                    }}
                />
            </div>
        </div>
    );
};

export default SearchBar;