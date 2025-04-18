import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import TableCard from "../../../components/Card/TableCard";
import { useParams } from "react-router-dom";
import axios from "axios";
import NavBar from "../../../components/NavBar/NavBar";
import Restaurant from "./Restaurant";
import Footer from "../../../components/Footer/Footer";

const StaffPage = () => {
    return (
        <>
            <NavBar /> 
            <Restaurant />
            <Footer />
        </>

    );
};

export default StaffPage;
