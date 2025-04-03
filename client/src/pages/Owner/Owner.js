import { useParams } from "react-router-dom"
import { FaUtensils } from "react-icons/fa";
import { Tabs, Tab, TabList, TabPanel } from "react-tabs"
import Dashboard from "../../components/Dashboard/Dashboard";
import RestaurantList from "../../components/Restaurants/RestaurantList";
import ReservationList from "../../components/Restaurants/Reservations/ReservationList";
import NavBar from '../../components/NavBar/NavBar';
import './Owner.styles.css'
const Owner = () => {
    const { owner_id } = useParams();
    console.log("Owner ID:", owner_id);
    return (
        <>
            <NavBar />
            <main>
                <div className="bg-light text-dark" style={{ minHeight: "100vh", paddingTop: "5%" }}>
                    <Tabs className="container-fluid">
                        <div className="row">
                            <div className="col-2 py-4 tab-menu">
                                <div className="d-flex justify-content-center align-items-center mb-3">
                                    <FaUtensils className="nav-icon fs-1 col-1 text-white" />
                                    <span className="fw-bolder fs-3 col-9 d-flex justify-content-end text-white">TableBooker</span>
                                </div>
                                <TabList className="p-0">
                                    <Tab className="custom-tab">
                                        <span className="btn btn-danger fs-5 fw-bold w-100 mb-3 rounded-pill" style={{ outline: "none" }}>Dashboard</span>
                                    </Tab>
                                    <Tab className="custom-tab">
                                        <span className="btn btn-danger fs-5 fw-bold w-100 mb-3 rounded-pill" style={{ outline: "none" }}>Restaurants</span>
                                    </Tab>
                                    <Tab className="custom-tab">
                                        <span className="btn btn-danger fs-5 fw-bold w-100 rounded-pill" style={{ outline: "none" }}>Revenue</span>
                                    </Tab>
                                </TabList>
                            </div>
                            <div className="col-10">
                                <TabPanel>
                                    <Dashboard />
                                </TabPanel>
                                <TabPanel>
                                    <RestaurantList />
                                </TabPanel>
                                <TabPanel>
                                    <ReservationList />
                                </TabPanel>
                            </div>
                        </div>
                    </Tabs>
                </div>
            </main>
        </>

    )
}

export default Owner;