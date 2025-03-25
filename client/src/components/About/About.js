import './About.styles.css';
import MarioAdrianA from '../../assets/about/MarioAdrianA.jpg';
import MarioAdrianB from '../../assets/about/MarioAdrianB.jpg';

const About = () => {
  return (
    <section name='about' className='about'>
      <div className='about-container'>
        <h1 className='about-title'>TableBooker</h1>
        <h2 className='about-subtitle'>VietNam</h2>
        <p className='about-text'>
          TableBooker is an online restaurant reservation platform that makes 
          it easy for customers to find and book tables in their favorite restaurants. <br />
          <br />
          We connect diners with restaurants, providing detailed information on menus, 
          promotions, and table availability. With TableBooker App, reserving a table is 
          simple, convenient, and enhances your dining experience like never before.
        </p>
      </div>
      <div className='about-image-container'>
        <div className='about-container-one'>
          <img
            src={MarioAdrianA}
            alt='Mario and Adrian 1'
            className='about-image-one'
          />
        </div>
        <div className='about-container-two'>
          <img
            src={MarioAdrianB}
            alt='Mario and Adrian 2'
            className='about-image-two'
          />
        </div>
      </div>
    </section>
  );
};

export default About;
