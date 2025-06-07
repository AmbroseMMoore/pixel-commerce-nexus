
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchHeroSlides, HeroSlide } from "@/services/cmsApi";

interface HeroSliderProps {
  slides?: HeroSlide[];
}

const HeroSlider = ({ slides: propSlides }: HeroSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load slides from database
  useEffect(() => {
    const loadSlides = async () => {
      try {
        const dbSlides = await fetchHeroSlides();
        if (dbSlides.length > 0) {
          setSlides(dbSlides);
        } else if (propSlides) {
          setSlides(propSlides);
        } else {
          setSlides([{
            id: "default",
            title: "Welcome to CuteBae",
            subtitle: "Discover amazing products for kids",
            cta_text: "Shop Now",
            cta_link: "/category/boys",
            image_url: "/placeholder.svg",
            order_index: 0,
            is_active: true
          }]);
        }
      } catch (error) {
        console.error('Error loading hero slides:', error);
        if (propSlides) {
          setSlides(propSlides);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSlides();
  }, [propSlides]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (isLoading) {
    return (
      <div className="relative w-[97vw] h-[70vh] bg-gray-900 rounded-2xl mx-auto overflow-hidden animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300"></div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative w-[97vw] h-[70vh] bg-gray-900 rounded-2xl overflow-hidden group mx-auto">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out"
        style={{ 
          backgroundImage: `url(${currentSlideData.image_url})`,
        }}
      >
      </div>

      {/* Content Container - Centered on desktop, bottom-aligned on mobile */}
      <div className="relative z-10 flex items-center md:justify-center justify-center h-full px-4 md:px-8">
        <div className="text-center text-white max-w-4xl md:relative absolute bottom-8 left-1/2 md:left-auto md:bottom-auto md:transform-none transform -translate-x-1/2">
          <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold mb-4 font-holtwood leading-tight">
            {currentSlideData.title}
          </h1>
          <p className="text-base md:text-xl lg:text-2xl mb-6 md:mb-8 font-quicksand opacity-90">
            {currentSlideData.subtitle}
          </p>
          <Button 
            size="lg" 
            className="bg-white text-black hover:bg-gray-100 font-quicksand font-semibold px-6 md:px-8 py-2 md:py-3 text-base md:text-lg"
            onClick={() => window.location.href = currentSlideData.cta_link}
          >
            {currentSlideData.cta_text}
          </Button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                currentSlide === index 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
