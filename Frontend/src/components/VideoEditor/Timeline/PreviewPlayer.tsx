import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTimelineStore } from './store';

export const PreviewPlayer: React.FC = () => {
  const clips = useTimelineStore((state) => state.clips);
  const tracks = useTimelineStore((state) => state.tracks);
  const playheadTime = useTimelineStore((state) => state.playheadTime);
  const isPlaying = useTimelineStore((state) => state.isPlaying);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentMediaUrl, setCurrentMediaUrl] = useState<string | null>(null);

  // Determine the active video clip based on playhead time
  const activeClip = useMemo(() => {
    // Sort tracks by order (top to bottom usually, so lower order is on top)
    const sortedTracks = [...tracks].sort((a, b) => a.order - b.order);
    
    // Find all clips intersecting the playhead
    const intersectingClips = clips.filter(
      (c) => 
        (c.type === 'video' || c.type === 'image') &&
        playheadTime >= c.start && 
        playheadTime < c.start + c.duration
    );
    
    // Pick the one on the top-most track (first in sortedTracks)
    for (const track of sortedTracks) {
      if (track.hidden) continue;
      const clipOnTrack = intersectingClips.find(c => c.trackId === track.id);
      if (clipOnTrack) return clipOnTrack;
    }
    
    return null;
  }, [clips, tracks, playheadTime]);

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    if (!activeClip || !activeClip.mediaUrl) {
      video.pause();
      setCurrentMediaUrl(null);
      return;
    }

    // Swapping media sources
    if (activeClip.mediaUrl !== currentMediaUrl) {
      setCurrentMediaUrl(activeClip.mediaUrl);
      video.src = activeClip.mediaUrl;
      video.load();
    }

    // Calculate correct time inside the media file
    const timeInClip = playheadTime - activeClip.start;
    const sourceTime = (activeClip.sourceStart || 0) + timeInClip;

    // Sync playhead with video time if it's drifting or if we just swapped sources
    if (Math.abs(video.currentTime - sourceTime) > 0.2) {
      video.currentTime = sourceTime;
    }

    if (isPlaying) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [activeClip, playheadTime, isPlaying, currentMediaUrl]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {!activeClip && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">
          No Media
        </div>
      )}
      
      <video
        ref={videoRef}
        className={`w-full h-full object-contain ${activeClip ? 'opacity-100' : 'opacity-0'}`}
        muted // Muted for now to avoid autoplay issues
        playsInline
      />
      
      {/* Timecode overlay */}
      <div className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded text-white font-mono text-xs">
        {playheadTime.toFixed(2)}s
      </div>
    </div>
  );
};
