
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Disc } from 'lucide-react';
import GlassCard from './GlassCard';
import { PLAYLIST_DATA } from '../playlist';

interface Song {
  title: string;
  artist: string;
  url: string;
}

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const playlist: Song[] = PLAYLIST_DATA;
  const currentTrack = playlist[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
        } else {
            audioRef.current.pause();
        }
    }
  }, [isPlaying, currentTrackIndex]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const handleEnded = () => {
      handleNext();
  };

  return (
    <div className={`fixed bottom-4 left-4 z-[60] transition-all duration-500 ease-spring ${isMinimized ? 'w-12' : 'w-80 max-w-[calc(100vw-2rem)]'}`}>
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={handleEnded}
        preload="auto"
      />

      <GlassCard className={`
        !rounded-[2rem] overflow-visible transition-all duration-500
        ${isMinimized ? 'p-0 h-12 w-12 !bg-white/60 dark:!bg-night-900/60' : 'p-4 !bg-white/70 dark:!bg-night-900/80'}
      `}>
        
        {/* Minimized View */}
        {isMinimized && (
           <button 
             onClick={() => setIsMinimized(false)}
             className="w-full h-full flex items-center justify-center rounded-full hover:bg-white/50 transition-colors group"
           >
             <Disc 
               size={24} 
               className={`text-sakura-500 ${isPlaying ? 'animate-spin-slow' : ''}`} 
             />
           </button>
        )}

        {/* Expanded View */}
        {!isMinimized && (
          <div className="relative flex flex-col gap-3">
             {/* Header */}
             <div className="flex items-center gap-3 border-b border-white/30 pb-2 mb-1">
                <div className={`
                    w-10 h-10 rounded-full bg-gradient-to-tr from-sakura-300 to-sakura-500 flex items-center justify-center shadow-md
                    ${isPlaying ? 'animate-spin-slow' : ''}
                `}>
                    <Music size={18} className="text-white" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 dark:text-sakura-100 truncate">
                           {currentTrack.title}
                        </span>
                        <span className="text-[10px] font-bold text-sakura-500 dark:text-sakura-300 truncate">
                           {currentTrack.artist}
                        </span>
                    </div>
                </div>
                {/* Minimize Button */}
                <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                   <div className="w-8 h-1 bg-slate-300 dark:bg-sakura-800 rounded-full" />
                </button>
             </div>

             {/* Controls */}
             <div className="flex items-center justify-between px-2">
                <button onClick={handlePrev} className="text-slate-500 dark:text-sakura-200 hover:text-sakura-500 transition-colors hover:scale-110">
                   <SkipBack size={20} fill="currentColor" />
                </button>
                
                <button 
                  onClick={handlePlayPause} 
                  className="w-10 h-10 flex items-center justify-center bg-sakura-500 text-white rounded-full shadow-lg shadow-sakura-500/40 hover:scale-110 active:scale-95 transition-all"
                >
                   {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                </button>

                <button onClick={handleNext} className="text-slate-500 dark:text-sakura-200 hover:text-sakura-500 transition-colors hover:scale-110">
                   <SkipForward size={20} fill="currentColor" />
                </button>
             </div>

             {/* Volume */}
             <div className="flex items-center gap-2 px-2 pt-1">
                <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-sakura-400">
                   {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                  }}
                  className="w-full h-1 bg-slate-200 dark:bg-sakura-900 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-sakura-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                />
             </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default MusicPlayer;
