import React, { useState } from 'react';
import { MessageCircleHeart, Sparkles } from 'lucide-react';

const Mascot: React.FC = () => {
  const [isHappy, setIsHappy] = useState(false);
  const [bounce, setBounce] = useState(false);

  const handleClick = () => {
    setIsHappy(true);
    setBounce(true);
    
    // Reset animations
    setTimeout(() => setBounce(false), 500);
    setTimeout(() => setIsHappy(false), 2000);
  };

  return (
    <div className="relative group z-20 inline-block">
      {/* Speech Bubble */}
      <div className={`
        absolute -top-14 left-1/2 -translate-x-1/2 
        bg-white/90 dark:bg-night-800/90 px-3 py-1.5 rounded-2xl rounded-bl-none
        shadow-lg border border-sakura-200 dark:border-sakura-700
        transition-all duration-300 transform origin-bottom-left
        w-max max-w-[200px] z-30
        ${isHappy ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
      `}>
        <p className="text-sakura-600 dark:text-sakura-200 font-bold text-xs flex items-center gap-1">
           <MessageCircleHeart size={14} className="text-sakura-400" />
           {isHappy ? "Happy!" : "..."}
        </p>
      </div>

      {/* CSS Mascot: The "Giftia Spirit" */}
      <div 
        onClick={handleClick}
        className={`
          relative w-32 h-32 cursor-pointer transition-all duration-300
          hover:scale-110
          ${bounce ? 'scale-90 translate-y-2' : 'animate-float'}
        `}
      >
         {/* Glow */}
         <div className="absolute inset-0 bg-sakura-400/30 rounded-full blur-xl animate-pulse" />
         
         {/* Body */}
         <div className={`
           w-full h-full bg-gradient-to-b from-white to-sakura-200 dark:from-sakura-200 dark:to-sakura-500
           slime-body shadow-inner border-4 border-white/50 dark:border-white/20
           relative overflow-hidden
         `}>
            {/* Face */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex gap-4">
               {/* Eyes */}
               <div className={`w-3 h-4 bg-slate-800 dark:bg-white rounded-full ${isHappy ? 'scale-y-50 translate-y-1' : ''} transition-all`} />
               <div className={`w-3 h-4 bg-slate-800 dark:bg-white rounded-full ${isHappy ? 'scale-y-50 translate-y-1' : ''} transition-all`} />
            </div>
            {/* Blush */}
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-16 flex justify-between px-1 opacity-40">
               <div className="w-3 h-1.5 bg-pink-500 rounded-full" />
               <div className="w-3 h-1.5 bg-pink-500 rounded-full" />
            </div>
            {/* Mouth */}
            <div className={`
               absolute top-[50%] left-1/2 -translate-x-1/2 
               w-4 h-2 border-b-2 border-slate-800 dark:border-white rounded-full
               transition-all
               ${isHappy ? 'h-4 w-6 bg-red-400 border-none' : ''}
            `} />
         </div>

         {/* Antenna / Sprout */}
         <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
             <div className={`w-6 h-6 text-yellow-300 ${isHappy ? 'animate-spin' : ''}`}>
                <Sparkles size={24} fill="currentColor" />
             </div>
         </div>
      </div>
    </div>
  );
};

export default Mascot;