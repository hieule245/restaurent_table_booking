import './Specials.styles.css';
import Card from '../Card/Card';

const Specials = () => {
  return (
    <section name='menu' className='specials'>
      <div className='specials-header'>
        <h1 className='specials-title'>Top Restaurants</h1>
      </div>
      <div className='row'>
        <div className='col-7'>
          <p className='fs-3 fw-light mt-5 py-5 mr-6'>Indulge in the flavors of Italy with our exquisite
            selection of traditional dishes. From pasta to pizza,
            experience true Italian cuisine at its finest. </p>
          <div className='d-flex align-items-end h-50'>
          <button className='menu-button text-white fs-4'>Explore</button>
          </div>
        </div>
        <div className='col-5'>
          <Card />
        </div>
      </div>
    </section>
  );
};

export default Specials;
