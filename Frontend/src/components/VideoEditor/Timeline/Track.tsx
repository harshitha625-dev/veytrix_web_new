import React, { useRef } from 'react';
import { Track as TrackType, useTimelineStore } from './store';
import { Clip } from './Clip';
import { Eye, EyeOff, Volume2, VolumeX, Lock, Unlock, GripVertical, Music, Type, Image, Video, Mic } from 'lucide-react';

const TRACK_ICONS = {
  music: Music,
  text: Type,
  overlay: Image,
  video: Video,
  audio: Mic,
};

interface TrackProps {
  track: TrackType;
  index: number;
}

export const Track: React.FC<TrackProps> = ({ track, index }) => {
  const clips = useTimelineStore((state) => state.clips.filter(c => c.trackId === track.id));
  const updateTrack = useTimelineStore((state) => state.updateTrack);
  const zoomLevel = useTimelineStore((state) => state.zoomLevel);
  const duration = useTimelineStore((state) => state.duration);
  
  const width = duration * zoomLevel;
  
  const toggleMute = () => updateTrack(track.id, { muted: !track.muted });
  const toggleHide = () => updateTrack(track.id, { hidden: !track.hidden });
  const toggleLock = () => updateTrack(track.id, { locked: !track.locked });

  const Icon = TRACK_ICONS[track.type] || Video;

  return (
    <div className={`flex border-b border-slate-800/50 bg-[#161619] group ${track.type === 'video' ? 'h-24' : 'h-16'}`}>
      {/* Track Header (Controls) */}
      <div className="w-32 shrink-0 bg-[#111115] border-r border-slate-800/50 flex flex-col justify-center px-3 py-1 sticky left-0 z-30 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 text-slate-300">
          <Icon size={16} className="text-[#00c4a0]" />
          <span className="text-[10px] font-bold truncate flex-1 uppercase tracking-widest">{track.name}</span>
        </div>
        
        <div className="flex items-center gap-1 mt-2">
          {track.type === 'video' || track.type === 'overlay' || track.type === 'text' ? (
            <button onClick={toggleHide} className={`p-1 rounded transition-colors ${track.hidden ? 'text-red-400 bg-red-400/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}>
              {track.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          ) : null}
          
          {track.type === 'video' || track.type === 'audio' || track.type === 'music' ? (
            <button onClick={toggleMute} className={`p-1 rounded transition-colors ${track.muted ? 'text-red-400 bg-red-400/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}>
              {track.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>
          ) : null}
          
          <button onClick={toggleLock} className={`p-1 rounded ml-auto transition-colors ${track.locked ? 'text-red-400 bg-red-400/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}>
            {track.locked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>
        </div>
      </div>
      
      {/* Track Body (Timeline Area) */}
      <div 
        className={`relative flex-1 ${track.hidden ? 'opacity-30' : ''} ${track.locked ? 'pointer-events-none' : ''}`}
        style={{ width: `${width}px`, minWidth: `${width}px` }}
      >
        {/* Render grid lines if needed */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(to right, transparent, transparent ${zoomLevel - 1}px, rgba(255,255,255,0.015) ${zoomLevel - 1}px, rgba(255,255,255,0.015) ${zoomLevel}px)` }} />
        
        {/* Placeholder text for empty tracks */}
        {track.placeholder && clips.length === 0 && (
          <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
            <span className="text-[11px] font-bold bg-[#1a1a1f] border border-white/5 px-4 py-1.5 rounded-full text-slate-500 tracking-wide">
              {track.placeholder}
            </span>
          </div>
        )}

        {clips.map(clip => (
          <Clip key={clip.id} clip={clip} />
        ))}
      </div>
    </div>
  );
};
