
import React, { useEffect, useState } from "react";

const AnimatedStars = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stars = [
    {
      src: "/lovable-uploads/cd5469d8-5b4e-4a22-8964-4e3f86f88959.png",
      className: "w-8 h-8 md:w-12 md:h-12",
      position: "top-[10%] left-[5%]",
      parallaxSpeed: 0.2,
      rotationSpeed: 1
    },
    {
      src: "/lovable-uploads/5a2be01f-7af2-4d74-9e5d-99fab7bed100.png",
      className: "w-6 h-6 md:w-10 md:h-10",
      position: "top-[25%] right-[8%]",
      parallaxSpeed: 0.3,
      rotationSpeed: -0.8
    },
    {
      src: "/lovable-uploads/7c6e75eb-b7be-4ba6-9f4f-f53c1a2c21b0.png",
      className: "w-5 h-5 md:w-8 md:h-8",
      position: "top-[45%] left-[3%]",
      parallaxSpeed: 0.15,
      rotationSpeed: 1.2
    },
    {
      src: "/lovable-uploads/cbc61789-f722-4a2a-b4b3-546a8e96a942.png",
      className: "w-7 h-7 md:w-11 md:h-11",
      position: "top-[65%] right-[5%]",
      parallaxSpeed: 0.25,
      rotationSpeed: -1.1
    },
    {
      src: "/lovable-uploads/7fb03b02-a358-4e9c-988c-93ead2836ea4.png",
      className: "w-6 h-6 md:w-9 md:h-9",
      position: "top-[80%] left-[7%]",
      parallaxSpeed: 0.35,
      rotationSpeed: 0.9
    },
    {
      src: "/lovable-uploads/cd5469d8-5b4e-4a22-8964-4e3f86f88959.png",
      className: "w-5 h-5 md:w-7 md:h-7",
      position: "top-[15%] right-[15%]",
      parallaxSpeed: 0.18,
      rotationSpeed: -1.3
    },
    {
      src: "/lovable-uploads/5a2be01f-7af2-4d74-9e5d-99fab7bed100.png",
      className: "w-8 h-8 md:w-10 md:h-10",
      position: "top-[35%] left-[12%]",
      parallaxSpeed: 0.28,
      rotationSpeed: 1.5
    },
    {
      src: "/lovable-uploads/7fb03b02-a358-4e9c-988c-93ead2836ea4.png",
      className: "w-4 h-4 md:w-6 md:h-6",
      position: "top-[55%] right-[12%]",
      parallaxSpeed: 0.22,
      rotationSpeed: -0.7
    }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((star, index) => (
        <div
          key={index}
          className={`absolute ${star.position} opacity-20 hover:opacity-30 transition-opacity duration-300`}
          style={{
            transform: `translateY(${scrollY * star.parallaxSpeed}px) rotate(${scrollY * star.rotationSpeed}deg)`,
            transition: 'opacity 0.3s ease-out'
          }}
        >
          <img
            src={star.src}
            alt=""
            className={`${star.className} object-contain`}
            style={{
              filter: 'blur(0.5px)',
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default AnimatedStars;
