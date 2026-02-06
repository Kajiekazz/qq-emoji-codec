import React, { useEffect, useState } from 'react';

interface SakuraRainProps {
  onCatch?: (x: number, y: number) => void;
}

interface Petal {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  bgClass: string;
}

const SakuraRain: React.FC<SakuraRainProps> = ({ onCatch }) => {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    // Create 25 petals
    const initialPetals = Array.from({ length: 25 }).map((_, i) => generatePetal(i));
    setPetals(initialPetals);
  }, []);

  const generatePetal = (id: number): Petal => ({
    id,
    left: Math.random() * 100, // Random horizontal position 0-100%
    duration: 6 + Math.random() * 8, // 6s to 14s fall duration
    delay: Math.random() * -10, // Negative delay to start falling immediately
    size: 12 + Math.random() * 16, // 12px to 28px size
    bgClass: Math.random() > 0.5 ? 'bg-sakura-300' : 'bg-pink-300', // Slight color variation
  });

  const handlePetalClick = (e: React.MouseEvent, id: number) => {
    // Stop propagation to prevent clicking elements behind it if overlap occurs
    e.stopPropagation();
    
    if (onCatch) {
      onCatch(e.clientX, e.clientY);
    }

    // Reset/Recycle the petal immediately to top
    setPetals(prev => prev.map(p => {
      if (p.id === id) {
        // Create a new petal instance to restart animation
        const newItem = generatePetal(id);
        newItem.delay = 0; 
        return newItem;
      }
      return p;
    }));
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {petals.map((petal) => (
        <div
          key={`${petal.id}-${petal.duration}`} // Changing key forces re-render on reset
          onMouseDown={(e) => handlePetalClick(e, petal.id)}
          className={`
            absolute
            sakura-petal
            rounded-tl-none rounded-tr-[100%] rounded-br-none rounded-bl-[100%]
            opacity-80 dark:opacity-60
            hover:scale-150 hover:brightness-110 cursor-crosshair
            pointer-events-auto
            shadow-sm
            ${petal.bgClass}
          `}
          style={{
            left: `${petal.left}%`,
            width: `${petal.size}px`,
            height: `${petal.size * 1.3}px`,
            animation: `fall-sway ${petal.duration}s linear infinite`,
            animationDelay: `${petal.delay}s`,
            zIndex: 50, // Ensure it's above the wallpaper
          }}
        />
      ))}
    </div>
  );
};

export default SakuraRain;