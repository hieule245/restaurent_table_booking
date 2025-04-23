import { useEffect, useState, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faClock, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FaPen, FaStoreSlash } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import TableCard from "../../../Card/Table/Owner";
import "./Tablelist.styles.css";
import { ToastContainer } from "react-toastify";
import { Modal } from "bootstrap";
import { tableSchema } from "../../../../validations/TableSchema";
import { restaurantEditSchema } from "../../../../validations/RestaurantSchema";

const TableList = ({ restaurant_id }) => {
  const [tables, setTables] = useState([]);
  const [restaurant, setRestaurant] = useState({});
  const [formData, setFormData] = useState({});
  const [newTable, setNewTable] = useState(
    {
      name: "",
      type: "",
      seats: tables.seats || 1,
      Description: "",
      image_file: "",
      image_id: 1,
    });
  const [currentPage, setCurrentPage] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const modalRef = useRef(null);
  const addTableModalRef = useRef(null);
  const tablesPerPage = 6;
  const indexOfLastTable = currentPage * tablesPerPage;
  const indexOfFirstTable = indexOfLastTable - tablesPerPage;
  const currentTables = tables.slice(indexOfFirstTable, indexOfLastTable);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const resetFormData = () => {
    setFormData(restaurant); // Reset lại dữ liệu form về giá trị ban đầu (restaurant)
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.name === "seats" ? Number(e.target.value) : e.target.value });
  };

  // Lấy danh sách bàn trong nhà hàng
  const fetchTables = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/owners/:owner_id/restaurants/${restaurant_id}/tables`,
        { withCredentials: true }
      );
      setTables(res.data.tables || []);
      console.log(res.data.tables)
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Error fetching table list from server!";
      toast.error(errorMessage);
      console.error("Error fetching tables:", error);
    }
  }, [restaurant_id]);

  const formatTime = (timeStr) => {
    if (!timeStr) return "";

    const [hour, minute] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hour), parseInt(minute));

    // Sử dụng Intl.DateTimeFormat để định dạng thời gian
    const formatted = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);

    // Chuyển ":" thành "h" và loại bỏ khoảng trắng dư thừa
    return formatted.replace(":", "h").trim();
  };

  useEffect(() => {
    fetchTables();
  }, [restaurant_id, fetchTables]);

  // Lấy thông tin nhà hàng
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/owners/:owner_id/restaurants/${restaurant_id}`, { withCredentials: true })
      .then((res) => {
        setRestaurant(res.data.restaurant || {});
        setFormData(res.data.restaurant || {});
        console.log(res.data.restaurant)
      })
      .catch(() => toast.error("Error fetching restaurant!"));
  }, [restaurant_id]);

  useEffect(() => {
    const modalElement = modalRef.current;

    // Hàm reset dữ liệu
    const resetFormData = () => {
      setFormData(restaurant); // Reset dữ liệu về restaurant ban đầu
    };

    // Lắng nghe sự kiện đóng modal
    modalElement?.addEventListener('hidden.bs.modal', resetFormData);

    // Cleanup khi component unmount hoặc modalRef thay đổi
    return () => {
      modalElement?.removeEventListener('hidden.bs.modal', resetFormData);
    };
  }, [restaurant]); // Chạy lại khi restaurant thay đổi


  // Chỉnh sửa thông tin nhà hàng
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({}); // reset lỗi cũ nếu có

    try {
      // Nếu dữ liệu sai, hàm này sẽ ném lỗi và đi vào `catch`
      await restaurantEditSchema.validate(formData, { abortEarly: false });

      // Nếu validate thành công mới đến đây
      await axios.put(`${process.env.REACT_APP_API_URL}/owners/:owner_id/restaurants/${restaurant_id}`, formData, { withCredentials: true });
      setRestaurant(formData);
      toast.success("Restaurant updated successfully!");
      modalRef.current.querySelector(".btn-close").click();

    } catch (error) {
      // Bắt lỗi validation của Yup
      if (error.name === "ValidationError") {
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        setValidationErrors(errors);
      } else {
        // Lỗi khác như lỗi mạng, lỗi server
        toast.error(error.response?.data?.message || "An error occurred");
      }
    }
  };

  const handleNewTableChange = (e) => {
    setNewTable({
      ...newTable,
      [e.target.name]: e.target.name === "seats" ? Number(e.target.value) : e.target.value
    });
  };


  // Tạo bàn mới
  const handleAddTable = async (e) => {
    e.preventDefault();
    setValidationErrors({}); // reset trước

    try {
      await tableSchema.validate(newTable, { abortEarly: false });
      let newTableWithImage = { ...newTable };
      if (selectedFile) {
        const formData = new FormData();
        formData.append("imageTable", selectedFile)
        await axios.post(`${process.env.REACT_APP_API_URL}/image_upload`, formData, { withCredentials: true })
          .then((res) => {
            newTableWithImage.image_id = res.data.imageId;
            console.log(newTableWithImage.image_id)
          })
          .catch((error) => {
            console.error("Error uploading image:", error.response.data.message);
            toast.error("Error uploading image!");
            return; // Nếu upload ảnh thất bại, không tiếp tục tạo bàn
          });
      }
      await axios.post(`${process.env.REACT_APP_API_URL}/owners/:owner_id/restaurants/${restaurant_id}/tables`, newTableWithImage, { withCredentials: true })
        .then((res) => {
          setTables([...tables, res.data.table]);
          toast.success("Table added successfully!");
          addTableModalRef.current.querySelector(".btn-close").click();
          setNewTable({ name: "", type: "", seats: 1, Description: "", image_id: 0 });
        })
        .catch((error) => {
          if (error.response?.data?.error) {
            toast.error(error.response.data.error);
          }
        });
    } catch (error) {
      if (error.inner) {
        const formattedErrors = {};
        error.inner.forEach(err => {
          formattedErrors[err.path] = err.message;
        });
        setValidationErrors(formattedErrors); // cập nhật state lỗi
      } else {
        toast.error("Đã có lỗi xảy ra!");
      }
    }
  };

  // Xóa mềm nhà hàng
  const handleDeleteRestaurant = () => {
    axios.post(`${process.env.REACT_APP_API_URL}/owners/:owner_id/restaurants/${restaurant_id}`, {}, { withCredentials: true, })
      .then(() => {
        toast.success("Restaurant deleted successfully!");

        // Ẩn modal bằng Bootstrap Modal instance
        const deleteModalElement = document.getElementById("deleteRestaurantModal");
        if (deleteModalElement) {
          const deleteModalInstance = new Modal(deleteModalElement);
          deleteModalInstance.hide();
        }
        document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
        // Quay lại trang trước sau khi xóa
        setTimeout(() => {
          window.history.back();
        }, 1000); // Đợi 1 giây để hiển thị toast
      })
      .catch((error) => {
        toast.error(error.response?.data?.error);
        toast.error(error.response?.data?.message);
      });
  };

  const handleChangeFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setSelectedFile(selectedFile)
    }
  }

  return (
    <div className="container-fluid row align-items-center">
      <ToastContainer />
      <div className="col-9">
        <div className="">
          <div className="restaurant-details mt-1 pt-1 pb-0">
            <h1 className="restaurant-name text-dark mb-2" style={{ whiteSpace: "normal", overflow: "visible", textOverflow: "unset" }}>
              {restaurant.Name}
            </h1>
            <p className="restaurant-description text-muted">{restaurant.Description}</p>
            <p className="restaurant-address-text">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger me-2" />
              <span className="text-dark">{restaurant.Location}</span>
            </p>
            <p className="restaurant-hours d-flex align-items-center p-2 rounded-3 shadow-sm bg-light">
              <FontAwesomeIcon icon={faClock} className="text-danger me-2 fs-5" />
              <span className="fw-bold text-dark me-2">Hours:</span>
              <span className="fw-bold text-success px-2 py-1 bg-white rounded-3 border border-success">{formatTime(restaurant.Started)}</span>
              <span className="mx-2 text-muted">to</span>
              <span className="fw-bold text-danger px-2 py-1 bg-white rounded-3 border border-danger">{formatTime(restaurant.Ended)}</span>
            </p>

          </div>
        </div>
      </div>

      <div className="col-3 text-end pe-5">
        <button className="btn btn-outline-success me-3" data-bs-toggle="modal" data-bs-target="#addTableModal"><FontAwesomeIcon icon={faPlus} /></button>
        <button className="btn btn-outline-primary me-3" data-bs-toggle="modal" data-bs-target="#editRestaurantModal"><FaPen /></button>
        <button className="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#deleteRestaurantModal">
          <FaStoreSlash />
        </button>


      </div>
      <div className="">
        <div className="table-container">
          <div className="row mt-1">
            {currentTables.length > 0 ? (
              currentTables.map((table) => (
                <div className="col-md-4 mb-3" key={table.id}>
                  <TableCard restaurant_id={restaurant_id} table={table} onUpdate={fetchTables} />
                </div>
              ))
            ) : (
              <p className="text-center text-muted fs-1">No tables available.</p>
            )}
          </div>
        </div>

        {/* Pagination */}
        {tables.length > tablesPerPage && (
          <div className="pagination-container m-0">
            <button className="btn btn-outline-dark me-2" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
              &laquo;
            </button>
            {[...Array(Math.ceil(tables.length / tablesPerPage)).keys()].map(number => (
              <button
                key={number + 1}
                className={`btn ${currentPage === number + 1 ? "btn-dark" : "btn-outline-dark"} mx-1`}
                onClick={() => paginate(number + 1)}
              >
                {number + 1}
              </button>
            ))}
            <button className="btn btn-outline-dark ms-2" onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(tables.length / tablesPerPage)}>
              &raquo;
            </button>
          </div>
        )}

      </div>

      {/* Modal chỉnh sửa nhà hàng */}
      <div ref={modalRef} className="modal fade" id="editRestaurantModal" tabIndex="-1" aria-labelledby="editRestaurantModalLabel">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow-lg border-0">
            <div className="modal-header bg-dark text-white rounded-top-4">
              <h4 className="modal-title fw-bold" id="editRestaurantModalLabel">Edit Restaurant</h4>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" onClick={resetFormData}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4 bg-white">
                <div className="form-group mb-2">
                  <label className="form-label fw-bold text-dark">Name</label>
                  <input
                    type="text"
                    name="Name"
                    className={`form-control border-secondary rounded-3 ${validationErrors.Name ? 'is-invalid' : ''}`}
                    value={formData.Name}
                    placeholder="Input name of table"
                    onChange={(e) => {
                      handleChange(e);
                      // Xóa lỗi nếu có khi người dùng sửa
                      if (validationErrors.Name) {
                        setValidationErrors(prev => {
                          const { Name, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                  />
                  {validationErrors.Name && <div className="invalid-feedback">{validationErrors.Name}</div>}
                </div>
                <div className="form-group mb-2">
                  <label className="form-label fw-bold text-dark">Description</label>
                  <input type="text"
                    name="Description"
                    className={`form-control border-secondary rounded-3 ${validationErrors.Description ? 'is-invalid' : ''}`}
                    value={formData.Description}
                    onChange={(e) => {
                      handleChange(e);
                      // Xóa lỗi nếu có khi người dùng sửa
                      if (validationErrors.Description) {
                        setValidationErrors(prev => {
                          const { Description, ...rest } = prev;
                          return rest;
                        });
                      }
                    }} />
                  {validationErrors.Description && <div className="invalid-feedback">{validationErrors.Description}</div>}
                </div>
                <div className="form-group mb-2">
                  <label className="form-label fw-bold text-dark">Location</label>
                  <input type="text"
                    name="Location"
                    className={`form-control border-secondary rounded-3 ${validationErrors.Location ? 'is-invalid' : ''}`}
                    value={formData.Location}
                    onChange={(e) => {
                      handleChange(e);

                      // Xóa lỗi nếu có khi người dùng sửa
                      if (validationErrors.Location) {
                        setValidationErrors(prev => {
                          const { Location, ...rest } = prev;
                          return rest;
                        });
                      }
                    }} />
                  {validationErrors.Location && <div className="invalid-feedback">{validationErrors.Location}</div>}
                </div>
                <div className="form-group mb-2">
                  <label className="form-label fw-bold text-dark">Opening Time</label>
                  <input type="time"
                    name="Started"
                    className={`form-control border-secondary rounded-3 ${validationErrors.Started ? 'is-invalid' : ''}`}
                    value={formData.Started}
                    onChange={(e) => {
                      handleChange(e);

                      // Xóa lỗi nếu có khi người dùng sửa
                      if (validationErrors.Started) {
                        setValidationErrors(prev => {
                          const { Started, ...rest } = prev;
                          return rest;
                        });
                      }
                    }} />
                  {validationErrors.Started && <div className="invalid-feedback">{validationErrors.Started}</div>}
                </div>
                <div className="form-group mb-2">
                  <label className="form-label fw-bold text-dark">Closing Time</label>
                  <input type="time"
                    name="Ended"
                    className={`form-control border-secondary rounded-3 ${validationErrors.Ended ? 'is-invalid' : ''}`}
                    value={formData.Ended}
                    onChange={(e) => {
                      handleChange(e);

                      // Xóa lỗi nếu có khi người dùng sửa
                      if (validationErrors.Ended) {
                        setValidationErrors(prev => {
                          const { Ended, ...rest } = prev;
                          return rest;
                        });
                      }
                    }} />
                  {validationErrors.Ended && <div className="invalid-feedback">{validationErrors.Ended}</div>}
                </div>
              </div>
              <div className="modal-footer bg-light rounded-bottom-4 d-flex justify-content-between">
                <button type="button" className="btn btn-outline-dark fw-bold px-4" data-bs-dismiss="modal" onClick={resetFormData}>Close</button>
                <button type="submit" className="btn btn-danger fw-bold px-4">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div ref={modalRef} className="modal fade" id="deleteRestaurantModal" tabIndex="-1" aria-labelledby="deleteRestaurantModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow-lg border-0">
            <div className="modal-header bg-danger text-white rounded-top-4">
              <h4 className="modal-title fw-bold" id="deleteRestaurantModalLabel">Confirm Deletion</h4>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body p-4 bg-white">
              <p className="text-dark fs-5">Are you sure you want to delete this restaurant? This action cannot be undone.</p>
            </div>
            <div className="modal-footer bg-light rounded-bottom-4 d-flex justify-content-between">
              <button type="button" className="btn btn-outline-dark fw-bold px-4" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-danger fw-bold px-4" onClick={handleDeleteRestaurant}>Delete</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal thêm bàn */}
      <div ref={addTableModalRef} className="modal fade" id="addTableModal" tabIndex="-1" aria-labelledby="addTableModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow-lg border-0">
            <div className="modal-header bg-dark text-white rounded-top-4">
              <h4 className="modal-title fw-bold" id="addTableModalLabel">Add Table</h4>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form onSubmit={handleAddTable}>
              <div className="modal-body p-4 bg-white">
                <div className="form-group mb-2">
                  <label className="form-label fw-bold text-dark">Name</label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control border-secondary rounded-3 ${validationErrors.name ? 'is-invalid' : ''}`}
                    value={newTable.name}
                    onChange={(e) => {
                      handleNewTableChange(e);

                      // Xóa lỗi nếu có khi người dùng sửa
                      if (validationErrors.name) {
                        setValidationErrors(prev => {
                          const { name, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                  />
                  {validationErrors.name && <div className="invalid-feedback">{validationErrors.name}</div>}
                </div>
                <div className="form-group mb-3">
                  <label className="form-label fw-bold text-dark">Picture</label>
                  <input
                    type="file"
                    name="ImageFile"
                    accept="image/*"
                    onChange={handleChangeFile}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label fw-bold text-dark">Type</label>
                  <input
                    type="text"
                    name="type"
                    className={`form-control border-secondary rounded-3 ${validationErrors.type ? 'is-invalid' : ''}`}
                    value={newTable.type}
                    onChange={(e) => {
                      handleNewTableChange(e);

                      // Xóa lỗi nếu có khi người dùng sửa
                      if (validationErrors.type) {
                        setValidationErrors(prev => {
                          const { type, ...rest } = prev;
                          return rest;
                        });
                      }
                    }} />
                  {validationErrors.type && <div className="invalid-feedback">{validationErrors.type}</div>}
                </div>
                <div className="form-group mb-3">
                  <label className="form-label fw-bold text-dark">Seats</label>
                  <input type="number"
                    name="seats"
                    className={`form-control border-secondary rounded-3 ${validationErrors.seats ? 'is-invalid' : ''}`}
                    value={newTable.seats}
                    onChange={(e) => {
                      handleNewTableChange(e);

                      // Xóa lỗi nếu có khi người dùng sửa
                      if (validationErrors.seats) {
                        setValidationErrors(prev => {
                          const { seats, ...rest } = prev;
                          return rest;
                        });
                      }
                    }} />
                  {validationErrors.seats && <div className="invalid-feedback">{validationErrors.seats}</div>}
                </div>
                <div className="form-group mb-3">
                  <label className="form-label fw-bold text-dark">Description</label>
                  <textarea type="text"
                    name="Description"
                    className={`form-control border-secondary rounded-3 ${validationErrors.Description ? 'is-invalid' : ''}`}
                    value={newTable.Description}
                    onChange={(e) => {
                      handleNewTableChange(e);

                      // Xóa lỗi nếu có khi người dùng sửa
                      if (validationErrors.Description) {
                        setValidationErrors(prev => {
                          const { Description, ...rest } = prev;
                          return rest;
                        });
                      }
                    }} />
                  {validationErrors.Description && <div className="invalid-feedback">{validationErrors.Description}</div>}
                </div>
              </div>
              <div className="modal-footer bg-light rounded-bottom-4 d-flex justify-content-end">
                <button type="submit" className="btn btn-success fw-bold px-4">Add</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableList;
