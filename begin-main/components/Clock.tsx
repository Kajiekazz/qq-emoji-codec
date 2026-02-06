import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="relative group cursor-default text-center lg:text-left select-none">
      <h1 className="text-6xl lg:text-8xl font-black tracking-tighter text-white dark:text-sakura-100 drop-shadow-lg leading-none transition-colors duration-500" 
          style={{ textShadow: 'var(--tw-shadow-color)' }}>
        {formatTime(time)}
      </h1>
      <div className="inline-block mt-2">
        <p className="text-lg lg:text-xl font-bold tracking-wide text-white/90 dark:text-sakura-200 drop-shadow-md bg-white/20 dark:bg-night-900/30 px-4 py-1 rounded-xl backdrop-blur-md border border-white/30 dark:border-sakura-500/20 transition-colors duration-500">
          {formatDate(time)}
        </p>
      </div>
    </div>
  );
};

export default Clock;