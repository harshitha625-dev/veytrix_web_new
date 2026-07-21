import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import {
  Trash2, Plus, Music, Type, Activity, Film, Volume2, VolumeX,
  Lock, Unlock, Eye, EyeOff, Scissors, Copy, CopyPlus, Clipboard, Layers,
  Settings, Magnet, RotateCcw, ChevronDown, ChevronRight, ChevronUp,
  Sparkles, MessageSquare, Maximize2, Minimize2, ZoomIn, ZoomOut,
  RefreshCw, MoreVertical, Play, Pause, Info, Tag, Check, Sliders, SlidersHorizontal,
  Link, Link2, Link2Off, EyeClosed, Diamond, TrendingUp, Shuffle, Image as ImageIcon,
  Undo2, Redo2, SkipBack, SkipForward, Pencil, FileAudio, Crop
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FreezeIcon } from "../style-screen";

/* ─────────────────────────── Types ─────────────────────────── */

export interface Clip {
  id: string;
  name: string;
  type: "video" | "image" | "audio" | "text" | "effect" | "caption" | "overlay";
  startTime: number;
  duration: number;
  originalDuration?: number;
  file?: File;
  preview?: string;
  trackId: string;
  isLocked?: boolean;
  linkedAudioId?: string; // Links a video clip to its generated audio clip
  linkedVideoId?: string; // Links a generated audio clip back to its source video
  volume?: number;        // For audio and video clips
}

export interface Track {
  id: string;
  name: string;
  type: "video" | "audio" | "text" | "overlay" | "effect";
  isLocked: boolean;
  isHidden: boolean;
  isMuted: boolean;
  isSolo?: boolean;
  isCollapsed: boolean;
  isExpanded?: boolean;
  height: number;
  volume?: number;
}

export interface Marker {
  id: string;
  time: number;
  label?: string;
  color?: string;
}

/* ─────────────────────── Helper utilities & Cache ───────────────────── */

/** Generates high-fidelity simulated waveform path for audio clips with dynamic density */
function generateWaveformPath(width: number, height: number, seed: string, density: number = 3): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h) + seed.charCodeAt(i);
    h |= 0;
  }
  
  const points = Math.max(10, Math.floor(width / Math.max(1, density)));
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

/** Cache waveform paths keyed by seed+width+height to avoid recompute every render */
const _waveformCache = new Map<string, string>();
function getWaveformPath(width: number, height: number, seed: string, density: number = 3): string {
  const key = `${seed}|${Math.round(width)}|${height}|${density}`;
  if (_waveformCache.has(key)) return _waveformCache.get(key)!;
  const path = generateWaveformPath(width, height, seed, density);
  if (_waveformCache.size > 500) _waveformCache.clear();
  _waveformCache.set(key, path);
  return path;
}

function fmtTime(t: number) {
  const m = Math.floor(t / 60).toString().padStart(2, "0");
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  const cs = Math.floor((t % 1) * 100).toString().padStart(2, "0");
  return `${m}:${s}.${cs}`;
}

const Divider = memo(() => <div className="w-px h-5 bg-white/10 mx-1.5 flex-none" />);

const TrackBtn = memo(({ onClick, title, children, active = false, danger = false }: {
  onClick: (e: React.MouseEvent) => void; title: string; children: React.ReactNode; active?: boolean; danger?: boolean;
}) => {
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
});

const FooterChip = memo(({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-center gap-1.5 select-none bg-black/20 border border-white/5 rounded-md px-2 py-0.5">
      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      <span className="text-[10px] font-mono font-medium text-slate-300">{value}</span>
    </div>
  );
});

