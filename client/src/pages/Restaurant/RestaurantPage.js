import NavBar from "../../components/NavBar/NavBar";
import RestaurantList from "./Restaurants";
import Footer from "../../components/Footer/Footer";
import RestaurantLayout from "./restaurantLayout";
const RestaurantPage = () => {
  return (
    <>
      <RestaurantLayout>
        <RestaurantList />
      </RestaurantLayout>
    </>
  );
};

export default RestaurantPage;
