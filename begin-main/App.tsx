
import React, { useState, useEffect, useCallback } from 'react';
import { BACKGROUND_IMAGE, PROFILE } from './components/constants';
import Clock from './components/Clock';
import LinkGrid from './components/LinkGrid';
import ProfileCard from './components/ProfileCard';
import CustomCursor from './components/CustomCursor';
import GlassCard from './components/GlassCard';
import SakuraRain from './components/SakuraRain';
import PixelGame from './components/PixelGame';
import DestroyerPlane from './components/DestroyerPlane';
import MusicPlayer from './components/MusicPlayer';
import TypewriterBio from './components/TypewriterBio';
import { Settings2, ImageOff, Image as ImageIcon, Moon, Sun, Rss, Map, Plane } from 'lucide-react';

function App() {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [showWallpaper, setShowWallpaper] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isDestroyerMode, setIsDestroyerMode] = useState(false);
  
  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // Game State
  const [xp, setXp] = useState(250);
  const [floatingTexts, setFloatingTexts] = useState<{id: number, x: number, y: number, text: string}[]>([]);

  // Toggle Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const img = new Image();
    img.src = BACKGROUND_IMAGE;
    img.onload = () => {
      setBgLoaded(true);
      setTimeout(() => setIsLoading(false), 1500);
    };
    // Fallback if image takes too long
    setTimeout(() => setIsLoading(false), 5000);
  }, []);

  // Helper to add XP from any source - Wrapped in useCallback for stability
  const addXp = useCallback((amount: number, x?: number, y?: number) => {
    setXp(prev => prev + amount);
    if (x !== undefined && y !== undefined) {
       const id = Date.now() + Math.random();
       setFloatingTexts(prev => [...prev, { id, x, y, text: `+${amount} XP` }]);
       setTimeout(() => {
         setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
       }, 1000);
    }
  }, []);

  // Game Logic: Catching Petals (Main Menu)
  const handleCatchPetal = (x: number, y: number) => {
    addXp(10, x, y);
  };

  // Level Calculation
  const level = Math.floor(xp / 100) + 1;

  const handleFooterLink = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    if (name === 'RSS Feed') {
      window.open('/rss.xml', '_blank');
    } else if (name === 'Sitemap') {
      window.open('/sitemap.xml', '_blank');
    }
  };

  return (
    <>
      {/* Loading Screen Overlay */}
      <div className={`
        fixed inset-0 z-[99999] bg-sakura-50 dark:bg-night-950 flex flex-col items-center justify-center
        transition-opacity duration-1000 pointer-events-none
        ${isLoading ? 'opacity-100' : 'opacity-0'}
      `}>
        {/* Loading Avatar */}
        <div className="relative mb-8 group">
           <div className="absolute inset-0 bg-sakura-400/30 rounded-full blur-xl animate-pulse" />
           <img 
             src={PROFILE.avatar} 
             alt="Loading..." 
             className="w-24 h-24 rounded-full border-4 border-white shadow-glow relative z-10 animate-bounce-slight"
           />
        </div>

        <div className="w-16 h-16 border-4 border-sakura-200 border-t-sakura-500 rounded-full animate-spin mb-8" />
        <h2 className="text-2xl font-bold text-sakura-500 animate-pulse">INITIALIZING</h2>
        <div className="w-64 h-1 bg-sakura-200 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-sakura-500 loader-bar" />
        </div>
      </div>

      {/* PIXEL MINI GAME OVERLAY */}
      {isGameOpen && (
        <PixelGame onClose={() => setIsGameOpen(false)} onAddXp={addXp} />
      )}

      {/* DESTROYER MODE OVERLAY */}
      {isDestroyerMode && (
        <DestroyerPlane />
      )}

      <div className="min-h-screen w-full relative overflow-hidden font-sans text-slate-800 dark:text-sakura-100 selection:bg-sakura-200 selection:text-sakura-900 dark:selection:bg-sakura-500 dark:selection:text-white transition-colors duration-700 bg-sakura-50 dark:bg-night-950">
        
        <CustomCursor />

        {/* Floating Text Layer for Game */}
        <div className="fixed inset-0 pointer-events-none z-[100]">
          {floatingTexts.map(ft => (
            <div 
              key={ft.id} 
              className="absolute text-sakura-600 dark:text-sakura-300 font-black text-xl animate-float select-none"
              style={{ left: ft.x, top: ft.y, textShadow: '0 0 10px rgba(255,255,255,0.8)' }}
            >
              {ft.text}
            </div>
          ))}
        </div>

        {/* BACKGROUND LAYERS */}
        
        {/* 1. Wallpaper Layer */}
        <div 
          className={`fixed inset-0 z-0 bg-cover bg-center transition-all duration-[2s] ease-out 
            ${bgLoaded && showWallpaper ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}
          `}
          style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
        />

        {/* 2. "No Wallpaper" Fallback Design (Stationery/Grid Style) */}
        <div className={`
          fixed inset-0 z-0 transition-opacity duration-1000 pointer-events-none
          ${showWallpaper ? 'opacity-0' : 'opacity-100'}
        `}>
            {/* Base Color: Warm Cream in Light, Deep Purple in Dark */}
            <div className="absolute inset-0 bg-[#fff0f5] dark:bg-[#2a0210]" />
            
            {/* Pattern: Dot Grid */}
            <div 
              className="absolute inset-0 opacity-[0.15] dark:opacity-[0.1]" 
              style={{ 
                backgroundImage: 'radial-gradient(circle, #fb6f92 2px, transparent 2px)', 
                backgroundSize: '32px 32px' 
              }} 
            />
            
            {/* Ambient Blobs (Softer) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-60 dark:opacity-40">
              <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-sakura-200 dark:bg-sakura-900 rounded-full blur-[120px] animate-float" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-sky-200 dark:bg-indigo-900 rounded-full blur-[120px] animate-float-delayed" />
            </div>
        </div>

        {/* 3. Readability Overlay (Only active when wallpaper is ON) */}
        <div className={`
          fixed inset-0 z-[1] pointer-events-none transition-all duration-700
          ${showWallpaper ? 'backdrop-blur-[2px] bg-white/10 dark:bg-night-950/30' : 'backdrop-blur-none bg-transparent'}
        `} />
        
        {/* 4. Sakura Rain (Game Layer) */}
        <div className="fixed inset-0 z-[5] pointer-events-none">
           <SakuraRain onCatch={handleCatchPetal} />
        </div>
        
        {/* MUSIC PLAYER (Fixed Bottom Left) */}
        <MusicPlayer />

        {/* MAIN CONTENT */}
        <main className={`
          relative z-10 container mx-auto px-4 min-h-screen flex flex-col items-center py-10
          transition-all duration-1000
          ${isLoading ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}
        `}>
          
          {/* Settings Toggle */}
          <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2 safe-zone">
            <button 
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-3 bg-white/40 dark:bg-night-900/60 hover:bg-white/70 dark:hover:bg-night-800/80 backdrop-blur-md rounded-full text-sakura-600 dark:text-sakura-300 transition-all shadow-sm border border-white/40 dark:border-sakura-500/20 group hover:rotate-90 duration-500"
            >
              <Settings2 size={24} />
            </button>

            <div className={`
              flex flex-col gap-2 transition-all duration-300 origin-top-right
              ${settingsOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 -translate-y-4 pointer-events-none'}
            `}>
              <GlassCard 
                onClick={() => setIsDarkMode(!isDarkMode)}
                hoverEffect={true}
                className="!rounded-full p-3 !bg-white/80 dark:!bg-night-800/80 flex items-center justify-center group"
                title="Toggle Dark Mode"
              >
                 {isDarkMode ? <Moon size={20} className="text-sakura-400" /> : <Sun size={20} className="text-amber-400" />}
              </GlassCard>

              <GlassCard 
                onClick={() => setShowWallpaper(!showWallpaper)}
                hoverEffect={true}
                className="!rounded-full p-3 !bg-white/80 dark:!bg-night-800/80 flex items-center justify-center group"
                title="Toggle Wallpaper"
              >
                 {showWallpaper ? <ImageOff size={20} className="text-slate-500 dark:text-sakura-300" /> : <ImageIcon size={20} className="text-sakura-400" />}
              </GlassCard>

              <GlassCard 
                onClick={() => {
                  setIsDestroyerMode(!isDestroyerMode);
                  if (!isDestroyerMode) setSettingsOpen(false);
                }}
                hoverEffect={true}
                className={`!rounded-full p-3 flex items-center justify-center group transition-all ${isDestroyerMode ? '!bg-red-500 border-red-400' : '!bg-white/80 dark:!bg-night-800/80'}`}
                title="Destroyer Mode"
              >
                 <Plane size={20} className={isDestroyerMode ? 'text-white' : 'text-sakura-500'} />
              </GlassCard>
            </div>
          </div>

          {/* LAYOUT: TOP SECTION (Clock & Bio) */}
          <div className="w-full flex flex-col items-center justify-center mt-4 md:mt-12 mb-8 lg:mb-16 z-20">
             <div className="animate-float" style={{ animationDuration: '8s' }}>
                <Clock />
             </div>
             
             <div className="mt-6 z-20">
                <TypewriterBio text={PROFILE.bio} />
             </div>
          </div>

          {/* LAYOUT: CONTENT GRID (Profile & Links) */}
          <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-20 relative">
             
             {/* LEFT: Profile Card */}
             <div className="w-full max-w-md lg:w-auto lg:max-w-none z-10">
                <ProfileCard xp={xp} level={level} onPlayGame={() => setIsGameOpen(true)} />
             </div>

             {/* RIGHT: Link Grid */}
             <div className="w-full max-w-md z-10 lg:pt-8">
                <LinkGrid />
             </div>
          </div>

          {/* FOOTER */}
          <footer className="mt-auto pt-16 pb-6 w-full text-center pointer-events-auto z-20 flex flex-col items-center gap-4">
            <div className="flex gap-4">
               <button 
                 onClick={(e) => handleFooterLink(e, 'RSS Feed')}
                 className="text-slate-400 hover:text-sakura-500 transition-colors cursor-pointer" 
                 title="RSS Feed"
               >
                 <Rss size={16} />
               </button>
               <button 
                 onClick={(e) => handleFooterLink(e, 'Sitemap')}
                 className="text-slate-400 hover:text-sakura-500 transition-colors cursor-pointer" 
                 title="Sitemap"
               >
                 <Map size={16} />
               </button>
            </div>
            
            <div className="flex flex-col items-center gap-2">
                <p className="text-slate-500 dark:text-sakura-200/60 font-bold text-xs drop-shadow-sm">
                   {(new Date()).getFullYear()} © {PROFILE.name}'s Space
                </p>
                
                {/* MOE ICP FOOTER LINK */}
                <a 
                  href="https://icp.gov.moe/?keyword=20250940" 
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 dark:bg-night-800/40 hover:bg-white/60 dark:hover:bg-sakura-900/40 border border-white/20 dark:border-sakura-500/10 transition-all duration-300 group shadow-sm"
                >
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sakura-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sakura-500"></span>
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 dark:text-sakura-300 group-hover:text-sakura-600 dark:group-hover:text-sakura-200 transition-colors">
                     萌ICP备20250940号
                   </span>
                </a>
            </div>
          </footer>

        </main>
      </div>
    </>
  );
}

export default App;