import { useEffect } from "react";
import { Tabs, Tab, TabList, TabPanel } from "react-tabs";
import Dashboard from "../../components/Dashboard/Dashboard";
import RestaurantList from "../../components/Restaurants/RestaurantList";
import ReservationList from "../../components/Restaurants/Reservations/ReservationList";
import NavBar from "../../components/NavBar/NavBar";
import "./Owner.styles.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Owner = () => {
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/me`, { withCredentials: true })
      .then((res) => {
        if (res.data.user && res.data.user.Role === "owner") {
          // User is an owner, proceed to the dashboard
        } else {
          navigate("/login");
        }
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  return (
    <>
      <NavBar />
      <main>
        <div className="bg-light text-dark" style={{ minHeight: "100vh" }}>
          <Tabs className="container-fluid">
            <div className="row pt-5">
              <div className="col-2 pt-5 tab-menu">
                <TabList className="pt-3 p-0">
                  <Tab className="custom-tab">
                    <span
                      className="btn btn-danger fs-5 fw-bold w-100 mb-3 rounded-pill"
                      style={{ outline: "none" }}
                    >
                      Dashboard
                    </span>
                  </Tab>
                  <Tab className="custom-tab">
                    <span
                      className="btn btn-danger fs-5 fw-bold w-100 mb-3 rounded-pill"
                      style={{ outline: "none" }}
                    >
                      Restaurants
                    </span>
                  </Tab>
                  <Tab className="custom-tab">
                    <span
                      className="btn btn-danger fs-5 fw-bold w-100 rounded-pill"
                      style={{ outline: "none" }}
                    >
                      Revenue
                    </span>
                  </Tab>
                </TabList>
              </div>
              <div className="col-10 pt-4">
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
  );
};

export default Owner;
