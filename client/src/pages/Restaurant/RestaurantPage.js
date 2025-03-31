import RestaurantList from "./Restaurants";
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
