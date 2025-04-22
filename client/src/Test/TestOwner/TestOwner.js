function TestOwner({ callAPI }) {
  return (
    <>
      <div name="container" className="">
        <h2>👤 Test REST API cho Owner - RESTAURANT</h2>
        <button
          className="btn btn-success mx-2"
          onClick={() =>
            callAPI("POST", "/owners/1/restaurants", {
              name: "Lam's Restaurant 2",
              description: "Nhà hàng ngon hơn",
              owner_id: 1,
              Started: "08:00",
              Ended: "22:00",
              Location: "Da Nang",
            })
          }
        >
          POST / Create Restaurant
        </button>

        <button
          className="btn btn-primary mx-2"
          onClick={() =>
            callAPI("PUT", "/owners/1/restaurants/2", {
              name: "Lam's Restaurant UPDATED",
              description: "Nhà hàng đã cập nhật",
              owner_id: 1,
              Started: "09:00",
              Ended: "23:00",
            })
          }
        >
          PUT / Edit Restaurant
        </button>

        <button
          className="btn btn-primary mx-2"
          onClick={() => callAPI("GET", "/owners/1/restaurants")}
        >
          GET / All Restaurants
        </button>

        <button
          className="btn btn-primary mx-2"
          onClick={() => callAPI("GET", "/owners/1/restaurants/2")}
        >
          GET / Restaurant ID 2
        </button>

        <button
          className="btn btn-danger mx-2"
          onClick={() => callAPI("DELETE", "/owners/1/restaurants/2")}
        >
          DELETE / Restaurant ID 2
        </button>

        <button
          className="btn btn-primary mx-2"
          onClick={() => callAPI("GET", `/owners/1/restaurants/search?id=3`)}
        >
          GET / Restaurant by condition
        </button>
      </div>
      <hr />

      <div name="container" className="">
        <h2>🪑 Test REST API cho Owner - TABLES (Bàn ăn)</h2>

        <button
          className="btn btn-success mx-2"
          onClick={() =>
            callAPI("POST", "/owners/1/restaurants/2/tables", {
              name: "Bàn VIP 1",
              type: "VIP",
              seats: 6,
              restaurant_id: 2,
              description: "Bàn VIP 1",
            })
          }
        >
          POST / Create Table
        </button>

        <button
          className="btn btn-primary mx-2"
          onClick={() => callAPI("GET", "/owners/1/restaurants/2/tables")}
        >
          GET / All Tables (Nhà hàng ID 2)
        </button>

        <button
          className="btn btn-primary mx-2"
          onClick={() => callAPI("GET", "/owners/1/restaurants/2/tables/5")}
        >
          GET / Table ID 5 (Nhà hàng ID 2)
        </button>

        <button
          className="btn btn-danger mx-2"
          onClick={() => callAPI("DELETE", "/owners/1/restaurants/2/tables/5")}
        >
          DELETE / Table ID 5 (Nhà hàng ID 2)
        </button>

        <button
          className="btn btn-primary mx-2"
          onClick={() =>
            callAPI("GET", "/owners/1/restaurants/2/tables/search")
          }
        >
          GET / All Tables with condition
        </button>
      </div>
      <div name="container" className="my-4">
        <h2>👤 Test REST API cho Owner - STAFF</h2>

        {/* POST: Tạo nhân viên mới */}
        <button
          className="btn btn-success mx-2 my-2"
          onClick={() =>
            callAPI("POST", "/owners/1/staffs", {
              owner_id: 1,
              gmail: "staff1@example.com",
              name: "Staff One",
              phone: "0123456789",
              status: "active",
              password: "hashed_password",
              restaurant_id: 1,
            })
          }
        >
          POST / Create Staff
        </button>

        {/* PUT: Sửa thông tin nhân viên */}
        <button
          className="btn btn-primary mx-2 my-2"
          onClick={() =>
            callAPI("PUT", "/owners/1/staffs/2", {
              gmail: "staff2_updated@example.com",
              name: "Staff Two UPDATED",
              phone: "0987654321",
              status: "active",
              owner_id: 1,
              restaurant_id: 1,
            })
          }
        >
          PUT / Edit Staff
        </button>

        {/* GET: Lấy tất cả nhân viên */}
        <button
          className="btn btn-primary mx-2 my-2"
          onClick={() => callAPI("GET", "/owners/1/staffs")}
        >
          GET / All Staffs
        </button>

        {/* GET: Lấy nhân viên theo ID */}
        <button
          className="btn btn-primary mx-2 my-2"
          onClick={() => callAPI("GET", "/owners/1/staffs/2")}
        >
          GET / Staff ID 2
        </button>

        {/* DELETE: Xóa nhân viên */}
        <button
          className="btn btn-danger mx-2 my-2"
          onClick={() => callAPI("DELETE", "/owners/1/staffs/2")}
        >
          DELETE / Staff ID 2
        </button>

        {/* GET: Tìm kiếm nhân viên theo tên hoặc email */}
        <button
          className="btn btn-primary mx-2 my-2"
          onClick={() => callAPI("GET", `/owners/1/staffs/search?q=Staff`)}
        >
          GET / Search Staffs
        </button>
      </div>
      <hr />
    </>
  );
}
export default TestOwner;
