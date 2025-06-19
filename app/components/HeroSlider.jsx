
import React, { useState, useEffect, useRef } from "react";
import { RxCaretRight, RxCaretLeft } from "react-icons/rx";

const slides = [
  {
    name: "Kelemi",
    imageDesktop: "/kelemi.webp",
    imageMobile: "/kelemi-mobile.webp",
  },
  {
    name: "Vivo",
    imageDesktop: "/vivo30.webp",
    imageMobile: "/vivo30-mobile.webp",
  },
  {
    name: "Style Capital",
    imageDesktop: "/style-capital.webp",
    imageMobile: "/style-capital-mobile.webp",
  },
];

const HeroSlider = () => {
  const [index, setIndex] = useState(0);
  const totalSlides = slides.length;
  const intervalRef = useRef(null);
  const sliderRef = useRef(null);

  const startXRef = useRef(null);
  const endXRef = useRef(null);

  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % totalSlides);
    }, 3000);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoSlide();

    return stopAutoSlide;
  }, []);

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % totalSlides);
  };

  const handleDotClick = (i) => {
    setIndex(i);
  };

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    endXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (startXRef.current !== null && endXRef.current !== null) {
      const delta = startXRef.current - endXRef.current;

      if (Math.abs(delta) > 50) {
        if (delta > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    startXRef.current = null;
    endXRef.current = null;
  };

  return (
    <div
      ref={sliderRef}
      className="relative w-full mx-auto   "
      // onMouseEnter={stopAutoSlide}
      // onMouseLeave={startAutoSlide}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <div className="relative h-[400px]  max-w-8xl lg:h-[480px] -mx-6 hero-slider">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100 z-1" : "opacity-0 z-0"
            }`}
          >
            {/* Desktop Image */}
            <img
              alt={slide.name}
              className="hidden sm:block object-cover w-full h-full"
              src={slide.imageDesktop}
            />

            {/* Mobile Image */}
            <img
              alt={slide.name}
              className="block sm:hidden object-cover w-full h-full"
              src={slide.imageMobile}
            />
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        className="hidden lg:absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full z-20"
        onClick={handlePrev}
      >
        <RxCaretLeft size={20} />
      </button>
      <button
        className="hidden lg:absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full z-20"
        onClick={handleNext}
      >
        <RxCaretRight size={20} />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full ${
              i === index ? "bg-black" : "bg-white/50"
            }`}
            onClick={() => handleDotClick(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;