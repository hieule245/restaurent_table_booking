import { useNavigate } from 'react-router-dom';
const TableCard = () => {
    const negative = useNavigate();
    return (
        <div className="card btn">
            <div className="card-body" onClick={() => negative("/restaurants/:id/tables/:id/detail")}>
                <div className="restaurant-image-container mb-3 justify-content-center">
                    <img
                        src="https://images.squarespace-cdn.com/content/v1/5e1b73fb6eeb973ee1becfc4/1592675020070-2CPPWG2J34ZWURFKJC6P/custom-restaurant-tables-david-stine+4.jpg"
                        alt="restaurant"
                        className="restaurant-image rounded-3"
                        style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }}
                    />
                </div>
                <div className='row'>
                    <div className='col-6'>
                        <p>Tên chỗ ngồi</p>
                    </div>
                    <div className='col-6 d-flex justify-content-end'>
                        <p className='table-seat'>số chỗ</p>
                    </div>
                </div>
                <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
            </div>
        </div>
    );
}

export default TableCard;
