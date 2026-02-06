import React, { useEffect, useRef } from 'react';

const CustomCursor: React.FC = () => {
  // Use Refs for direct DOM manipulation (bypassing React Render Cycle)
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  
  // Store position in mutable variables
  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  
  const isClicking = useRef(false);
  const isHovering = useRef(false);
  const isVisible = useRef(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      if (!isVisible.current) {
        isVisible.current = true;
        if (cursorRef.current) cursorRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }

      // Direct update for the dot (instant)
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%) scale(${isClicking.current ? 0.5 : 1})`;
      }

      // Check hover target
      const target = e.target as HTMLElement;
      const isPointer = 
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.classList.contains('cursor-pointer') ||
        target.closest('button') !== null ||
        target.closest('a') !== null;
        
      if (isPointer !== isHovering.current) {
        isHovering.current = isPointer;
        // Trigger visual update for ring size
        if (ringRef.current) {
           ringRef.current.style.width = isPointer ? '40px' : '24px';
           ringRef.current.style.height = isPointer ? '40px' : '24px';
           ringRef.current.style.borderColor = isPointer ? 'rgba(255, 175, 204, 0.8)' : 'rgba(255, 175, 204, 0.4)';
           ringRef.current.style.backgroundColor = isPointer ? 'rgba(255, 175, 204, 0.1)' : 'transparent';
        }
      }
    };

    const onMouseDown = () => {
      isClicking.current = true;
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0) translate(-50%, -50%) scale(0.5)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%) scale(0.8)`;
    };

    const onMouseUp = () => {
      isClicking.current = false;
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0) translate(-50%, -50%) scale(1)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%) scale(1)`;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop for the Ring (Physics)
    let rAF: number;
    const animate = () => {
      // Lerp logic: Current + (Target - Current) * Factor
      // Factor 0.2 = Fast/Responsive. Factor 0.05 = Slow/Laggy.
      const factor = 0.25; 
      
      ring.current.x += (mouse.current.x - ring.current.x) * factor;
      ring.current.y += (mouse.current.y - ring.current.y) * factor;

      if (ringRef.current) {
        const scale = isClicking.current ? 0.8 : 1;
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      }

      rAF = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(rAF);
    };
  }, []);

  // Mobile check
  if (typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return null;
  }

  return (
    <>
      {/* Trailing Ring - High Performance */}
      <div 
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full border-2 border-sakura-300 pointer-events-none z-[9990] opacity-0 transition-all duration-0"
        style={{ width: 24, height: 24 }}
      />
      
      {/* Main Dot - Instant Follow */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-3 h-3 rounded-full bg-sakura-500 pointer-events-none z-[9991] opacity-0 shadow-glow"
      />
    </>
  );
};

export default CustomCursor;