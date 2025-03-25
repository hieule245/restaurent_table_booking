import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
const RestaurantLayout = ({ children }) => {
  return (
    <>
      <NavBar />
      <div className="pt-5 mt-5">{children}</div>
      <Footer />
    </>
  );
};

export default RestaurantLayout;
