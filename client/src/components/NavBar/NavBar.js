import { useState, useRef, useEffect } from "react";
import { Link as LinkS } from "react-scroll";
import { links } from "../../data";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { FaTimes } from "react-icons/fa";
import { FaUtensils } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./NavBar.styles.css";
import HandleLogout from "../authentication/Logout/Logout";
const NavBar = () => {
  // STATE FOR HAMBURGER MENU
  const [nav, setNav] = useState(false);

  // onClick HANDLER
  const handleClick = () => {
    if (nav) {
      return setNav(!nav);
    }
  };

  // REF
  const navRef = useRef(null);

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

  // NAVLINKS
  const navLinks = links.map(({ link, id }) => {
    return (
      <li key={id}>
        <Link
          to={link}
          smooth="true"
          duration={550}
          onClick={handleClick}
          aria-label="On Click"
          className="nav-links"
        >
          {link}
        </Link>
      </li>
    );
  });

  // Add Login and Signup links
  navLinks.push(
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
    </li>,
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
    </li>,
    <li key="logout">
      <Link
        to="/logout"
        smooth="true"
        duration={550}
        onClick={() => HandleLogout()}
        aria-label="Signup"
        className="ms-2 btn btn-danger"
      >
        Logout
      </Link>
    </li>
  );

  return (
    <>
      <header className="shadow-sm" ref={navRef} >
        <nav className="container ">
          <div className="d-flex justify-content-between align-items-center">
            <div className="">
              <FaUtensils className="nav-icon fs-1" />
            </div>
            <div className="d-flex justify-content-center">
              <span className="fw-bolder fs-3">TableBooker App</span>
            </div>
            <div className="pt-3">
              <ul className="d-flex align-items-center">{navLinks}</ul>
              <div onClick={() => setNav(!nav)} aria-label="On Click">
                <HiOutlineMenuAlt1
                style={{
                  position: "fixed",
                }}
                  className={`${nav ? "hamburger-off" : "hamburger-on"}`}
                />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* NAV-ITEMS WHEN HAMBURGER MENU IS ON */}
      {nav && (
        <FaTimes
          size={30}
          style={{
            color: "#edefee",
            zIndex: "99",
            cursor: "pointer",
          }}
          onClick={() => setNav(!nav)}
          aria-label="On Click"
        />
      )}
      <ul className={`${nav ? "nav-menu active" : "nav-menu"}`}>{navLinks}</ul>
    </>
  );
};

export default NavBar;