const FooterToggle = memo(({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => {
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
});

/* ── Clip color palette ────────────────────────────────────── */
const clipColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  video:  { bg: "bg-purple-950/70",     border: "border-purple-500/40",    text: "text-purple-200",    dot: "bg-purple-400"    },
  image:  { bg: "bg-indigo-950/70",  border: "border-indigo-500/40",  text: "text-indigo-200",  dot: "bg-indigo-400"  },
  audio:  { bg: "bg-fuchsia-950/70", border: "border-fuchsia-500/40", text: "text-fuchsia-200", dot: "bg-fuchsia-400" },
  text:   { bg: "bg-sky-950/70",     border: "border-sky-500/40",     text: "text-sky-200",     dot: "bg-sky-400"     },
  effect: { bg: "bg-emerald-950/70", border: "border-emerald-500/40", text: "text-emerald-200", dot: "bg-emerald-400" },
};

const clipColorsSelected: Record<string, { bg: string; border: string; ring: string }> = {
  video:  { bg: "bg-[#140a24]", border: "border-2 border-[#FACC15] shadow-[0_0_12px_rgba(250,204,21,0.4)]", ring: "ring-2 ring-[#FACC15]" },
  image:  { bg: "bg-[#0f172a]", border: "border-2 border-[#FACC15] shadow-[0_0_12px_rgba(250,204,21,0.4)]", ring: "ring-2 ring-[#FACC15]" },
  audio:  { bg: "bg-[#B45309]", border: "border-2 border-[#FACC15] shadow-[0_0_12px_rgba(250,204,21,0.4)]", ring: "ring-2 ring-[#FACC15]" },
  text:   { bg: "bg-[#0c4a6e]", border: "border-2 border-[#FACC15] shadow-[0_0_12px_rgba(250,204,21,0.4)]", ring: "ring-2 ring-[#FACC15]" },
  effect: { bg: "bg-[#064e3b]", border: "border-2 border-[#FACC15] shadow-[0_0_12px_rgba(250,204,21,0.4)]", ring: "ring-2 ring-[#FACC15]" },
};

/* ─────────────────────────── THUMBNAIL CACHE ─────────────────────────── */
class VideoThumbnailGenerator {
  private video: HTMLVideoElement;
  private queue: { time: number; resolve: (url: string) => void; reject: (err: any) => void }[] = [];
  private isProcessing = false;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;

  constructor(url: string) {
    this.video = document.createElement('video');
    this.video.src = url;
    this.video.muted = true;
    this.video.crossOrigin = "anonymous";
    this.video.preload = "auto";
    
    this.canvas = document.createElement('canvas');
    this.canvas.width = 160;
    this.canvas.height = 90;
    this.ctx = this.canvas.getContext('2d');
  }

  enqueue(time: number): Promise<string> {
    return new Promise((resolve, reject) => {
      this.queue.push({ time, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const task = this.queue.shift()!;
    let isFinished = false;
    
    const finish = (result: string | Error) => {
      if (isFinished) return;
      isFinished = true;
      this.video.removeEventListener('seeked', onSeeked);
      this.video.removeEventListener('error', onError);
      
      if (result instanceof Error) task.reject(result);
      else task.resolve(result);
      
      this.isProcessing = false;
      this.processQueue();
    };

    const onSeeked = () => {
      if (this.ctx) {
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        finish(this.canvas.toDataURL('image/jpeg', 0.5));
      } else {
        finish(new Error("No canvas context"));
      }
    };

    const onError = (e: any) => finish(new Error("Video error"));
    
    this.video.addEventListener('seeked', onSeeked);
    this.video.addEventListener('error', onError);
    
    setTimeout(() => {
      if (!isFinished) finish(""); 
    }, 2000);

    this.video.currentTime = task.time;
  }
}

class ThumbnailCacheManager {
  private cache: Map<string, string> = new Map();
  private generators: Map<string, VideoThumbnailGenerator> = new Map();

  async getThumbnail(url: string, time: number): Promise<string> {
    const key = `${url}@${time.toFixed(1)}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    let generator = this.generators.get(url);
    if (!generator) {
      generator = new VideoThumbnailGenerator(url);
      this.generators.set(url, generator);
    }

    try {
      const dataUrl = await generator.enqueue(time);
      if (dataUrl) this.cache.set(key, dataUrl);
      return dataUrl;
    } catch (e) {
      return "";
    }
  }
}
const globalThumbnailCache = new ThumbnailCacheManager();

/* ─────────────────────────── MEMOIZED CLIP ITEM ─────────────────────────── */

interface TimelineClipItemProps {
  clip: Clip;
  isSelected: boolean;
  isDragging: boolean;
  isHovered: boolean;
  trackH: number;
  pixelsPerSecond: number;
  isZooming: boolean;
  isClipMuted: boolean;
  effDur: number;
  trim: { start: number; end: number };
  clipSpeed?: number;
  clipReverse?: boolean;
  onClipMouseDown: (e: React.MouseEvent, clip: Clip) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent, clipId: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onSeparateAudio: (clipId: string) => void;
  onTrimMouseDown: (e: React.MouseEvent, clipId: string, edge: "left" | "right", itemDuration: number, initStartTime: number) => void;
  onReplaceClip: (clipId: string) => void;
  onToggleLock: (clipId: string) => void;
  onDuplicate: (clipId: string) => void;
  onDeleteClip: (clipId: string) => void;
  setActivePreviewId?: (id: string) => void;
  setActiveTool?: (tool: string) => void;
}

const TimelineClipItem = memo(({
  clip,
  isSelected,
  isDragging,
  isHovered,
  trackH,
  pixelsPerSecond,
  isZooming,
  isClipMuted,
  effDur,
  trim,
  clipSpeed,
  clipReverse,
  onClipMouseDown,
  onDoubleClick,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
  onSeparateAudio,
  onTrimMouseDown,
  onReplaceClip,
  onToggleLock,
  onDuplicate,
  onDeleteClip,
  setActivePreviewId,
  setActiveTool
}: TimelineClipItemProps) => {
  const widthPx = Math.max(6, effDur * pixelsPerSecond);
  const leftPx = clip.startTime * pixelsPerSecond;
  const col = isSelected ? clipColorsSelected[clip.type] ?? clipColorsSelected.video : clipColors[clip.type] ?? clipColors.video;
  const clipH = trackH - 12;

  const thumbDensity = pixelsPerSecond < 15 ? 120 : pixelsPerSecond < 60 ? 70 : 40;
  const numFrames = isZooming ? 1 : Math.min(5, Math.max(1, Math.ceil(widthPx / thumbDensity)));
  const frameW = widthPx / numFrames;

  const waveDensity = isZooming ? 25 : (pixelsPerSecond < 15 ? 12 : pixelsPerSecond < 60 ? 5 : 2);

  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  useEffect(() => {
    if (clip.type !== 'video' || !clip.preview || isZooming) return;
    let isMounted = true;
    
    const loadThumbnails = async () => {
      const promises = Array.from({ length: numFrames }).map(async (_, fi) => {
        const frameTime = Math.min(trim.end, Math.max(trim.start, trim.start + fi * (effDur / numFrames)));
        const dataUrl = await globalThumbnailCache.getThumbnail(clip.preview!, frameTime);
        if (isMounted && dataUrl) {
          setThumbnails(prev => ({ ...prev, [fi]: dataUrl }));
        }
      });
      await Promise.allSettled(promises);
    };
    
    loadThumbnails();
    return () => { isMounted = false; };
  }, [clip.preview, clip.type, numFrames, trim.start, trim.end, effDur, isZooming]);

  return (
    <React.Fragment>
      <div
        onMouseDown={e => onClipMouseDown(e, clip)}
        onDoubleClick={onDoubleClick}
        onContextMenu={e => onContextMenu(e, clip.id)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`absolute rounded-lg cursor-pointer select-none group shadow-lg ${col.bg}
          ${isSelected ? "z-30 overflow-visible" : `border ${col.border} overflow-hidden`}
          ${isDragging ? "opacity-50 scale-95 shadow-2xl" : "hover:border-[#FACC15]/60"}
          ${clip.isLocked ? "cursor-not-allowed" : ""}
          will-change-transform transition-all duration-150`}
        style={{
          transform: `translate3d(${leftPx}px, 0, 0)`,
          width: widthPx,
          top: 6,
          height: clipH,
        }}
      >
        {/* ── VIDEO Clip Layout ── */}
        {(clip.type === "video" || clip.type === "image") && (
          <>
            {/* Filmstrip Container */}
            <div className="absolute inset-0 flex bg-[#140a24] rounded-md overflow-hidden pointer-events-auto">
              <div className="flex-1 flex relative opacity-100">
                {Array.from({ length: numFrames }).map((_, fi) => {
                  const frameTime = Math.min(trim.end, Math.max(trim.start, trim.start + fi * (effDur / numFrames)));
                  return (
                    <div
                      key={fi}
                      className="shrink-0 relative overflow-hidden"
                      style={{ width: frameW, height: clipH }}
                    >
                      {thumbnails[fi] && !isZooming ? (
                        <img
                          src={thumbnails[fi]}
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                          alt={`Frame ${fi}`}
                        />
                      ) : (
                        <div
                          className="absolute inset-0 transition-opacity duration-300"
                          style={{
                            background: `linear-gradient(135deg, hsl(${(fi * 33) % 360}, 45%, 15%) 0%, hsl(${(fi * 33 + 45) % 360}, 45%, 10%) 100%)`
                          }}
                        />
                      )}
                      {fi > 0 && <div className="absolute inset-y-0 left-0 w-px bg-black/40 pointer-events-none" />}
                    </div>
                  );
                })}
              </div>
              {/* Dark gradient overlay for bottom text */}
              <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-1 left-1.5 px-1 py-0.5 rounded text-[10px] font-bold text-white z-20 pointer-events-none drop-shadow-md">
              {effDur.toFixed(2)}
            </div>

            {/* Selection Border & Handles */}
            {isSelected && !clip.isLocked && (
              <>
                <div className={`absolute inset-0 pointer-events-none rounded-md border-[4px] z-30 ${clip.type === 'image' ? 'border-[#1d4ed8]' : 'border-[#FACC15]'}`} />
                <div
                  onMouseDown={e => onTrimMouseDown(e, clip.id, "left", clip.type === 'text' || clip.type === 'overlay' ? 99999 : (clip.originalDuration ?? clip.duration), clip.startTime)}
                  className="trim-handle absolute -left-2 top-0 bottom-0 w-4 cursor-ew-resize z-40 flex items-center justify-center select-none group/handle pointer-events-auto"
                  title="Trim Start"
                >
                  <div className="w-1.5 h-6 bg-white rounded-sm shadow-md border border-black/20 group-hover/handle:scale-y-110 transition-transform" />
                </div>
                <div
                  onMouseDown={e => onTrimMouseDown(e, clip.id, "right", clip.type === 'text' || clip.type === 'overlay' ? 99999 : (clip.originalDuration ?? clip.duration), clip.startTime)}
                  className="trim-handle absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize z-40 flex items-center justify-center select-none group/handle pointer-events-auto"
                  title="Trim End"
                >
                  <div className="w-1.5 h-6 bg-white rounded-sm shadow-md border border-black/20 group-hover/handle:scale-y-110 transition-transform" />
                </div>
              </>
            )}
          </>
        )}

        {/* ── AUDIO Track Layout ── */}
        {clip.type === "audio" && (
          <>
            <div className="absolute inset-0 flex flex-col bg-[#8b5cf6] rounded-md overflow-hidden pointer-events-auto border border-[#7c3aed]">
              <div className="h-[20px] bg-[#7c3aed] flex items-center justify-between px-2 shrink-0 z-20">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px]">🎵</span>
                  <span className="text-[10px] font-bold text-white truncate">
                    {clip.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isClipMuted && <span className="text-[8px]">🔇</span>}
                </div>
              </div>
              <div className="flex-1 relative overflow-hidden flex items-center">
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-80">
                  <path
                    d={getWaveformPath(widthPx, clipH - 20, clip.id, waveDensity)}
                    stroke={isClipMuted ? "#a78bfa" : "#4c1d95"}
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-1 left-1.5 px-1 py-0.5 rounded text-[10px] font-bold text-white z-20 pointer-events-none drop-shadow-md">
              {effDur.toFixed(2)}
            </div>

            {/* Selection Border & Trim Handles */}
            {isSelected && !clip.isLocked && (
              <>
                <div className="absolute inset-0 pointer-events-none rounded-md border-[4px] border-[#FACC15] z-30" />
                <div
                  onMouseDown={e => onTrimMouseDown(e, clip.id, "left", clip.originalDuration ?? clip.duration, clip.startTime)}
                  className="trim-handle absolute -left-2 top-0 bottom-0 w-4 cursor-ew-resize z-40 flex items-center justify-center select-none group/handle pointer-events-auto"
                  title="Trim Start"
                >
                  <div className="w-1.5 h-6 bg-white rounded-sm shadow-md border border-black/20 group-hover/handle:scale-y-110 transition-transform" />
                </div>
                <div
                  onMouseDown={e => onTrimMouseDown(e, clip.id, "right", clip.originalDuration ?? clip.duration, clip.startTime)}
                  className="trim-handle absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize z-40 flex items-center justify-center select-none group/handle pointer-events-auto"
                  title="Trim End"
                >
                  <div className="w-1.5 h-6 bg-white rounded-sm shadow-md border border-black/20 group-hover/handle:scale-y-110 transition-transform" />
                </div>
              </>
            )}
          </>
        )}

        {/* ── TEXT Clip Layout ── */}
        {(clip.type === "text" || clip.type === "caption") && (
          <>
            <div className="absolute inset-0 flex flex-col bg-[#0c4a6e] rounded-md overflow-hidden pointer-events-auto border border-[#0ea5e9]/30">
              <div className="flex flex-1 items-center justify-center px-2">
                <span className="text-[11px] font-bold text-white truncate drop-shadow-md">
                  {clip.name || "Text Overlay"}
                </span>
              </div>
            </div>
            
            {/* Duration Badge */}
            <div className="absolute bottom-1 left-1.5 px-1 py-0.5 rounded text-[10px] font-bold text-white z-20 pointer-events-none drop-shadow-md">
              {effDur.toFixed(2)}
            </div>
            
            {/* Selection Border & Trim Handles */}
            {isSelected && !clip.isLocked && (
              <>
                <div className="absolute inset-0 pointer-events-none rounded-md border-[4px] border-[#FACC15] z-30" />
                <div
                  onMouseDown={e => onTrimMouseDown(e, clip.id, "left", clip.type === 'text' || clip.type === 'caption' || clip.type === 'overlay' ? 99999 : (clip.originalDuration ?? clip.duration), clip.startTime)}
                  className="trim-handle absolute -left-2 top-0 bottom-0 w-4 cursor-ew-resize z-40 flex items-center justify-center select-none group/handle pointer-events-auto"
                  title="Trim Start"
                >
                  <div className="w-1.5 h-6 bg-white rounded-sm shadow-md border border-black/20 group-hover/handle:scale-y-110 transition-transform" />
                </div>
                <div
                  onMouseDown={e => onTrimMouseDown(e, clip.id, "right", clip.type === 'text' || clip.type === 'caption' || clip.type === 'overlay' ? 99999 : (clip.originalDuration ?? clip.duration), clip.startTime)}
                  className="trim-handle absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize z-40 flex items-center justify-center select-none group/handle pointer-events-auto"
                  title="Trim End"
                >
                  <div className="w-1.5 h-6 bg-white rounded-sm shadow-md border border-black/20 group-hover/handle:scale-y-110 transition-transform" />
                </div>
              </>
            )}
          </>
        )}

        {/* Hover info tooltip */}
        {isHovered && (
          <div className="absolute bottom-7 left-2.5 bg-[#0b0c15]/95 border border-white/10 rounded-lg p-2 z-40 text-[9px] shadow-2xl pointer-events-none min-w-[120px] backdrop-blur-md">
            <p className="font-bold text-white truncate">{clip.name}</p>
            <p className="text-slate-400 font-mono">Duration: {effDur.toFixed(2)}s</p>
            <p className="text-slate-500 font-mono capitalize">Type: {clip.type}</p>
          </div>
        )}
      </div>

      {/* Floating Action Menu */}
      {isSelected && (
        <div 
          className={`absolute z-[100] flex items-center justify-center gap-1.5 px-3 py-2 shadow-xl rounded-xl whitespace-nowrap pointer-events-auto transform -translate-x-1/2 ${
            clip.type === 'audio' 
              ? 'bg-[#a855f7] text-white' 
              : clip.type === 'image'
              ? 'bg-[#1d4ed8] text-white'
              : (clip.type === 'text' || clip.type === 'caption')
              ? 'bg-[#0d9488] text-white'
              : 'bg-[#FACC15] text-[#140a24]'
          }`}
          style={{
            left: leftPx + widthPx / 2,
            top: -60,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {clip.type !== 'audio' && clip.type !== 'text' && clip.type !== 'caption' && clip.type !== 'image' && (
            <>
              <button 
                className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-black/10 rounded-lg transition-colors"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (setActivePreviewId) setActivePreviewId(clip.id);
                  onReplaceClip(clip.id); 
                }}
              >
                <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-[10.5px] font-medium tracking-wide capitalize">Replace</span>
              </button>
              {clip.type === "video" && (
                <>
                  <div className="w-px h-6 mx-0.5 bg-[#140a24]/20" />
                  <button 
                    className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-black/10 rounded-lg transition-colors"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onSeparateAudio(clip.id); 
                    }}
                    title="Separate Video Audio into Audio Track"
                  >
                    <Music className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-[10.5px] font-medium tracking-wide capitalize">Extract Audio</span>
                  </button>
                </>
              )}
              <div className="w-px h-6 mx-0.5 bg-[#140a24]/20" />
              <button className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-black/10 rounded-lg transition-colors">
                <Diamond className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-[10.5px] font-medium tracking-wide capitalize">Keyframe</span>
              </button>
              <div className="w-px h-6 mx-0.5 bg-[#140a24]/20" />
              <button className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-black/10 rounded-lg transition-colors">
                <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-[10.5px] font-medium tracking-wide capitalize">Curve</span>
              </button>
              <div className="w-px h-6 mx-0.5 bg-[#140a24]/20" />
            </>
          )}

          {(clip.type === 'text' || clip.type === 'caption') && (
            <>
              <button 
                className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-white/10 rounded-lg transition-colors"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (setActivePreviewId) setActivePreviewId(clip.id);
                  if (setActiveTool) setActiveTool('text-tool');
                }}
              >
                <Pencil className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-[10.5px] font-medium tracking-wide capitalize">Edit</span>
              </button>
              <div className="w-px h-6 mx-0.5 bg-white/20" />
            </>
          )}

          <button 
            className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-white/10 rounded-lg transition-colors"
            onClick={(e) => { 
              e.stopPropagation(); 
              onToggleLock(clip.id);
            }}
          >
            {clip.isLocked ? <Lock className="w-4 h-4" strokeWidth={1.5} /> : <Unlock className="w-4 h-4" strokeWidth={1.5} />}
            <span className="text-[10.5px] font-medium tracking-wide capitalize">Lock</span>
          </button>
          <div className={`w-px h-6 mx-0.5 ${clip.type === 'audio' || clip.type === 'text' || clip.type === 'caption' ? 'bg-white/20' : 'bg-[#140a24]/20'}`} />
          <button 
            className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-white/10 rounded-lg transition-colors"
            onClick={(e) => { e.stopPropagation(); onDuplicate(clip.id); }}
          >
            <CopyPlus className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10.5px] font-medium tracking-wide capitalize">Duplicate</span>
          </button>
          <div className={`w-px h-6 mx-0.5 ${clip.type === 'audio' || clip.type === 'text' || clip.type === 'caption' ? 'bg-white/20' : 'bg-[#140a24]/20'}`} />
          <button 
            className="flex flex-col items-center gap-1 px-2 py-1 hover:bg-white/10 rounded-lg transition-colors"
            onClick={(e) => { e.stopPropagation(); onDeleteClip(clip.id); }}
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10.5px] font-medium tracking-wide capitalize">Delete</span>
          </button>
        </div>
      )}
    </React.Fragment>
  );
}, (prev, next) => {
  return (
    prev.clip.id === next.clip.id &&
    prev.clip.startTime === next.clip.startTime &&
    prev.clip.duration === next.clip.duration &&
    prev.clip.name === next.clip.name &&
    prev.clip.isLocked === next.clip.isLocked &&
    prev.isSelected === next.isSelected &&
    prev.isDragging === next.isDragging &&
    prev.isHovered === next.isHovered &&
    prev.trackH === next.trackH &&
    prev.pixelsPerSecond === next.pixelsPerSecond &&
    prev.isZooming === next.isZooming &&
    prev.isClipMuted === next.isClipMuted &&
    prev.effDur === next.effDur &&
    prev.trim.start === next.trim.start &&
    prev.trim.end === next.trim.end &&
    prev.clipSpeed === next.clipSpeed &&
    prev.clipReverse === next.clipReverse
  );
});

/* ─────────────────────── Main Component ────────────────────── */

const TimeDisplay = memo(() => {
  const [time, setTime] = useState(0);
  useEffect(() => {
    const handleUpdate = (e: any) => setTime(e.detail.currentTime);
    window.addEventListener('editor-timeupdate', handleUpdate);
    return () => window.removeEventListener('editor-timeupdate', handleUpdate);
  }, []);
  const m = Math.floor(time / 60).toString().padStart(2, '0');
  const s = Math.floor(time % 60).toString().padStart(2, '0');
  const ms = Math.floor((time % 1) * 100).toString().padStart(2, '0');
  
  return (
    <div className="flex flex-col border border-white/5 bg-[#140a24] rounded-lg overflow-hidden shrink-0">
        <div className="bg-white/5 px-2 py-0.5 border-b border-white/5">
            <span className="text-[8px] font-bold text-white/50 uppercase tracking-wider block leading-none">Time</span>
        </div>
        <div className="px-2 py-1">
            <span className="text-[11px] font-mono font-medium text-purple-200 block leading-none">{m}:{s}.{ms}</span>
        </div>
    </div>
  );
});

export const TimelineHub = memo(({
  mediaItems = [],
  getClipGlobalStart,
  audioTracks = [],
  setAudioTracks,
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
  handleAddImage,
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
  clipTransitions = {},
  setClipTransitions,
  setLeftTab,
  setActiveTool,
  setIsPlaying,
  clipStartOverrides = {},
  setClipStartOverrides,
  clipTrackOverrides = {},
  setClipTrackOverrides,
  clipNameOverrides = {},
  setClipNameOverrides,
  clipLockedStates = {},
  setClipLockedStates,
  clipSettings = {},
  setClipSettings,
  undo,
  redo,
  onCropTrack,
}: any) => {

  /* ── State ─────────────────────────────────────────────────── */
  const [pixelsPerSecond, setPixelsPerSecond] = useState(30);
  const [isMagnetEnabled, setIsMagnetEnabled] = useState(false);
  const [isRippleEnabled, setIsRippleEnabled] = useState(true);
  const [isSnapEnabled, setIsSnapEnabled] = useState(true);
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [clipboard, setClipboard] = useState<any[]>([]);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(800);
  const [isZooming, setIsZooming] = useState(false);

  // Buffer state for timeline virtualization scrolling
  const [scrollLeftState, setScrollLeftState] = useState(0);

  useEffect(() => {
    setIsZooming(true);
    const timeout = setTimeout(() => {
      setIsZooming(false);
    }, 150);
    return () => clearTimeout(timeout);
  }, [pixelsPerSecond]);

  // Tracks State
  const [tracks, setTracks] = useState<Track[]>([
    { id: "text-1",    name: "Text / Subtitles", type: "text",    isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 48 },
    { id: "image-1",   name: "Image Track",      type: "image",   isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 80 },
    { id: "overlay-1", name: "Overlay 1",        type: "overlay", isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 56 },
    { id: "video-1",   name: "Main Video",       type: "video",   isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 80 },
    { id: "audio-1",   name: "Audio 1",          type: "audio",   isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 60 },
    { id: "audio-2",   name: "Audio 2",          type: "audio",   isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 60 }
  ]);

  // Local clip overrides
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

  const handleTimelineClickRef = useRef(handleTimelineClick);
  useEffect(() => {
    handleTimelineClickRef.current = handleTimelineClick;
  }, [handleTimelineClick]);
  const [hoveredClipId, setHoveredClipId] = useState<string | null>(null);
  const [insertMenuTargetId, setInsertMenuTargetId] = useState<string | null>(null);
  const [unlinkedClips, setUnlinkedClips] = useState<Record<string, boolean>>({});

  const handleUnlinkAudio = useCallback((clipId: string) => {
    setUnlinkedClips(prev => ({ ...prev, [clipId]: true }));
  }, []);

  // Close insertion menu if click outside
  useEffect(() => {
    const closeInsertMenu = () => setInsertMenuTargetId(null);
    window.addEventListener("click", closeInsertMenu);
    return () => window.removeEventListener("click", closeInsertMenu);
  }, []);

  /* ── Refs ──────────────────────────────────────────────────── */
  const scrollRef   = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLDivElement>(null);
  const rulerRef    = useRef<HTMLDivElement>(null);
  const sidebarTracksRef = useRef<HTMLDivElement>(null);

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
  const currentTimeRef = useRef(0);
  
  useEffect(() => {
    const handleTimeUpdate = (e: any) => {
      currentTimeRef.current = e.detail.currentTime;
      if (!isDraggingPlayhead && !isAutoScrollingRef.current && isPlaying) {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = currentTimeRef.current * pixelsPerSecond;
        }
      }
    };
    window.addEventListener('editor-timeupdate', handleTimeUpdate);
    return () => window.removeEventListener('editor-timeupdate', handleTimeUpdate);
  }, [isDraggingPlayhead, isPlaying, pixelsPerSecond, viewportWidth]);

  const canvasWidth  = useMemo(() => Math.max(1200, totalDuration * pixelsPerSecond + 400), [totalDuration, pixelsPerSecond]);

  const clips = useMemo<Clip[]>(() => {
    const list: Clip[] = [];
    let accStart = 0;
    
    mediaItems.forEach((it: any) => {
      const t = getTrimRangeForItem ? getTrimRangeForItem(it.id, it.duration) : { start: 0, end: it.duration };
      const dur = it.type === "video" ? (t.end - t.start) : it.duration;
      // If no override, fallback to sequential accStart
      const finalStart = clipStartOverrides[it.id] !== undefined ? clipStartOverrides[it.id] : accStart;
      const finalTrack = clipTrackOverrides[it.id] || (it.type === 'image' ? 'image-1' : 'video-1');
      const finalName = clipNameOverrides[it.id] || (it.file?.name ?? `Video Clip`);
      
      const isVideo = it.type === "video";
      const isUnlinked = !!unlinkedClips[it.id];
      const linkedAudioId = isVideo ? `${it.id}-audio` : undefined;

      // The video clip (now only shows thumbnails because we removed audio inline)
      list.push({
        id: it.id,
        name: finalName,
        type: it.type,
        startTime: finalStart,
        duration: dur,
        originalDuration: it.duration,
        file: it.file,
        preview: it.preview,
        trackId: finalTrack,
        isLocked: clipLockedStates[it.id] || false,
        linkedAudioId: isUnlinked ? undefined : linkedAudioId,
      });

      // Automatically generate a linked audio clip for the video on an adjacent track
      if (isVideo) {
        // Find corresponding audio track (e.g. video-1 -> audio-1)
        const audioTrackSuffix = finalTrack.split("-")[1] || "1";
        const linkedAudioTrack = `audio-${audioTrackSuffix}`;
        // If unlinked, it might have its own overrides
        const audioStart = clipStartOverrides[linkedAudioId!] !== undefined ? clipStartOverrides[linkedAudioId!] : finalStart;
        const audioTrackOverride = clipTrackOverrides[linkedAudioId!] || linkedAudioTrack;

        list.push({
          id: linkedAudioId!,
          name: `${finalName} (Audio)`,
          type: "audio",
          startTime: audioStart,
          duration: dur,
          originalDuration: it.duration,
          file: it.file, // same file for extracting waveform
          preview: it.preview,
          trackId: audioTrackOverride,
          isLocked: clipLockedStates[linkedAudioId!] || clipLockedStates[it.id] || false,
          linkedVideoId: isUnlinked ? undefined : it.id,
        });
      }

      // We still update accStart so new clips are added sequentially at the end by default
      if (clipStartOverrides[it.id] === undefined) {
        accStart += dur;
      }
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
        originalDuration: tr.duration || 10,
        trackId: finalTrack,
        isLocked: clipLockedStates[tr.id] || false,
      });
    });
    
    captions.forEach((cap: any) => {
      const finalStart = clipStartOverrides[cap.id] !== undefined ? clipStartOverrides[cap.id] : cap.startTime;
      const finalTrack = clipTrackOverrides[cap.id] || "text-1";
      const finalName = clipNameOverrides[cap.id] || cap.text;
      const capDur = (cap.endTime ?? cap.startTime + 2) - cap.startTime;
      
      list.push({
        id: cap.id,
        name: finalName,
        type: "text",
        startTime: finalStart,
        duration: capDur,
        originalDuration: capDur,
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
      if (clip.trackId) requiredTrackIds.add(clip.trackId);
    });

    setTracks(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const missing = [...requiredTrackIds].filter(id => !existingIds.has(id));
      if (missing.length === 0) return prev;

      const trackTemplates: Record<string, Omit<Track, 'id'>> = {
        "overlay-1": { name: "Overlay 1",        type: "overlay", isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 56 },
        "image-1":   { name: "Image Track",      type: "image",   isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 80 },
        "text-1":    { name: "Text / Subtitles", type: "text",    isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 48 },
        "effect-1":  { name: "Effects 1",        type: "effect",  isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 48 },
        "video-1":   { name: "Video 1",          type: "video",   isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 80 },
        "video-2":   { name: "Video 2",          type: "video",   isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 80 },
        "audio-1":   { name: "Audio 1",          type: "audio",   isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 60 },
        "audio-2":   { name: "Audio 2",          type: "audio",   isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 60 },
      };

      const updated = [...prev];
      missing.forEach(id => {
        const template = trackTemplates[id] || { name: `Track ${id}`, type: "overlay", isLocked: false, isHidden: false, isMuted: false, isCollapsed: false, height: 56 };
        updated.push({ id, ...template } as Track);
      });
      return updated;
    });
  }, [clips]);

  /* ── Ruler tick generator ──────────────────────────────────── */
  const rulerTicks = useMemo(() => {
    const step = pixelsPerSecond >= 100 ? 1 : pixelsPerSecond >= 25 ? 2 : pixelsPerSecond >= 10 ? 5 : 10;
    const ticks: number[] = [];
    for (let s = 0; s <= Math.ceil(totalDuration); s += step) ticks.push(s);
    return ticks;
  }, [totalDuration, pixelsPerSecond]);

  /* ── Virtualization ────────────────────────────────────────── */
  const isClipVisible = useCallback((startTime: number, duration: number) => {
    const sl = scrollLeftState;
    const cw = viewportWidth;
    return (startTime + duration) * pixelsPerSecond >= sl - 1200 &&
           startTime * pixelsPerSecond <= sl + cw + 1200;
  }, [pixelsPerSecond, scrollLeftState, viewportWidth]);

  /* ── Keep scrollLeft in sync with playback ─────────────────────────────── */
  const isAutoScrollingRef = useRef(false);

  useEffect(() => {
    if (!scrollRef.current || isDraggingPlayhead) return;
    const targetScrollLeft = currentTimeRef.current * pixelsPerSecond;
    isAutoScrollingRef.current = true;
    scrollRef.current.scrollLeft = targetScrollLeft;
    requestAnimationFrame(() => { isAutoScrollingRef.current = false; });
  }, [ pixelsPerSecond, isDraggingPlayhead]);

  /* ── Sync sidebar vertical scroll & scrollLeftState ─────────────────────── */
  const lastRenderedScrollRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let scrollRafId: number | null = null;

    const onScroll = () => {
      if (sidebarTracksRef.current) {
        sidebarTracksRef.current.scrollTop = el.scrollTop;
      }
      
      if (scrollRafId === null) {
        scrollRafId = requestAnimationFrame(() => {
          scrollRafId = null;
          // Chunk React updates to prevent 500-clip re-render lag per pixel scrolled
          if (Math.abs(el.scrollLeft - lastRenderedScrollRef.current) > 400) {
            lastRenderedScrollRef.current = el.scrollLeft;
            setScrollLeftState(el.scrollLeft);
          }
        });
      }

      if (!isDraggingPlayhead && !isAutoScrollingRef.current && !isPlaying) {
        const scrolledTime = el.scrollLeft / pixelsPerSecond;
        if (Math.abs(currentTimeRef.current - scrolledTime) > 0.3) {
          handleTimelineClick(scrolledTime);
        }
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (scrollRafId !== null) cancelAnimationFrame(scrollRafId);
      el.removeEventListener("scroll", onScroll);
    };
  }, [ pixelsPerSecond, handleTimelineClick, isDraggingPlayhead, isPlaying]);

  /* ── Snap ──────────────────────────────────────────────────── */
  const getSnappedTime = useCallback((time: number, duration: number, ignoreId?: string) => {
    if (!isSnapEnabled) return time;
    const thr = 10 / pixelsPerSecond;
    const candidates = [0, totalDuration];
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
  }, [isSnapEnabled, clips,  totalDuration, markers, pixelsPerSecond]);

  /* ── Zoom ──────────────────────────────────────────────────── */
  const handleZoom = useCallback((dir: "in" | "out" | number) => {
    setPixelsPerSecond(prev => {
      const next = dir === "in" ? prev * 1.3 : dir === "out" ? prev / 1.3 : (dir as number);
      const clamped = Math.max(6, Math.min(300, next));
      if (scrollRef.current) {
        const relativePlayheadOffset = currentTimeRef.current * prev - scrollRef.current.scrollLeft;
        scrollRef.current.scrollLeft = currentTimeRef.current * clamped - relativePlayheadOffset;
      }
      return clamped;
    });
  }, []);

  const handleSliderZoom = useCallback((val: number) => {
    setPixelsPerSecond(prev => {
      if (scrollRef.current) {
        const relativePlayheadOffset = currentTimeRef.current * prev - scrollRef.current.scrollLeft;
        scrollRef.current.scrollLeft = currentTimeRef.current * val - relativePlayheadOffset;
      }
      return val;
    });
  }, []);

  /* ── Native non-passive Wheel listener ── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheelNative = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.15 : 0.85;
        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;

        setPixelsPerSecond(prev => {
          const next = Math.max(6, Math.min(300, prev * factor));
          const mouseTime = (el.scrollLeft + mouseX) / prev;
          el.scrollLeft = mouseTime * next - mouseX;
          return next;
        });
      } else if (e.shiftKey) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheelNative);
    };
  }, []);

  /* ── Scrub Playhead Click/Drag (RAF throttled) ────────────────────────────── */
  const handleRulerMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || !scrollRef.current || !rulerRef.current) return;
    e.preventDefault();
    setIsDraggingPlayhead(true);

    if (setIsPlaying) {
      setIsPlaying(false);
    }

    const updatePlayhead = (clientX: number) => {
      if (!rulerRef.current || !scrollRef.current) return;
      const rect = rulerRef.current.getBoundingClientRect();
      const clickOffset = clientX - rect.left;
      const canvasT = Math.max(0, clickOffset / pixelsPerSecond);
      handleTimelineClick(canvasT);
    };

    updatePlayhead(e.clientX);

    let rulerRafId: number | null = null;
    const onMove = (ev: MouseEvent) => {
      if (rulerRafId !== null) return;
      rulerRafId = requestAnimationFrame(() => {
        rulerRafId = null;
        updatePlayhead(ev.clientX);
      });
    };

    const onUp = () => {
      if (rulerRafId !== null) cancelAnimationFrame(rulerRafId);
      setIsDraggingPlayhead(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [pixelsPerSecond, handleTimelineClick, setIsPlaying]);

  /* ── Markers ───────────────────────────────────────────────── */
  const handleAddMarker = useCallback(() => {
    setMarkers(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      time: currentTimeRef.current,
      label: `Marker ${prev.length + 1}`,
      color: "bg-rose-500",
    }]);
  }, []);

  /* ── Split Clip Memos ───────────────────────────────────────── */
  const selectedClip = useMemo(() => {
    if (selectedClipIds.length === 0) return null;
    return clips.find(c => c.id === selectedClipIds[0]) || null;
  }, [clips, selectedClipIds]);

  /* ── Split Clip ────────────────────────────────────────────── */
  const handleSplitClip = useCallback(() => {
    let targetClip = selectedClip;
    if (!targetClip) {
      const clipsUnderPlayhead = clips.filter(c => !c.isLocked && currentTimeRef.current >= c.startTime && currentTimeRef.current < c.startTime + c.duration);
      if (clipsUnderPlayhead.length > 0) {
        targetClip = clipsUnderPlayhead.find(c => c.type === 'video') || clipsUnderPlayhead[0];
      }
    }

    if (!targetClip) return;
    
    const id = targetClip.id;
    const clip = targetClip;

    const t = getTrimRangeForItem ? getTrimRangeForItem(clip.id, clip.originalDuration ?? clip.duration) : { start: 0, end: clip.duration };
    const effDur = t.end - t.start;

    const minDur = 0.2;
    let targetSplitTime = currentTimeRef.current;
    if (targetSplitTime - clip.startTime < minDur) {
      targetSplitTime = clip.startTime + minDur;
    } else if ((clip.startTime + effDur) - targetSplitTime < minDur) {
      targetSplitTime = clip.startTime + effDur - minDur;
    }

    if (targetSplitTime <= clip.startTime || targetSplitTime >= clip.startTime + effDur) {
      return;
    }

    const offset = targetSplitTime - clip.startTime;
    
    if (clip) {
      setMediaItems((prev: any) => {
        const idx = prev.findIndex((p: any) => p.id === id);
        if (idx === -1) return prev;
        const orig = prev[idx];
        
        const leftId = Math.random().toString(36).slice(2);
        const rightId = Math.random().toString(36).slice(2);
        
        const leftClip = { ...orig, id: leftId };
        const rightClip = { ...orig, id: rightId };
        
        const nextStarts = {
          ...clipStartOverrides,
          [leftId]: clip.startTime,
          [rightId]: targetSplitTime,
        };

        const nextTracks = {
          ...clipTrackOverrides,
          [leftId]: clip.trackId,
          [rightId]: clip.trackId,
        };

        const nextTrimRanges = {
          ...clipTrimRanges,
          [leftId]: { start: t.start, end: t.start + offset },
          [rightId]: { start: t.start + offset, end: t.end },
        };

        const nextTransitions = { ...clipTransitions };
        if (clipTransitions[id]) {
          nextTransitions[rightId] = clipTransitions[id];
          delete nextTransitions[id];
        }

        const nextSettings = {
          ...clipSettings,
          [leftId]: clipSettings[id] ? { ...clipSettings[id] } : undefined,
          [rightId]: clipSettings[id] ? { ...clipSettings[id] } : undefined,
        };
        if (id && nextSettings[id]) {
          delete nextSettings[id];
        }

        setClipStartOverrides(nextStarts);
        setClipTrackOverrides(nextTracks);
        setClipTrimRanges(nextTrimRanges);
        if (setClipTransitions) {
          setClipTransitions(nextTransitions);
        }
        if (setClipSettings) {
          setClipSettings(nextSettings);
        }
        
        const next = [...prev];
        next.splice(idx, 1, leftClip, rightClip);

        if (setIsPlaying) {
          setIsPlaying(false);
        }

        if (setActivePreviewId) {
          setActivePreviewId(leftId);
        }

        setSelectedClipIds([leftId]);
        
        saveToUndo(next, nextTransitions, nextTrimRanges, nextStarts, nextTracks, undefined, undefined, nextSettings);
        return next;
      });
    }
  }, [selectedClip, clips,  getTrimRangeForItem, setMediaItems, setClipTrimRanges, saveToUndo, setClipTransitions, setActivePreviewId, setIsPlaying, clipStartOverrides, clipTrackOverrides, clipTrimRanges, clipTransitions, clipSettings, setClipSettings, setClipStartOverrides, setClipTrackOverrides]);

  /* ── Freeze Frame ────────────────────────────────────────────── */
  const handleFreezeFrame = useCallback(() => {
    let targetClip = selectedClip;
    if (!targetClip) {
      const clipsUnderPlayhead = clips.filter(c => !c.isLocked && currentTimeRef.current >= c.startTime && currentTimeRef.current < c.startTime + c.duration);
      if (clipsUnderPlayhead.length > 0) {
        targetClip = clipsUnderPlayhead.find(c => c.type === 'video') || clipsUnderPlayhead[0];
      }
    }

    if (!targetClip) return;
    
    const id = targetClip.id;
    const clip = targetClip;

    const t = getTrimRangeForItem ? getTrimRangeForItem(clip.id, clip.originalDuration ?? clip.duration) : { start: 0, end: clip.duration };
    const effDur = t.end - t.start;

    let targetSplitTime = currentTimeRef.current;
    if (targetSplitTime < clip.startTime) targetSplitTime = clip.startTime;
    if (targetSplitTime > clip.startTime + effDur) targetSplitTime = clip.startTime + effDur;

    const offset = Math.max(0, targetSplitTime - clip.startTime);
    const freezeDuration = 2.0;

    let freezePreview = clip.preview;
    if (videoRef && videoRef.current && videoRef.current.readyState >= 2) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth || 1280;
        canvas.height = videoRef.current.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          freezePreview = canvas.toDataURL("image/png");
        }
      } catch (err) {
        console.warn("Frame capture fallback to clip preview:", err);
      }
    }

    if (clip.type === "video" || clip.type === "image") {
      setMediaItems((prev: any) => {
        const idx = prev.findIndex((p: any) => p.id === id);
        if (idx === -1) return prev;
        const orig = prev[idx];

        const freezeId = `freeze-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const freezeItem = {
          id: freezeId,
          name: `${orig.name || 'Clip'} (Freeze)`,
          type: 'image' as const,
          preview: freezePreview,
          duration: freezeDuration,
          file: orig.file,
        };

        const leftId = `split-left-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const rightId = `split-right-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        const leftClip = { ...orig, id: leftId };
        const rightClip = { ...orig, id: rightId };

        const nextStarts = { ...clipStartOverrides };
        const nextTracks = { ...clipTrackOverrides };
        const nextTrimRanges = { ...clipTrimRanges };
        const nextTransitions = { ...clipTransitions };
        const nextSettings = { ...clipSettings };

        clips.forEach(c => {
          if (c.startTime >= targetSplitTime && c.id !== id) {
            if (isRippleEnabled || c.trackId === clip.trackId) {
              nextStarts[c.id] = (nextStarts[c.id] !== undefined ? nextStarts[c.id] : c.startTime) + freezeDuration;
            }
          }
        });

        nextStarts[leftId] = clip.startTime;
        nextTracks[leftId] = clip.trackId;
        nextTrimRanges[leftId] = { start: t.start, end: t.start + offset };
        if (clipSettings[id]) nextSettings[leftId] = { ...clipSettings[id] };

        nextStarts[freezeId] = targetSplitTime;
        nextTracks[freezeId] = clip.trackId;
        nextTrimRanges[freezeId] = { start: 0, end: freezeDuration };
        if (clipSettings[id]) nextSettings[freezeId] = { ...clipSettings[id] };

        nextStarts[rightId] = targetSplitTime + freezeDuration;
        nextTracks[rightId] = clip.trackId;
        nextTrimRanges[rightId] = { start: t.start + offset, end: t.end };
        if (clipSettings[id]) nextSettings[rightId] = { ...clipSettings[id] };

        if (clipTransitions[id]) {
          nextTransitions[rightId] = clipTransitions[id];
          delete nextTransitions[id];
        }
        if (nextSettings[id]) {
          delete nextSettings[id];
        }

        setClipStartOverrides(nextStarts);
        setClipTrackOverrides(nextTracks);
        setClipTrimRanges(nextTrimRanges);
        if (setClipTransitions) setClipTransitions(nextTransitions);
        if (setClipSettings) setClipSettings(nextSettings);

        const next = [...prev];
        if (offset >= 0.1 && (effDur - offset) >= 0.1) {
          next.splice(idx, 1, leftClip, freezeItem, rightClip);
        } else if (offset < 0.1) {
          next.splice(idx, 0, freezeItem);
        } else {
          next.splice(idx + 1, 0, freezeItem);
        }

        if (setIsPlaying) setIsPlaying(false);
        if (setActivePreviewId) setActivePreviewId(freezeId);
        setSelectedClipIds([freezeId]);

        saveToUndo(next, nextTransitions, nextTrimRanges, nextStarts, nextTracks, undefined, undefined, nextSettings);
        return next;
      });
    }
  }, [selectedClip, clips,  getTrimRangeForItem, videoRef, setMediaItems, setClipTrimRanges, saveToUndo, setClipTransitions, setActivePreviewId, setIsPlaying, clipStartOverrides, clipTrackOverrides, clipTrimRanges, clipTransitions, clipSettings, setClipSettings, setClipStartOverrides, setClipTrackOverrides]);

  /* ── Clip Dragging Interactions ────────────────────────────── */
  const handleClipMouseDown = useCallback((e: React.MouseEvent, clip: Clip) => {
    if (e.button !== 0) return;
    
    const target = e.target as HTMLElement;
    if (target.closest(".trim-handle")) return;

    e.stopPropagation();
    e.preventDefault();
    setContextMenu(null);

    if (setActivePreviewId) {
      setActivePreviewId(clip.id);
    }

    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      setSelectedClipIds(prev =>
        prev.includes(clip.id) ? prev.filter(id => id !== clip.id) : [...prev, clip.id]
      );
    } else if (!selectedClipIds.includes(clip.id)) {
      setSelectedClipIds([clip.id]);
    }

    if (!clip.isLocked) {
      const rect = e.currentTarget.getBoundingClientRect();
      const startOffsetX = e.clientX - rect.left;
      
      setDraggedClip({
        id: clip.id,
        offsetX: startOffsetX,
        initialStartTime: clip.startTime,
        initialTrackId: clip.trackId,
        ghostStartTime: clip.startTime,
        ghostTrackId: clip.trackId,
        type: clip.type
      });

      let dragRafId: number | null = null;
      const onMove = (ev: MouseEvent) => {
        if (dragRafId !== null) return;
        dragRafId = requestAnimationFrame(() => {
          dragRafId = null;
          const crec = canvasRef.current?.getBoundingClientRect();
          if (!crec) return;

          const relativeX = ev.clientX - crec.left + (scrollRef.current?.scrollLeft || 0) - startOffsetX - paddingLeft;
          const targetTime = Math.max(0, relativeX / pixelsPerSecond);
          const snapped = getSnappedTime(targetTime, clip.duration, clip.id);
          
          setSnapGuideX(snapped !== targetTime ? paddingLeft + snapped * pixelsPerSecond : null);
          
          let finalTrackId = clip.trackId;
          if (sidebarTracksRef.current) {
            const sidebarRect = sidebarTracksRef.current.getBoundingClientRect();
            const absoluteMouseY = ev.clientY - sidebarRect.top + sidebarTracksRef.current.scrollTop;
            
            let accumulatedHeight = 32;
            for (const track of tracks) {
              const trackH = track.isCollapsed ? 28 : track.height;
              if (absoluteMouseY >= accumulatedHeight && absoluteMouseY <= accumulatedHeight + trackH) {
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
        });
      };

      const onUp = () => {
        if (dragRafId !== null) cancelAnimationFrame(dragRafId);
        setSnapGuideX(null);
        setDraggedClip(prev => {
          if (prev) {
            const deltaT = prev.ghostStartTime - prev.initialStartTime;
            
            if (handleTimelineClick) {
              handleTimelineClick(prev.ghostStartTime);
            }
            
            setClipStartOverrides((starts: any) => {
              const newStarts = { ...starts, [clip.id]: prev.ghostStartTime };
              // Move linked audio if this is a video
              if (clip.linkedAudioId) {
                const audioStart = starts[clip.linkedAudioId] !== undefined ? starts[clip.linkedAudioId] : clip.startTime;
                newStarts[clip.linkedAudioId] = Math.max(0, audioStart + deltaT);
              }
              // Move linked video if this is an audio
              if (clip.linkedVideoId) {
                const videoStart = starts[clip.linkedVideoId] !== undefined ? starts[clip.linkedVideoId] : clip.startTime;
                newStarts[clip.linkedVideoId] = Math.max(0, videoStart + deltaT);
              }
              return newStarts;
            });
            
            setClipTrackOverrides((tracks: any) => ({ ...tracks, [clip.id]: prev.ghostTrackId }));
            
            if (isMagnetEnabled) {
              setTimeout(() => triggerMagnetRipple(prev.ghostTrackId), 10);
            }
            
            // Move playhead to the newly dropped position using the latest handler
            if (handleTimelineClickRef.current) {
              setTimeout(() => {
                if (handleTimelineClickRef.current) {
                  handleTimelineClickRef.current(prev.ghostStartTime);
                }
              }, 50); // wait for state to propagate
            }
          }
          return null;
        });
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }
  }, [selectedClipIds, pixelsPerSecond, getSnappedTime, tracks, paddingLeft, isMagnetEnabled, setActivePreviewId, setClipStartOverrides, setClipTrackOverrides]);

  /* ── Magnetic Alignment (Ripple editing) ──────────────────── */
  const triggerMagnetRipple = useCallback((trackId: string) => {
    setClipStartOverrides((prev: any) => {
      const trackClips = clips.filter(c => (clipTrackOverrides[c.id] || c.trackId) === trackId && c.id);
      if (trackClips.length === 0) return prev;
      
      // Need to use actual current starts instead of default startTime for sorting
      const sorted = [...trackClips].sort((a, b) => {
        const startA = prev[a.id] !== undefined ? prev[a.id] : a.startTime;
        const startB = prev[b.id] !== undefined ? prev[b.id] : b.startTime;
        return startA - startB;
      });
      
      const nextStarts = { ...prev };
      let nextStart = 0;
      
      sorted.forEach(c => {
        const currentStart = prev[c.id] !== undefined ? prev[c.id] : c.startTime;
        const deltaT = nextStart - currentStart;
        
        nextStarts[c.id] = nextStart;
        
        if (c.linkedAudioId && deltaT !== 0) {
          const audioStart = prev[c.linkedAudioId] !== undefined ? prev[c.linkedAudioId] : (clips.find(x => x.id === c.linkedAudioId)?.startTime ?? 0);
          nextStarts[c.linkedAudioId] = Math.max(0, audioStart + deltaT);
        }
        if (c.linkedVideoId && deltaT !== 0) {
          const videoStart = prev[c.linkedVideoId] !== undefined ? prev[c.linkedVideoId] : (clips.find(x => x.id === c.linkedVideoId)?.startTime ?? 0);
          nextStarts[c.linkedVideoId] = Math.max(0, videoStart + deltaT);
        }
        
        const trim = getTrimRangeForItem ? getTrimRangeForItem(c.id, c.originalDuration ?? c.duration) : { start: 0, end: c.duration };
        const effDur = trim.end - trim.start;
        nextStart += effDur;
      });
      
      return nextStarts;
    });
  }, [clips, clipTrackOverrides, setClipStartOverrides]);

  const prevMediaItemsCount = useRef(mediaItems.length);
  useEffect(() => {
    if (mediaItems.length < prevMediaItemsCount.current && isMagnetEnabled) {
      setTimeout(() => triggerMagnetRipple("video-1"), 50);
    }
    prevMediaItemsCount.current = mediaItems.length;
  }, [mediaItems.length, isMagnetEnabled, triggerMagnetRipple]);

  /* ── Trim Edge Handles ─────────────────────────────────────── */
  const handleTrimMouseDown = useCallback((e: React.MouseEvent, clipId: string, edge: "left" | "right", itemDuration: number, initStartTime: number) => {
    e.stopPropagation();
    e.preventDefault();
    const initTrim = getTrimRangeForItem(clipId, itemDuration);
    const startX = e.clientX;

    const snapThr = 10 / pixelsPerSecond;
    const snapCandidates: number[] = [currentTimeRef.current];
    clips.forEach(c => {
      if (c.id !== clipId) {
        snapCandidates.push(c.startTime, c.startTime + c.duration);
      }
    });

    let trimRafId: number | null = null;

    const clip = clips.find(c => c.id === clipId);

    const onMove = (ev: MouseEvent) => {
      if (trimRafId !== null) return;
      trimRafId = requestAnimationFrame(() => {
        trimRafId = null;
        const dx = ev.clientX - startX;
        const dt = dx / pixelsPerSecond;
        
        if (edge === "left") {
          let v = Math.max(0, Math.min(initTrim.end - 0.2, initTrim.start + dt));
          let globalTime = initStartTime + (v - initTrim.start);
          if (isSnapEnabled) {
            snapCandidates.forEach(cand => {
              if (Math.abs(globalTime - cand) < snapThr) {
                const delta = cand - globalTime;
                v += delta;
                globalTime = cand;
                setSnapGuideX(paddingLeft + cand * pixelsPerSecond);
              }
            });
          } else {
            setSnapGuideX(null);
          }
          const actualDt = v - initTrim.start;
          
          setClipTrimRanges((prev: any) => {
            const next = { ...prev, [clipId]: { start: v, end: initTrim.end } };
            if (clip?.linkedAudioId) next[clip.linkedAudioId] = next[clipId];
            if (clip?.linkedVideoId) next[clip.linkedVideoId] = next[clipId];
            return next;
          });
          setClipStartOverrides((prev: any) => {
            const next = { ...prev, [clipId]: initStartTime + actualDt };
            if (clip?.linkedAudioId) {
              const audioStart = prev[clip.linkedAudioId] !== undefined ? prev[clip.linkedAudioId] : initStartTime;
              next[clip.linkedAudioId] = audioStart + actualDt;
            }
            if (clip?.linkedVideoId) {
              const videoStart = prev[clip.linkedVideoId] !== undefined ? prev[clip.linkedVideoId] : initStartTime;
              next[clip.linkedVideoId] = videoStart + actualDt;
            }
            return next;
          });
          if (videoRef && videoRef.current && videoRef.current.readyState >= 2) {
            videoRef.current.currentTime = v;
          }
        } else {
          let v = Math.max(initTrim.start + 0.2, Math.min(itemDuration, initTrim.end + dt));
          let globalTime = initStartTime + (v - initTrim.start);
          if (isSnapEnabled) {
            snapCandidates.forEach(cand => {
              if (Math.abs(globalTime - cand) < snapThr) {
                const delta = cand - globalTime;
                v += delta;
                setSnapGuideX(paddingLeft + cand * pixelsPerSecond);
              }
            });
          } else {
            setSnapGuideX(null);
          }
          setClipTrimRanges((prev: any) => {
            const next = { ...prev, [clipId]: { start: initTrim.start, end: v } };
            if (clip?.linkedAudioId) next[clip.linkedAudioId] = next[clipId];
            if (clip?.linkedVideoId) next[clip.linkedVideoId] = next[clipId];
            return next;
          });
          if (videoRef && videoRef.current && videoRef.current.readyState >= 2) {
            videoRef.current.currentTime = v;
          }
        }
      });
    };
    const onUp = () => {
      if (trimRafId !== null) cancelAnimationFrame(trimRafId);
      setSnapGuideX(null);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      
      setClipTrimRanges((prev: any) => {
        if (saveToUndo) {
          saveToUndo(mediaItems, undefined, prev);
        }
        return prev;
      });

      if (isMagnetEnabled) {
        setTimeout(() => {
          const trackId = clipTrackOverrides[clipId] || clips.find(c => c.id === clipId)?.trackId || "video-1";
          triggerMagnetRipple(trackId);
        }, 10);
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [pixelsPerSecond, getTrimRangeForItem, setClipTrimRanges, setClipStartOverrides, saveToUndo, mediaItems,  clips, isSnapEnabled, paddingLeft, videoRef]);

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
      
      let offsetY = 32;
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
    setClipTrackOverrides((prev: any) => ({ ...prev, [newClipId]: trackId }));
    setClipStartOverrides((prev: any) => ({ ...prev, [newClipId]: dropTime }));
    if (handleAddAssetToTimeline) {
      handleAddAssetToTimeline(assetId, newClipId);
    }
  }, [handleAddAssetToTimeline, setClipStartOverrides, setClipTrackOverrides]);

  /* ── Audio Separation / Detachment ─────────────────────────── */
  const handleSeparateAudio = useCallback((clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip || clip.type !== "video") return;

    const detachedAudioId = `audio-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newAudioTrackItem = {
      id: detachedAudioId,
      name: `${clip.name} (Audio)`,
      type: "extracted" as const,
      file: clip.file,
      duration: clip.duration,
    };

    if (setAudioTracks) {
      setAudioTracks((prev: any) => [...prev, newAudioTrackItem]);
    }

    setClipStartOverrides((prev: any) => ({
      ...prev,
      [detachedAudioId]: clip.startTime,
    }));

    setClipTrackOverrides((prev: any) => ({
      ...prev,
      [detachedAudioId]: "audio-1",
    }));

    if (setClipSettings) {
      setClipSettings((prev: any) => ({
        ...prev,
        [clip.id]: {
          ...(prev[clip.id] || {}),
          isMuted: true,
          volume: 0,
        },
      }));
    }

    setSelectedClipIds([detachedAudioId]);
    if (setActivePreviewId) setActivePreviewId(detachedAudioId);
  }, [clips, setAudioTracks, setClipStartOverrides, setClipTrackOverrides, setClipSettings, setActivePreviewId]);

  /* ── Track Expansion ───────────────────────────────────────── */
  const toggleTrackExpand = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        const newExpanded = !t.isExpanded;
        const defaultH = t.type === "video" ? 80 : t.type === "audio" ? 60 : 48;
        const expandedH = t.type === "video" ? 140 : t.type === "audio" ? 105 : 76;
        return {
          ...t,
          isExpanded: newExpanded,
          height: newExpanded ? expandedH : defaultH,
        };
      }
      return t;
    }));
  }, []);

  const [areAllTracksExpanded, setAreAllTracksExpanded] = useState(false);
  const toggleExpandAllTracks = useCallback(() => {
    setAreAllTracksExpanded(prev => {
      const nextState = !prev;
      setTracks(trks => trks.map(t => {
        const defaultH = t.type === "video" ? 80 : t.type === "audio" ? 60 : 48;
        const expandedH = t.type === "video" ? 140 : t.type === "audio" ? 105 : 76;
        return {
          ...t,
          isExpanded: nextState,
          height: nextState ? expandedH : defaultH,
        };
      }));
      return nextState;
    });
  }, []);

  /* ── Track Height Resizer ──────────────── */
  const handleTrackResizeMouseDown = useCallback((e: React.MouseEvent, trackId: string, initialHeight: number) => {
    e.stopPropagation();
    e.preventDefault();
    const startY = e.clientY;
    let rafId: number | null = null;
    let pendingHeight = initialHeight;

    const onMove = (ev: MouseEvent) => {
      const deltaY = ev.clientY - startY;
      pendingHeight = Math.max(32, Math.min(240, initialHeight + deltaY));
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setTracks(prev => prev.map(t => t.id === trackId ? { ...t, height: pendingHeight, isExpanded: pendingHeight > 90 } : t));
      });
    };

    const onUp = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  /* ── Track helpers ─────────────────────────────────────────── */
  const toggleLock     = useCallback((id: string) => setTracks(p => p.map(t => t.id === id ? { ...t, isLocked:   !t.isLocked   } : t)), []);
  const toggleHide     = useCallback((id: string) => setTracks(p => p.map(t => t.id === id ? { ...t, isHidden:   !t.isHidden   } : t)), []);
  const toggleSolo     = useCallback((id: string) => setTracks(p => p.map(t => t.id === id ? { ...t, isSolo:     !t.isSolo     } : t)), []);
  const toggleMute     = useCallback((id: string) => setTracks(p => p.map(t => t.id === id ? { ...t, isMuted:    !t.isMuted    } : t)), []);
  const toggleCollapse = useCallback((id: string) => setTracks(p => p.map(t => t.id === id ? { ...t, isCollapsed:!t.isCollapsed} : t)), []);

  const handleDeleteTrack = useCallback((trackId: string) => {
    setTracks(p => p.filter(t => t.id !== trackId));
    setClipTrackOverrides((prev: any) => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        if (updated[k] === trackId) delete updated[k];
      });
      return updated;
    });
  }, [setClipTrackOverrides]);

  /* ── Clipboard operations ──────────────────────────────────── */
  const handleCopy = useCallback(() => {
    setClipboard(clips.filter(c => selectedClipIds.includes(c.id)));
  }, [clips, selectedClipIds]);

  const handlePaste = useCallback(() => {
    if (!clipboard.length) return;
    const t = currentTimeRef.current;
    clipboard.forEach(c => {
      const newId = Math.random().toString(36).slice(2);
      setClipStartOverrides((prev: any) => ({ ...prev, [newId]: t }));
      setClipTrackOverrides((prev: any) => ({ ...prev, [newId]: c.trackId }));
      setClipNameOverrides((prev: any) => ({ ...prev, [newId]: `${c.name} (Copy)` }));
      
      if (c.type === "video" || c.type === "image") {
        setMediaItems((prev: any) => [...prev, { ...c, id: newId }]);
      }
    });
  }, [clipboard,  setMediaItems, setClipStartOverrides, setClipTrackOverrides, setClipNameOverrides]);

  const handleDuplicate = useCallback((clipId: string) => {
    const c = clips.find(x => x.id === clipId);
    if (!c) return;
    const newId = Math.random().toString(36).slice(2);
    setClipStartOverrides((prev: any) => ({ ...prev, [newId]: c.startTime + c.duration }));
    setClipTrackOverrides((prev: any) => ({ ...prev, [newId]: c.trackId }));
    
    if (c.type === "video" || c.type === "image") {
      setMediaItems((prev: any) => [...prev, { ...c, id: newId }]);
    }
  }, [clips, setMediaItems, setClipStartOverrides, setClipTrackOverrides]);

  const handleReplaceClip = useCallback((clipId: string) => {
    if (!setMediaItems) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*,image/*";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith("video");
      
      setMediaItems((prev: any) => prev.map((p: any) => {
        if (p.id === clipId) {
          return {
            ...p,
            name: file.name,
            preview: url,
            file: file,
            type: isVideo ? "video" : "image"
          };
        }
        return p;
      }));
      
      if (isVideo) {
        const video = document.createElement("video");
        video.src = url;
        video.onloadedmetadata = () => {
          setMediaItems((prev: any) => prev.map((p: any) => {
            if (p.id === clipId) {
              return { ...p, duration: video.duration };
            }
            return p;
          }));
        };
      }
    };
    input.click();
  }, [setMediaItems]);

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
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
        e.preventDefault();
        if (e.shiftKey) {
          if (redo) redo();
        } else {
          if (undo) undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyY") {
        e.preventDefault();
        if (redo) redo();
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

  useEffect(() => {
    const onSplit = () => handleSplitClip();
    const onFreeze = () => handleFreezeFrame();
    window.addEventListener("trigger-timeline-split", onSplit);
    window.addEventListener("trigger-timeline-freeze", onFreeze);
    return () => {
      window.removeEventListener("trigger-timeline-split", onSplit as EventListener);
      window.removeEventListener("trigger-timeline-freeze", onFreeze as EventListener);
    };
  }, [handleSplitClip, handleFreezeFrame]);

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
      <div className="h-11 flex-none border-b border-white/10 bg-[#0e0f17] px-4 flex items-center justify-between z-30 shrink-0 select-none">
        {/* Left Side: Undo / Redo */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => undo && undo()}
            disabled={!undo}
            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => redo && redo()}
            disabled={!redo}
            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Step Back, Play/Pause, Step Forward */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleTimelineClick && handleTimelineClick(Math.max(0 - 1))}
            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Previous Frame / Step Back"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying && setIsPlaying(!isPlaying)}
            className="p-2 rounded-full bg-white text-black hover:bg-slate-200 transition-transform active:scale-95 shadow-md flex items-center justify-center"
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </button>
          <button
            onClick={() => handleTimelineClick && handleTimelineClick(Math.min(totalDuration + 1))}
            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Next Frame / Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right Side: Snap, Ripple, Settings, Preview, Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSnapEnabled((p: boolean) => !p)}
            className={`p-1.5 rounded-md transition-colors ${isSnapEnabled ? "text-purple-400 bg-purple-500/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            title="Magnet / Snap to Grid"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsRippleEnabled((p: boolean) => !p)}
            className={`p-1.5 rounded-md transition-colors ${isRippleEnabled ? "text-purple-400 bg-purple-500/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            title="Auto Ripple Editing"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={toggleExpandAllTracks}
            className={`p-1.5 rounded-md transition-colors ${areAllTracksExpanded ? "text-purple-400 bg-purple-500/10 border border-purple-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            title={areAllTracksExpanded ? "Compact All Tracks" : "Expand All Tracks (High Detail)"}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Track Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Full Canvas View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <Divider />

          <div className="flex items-center gap-1.5">
            <button onClick={() => handleZoom("out")} className="p-1 rounded text-slate-400 hover:text-white transition-colors" title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range" min="6" max="300" value={pixelsPerSecond}
              onChange={e => handleSliderZoom(Number(e.target.value))}
              className="w-20 accent-slate-200 h-1 bg-white/20 rounded-full cursor-pointer"
            />
            <button onClick={() => handleZoom("in")} className="p-1 rounded text-slate-400 hover:text-white transition-colors" title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTimelineSize && setTimelineSize((p: string) => p === "minimized" ? "normal" : "minimized")}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              title="Toggle Timeline Size"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════ MAIN TIMELINE AREA ═══════════════════ */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">

        {/* ────────── SIDEBAR (Track Controls) ────────── */}
        <div
          className="flex-none flex flex-col border-r border-white/5 bg-[#080911] z-20 shrink-0 overflow-y-hidden"
          style={{ width: SIDEBAR_W }}
        >
          {/* Ruler header gap spacer */}
          <div className="h-8 shrink-0 border-b border-white/5 flex items-center justify-between px-3 bg-[#0b0c15]">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Tracks</span>
            <button
              onClick={toggleExpandAllTracks}
              className="text-[9px] font-bold uppercase text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              title="Toggle Expand All Tracks"
            >
              {areAllTracksExpanded ? <Minimize2 className="w-2.5 h-2.5" /> : <Maximize2 className="w-2.5 h-2.5" />}
              <span>{areAllTracksExpanded ? "Compact" : "Expand"}</span>
            </button>
          </div>

          {/* Track Headers */}
          <div ref={sidebarTracksRef} className="flex-1 overflow-hidden flex flex-col">
            {tracks.map((track) => {
              const h = track.isCollapsed ? 28 : track.height;
              const isVideo = track.type === "video";
              const isImage = track.type === "image";
              const isAudio = track.type === "audio";
              const isText = track.type === "text";

              return (
                <div
                  key={track.id}
                  onContextMenu={(e) => handleTrackContextMenu(e, track.id)}
                  className="relative flex items-center justify-between px-2 border-b border-white/5 bg-[#0e0f17] hover:bg-white/[0.02] transition-colors shrink-0"
                  style={{ height: h }}
                >
                  <div className="flex items-center gap-1">


                    <div className="flex items-center gap-0.5">
                      {isVideo ? (
                        <button
                          onClick={handleAddVideo}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors flex items-center justify-center"
                          title="Add Video Track"
                        >
                          <Film className="w-3 h-3 text-slate-300" />
                          <Plus className="w-2 h-2 -ml-0.5 text-slate-400 font-bold" />
                        </button>
                      ) : isImage ? (
                        <button
                          onClick={handleAddImage}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors flex items-center justify-center"
                          title="Add Image Track"
                        >
                          <ImageIcon className="w-3 h-3 text-slate-300" />
                          <Plus className="w-2 h-2 -ml-0.5 text-slate-400 font-bold" />
                        </button>
                      ) : isAudio ? (
                        <button
                          onClick={handleAddAudio}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors flex items-center justify-center"
                          title="Add Audio Track"
                        >
                          <Music className="w-3 h-3 text-slate-300" />
                          <Plus className="w-2 h-2 -ml-0.5 text-slate-400 font-bold" />
                        </button>
                      ) : isText ? (
                        <button
                          onClick={() => { setLeftTab && setLeftTab('titles'); setActiveTool && setActiveTool('text-tool'); }}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors flex items-center justify-center"
                          title="Add Text Track"
                        >
                          <Type className="w-3 h-3 text-slate-300" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddAssetToTimeline && handleAddAssetToTimeline()}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors flex items-center justify-center"
                          title="Add Overlay Track"
                        >
                          <Shuffle className="w-3 h-3 text-slate-300" />
                          <Plus className="w-2 h-2 -ml-0.5 text-slate-400 font-bold" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <TrackBtn onClick={(e) => { e.stopPropagation(); toggleLock(track.id); }} title={track.isLocked ? "Unlock Track" : "Lock Track"}>
                      {track.isLocked ? <Lock className="w-3 h-3 text-rose-400" /> : <Unlock className="w-3 h-3 text-slate-400" />}
                    </TrackBtn>
                                        <TrackBtn onClick={(e) => { e.stopPropagation(); if(onCropTrack) onCropTrack(track.id); }} title="Crop Track">
                      <Crop className="w-3 h-3 text-slate-400" />
                    </TrackBtn>
                    <TrackBtn onClick={(e) => { e.stopPropagation(); toggleHide(track.id); }} title={track.isHidden ? "Show Track" : "Hide Track"}>
                      {track.isHidden ? <EyeOff className="w-3 h-3 text-slate-500" /> : <Eye className="w-3 h-3 text-slate-400" />}
                    </TrackBtn>
                    <TrackBtn onClick={(e) => { e.stopPropagation(); toggleSolo(track.id); }} title={track.isSolo ? "Unsolo" : "Solo Track"} active={track.isSolo}>
                      <Activity className={`w-3 h-3 ${track.isSolo ? "text-yellow-400" : "text-slate-400"}`} />
                    </TrackBtn>
                    <TrackBtn onClick={(e) => { e.stopPropagation(); toggleMute(track.id); }} title={track.isMuted ? "Unmute" : "Mute"}>
                      {track.isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-slate-400" />}
                    </TrackBtn>
                    <div className="w-px h-3 bg-white/10 mx-0.5" />
                    <TrackBtn 
                      onClick={(e) => { e.stopPropagation(); toggleTrackExpand(track.id); }} 
                      title={track.isExpanded ? "Compact Track Height" : "Expand Track Height (High Detail)"}
                      active={track.isExpanded}
                    >
                      {track.isExpanded ? <Minimize2 className="w-3 h-3 text-purple-400" /> : <Maximize2 className="w-3 h-3 text-slate-400" />}
                    </TrackBtn>
                  </div>

                  <div
                    onMouseDown={(e) => handleTrackResizeMouseDown(e, track.id, h)}
                    className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-purple-500/80 z-30 transition-colors group/resize"
                    title="Click and drag mouse up/down to expand track height"
                  >
                    <div className="w-8 h-1 bg-purple-400/50 rounded-full mx-auto opacity-0 group-hover/resize:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ────────── SCROLLABLE TIMELINE TRACKS AREA ────────── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto overflow-y-auto bg-[#07080f] min-w-0 relative will-change-scroll"
          style={{ scrollbarColor: "#1d1e2c transparent", scrollbarWidth: "thin" }}
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
            <div style={{ marginLeft: `${paddingLeft}px`, width: `${canvasWidth}px`, position: "relative", height: "100%" }}>
              
              {/* ─── TIME RULER ─── */}
              <div
                ref={rulerRef}
                onMouseDown={handleRulerMouseDown}
                className="h-8 bg-[#0b0c15] border-b border-white/5 sticky top-0 z-20 cursor-ew-resize overflow-hidden flex items-end select-none"
                style={{ width: canvasWidth }}
              >
                {rulerTicks.map(sec => (
                  <div key={sec} className="absolute bottom-0 pointer-events-none" style={{ left: sec * pixelsPerSecond }}>
                    <div className="w-px h-2.5 bg-white/25" />
                    <span className="absolute bottom-3 text-[9px] font-mono font-medium text-slate-400 -translate-x-1/2 whitespace-nowrap">
                      {String(Math.floor(sec / 60)).padStart(2, "0")}:{String(sec % 60).padStart(2, "0")}
                    </span>
                  </div>
                ))}

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

              {/* ─── TRACK LANES ─── */}
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

                      {/* ─── MEMOIZED VIRTUALIZED CLIPS ─── */}
                      {trackClips.map(clip => {
                        const trim = getTrimRangeForItem ? getTrimRangeForItem(clip.id, clip.originalDuration ?? clip.duration) : { start: 0, end: clip.duration };
                        const effDur = trim.end - trim.start;
                        
                        if (!isClipVisible(clip.startTime, effDur)) return null;

                        const isSelected = selectedClipIds.includes(clip.id);
                        const isDragging = draggedClip?.id === clip.id;
                        const isHovered = hoveredClipId === clip.id;

                        return (
                          <TimelineClipItem
                            key={clip.id}
                            clip={clip}
                            isSelected={isSelected}
                            isDragging={isDragging}
                            isHovered={isHovered}
                            trackH={trackH}
                            pixelsPerSecond={pixelsPerSecond}
                            isZooming={isZooming}
                            isClipMuted={track.isMuted}
                            effDur={effDur}
                            trim={trim}
                            clipSpeed={clipSpeeds[clip.id]}
                            clipReverse={clipReverses[clip.id]}
                            onClipMouseDown={handleClipMouseDown}
                            onDoubleClick={() => setShowPropertiesId(clip.id)}
                            onContextMenu={handleClipContextMenu}
                            onMouseEnter={() => setHoveredClipId(clip.id)}
                            onMouseLeave={() => setHoveredClipId(null)}
                            onSeparateAudio={handleSeparateAudio}
                            onTrimMouseDown={handleTrimMouseDown}
                            onReplaceClip={handleReplaceClip}
                            onToggleLock={(clipId) => setClipLockedStates((prev: any) => ({ ...prev, [clipId]: !prev[clipId] }))}
                            onDuplicate={handleDuplicate}
                            onDeleteClip={handleDeleteClip}
                            setActivePreviewId={setActivePreviewId}
                            setActiveTool={setActiveTool}
                          />
                        );
                      })}

                      {/* ─── TRANSITIONS BETWEEN CLIPS ─── */}
                      {track.type === "video" && (() => {
                        const videoClipsSorted = [...trackClips]
                          .filter(c => c.type === "video" || c.type === "image")
                          .sort((a, b) => {
                            const startA = clipStartOverrides[a.id] !== undefined ? clipStartOverrides[a.id] : a.startTime;
                            const startB = clipStartOverrides[b.id] !== undefined ? clipStartOverrides[b.id] : b.startTime;
                            return startA - startB;
                          });

                        const insertionPoints: any[] = [];
                        if (videoClipsSorted.length > 0) {
                          const firstStart = clipStartOverrides[videoClipsSorted[0].id] !== undefined ? clipStartOverrides[videoClipsSorted[0].id] : videoClipsSorted[0].startTime;
                          insertionPoints.push({
                            id: `start-point`,
                            px: firstStart * pixelsPerSecond,
                            type: 'start',
                            targetId: '__START__',
                            clip: null,
                            nextClip: videoClipsSorted[0]
                          });
                          
                          videoClipsSorted.forEach((clip, index) => {
                            const nextClip = videoClipsSorted[index + 1];
                            const trim = getTrimRangeForItem(clip.id, clip.duration);
                            const effDur = trim.end - trim.start;
                            const actStart = clipStartOverrides[clip.id] !== undefined ? clipStartOverrides[clip.id] : clip.startTime;
                            insertionPoints.push({
                              id: `after-${clip.id}`,
                              px: (actStart + effDur) * pixelsPerSecond,
                              type: nextClip ? 'junction' : 'end',
                              targetId: clip.id,
                              clip: clip,
                              nextClip: nextClip
                            });
                          });
                        }
                        
                        return insertionPoints.map((point) => {
                          const { id, px, type, targetId, clip, nextClip } = point;
                          const hasTransition = type === 'junction' && clip && clipTransitions && clipTransitions[clip.id] && clipTransitions[clip.id] !== "none";
                          const transitionName = hasTransition ? clipTransitions[clip.id] : "";
                          
                          return (
                            <div
                              key={id}
                              className="absolute z-20 flex items-center justify-center pointer-events-auto"
                              style={{
                                left: px,
                                width: 24,
                                top: 6,
                                height: trackH - 12,
                                transform: "translateX(-50%)",
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (type === 'junction' && clip && nextClip) {
                                    window.dispatchEvent(new CustomEvent('open-transition-editor', { detail: { targetId: clip.id, nextId: nextClip.id } }));
                                  } else {
                                    setInsertMenuTargetId(prev => prev === id ? null : id);
                                  }
                                }}
                                type="button"
                                title={hasTransition ? `Transition: ${transitionName} (Click to edit)` : type === 'junction' ? "Add Transition" : "Add Media"}
                                className={`w-5 h-5 rounded-[4px] flex items-center justify-center transition-all duration-200 shadow-md hover:scale-110 cursor-pointer z-50
                                  ${hasTransition 
                                    ? "bg-teal-500 text-white border-2 border-teal-300 shadow-[0_0_8px_rgba(20,184,166,0.5)]" 
                                    : "bg-white text-black border border-black/10 hover:bg-slate-100"
                                  }`}
                              >
                                {hasTransition ? (
                                  <span className="text-[10px]">✨</span>
                                ) : (
                                  <Plus className="w-4 h-4 font-bold" />
                                )}
                              </button>
                              
                              {insertMenuTargetId === id && !hasTransition && (
                                <div 
                                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[#111322] border border-white/10 rounded-xl shadow-2xl p-2 w-[180px] z-[100] flex flex-col gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[6px] border-transparent border-t-[#111322] z-10" />
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[7px] border-transparent border-t-white/10 z-0" />

                                  {type === 'junction' && clip && nextClip ? (
                                      <button onClick={() => { setInsertMenuTargetId(null); window.dispatchEvent(new CustomEvent('open-transition-editor', { detail: { targetId: clip.id, nextId: nextClip.id } })); }} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                                        <Shuffle className="w-3.5 h-3.5 text-teal-400" />
                                        Add Transition
                                      </button>
                                  ) : (
                                      <>
                                          <button onClick={() => { setInsertMenuTargetId(null); window.dispatchEvent(new CustomEvent('insert-media-at', { detail: { targetId: targetId, type: 'video' } })); }} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                                            <Film className="w-3.5 h-3.5 text-blue-400" />
                                            Add Video
                                          </button>
                                          <button onClick={() => { setInsertMenuTargetId(null); window.dispatchEvent(new CustomEvent('insert-media-at', { detail: { targetId: targetId, type: 'image' } })); }} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                                            <ImageIcon className="w-3.5 h-3.5 text-green-400" />
                                            Add Image
                                          </button>
                                          <button onClick={() => { setInsertMenuTargetId(null); window.dispatchEvent(new CustomEvent('insert-media-at', { detail: { targetId: targetId, type: 'audio' } })); }} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                                            <Music className="w-3.5 h-3.5 text-rose-400" />
                                            Add Audio
                                          </button>
                                          <button onClick={() => { setInsertMenuTargetId(null); window.dispatchEvent(new CustomEvent('insert-media-at', { detail: { targetId: targetId, type: 'text' } })); }} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                                            <Type className="w-3.5 h-3.5 text-purple-400" />
                                            Add Text
                                          </button>
                                      </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}

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
        className="absolute top-11 bottom-7 pointer-events-none z-30"
        style={{
          left: `${SIDEBAR_W + viewportWidth / 2}px`,
          transform: "translateX(-50%)",
        }}
      >
        <div className="w-0.5 h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
      </div>

      {/* ═══════════════════ FOOTER STATS ═══════════════════ */}
      <div className="h-8 shrink-0 border-t border-white/5 bg-[#0b0c15] px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <TimeDisplay />
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
              {clips.find(x => x.id === contextMenu.clipId)?.type === "video" && (
                <button
                  onClick={() => {
                    handleUnlinkAudio(contextMenu.clipId);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/15 transition-colors"
                >
                  <FileAudio className="w-3.5 h-3.5 text-purple-400" />
                  Unlink Audio
                </button>
              )}
              <button
                onClick={() => {
                  const c = clips.find(x => x.id === contextMenu.clipId);
                  if (c) {
                    setClipLockedStates((prev: any) => ({ ...prev, [c.id]: !prev[c.id] }));
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
              <button
                onClick={() => { handleFreezeFrame(); setContextMenu(null); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <FreezeIcon className="w-3.5 h-3.5 text-slate-500" />
                Freeze Frame
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
                  setClipNameOverrides((prev: any) => ({ ...prev, [editingClipId]: editingClipName }));
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
