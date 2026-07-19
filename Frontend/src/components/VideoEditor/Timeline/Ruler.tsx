import React, { useEffect, useRef } from 'react';
import { useTimelineStore } from './store';
import { formatTime } from './utils';

export const Ruler: React.FC = () => {
  const zoomLevel = useTimelineStore((state) => state.zoomLevel);
  const duration = useTimelineStore((state) => state.duration);
  const setPlayheadTime = useTimelineStore((state) => state.setPlayheadTime);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Total width in pixels
  const width = duration * zoomLevel;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Scale for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = 32 * dpr; // 32px height
    
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, 32);
    
    // Ruler styles
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.strokeStyle = '#334155'; // slate-700
    ctx.font = '10px Inter, sans-serif';
    ctx.textBaseline = 'top';
    
    // Determine interval based on zoomLevel
    // If zoom is high (e.g. 200px/s), show sub-second intervals
    // If zoom is low (e.g. 10px/s), show every 10 seconds
    
    let timeInterval = 1; // 1 second
    if (zoomLevel > 150) timeInterval = 0.5;
    if (zoomLevel > 300) timeInterval = 0.1;
    if (zoomLevel < 50) timeInterval = 5;
    if (zoomLevel < 20) timeInterval = 10;
    if (zoomLevel < 5) timeInterval = 30;

    const pixelInterval = timeInterval * zoomLevel;
    const numTicks = Math.ceil(width / pixelInterval);

    for (let i = 0; i <= numTicks; i++) {
      const time = i * timeInterval;
      const x = i * pixelInterval;
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(x, 16);
      ctx.lineTo(x, 32);
      ctx.stroke();
      
      // Draw time label for major ticks
      if (i % 2 === 0 || timeInterval >= 1) {
        ctx.fillText(formatTime(time), x + 4, 4);
      } else {
        // minor tick
        ctx.beginPath();
        ctx.moveTo(x, 24);
        ctx.lineTo(x, 32);
        ctx.stroke();
      }
    }
  }, [width, zoomLevel]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.max(0, x / zoomLevel);
    setPlayheadTime(time);
    
    const handlePointerMove = (ev: PointerEvent) => {
      const x = ev.clientX - rect.left;
      const time = Math.max(0, x / zoomLevel);
      setPlayheadTime(time);
    };
    
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className="h-8 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <canvas 
        ref={canvasRef}
        style={{ width: `${width}px`, height: '32px' }}
        className="cursor-text"
        onPointerDown={handlePointerDown}
      />
    </div>
  );
};
