import { useState, useRef, useEffect } from "react";
import { links } from "../../data";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { FaTimes } from "react-icons/fa";
import { FaUtensils } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./NavBar.styles.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import avatar from '../../assets/image/avatar.jpeg'

const NavBar = () => {
  // STATE FOR HAMBURGER MENU
  const [nav, setNav] = useState(false);
  const [user, setUser] = useState(false);
  const navigate = useNavigate();
  const navRef = useRef(null)

  // Lưu thông tin từ cookie
  useEffect(() => {
    axios
      .get("http://localhost:8080/me", { withCredentials: true })
      .then((res) => {
        setUser(res.data); // lưu thông tin user
      }).catch(() => {
        setUser(null)
      })
  })


  // Xử lý Logout
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8080/logout", {}, { withCredentials: true });
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
              <FaUtensils className="nav-icon fs-1 col-2" />
              <span className="fw-bolder fs-3 col-10">TableBooker</span>
            </div>
            <div className="col-8 row">
              <div className="d-flex justify-content-start align-items-center">
                <h4 className="mt-3" href="/restaurants">Restaurant</h4>
              </div>
            </div>
            <div className="pt-2 col-1">
              <ul className="d-flex align-items-center">
                {user ? (
                  <>
                    <li className="d-flex justify-content-end align-items-center">
                      <div class="dropdown d-flex justify-content-end">
                        <button type="button" class="rounded-circle border-2 border-danger"  data-bs-toggle="dropdown">
                          <img src={avatar || "/default-avatar.png"} alt="User Avatar" className="user-avatar w-100 h-100 rounded-circle" />
                        </button>
                        <ul class="dropdown-menu">
                          <li><a class="dropdown-item" href="/personal">My Profile</a></li>
                          <li><a class="dropdown-item" onClick={handleLogout}>Logout</a></li>
                        </ul>
                      </div>
                    </li>
                  </>
                ) : (
                  <>
                    <li key="login" className="auth-link">
                      <Link
                        to="/login"
                        smooth="true"
                        onClick={handleClick}
                        aria-label="Login"
                        className="nav-links"
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
                  </>
                )}
              </ul>
              <div onClick={() => setNav(!nav)}>
                <HiOutlineMenuAlt1 className={nav ? "hamburger-off" : "hamburger-on"} />
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
