// import './Hero.styles.css';
// import restaurantFood from '../../assets/restaurantfood.jpg';
// import { Link as LinkR } from 'react-router-dom';

const Hero = () => {
    return (
        <section className='keyFeatures'>
            <div className='container'>
                <div className='row py-5 justify-content-between'>
                    <div className="col-3 text-center">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuv61hLzhnhnwgF1JgMWQH7J2e0O3vrJkXpQ&s"
                            alt='restaurant food'
                            className='display-image round round-6 w-100 h-100'
                        />
                        <p className="fs-5">Search Tables</p>
                    </div>
                    <div className="col-3 text-center">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/A_woman_starts_to_fill_in_an_employee_evaluation_form_in_pen.jpg/2560px-A_woman_starts_to_fill_in_an_employee_evaluation_form_in_pen.jpg"
                            alt='restaurant food'
                            className='display-image round round-6  w-100 h-100'
                        />
                        <p className="fs-5">Fill Out Form</p>
                    </div>
                    <div className="col-3 text-center">
                        <img
                            src="https://learnenglish.britishcouncil.org/sites/podcasts/files/RS8064_GettyImages-908849910-hig.jpg"
                            alt='restaurant food'
                            className='display-image round round-6  w-100 h-100'
                        />
                        <p className="fs-5">Success Confirmation</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
