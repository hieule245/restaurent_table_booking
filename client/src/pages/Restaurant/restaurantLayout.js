import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
const RestaurantLayout = ({ children }) => {
  return (
    <>
      <NavBar />
      <div className="py-2 fs-3">margin top</div>
      <div className="pt-4">{children}</div>
      <Footer />
    </>
  );
};

export default RestaurantLayout;
