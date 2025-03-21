import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link as LinkR } from 'react-router-dom';
import "./Carousel.styles.css";

const Carousel = () => {
    const sliderRef = React.useRef(null);

    const settings = {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: false,
        dots: false,
        arrows: false,
    };

    const cards = [
        { id: 1, title: "Table Reservation", description: "Book a table hassle-free and enjoy a delightful dining experience at your favorite restaurant.", button: "Book" },
        { id: 2, title: "Special Officer", description: "Limited time offer! Get a discount on your next table booking when you sign up today.", button: "Sign up" },
        { id: 3, title: "Card 3", description: "This is the third card", button: "Book" },
        { id: 4, title: "Card 4", description: "This is the fourth card", button: "Book" },
    ];

    return (
        <div className="w-100 h-100 mx-auto">
            <div className="background-slide">
                <div className="position-relative w-50 z">
                    <Slider ref={sliderRef} {...settings} className="p-5">
                        {cards.map((card) => (
                            <div key={card.id} className="px-2">
                                <div className="card text-center pt-1 pb-2">
                                    <div className="card-body">
                                        <img
                                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuv61hLzhnhnwgF1JgMWQH7J2e0O3vrJkXpQ&s"
                                            alt='restaurant food'
                                            className='display-image round round-2 w-100 h-100'
                                        />
                                        <h3 className="card-title fs-4 fw-bolder mt-3">{card.title}</h3>
                                        <p className="card-text">{card.description}</p>
                                        <LinkR to='/bookings' className='reserve-button'>
                                            {card.button}
                                        </LinkR>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                    <button
                        className="btn position-absolute top-50 start-0 translate-middle-y fs-3"
                        onClick={() => sliderRef.current?.slickPrev()}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button
                        className="btn position-absolute top-50 end-0 translate-middle-y fs-3"
                        onClick={() => sliderRef.current?.slickNext()}
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Carousel;
