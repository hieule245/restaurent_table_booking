import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Information from './Information'
import ChangePassword from './ChangePassword'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FaUtensils  } from "react-icons/fa";
import './Personal.style.css'
const ProfileUpdate = () => {
  const navigate = useNavigate();
  return (
    <div >
      <Tabs className="container-fluid">
        <div className="row">
          <div className="col-2 py-4 tab-menu ">
            <div className="d-flex justify-content-center align-items-center mb-3" onClick={() => navigate("/")}>
              <FaUtensils className="nav-icon fs-1 col-1 justify-content-center" />
              <span className="fw-bolder fs-3 col-9 d-flex justify-content-end">TableBooker</span>
            </div>
            <TabList style={{ padding: '0px' }}>
              <Tab><span className="btn btn-danger fs-4 fw-bolder w-100 mb-3">Information</span></Tab>
              <Tab><span className="btn btn-danger fs-4 fw-bolder w-100">Change Password</span></Tab>
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

export default ProfileUpdate;