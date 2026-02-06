
import React, { useState } from 'react';
import { PROFILE, LINKS } from './constants';
import GlassCard from './GlassCard';
import { Sparkles, Heart, Code, Gamepad2, Mail } from 'lucide-react';

interface ProfileCardProps {
  xp: number;
  level: number;
  onPlayGame?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ xp, level, onPlayGame }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  // Calculate XP bar percentage (simple logic: every 100 XP is a level, so XP % 100)
  const progress = (xp % 100);

  return (
    <div className="relative group w-full max-w-md [perspective:1000px]">
        
        {/* FLIP CONTAINER */}
        <div 
          className={`
            relative w-full transition-all duration-700 [transform-style:preserve-3d] cursor-pointer
            ${isFlipped ? '[transform:rotateY(180deg)]' : ''}
          `}
          onClick={() => setIsFlipped(!isFlipped)}
        >
            {/* --- FRONT FACE --- */}
            <div className="relative [backface-visibility:hidden] z-10">
                
                {/* Floating Badge (Level) - Attached to front face */}
                <div className="absolute -top-4 -right-4 z-20 animate-bounce-slight delay-700">
                    <div className="bg-sakura-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-glow border-2 border-white rotate-12">
                        LV. {level}
                    </div>
                </div>

                <GlassCard className="w-full p-6 overflow-visible relative !bg-white/60 dark:!bg-night-900/60 !border-white/60 dark:!border-sakura-500/30 shadow-glow dark:shadow-glow-dark">
                
                    {/* Background Decor */}
                    <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
                        {/* Pink gradient wash */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-sakura-200/50 to-transparent dark:from-sakura-900/40" />
                        {/* Circles */}
                        <div className="absolute -right-10 top-10 w-32 h-32 bg-sakura-300/20 rounded-full blur-2xl" />
                        <div className="absolute -left-10 bottom-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        
                        {/* Avatar Section */}
                        <div className="relative group/avatar">
                            {/* Spinning Ring */}
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-sakura-400/50 animate-spin-slow" />
                            
                            <div className="w-28 h-28 m-2 rounded-full overflow-hidden border-4 border-white dark:border-sakura-400 shadow-lg relative z-10 bg-sakura-100">
                                <img 
                                    src={PROFILE.avatar} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110 group-hover/avatar:rotate-3" 
                                />
                            </div>
                            
                            {/* Status Indicator */}
                            <div className="absolute bottom-3 right-3 z-20 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full shadow-sm animate-pulse" />
                        </div>

                        {/* Name & Title */}
                        <div className="mt-4 text-center">
                            <h1 className="text-3xl font-black text-slate-800 dark:text-sakura-100 tracking-tight">
                                {PROFILE.name}
                            </h1>
                            <div className="inline-flex items-center gap-1 mt-1 px-3 py-0.5 rounded-full bg-sakura-100 dark:bg-sakura-900/50 border border-sakura-200 dark:border-sakura-700">
                                <Sparkles size={10} className="text-sakura-500" />
                                <span className="text-xs font-bold text-sakura-600 dark:text-sakura-200 uppercase tracking-wider">
                                    {PROFILE.title}
                                </span>
                            </div>
                        </div>

                        {/* Stats Box (Formerly Bio, now just Level Progress) */}
                        <div className="w-full mt-6 bg-white/50 dark:bg-black/20 rounded-xl p-3 border border-white/60 dark:border-sakura-500/20">
                            <div className="flex items-center justify-between text-[10px] font-bold text-sakura-400 mb-1 px-1">
                                <span>XP</span>
                                <span>{progress} / 100</span>
                            </div>
                            <div className="w-full h-1.5 bg-sakura-100 dark:bg-white/10 rounded-full overflow-hidden">
                                <div 
                                className="h-full bg-gradient-to-r from-sakura-300 to-sakura-500 rounded-full transition-all duration-300" 
                                style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Tags / Skills */}
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {PROFILE.tags.map((tag, i) => (
                                <span key={i} className="px-3 py-1 text-[10px] font-bold bg-white dark:bg-night-800 text-slate-600 dark:text-sakura-200 rounded-lg shadow-sm border border-slate-100 dark:border-sakura-800 hover:scale-105 transition-transform cursor-default">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        
                        {/* Bottom Action Area */}
                        <div className="mt-6 flex gap-4 w-full justify-center">
                            <button 
                                onClick={(e) => { e.stopPropagation(); window.open(`mailto:${PROFILE.email}`); }}
                                className="p-2 rounded-full bg-sakura-50 hover:bg-sakura-100 text-sakura-400 transition-colors"
                                title="Email Me"
                            >
                                <Mail size={18} />
                            </button>

                            <button 
                                onClick={(e) => { e.stopPropagation(); if(onPlayGame) onPlayGame(); }}
                                className="p-2 rounded-full bg-sakura-50 hover:bg-sakura-100 text-sakura-400 transition-colors hover:rotate-12 hover:scale-110 active:scale-95 duration-300"
                                title="Play Mini-Game"
                            >
                                <Gamepad2 size={18} />
                            </button>
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); window.open(LINKS.find(l => l.category === 'dev')?.url || 'https://github.com', '_blank'); }}
                                className="p-2 rounded-full bg-sakura-50 hover:bg-sakura-100 text-sakura-400 transition-colors"
                                title="Code"
                            >
                                <Code size={18} />
                            </button>
                        </div>

                    </div>
                </GlassCard>
            </div>

            {/* --- BACK FACE --- */}
            <div className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] z-10 rounded-[2rem] overflow-hidden shadow-glow dark:shadow-glow-dark border border-white/60 dark:border-sakura-500/30 bg-white/60 dark:bg-night-900/60 backdrop-blur-xl">
                <img 
                    src={PROFILE.gif} 
                    className="w-full h-full object-cover" 
                    alt="Profile Animation"
                />
                {/* Optional: Add a prompt to flip back */}
                <div className="absolute bottom-2 w-full text-center">
                     <span className="text-[10px] text-white/80 bg-black/20 px-2 py-1 rounded-full backdrop-blur-md">Click to flip back</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProfileCard;
