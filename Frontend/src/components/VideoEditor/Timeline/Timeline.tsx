import React, { useEffect, useRef } from 'react';
import { useTimelineStore } from './store';
import { Ruler } from './Ruler';
import { TrackList } from './TrackList';

export const Timeline: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const togglePlay = useTimelineStore((state) => state.togglePlay);
  const deleteSelectedClips = useTimelineStore((state) => state.deleteSelectedClips);
  const splitClip = useTimelineStore((state) => state.splitClip);
  const selectedClipIds = useTimelineStore((state) => state.selectedClipIds);
  const zoomLevel = useTimelineStore((state) => state.zoomLevel);
  const setZoomLevel = useTimelineStore((state) => state.setZoomLevel);
  
  // Auto-scroll when playhead moves near edges during playback
  useEffect(() => {
    const unsub = useTimelineStore.subscribe((state) => {
      if (!state.isPlaying || !scrollRef.current) return;
      
      const playheadX = state.playheadTime * state.zoomLevel;
      const scrollLeft = scrollRef.current.scrollLeft;
      const clientWidth = scrollRef.current.clientWidth;
      
      // Right edge
      if (playheadX > scrollLeft + clientWidth - 100) {
        scrollRef.current.scrollLeft = playheadX - clientWidth / 2;
      }
      // Left edge
      if (playheadX < scrollLeft + 50) {
        scrollRef.current.scrollLeft = Math.max(0, playheadX - clientWidth / 2);
      }
    });
    
    return unsub;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'Backspace':
        case 'Delete':
          e.preventDefault();
          deleteSelectedClips();
          break;
        case 'KeyS':
          e.preventDefault();
          selectedClipIds.forEach(id => splitClip(id, useTimelineStore.getState().playheadTime));
          break;
        case 'Equal':
          // + or = key
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoomLevel(useTimelineStore.getState().zoomLevel * 1.2);
          }
          break;
        case 'Minus':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoomLevel(useTimelineStore.getState().zoomLevel / 1.2);
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, deleteSelectedClips, splitClip, selectedClipIds, setZoomLevel]);

  return (
    <div className="flex flex-col w-full h-80 bg-slate-950 border-t border-slate-800 text-slate-200 select-none overflow-hidden font-sans">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-auto relative custom-scrollbar"
      >
        <div className="min-w-max min-h-full">
          <div className="pl-48">
            <Ruler />
          </div>
          <TrackList />
        </div>
      </div>
    </div>
  );
};
