import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import CalendarRow from "../../components/Card/BookingCalendar";
import { useNavigate } from "react-router-dom";

const DetailRestaurant = () => {
    const navigator = useNavigate();
    return (
        <div className="container-fluid">
            <div className="row shadow" style={{ background: '#495e57' }}>
                <div className="col-3 p-3 d-flex align-items-center">
                    <FontAwesomeIcon onClick={() => navigator('/restaurants/:id/detail')} icon={faArrowLeft} className="text-warning me-2" />
                </div>
                <div className="col-6 d-flex flex-column justify-content-center align-items-center text-warning" >
                    <h4 className="mt-2 text-uppercase">Tên bàn</h4>
                    <p className="mb-2"><small>số chỗ - loại bàn</small></p>
                </div>
            </div>
            <div>
                <CalendarRow />
            </div>
        </div>
    );
};

export default DetailRestaurant;
