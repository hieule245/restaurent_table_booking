import React, { useState } from "react";
import axios from "axios";
import TestUser from "./TestUsers/TestUsers";
// import TestAdmin from "./TestAdmin/TestAdmin";
// import TestOwner from "./TestOwner/TestOwner";
// import TestCustomer from "./TestCustomer/TestCustomer";

import TestStaff from "./TestStaff/TestStaff";
function TestAPI() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const baseURL = "http://localhost:8080"; // Thay đổi thành URL backend của bạn

  // Hàm gọi API với Axios
  const callAPI = async (method, endpoint, data = null) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await axios({
        method,
        url: `${baseURL}${endpoint}`,
        data,
        withCredentials: true, // Bật gửi cookie nếu cần
      });
      setResponse(res.data);
    } catch (err) {
      console.log(
        "Lỗi chi tiết:",
        err.response ? err.response.data : err.message
      );
      setError(err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };
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

      {/* Users */}
      <TestUser callAPI={callAPI} />
      <hr />

      {/* <TestAdmin callAPI={callAPI} /> */}
      <hr />

      {/* <TestOwner callAPI={callAPI} /> */}
      <hr />

      {/* <TestCustomer callAPI={callAPI} /> */}
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
}

export default TestAPI;
