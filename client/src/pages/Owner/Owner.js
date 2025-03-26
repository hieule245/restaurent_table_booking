import { useNavigate } from "react-router-dom"
import { FaUtensils } from "react-icons/fa";
import { Tabs, Tab, TabList, TabPanel } from "react-tabs"
import Dashboard from "../../components/Dashboard/Dashboard";
import NavBar from '../../components/NavBar/NavBar';

const Owner = () => {
    const navigate = useNavigate()
    return (
        <>
            <NavBar />
            <main>
                <div className="bg-light text-dark" style={{ minHeight: "95vh", paddingTop:"5%" }}>
                    <Tabs className="container-fluid">
                        <div className="row">
                            <div className="col-2 py-4 tab-menu">
                                <div className="d-flex justify-content-center align-items-center mb-3">
                                    <FaUtensils className="nav-icon fs-1 col-1 text-white" />
                                    <span className="fw-bolder fs-3 col-9 d-flex justify-content-end text-white">TableBooker</span>
                                </div>
                                <TabList className="p-0">
                                    <Tab>
                                        <span className="btn btn-danger fs-5 fw-bold w-100 mb-3 rounded-pill">Dashboard</span>
                                    </Tab>
                                    <Tab>
                                        <span className="btn btn-danger fs-5 fw-bold w-100 rounded-pill">Change Password</span>
                                    </Tab>
                                </TabList>
                            </div>
                            <div className="col-9">
                                <TabPanel>
                                    <Dashboard />
                                </TabPanel>
                                <TabPanel>

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