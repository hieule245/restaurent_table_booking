import "./Hero.styles.css";
import restaurantFood from "../../assets/restaurantfood.jpg";
import { Link as LinkR } from "react-router-dom";

const Hero = () => {
  return (
    <section className="row hero">
      <div className="col">
        <h1 className="display-title">Welcome to TableBooker</h1>
        <h3 className="display-subtitle fs-3">VietNam</h3>
        <h4 className="display-text fs-4">
          Discover and book tables at top restaurants with ease. From cozy cafes
          to elegant eateries, find the perfect spot for any occasion.
        </h4>
        <LinkR to="/bookings" className="reserve-button">
          Search
        </LinkR>
      </div>
      <div className="col">
        <img
          src={restaurantFood}
          alt="restaurant food"
          className="display-image"
        />
      </div>
    </section>
  );
};

export default Hero;
