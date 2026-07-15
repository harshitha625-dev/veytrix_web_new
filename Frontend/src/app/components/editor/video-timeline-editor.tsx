import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Video,
  Play,
  Pause,
  Sparkles,
  Layers,
  Volume2,
  Eye,
  Copy,
  Scissors,
  Lock,
  Activity,
  ZoomIn,
  ZoomOut,
  SkipBack,
  SkipForward,
  ChevronDown,
  Settings,
  EyeOff,
  VolumeX,
} from "lucide-react";

type TransitionType = 'none' | 'fade' | 'slide' | 'wipe' | 'crossfade';

type TimelineClip = {
  id: string;
  label: string;
  preview: string;
  file?: File;
  duration: number;
  trackIndex: number;
  trimStart: number;
  trimEnd: number;
  transition: TransitionType;
};

const TRANSITION_LABELS: Record<TransitionType, string> = {
  none: 'None',
  fade: 'Fade',
  slide: 'Slide',
  wipe: 'Wipe',
  crossfade: 'Crossfade',
};

const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve(video.duration || 0.1);
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => {
      resolve(5.0);
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(file);
  });
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Format seconds to HH:MM:SS:FF (Filmora style)
const formatTimecode = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const f = Math.floor((seconds % 1) * 30);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
};

// Orange slider CSS injected once
const SLIDER_STYLE = `
  .filmora-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 3px;
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }
  .filmora-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #e8834a;
    border: 2px solid #f0a070;
    cursor: pointer;
    box-shadow: 0 0 6px rgba(232,131,74,0.6);
  }
  .filmora-slider::-moz-range-thumb {
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #e8834a;
    border: 2px solid #f0a070;
    cursor: pointer;
    box-shadow: 0 0 6px rgba(232,131,74,0.6);
  }
`;

