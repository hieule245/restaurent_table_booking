import { useState, useRef, useEffect } from "react";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { FaTimes } from "react-icons/fa";
import { FaUtensils } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./NavBar.styles.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import avatar from "../../assets/image/avatar.png";

const NavBar = () => {
  const [nav, setNav] = useState(false);
  const [user, setUser] = useState({
    Id: "",
    Name: "",
    Email: "",
    Phone: "",
    Role: "",
    Status: "",
    Orther_id: 0,
    ImageFile: null,
  });
  const navigate = useNavigate();
  const navRef = useRef(null);

  // Lưu thông tin từ cookie
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/me`, { withCredentials: true })
      .then((res) => {
        if (res.data.user) {
          setUser(res.data.user); // lưu thông tin user
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  // Xử lý Logout
  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  // onClick HANDLER
  const handleClick = () => {
    if (nav) {
      return setNav(!nav);
    }
  };

  const imageUrl = user && user.ImageFile ? user.ImageFile : avatar;

  // NAVBAR HIDE/ SHOW ON SCROLL
  useEffect(() => {
    let previousScrollPosition = window.scrollY;
    const handleScroll = () => {
      const currentScrollPosition = window.scrollY;
      const navElement = navRef.current;

      if (!navElement) return;
      if (previousScrollPosition > currentScrollPosition) {
        navElement.style.transform = "translateY(0)";
        navElement.style.transition = "350ms";
      } else {
        navElement.style.transform = "translateY(-110px)";
        navElement.style.transition = "800ms";
      }
      previousScrollPosition = currentScrollPosition;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="shadow-sm" ref={navRef}>
        <nav className="container">
          <div className="row justify-content-between align-items-center">
            <div className="col-3 row">
              <FaUtensils className="nav-icon text-white fs-1 col-2" />
              <span className="fw-bolder text-white  fs-3 col-10 ">
                <button
                  onClick={() =>
                    navigate(user && user.Role === "owner" ? "/owner" : "/")
                  }
                  className="text-white text-decoration-none cursor-pointer border-0 bg-transparent"
                >
                  TableBooker
                </button>
              </span>
            </div>
            <div className="col-7 row">
              <div className="d-flex justify-content-start align-items-center">
                <button
                  className="mt-1 fw-bold text-white fs-5 text-decoration-none p-0 m-0 border-0"
                  onClick={() =>
                    navigate(
                      user && user.Role === "staff" ? "/staff" : "/restaurants"
                    )
                  }
                  role="link" // Indicate this button should behave like a link
                  style={{ background: "transparent", border: "none" }} // Make the button look like a link
                >
                  {user && user.Role === "staff"
                    ? "Serving restaurant"
                    : user && user.Role === "owner"
                    ? ""
                    : "Restaurants"}
                </button>
                {user && user.Role === "staff" ? (
                  <button
                    className="mt-1 ms-5 fw-bold text-white fs-5 text-decoration-none p-0 m-0 border-0"
                    role="link" // Indicate this button should behave like a link
                    onClick={() => navigate("/staff/booking-history")}
                    style={{ background: "transparent", border: "none" }} // Make the button look like a link
                  >
                    Revenue
                  </button>
                ) : (
                  <></>
                )}
              </div>
            </div>
            <div className="pt-3 col-2">
              <ul className="d-flex align-items-center">
                {/* Authorize */}
                {user ? (
                  <div>
                    <li className="d-flex justify-content-end align-items-center">
                      <div class="dropdown d-flex justify-content-end">
                        <button
                          type="button"
                          className="rounded-circle p-0 m-0 border-0"
                          data-bs-toggle="dropdown"
                          style={{
                            width: "40px",
                            height: "40px",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={user && imageUrl ? imageUrl : avatar}
                            alt="User Avatar"
                            className="w-100 h-100 rounded-circle object-fit-cover"
                          />
                        </button>

                        <ul className="dropdown-menu">
                          <li>
                            <a className="dropdown-item" href="/personal">
                              My Profile
                            </a>
                          </li>
                          {(user && (user.Role === "owner" || user.Role === "admin")) ? "" : (
                            <li>
                              <button
                                className="dropdown-item bg-transparent border-0 text-decoration-none"
                                onClick={() => navigate("/booking-history")}
                              >
                                Booking History
                              </button>
                            </li>
                          )}
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={handleLogout}
                            >
                              Logout
                            </button>
                          </li>
                        </ul>
                      </div>
                    </li>
                  </div>
                ) : (
                  <div className="d-flex justify-content-end align-items-center">
                    <li key="login" className="auth-link">
                      <Link
                        to="/login"
                        smooth="true"
                        onClick={handleClick}
                        aria-label="Login"
                        className="nav-links me-3"
                      >
                        Login
                      </Link>
                    </li>
                    <li key="signup" className="auth-link">
                      <Link
                        to="/register"
                        smooth="true"
                        duration={550}
                        onClick={handleClick}
                        aria-label="Signup"
                        className="nav-links signup-link"
                      >
                        Signup
                      </Link>
                    </li>
                  </div>
                )}
              </ul>
              <div onClick={() => setNav(!nav)}>
                <HiOutlineMenuAlt1
                  className={nav ? "hamburger-off" : "hamburger-on"}
                />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* MENU KHI HAMBURGER ĐƯỢC BẬT */}
      {nav && (
        <FaTimes
          size={30}
          style={{ color: "#edefee", zIndex: "99", cursor: "pointer" }}
          onClick={() => setNav(false)}
        />
      )}
    </>
  );
};

export default NavBar;
