import React from "react";

import TestApiAll from "./testAPI_all";
// import TestBookTimeTable from "./test_book_time_table";
const TestAPI = () => {
  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        height: "100vh",
      }}
      className="bg-dark text-white"
    >
      {/* Header */}
      <div className="text-center">
        <h1>API Tester</h1>

        <h2>🔍 Test REST API bằng Axios</h2>
      </div>
      <p>{REST_API_URL}</p>
      {/* Users */}
      <TestUser callAPI={callAPI} />
      <hr />

      <TestAdmin callAPI={callAPI} />
      <hr />

      <TestOwner callAPI={callAPI} />
      <hr />

      <TestCustomer callAPI={callAPI} />
      <hr />

      <TestStaff callAPI={callAPI} />
      <hr />

      {/* Hiển thị trạng thái */}
      {loading && <p>⏳ Đang tải...</p>}
      {error && <p style={{ color: "red" }}>❌ Lỗi: {JSON.stringify(error)}</p>}
      {response && (
        <pre
          style={{
            background: "#f4f4f4",
            padding: "10px",
            borderRadius: "5px",
            marginTop: "10px",
            fontSize: "1.2em",
            color: "black",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default TestAPI;
