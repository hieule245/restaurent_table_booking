import React, { useRef } from "react";
import Slider from "react-slick";
import { Link as LinkR } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Carousel.styles.css"; // Thêm CSS tùy chỉnh nếu cần

const cards = [
  {
    id: 1,
    title: "Table Reservation",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuv61hLzhnhnwgF1JgMWQH7J2e0O3vrJkXpQ&s",
    description:
      "Book a table hassle-free and enjoy a delightful dining experience at your favorite restaurant.",
    button: "Book",
  },
  {
    id: 2,
    title: "Special Officer",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuv61hLzhnhnwgF1JgMWQH7J2e0O3vrJkXpQ&s",
    description:
      "Limited time offer! Get a discount on your next table booking when you sign up today.",
    button: "Sign up",
  },
  {
    id: 3,
    title: "Card 3",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuv61hLzhnhnwgF1JgMWQH7J2e0O3vrJkXpQ&s",
    description:
      "Limited time offer! Get a discount on your next table booking when you sign up today.",
    button: "Book",
  },
  {
    id: 4,
    title: "Card 4",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuv61hLzhnhnwgF1JgMWQH7J2e0O3vrJkXpQ&s",
    description:
      "Limited time offer! Get a discount on your next table booking when you sign up today.",
    button: "Book",
  },
];

const ProfileSlider = () => {
  const sliderRef = useRef(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
    <div className="w-100 h-100 position-relative">
      <div className="background-slide w-100 h-100 rounded-5">
        <h1 className="text-center mt-4 fw-boldfs-1 pt-5">Manage Profile</h1>
        <p className="text-center fs-4">Update your details here.</p>
        <div className="position-relative mx-auto w-50 pb-3">
          <Slider ref={sliderRef} {...settings} className="p-4">
            {cards.map((card) => (
              <div key={card.id} className="px-3">
                <div className="card text-center shadow-lg p-3 rounded-4">
                  <div className="card-body">
                    <div className="position-relative">
                      <img
                        src={card.img}
                        alt="restaurant"
                        className="w-100 rounded-3"
                      />
                      {card.tag && (
                        <span className="badge position-absolute top-0 start-0 m-2 bg-light text-dark px-3 py-2 rounded-pill">
                          {card.tag}
                        </span>
                      )}
                    </div>
                    <h3 className="card-title fs-4 fw-bolder mt-3">
                      {card.title}
                    </h3>
                    <p className="card-text">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
          <button
            className="btn position-absolute top-50 start-0 translate-middle-y fs-1 ps-1"
            onClick={() => sliderRef.current?.slickPrev()}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button
            className="btn position-absolute top-50 end-0 translate-middle-y fs-1 pe-1"
            onClick={() => sliderRef.current?.slickNext()}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSlider;
