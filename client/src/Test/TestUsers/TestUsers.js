// import TestBookTimeTable from "./TestGenericFunction/test_book_time_table";

function TestUser({ callAPI }) {
  return (
    <>
      <div name="container" className="">
        <h2>👤 Test REST API cho User (Người dùng)</h2>
        <div className="row text-center">
          {/* generic */}
          <div name="generic" className="col">
            <h1 className="border bg-secondary">Generic</h1>
            {/* log out */}
            <button
              className="btn btn-danger mx-2"
              onClick={() => callAPI("POST", "/logout", {})}
            >
              POST / Logout
            </button>
            {/* get me */}
            <button
              className="btn btn-primary mx-2"
              onClick={() => callAPI("GET", "/me")}
            >
              GET /me
            </button>
          </div>

          {/* login */}
          <div name="login" className="col">
            <h1 className="border bg-secondary">Login</h1>

            {/* Customer login */}
            <button
              className="btn btn-primary mx-2"
              onClick={() =>
                callAPI("POST", "/login", {
                  Email: "lamtvt@runsystem.net",
                  Password: "1",
                })
              }
            >
              POST / cus login
            </button>
            {/* Owner login */}
            <button
              className="btn btn-primary mx-2"
              onClick={() =>
                callAPI("POST", "/login", {
                  Email: "lamtvt@runsystem.nett",
                  Password: "1",
                })
              }
            >
              POST / owner login
            </button>
            {/* Admin login */}
            <button
              className="btn btn-primary mx-2"
              onClick={() =>
                callAPI("POST", "/login", {
                  Email: "lamtvt@runsystem.nettt",
                  Password: "1",
                })
              }
            >
              POST / admin login
            </button>

            {/* Staff login */}
            <button
              className="btn btn-primary mx-2"
              onClick={() =>
                callAPI("POST", "/login", {
                  Email: "lamtvt@runsystem.netttt",
                  Password: "1",
                })
              }
            >
              POST / staff of restaurant 2 login
            </button>
          </div>

          {/* register */}
          <div name="register" className="col">
            <h1 className="border bg-secondary">Register</h1>
            {/* customer register */}
            <button
              className="btn btn-primary mx-2"
              onClick={() =>
                callAPI("POST", "/register", {
                  Email: "lamtvt@runsystem.net",
                  Password: "1",
                  Name: "Tran Vu Thanh Lam",
                  Phone: "0921658465",
                  Role: "customer",
                })
              }
            >
              POST / customer register
            </button>
            {/* owner register */}
            <button
              className="btn btn-primary mx-2"
              onClick={() =>
                callAPI("POST", "/register", {
                  Email: "lamtvt@runsystem.nett",
                  Password: "1",
                  Name: "Tran Vu Thanh Lam",
                  Phone: "0921658465",
                  Role: "owner",
                })
              }
            >
              POST / owner register
            </button>
            {/* admin register */}
            <button
              className="btn btn-primary mx-2"
              onClick={() =>
                callAPI("POST", "/register", {
                  Email: "lamtvt@runsystem.nettt",
                  Password: "1",
                  Name: "Tran Vu Thanh Lam",
                  Phone: "0921658465",
                  Role: "admin",
                })
              }
            >
              POST / admin register
            </button>
            {/* admin register */}
            <button
              className="btn btn-primary mx-2"
              onClick={() =>
                callAPI("POST", "/register", {
                  Email: "lamtvt@runsystem.netttt",
                  Password: "1",
                  Name: "Tran Vu Thanh Lam",
                  Phone: "0921658465",
                  Role: "staff",
                  Orther_id: 2,
                })
              }
            >
              POST / staff register
            </button>
          </div>
        </div>
      </div>
      {/* <TestBookTimeTable /> */}
    </>
  );
}

export default TestUser;
