import NavBar from "../components/NavBar/NavBar";
import Hero from "../components/Hero/Hero";
import KeyFeatures from "../components/KeyFeatures/KeyFeatures";
import Specials from "../components/Specials/Specials";
import About from "../components/About/About";
import Footer from "../components/Footer/Footer";
import Carousel from "../components/CarouselCard/CarouselCard";
const HomePage = () => {
  return (
    <>
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
