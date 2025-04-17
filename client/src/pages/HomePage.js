import NavBar from '../components/NavBar/NavBar';
import Hero from '../components/Hero/Hero';
import KeyFeatures from '../components/KeyFeatures/KeyFeatures';
import Specials from '../components/Specials/Specials';
import About from '../components/About/About';
import Footer from '../components/Footer/Footer';
import Carousel from '../components/CarouselCard/CarouselCard';
import { useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
const HomePage = () => {
  useEffect(() => {
    axios.get("http://localhost:8080/status")
      .then(res => {
        if (res.data.status === "fail") {
          toast.error("Server cannot connect to database.");
        }
      })
      .catch(err => {
        toast.error("Backend is not responding.");
      });
  }, []);
  return (
    <>
      <ToastContainer />
      <NavBar />
      <main>
        <Hero />
        <KeyFeatures />
        <Carousel />
        <Specials />
        <About />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
