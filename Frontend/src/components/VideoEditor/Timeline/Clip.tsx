import React, { useRef, useState } from 'react';
import { Clip as ClipType, useTimelineStore } from './store';
import { timeToPixel, pixelToTime, getSnapTime } from './utils';
import { GripVertical, Scissors, Mic } from 'lucide-react';

interface ClipProps {
  clip: ClipType;
}

export const Clip: React.FC<ClipProps> = ({ clip }) => {
  const zoomLevel = useTimelineStore((state) => state.zoomLevel);
  const selectedClipIds = useTimelineStore((state) => state.selectedClipIds);
  const selectClip = useTimelineStore((state) => state.selectClip);
  const updateClip = useTimelineStore((state) => state.updateClip);
  const moveClip = useTimelineStore((state) => state.moveClip);
  const splitClip = useTimelineStore((state) => state.splitClip);
  
  const isSelected = selectedClipIds.includes(clip.id);
  
  const left = timeToPixel(clip.start, zoomLevel);
  const width = timeToPixel(clip.duration, zoomLevel);
  
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only handle left click
    if (e.button !== 0) return;
    
    e.stopPropagation();
    selectClip(clip.id, e.shiftKey);
    
    // Setup drag
    const startX = e.clientX;
    const initialStart = clip.start;
    let hasMoved = false;
    
    const handlePointerMove = (ev: PointerEvent) => {
      hasMoved = true;
      const dx = ev.clientX - startX;
      const timeDelta = pixelToTime(dx, zoomLevel);
      let newStart = initialStart + timeDelta;
      
      // Snap logic (simplified to snap to other clips)
      const allClips = useTimelineStore.getState().clips.filter(c => c.id !== clip.id && c.trackId === clip.trackId);
      newStart = getSnapTime(newStart, allClips, 10, zoomLevel, clip.id);
      
      moveClip(clip.id, clip.trackId, newStart);
    };
    
    const handlePointerUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };
  
  const handleResize = (e: React.PointerEvent, edge: 'left' | 'right') => {
    e.stopPropagation();
    e.preventDefault();
    selectClip(clip.id, false);
    
    const startX = e.clientX;
    const initialStart = clip.start;
    const initialDuration = clip.duration;
    
    const handlePointerMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const timeDelta = dx / zoomLevel;
      
      if (edge === 'left') {
        const newStart = Math.max(0, initialStart + timeDelta);
        const startDiff = newStart - initialStart;
        const newDuration = Math.max(0.1, initialDuration - startDiff);
        
        if (newDuration > 0.1) {
          updateClip(clip.id, { start: newStart, duration: newDuration });
        }
      } else {
        const newDuration = Math.max(0.1, initialDuration + timeDelta);
        updateClip(clip.id, { duration: newDuration });
      }
    };
    
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const extractAudio = useTimelineStore((state) => state.extractAudio);

  return (
    <div
      className={`absolute top-1 bottom-1 rounded-md overflow-hidden group select-none transition-shadow ${
        isSelected ? 'ring-2 ring-white z-10' : 'ring-1 ring-slate-700/50 hover:ring-slate-500'
      } ${clip.color || 'bg-slate-700'}`}
      style={{
        left: `${left}px`,
        width: `${width}px`,
      }}
      onPointerDown={handlePointerDown}
    >
      {/* Clip Content */}
      <div className="flex flex-col w-full h-full text-xs text-white font-medium overflow-hidden">
        {clip.type === 'video' && (
          <div className="flex flex-col w-full h-full">
            {/* Top half: Thumbnails */}
            <div className={`flex-1 flex items-center px-2 bg-slate-800/80 overflow-hidden relative ${!clip.hasExtractedAudio ? 'pb-1' : ''}`}>
              <GripVertical size={12} className="text-white/50 mr-1 z-10" />
              <span className="text-[10px] font-bold truncate z-10 drop-shadow-md">{clip.name}</span>
              
              {/* Extract Audio Button */}
              {!clip.hasExtractedAudio && (
                <button 
                  onPointerDown={(e) => { e.stopPropagation(); extractAudio(clip.id); }}
                  className="absolute top-1 right-2 p-1 bg-black/50 hover:bg-[#00c4a0] rounded z-20 text-white transition-colors"
                  title="Extract Audio"
                >
                  <Mic size={10} />
                </button>
              )}
            </div>
            
            {/* Bottom half: Audio Waveform */}
            {!clip.hasExtractedAudio && (
              <div className="h-6 bg-yellow-600/20 border-t border-yellow-500/30 flex items-end overflow-hidden px-1 pb-px w-full">
                 <div className="w-full flex items-end justify-between h-full opacity-80 gap-px">
                   {/* Simulated waveform bars */}
                   {Array.from({ length: Math.ceil(width / 4) }).map((_, i) => {
                     const h = 20 + Math.sin(i * 0.4) * 40 + Math.random() * 40;
                     return <div key={i} className="w-px bg-yellow-400 rounded-t" style={{ height: `${Math.min(100, Math.max(10, h))}%` }} />;
                   })}
                 </div>
              </div>
            )}
          </div>
        )}
        
        {clip.type === 'audio' && (
          <div className="flex-1 flex flex-col justify-between w-full h-full px-2 pt-1 pb-0 overflow-hidden relative">
            <div className="flex items-center gap-1 z-10">
              <GripVertical size={12} className="text-white/50" />
              <span className="text-[10px] font-bold truncate">{clip.name}</span>
            </div>
            <div className="w-full h-6 flex items-end justify-between opacity-80 gap-px">
               {Array.from({ length: Math.ceil(width / 4) }).map((_, i) => {
                 const h = 30 + Math.sin(i * 0.3) * 50 + Math.random() * 20;
                 return <div key={i} className="w-px bg-white rounded-t" style={{ height: `${Math.min(100, Math.max(10, h))}%` }} />;
               })}
             </div>
          </div>
        )}
        
        {clip.type !== 'video' && clip.type !== 'audio' && (
          <div className="flex-1 flex items-center px-2">
            <GripVertical size={12} className="text-white/50 mr-1" />
            <span className="text-[10px] font-bold truncate">{clip.name}</span>
          </div>
        )}
      </div>

      {/* Resize Handles */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/30 active:bg-white/50 z-30"
        onPointerDown={(e) => handleResize(e, 'left')}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/30 active:bg-white/50 z-30"
        onPointerDown={(e) => handleResize(e, 'right')}
      />
    </div>
  );
};
