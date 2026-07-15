import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import {
  Trash2, Plus, Music, Type, Activity, Film, Volume2, VolumeX,
  Lock, Unlock, Eye, EyeOff, Scissors, Copy, Clipboard, Layers,
  Settings, Magnet, RotateCcw, ChevronDown, ChevronRight,
  Sparkles, MessageSquare, Maximize2, Minimize2, ZoomIn, ZoomOut,
  RefreshCw, MoreVertical, Play, Pause, Info, Tag, Check, Sliders,
  Link, Link2, Link2Off, EyeClosed
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────── Types ─────────────────────────── */

interface Clip {
  id: string;
  name: string;
  type: "video" | "image" | "audio" | "text" | "effect";
  startTime: number;
  duration: number;
  file?: File;
  preview?: string;
  trackId: string;
  isLocked?: boolean;
}

interface Track {
  id: string;
  name: string;
  type: "video" | "audio" | "text" | "overlay" | "effect";
  isLocked: boolean;
  isHidden: boolean;
  isMuted: boolean;
  isCollapsed: boolean;
  height: number;
}

interface Marker {
  id: string;
  time: number;
  label?: string;
  color?: string;
}

/* ─────────────────────── Helper utilities ───────────────────── */

/** Generates high-fidelity simulated waveform path for audio clips with dynamic density (zoom scaling) */
function generateWaveformPath(width: number, height: number, seed: string, density: number = 3): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h) + seed.charCodeAt(i);
    h |= 0;
  }
  
  const points = Math.max(10, Math.floor(width / density));
  let path = `M 0 ${height / 2} `;
  
  for (let i = 0; i < points; i++) {
    const angle = (h * (i + 1)) % Math.PI;
    const amplitude = 5 + Math.abs(Math.sin(angle)) * (height * 0.4);
    const x = (i / points) * width;
    const yTop = height / 2 - amplitude;
    const yBottom = height / 2 + amplitude;
    path += `L ${x} ${yTop} L ${x} ${yBottom} L ${x} ${height / 2} `;
  }
  path += `L ${width} ${height / 2}`;
  return path;
}

function fmtTime(t: number) {
  const m = Math.floor(t / 60).toString().padStart(2, "0");
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  const cs = Math.floor((t % 1) * 100).toString().padStart(2, "0");
  return `${m}:${s}.${cs}`;
}

const Divider = () => <div className="w-px h-5 bg-white/10 mx-1.5 flex-none" />;

function TBtn({
  icon: Icon, label, onClick, disabled = false, danger = false, active = false, text
}: {
  icon: any; label: string; onClick: () => void;
  disabled?: boolean; danger?: boolean; active?: boolean; text?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-wider
        ${disabled
          ? "opacity-35 cursor-not-allowed border-transparent text-slate-600 bg-transparent"
          : active
            ? "bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-lg shadow-purple-500/5"
            : danger
              ? "border-transparent text-slate-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
              : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-slate-200"
        }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {text && <span>{text}</span>}
    </button>
  );
}

