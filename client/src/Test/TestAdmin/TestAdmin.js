function TestAdmin(callAPI) {
  return (
    <>
      <div name="container" className="">
        <h2>👤 Test REST API cho ADMIN</h2>
        {/* get all restaurants */}
        <button
          className="btn btn-primary mx-2"
          onClick={() => callAPI("GET", "/admin/restaurants")}
        >
          GET / All Restaurants
        </button>
        {/* get all user */}
        <button
          className="btn btn-primary mx-2"
          onClick={() => callAPI("GET", "/admin/users")}
        >
          GET / All Users
        </button>
        <button
          className="btn btn-primary mx-2"
          onClick={() => callAPI("GET", "admin/restaurants/search")}
        >
          GET / Restaurant by condition
        </button>
      </div>
    </>
  );
}

export default TestAdmin;
