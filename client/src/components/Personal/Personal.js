import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Information from './Information';
import ChangePassword from './ChangePassword';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FaUtensils } from "react-icons/fa";
import './Personal.style.css';
import { FaArrowLeft } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";

const Personal = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8080/me", { withCredentials: true })
      .then((res) => {
        setUserRole(res.data.user.Role);
      })
      .catch(() => {
        setUserRole(null);
      });
  }, []);

  const handleBack = () => {
    if (userRole === "owner") {
      navigate("/owner");
    } else if (userRole === "staff") {
      navigate("/staff");
    } else if (userRole === "admin") {
      navigate("/admin/dashboard");
    } else if (userRole === "customer") {
      navigate("/");
    }
  };

  return (
    <div className="bg-light text-dark vh-100" >
      <Tabs className="container-fluid">
        <div className="row">
          <div className="col-2 py-4 tab-menu d-flex flex-column justify-content-between align-items-center">
            <div className="text-center">
              <div className="d-flex justify-content-between align-items-center p-4">
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
            <button className="btn btn-outline-danger w-100 rounded-pill fw-bold fs-5" onClick={handleBack}><FaArrowLeft /> Back</button>
          </div>
          <div className="col-10">
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
