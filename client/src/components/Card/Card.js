import React, { useRef } from "react";
import Slider from "react-slick";
import { specials } from "../../data";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Card.styles.css";

const CardCarousel = () => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
    <div className="carousel-container">
      <Slider ref={sliderRef} {...settings}>
        {specials.map(({ id, image, name, price, description }) => (
          <div
            key={id}
            className="card-container"
            onClick={() => navigate(`/restaurants/${id}/detail`)}
          >
            <div className="specials-image-container">
              <img src={image} alt={name} className="specials-image" />
            </div>
            <div className="specials-details">
              <div className="specials-name">
                <p>Tên nhà hàng</p>
                <p className="specials-price"></p>
              </div>
              <p className="specials-description">{description}</p>
            </div>
          </div>
        ))}
      </Slider>

      {/* Nút chuyển card */}
      <button
        className="btn-carousel prev"
        onClick={() => sliderRef.current?.slickPrev()}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <button
        className="btn-carousel next"
        onClick={() => sliderRef.current?.slickNext()}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
};

export default CardCarousel;
