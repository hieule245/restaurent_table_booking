import NavBar from '../../components/NavBar/NavBar';
import RestaurantList from './Restaurants';
import Footer from '../../components/Footer/Footer';
const HomePage = () => {
  return (
    <>
      <NavBar />
      <main>
        <RestaurantList />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
