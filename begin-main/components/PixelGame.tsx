
import React, { useEffect, useRef, useState } from 'react';
import { Trophy, Heart, Crown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

interface PixelGameProps {
  onClose: () => void;
  onAddXp: (amount: number) => void;
}

// --- ASSETS & CONFIG ---

const SPRITE_MAP = {
  player: [
    "......SSSS......", 
    ".....SSSSSS.....",
    "....SSSSSSSS....",
    "....SSSSSSSS....",
    "...SSSSSSSSSS...", 
    "...SSSRFFRSSS...", 
    "...SSSFFFFSSS...",
    "....SSFFFFSS....", 
    ".....WWWWWW.....", 
    "....WWWWWWWW....", 
    "....WWWWWWWW....",
    "...WWWWWWWWWW...", 
    "...WWWWWWWWWW...",
    "...WW..WW..WW...", 
    "...L...WW...L...", 
    ".......LL......."  
  ],
  enemy: [
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "....XXXXXXXX....", 
    "...XXXXXXXXXX...",
    "..XXXXXXXXXXXX..",
    "..XXXXXXXXXXXX..",
    "................"
  ]
};

const COLORS: Record<string, string> = {
  'S': '#e2e8f0', 
  'R': '#ef4444', 
  'F': '#ffe4e6', 
  'W': '#ffffff', 
  'L': '#94a3b8', 
  'X': '#ef4444', 
};

type EntityType = 'PETAL_PINK' | 'PETAL_GOLD' | 'PETAL_DARK' | 'ENEMY_GROUND';

interface Entity {
  id: number;
  type: EntityType;
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
  active: boolean;
}

interface LeaderboardEntry {
  score: number;
  date: string;
}

const GAME_DURATION = 60; // 60 seconds
const MAX_HP = 5;

const PixelGame: React.FC<PixelGameProps> = ({ onClose, onAddXp }) => {
  const [gameState, setGameState] = useState<'TRANSITION' | 'PLAYING' | 'GAMEOVER'>('TRANSITION');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // UI State
  const [uiScore, setUiScore] = useState(0);
  const [uiHp, setUiHp] = useState(MAX_HP);
  const [uiCombo, setUiCombo] = useState(0);
  const [uiTime, setUiTime] = useState(GAME_DURATION);
  const [showStageTitle, setShowStageTitle] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // AUDIO
  const audioCtxRef = useRef<AudioContext | null>(null);

  // GAME LOGIC REFS
  const scoreRef = useRef(0);
  const hpRef = useRef(MAX_HP);
  const comboRef = useRef(0);
  const gameTimeRef = useRef(GAME_DURATION);
  
  const player = useRef({ 
    x: 144, 
    y: 200, 
    vx: 0, 
    vy: 0, 
    isGrounded: true,
    width: 32,  
    height: 32,
    hitboxWidth: 16,
    hitboxOffset: 8
  });
  
  const keys = useRef<{ [key: string]: boolean }>({});
  const entities = useRef<Entity[]>([]);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const enemySpawnTimerRef = useRef<number>(0);
  const gameLoopRef = useRef<number>(0);

  // --- AUDIO SYSTEM ---
  const initAudio = () => {
      if (!audioCtxRef.current) {
          const Ctor = window.AudioContext || (window as any).webkitAudioContext;
          if (Ctor) audioCtxRef.current = new Ctor();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
      }
  };

  const playSfx = (type: 'jump' | 'coin' | 'hit' | 'gameover') => {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'jump') {
          // Rising square wave
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.linearRampToValueAtTime(300, now + 0.1);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
      } else if (type === 'coin') {
          // High ping (sine/square mix simulation via high pitch)
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.setValueAtTime(1600, now + 0.05);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
      } else if (type === 'hit') {
          // Low noise/sawtooth
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
      } else if (type === 'gameover') {
          // Descending slide
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.linearRampToValueAtTime(50, now + 1.0);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0, now + 1.0);
          osc.start(now);
          osc.stop(now + 1.0);
      }
  };

  // Load Leaderboard
  useEffect(() => {
    const savedLB = localStorage.getItem('ETHERIA_LEADERBOARD');
    if (savedLB) {
      setLeaderboard(JSON.parse(savedLB));
    }

    const sequence = async () => {
      await new Promise(r => setTimeout(r, 500));
      setShowStageTitle(true);
      await new Promise(r => setTimeout(r, 2500));
      setShowStageTitle(false);
      setGameState('PLAYING');
      lastTimeRef.current = performance.now();
      initAudio();
    };
    sequence();

    return () => {
        if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      
      if (gameState === 'GAMEOVER' && e.code === 'Enter') {
        onClose();
      }
      
      // Jump
      if ((e.code === 'Space' || e.code === 'ArrowUp') && gameState === 'PLAYING') {
        if (player.current.isGrounded) {
          player.current.vy = -350; 
          player.current.isGrounded = false;
          playSfx('jump');
        }
      }

      if (e.code === 'Escape') onClose();
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, onClose]);

  // Touch Helpers
  const handleTouchStart = (key: string) => {
     keys.current[key] = true;
     if (key === 'Space' && gameState === 'PLAYING' && player.current.isGrounded) {
         player.current.vy = -350;
         player.current.isGrounded = false;
         playSfx('jump');
     }
     if (gameState === 'GAMEOVER' && key === 'Enter') {
         onClose();
     }
  };
  const handleTouchEnd = (key: string) => {
     keys.current[key] = false;
  };

  // --- MAIN GAME LOOP ---
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.imageSmoothingEnabled = false;

    // Reset
    player.current = { 
      x: 144, 
      y: 200, 
      vx: 0, 
      vy: 0, 
      isGrounded: true, 
      width: 32, 
      height: 32,
      hitboxWidth: 14, 
      hitboxOffset: 9
    };
    entities.current = [];
    gameTimeRef.current = GAME_DURATION;
    scoreRef.current = 0;
    hpRef.current = MAX_HP;
    comboRef.current = 0;
    
    setUiScore(0);
    setUiHp(MAX_HP);
    setUiCombo(0);

    const drawSprite = (map: string[], startX: number, startY: number, scale: number, flipX: boolean = false) => {
      map.forEach((row, rI) => {
        const chars = flipX ? row.split('').reverse() : row.split('');
        chars.forEach((char, cI) => {
          if (COLORS[char]) {
            ctx.fillStyle = COLORS[char];
            ctx.fillRect(startX + cI * scale, startY + rI * scale, scale, scale);
          }
        });
      });
    };

    const update = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1); 
      lastTimeRef.current = timestamp;

      gameTimeRef.current -= dt;
      setUiTime(Math.ceil(gameTimeRef.current));
      
      if (gameTimeRef.current <= 0) {
        endGame();
        return;
      }

      // Clear
      ctx.fillStyle = '#2a0210';
      ctx.fillRect(0, 0, 320, 240);
      // Floor
      ctx.fillStyle = '#851d3a';
      ctx.fillRect(0, 232, 320, 8);

      // Physics
      const speed = keys.current['ShiftLeft'] ? 200 : 120;
      if (keys.current['ArrowLeft'] || keys.current['KeyA']) player.current.vx = -speed;
      else if (keys.current['ArrowRight'] || keys.current['KeyD']) player.current.vx = speed;
      else player.current.vx = 0;

      player.current.x += player.current.vx * dt;
      if (player.current.x < 0) player.current.x = 0;
      if (player.current.x > 320 - player.current.width) player.current.x = 320 - player.current.width;

      const GRAVITY = 800;
      player.current.vy += GRAVITY * dt;
      player.current.y += player.current.vy * dt;

      const FLOOR_Y = 200; 
      if (player.current.y >= FLOOR_Y) {
        player.current.y = FLOOR_Y;
        player.current.vy = 0; 
        player.current.isGrounded = true;
      } else {
        player.current.isGrounded = false;
      }

      spawnTimerRef.current += dt;
      enemySpawnTimerRef.current += dt;

      if (spawnTimerRef.current > 0.3) { 
        spawnTimerRef.current = 0;
        const rand = Math.random();
        let type: EntityType = 'PETAL_PINK';
        if (rand > 0.90) type = 'PETAL_GOLD'; 
        else if (rand > 0.75) type = 'PETAL_DARK'; 
        
        entities.current.push({
          id: Math.random(),
          type,
          x: Math.random() * 300,
          y: -20,
          width: 8,
          height: 8,
          speedY: 60 + Math.random() * 60,
          speedX: Math.sin(timestamp / 500) * 20,
          active: true
        });
      }

      if (enemySpawnTimerRef.current > 3.5) {
        enemySpawnTimerRef.current = 0;
        const fromLeft = Math.random() > 0.5;
        entities.current.push({
          id: Math.random(),
          type: 'ENEMY_GROUND',
          x: fromLeft ? -20 : 320,
          y: 208,
          width: 24,
          height: 24,
          speedX: fromLeft ? 60 : -60,
          speedY: 0,
          active: true
        });
      }

      const pRect = { 
        l: player.current.x + player.current.hitboxOffset, 
        r: player.current.x + player.current.hitboxOffset + player.current.hitboxWidth, 
        t: player.current.y + 4, 
        b: player.current.y + 30 
      };

      let needsUiUpdate = false;

      entities.current.forEach(e => {
        if (!e.active) return;
        e.x += e.speedX * dt;
        e.y += e.speedY * dt;

        if (e.type === 'PETAL_PINK') {
          ctx.fillStyle = '#fb6f92'; 
          ctx.fillRect(e.x, e.y, 4, 4);
          ctx.fillRect(e.x + 2, e.y + 2, 2, 2);
        } else if (e.type === 'PETAL_GOLD') {
          ctx.fillStyle = '#fcd34d'; 
          ctx.fillRect(e.x, e.y, 5, 5);
          ctx.fillStyle = '#fff';
          ctx.fillRect(e.x+1, e.y+1, 2, 2);
        } else if (e.type === 'PETAL_DARK') {
          ctx.fillStyle = '#4a041e'; 
          ctx.fillRect(e.x, e.y, 6, 6);
          ctx.strokeStyle = '#a21caf';
          ctx.strokeRect(e.x, e.y, 6, 6);
        } else if (e.type === 'ENEMY_GROUND') {
          drawSprite(SPRITE_MAP.enemy, e.x, e.y, 1.5);
        }

        const eRect = { l: e.x, r: e.x + e.width, t: e.y, b: e.y + e.height };
        const isColliding = !(pRect.r < eRect.l || pRect.l > eRect.r || pRect.b < eRect.t || pRect.t > eRect.b);

        if (isColliding) {
          e.active = false;
          handleCollisionLogic(e.type);
          needsUiUpdate = true;
        }

        if (e.y > 250 || e.x < -50 || e.x > 350) e.active = false;
      });

      entities.current = entities.current.filter(e => e.active);

      if (needsUiUpdate) {
         setUiScore(scoreRef.current);
         setUiHp(hpRef.current);
         setUiCombo(comboRef.current);
      }

      const isMovingLeft = player.current.vx < 0;
      drawSprite(SPRITE_MAP.player, player.current.x, player.current.y, 2, isMovingLeft);

      gameLoopRef.current = requestAnimationFrame(update);
    };

    const handleCollisionLogic = (type: EntityType) => {
      if (type === 'PETAL_PINK') {
        scoreRef.current += 10 + (comboRef.current > 10 ? 5 : 0);
        comboRef.current += 1;
        onAddXp(5);
        playSfx('coin');
      } else if (type === 'PETAL_GOLD') {
        scoreRef.current += 50;
        comboRef.current += 1;
        onAddXp(25);
        hpRef.current = Math.min(hpRef.current + 1, MAX_HP);
        playSfx('coin');
      } else if (type === 'PETAL_DARK' || type === 'ENEMY_GROUND') {
        hpRef.current -= 1;
        comboRef.current = 0;
        playSfx('hit');
        if (hpRef.current <= 0) {
            endGame();
        }
      }
    };

    const endGame = () => {
      cancelAnimationFrame(gameLoopRef.current);
      playSfx('gameover');
      
      const finalScore = scoreRef.current;
      const newEntry = { score: finalScore, date: new Date().toLocaleDateString() };
      
      const savedLB = localStorage.getItem('ETHERIA_LEADERBOARD');
      let currentLB: LeaderboardEntry[] = savedLB ? JSON.parse(savedLB) : [];
      
      currentLB.push(newEntry);
      currentLB.sort((a, b) => b.score - a.score);
      currentLB = currentLB.slice(0, 5); 
      
      localStorage.setItem('ETHERIA_LEADERBOARD', JSON.stringify(currentLB));
      setLeaderboard(currentLB);
      setGameState('GAMEOVER');
    };

    gameLoopRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameState, onAddXp]); 

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center font-retro overflow-hidden no-select">
      
      {/* Mobile Controls Overlay */}
      {gameState === 'PLAYING' && (
        <div className="absolute bottom-8 left-0 w-full px-6 flex justify-between items-end z-[100] lg:hidden pointer-events-auto">
            <div className="flex gap-6">
               <button 
                  className="w-16 h-16 bg-white/10 active:bg-white/30 border-2 border-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                  onTouchStart={(e) => { e.preventDefault(); handleTouchStart('ArrowLeft'); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('ArrowLeft'); }}
               >
                  <ArrowLeft className="text-white opacity-80" size={32} />
               </button>
               <button 
                  className="w-16 h-16 bg-white/10 active:bg-white/30 border-2 border-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                  onTouchStart={(e) => { e.preventDefault(); handleTouchStart('ArrowRight'); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('ArrowRight'); }}
               >
                  <ArrowRight className="text-white opacity-80" size={32} />
               </button>
            </div>

            <button 
              className="w-20 h-20 bg-sakura-500/20 active:bg-sakura-500/40 border-2 border-sakura-400/40 rounded-full flex items-center justify-center backdrop-blur-md transition-colors mb-2"
              onTouchStart={(e) => { e.preventDefault(); handleTouchStart('Space'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('Space'); }}
            >
               <ArrowUp className="text-sakura-300" size={40} />
            </button>
        </div>
      )}

      {/* Game Over Mobile Tap Area */}
      {gameState === 'GAMEOVER' && (
         <button 
           className="absolute inset-0 z-[101] w-full h-full bg-transparent lg:hidden"
           onClick={() => handleTouchStart('Enter')}
         />
      )}

      {gameState === 'TRANSITION' && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-center z-50">
           {showStageTitle && (
             <>
                <h1 className="text-4xl text-white mb-4 animate-pulse">STAGE 1</h1>
                <p className="text-sakura-400 text-xl tracking-widest">SAKURA GARDEN</p>
                <div className="mt-8 w-16 h-1 bg-white animate-bounce-slight" />
             </>
           )}
        </div>
      )}

      <div className={`relative transition-all duration-700 ${gameState !== 'TRANSITION' ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <div className="relative border-[16px] border-zinc-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-zinc-900">
            {/* Header Stats */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
                <div className="flex flex-col gap-1">
                   <div className="text-white text-xs drop-shadow-md">SCORE</div>
                   <div className="text-yellow-400 text-xl drop-shadow-md">{uiScore.toString().padStart(6, '0')}</div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: MAX_HP }).map((_, i) => (
                    <Heart 
                      key={i} 
                      size={20} 
                      className={`${i < uiHp ? 'fill-red-500 text-red-600' : 'fill-zinc-700 text-zinc-600'} drop-shadow-md transition-colors duration-200`} 
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-1 text-right">
                   <div className="text-white text-xs drop-shadow-md">TIME</div>
                   <div className={`${uiTime < 10 ? 'text-red-500 animate-pulse' : 'text-white'} text-xl drop-shadow-md`}>
                     {uiTime}
                   </div>
                </div>
            </div>

            {uiCombo > 1 && (
              <div className="absolute top-16 left-4 z-10 animate-bounce-slight">
                <span className="text-sakura-300 text-2xl italic font-black drop-shadow-md">{uiCombo} COMBO!</span>
              </div>
            )}

            <canvas 
              ref={canvasRef} 
              width={320} 
              height={240} 
              className="block w-[800px] h-[600px] max-w-[90vw] max-h-[50vh] bg-[#2a0210] rounded-sm"
              style={{ imageRendering: 'pixelated' }}
            />

            <div className="absolute inset-0 scanline opacity-20 pointer-events-none rounded-sm" />
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.6)_100%)] pointer-events-none rounded-sm" />

            {gameState === 'GAMEOVER' && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center z-20 backdrop-blur-[4px]">
                <h2 className="text-red-500 text-4xl mb-2 drop-shadow-[0_4px_0_rgba(255,255,255,0.2)]">GAME OVER</h2>
                <div className="bg-zinc-800 p-4 rounded-xl border-2 border-zinc-600 mb-4 min-w-[250px]">
                   <p className="text-zinc-400 text-xs mb-1">FINAL SCORE</p>
                   <p className="text-white text-3xl mb-4">{uiScore}</p>
                   <div className="text-left border-t border-zinc-600 pt-2">
                      <div className="flex items-center gap-2 text-yellow-400 text-xs mb-2 justify-center">
                         <Crown size={12} />
                         <span>TOP RECORDS</span>
                      </div>
                      <div className="space-y-1">
                        {leaderboard.map((entry, i) => (
                          <div key={i} className={`flex justify-between text-xs ${i===0 ? 'text-yellow-300' : 'text-zinc-400'}`}>
                             <span>#{i+1} {entry.date}</span>
                             <span>{entry.score}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
                <div className="hidden lg:block animate-blink text-white text-sm tracking-widest cursor-pointer hover:text-sakura-300" onClick={onClose}>
                   PRESS [ENTER] TO EXIT
                </div>
                <div className="lg:hidden animate-blink text-white text-sm tracking-widest mt-4">
                   TAP SCREEN TO EXIT
                </div>
              </div>
            )}
          </div>
          <div className="hidden lg:flex mt-4 justify-between text-zinc-500 text-[10px] uppercase tracking-widest px-2">
             <div>[ARROWS/SPACE] MOVE & JUMP</div>
             <div>[ENTER] START / EXIT</div>
          </div>
      </div>
    </div>
  );
};

export default PixelGame;
