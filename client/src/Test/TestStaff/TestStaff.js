function TestStaff(callAPI) {
  return (
    <>
      <div name="container" className="">
        <h2>👤 Test REST API cho Staff of restaurant 2 </h2>
        <button
          className="btn btn-success mx-2"
          onClick={() => callAPI("GET", "/restaurants/2/reservations")}
        >
          GET / Get all reservation of Restaurant 2
        </button>
      </div>
    </>
  );
}

export default TestStaff;
