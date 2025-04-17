import React, { useState } from "react";
import axios from "axios";

function TestBookTimeTable() {
  const [ownerId, setOwnerId] = useState("1"); // Mặc định owner_id = 1
  const [restaurantId, setRestaurantId] = useState("2"); // Mặc định restaurant_id = 2
  const [tableId, setTableId] = useState("5"); // Mặc định table_id = 5
  const [bookDate, setBookDate] = useState(""); // YYYY-MM-DD
  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    // Xây dựng URL endpoint dựa trên path parameters
    const url = `${process.env.REACT_APP_API_URL}/owners/${ownerId}/restaurants/${restaurantId}/tables/${tableId}/booked-times`;

    // Query parameter: book_date
    const params = { book_date: bookDate };

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
      <h1>Test Booked Times</h1>
      <div className="form-group">
        <label>Owner ID</label>
        <input
          type="number"
          className="form-control"
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Restaurant ID (default: 2)</label>
        <input
          type="number"
          className="form-control"
          value={restaurantId}
          onChange={(e) => setRestaurantId(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Table ID</label>
        <input
          type="number"
          className="form-control"
          value={tableId}
          onChange={(e) => setTableId(e.target.value)}
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
      <button onClick={handleSearch} className="btn btn-primary">
        Search Booked Times
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

export default TestBookTimeTable;
