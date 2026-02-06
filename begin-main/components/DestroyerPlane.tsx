
import React, { useEffect, useRef, useState } from 'react';
import { Send, X, HelpCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Crosshair } from 'lucide-react';

interface Bullet {
  id: number;
  x: number;
  y: number;
  angle: number; // Travel direction
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  speed: number;
  life: number;
}

interface PlaneState {
  x: number;
  y: number;
  angle: number; // Radians, 0 = Right, -PI/2 = Up
  speed: number;
}

const DestroyerPlane: React.FC = () => {
  // Init at center
  const [plane, setPlane] = useState<PlaneState>({ 
    x: window.innerWidth / 2, 
    y: window.innerHeight / 2, 
    angle: -Math.PI / 2, 
    speed: 0 
  });
  
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showManual, setShowManual] = useState(true);

  // Store hidden elements to restore them later
  const hiddenElementsRef = useRef<{ el: HTMLElement; originalVisibility: string }[]>([]);
  const frameRef = useRef<number>(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const planeRef = useRef<PlaneState>({ 
    x: window.innerWidth / 2, 
    y: window.innerHeight / 2, 
    angle: -Math.PI / 2, 
    speed: 0 
  });

  // Audio Context Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const engineOscRef = useRef<OscillatorNode | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);
  
  // Constants
  const MAX_SPEED = 8;
  const ACCEL = 0.2;
  const FRICTION = 0.96;
  const ROTATION_SPEED = 0.08;
  const BULLET_SPEED = 12;

  // Sound Generator Function
  const playSound = (type: 'shoot' | 'explode' | 'ping') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'shoot') {
        // Pew Pew: Square wave dropping in pitch
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
    } else if (type === 'explode') {
        // Boom: Sawtooth wave dropping deep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'ping') {
        // Ping: High Sine wave for safe zone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }
  };

  const fireBullet = () => {
      playSound('shoot');
      setBullets(prev => [
        ...prev, 
        { 
          id: Date.now() + Math.random(), 
          x: planeRef.current.x + Math.cos(planeRef.current.angle) * 20, 
          y: planeRef.current.y + Math.sin(planeRef.current.angle) * 20,
          angle: planeRef.current.angle
        }
      ]);
    };

  useEffect(() => {
    // Init Audio Context on Mount
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtor) {
       const ctx = new AudioCtor();
       audioCtxRef.current = ctx;

       // Setup Engine Sound (Constant Low Hum)
       const osc = ctx.createOscillator();
       const gain = ctx.createGain();
       osc.type = 'sawtooth'; // Raspy engine sound
       osc.frequency.value = 60; 
       gain.gain.value = 0; // Start silent
       osc.connect(gain);
       gain.connect(ctx.destination);
       osc.start();

       engineOscRef.current = osc;
       engineGainRef.current = gain;
    }

    // Prevent default scrolling with arrows
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
        e.preventDefault();
      }
      // Shoot on Space press
      if (e.code === 'Space') {
         fireBullet();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Initialize refs to match state
    planeRef.current = plane;

    // Game Loop
    const loop = () => {
      // --- 1. Physics & Movement ---
      const p = planeRef.current;
      const keys = keysRef.current;

      // Rotation
      if (keys['ArrowLeft']) p.angle -= ROTATION_SPEED;
      if (keys['ArrowRight']) p.angle += ROTATION_SPEED;

      // Acceleration
      if (keys['ArrowUp']) p.speed += ACCEL;
      if (keys['ArrowDown']) p.speed -= ACCEL;

      // Cap Speed
      if (p.speed > MAX_SPEED) p.speed = MAX_SPEED;
      if (p.speed < -MAX_SPEED/2) p.speed = -MAX_SPEED/2;

      // Apply Friction
      p.speed *= FRICTION;

      // Update Engine Sound based on speed
      if (audioCtxRef.current && engineOscRef.current && engineGainRef.current) {
          const currentSpeed = Math.abs(p.speed);
          const vol = Math.min(currentSpeed / 20, 0.03); // Cap volume
          const freq = 60 + (currentSpeed * 8); // Pitch shift
          const now = audioCtxRef.current.currentTime;
          
          engineGainRef.current.gain.setTargetAtTime(vol, now, 0.1);
          engineOscRef.current.frequency.setTargetAtTime(freq, now, 0.1);
      }

      // Velocity Vector
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;

      // Boundary Wrap
      if (p.x < 0) p.x = window.innerWidth;
      if (p.x > window.innerWidth) p.x = 0;
      if (p.y < 0) p.y = window.innerHeight;
      if (p.y > window.innerHeight) p.y = 0;

      // Sync state for render
      setPlane({...p});

      // --- 2. Bullets & Collision ---
      setBullets(prev => {
        const nextBullets: Bullet[] = [];
        
        prev.forEach(b => {
          const nextX = b.x + Math.cos(b.angle) * BULLET_SPEED;
          const nextY = b.y + Math.sin(b.angle) * BULLET_SPEED;
          
          // Check bounds
          if (
             nextX < 0 || nextX > window.innerWidth || 
             nextY < 0 || nextY > window.innerHeight
          ) {
             return; // Remove bullet
          }

          // Check Collision
          // Get all elements at this point
          const elements = document.elementsFromPoint(nextX, nextY);
          let hitSomething = false;

          for (const el of elements) {
             const htmlEl = el as HTMLElement;

             // Ignore Self, Bullets, Particles, Root, Body, Instructions
             if (
               htmlEl.id === 'root' || 
               htmlEl.tagName === 'BODY' || 
               htmlEl.tagName === 'HTML' ||
               htmlEl.classList.contains('destroyer-layer') ||
               htmlEl.classList.contains('manual-panel') ||
               htmlEl.closest('.manual-panel') ||
               htmlEl.closest('.mobile-controls') // Ignore mobile controls
             ) {
               continue;
             }

             // CHECK SAFE ZONE (The settings button)
             if (htmlEl.classList.contains('safe-zone') || htmlEl.closest('.safe-zone')) {
                // Hit a safe zone: Destroy bullet, but do NOT destroy element
                hitSomething = true;
                playSound('ping');
                createExplosion(nextX, nextY, '#ffffff'); // White spark
                break; 
             }

             // Valid Destructible Target
             if (htmlEl.style.visibility !== 'hidden') {
                // DESTROY!
                const originalVis = htmlEl.style.visibility;
                htmlEl.style.visibility = 'hidden';
                hiddenElementsRef.current.push({ el: htmlEl, originalVisibility: originalVis });
                
                playSound('explode');
                createExplosion(nextX, nextY, '#fb6f92'); // Pink explosion
                hitSomething = true;
                break; // STOP CHECKING (Hits top layer only)
             }
          }

          if (!hitSomething) {
             nextBullets.push({ ...b, x: nextX, y: nextY });
          }
        });

        return nextBullets;
      });

      // --- 3. Particles ---
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + Math.cos(p.angle) * p.speed,
        y: p.y + Math.sin(p.angle) * p.speed,
        life: p.life - 0.08
      })).filter(p => p.life > 0));

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(frameRef.current);
      
      // Stop Engine Sound
      if (engineOscRef.current) {
         try { engineOscRef.current.stop(); } catch(e){}
      }
      if (audioCtxRef.current) {
         try { audioCtxRef.current.close(); } catch(e){}
      }

      // Restore elements
      hiddenElementsRef.current.forEach(({ el, originalVisibility }) => {
        el.style.visibility = originalVisibility;
      });
    };
  }, []); // Empty dep array = run once on mount

  const createExplosion = (x: number, y: number, color: string) => {
     const newParticles: Particle[] = [];
     for(let i=0; i<6; i++) {
        newParticles.push({
           id: Math.random(),
           x,
           y,
           color,
           angle: Math.random() * Math.PI * 2,
           speed: 2 + Math.random() * 4,
           life: 1.0
        });
     }
     setParticles(prev => [...prev, ...newParticles]);
  };

  // Mobile Touch Handlers
  const handleTouch = (key: string, pressed: boolean) => {
     keysRef.current[key] = pressed;
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none destroyer-layer overflow-hidden font-sans no-select">
       
       {/* Mobile Controls Overlay */}
       <div className="absolute bottom-6 left-0 w-full px-6 flex justify-between items-end pointer-events-auto lg:hidden mobile-controls z-[1000]">
          {/* D-PAD */}
          <div className="relative w-32 h-32 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
             <button 
               className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 p-3 active:bg-white/20 rounded-full"
               onTouchStart={(e) => { e.preventDefault(); handleTouch('ArrowUp', true); }}
               onTouchEnd={(e) => { e.preventDefault(); handleTouch('ArrowUp', false); }}
             >
               <ArrowUp className="text-white/80" />
             </button>
             <button 
               className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 p-3 active:bg-white/20 rounded-full"
               onTouchStart={(e) => { e.preventDefault(); handleTouch('ArrowDown', true); }}
               onTouchEnd={(e) => { e.preventDefault(); handleTouch('ArrowDown', false); }}
             >
               <ArrowDown className="text-white/80" />
             </button>
             <button 
               className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 p-3 active:bg-white/20 rounded-full"
               onTouchStart={(e) => { e.preventDefault(); handleTouch('ArrowLeft', true); }}
               onTouchEnd={(e) => { e.preventDefault(); handleTouch('ArrowLeft', false); }}
             >
               <ArrowLeft className="text-white/80" />
             </button>
             <button 
               className="absolute right-0 top-1/2 translate-x-2 -translate-y-1/2 p-3 active:bg-white/20 rounded-full"
               onTouchStart={(e) => { e.preventDefault(); handleTouch('ArrowRight', true); }}
               onTouchEnd={(e) => { e.preventDefault(); handleTouch('ArrowRight', false); }}
             >
               <ArrowRight className="text-white/80" />
             </button>
          </div>

          {/* FIRE BTN */}
          <button 
             className="w-20 h-20 bg-red-500/40 active:bg-red-500/60 border-2 border-red-400 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg mb-4"
             onTouchStart={(e) => { e.preventDefault(); fireBullet(); }}
          >
             <Crosshair className="text-white" size={32} />
          </button>
       </div>

       {/* Manual / Instructions */}
       {showManual && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-sakura-200 pointer-events-auto manual-panel max-w-sm w-full animate-bounce-slight">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-black text-sakura-500 flex items-center gap-2">
                  <Send className="rotate-[-45deg]" size={24}/> 
                  驾驶指南
               </h2>
               <button onClick={() => setShowManual(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                  <X size={20} className="text-zinc-400" />
               </button>
            </div>
            
            <div className="space-y-3 text-sm text-slate-600 dark:text-zinc-300">
               <div className="hidden lg:flex items-center gap-3">
                  <div className="flex gap-1">
                     <span className="kbd">↑</span>
                     <span className="kbd">↓</span>
                  </div>
                  <span>控制飞机前进 / 后退</span>
               </div>
               <div className="hidden lg:flex items-center gap-3">
                  <div className="flex gap-1">
                     <span className="kbd">←</span>
                     <span className="kbd">→</span>
                  </div>
                  <span>调整飞行航向</span>
               </div>
               <div className="hidden lg:flex items-center gap-3">
                  <span className="kbd w-16">Space</span>
                  <span>发射清除子弹</span>
               </div>
               <div className="lg:hidden text-center text-sakura-500 font-bold">
                  使用屏幕下方的虚拟摇杆进行操作
               </div>
            </div>

            <div className="mt-6 text-xs text-center text-sakura-400">
               点击设置中的飞机按钮即可退出模式
            </div>
         </div>
       )}

       {/* Hint to open manual if closed */}
       {!showManual && (
          <button 
            onClick={() => setShowManual(true)}
            className="absolute top-20 left-4 pointer-events-auto p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-colors manual-panel"
          >
             <HelpCircle size={24} className="text-sakura-500" />
          </button>
       )}

       {/* Bullets */}
       {bullets.map(b => (
         <div 
           key={b.id} 
           className="absolute w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_8px_orange]"
           style={{ left: b.x, top: b.y, transform: 'translate(-50%, -50%)' }}
         />
       ))}

       {/* Particles */}
       {particles.map(p => (
         <div 
           key={p.id}
           className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
           style={{ 
             left: p.x, 
             top: p.y, 
             backgroundColor: p.color,
             opacity: p.life,
             transform: `scale(${p.life})` 
            }}
         />
       ))}

       {/* Plane */}
       <div 
         className="absolute transition-transform duration-75 text-sakura-500 drop-shadow-[0_0_15px_rgba(251,111,146,0.8)]"
         style={{ 
           left: plane.x, 
           top: plane.y,
           transform: `translate(-50%, -50%) rotate(${plane.angle + Math.PI / 4}rad)` // Adjust icon rotation
         }}
       >
         <Send size={48} fill="currentColor" strokeWidth={1.5} />
         {/* Thruster Effect */}
         {plane.speed > 0.1 && (
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-400 blur-sm animate-pulse rounded-full opacity-80" />
         )}
       </div>

       <style>{`
         .kbd {
            @apply bg-slate-100 dark:bg-zinc-800 border-b-2 border-slate-300 dark:border-zinc-600 px-2 py-1 rounded-md font-mono font-bold text-xs min-w-[24px] text-center inline-block;
         }
       `}</style>
    </div>
  );
};

export default DestroyerPlane;