export function VideoTimelineEditor() {
  const [clips, setClips] = useState<TimelineClip[]>([]);
  const [trackCount, setTrackCount] = useState(3);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);
  const [trackSize, setTrackSize] = useState(1.0);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [magnetEnabled, setMagnetEnabled] = useState(true);
  const [rippleEnabled, setRippleEnabled] = useState(false);

  // Right panel video properties
  const [opacity, setOpacity] = useState(100);
  const [speed, setSpeed] = useState(80);
  const [positionX, setPositionX] = useState(80);
  const [positionY, setPositionY] = useState(60);
  const [rgbStroke, setRgbStroke] = useState(true);
  const [rightTab, setRightTab] = useState<'effects' | 'video'>('video');

  // Track visibility/mute states
  const [trackMuted, setTrackMuted] = useState<Record<number, boolean>>({});
  const [trackVisible, setTrackVisible] = useState<Record<number, boolean>>({});
  const [trackLocked, setTrackLocked] = useState<Record<number, boolean>>({});

  const previewRef = useRef<HTMLVideoElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlsRef = useRef<string[]>([]);

  const activeClip = useMemo(() => clips.find((clip) => clip.id === selectedClipId) ?? null, [clips, selectedClipId]);

  const trackGroups = useMemo(() => {
    return Array.from({ length: trackCount }, (_, trackIndex) => ({
      index: trackIndex,
      clips: clips.filter((clip) => clip.trackIndex === trackIndex),
    }));
  }, [clips, trackCount]);

  const trackDurations = useMemo(() => {
    return trackGroups.map((row) => row.clips.reduce((sum, clip) => sum + (clip.trimEnd - clip.trimStart), 0));
  }, [trackGroups]);

  const longestTrackDuration = useMemo(() => Math.max(0.01, ...trackDurations, 10), [trackDurations]);
  const basePixelsPerSecond = 80;
  const pixelsPerSecond = Math.max(40, basePixelsPerSecond * zoom);
  const timelineWidth = Math.max(560, longestTrackDuration * pixelsPerSecond + 120);

  const totalTimelineDuration = useMemo(() => {
    const allClips = clips.filter(c => c.trackIndex === 0);
    if (allClips.length === 0) return 10;
    return allClips.reduce((sum, clip) => sum + (clip.trimEnd - clip.trimStart), 0);
  }, [clips]);

  const trackOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    trackGroups.forEach((row) => {
      let offset = 0;
      row.clips.forEach((clip) => {
        offsets[clip.id] = offset;
        offset += (clip.trimEnd - clip.trimStart) * pixelsPerSecond + 8;
      });
    });
    return offsets;
  }, [trackGroups, pixelsPerSecond]);

  const activeClipOffset = useMemo(() => {
    if (!activeClip) return 0;
    return trackOffsets[activeClip.id] ?? 0;
  }, [activeClip, trackOffsets]);

  const activeClipDuration = activeClip ? Math.max(0.1, activeClip.trimEnd - activeClip.trimStart) : 0.1;

  const playheadLeft = useMemo(() => {
    return (globalProgress / 100) * timelineWidth;
  }, [globalProgress, timelineWidth]);

  const currentTimeSec = globalProgress * longestTrackDuration / 100;

  const updateClipRange = useCallback((clipId: string, values: Partial<Pick<TimelineClip, 'trimStart' | 'trimEnd'>>) => {
    setClips((prev) => prev.map((clip) => clip.id === clipId ? {
      ...clip,
      trimStart: clamp(values.trimStart ?? clip.trimStart, 0, clip.trimEnd - 0.15),
      trimEnd: clamp(values.trimEnd ?? clip.trimEnd, clip.trimStart + 0.15, clip.duration),
    } : clip));
  }, []);

  const importVideoFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const incoming = await Promise.all(Array.from(files).map(async (file) => {
      const duration = await getVideoDuration(file);
      const preview = URL.createObjectURL(file);
      previewUrlsRef.current.push(preview);
      return {
        id: Math.random().toString(36).slice(2, 11),
        label: file.name,
        preview,
        file,
        trimStart: 0,
        trimEnd: Math.max(0.1, duration),
        duration: Math.max(0.1, duration),
        trackIndex: 0,
        transition: 'fade' as TransitionType,
      };
    }));
    setClips((prev) => [...prev, ...incoming]);
    setSelectedClipId(incoming[0]?.id ?? selectedClipId);
    setIsPlaying(false);
  }, [selectedClipId]);

  const moveClipToTrack = useCallback((clipId: string, trackIndex: number) => {
    setClips((prev) => {
      const moved = prev.find((clip) => clip.id === clipId);
      if (!moved) return prev;
      const without = prev.filter((clip) => clip.id !== clipId);
      return [...without, { ...moved, trackIndex }];
    });
  }, []);

  const reorderClipInTrack = useCallback((clipId: string, targetClipId: string, targetTrack: number) => {
    setClips((prev) => {
      const moved = prev.find((clip) => clip.id === clipId);
      if (!moved) return prev;
      const without = prev.filter((clip) => clip.id !== clipId);
      const destination = without.filter((clip) => clip.trackIndex === targetTrack);
      const beforeIndex = destination.findIndex((clip) => clip.id === targetClipId);
      const inserted = [...destination];
      const movedClip = { ...moved, trackIndex: targetTrack };
      if (beforeIndex === -1) inserted.push(movedClip);
      else inserted.splice(beforeIndex, 0, movedClip);
      return [...without.filter((clip) => clip.trackIndex !== targetTrack), ...inserted];
    });
  }, []);

  const removeClip = useCallback((clipId: string) => {
    setClips((prev) => {
      const removedClip = prev.find((clip) => clip.id === clipId);
      if (removedClip) URL.revokeObjectURL(removedClip.preview);
      return prev.filter((clip) => clip.id !== clipId);
    });
    if (selectedClipId === clipId) {
      setSelectedClipId(null);
      setIsPlaying(false);
      setGlobalProgress(0);
    }
  }, [selectedClipId]);

  const setTransitionForClip = useCallback((clipId: string, transition: TransitionType) => {
    setClips((prev) => prev.map((clip) => clip.id === clipId ? { ...clip, transition } : clip));
  }, []);

  const buildTransitionPlan = useCallback(() => {
    if (clips.length === 0) return [];
    const sortedClips = [...clips].sort((a, b) => {
      if (a.trackIndex !== b.trackIndex) return a.trackIndex - b.trackIndex;
      return (trackOffsets[a.id] ?? 0) - (trackOffsets[b.id] ?? 0);
    });
    return sortedClips.map((clip, index) => ({ index, transition: clip.transition }));
  }, [clips, trackOffsets]);

  const exportTimeline = useCallback(async () => {
    if (clips.length === 0) return;
    try {
      const plan = buildTransitionPlan();
      const sortedClips = [...clips].sort((a, b) => {
        if (a.trackIndex !== b.trackIndex) return a.trackIndex - b.trackIndex;
        return (trackOffsets[a.id] ?? 0) - (trackOffsets[b.id] ?? 0);
      });
      const formData = new FormData();
      for (let i = 0; i < sortedClips.length; i++) {
        const clip = sortedClips[i];
        if (clip.file) formData.append(`media`, clip.file, clip.label);
        formData.append(`clip_${i}_label`, clip.label);
        formData.append(`clip_${i}_transition`, clip.transition);
        formData.append(`clip_${i}_trimStart`, String(clip.trimStart));
        formData.append(`clip_${i}_trimEnd`, String(clip.trimEnd));
        formData.append(`clip_${i}_duration`, String(clip.duration));
      }
      formData.append("transitionPlan", JSON.stringify(plan));
      formData.append("totalClips", String(sortedClips.length));
      window.dispatchEvent(new CustomEvent('timeline-ready-for-export', {
        detail: { formData, clips: sortedClips, transitionPlan: plan },
      }));
    } catch (error) {
      console.error("❌ [TIMELINE] Export failed:", error);
    }
  }, [clips, buildTransitionPlan, trackOffsets]);

  useEffect(() => {
    if (!previewRef.current || !activeClip) return;
    const video = previewRef.current;
    const onTimeUpdate = () => {
      const current = clamp(video.currentTime, activeClip.trimStart, activeClip.trimEnd);
      const timeWithin = current - activeClip.trimStart;
      const progressPercent = (activeClipOffset + timeWithin) / (longestTrackDuration || 1) * 100;
      setGlobalProgress(Math.min(100, progressPercent));
      if (current >= activeClip.trimEnd - 0.05) { video.pause(); setIsPlaying(false); }
    };
    const onSeeked = () => {
      const current = clamp(video.currentTime, activeClip.trimStart, activeClip.trimEnd);
      const timeWithin = current - activeClip.trimStart;
      setGlobalProgress(Math.min(100, (activeClipOffset + timeWithin) / (longestTrackDuration || 1) * 100));
    };
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('seeked', onSeeked);
    return () => { video.removeEventListener('timeupdate', onTimeUpdate); video.removeEventListener('seeked', onSeeked); };
  }, [activeClip, activeClipDuration, activeClipOffset, clips, longestTrackDuration, trackOffsets]);

  useEffect(() => {
    if (!previewRef.current || !activeClip) return;
    const video = previewRef.current;
    video.currentTime = activeClip.trimStart;
    if (isPlaying) video.play().catch(() => {});
    else video.pause();
  }, [activeClip, isPlaying]);

  useEffect(() => {
    return () => { previewUrlsRef.current.forEach(URL.revokeObjectURL); previewUrlsRef.current = []; };
  }, []);

  const handleDropOnTrack = (trackIndex: number) => {
    if (!draggingClipId) return;
    moveClipToTrack(draggingClipId, trackIndex);
    setDraggingClipId(null);
  };

  // Build tick marks for ruler
  const rulerTicks = useMemo(() => {
    const interval = zoom < 0.8 ? 10 : zoom < 1.5 ? 5 : 2;
    const count = Math.ceil(longestTrackDuration / interval) + 1;
    return Array.from({ length: count }, (_, i) => i * interval);
  }, [longestTrackDuration, zoom]);

  return (
    <div className="flex h-full flex-col bg-[#1a1a1f] text-slate-200 font-sans select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{SLIDER_STYLE}</style>

      {/* ─── Top Toolbar (Filmora-style) ─── */}
      <div className="flex items-center gap-2 border-b border-black/50 bg-[#222228] px-3 py-1.5 text-xs shrink-0">
        {/* Left tools */}
        <div className="flex items-center gap-1">
          <button onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#2d7dd2] hover:bg-[#3a8ae0] text-white font-semibold text-[11px] transition">
            <Plus className="w-3.5 h-3.5" /> Add Media
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          {[
            { icon: <Scissors className="w-3.5 h-3.5" />, title: "Split" },
            { icon: <Copy className="w-3.5 h-3.5" />, title: "Copy" },
            { icon: <Trash2 className="w-3.5 h-3.5" />, title: "Delete" },
          ].map(({ icon, title }) => (
            <button key={title} title={title}
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition">
              {icon}
            </button>
          ))}

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Snap / Magnet toggles */}
          <button onClick={() => setSnapEnabled(!snapEnabled)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition ${snapEnabled ? 'bg-[#00c4a0]/20 text-[#00c4a0] border border-[#00c4a0]/30' : 'text-slate-500 hover:text-slate-300'}`}>
            <Layers className="w-3 h-3" /> Snap
          </button>
          <button onClick={() => setMagnetEnabled(!magnetEnabled)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition ${magnetEnabled ? 'bg-[#00c4a0]/20 text-[#00c4a0] border border-[#00c4a0]/30' : 'text-slate-500 hover:text-slate-300'}`}>
            <Activity className="w-3 h-3" /> Magnet
          </button>
        </div>

        <div className="flex-1" />

        {/* Center — timecode display */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#111115] border border-white/10 font-mono text-[11px]">
          <span className="text-[#00c4a0] font-black tracking-widest">{formatTimecode(currentTimeSec)}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">{formatTimecode(longestTrackDuration)}</span>
        </div>

        <div className="flex-1" />

        {/* Right — zoom */}
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(Math.max(0.5, zoom - 0.2))} className="text-slate-400 hover:text-white transition p-1">
            <ZoomOut className="w-4 h-4" />
          </button>
          <input type="range" min={0.5} max={3.0} step={0.1} value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="filmora-slider w-24"
            style={{ background: `linear-gradient(to right, #e8834a ${((zoom - 0.5) / 2.5) * 100}%, #3a3a42 ${((zoom - 0.5) / 2.5) * 100}%)` }}
          />
          <button onClick={() => setZoom(Math.min(3.0, zoom + 0.2))} className="text-slate-400 hover:text-white transition p-1">
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-slate-500 font-mono w-8">{(zoom * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* ─── Main body: Timeline + Right Panel ─── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ════ CENTER: Timeline ════ */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Playback controls row (Filmora-style center bar) */}
          <div className="flex items-center justify-center gap-3 py-1.5 bg-[#1e1e24] border-b border-black/40 shrink-0">
            <button className="text-slate-400 hover:text-white transition p-1">
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-[#00c4a0] hover:bg-[#00d9b3] flex items-center justify-center text-black shadow-[0_0_14px_rgba(0,196,160,0.5)] transition">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button className="text-slate-400 hover:text-white transition p-1">
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-white/10 mx-2" />

            <button
              onClick={() => exportTimeline()}
              disabled={clips.length === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#e8834a] hover:bg-[#f09460] text-white font-bold text-[11px] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(232,131,74,0.4)]">
              <Sparkles className="w-3.5 h-3.5" /> Generate
            </button>
          </div>

          {/* Timeline rows */}
          <div className="flex flex-1 overflow-hidden">

            {/* Left Track Headers */}
            <div className="w-[140px] bg-[#1a1a1f] border-r border-black/50 flex flex-col shrink-0">
              {/* Ruler corner */}
              <div className="h-7 border-b border-black/50 bg-[#111115] flex items-center justify-end px-2">
                <button onClick={() => setTrackCount(c => c + 1)}
                  className="flex items-center gap-1 text-[9px] font-bold text-[#00c4a0] uppercase tracking-wider hover:text-[#00e6be] transition">
                  <Plus className="w-3 h-3" /> Track
                </button>
              </div>

              {/* Track label rows */}
              <div className="flex-1 overflow-y-auto">
                {trackGroups.map((row) => (
                  <div
                    key={row.index}
                    style={{ height: `${trackSize * 72}px` }}
                    className={`flex flex-col justify-between border-b border-black/30 px-2 py-1.5 bg-[#1e1e24] hover:bg-[#232329] transition group`}
                  >
                    {/* Track name row */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                        Video {row.index + 1}
                      </span>
                      <button className="opacity-0 group-hover:opacity-100 transition">
                        <ChevronDown className="w-3 h-3 text-slate-500" />
                      </button>
                    </div>

                    {/* Track control icons */}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setTrackLocked(prev => ({ ...prev, [row.index]: !prev[row.index] }))}
                        className={`p-1 rounded hover:bg-white/5 transition ${trackLocked[row.index] ? 'text-[#e8834a]' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Lock">
                        <Lock className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setTrackMuted(prev => ({ ...prev, [row.index]: !prev[row.index] }))}
                        className={`p-1 rounded hover:bg-white/5 transition ${trackMuted[row.index] ? 'text-[#e8834a]' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Mute">
                        {trackMuted[row.index] ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => setTrackVisible(prev => ({ ...prev, [row.index]: !prev[row.index] }))}
                        className={`p-1 rounded hover:bg-white/5 transition ${trackVisible[row.index] === false ? 'text-[#e8834a]' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Visibility">
                        {trackVisible[row.index] === false ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline canvas */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#161619]">

              {/* Time ruler */}
              <div
                ref={timelineRef}
                className="h-7 bg-[#111115] border-b border-black/50 overflow-x-auto shrink-0 relative"
                style={{ scrollbarWidth: 'none' }}>
                <div className="relative h-full" style={{ width: timelineWidth, minWidth: '100%' }}>
                  {rulerTicks.map((sec) => {
                    const x = sec * pixelsPerSecond;
                    return (
                      <div key={sec} className="absolute top-0 flex flex-col items-center" style={{ left: x }}>
                        <div className="w-px h-3 bg-white/25 mt-auto" style={{ marginTop: 'auto' }} />
                        <span className="text-[8px] font-mono text-slate-500 mt-0.5 -translate-x-1/2 select-none">
                          {formatTimecode(sec)}
                        </span>
                        {/* Sub-ticks */}
                        {[0.25, 0.5, 0.75].map((frac) => (
                          <div
                            key={frac}
                            className="absolute top-2 w-px bg-white/10"
                            style={{ left: frac * (rulerTicks[1] ?? 5) * pixelsPerSecond, height: 6 }}
                          />
                        ))}
                      </div>
                    );
                  })}

                  {/* Playhead on ruler */}
                  <motion.div
                    className="absolute top-0 h-full w-px bg-[#ff4040] z-20"
                    animate={{ left: playheadLeft }}
                    transition={{ type: 'tween', duration: 0.05 }}
                  >
                    {/* Triangle marker */}
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-0 h-0"
                      style={{
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '8px solid #ff4040',
                      }} />
                  </motion.div>
                </div>
              </div>

              {/* Tracks grid */}
              <div className="flex-1 overflow-auto relative"
                style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.012) 80px)' }}>
                <div className="relative" style={{ width: timelineWidth, minWidth: '100%' }}>

                  {/* Playhead line through tracks */}
                  <motion.div
                    className="absolute top-0 bottom-0 w-px bg-[#ff4040] z-40 pointer-events-none"
                    animate={{ left: playheadLeft }}
                    transition={{ type: 'tween', duration: 0.05 }}
                  >
                    <div className="absolute inset-y-0 -left-px -right-px bg-[#ff4040]/10 blur-[2px]" />
                  </motion.div>

                  {/* Tracks */}
                  <div>
                    {trackGroups.map((row) => (
                      <div
                        key={row.index}
                        onDragOver={(e) => { e.preventDefault(); setHoveredTrack(row.index); }}
                        onDragLeave={() => setHoveredTrack(null)}
                        onDrop={() => handleDropOnTrack(row.index)}
                        style={{ height: `${trackSize * 72}px` }}
                        className={`relative border-b border-black/30 transition-colors ${
                          hoveredTrack === row.index
                            ? 'bg-[#00c4a0]/8 border-[#00c4a0]/30'
                            : 'bg-[#1a1a1f]'
                        }`}
                      >
                        {/* Empty drop hint */}
                        {row.clips.length === 0 && (
                          <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                            <span className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">
                              Drop media here
                            </span>
                          </div>
                        )}

                        {/* Clips */}
                        {row.clips.map((clip) => {
                          const clipLeft = trackOffsets[clip.id] ?? 0;
                          const clipWidth = Math.max(100, (clip.trimEnd - clip.trimStart) * pixelsPerSecond);
                          const isSelected = selectedClipId === clip.id;

                          return (
                            <motion.div
                              key={clip.id}
                              layout
                              draggable
                              onDragStart={(e: any) => { e.dataTransfer.setData('clipId', clip.id); setDraggingClipId(clip.id); }}
                              onDragEnd={() => setDraggingClipId(null)}
                              onDrop={(e: any) => {
                                e.preventDefault();
                                const draggedId = e.dataTransfer.getData('clipId');
                                if (draggedId && draggedId !== clip.id) reorderClipInTrack(draggedId, clip.id, row.index);
                                setDraggingClipId(null);
                              }}
                              onDragOver={(e) => e.preventDefault()}
                              onClick={() => setSelectedClipId(clip.id)}
                              onDoubleClick={() => setIsPlaying(!isPlaying)}
                              className={`absolute top-1 bottom-1 rounded overflow-hidden flex flex-col cursor-pointer transition-all ${
                                isSelected
                                  ? 'ring-2 ring-[#00e6be] shadow-[0_0_16px_rgba(0,196,160,0.35)]'
                                  : 'hover:ring-1 hover:ring-[#00c4a0]/60'
                              }`}
                              style={{ left: clipLeft, width: `${clipWidth}px` }}
                            >
                              {/* Teal body */}
                              <div className="absolute inset-0 bg-[#0e3d35]" />
                              <div className="absolute inset-0 bg-gradient-to-b from-[#00c4a0]/25 to-[#00c4a0]/5" />

                              {/* Left accent bar (teal) */}
                              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#00c4a0] z-10 rounded-l" />

                              {/* Filmstrip thumbnails */}
                              <div className="absolute inset-0 left-2 flex overflow-hidden opacity-30 pointer-events-none">
                                {Array.from({ length: Math.max(2, Math.ceil(clipWidth / 48)) }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="flex-1 border-r border-black/20 bg-cover bg-center"
                                    style={{ backgroundImage: clip.preview ? `url(${clip.preview})` : undefined }}
                                  />
                                ))}
                              </div>

                              {/* Waveform bars */}
                              <div className="absolute bottom-0 left-2 right-0 h-1/3 flex items-end gap-px opacity-50 pointer-events-none z-10">
                                {Array.from({ length: Math.min(80, Math.ceil(clipWidth / 4)) }).map((_, i) => {
                                  const h = 20 + Math.sin(i * 0.4) * 28 + Math.cos(i * 0.9) * 25;
                                  return (
                                    <div key={i} className="w-px bg-[#00c4a0] rounded-t"
                                      style={{ height: `${Math.max(10, Math.min(100, h))}%` }} />
                                  );
                                })}
                              </div>

                              {/* Clip info */}
                              <div className="relative z-20 px-2 py-1 flex items-start justify-between h-full pl-3">
                                <div className="flex flex-col justify-between h-full min-w-0">
                                  <div className="flex items-center gap-1">
                                    <Video className="w-3 h-3 text-[#00c4a0] flex-shrink-0" />
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-white truncate max-w-[120px]">
                                      {clip.label}
                                    </span>
                                  </div>
                                  <span className="text-[8px] text-[#00c4a0]/70 font-mono">
                                    {(clip.trimEnd - clip.trimStart).toFixed(1)}s
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeClip(clip.id); }}
                                  className="p-0.5 rounded hover:bg-red-500 text-slate-500 hover:text-white transition-all mt-0.5 shrink-0"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              {/* Right resize handle */}
                              <div className="absolute top-0 right-0 bottom-0 w-2 cursor-e-resize bg-[#00c4a0]/20 hover:bg-[#00c4a0]/40 transition z-30" />
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Bottom status bar ─── */}
          <div className="border-t border-black/50 bg-[#111115] px-4 py-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
            <div className="flex items-center gap-4">
              <span><span className="text-slate-600 mr-1">TIME</span><span className="text-[#00c4a0]">{formatTimecode(currentTimeSec)}</span></span>
              <span><span className="text-slate-600 mr-1">TOTAL</span><span className="text-slate-300">{formatTimecode(longestTrackDuration)}</span></span>
              <span><span className="text-slate-600 mr-1">FPS</span><span className="text-slate-300">30</span></span>
              <span><span className="text-slate-600 mr-1">CLIPS</span><span className="text-slate-300">{clips.length}</span></span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setRippleEnabled(!rippleEnabled)}
                className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold transition ${rippleEnabled ? 'bg-[#00c4a0]/20 text-[#00c4a0]' : 'text-slate-600 hover:text-slate-400'}`}>
                Ripple
              </button>
              <span className="text-slate-600">Zoom {(zoom * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* ════ RIGHT PANEL: Effects / Video Properties (Filmora-style) ════ */}
        <div className="w-[220px] bg-[#1e1e24] border-l border-black/50 flex flex-col shrink-0">

          {/* Tab bar */}
          <div className="flex border-b border-black/50">
            {(['effects', 'video'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider transition ${
                  rightTab === tab
                    ? 'text-[#00c4a0] border-b-2 border-[#00c4a0] bg-[#111115]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab === 'effects' ? 'Effects' : 'Video'}
              </button>
            ))}
          </div>

          {rightTab === 'video' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4">

              {/* RGB Stroke toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Teal toggle */}
                  <button
                    onClick={() => setRgbStroke(!rgbStroke)}
                    className={`w-9 h-5 rounded-full relative transition-colors ${rgbStroke ? 'bg-[#00c4a0]' : 'bg-[#3a3a42]'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${rgbStroke ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-[11px] font-bold text-slate-200">RGB Stroke</span>
                </div>
                <Settings className="w-3.5 h-3.5 text-slate-500" />
              </div>

              <div className="h-px bg-white/5" />

              {/* Property sliders */}
              {[
                { label: 'Opacity', value: opacity, setValue: setOpacity, min: 0, max: 100 },
                { label: 'Speed', value: speed, setValue: setSpeed, min: 0, max: 200 },
                { label: 'Position X', value: positionX, setValue: setPositionX, min: -200, max: 200 },
                { label: 'Position Y', value: positionY, setValue: setPositionY, min: -200, max: 200 },
              ].map(({ label, value, setValue, min, max }) => {
                const pct = ((value - min) / (max - min)) * 100;
                return (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-300">{label}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => setValue(clamp(Number(e.target.value), min, max))}
                          className="w-10 text-right text-[10px] font-mono text-slate-200 bg-[#111115] border border-white/10 rounded px-1 py-0.5 outline-none focus:border-[#00c4a0]/50"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                      className="filmora-slider w-full"
                      style={{
                        background: `linear-gradient(to right, #e8834a ${pct}%, #2e2e36 ${pct}%)`,
                      }}
                    />
                  </div>
                );
              })}

              <div className="h-px bg-white/5" />

              {/* Transition selector */}
              {activeClip && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-300">Transition</span>
                  <select
                    value={activeClip.transition}
                    onChange={(e) => setTransitionForClip(activeClip.id, e.target.value as TransitionType)}
                    className="w-full px-2 py-1.5 rounded bg-[#111115] border border-white/10 text-[11px] text-slate-200 outline-none focus:border-[#00c4a0]/50 cursor-pointer"
                  >
                    {(['none', 'fade', 'slide', 'wipe', 'crossfade'] as TransitionType[]).map((t) => (
                      <option key={t} value={t}>{TRANSITION_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Clip info */}
              {activeClip && (
                <div className="rounded-lg border border-white/5 bg-[#111115] p-2 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clip Info</span>
                  {[
                    ['Name', activeClip.label],
                    ['Duration', `${activeClip.duration.toFixed(2)}s`],
                    ['Trim', `${activeClip.trimStart.toFixed(2)}s – ${activeClip.trimEnd.toFixed(2)}s`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[10px]">
                      <span className="text-slate-500">{k}</span>
                      <span className="text-slate-300 truncate max-w-[110px] text-right">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Track size */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300">Track Size</span>
                  <span className="text-[10px] font-mono text-slate-500">{trackSize.toFixed(1)}x</span>
                </div>
                <input
                  type="range" min={0.5} max={1.8} step={0.1} value={trackSize}
                  onChange={(e) => setTrackSize(Number(e.target.value))}
                  className="filmora-slider w-full"
                  style={{ background: `linear-gradient(to right, #e8834a ${((trackSize - 0.5) / 1.3) * 100}%, #2e2e36 ${((trackSize - 0.5) / 1.3) * 100}%)` }}
                />
              </div>
            </div>
          )}

          {rightTab === 'effects' && (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-[11px] font-bold uppercase tracking-wider">
              No Effect Selected
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => importVideoFiles(e.target.files)}
      />
    </div>
  );
}
