import { useNavigate } from "react-router-dom";
import "./TableCard.styles.css"; // Import CSS riêng

const TableCard = ({ table }) => {
  const navigate = useNavigate();

  //   {
  //   "id": 1,
  //   "name": "Bàn VIP 1",
  //   "type": "VIP",
  //   "seats": 6,
  //   "restaurant_id": 2,
  //   "Description": ""
  //   }
  return (
    <div
      className="card table-card border-red"
      onClick={() =>
        navigate(
          `/restaurants/${table.restaurant_id}/tables/${table.id}/detail`
        )
      }
    >
      {/* Hình ảnh bàn có overlay */}
      <div className="position-relative">
        <img
          src={
            table.image ||
            "https://images.squarespace-cdn.com/content/v1/5e1b73fb6eeb973ee1becfc4/1592675020070-2CPPWG2J34ZWURFKJC6P/custom-restaurant-tables-david-stine+4.jpg"
          }
          alt={table.name || "Table"}
        />
      </div>

      {/* Nội dung */}
      <div className="card-body table-card-body">
        <h5>{table.name || "Table Name"}</h5>
        <p className="text-muted">
          🪑 Seats: <span className="fw-semibold">{table.seats || "N/A"}</span>
        </p>
        <p className="small">✨ {table.description}</p>
      </div>
    </div>
  );
};

export default TableCard;
