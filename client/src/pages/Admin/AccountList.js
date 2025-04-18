import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUsers } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "./SideBar";
import {
  FaLock,
  FaUnlock,
  FaPhone,
  FaEnvelope,
  FaSearch,
  FaSortAmountDown,
  FaSortAlphaDown,
  FaSortAlphaUp,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "bootstrap";
const Admin = () => {
  const [accounts, setAccount] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [modalInstance, setModalInstance] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [setSortType] = useState(null);
  const itemsPerPage = 12;

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/admin/users`, {
        withCredentials: true,
      })
      .then((res) => {
        setAccount(res.data.account || []);
        console.log(res.data.account);
      })
      .catch((err) => {
        // toast.error("Error fetching accounts list!");
        toast.error("Error:", err.response.data.message);
      });

    // Đợi DOM sẵn sàng trước khi khởi tạo modal
    setTimeout(() => {
      const modalElement = document.getElementById("confirmModal");
      if (modalElement) {
        setModalInstance(new Modal(modalElement));
      }
    }, 500);
  }, []);

  const handleSort = (type) => {
    setSortType(type);
    let sortedAccount = [...accounts];
    if (type === "name-asc") {
      sortedAccount.sort((a, b) => a.name.localeCompare(b.name));
    } else if (type === "name-desc") {
      sortedAccount.sort((a, b) => b.name.localeCompare(a.name));
    }
    setAccount(sortedAccount);
  };

  const handleOpenModal = (accounts) => {
    setSelectedAccount(accounts);
    modalInstance?.show();
  };

  const handleConfirmToggle = async () => {
    if (!selectedAccount) return;

    const { Id, Status } = selectedAccount;
    console.log(Status);
    const newStatus = Status === "active" ? "inactive" : "active";

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/users/:user_id/lock`,
        { Status: Status, Id: Id },
        { withCredentials: true }
      );

      setAccount((prevAccount) =>
        prevAccount.map((s) => (s.Id === Id ? { ...s, Status: newStatus } : s))
      );
      toast.success(
        `Account ${
          newStatus === "active" ? "unlocked" : "locked"
        } successfully!`
      );
    } catch (error) {
      toast.error(`Failed to update accounts Status! Error: ${error.message}`);
      console.error(error);
    }

    modalInstance?.hide();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = accounts.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-black">
      <ToastContainer />
      <div className="p-4 text-white row vh-100">
        <div className="col-2">
          <Sidebar />
        </div>
        <div className="bg-dark rounded-4 shadow-lg col-10 py-4 px-5">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center w-100">
            <h1 className="text-danger fw-bold d-flex justify-content-center gap-2">
              <FaUsers className="pt-2" /> Accounts
            </h1>
          </div>
          <hr className="border-secondary" />
          <div className="d-flex justify-content-between align-items-center mb-3">
            {/* Nút thêm nhân viên */}
            <button
              type="button"
              className="btn btn-outline-danger fw-bold"
              data-bs-toggle="modal"
              data-bs-target="#myModal"
            >
              Add Account
            </button>

            {/* Ô tìm kiếm và nút sắp xếp tách biệt */}
            <div className="d-flex gap-3 align-items-center">
              {/* Ô tìm kiếm */}
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Nút sắp xếp có cùng chiều cao với input */}
              <div className="dropdown">
                {/* Button dropdown */}
                <button
                  type="button"
                  className="btn btn-danger fw-bolder d-flex align-items-center px-3"
                  data-bs-toggle="dropdown"
                  // Đảm bảo đồng bộ chiều cao
                >
                  <FaSortAmountDown className="me-2" />
                  Sort
                </button>

                {/* Dropdown menu */}
                <ul className="dropdown-menu shadow rounded-3">
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => handleSort("name-asc")}
                    >
                      <FaSortAlphaDown className="me-2 text-danger" /> Name
                      (A-Z)
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => handleSort("name-desc")}
                    >
                      <FaSortAlphaUp className="me-2 text-danger" /> Name (Z-A)
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="accounts-container">
            <div className="row">
              {currentItems.map(({ Id, Name, Email, Phone, Status }) => (
                <div key={Id} className="col-md-3 mb-4">
                  <div className="card w-100 h-100 shadow-lg border-2 border-danger rounded-4 bg-light text-dark position-relative p-3">
                    <button
                      className={`btn btn-square position-absolute top-0 end-0 m-2 
                                                    ${
                                                      Status === "ban"
                                                        ? "btn-secondary"
                                                        : Status === "active"
                                                        ? "btn-outline-danger"
                                                        : "btn-danger"
                                                    }`}
                      onClick={() =>
                        Status !== "ban" &&
                        handleOpenModal({ Id, Name, Status })
                      }
                      disabled={Status === "ban"}
                    >
                      {Status === "active" ? (
                        <FaUnlock />
                      ) : Status === "inactive" ? (
                        <FaLock />
                      ) : (
                        <FaUnlock />
                      )}
                    </button>

                    <div className="text-center">
                      <img
                        src="https://tamanh.net/wp-content/uploads/2023/03/kieu-toc-mini-man-bun.jpg"
                        alt={Name}
                        className="rounded-circle border border-danger p-1 mb-3"
                        width={80}
                        height={80}
                      />
                      <h4 className="fw-bold text-danger">{Name}</h4>
                      <p className="text-dark mb-1">
                        <FaEnvelope className="text-danger me-2" />
                        {Email}
                      </p>
                      <p className="d-flex align-items-center mb-1 justify-content-center text-dark">
                        <FaPhone className="text-danger me-2" />
                        {Phone}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Modal xác nhận khóa/mở khóa */}
          <div
            className="modal fade"
            id="confirmModal"
            tabIndex="-1"
            aria-labelledby="confirmModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 shadow-lg border-0">
                <div className="modal-header bg-dark text-white rounded-top-4">
                  <h4 className="modal-title fw-bold" id="confirmModalLabel">
                    {selectedAccount?.Status === "active"
                      ? "Lock Account"
                      : "Unlock Account"}
                  </h4>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    data-bs-dismiss="modal"
                  ></button>
                </div>

                <div className="modal-body p-4 bg-white">
                  <p className="text-dark">
                    Are you sure you want to{" "}
                    <strong>
                      {selectedAccount?.Status === "active" ? "lock" : "unlock"}{" "}
                    </strong>
                    accounts{" "}
                    <strong className="text-danger">
                      {selectedAccount?.name}
                    </strong>
                    ?
                  </p>
                </div>

                {/* Footer */}
                <div className="modal-footer bg-light rounded-bottom-4 d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-dark fw-bold px-4"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger fw-bold px-4"
                    onClick={handleConfirmToggle}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>

          {accounts.length > itemsPerPage && (
            <div className="pagination-container">
              <button
                className="btn btn-outline-dark me-2"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
              {[...Array(Math.ceil(accounts.length / itemsPerPage)).keys()].map(
                (number) => (
                  <button
                    key={number + 1}
                    className={`btn ${
                      currentPage === number + 1
                        ? "btn-dark"
                        : "btn-outline-dark"
                    } mx-1`}
                    onClick={() => paginate(number + 1)}
                  >
                    {number + 1}
                  </button>
                )
              )}
              <button
                className="btn btn-outline-dark ms-2"
                onClick={() => paginate(currentPage + 1)}
                disabled={
                  currentPage === Math.ceil(accounts.length / itemsPerPage)
                }
              >
                &raquo;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
