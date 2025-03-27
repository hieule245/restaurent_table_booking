import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import CalendarRow from "../../components/Card/BookingCalendar";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const DetailRestaurant = () => {
  const navigator = useNavigate();
  const { table_id } = useParams();
  const { restaurant_id } = useParams();
  const [table, setTable] = useState({});
  const [bookings, setBookings] = useState({});

  useEffect(() => {
    axios.get(`http://localhost:8080/table/${table_id}`).then((response) => {
      setTable(response.data.table);
    });
  }, []);

  return (
    <div className="container-fluid">
      <div className="row shadow" style={{ background: "#495e57" }}>
        <div className="col-3 p-3 d-flex align-items-center">
          <FontAwesomeIcon
            onClick={() => navigator(-1)}
            icon={faArrowLeft}
            className="text-warning me-2"
          />
        </div>
        <div className="col-6 d-flex flex-column justify-content-center align-items-center text-warning">
          <h4 className="mt-2 text-uppercase">
            {table.name + " #" + table.id}
          </h4>
          <p className="mb-2">
            <small>
              số chỗ : {table.seats} - loại bàn: {table.type}
            </small>
          </p>
        </div>
      </div>
      <div>
        <CalendarRow
          table={table}
          bookings={bookings}
          setBookings={setBookings}
        />
      </div>
    </div>
  );
};

export default DetailRestaurant;
