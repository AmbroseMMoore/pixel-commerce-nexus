
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
}

const HeroSection = ({ title, subtitle, ctaText, ctaLink, image }: HeroSectionProps) => {
  return (
    <section className="relative h-[500px] md:h-[600px] bg-gray-100 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>
      
      <div className="relative h-full container-custom flex flex-col justify-center items-start">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-lg">
          {title}
        </h1>
        <p className="text-xl text-white mb-8 max-w-lg opacity-90">
          {subtitle}
        </p>
        <Button asChild className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg font-medium">
          <Link to={ctaLink}>{ctaText}</Link>
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