function TrackBtn({ onClick, title, children, active = false, danger = false }: {
  onClick: (e: React.MouseEvent) => void; title: string; children: React.ReactNode; active?: boolean; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1 rounded-md transition-all ${
        danger   ? "text-rose-400 hover:bg-rose-500/15" :
        active   ? "text-purple-400 bg-purple-500/10 border border-purple-500/20" :
                    "text-slate-500 hover:text-slate-300 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

function FooterChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 select-none bg-black/20 border border-white/5 rounded-md px-2 py-0.5">
      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      <span className="text-[10px] font-mono font-medium text-slate-300">{value}</span>
    </div>
  );
}

function FooterToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-colors ${
        active ? "text-purple-300 bg-purple-500/15 border border-purple-500/20" : "text-slate-500 hover:text-slate-400"
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${active ? "bg-purple-400 animate-pulse" : "bg-slate-600"}`} />
      {label}
    </button>
  );
}

/* ─────────────────────── Main Component ────────────────────── */

export const TimelineHub = memo(({
  mediaItems = [],
  getClipGlobalStart,
  audioTracks = [],
  captions = [],
  currentCaption,
  setCurrentCaption,
  progress = 0,
  handleTimelineClick,
  activePreviewId,
  setActivePreviewId,
  isPlaying,
  clipTrimRanges = {},
  setClipTrimRanges,
  getTrimRangeForItem,
  videoRef,
  handleAddAudio,
  handleAddVideo,
  handleReorderClips,
  handleDeleteClip,
  getMediaDuration,
  setMediaItems,
  saveToUndo,
  timelineSize,
  setTimelineSize,
  overlayTextStylePreset,
  overlayTextStylePresetCss,
  extractingAudio,
  setExtractingAudio,
  audioError,
  setAudioError,
  showReadLine,
  setShowReadLine,
  selectPreviewWithTransition,
  session,
  handleAddAssetToTimeline,
  currentTime: currentTimeProp,
}: any) => {

  /* ── State ─────────────────────────────────────────────────── */
  const [pixelsPerSecond, setPixelsPerSecond] = useState(30);
  const [isMagnetEnabled, setIsMagnetEnabled] = useState(true);
  const [isRippleEnabled, setIsRippleEnabled] = useState(true);
  const [isSnapEnabled, setIsSnapEnabled] = useState(true);
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [clipboard, setClipboard] = useState<any[]>([]);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(800);

  // Tracks State
  const [tracks, setTracks] = useState<Track[]>([
    { id: "video-1",   name: "Video 1",          type: "video",   isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 80 },
  ]);

  // Local clip overrides for highly production-ready interactive overrides
  const [clipTrackOverrides, setClipTrackOverrides] = useState<Record<string, string>>({});
  const [clipStartOverrides, setClipStartOverrides] = useState<Record<string, number>>({});
  const [clipNameOverrides, setClipNameOverrides] = useState<Record<string, string>>({});
  const [clipLockedStates, setClipLockedStates] = useState<Record<string, boolean>>({});
  const [clipColorsLocal, setClipColorsLocal] = useState<Record<string, string>>({});
  const [clipSpeeds, setClipSpeeds] = useState<Record<string, number>>({});
  const [clipReverses, setClipReverses] = useState<Record<string, boolean>>({});
  const [clipGroups, setClipGroups] = useState<Record<string, string>>({});

  // UI State
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editingTrackName, setEditingTrackName] = useState("");
  const [editingClipId, setEditingClipId] = useState<string | null>(null);
  const [editingClipName, setEditingClipName] = useState("");
  const [showSpeedDialog, setShowSpeedDialog] = useState<string | null>(null);
  const [speedInputValue, setSpeedInputValue] = useState("1.0");
  const [showPropertiesId, setShowPropertiesId] = useState<string | null>(null);
  
  const [boxSelectStart, setBoxSelectStart]     = useState<{ x: number; y: number } | null>(null);
  const [boxSelectCurrent, setBoxSelectCurrent] = useState<{ x: number; y: number } | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; clipId: string;
  } | null>(null);

  const [trackContextMenu, setTrackContextMenu] = useState<{
    x: number; y: number; trackId: string;
  } | null>(null);

  const [draggedClip, setDraggedClip] = useState<{
    id: string; offsetX: number; initialStartTime: number;
    initialTrackId: string; ghostStartTime: number; ghostTrackId: string; type: string;
  } | null>(null);

  const [snapGuideX, setSnapGuideX] = useState<number | null>(null);
  const [hoveredClipId, setHoveredClipId] = useState<string | null>(null);

  /* ── Refs ──────────────────────────────────────────────────── */
  const scrollRef   = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLDivElement>(null);
  const rulerRef    = useRef<HTMLDivElement>(null);
  const sidebarTracksRef = useRef<HTMLDivElement>(null);
  const dragOverTrackIdRef = useRef<string | null>(null);

  /* ── Measure track viewport width dynamically ───────────────── */
  useEffect(() => {
    if (!scrollRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setViewportWidth(entry.contentRect.width);
      }
    });
    observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);

  /* ── Derived values ────────────────────────────────────────── */
  const totalDuration = useMemo(() => {
    let max = 15;
    mediaItems.forEach((it: any) => {
      const t = getTrimRangeForItem ? getTrimRangeForItem(it.id, it.duration) : { start: 0, end: it.duration };
      const dur = it.type === "video" ? (t.end - t.start) : it.duration;
      const start = clipStartOverrides[it.id] !== undefined ? clipStartOverrides[it.id] : (getClipGlobalStart ? getClipGlobalStart(it.id) : 0);
      max = Math.max(max, start + (Number(dur) || 3));
    });
    audioTracks.forEach((t: any) => {
      const start = clipStartOverrides[t.id] !== undefined ? clipStartOverrides[t.id] : 0;
      max = Math.max(max, start + (t.duration || 10));
    });
    captions.forEach((c: any) => {
      const start = clipStartOverrides[c.id] !== undefined ? clipStartOverrides[c.id] : c.startTime;
      max = Math.max(max, start + ((c.endTime ?? c.startTime + 2) - c.startTime));
    });
    return Math.max(15, max + 10);
  }, [mediaItems, audioTracks, captions, getClipGlobalStart, getTrimRangeForItem, clipStartOverrides]);

  const paddingLeft = viewportWidth / 2;
  const currentTime = useMemo(() => {
    if (currentTimeProp !== undefined) return currentTimeProp;
    return (progress / 100) * totalDuration;
  }, [currentTimeProp, progress, totalDuration]);
  const playheadPx   = useMemo(() => currentTime * pixelsPerSecond, [currentTime, pixelsPerSecond]);
  const canvasWidth  = useMemo(() => Math.max(1200, totalDuration * pixelsPerSecond + 400), [totalDuration, pixelsPerSecond]);

  const clips = useMemo<Clip[]>(() => {
    const list: Clip[] = [];
    let accStart = 0;
    
    mediaItems.forEach((it: any) => {
      const t = getTrimRangeForItem ? getTrimRangeForItem(it.id, it.duration) : { start: 0, end: it.duration };
      const dur = it.type === "video" ? (t.end - t.start) : it.duration;
      const finalStart = clipStartOverrides[it.id] !== undefined ? clipStartOverrides[it.id] : accStart;
      const finalTrack = clipTrackOverrides[it.id] || "video-1";
      const finalName = clipNameOverrides[it.id] || (it.file?.name ?? `Video Clip`);
      
      list.push({
        id: it.id,
        name: finalName,
        type: it.type,
        startTime: finalStart,
        duration: dur,
        file: it.file,
        preview: it.preview,
        trackId: finalTrack,
        isLocked: clipLockedStates[it.id] || false,
      });
      accStart += dur;
    });
    
    audioTracks.forEach((tr: any) => {
      const finalStart = clipStartOverrides[tr.id] !== undefined ? clipStartOverrides[tr.id] : 0;
      const finalTrack = clipTrackOverrides[tr.id] || ((tr.trackIndex ?? 0) === 0 ? "audio-1" : "audio-2");
      const finalName = clipNameOverrides[tr.id] || (tr.name ?? "Audio Track");
      
      list.push({
        id: tr.id,
        name: finalName,
        type: "audio",
        startTime: finalStart,
        duration: tr.duration || 10,
        trackId: finalTrack,
        isLocked: clipLockedStates[tr.id] || false,
      });
    });
    
    captions.forEach((cap: any) => {
      const finalStart = clipStartOverrides[cap.id] !== undefined ? clipStartOverrides[cap.id] : cap.startTime;
      const finalTrack = clipTrackOverrides[cap.id] || "text-1";
      const finalName = clipNameOverrides[cap.id] || cap.text;
      
      list.push({
        id: cap.id,
        name: finalName,
        type: "text",
        startTime: finalStart,
        duration: (cap.endTime ?? cap.startTime + 2) - cap.startTime,
        trackId: finalTrack,
        isLocked: clipLockedStates[cap.id] || false,
      });
    });
    return list;
  }, [mediaItems, audioTracks, captions, getTrimRangeForItem, clipTrackOverrides, clipStartOverrides, clipNameOverrides, clipLockedStates]);

  // Dynamically spawn tracks as clips are placed on them
  useEffect(() => {
    const requiredTrackIds = new Set<string>();
    clips.forEach(clip => {
      if (clip.trackId) {
        requiredTrackIds.add(clip.trackId);
      }
    });

    const existingTrackIds = new Set(tracks.map(t => t.id));
    const missingTrackIds = [...requiredTrackIds].filter(id => !existingTrackIds.has(id));

    if (missingTrackIds.length > 0) {
      const trackTemplates: Record<string, Omit<Track, 'id'>> = {
        "overlay-1": { name: "Overlay 1",        type: "overlay", isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 56 },
        "text-1":    { name: "Text / Subtitles", type: "text",    isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 48 },
        "effect-1":  { name: "Effects 1",        type: "effect",  isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 48 },
        "video-1":   { name: "Video 1",          type: "video",   isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 80 },
        "video-2":   { name: "Video 2",          type: "video",   isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 80 },
        "audio-1":   { name: "Audio 1",          type: "audio",   isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 60 },
        "audio-2":   { name: "Audio 2",          type: "audio",   isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 60 },
      };

      setTracks(prev => {
        const updated = [...prev];
        missingTrackIds.forEach(id => {
          const template = trackTemplates[id] || { name: `Track ${id}`, type: "overlay", isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 56 };
          updated.push({
            id,
            ...template
          } as Track);
        });
        return updated;
      });
    }
  }, [clips, tracks]);

  /* ── Ruler tick generator ──────────────────────────────────── */
  const rulerTicks = useMemo(() => {
    const step = pixelsPerSecond >= 80 ? 1 : pixelsPerSecond >= 40 ? 2 : pixelsPerSecond >= 15 ? 5 : 10;
    const ticks: number[] = [];
    for (let s = 0; s <= Math.ceil(totalDuration); s += step) ticks.push(s);
    return ticks;
  }, [totalDuration, pixelsPerSecond]);

  /* ── Clip color palette ────────────────────────────────────── */
  const clipColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    video:  { bg: "bg-purple-950/70",     border: "border-purple-500/40",    text: "text-purple-200",    dot: "bg-purple-400"    },
    image:  { bg: "bg-indigo-950/70",  border: "border-indigo-500/40",  text: "text-indigo-200",  dot: "bg-indigo-400"  },
    audio:  { bg: "bg-fuchsia-950/70", border: "border-fuchsia-500/40", text: "text-fuchsia-200", dot: "bg-fuchsia-400" },
    text:   { bg: "bg-sky-950/70",     border: "border-sky-500/40",     text: "text-sky-200",     dot: "bg-sky-400"     },
    effect: { bg: "bg-emerald-950/70", border: "border-emerald-500/40", text: "text-emerald-200", dot: "bg-emerald-400" },
  };

  const clipColorsSelected: Record<string, { bg: string; border: string; ring: string }> = {
    video:  { bg: "bg-purple-900/80",    border: "border-purple-300",      ring: "shadow-[0_0_12px_rgba(168,85,247,0.4)]"  },
    image:  { bg: "bg-indigo-900/80",  border: "border-indigo-300",   ring: "shadow-[0_0_12px_rgba(99,102,241,0.4)]"  },
    audio:  { bg: "bg-fuchsia-900/80", border: "border-fuchsia-300",  ring: "shadow-[0_0_12px_rgba(217,70,239,0.4)]"  },
    text:   { bg: "bg-sky-900/80",     border: "border-sky-300",      ring: "shadow-[0_0_12px_rgba(56,189,248,0.4)]"  },
    effect: { bg: "bg-emerald-900/80", border: "border-emerald-300",  ring: "shadow-[0_0_12px_rgba(52,211,153,0.4)]"  },
  };

  /* ── Virtualization ────────────────────────────────────────── */
  const isClipVisible = useCallback((startTime: number, duration: number) => {
    if (!scrollRef.current) return true;
    const sl = scrollRef.current.scrollLeft;
    const cw = scrollRef.current.clientWidth;
    return (startTime + duration) * pixelsPerSecond >= sl - 400 &&
           startTime * pixelsPerSecond <= sl + cw + 400;
  }, [pixelsPerSecond]);

  /* ── Keep scrollLeft in sync with playback (Fixed Center Playhead) ── */
  useEffect(() => {
    if (!scrollRef.current || isDraggingPlayhead) return;
    const targetScrollLeft = currentTime * pixelsPerSecond;
    scrollRef.current.scrollLeft = targetScrollLeft;
  }, [progress, totalDuration, pixelsPerSecond, isDraggingPlayhead, currentTime]);

  /* ── Sync sidebar vertical scroll ─────────────────────────── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (sidebarTracksRef.current) {
        sidebarTracksRef.current.scrollTop = el.scrollTop;
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Snap ──────────────────────────────────────────────────── */
  const getSnappedTime = useCallback((time: number, duration: number, ignoreId?: string) => {
    if (!isSnapEnabled) return time;
    const thr = 10 / pixelsPerSecond; // Snap threshold in seconds
    const candidates = [0, totalDuration, currentTime];
    markers.forEach(m => candidates.push(m.time));
    clips.forEach(c => {
      if (c.id === ignoreId) return;
      candidates.push(c.startTime, c.startTime + c.duration);
    });
    
    let best = time, minDiff = thr;
    candidates.forEach(v => {
      const d1 = Math.abs(time - v);
      if (d1 < minDiff) { minDiff = d1; best = v; }
      const d2 = Math.abs(time + duration - v);
      if (d2 < minDiff) { minDiff = d2; best = v - duration; }
    });
    return best;
  }, [isSnapEnabled, clips, currentTime, totalDuration, markers, pixelsPerSecond]);

  /* ── Zoom ──────────────────────────────────────────────────── */
  const handleZoom = useCallback((dir: "in" | "out" | number) => {
    setPixelsPerSecond(prev => {
      const next = dir === "in" ? prev * 1.3 : dir === "out" ? prev / 1.3 : (dir as number);
      const clamped = Math.max(6, Math.min(300, next));
      // Re-align scroll position so currentTime stays centered
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = currentTime * clamped;
      }
      return clamped;
    });
  }, [currentTime]);

  const zoomToFit = useCallback(() => {
    if (!scrollRef.current) return;
    const w = scrollRef.current.clientWidth - 40;
    const next = Math.max(6, Math.min(300, w / totalDuration));
    setPixelsPerSecond(next);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = currentTime * next;
    }
  }, [totalDuration, currentTime]);

  /* ── Wheel scroll handling ────────────────────────────────── */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 0.85;
      setPixelsPerSecond(prev => {
        const next = Math.max(6, Math.min(300, prev * factor));
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = currentTime * next;
        }
        return next;
      });
    } else if (e.shiftKey) {
      e.preventDefault();
      if (scrollRef.current) scrollRef.current.scrollLeft += e.deltaY;
    }
  }, [currentTime]);

  /* ── Scrub Playhead Click/Drag ────────────────────────────── */
  const handleRulerMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || !scrollRef.current || !rulerRef.current) return;
    e.preventDefault();
    setIsDraggingPlayhead(true);

    const updatePlayhead = (clientX: number) => {
      if (!rulerRef.current || !scrollRef.current) return;
      const rect = rulerRef.current.getBoundingClientRect();
      const clickOffset = clientX - rect.left;
      const canvasT = Math.max(0, clickOffset / pixelsPerSecond);
      handleTimelineClick(canvasT);
      scrollRef.current.scrollLeft = canvasT * pixelsPerSecond;
    };

    updatePlayhead(e.clientX);

    const onMove = (ev: MouseEvent) => {
      updatePlayhead(ev.clientX);
    };

    const onUp = () => {
      setIsDraggingPlayhead(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [pixelsPerSecond, handleTimelineClick]);

  /* ── Markers ───────────────────────────────────────────────── */
  const handleAddMarker = useCallback(() => {
    setMarkers(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      time: currentTime,
      label: `Marker ${prev.length + 1}`,
      color: "bg-rose-500",
    }]);
  }, [currentTime]);

  /* ── Split Clip ────────────────────────────────────────────── */
  const handleSplitClip = useCallback(() => {
    if (selectedClipIds.length === 0) return;
    selectedClipIds.forEach(id => {
      const clip = clips.find(c => c.id === id);
      if (!clip || clip.isLocked) return;
      if (currentTime > clip.startTime && currentTime < clip.startTime + clip.duration) {
        const offset = currentTime - clip.startTime;
        
        // Handle splitting
        if (clip.type === "video" || clip.type === "image") {
          setMediaItems((prev: any) => {
            const idx = prev.findIndex((p: any) => p.id === id);
            if (idx === -1) return prev;
            const orig = prev[idx];
            const t = getTrimRangeForItem ? getTrimRangeForItem(orig.id, orig.duration) : { start: 0, end: orig.duration };
            
            const leftId = Math.random().toString(36).slice(2);
            const rightId = Math.random().toString(36).slice(2);
            
            const leftClip = { ...orig, id: leftId };
            const rightClip = { ...orig, id: rightId };
            
            // Adjust start time overrides
            setClipStartOverrides(prevStarts => ({
              ...prevStarts,
              [leftId]: clip.startTime,
              [rightId]: currentTime,
            }));
            
            // Keep tracks matched
            setClipTrackOverrides(prevTracks => ({
              ...prevTracks,
              [leftId]: clip.trackId,
              [rightId]: clip.trackId,
            }));

            setClipTrimRanges((pt: any) => ({
              ...pt,
              [leftId]: { start: t.start, end: t.start + offset },
              [rightId]: { start: t.start + offset, end: t.end },
            }));

            const next = [...prev];
            next.splice(idx, 1, leftClip, rightClip);
            saveToUndo(next);
            return next;
          });
        }
      }
    });
  }, [selectedClipIds, clips, currentTime, getTrimRangeForItem, setMediaItems, setClipTrimRanges, saveToUndo]);

  /* ── Clip Dragging Interactions ────────────────────────────── */
  const handleClipMouseDown = useCallback((e: React.MouseEvent, clip: Clip) => {
    if (clip.isLocked || e.button !== 0) return;
    
    // Ignore trigger clicks on trim handles
    const target = e.target as HTMLElement;
    if (target.closest(".trim-handle")) return;

    e.stopPropagation();
    e.preventDefault();
    setContextMenu(null);

    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      setSelectedClipIds(prev =>
        prev.includes(clip.id) ? prev.filter(id => id !== clip.id) : [...prev, clip.id]
      );
    } else if (!selectedClipIds.includes(clip.id)) {
      setSelectedClipIds([clip.id]);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const startOffsetX = e.clientX - rect.left;
    const startY = e.clientY;
    
    setDraggedClip({
      id: clip.id,
      offsetX: startOffsetX,
      initialStartTime: clip.startTime,
      initialTrackId: clip.trackId,
      ghostStartTime: clip.startTime,
      ghostTrackId: clip.trackId,
      type: clip.type
    });

    const onMove = (ev: MouseEvent) => {
      const crec = canvasRef.current?.getBoundingClientRect();
      if (!crec) return;

      const relativeX = ev.clientX - crec.left + (scrollRef.current?.scrollLeft || 0) - startOffsetX - paddingLeft;
      const targetTime = Math.max(0, relativeX / pixelsPerSecond);
      const snapped = getSnappedTime(targetTime, clip.duration, clip.id);
      
      setSnapGuideX(snapped !== targetTime ? paddingLeft + snapped * pixelsPerSecond : null);
      
      // Determine vertical track hover
      let finalTrackId = clip.trackId;
      if (sidebarTracksRef.current) {
        const sidebarRect = sidebarTracksRef.current.getBoundingClientRect();
        const absoluteMouseY = ev.clientY - sidebarRect.top + sidebarTracksRef.current.scrollTop;
        
        let accumulatedHeight = 32; // Skip timeline ruler
        for (const track of tracks) {
          const trackH = track.isCollapsed ? 28 : track.height;
          if (absoluteMouseY >= accumulatedHeight && absoluteMouseY <= accumulatedHeight + trackH) {
            // Check compatibility
            if ((clip.type === "audio" && track.type === "audio") || (clip.type !== "audio" && track.type !== "audio")) {
              finalTrackId = track.id;
            }
            break;
          }
          accumulatedHeight += trackH;
        }
      }

      setDraggedClip(prev => prev ? {
        ...prev,
        ghostStartTime: snapped,
        ghostTrackId: finalTrackId
      } : null);
    };

    const onUp = () => {
      setSnapGuideX(null);
      setDraggedClip(prev => {
        if (prev) {
          // Commit position
          setClipStartOverrides(starts => ({ ...starts, [clip.id]: prev.ghostStartTime }));
          setClipTrackOverrides(tracks => ({ ...tracks, [clip.id]: prev.ghostTrackId }));
          
          // Magnet alignment ripple editing
          if (isMagnetEnabled) {
            setTimeout(() => triggerMagnetRipple(prev.ghostTrackId), 10);
          }
        }
        return null;
      });
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [clips, selectedClipIds, pixelsPerSecond, getSnappedTime, tracks, paddingLeft, isMagnetEnabled]);

  /* ── Magnetic Alignment (Ripple editing) ──────────────────── */
  const triggerMagnetRipple = useCallback((trackId: string) => {
    setClipStartOverrides(prev => {
      const trackClips = clips.filter(c => (clipTrackOverrides[c.id] || c.trackId) === trackId && c.id);
      if (trackClips.length === 0) return prev;
      
      const sorted = [...trackClips].sort((a, b) => a.startTime - b.startTime);
      const nextStarts = { ...prev };
      let nextStart = 0;
      
      sorted.forEach(c => {
        nextStarts[c.id] = nextStart;
        nextStart += c.duration;
      });
      
      return nextStarts;
    });
  }, [clips, clipTrackOverrides]);

  /* ── Trim Edge Handles ─────────────────────────────────────── */
  const handleTrimMouseDown = useCallback((e: React.MouseEvent, clipId: string, edge: "left" | "right", itemDuration: number) => {
    e.stopPropagation();
    e.preventDefault();
    const initTrim = getTrimRangeForItem(clipId, itemDuration);
    const startX = e.clientX;

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dt = dx / pixelsPerSecond;
      
      if (edge === "left") {
        const v = Math.max(0, Math.min(initTrim.end - 0.2, initTrim.start + dt));
        setClipTrimRanges((prev: any) => ({ ...prev, [clipId]: { start: v, end: initTrim.end } }));
      } else {
        const v = Math.max(initTrim.start + 0.2, Math.min(itemDuration, initTrim.end + dt));
        setClipTrimRanges((prev: any) => ({ ...prev, [clipId]: { start: initTrim.start, end: v } }));
      }
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [pixelsPerSecond, getTrimRangeForItem, setClipTrimRanges]);

  /* ── Canvas Box Selection ──────────────────────────────────── */
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement) !== canvasRef.current) return;
    e.preventDefault();
    setContextMenu(null);
    setTrackContextMenu(null);
    
    const crec = canvasRef.current!.getBoundingClientRect();
    const sl   = scrollRef.current?.scrollLeft || 0;
    const st   = scrollRef.current?.scrollTop  || 0;
    const sx   = e.clientX - crec.left + sl;
    const sy   = e.clientY - crec.top  + st;
    
    setBoxSelectStart({ x: sx, y: sy });
    setBoxSelectCurrent({ x: sx, y: sy });

    const onMove = (ev: MouseEvent) => {
      const cx = ev.clientX - crec.left + (scrollRef.current?.scrollLeft || 0);
      const cy = ev.clientY - crec.top  + (scrollRef.current?.scrollTop  || 0);
      setBoxSelectCurrent({ x: cx, y: cy });
      
      const x1 = Math.min(sx, cx), x2 = Math.max(sx, cx);
      const y1 = Math.min(sy, cy), y2 = Math.max(sy, cy);
      const inBox: string[] = [];
      
      let offsetY = 32; // Time ruler height
      tracks.forEach(track => {
        const h = track.isCollapsed ? 28 : track.height;
        const ty1 = offsetY, ty2 = offsetY + h;
        clips.filter(c => c.trackId === track.id).forEach(c => {
          const cl = paddingLeft + c.startTime * pixelsPerSecond;
          const cr = cl + c.duration * pixelsPerSecond;
          if (cl < x2 && cr > x1 && ty1 < y2 && ty2 > y1) inBox.push(c.id);
        });
        offsetY += h;
      });
      setSelectedClipIds(inBox);
    };
    
    const onUp = () => {
      setBoxSelectStart(null);
      setBoxSelectCurrent(null);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [clips, tracks, pixelsPerSecond, paddingLeft]);

  /* ── Track settings right-click menu ───────────────────────── */
  const handleTrackContextMenu = useCallback((e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(null);
    setTrackContextMenu({ x: e.clientX, y: e.clientY, trackId });
  }, []);

  /* ── Clip right-click context menu ─────────────────────────── */
  const handleClipContextMenu = useCallback((e: React.MouseEvent, clipId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setTrackContextMenu(null);
    setSelectedClipIds([clipId]);
    setContextMenu({ x: e.clientX, y: e.clientY, clipId });
  }, []);

  const handleDropAsset = useCallback((assetId: string, trackId: string, dropTime: number) => {
    const newClipId = `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setClipTrackOverrides(prev => ({ ...prev, [newClipId]: trackId }));
    setClipStartOverrides(prev => ({ ...prev, [newClipId]: dropTime }));
    if (handleAddAssetToTimeline) {
      handleAddAssetToTimeline(assetId, newClipId);
    }
  }, [handleAddAssetToTimeline]);

  /* ── Track helpers ─────────────────────────────────────────── */
  const toggleLock     = useCallback((id: string) => setTracks(p => p.map(t => t.id === id ? { ...t, isLocked:   !t.isLocked   } : t)), []);
  const toggleHide     = useCallback((id: string) => setTracks(p => p.map(t => t.id === id ? { ...t, isHidden:   !t.isHidden   } : t)), []);
  const toggleMute     = useCallback((id: string) => setTracks(p => p.map(t => t.id === id ? { ...t, isMuted:    !t.isMuted    } : t)), []);
  const toggleCollapse = useCallback((id: string) => setTracks(p => p.map(t => t.id === id ? { ...t, isCollapsed:!t.isCollapsed} : t)), []);

  const handleAddTrack = useCallback(() => {
    setTracks(prev => {
      const idx = prev.findIndex(t => t.type === "audio");
      const upd = [...prev];
      const newTrackId = `overlay-${Math.random().toString(36).slice(2)}`;
      upd.splice(idx === -1 ? prev.length : idx, 0, {
        id: newTrackId,
        name: `Overlay ${prev.filter(t => t.type === "overlay").length + 1}`,
        type: "overlay", isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 56,
      });
      return upd;
    });
  }, []);

  const handleDeleteTrack = useCallback((trackId: string) => {
    setTracks(p => p.filter(t => t.id !== trackId));
    // Re-assign track items
    setClipTrackOverrides(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        if (updated[k] === trackId) delete updated[k];
      });
      return updated;
    });
  }, []);

  /* ── Clipboard operations ──────────────────────────────────── */
  const handleCopy = useCallback(() => {
    setClipboard(clips.filter(c => selectedClipIds.includes(c.id)));
  }, [clips, selectedClipIds]);

  const handlePaste = useCallback(() => {
    if (!clipboard.length) return;
    const t = currentTime;
    clipboard.forEach(c => {
      const newId = Math.random().toString(36).slice(2);
      setClipStartOverrides(prev => ({ ...prev, [newId]: t }));
      setClipTrackOverrides(prev => ({ ...prev, [newId]: c.trackId }));
      setClipNameOverrides(prev => ({ ...prev, [newId]: `${c.name} (Copy)` }));
      
      if (c.type === "video" || c.type === "image") {
        setMediaItems((prev: any) => [...prev, { ...c, id: newId }]);
      }
    });
  }, [clipboard, currentTime, setMediaItems]);

  const handleDuplicate = useCallback((clipId: string) => {
    const c = clips.find(x => x.id === clipId);
    if (!c) return;
    const newId = Math.random().toString(36).slice(2);
    setClipStartOverrides(prev => ({ ...prev, [newId]: c.startTime + c.duration }));
    setClipTrackOverrides(prev => ({ ...prev, [newId]: c.trackId }));
    
    if (c.type === "video" || c.type === "image") {
      setMediaItems((prev: any) => [...prev, { ...c, id: newId }]);
    }
  }, [clips, setMediaItems]);

  /* ── Keyboard shortcuts ────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      
      if (e.code === "Space") {
        e.preventDefault();
        (document.querySelector("[title=\"Play/Pause\"]") as HTMLButtonElement | null)?.click();
      }
      if (e.code === "Delete" || e.code === "Backspace") {
        selectedClipIds.forEach(id => handleDeleteClip(id));
        setSelectedClipIds([]);
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyC") {
        handleCopy();
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyV") {
        handlePaste();
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyD") {
        e.preventDefault();
        if (selectedClipIds.length > 0) {
          handleDuplicate(selectedClipIds[0]);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyB") {
        e.preventDefault();
        handleSplitClip();
      }
      if (e.code === "KeyM" && !e.ctrlKey) {
        e.preventDefault();
        handleAddMarker();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedClipIds, clipboard, handleCopy, handlePaste, handleDuplicate, handleSplitClip, handleAddMarker, handleDeleteClip]);

  const trackAccent: Record<string, string> = {
    video:   "bg-purple-500",
    audio:   "bg-fuchsia-500",
    text:    "bg-sky-500",
    effect:  "bg-emerald-500",
    overlay: "bg-amber-500",
  };

  const SIDEBAR_W = 200;

  return (
    <div
      className="flex flex-col h-full select-none overflow-hidden bg-[#07080f] relative font-sans text-slate-200 border border-white/5 rounded-2xl shadow-2xl"
      onClick={() => {
        setContextMenu(null);
        setTrackContextMenu(null);
      }}
    >
      {/* ═══════════════════ TOOLBAR ═══════════════════ */}
      <div className="h-12 flex-none border-b border-white/5 bg-[#0b0c15] px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-1">
          <TBtn icon={Plus} label="Add Track" onClick={handleAddTrack} text="Add Track" />
          <Divider />
          <TBtn icon={Scissors} label="Split (Ctrl+B)" onClick={handleSplitClip} disabled={selectedClipIds.length === 0} />
          <TBtn icon={Trash2} label="Delete (Del)" danger onClick={() => { selectedClipIds.forEach(id => handleDeleteClip(id)); setSelectedClipIds([]); }} disabled={selectedClipIds.length === 0} />
          <Divider />
          <TBtn icon={Copy} label="Copy (Ctrl+C)" onClick={handleCopy} disabled={selectedClipIds.length === 0} />
          <TBtn icon={Clipboard} label="Paste (Ctrl+V)" onClick={handlePaste} disabled={clipboard.length === 0} />
          <Divider />
          <TBtn icon={Magnet} label="Snap to Grid" active={isSnapEnabled} onClick={() => setIsSnapEnabled(p => !p)} />
          <TBtn icon={Layers} label="Ripple Editing" active={isRippleEnabled} onClick={() => setIsRippleEnabled(p => !p)} />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 gap-1.5 font-mono text-xs text-purple-300 shadow-inner">
            <span className="text-slate-500 font-bold">POS</span>
            <span className="tabular-nums font-semibold">{fmtTime(currentTime)}</span>
          </div>
          <Divider />
          {/* Global Track Size Adjustment Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Track Size</span>
            <input
              type="range"
              min="48"
              max="160"
              value={tracks[3]?.height || 80}
              onChange={e => {
                const val = Number(e.target.value);
                setTracks(prev => prev.map(t => {
                  // Collapse tracks stay small, other tracks scale proportionally
                  if (t.isCollapsed) return t;
                  if (t.type === "video" || t.type === "overlay") {
                    return { ...t, height: val };
                  }
                  return { ...t, height: Math.max(36, Math.floor(val * 0.75)) };
                }));
              }}
              className="w-16 accent-purple-500 h-1 rounded-full cursor-pointer bg-white/10"
              title="Resize All Tracks"
            />
          </div>
          <Divider />
          <div className="flex items-center gap-1.5">
            <button onClick={() => handleZoom("out")} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range" min="6" max="300" value={pixelsPerSecond}
              onChange={e => setPixelsPerSecond(Number(e.target.value))}
              className="w-24 accent-purple-500 h-1 rounded-full cursor-pointer bg-white/10"
            />
            <button onClick={() => handleZoom("in")} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={zoomToFit} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-colors">Fit</button>
          </div>
        </div>
      </div>

      {/* ═══════════════════ MAIN TIMELINE AREA ═══════════════════ */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">

        {/* ────────── SIDEBAR (Track Controls) ────────── */}
        <div
          ref={sidebarTracksRef}
          className="flex-none flex flex-col border-r border-white/5 bg-[#080911] z-20 shrink-0 overflow-y-hidden"
          style={{ width: SIDEBAR_W }}
        >
          {/* Ruler header gap spacer */}
          <div className="h-8 shrink-0 border-b border-white/5 flex items-center justify-between px-3 bg-[#0b0c15]">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Tracks</span>
          </div>

          {/* Track Headers - scrollable wrapper */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            {tracks.map((track, idx) => {
              const h = track.isCollapsed ? 28 : track.height;
              const isEditing = editingTrackId === track.id;
              
              return (
                <div
                  key={track.id}
                  onContextMenu={(e) => handleTrackContextMenu(e, track.id)}
                  className="relative flex items-center px-3 border-b border-white/5 bg-[#080911] hover:bg-white/[0.02] transition-colors group shrink-0"
                  style={{ height: h }}
                >
                  {/* Accent Strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-[4px] rounded-r-md ${trackAccent[track.type]} opacity-60`} />
                  
                  {/* Name or Edit Input and Actions Row (inspired by image layout) */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 py-1">
                    <div className="flex items-center gap-1.5 w-full">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingTrackName}
                          onChange={e => setEditingTrackName(e.target.value)}
                          onBlur={() => {
                            setTracks(prev => prev.map(t => t.id === track.id ? { ...t, name: editingTrackName } : t));
                            setEditingTrackId(null);
                          }}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              setTracks(prev => prev.map(t => t.id === track.id ? { ...t, name: editingTrackName } : t));
                              setEditingTrackId(null);
                            }
                          }}
                          className="bg-black/60 border border-purple-500/50 rounded px-1.5 py-0.5 text-xs text-white w-full focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span
                          onDoubleClick={() => {
                            setEditingTrackId(track.id);
                            setEditingTrackName(track.name);
                          }}
                          className="text-[11px] font-bold text-slate-300 truncate cursor-pointer hover:text-white"
                        >
                          {track.name}
                        </span>
                      )}
                    </div>

                    {!track.isCollapsed && h >= 48 && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <TrackBtn onClick={(e) => { e.stopPropagation(); toggleLock(track.id); }} title={track.isLocked ? "Unlock Track" : "Lock Track"} active={track.isLocked} danger={track.isLocked}>
                          {track.isLocked ? <Lock className="w-3 h-3 text-rose-400" /> : <Unlock className="w-3 h-3" />}
                        </TrackBtn>
                        <TrackBtn onClick={(e) => { e.stopPropagation(); toggleMute(track.id); }} title={track.isMuted ? "Unmute Audio" : "Mute Audio"} active={track.isMuted} danger={track.isMuted}>
                          {track.isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3" />}
                        </TrackBtn>
                        {/* Audio track sync / mic voice link */}
                        <TrackBtn onClick={(e) => { e.stopPropagation(); }} title="Voice Link Indicator" active={track.type === "video" || track.type === "audio"}>
                          <Activity className={`w-3 h-3 ${track.type === "video" || track.type === "audio" ? "text-purple-400" : "text-slate-600"}`} />
                        </TrackBtn>
                        <TrackBtn onClick={(e) => { e.stopPropagation(); toggleHide(track.id); }} title={track.isHidden ? "Show Track" : "Hide Track"} active={track.isHidden}>
                          {track.isHidden ? <EyeOff className="w-3 h-3 text-rose-400" /> : <Eye className="w-3 h-3" />}
                        </TrackBtn>
                      </div>
                    )}
                  </div>

                  {/* Thicker drag height resize handle with visual grab indicator */}
                  {!track.isCollapsed && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-2 cursor-row-resize z-30 hover:bg-purple-500/60 transition-colors flex items-center justify-center"
                      style={{ transform: "translateY(50%)" }}
                      onMouseDown={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        const startY = e.clientY;
                        const startH = track.height;
                        const onMove = (ev: MouseEvent) => {
                          setTracks(prev => prev.map(t => t.id === track.id ? { ...t, height: Math.max(48, Math.min(220, startH + (ev.clientY - startY))) } : t));
                        };
                        const onUp = () => {
                          window.removeEventListener("mousemove", onMove);
                          window.removeEventListener("mouseup", onUp);
                        };
                        window.addEventListener("mousemove", onMove);
                        window.addEventListener("mouseup", onUp);
                      }}
                    >
                      <div className="w-8 h-0.5 bg-white/30 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ────────── SCROLLABLE TIMELINE TRACKS AREA ────────── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto overflow-y-auto bg-[#07080f] min-w-0 relative"
          style={{ scrollbarColor: "#1d1e2c transparent", scrollbarWidth: "thin" }}
          onWheel={handleWheel}
        >
          {/* Canvas Wrapper */}
          <div
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            style={{
              width: `${canvasWidth + viewportWidth}px`,
              position: "relative",
              minHeight: "100%",
            }}
          >
            {/* Pad the timeline start by viewportWidth / 2 so playhead can be centered at t=0 */}
            <div style={{ marginLeft: `${paddingLeft}px`, width: `${canvasWidth}px`, position: "relative", height: "100%" }}>
              
              {/* ─── TIME RULER ─── */}
              <div
                ref={rulerRef}
                onMouseDown={handleRulerMouseDown}
                className="h-8 bg-[#0b0c15] border-b border-white/5 sticky top-0 z-20 cursor-ew-resize overflow-hidden flex items-end select-none"
                style={{ width: canvasWidth }}
              >
                {rulerTicks.map(sec => {
                  const isMajor = sec % 5 === 0;
                  return (
                    <div key={sec} className="absolute bottom-0 pointer-events-none" style={{ left: sec * pixelsPerSecond }}>
                      <div className={`w-px ${isMajor ? "h-3.5 bg-white/20" : "h-1.5 bg-white/10"}`} />
                      {isMajor && (
                        <span className="absolute bottom-4 text-[9px] font-mono font-medium text-slate-500 -translate-x-1/2 whitespace-nowrap">
                          {String(Math.floor(sec / 60)).padStart(2, "0")}:{String(sec % 60).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Markers */}
                {markers.map(m => (
                  <div
                    key={m.id}
                    className="absolute bottom-0 cursor-pointer z-10 group"
                    style={{ left: m.time * pixelsPerSecond }}
                    onClick={e => { e.stopPropagation(); handleTimelineClick(m.time); }}
                  >
                    <div className="w-3 h-3 bg-rose-500 rotate-45 border border-rose-300 shadow-md shadow-rose-500/20 -translate-x-1/2 translate-y-1.5" />
                    <div className="absolute bottom-0 left-0 w-px h-8 bg-rose-500/40 -translate-x-[0.5px] pointer-events-none" />
                  </div>
                ))}
              </div>

              {/* ─── SNAP GUIDE LINES ─── */}
              {snapGuideX !== null && (
                <div
                  className="absolute top-8 bottom-0 w-px z-30 pointer-events-none"
                  style={{ left: snapGuideX - paddingLeft, background: "rgba(234,179,8,0.8)", boxShadow: "0 0 8px rgba(234,179,8,0.6)" }}
                />
              )}

              {/* ─── TRACK LATEST LANES ─── */}
              <div className="flex flex-col">
                {tracks.map((track, trackIdx) => {
                  const trackH = track.isCollapsed ? 28 : track.height;
                  const trackClips = clips.filter(c => c.trackId === track.id);
                  const isEven = trackIdx % 2 === 0;

                  return (
                    <div
                      key={track.id}
                      className={`relative border-b border-white/5 shrink-0 transition-all duration-200 ${
                        track.isHidden ? "opacity-20 pointer-events-none" : ""
                      } ${isEven ? "bg-white/[0.01]" : "bg-transparent"}`}
                      style={{ height: trackH }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "copy";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const assetId = e.dataTransfer.getData("clipId");
                        if (!assetId) return;

                        const rect = e.currentTarget.getBoundingClientRect();
                        const dropX = e.clientX - rect.left;
                        const dropTime = Math.max(0, dropX / pixelsPerSecond);

                        handleDropAsset(assetId, track.id, dropTime);
                      }}
                    >
                      {/* Grid lines */}
                      {rulerTicks.filter(s => s % 5 === 0).map(s => (
                        <div key={`grid-${s}`} className="absolute top-0 bottom-0 w-px bg-white/[0.02] pointer-events-none" style={{ left: s * pixelsPerSecond }} />
                      ))}

                      {/* ─── CLIPS ─── */}
                      {trackClips.map(clip => {
                        if (!isClipVisible(clip.startTime, clip.duration)) return null;
                        const isSelected = selectedClipIds.includes(clip.id);
                        const isDragging = draggedClip?.id === clip.id;
                        const trim = getTrimRangeForItem ? getTrimRangeForItem(clip.id, clip.duration) : { start: 0, end: clip.duration };
                        const effDur = clip.type === "video" ? trim.end - trim.start : clip.duration;
                        const widthPx = Math.max(6, effDur * pixelsPerSecond);
                        const leftPx = clip.startTime * pixelsPerSecond;
                        const col = isSelected ? clipColorsSelected[clip.type] ?? clipColorsSelected.video : clipColors[clip.type] ?? clipColors.video;
                        const clipH = trackH - 12;

                        // ── Dynamic Thumbnails (Filmstrip Density) ──
                        const thumbDensity = pixelsPerSecond < 15 ? 120 : pixelsPerSecond < 60 ? 70 : 40;
                        const numFrames = Math.max(1, Math.ceil(widthPx / thumbDensity));
                        const frameW = widthPx / numFrames;

                        // ── Waveform Scaling (Waveform Density) ──
                        const waveDensity = pixelsPerSecond < 15 ? 12 : pixelsPerSecond < 60 ? 5 : 2;

                        const trackOfClip = tracks.find(t => t.id === clip.trackId);
                        const isClipMuted = trackOfClip?.isMuted || false;

                        return (
                          <div
                            key={clip.id}
                            onMouseDown={e => handleClipMouseDown(e, clip)}
                            onDoubleClick={() => setShowPropertiesId(clip.id)}
                            onContextMenu={e => handleClipContextMenu(e, clip.id)}
                            onMouseEnter={() => setHoveredClipId(clip.id)}
                            onMouseLeave={() => setHoveredClipId(null)}
                            className={`absolute rounded-xl border cursor-pointer select-none overflow-hidden group shadow-lg ${col.bg}
                              ${isSelected ? "border-white border-2 shadow-[0_0_15px_rgba(255,255,255,0.3)] z-30" : col.border}
                              ${isDragging ? "opacity-50 scale-95 shadow-2xl" : "hover:border-purple-500/60"}
                              ${clip.isLocked ? "cursor-not-allowed" : ""}
                              transition-all duration-150`}
                            style={{
                              left: leftPx,
                              width: widthPx,
                              top: 6,
                              height: clipH,
                            }}
                          >
                             {/* ── VIDEO Clip Layout (Header + Filmstrip + Waveform) ── */}
                             {clip.type === "video" && (
                               <div className="absolute inset-0 flex flex-col bg-[#140a24] rounded-xl overflow-hidden">
                                 {/* Clip Header (Top Strip) */}
                                 <div className="h-[22px] bg-[#6d28d9] flex items-center justify-between px-2 shrink-0 z-20 select-none">
                                   <div className="flex items-center gap-1.5 min-w-0">
                                     <span className="text-[10px] shrink-0">🎬</span>
                                     <span className="text-[10px] font-bold text-white truncate max-w-[150px] md:max-w-[280px]">
                                       {clip.name}
                                     </span>
                                   </div>
                                   
                                   {/* Status Badges */}
                                   <div className="flex items-center gap-1.5 shrink-0">
                                     {isClipMuted && <span className="text-[8px] font-bold text-rose-300">🔇</span>}
                                     {clip.isLocked && <span className="text-[8px] font-bold text-amber-300">🔒</span>}
                                     {(clipSpeeds[clip.id] || clipReverses[clip.id]) && <span className="text-[8px] font-bold text-blue-300">✨ FX</span>}
                                     <span className="text-[8px] font-bold text-purple-200 bg-[#3b0764] px-1 rounded">⚡ Proxy</span>
                                     <span className="text-[8px] font-mono font-medium text-purple-200 bg-[#3b0764] px-1 rounded">
                                       {effDur.toFixed(1)}s
                                     </span>
                                   </div>
                                 </div>
                                 
                                 {/* Filmstrip (Video Thumbnails) */}
                                 <div className="flex-1 flex overflow-hidden relative opacity-95">
                                   {Array.from({ length: numFrames }).map((_, fi) => {
                                      const frameTime = Math.min(trim.end, Math.max(trim.start, trim.start + fi * (effDur / numFrames)));
                                      return (
                                        <div
                                          key={fi}
                                          className="shrink-0 relative overflow-hidden"
                                          style={{ width: frameW, height: clipH - 35 }}
                                        >
                                          {clip.preview ? (
                                            <video
                                              src={`${clip.preview}#t=${frameTime}`}
                                              muted
                                              preload="metadata"
                                              onLoadedMetadata={(e) => {
                                                e.currentTarget.currentTime = frameTime;
                                              }}
                                              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                            />
                                          ) : (
                                            <div
                                              className="absolute inset-0"
                                              style={{
                                                background: `linear-gradient(135deg, hsl(${(fi * 33) % 360}, 45%, 15%) 0%, hsl(${(fi * 33 + 45) % 360}, 45%, 10%) 100%)`
                                              }}
                                            />
                                          )}
                                          {fi > 0 && <div className="absolute inset-y-0 left-0 w-px bg-white/10 pointer-events-none" />}
                                        </div>
                                      );
                                    })}
                                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                                 </div>

                                 {/* Divider Line */}
                                 <div className="h-px bg-[#6d28d9]/60 shrink-0 z-20" />

                                 {/* Audio Waveform representing audio track of video */}
                                 <div className="h-[12px] bg-[#0f0820] relative overflow-hidden shrink-0 z-20 flex items-center">
                                   <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-85">
                                     <path
                                       d={generateWaveformPath(widthPx, 12, clip.id, waveDensity)}
                                       stroke={isClipMuted ? "#64748b" : "#a855f7"}
                                       strokeWidth="1.2"
                                       fill="none"
                                     />
                                   </svg>
                                 </div>
                               </div>
                             )}

                             {/* ── AUDIO Track Layout ── */}
                             {clip.type === "audio" && (
                               <div className="absolute inset-0 flex flex-col bg-fuchsia-950/40 rounded-xl overflow-hidden">
                                 {/* Header */}
                                 <div className="h-[22px] bg-fuchsia-900/60 flex items-center justify-between px-2 shrink-0 z-20">
                                   <div className="flex items-center gap-1.5 min-w-0">
                                     <span className="text-[10px]">🎵</span>
                                     <span className="text-[10px] font-bold text-white truncate">
                                       {clip.name}
                                     </span>
                                   </div>
                                   <div className="flex items-center gap-1 shrink-0">
                                     {isClipMuted && <span className="text-[8px]">🔇</span>}
                                     <span className="text-[8px] font-mono text-fuchsia-200">
                                       {effDur.toFixed(1)}s
                                     </span>
                                   </div>
                                 </div>
                                 {/* Waveform */}
                                 <div className="flex-1 relative overflow-hidden flex items-center">
                                   <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-70">
                                     <path
                                       d={generateWaveformPath(widthPx, clipH - 22, clip.id, waveDensity)}
                                       stroke={isClipMuted ? "#64748b" : "rgba(244, 63, 94, 0.7)"}
                                       strokeWidth="1.5"
                                       fill="none"
                                     />
                                   </svg>
                                 </div>
                               </div>
                             )}

                             {/* ── OTHER TYPES (Image/Text/Effects) ── */}
                             {clip.type !== "video" && clip.type !== "audio" && (
                               <>
                                 <div className="absolute top-1.5 left-2.5 right-2 flex items-center justify-between z-20 pointer-events-none">
                                   <span className="text-[10px] font-bold truncate text-white drop-shadow-md">
                                     {clip.type === "image" ? "🖼️ " : clip.type === "text" ? "💬 " : "✨ "}
                                     {clip.name}
                                   </span>
                                   <span className="text-[8px] font-mono font-medium text-slate-400 bg-black/40 rounded px-1 flex-none ml-1 drop-shadow-md">
                                     {effDur.toFixed(1)}s
                                   </span>
                                 </div>
                               </>
                             )}

                             {/* Fallback indicators if needed */}
                             {clip.type !== "video" && clip.type !== "audio" && (
                               <div className="absolute bottom-1.5 left-2.5 flex items-center gap-1 z-20 pointer-events-none">
                                 {clip.isLocked && <Lock className="w-2.5 h-2.5 text-amber-400 drop-shadow" />}
                                 {clipSpeeds[clip.id] && <Sliders className="w-2.5 h-2.5 text-blue-400 drop-shadow" />}
                                 {clipReverses[clip.id] && <RefreshCw className="w-2.5 h-2.5 text-rose-400 drop-shadow" />}
                               </div>
                             )}

                            {/* Trim Resize Handles */}
                            {isSelected && !clip.isLocked && (
                              <>
                                <div
                                  onMouseDown={e => handleTrimMouseDown(e, clip.id, "left", clip.duration)}
                                  className="trim-handle absolute left-0 top-0 bottom-0 w-2 bg-purple-500 cursor-ew-resize z-30 flex items-center justify-center hover:bg-purple-400 transition-colors"
                                  title="Trim Left"
                                >
                                  <div className="w-0.5 h-3 bg-white/80 rounded" />
                                </div>
                                <div
                                  onMouseDown={e => handleTrimMouseDown(e, clip.id, "right", clip.duration)}
                                  className="trim-handle absolute right-0 top-0 bottom-0 w-2 bg-purple-500 cursor-ew-resize z-30 flex items-center justify-center hover:bg-purple-400 transition-colors"
                                  title="Trim Right"
                                >
                                  <div className="w-0.5 h-3 bg-white/80 rounded" />
                                </div>
                              </>
                            )}

                            {/* Hover info tooltip card */}
                            {hoveredClipId === clip.id && (
                              <div className="absolute bottom-7 left-2.5 bg-[#0b0c15]/95 border border-white/10 rounded-lg p-2 z-40 text-[9px] shadow-2xl pointer-events-none min-w-[120px] backdrop-blur-md">
                                <p className="font-bold text-white truncate">{clip.name}</p>
                                <p className="text-slate-400 font-mono">Duration: {effDur.toFixed(2)}s</p>
                                <p className="text-slate-500 font-mono capitalize">Type: {clip.type}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Ghost preview while dragging */}
                      {draggedClip && draggedClip.ghostTrackId === track.id && (
                        <div
                          className="absolute rounded-xl border border-dashed border-purple-500/60 bg-purple-500/10 pointer-events-none z-10"
                          style={{
                            left: draggedClip.ghostStartTime * pixelsPerSecond,
                            width: (clips.find(c => c.id === draggedClip.id)?.duration ?? 0) * pixelsPerSecond,
                            top: 6,
                            height: trackH - 12
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ FIXED CENTER PLAYHEAD ═══════════════════ */}
      <div
        className="absolute top-12 bottom-7 pointer-events-none z-30"
        style={{
          left: `${SIDEBAR_W + viewportWidth / 2}px`,
          transform: "translateX(-50%)",
        }}
      >
        <div className="w-3.5 h-3.5 bg-purple-600 rotate-45 border border-purple-300 shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
        <div className="absolute top-3.5 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-purple-600 shadow-[0_0_4px_rgba(124,58,237,0.5)]" />
      </div>

      {/* ═══════════════════ FOOTER STATS ═══════════════════ */}
      <div className="h-8 shrink-0 border-t border-white/5 bg-[#0b0c15] px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FooterChip label="Time" value={fmtTime(currentTime)} />
          <FooterChip label="Total Duration" value={fmtTime(totalDuration)} />
          <FooterChip label="Format" value="30 FPS" />
        </div>
        <div className="flex items-center gap-3">
          <FooterToggle label="Snap" active={isSnapEnabled} onClick={() => setIsSnapEnabled(p => !p)} />
          <FooterToggle label="Magnet" active={isMagnetEnabled} onClick={() => setIsMagnetEnabled(p => !p)} />
          <FooterToggle label="Ripple" active={isRippleEnabled} onClick={() => setIsRippleEnabled(p => !p)} />
          <span className="text-[10px] font-mono text-slate-500">
            Zoom: {Math.round((pixelsPerSecond / 120) * 100)}%
          </span>
        </div>
      </div>

      {/* ═══════════════════ CLIP CONTEXT MENU ═══════════════════ */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              style={{ top: contextMenu.y, left: contextMenu.x }}
              className="fixed z-50 w-48 bg-[#0b0c15] border border-white/10 rounded-xl shadow-2xl py-1 overflow-hidden"
            >
              <button
                onClick={() => {
                  setEditingClipId(contextMenu.clipId);
                  const c = clips.find(x => x.id === contextMenu.clipId);
                  setEditingClipName(c?.name || "");
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-slate-500" />
                Rename Clip
              </button>
              <button
                onClick={() => {
                  const c = clips.find(x => x.id === contextMenu.clipId);
                  if (c) {
                    setClipLockedStates(prev => ({ ...prev, [c.id]: !prev[c.id] }));
                  }
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                Lock / Unlock
              </button>
              <button
                onClick={() => {
                  setSpeedInputValue("1.0");
                  setShowSpeedDialog(contextMenu.clipId);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                Clip Speed
              </button>
              <button
                onClick={() => {
                  const c = clips.find(x => x.id === contextMenu.clipId);
                  if (c) {
                    setClipReverses(prev => ({ ...prev, [c.id]: !prev[c.id] }));
                  }
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                Reverse Playback
              </button>
              
              <div className="h-px bg-white/5 my-1" />

              <button
                onClick={() => { handleCopy(); setContextMenu(null); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                Copy
              </button>
              <button
                onClick={() => { handleDuplicate(contextMenu.clipId); setContextMenu(null); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Duplicate
              </button>
              <button
                onClick={() => { handleSplitClip(); setContextMenu(null); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Scissors className="w-3.5 h-3.5 text-slate-500" />
                Split
              </button>
              
              <div className="h-px bg-white/5 my-1" />

              <button
                onClick={() => { handleDeleteClip(contextMenu.clipId); setContextMenu(null); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════ TRACK CONTEXT MENU ═══════════════════ */}
      <AnimatePresence>
        {trackContextMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setTrackContextMenu(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              style={{ top: trackContextMenu.y, left: trackContextMenu.x }}
              className="fixed z-50 w-44 bg-[#0b0c15] border border-white/10 rounded-xl shadow-2xl py-1 overflow-hidden"
            >
              <button
                onClick={() => {
                  setEditingTrackId(trackContextMenu.trackId);
                  const t = tracks.find(x => x.id === trackContextMenu.trackId);
                  setEditingTrackName(t?.name || "");
                  setTrackContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-slate-500" />
                Rename Track
              </button>
              <button
                onClick={() => {
                  toggleLock(trackContextMenu.trackId);
                  setTrackContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                Lock Track
              </button>
              <button
                onClick={() => {
                  toggleHide(trackContextMenu.trackId);
                  setTrackContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                Hide Track
              </button>
              <div className="h-px bg-white/5 my-1" />
              <button
                onClick={() => {
                  handleDeleteTrack(trackContextMenu.trackId);
                  setTrackContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                Delete Track
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Rename Clip Modal Dialog */}
      {editingClipId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#0b0c15] border border-white/10 p-5 rounded-2xl w-80 shadow-2xl flex flex-col gap-4">
            <h3 className="font-bold text-sm text-white">Rename Clip</h3>
            <input
              type="text"
              value={editingClipName}
              onChange={e => setEditingClipName(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end gap-2 text-xs font-bold">
              <button onClick={() => setEditingClipId(null)} className="px-3.5 py-2 text-slate-400 hover:text-white">Cancel</button>
              <button
                onClick={() => {
                  setClipNameOverrides(prev => ({ ...prev, [editingClipId]: editingClipName }));
                  setEditingClipId(null);
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Speed Dial Dialog */}
      {showSpeedDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#0b0c15] border border-white/10 p-5 rounded-2xl w-80 shadow-2xl flex flex-col gap-4">
            <h3 className="font-bold text-sm text-white">Clip Speed</h3>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Speed Factor (e.g. 0.5, 1.5, 2.0)</label>
              <input
                type="text"
                value={speedInputValue}
                onChange={e => setSpeedInputValue(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs font-bold">
              <button onClick={() => setShowSpeedDialog(null)} className="px-3.5 py-2 text-slate-400 hover:text-white">Cancel</button>
              <button
                onClick={() => {
                  const sp = parseFloat(speedInputValue);
                  if (!isNaN(sp) && sp > 0) {
                    setClipSpeeds(prev => ({ ...prev, [showSpeedDialog]: sp }));
                  }
                  setShowSpeedDialog(null);
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Properties Dialog */}
      {showPropertiesId && (() => {
        const c = clips.find(x => x.id === showPropertiesId);
        if (!c) return null;
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#0b0c15] border border-white/10 p-6 rounded-2xl w-96 shadow-2xl flex flex-col gap-4">
              <h3 className="font-bold text-base text-white border-b border-white/10 pb-2">Clip Properties</h3>
              <div className="flex flex-col gap-2.5 text-xs text-slate-300">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-slate-500 font-bold">Name:</span>
                  <span className="font-semibold text-white truncate max-w-[200px]">{c.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-slate-500 font-bold">Type:</span>
                  <span className="font-semibold text-white capitalize">{c.type}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-slate-500 font-bold">Duration:</span>
                  <span className="font-semibold text-white font-mono">{c.duration.toFixed(2)}s</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-slate-500 font-bold">Locked:</span>
                  <span className={`font-semibold ${c.isLocked ? "text-amber-400" : "text-slate-400"}`}>{c.isLocked ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-slate-500 font-bold">Speed:</span>
                  <span className="font-semibold text-white font-mono">{clipSpeeds[c.id] || "1.0"}x</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-slate-500 font-bold">Reversed:</span>
                  <span className="font-semibold text-white">{clipReverses[c.id] ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Resolution / FPS:</span>
                  <span className="font-semibold text-white">1920x1080 / 30 FPS</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 text-xs font-bold mt-2">
                <button onClick={() => setShowPropertiesId(null)} className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg transition-colors">Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
});

export default TimelineHub;
