import React, { useState } from "react";
import axios from "axios";

function TestSearchTable() {
  const [restaurantId, setRestaurantId] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [desiredStart, setDesiredStart] = useState("");
  const [desiredEnd, setDesiredEnd] = useState("");
  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    // Nếu restaurantId để trống, mặc định là 2
    const resId = restaurantId.trim() === "" ? 2 : restaurantId;

    // Xây dựng URL endpoint dựa trên restaurantId
    const url = `${process.env.REACT_APP_API_URL}/owners/1/restaurants/${resId}/tables/available`;

    // Tạo object chứa các tham số query (các trường có thể để trống)
    const params = {
      book_date: bookDate, // VD: "2025-04-01"
      desired_start: desiredStart, // VD: "18:00"
      desired_end: desiredEnd, // VD: "20:00"
    };

    try {
      const response = await axios.get(url, { params });
      setResults(response.data);
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      setResults({
        error: error.response ? error.response.data : error.message,
      });
    }
  };

  return (
    <div className="container my-4">
      <h1>Test Search Table</h1>
      <div className="form-group">
        <label>Restaurant ID (default: 2)</label>
        <input
          type="number"
          className="form-control"
          placeholder="Enter Restaurant ID (leave blank for default 2)"
          value={restaurantId}
          onChange={(e) => setRestaurantId(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Booking Date (YYYY-MM-DD)</label>
        <input
          type="date"
          className="form-control"
          value={bookDate}
          onChange={(e) => setBookDate(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Desired Start (HH:MM)</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter start time (e.g., 18:00)"
          value={desiredStart}
          onChange={(e) => setDesiredStart(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Desired End (HH:MM)</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter end time (e.g., 20:00)"
          value={desiredEnd}
          onChange={(e) => setDesiredEnd(e.target.value)}
        />
      </div>
      <button onClick={handleSearch} className="btn btn-primary">
        Search Available Tables
      </button>

      {results && (
        <div className="mt-4">
          <h3>Results:</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default TestSearchTable;
