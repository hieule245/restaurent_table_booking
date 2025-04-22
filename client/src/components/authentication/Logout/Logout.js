import axios from "axios";
import { REST_API_URL } from "../../../data";

const HandleLogout = async () => {
  try {
    await axios.post(
      `${process.env.REACT_APP_API_URL}/logout`,
      {},
      { withCredentials: true }
    );
    window.location.href = "/";
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export default HandleLogout;
