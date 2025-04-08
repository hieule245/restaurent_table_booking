import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
const RestaurantLayout = ({ children }) => {
  return (
    <>
      <NavBar />
      <div className="mt-5"> 
        <div className="pt-4">{children}</div>
      </div>
      <Footer />
    </>
  );
};

export default RestaurantLayout;
