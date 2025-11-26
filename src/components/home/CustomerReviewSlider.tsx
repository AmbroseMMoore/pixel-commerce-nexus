import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Check } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Review {
  id: string;
  name: string;
  rating: number;
  review: string;
  verified?: boolean;
}

const reviews: Review[] = [
  {
    id: "1",
    name: "Sarah M.",
    rating: 5,
    review:
      "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations.",
    verified: true,
  },
  {
    id: "2",
    name: "Alex K.",
    rating: 5,
    review:
      "Finding clothes that align with my personal style used to be a challenge until I discovered cutebae.in. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.",
    verified: true,
  },
  {
    id: "3",
    name: "James L.",
    rating: 5,
    review:
      "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on point with the latest trends.",
    verified: true,
  },
];

const CustomerReviewSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + slidesToShow >= reviews.length ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, reviews.length - slidesToShow) : prev - 1));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={`${index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-dela text-custom-purple">OUR HAPPY CUSTOMERS</h2>
          <div className="flex space-x-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
              aria-label="Previous reviews"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
              aria-label="Next reviews"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
            }}
          >
            {reviews.map((review) => (
              <div key={review.id} className="flex-shrink-0 px-3" style={{ width: `${100 / slidesToShow}%` }}>
                <div className="w-full mx-auto">
                  <AspectRatio ratio={16 / 9}>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col">
                      <div className="flex items-center mb-3">{renderStars(review.rating)}</div>

                      <div className="flex items-center mb-4">
                        <h4 className="font-quicksand font-semibold text-gray-900">{review.name}</h4>
                        {review.verified && (
                          <div className="ml-2 flex items-center">
                            <Check size={16} className="text-green-500" />
                          </div>
                        )}
                      </div>

                      <p className="text-gray-600 font-quicksand leading-relaxed line-clamp-3">"{review.review}"</p>
                    </div>
                  </AspectRatio>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviewSlider;
