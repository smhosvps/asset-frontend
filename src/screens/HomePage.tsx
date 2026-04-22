import {
  Facebook,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Phone,
  PinIcon as Pinterest,
  Twitter,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import logo from "../assets/logo.png";
import about from "../assets/barn-images-t5YUoHW6zRo-unsplash1.jpg";
import FaqSection from "@/components/home/FaqSection";
import Footer from "@/components/home/Footer";
import OurServices from "@/components/home/OurServices";

import slider from "../assets/slider.jpg";
import slider2 from "../assets/slider2.jpg";
// import slider3 from "../assets/slider3.jpg";
export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false); // Add scroll state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu state

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const slides = [slider, slider2];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className={`fixed hidden md:flex top-0 left-0 right-0 bg-[#FF8C00] text-white py-2 px-4 z-[60] transition-all duration-300 ${
          isScrolled
            ? "-translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>maintenance@smhos.org</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>GRA Phase 1, PHC, Nigeria</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>+2348035977491</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <Link to="#" className="hover:text-gray-200">
              <Facebook className="h-4 w-4" />
            </Link>
            <Link to="#" className="hover:text-gray-200">
              <Twitter className="h-4 w-4" />
            </Link>
            <Link to="#" className="hover:text-gray-200">
              <Linkedin className="h-4 w-4" />
            </Link>
            <Link to="#" className="hover:text-gray-200">
              <Pinterest className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <header
        className={`fixed top-0 left-0 right-0 bg-white shadow-md z-50 transition-all duration-300 ${
          isScrolled ? "mt-0" : "md:mt-10"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/">
              <img src={logo} alt="Logo" className="h-[50px] md:h-[80px]" />
            </Link>
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => scrollToSection("home")}
                className="hover:text-[#FF8C00]"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="hover:text-[#FF8C00]"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="hover:text-[#FF8C00]"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("faqs")}
                className="hover:text-[#FF8C00]"
              >
                FAQs
              </button>
              <Link to="/sign-in">
                <button className="hover:text-[#FF8C00]">Login</button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-600 hover:text-[#FF8C00]"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <div
            className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-lg transition-all duration-300 ${
              isMenuOpen
                ? "opacity-100 visible translate-y-0"
                : "opacity-0 invisible -translate-y-2"
            }`}
          >
            <nav className="flex flex-col p-4 space-y-4">
              <button
                onClick={() => {
                  scrollToSection("home");
                  setIsMenuOpen(false);
                }}
                className="hover:text-[#FF8C00] text-left"
              >
                Home
              </button>
              <button
                onClick={() => {
                  scrollToSection("about");
                  setIsMenuOpen(false);
                }}
                className="hover:text-[#FF8C00] text-left"
              >
                About
              </button>
              <button
                onClick={() => {
                  scrollToSection("services");
                  setIsMenuOpen(false);
                }}
                className="hover:text-[#FF8C00] text-left"
              >
                Services
              </button>
              <button
                onClick={() => {
                  scrollToSection("faqs");
                  setIsMenuOpen(false);
                }}
                className="hover:text-[#FF8C00] text-left"
              >
                FAQs
              </button>
              <Link
                to="/sign-in"
                className="hover:text-[#FF8C00] text-left"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="pt-26 md:pt-32">
        <section
          id="home"
          className="relative h-screen flex items-center overflow-hidden"
        >
          {/* Slider Images */}
          <div className="absolute inset-0">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  currentSlide === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={slide}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Slider Content */}
          <div className=" max-w-7xl mx-auto px-4 relative z-10">
            <div className="max-w-6xl text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-6">
                Welcome to SMHOS Maintenance Management System
              </h1>
              <button className="bg-[#FF8C00] text-white px-6 py-3 md:px-8 md:py-4 rounded-md hover:bg-[#FF8C00]/90 transition-colors text-sm md:text-base">
                Get Started
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-[#FF8C00] transition-colors"
          >
            <span className="text-4xl">❮</span>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-[#FF8C00] transition-colors"
          >
            <span className="text-4xl">❯</span>
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentSlide === index ? "bg-[#FF8C00]" : "bg-white"
                }`}
              />
            ))}
          </div>
        </section>

        <section id="about" className="py-20">
          <div className="max-w-6xl mx-auto px-4 lg:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">About Our Services</h2>
                <p className="text-gray-600 leading-relaxed">
                  The maintenance and facility department of Salvation
                  Ministries is charged with the task of deploying, maintaining
                  and ensuring effective and smooth running of all equipment
                  within every property owned and managed by Salvation
                  Ministries. Our services cut across the Church, Staff
                  Quarters, School Arms, Offices, etc. Do not hesitate to make a
                  request via this portal if you require our services in any
                  way. God bless you.
                </p>
              </div>
              <div>
                <img src={about} alt="Logo" />
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="py-20 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400 mb-4">OUR SERVICES</p>
            <h2 className="text-4xl font-bold mb-4">
              We Provide Prompt And{" "}
              <span className="text-[#FF8C00]">Excellent Services</span>
            </h2>
            <OurServices />
          </div>
        </section>

        <section id="faqs" className="py-20">
          <div className="container mx-auto px-4">
            <p className="text-orange-600 font-semibold mb-4 text-center">
              OUR FAQS
            </p>
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <FaqSection />
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white">
        <Footer />
      </footer>
    </>
  );
}
