
import React from 'react';

interface AnimatedStarsProps {
  className?: string;
}

const AnimatedStars: React.FC<AnimatedStarsProps> = ({ className = "" }) => {
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            <div 
              className="bg-white rounded-full opacity-20"
              style={{
                width: `${1 + Math.random() * 3}px`,
                height: `${1 + Math.random() * 3}px`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedStars;
