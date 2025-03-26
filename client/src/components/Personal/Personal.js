import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Information from './Information';
import ChangePassword from './ChangePassword';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FaUtensils } from "react-icons/fa";
import './Personal.style.css';

const Personal = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-light text-dark" style={{ minHeight: "100vh" }}>
      <Tabs className="container-fluid">
        <div className="row">
          <div className="col-2 py-4 tab-menu">
            <div className="d-flex justify-content-center align-items-center mb-3" onClick={() => navigate("/")}>              
              <FaUtensils className="nav-icon fs-1 col-1 text-white" />
              <span className="fw-bolder fs-3 col-9 d-flex justify-content-end text-white">TableBooker</span>
            </div>
            <TabList className="p-0">
              <Tab>
                <span className="btn btn-danger fs-5 fw-bold w-100 mb-3 rounded-pill">Information</span>
              </Tab>
              <Tab>
                <span className="btn btn-danger fs-5 fw-bold w-100 rounded-pill">Change Password</span>
              </Tab>
            </TabList>
          </div>
          <div className="col-9">
            <TabPanel>
              <Information />
            </TabPanel>
            <TabPanel>
              <ChangePassword />
            </TabPanel>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Personal;
