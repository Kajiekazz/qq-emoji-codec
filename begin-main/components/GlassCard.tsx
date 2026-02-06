
import React, { useEffect, useState } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  title?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = "", 
  onClick,
  hoverEffect = false,
  title
}) => {
  // Random delay to make the breathing effect feel organic and not robotic/synchronized
  const [animDelay, setAnimDelay] = useState('0s');

  useEffect(() => {
    setAnimDelay(`-${Math.random() * 5}s`);
  }, []);

  return (
    <div 
      onClick={onClick}
      title={title}
      style={{ animationDelay: animDelay }}
      className={`
        relative
        backdrop-blur-xl
        animate-breathe
        
        /* Light Mode */
        bg-white/40 
        border border-white/60
        shadow-[0_8px_32px_0_rgba(255,175,204,0.15)]
        
        /* Dark Mode: Pink Tinted */
        dark:bg-night-900/40
        dark:border-sakura-500/20
        dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]

        rounded-[2rem]
        transition-all duration-500 ease-silk
        overflow-hidden
        
        ${hoverEffect ? `
          cursor-pointer 
          hover:translate-y-[-6px] 
          hover:shadow-glow dark:hover:shadow-glow-dark
          hover:bg-white/60 dark:hover:bg-night-800/60
          hover:border-white/80 dark:hover:border-sakura-400/40
          active:scale-[0.98]
          /* Pause breathing on hover for stability */
          hover:[animation-play-state:paused]
        ` : ''}
        
        ${className}
      `}
    >
      {/* Inner Gloss Reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none opacity-100 dark:opacity-10" />
      
      {children}
    </div>
  );
};

export default GlassCard;
