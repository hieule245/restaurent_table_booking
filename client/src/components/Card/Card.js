import './Card.styles.css';
import { specials } from '../../data';
import { RiEBike2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

const Card = () => {
  const navigate = useNavigate();
  const specialties = specials.map(
    ({ id, image, name, price, description }) => {
      return (
        <div key={id} 
        className='card-container'
        onClick={() => navigate('/restaurants/:id/detail')}>
          <div className='specials-image-container'>
            <img src={image} alt={name} className='specials-image' />
          </div>
          <div className='specials-details'>
            <div className='specials-name'>
              <p>{name}</p>
              <p className='specials-price'>{price}</p>
            </div>
            <p className='specials-description'>{description}</p>
            <div className='specials-delivery'>
              <p className='specials-name'>Order a delivery</p>
              <RiEBike2Line />
            </div>
          </div>
        </div>
      );
    }
  );
  return <div className='card-list'>{specialties}</div>;
};

export default Card;
