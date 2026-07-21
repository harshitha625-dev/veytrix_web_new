import React, { useEffect, useRef } from 'react';
import { useTimelineStore } from './store';
import { timeToPixel } from './utils';

export const Playhead: React.FC = () => {
  const isPlaying = useTimelineStore((state) => state.isPlaying);
  const playheadRef = useRef<HTMLDivElement>(null);
  
  const lastTimeRef = useRef<number>(0);
  const reqRef = useRef<number | undefined>(undefined);

  // Subscribe to playhead changes manually to avoid React re-renders
  useEffect(() => {
    const unsub = useTimelineStore.subscribe((state) => {
      if (playheadRef.current) {
        playheadRef.current.style.left = `${timeToPixel(state.playheadTime, state.zoomLevel)}px`;
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    // Initial position
    if (playheadRef.current) {
      const state = useTimelineStore.getState();
      playheadRef.current.style.left = `${timeToPixel(state.playheadTime, state.zoomLevel)}px`;
    }

    if (isPlaying) {
      lastTimeRef.current = performance.now();
      
      const loop = (now: number) => {
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;
        
        const state = useTimelineStore.getState();
        const nextTime = state.playheadTime + delta;
        
        if (nextTime >= state.duration) {
          useTimelineStore.getState().togglePlay();
          useTimelineStore.getState().setPlayheadTime(state.duration);
        } else {
          useTimelineStore.getState().setPlayheadTime(nextTime);
          reqRef.current = requestAnimationFrame(loop);
        }
      };
      
      reqRef.current = requestAnimationFrame(loop);
    } else if (reqRef.current) {
      cancelAnimationFrame(reqRef.current);
    }
    
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isPlaying]);

  return (
    <div
      ref={playheadRef}
      className="absolute top-0 bottom-0 z-50 pointer-events-none"
      style={{
        width: '1px',
      }}
    >
      <div className="w-px h-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.8)]" />
      {/* Playhead handle (triangle) */}
      <div 
        className="absolute top-0 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-red-500 cursor-ew-resize pointer-events-auto"
        onPointerDown={(e) => {
          e.stopPropagation();
          const startX = e.clientX;
          const startLeft = parseFloat(playheadRef.current?.style.left || '0');
          
          const handlePointerMove = (ev: PointerEvent) => {
            const dx = ev.clientX - startX;
            const newLeft = Math.max(0, startLeft + dx);
            const newTime = newLeft / useTimelineStore.getState().zoomLevel;
            useTimelineStore.getState().setPlayheadTime(newTime);
          };
          
          const handlePointerUp = () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
          };
          
          window.addEventListener('pointermove', handlePointerMove);
          window.addEventListener('pointerup', handlePointerUp);
        }}
      >
        <div className="w-3 h-3 bg-red-500 rounded-sm absolute -top-3 -left-[6px] pointer-events-none" />
      </div>
    </div>
  );
};
