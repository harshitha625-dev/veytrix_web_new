import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Music2,
    Briefcase,
    ArrowLeft,
    Sparkles,
    Wand2,
    History as HistoryIcon,
    Trash2,
    RefreshCw,
    Music,
    Mic,
    Plus,
    Search,
    Filter,
    Monitor,
    Smartphone,
    Play,
    Settings,
    Layers,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Info,
    CheckCircle2,
    Zap,
    Video,
    Image as ImageIcon,
    Maximize2,
    Minimize2,
    Volume2,
    VolumeX,
    X,
    Scissors,
    FileAudio,
    Timer,
    Palette,
    Sparkle,
    Download,
    Copy,
    Type,
    RotateCw,
    Crop,
    ZoomIn,
    MonitorPlay,
    Film,
    Crown,
    Settings2,
    Check,
    CheckCheck,
    SkipBack,
    SkipForward,
    Pause,
    Undo2,
    Redo2,
    ScanLine,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Shuffle,
    Bold,
    Italic,
    FlipHorizontal,
    FlipVertical,
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Share2,
    MoreHorizontal,
    PictureInPicture2,
    Subtitles,
    Edit2,
    Star,
    HelpCircle,
    Upload,
    Sliders,
    Activity,
    Ban,
    Sunrise,
    Wind,
    Vibrate,
    Flashlight,
    Tv,
    Clock3,
    Crosshair,
    Droplets,
    MoveHorizontal,
    MoveRight,
    Square,
    Gauge,
    CircleOff,
    Clapperboard,
    MoonStar,
    Sun,
    Snowflake,
    Contrast,
    Smile,
    Lightbulb,
    Aperture,
    Rewind,
    FastForward,
    ArrowDownUp, Folder
} from "lucide-react";

export const FreezeIcon = ({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <path d="M13 20H6.5A3.5 3.5 0 0 1 3 16.5v-9A3.5 3.5 0 0 1 6.5 4h11A3.5 3.5 0 0 1 21 7.5v5.5" />
        <path d="M6.5 14.5l3.5-3.5 3.5 3.5" />
        <path d="M8.5 7v3M7 8.5h3" />
        <circle cx="15" cy="18" r="1.3" />
        <circle cx="19" cy="18" r="1.3" />
        <path d="M15 16.8l2.2-3" />
        <path d="M19 16.8l-3.2-3.8" />
    </svg>
);

import * as LucideIcons from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { buildApiUrl } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useAspectRatio, PRESET_RATIOS } from "./hooks/useAspectRatio";
import { AspectRatioCard } from "./components/AspectRatioCard";
import { generateThumbnail } from "@/lib/thumbnail";
import { CustomRatioModal } from "./components/CustomRatioModal";
import { SlidersHorizontal } from "lucide-react";
import { TimelineHub } from "./components/TimelineHub";

import { PremiumModal } from "@/components/premium-modal";
import { MusicPickerModal } from "@/components/editor/music-picker-modal";
import { TransitionEditorBottomPanel } from "./components/TransitionEditorBottomPanel";
import { MusicStrip } from "@/components/editor/music-strip";
import { CutoutPanel } from "./components/CutoutPanel";
import { useCutoutMask } from "./hooks/useCutoutMask";
import { useMusicContext } from "@/context/music-context";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { getAllProEffects, getEffectModule } from "../../../../effects/effects";
import { getFilterConfig } from "../../../../filters/professionalFilters";
import { getAllTransitions, getTransition } from "../../../../transitions";

const Youtube = ({ className, size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <polygon points="10 15 15 12 10 9" fill="currentColor" />
    </svg>
);

const Instagram = ({ className, size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);

async function extractAudioFromVideoFile(videoFile: File): Promise<File> {
    if (!videoFile.type.startsWith("video/")) {
        throw new Error("Please select a video file to extract audio from.");
    }

    const objectUrl = URL.createObjectURL(videoFile);
    const video = document.createElement("video");
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Unable to load video file for audio extraction (timeout)."));
        }, 15000);

        video.onloadedmetadata = () => {
            clearTimeout(timeout);
            resolve();
        };
        video.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Unable to load video file for audio extraction."));
        };
    });

    const captureStream = (video as any).captureStream || (video as any).mozCaptureStream;
    if (!captureStream) {
        URL.revokeObjectURL(objectUrl);
        throw new Error("Audio extraction requires browser support for video.captureStream(). Please try a different browser (Chrome, Firefox, or Edge).");
    }

    const stream = captureStream.call(video) as MediaStream;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
        URL.revokeObjectURL(objectUrl);
        throw new Error("No audio track was detected in the selected video. Make sure the video file contains audio.");
    }

    // Find supported MIME type
    let mimeType = "audio/webm";
    const possibleMimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm;codecs=vp9",
        "audio/webm",
        "audio/mp4",
        "audio/mpeg"
    ];

    for (const type of possibleMimeTypes) {
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
        }
    }

    let recorder: MediaRecorder;
    try {
        recorder = new MediaRecorder(stream, { mimeType });
    } catch (error) {
        URL.revokeObjectURL(objectUrl);
        throw new Error(`Failed to initialize audio recorder. Your browser may not support audio recording. ${error instanceof Error ? error.message : ''}`);
    }

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            chunks.push(event.data);
        }
    };

    const recordedBlobPromise = new Promise<Blob>((resolve, reject) => {
        const recordingTimeout = setTimeout(() => {
            reject(new Error("Audio extraction took too long and was cancelled."));
        }, 300000); // 5 minute timeout

        recorder.onstop = () => {
            clearTimeout(recordingTimeout);
            resolve(new Blob(chunks, { type: mimeType }));
        };
        recorder.onerror = (event) => {
            clearTimeout(recordingTimeout);
            reject(new Error(`Audio extraction failed: ${event.error?.message || 'Unknown error'}`));
        };
    });

    recorder.start();
    try {
        await video.play().catch(() => { });
        const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
        if (duration > 0) {
            await new Promise<void>((resolve) => {
                video.onended = () => resolve();
                setTimeout(resolve, duration * 1000 + 500);
            });
        } else {
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    } catch (error) {
        if (recorder.state !== "inactive") {
            recorder.stop();
        }
        URL.revokeObjectURL(objectUrl);
        throw error;
    } finally {
        if (recorder.state !== "inactive") {
            recorder.stop();
        }
        URL.revokeObjectURL(objectUrl);
    }

    const audioBlob = await recordedBlobPromise;
    if (audioBlob.size === 0) {
        throw new Error("Failed to extract audio - the resulting audio file is empty. Please try with a different video.");
    }

    const outputName = `${videoFile.name.replace(/\.[^/.]+$/, "")}.webm`;
    return new File([audioBlob], outputName, { type: audioBlob.type || "audio/webm" });
}

const editingStyles = [
    {
        id: "youtube",
        title: "YouTube Edit",
        description: "Professional vlog style",
        icon: Youtube,
        gradient: "from-red-500/20 to-red-600/20",
        ratio: '16:9'
    },
    {
        id: "instagram",
        title: "Instagram Reel",
        description: "Vertical trendy format",
        icon: Instagram,
        gradient: "from-pink-500/20 to-fuchsia-600/20",
        ratio: '9:16'
    },
    {
        id: "cinematic",
        title: "Cinematic Film",
        description: "Ultra-wide cinematic look",
        icon: Film,
        gradient: "from-purple-500/20 to-fuchsia-600/20",
        ratio: '21:9'
    },
    {
        id: "professional",
        title: "Professional Clean",
        description: "Polished corporate look",
        icon: Briefcase,
        gradient: "from-gray-700/20 to-gray-900/20",
        ratio: '16:9'
    },
];

const textFontOptions = [
    { id: 'rubik', label: 'Rubik', family: 'Rubik, sans-serif' },
    { id: 'abeezee', label: 'ABeeZee', family: 'ABeeZee, sans-serif' },
    { id: 'abel', label: 'Abel', family: 'Abel, sans-serif' },
    { id: 'abril', label: 'Abril Fatface', family: '"Abril Fatface", serif' },
    { id: 'acme', label: 'Acme', family: 'Acme, sans-serif' },
    { id: 'adderley', label: 'ADDERLEY', family: 'Oswald, sans-serif' },
    { id: 'adelia', label: 'adelia', family: '"Dancing Script", cursive' },
    { id: 'advent', label: 'Advent Pro', family: '"Advent Pro", sans-serif' },
    { id: 'akira', label: 'AKIRA EXPANDED', family: '"Archivo Black", sans-serif', letterSpacing: '0.15em', fontWeight: 900 },
    { id: 'alata', label: 'Alata', family: 'Alata, sans-serif' },
];

const CAPTION_LANGUAGES = [
    { id: 'en', label: 'English', name: 'English' },
    { id: 'es', label: 'Spanish', name: 'EspaÃƒÂ±ol' },
    { id: 'fr', label: 'French', name: 'FranÃƒÂ§ais' },
    { id: 'de', label: 'German', name: 'Deutsch' },
    { id: 'it', label: 'Italian', name: 'Italiano' },
    { id: 'pt', label: 'Portuguese', name: 'PortuguÃƒÂªs' },
    { id: 'ja', label: 'Japanese', name: 'Ã¦â€”Â¥Ã¦Å“Â¬Ã¨ÂªÅ¾' },
    { id: 'zh', label: 'Chinese', name: 'Ã¤Â¸Â­Ã¦â€“â€¡' },
    { id: 'ko', label: 'Korean', name: 'Ã­â€¢Å“ÃªÂµÂ­Ã¬â€“Â´' },
    { id: 'ru', label: 'Russian', name: 'ÃÂ Ã‘Æ’Ã‘ÂÃ‘ÂÃÂºÃÂ¸ÃÂ¹' },
    { id: 'ar', label: 'Arabic', name: 'Ã˜Â§Ã™â€žÃ˜Â¹Ã˜Â±Ã˜Â¨Ã™Å Ã˜Â©' },
    { id: 'hi', label: 'Hindi', name: 'Ã Â¤Â¹Ã Â¤Â¿Ã Â¤â€šÃ Â¤Â¦Ã Â¥â‚¬' },
];

const CAPTION_STYLE_PRESETS = [
    { id: 'modern', label: 'Modern', description: 'Clean & Contemporary', fontId: 'sans', fontSize: 36, color: '#FFFFFF', bgEnabled: true, bgColorHex: '#000000', bold: true, italic: false, outline: false, alignment: 'center' as const },
    { id: 'cinematic', label: 'Cinematic', description: 'Film-style subtitles', fontId: 'serif', fontSize: 42, color: '#FFFFFF', bgEnabled: true, bgColorHex: '#1a1a1a', bold: true, italic: false, outline: true, alignment: 'center' as const },
    { id: 'neon', label: 'Neon', description: 'Vibrant & Bold', fontId: 'display', fontSize: 48, color: '#00FF00', bgEnabled: true, bgColorHex: '#000000', bold: true, italic: false, outline: true, alignment: 'center' as const },
    { id: 'retro', label: 'Retro', description: 'Vintage style', fontId: 'vintage', fontSize: 40, color: '#FFD700', bgEnabled: true, bgColorHex: '#663300', bold: true, italic: false, outline: false, alignment: 'center' as const },
    { id: 'comic', label: 'Comic', description: 'Fun & Playful', fontId: 'handwritten', fontSize: 38, color: '#FF00FF', bgEnabled: true, bgColorHex: '#FFFF00', bold: true, italic: true, outline: false, alignment: 'center' as const },
    { id: 'elegant', label: 'Elegant', description: 'Sophisticated', fontId: 'calligraphy', fontSize: 44, color: '#E8D5C4', bgEnabled: false, bgColorHex: '#000000', bold: false, italic: true, outline: false, alignment: 'center' as const },
];

const QUICK_TOOLS = [
    { id: 'media', icon: LucideIcons.Film, label: 'Media' },
    { id: 'audio', icon: LucideIcons.Music, label: 'Audio' },
    { id: 'titles', icon: LucideIcons.Type, label: 'Text' },
    { id: 'captions', icon: LucideIcons.MessageSquare, label: 'Captions' },
    { id: 'transitions', icon: LucideIcons.Layers, label: 'Transitions' },
    { id: 'effects', icon: LucideIcons.Sparkles || LucideIcons.Star, label: 'Effects' },
    { id: 'filters', icon: LucideIcons.SlidersHorizontal || LucideIcons.Palette, label: 'Filters' },
    { id: 'canvas', icon: LucideIcons.RectangleHorizontal || LucideIcons.Square, label: 'Canvas' },
    { id: 'overlay-track', icon: LucideIcons.Shuffle || LucideIcons.Layers, label: 'Overlay' },
    { id: 'split', icon: LucideIcons.Scissors, label: 'Split' },
    { id: 'freeze', icon: FreezeIcon, label: 'Freeze' },
    { id: 'crop', icon: LucideIcons.Crop, label: 'Crop' },
    { id: 'rotate', icon: LucideIcons.RotateCw, label: 'Rotate' },
    { id: 'mirror', icon: LucideIcons.FlipHorizontal, label: 'Mirror' },
    { id: 'flip', icon: LucideIcons.FlipVertical, label: 'Flip' },
    { id: 'bg', icon: LucideIcons.Palette, label: 'Background' },
    { id: 'cutout', icon: LucideIcons.Wand2, label: 'Cutout' },
    { id: 'speed', icon: LucideIcons.Gauge || LucideIcons.Zap, label: 'Speed' },
];

const CLIP_TOOLS = [
    { id: 'split', icon: LucideIcons.Scissors, label: 'Split' },
    { id: 'freeze', icon: FreezeIcon, label: 'Freeze' },
    { id: 'cutout', icon: LucideIcons.Wand2 || LucideIcons.UserMinus, label: 'Cutout' },
    { id: 'speed', icon: LucideIcons.Gauge || LucideIcons.Zap, label: 'Speed' },
    { id: 'crop', icon: LucideIcons.Crop, label: 'Crop' },
    { id: 'rotate', icon: LucideIcons.RotateCw, label: 'Rotate' },
    { id: 'mirror', icon: LucideIcons.FlipHorizontal, label: 'Mirror' },
    { id: 'flip', icon: LucideIcons.FlipVertical, label: 'Flip' },
    { id: 'filters', icon: LucideIcons.SlidersHorizontal || LucideIcons.Sliders, label: 'Filter' },
    { id: 'effects', icon: LucideIcons.Star || LucideIcons.Sparkle, label: 'FX' },
    { id: 'keyframe', icon: LucideIcons.Diamond, label: 'Keyframe' },
    { id: 'replace', icon: LucideIcons.RefreshCw, label: 'Replace' },
    { id: 'extract-audio', icon: LucideIcons.AudioWaveform, label: 'Extract Audio' },
    { id: 'denoise', icon: LucideIcons.Activity, label: 'Denoise' },
    { id: 'auto-captions', icon: LucideIcons.MessageSquareQuote, label: 'Auto Captions' },
    { id: 'reverse', icon: LucideIcons.RotateCcw, label: 'Reverse' },
    { id: 'delete', icon: LucideIcons.Trash2, label: 'Delete' },
];

const CANVAS_PREVIEW_EFFECTS = [
    'green-screen',
    'glitch',
    'motion-tracking',
    'old-tv',
    'soft-glow',
    'retro-film',
    'shake',
    'rgb-split',
    'film-grain',
    'smooth-zoom',
];

const CANVAS_PREVIEW_FILTERS = [
    'vintage',
];

// TimelineHub is now imported from "./components/TimelineHub"

const ClipToolsGrid = memo(({ tools, onToolClick }: any) => (
    <>
        {tools.map((tool: any, index: number) => (
            <button
                key={index}
                onClick={() => onToolClick(tool.id)}
                className={`flex flex-col items-center justify-center gap-1.5 min-w-[48px] transition-all active:scale-95 group opacity-70 hover:opacity-100 shrink-0`}
            >
                <tool.icon className={`w-5 h-5 text-slate-200 group-hover:scale-110 transition-transform`} strokeWidth={2} />
                <span className="text-[10px] font-medium text-slate-300 capitalize whitespace-nowrap tracking-wide">{tool.label}</span>
            </button>
        ))}
    </>
));

const QuickToolsGrid = memo(({ QUICK_TOOLS, activeTool, setActiveTool, copyActiveClip, setExpandedSections, leftTab, setLeftTab }: any) => (
    <>
        {QUICK_TOOLS.map((tool: any, index: number) => {
            const isSelected = leftTab === tool.id;
            return (
                <button
                    key={index}
                    onClick={() => {
                        if (tool.id === 'split') {
                            window.dispatchEvent(new CustomEvent('trigger-timeline-split'));
                            return;
                        }
                        if (tool.id === 'freeze') {
                            window.dispatchEvent(new CustomEvent('trigger-timeline-freeze'));
                            return;
                        }
                        if (tool.id === 'canvas' || tool.id === 'bg') {
                            setInspectorTab('bg');
                            setLeftTab('frames');
                            setIsMediaPoolVisible(true);
                            return;
                        }
                        if (tool.id === 'effects' || tool.id === 'animation') {
                            setLeftTab('effects');
                            setInspectorTab('animation');
                            setIsMediaPoolVisible(true);
                            return;
                        }
                        setLeftTab(tool.id);
                        if (tool.id === 'titles') {
                            setActiveTool('text-tool');
                        } else if (tool.id === 'captions') {
                            setActiveTool('captions');
                        } else if (activeTool === 'text-tool' || activeTool === 'captions') {
                            setActiveTool(null);
                        }
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 min-w-[48px] transition-all active:scale-95 shrink-0 group ${isSelected
                        ? 'opacity-100'
                        : 'opacity-70 hover:opacity-100'
                        }`}
                >
                    <tool.icon className={`w-5 h-5 text-slate-200 group-hover:scale-110 transition-transform`} strokeWidth={2} />
                    <span className="text-[10px] font-medium text-slate-300 capitalize whitespace-nowrap tracking-wide">{tool.label}</span>
                </button>
            );
        })}
    </>
));

const KeyframeButton = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        type="button"
        className={`transition-all duration-150 p-1 cursor-pointer shrink-0 ${
            active ? 'text-[#D946EF] drop-shadow-[0_0_6px_rgba(217,70,239,0.65)] scale-110' : 'text-slate-600 hover:text-slate-400 hover:scale-105'
        }`}
        title="Add Keyframe"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill={active ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2.7 10.3a2.4 2.4 0 0 0 0 3.4l7.9 7.9a2.4 2.4 0 0 0 3.4 0l7.9-7.9a2.4 2.4 0 0 0 0-3.4L14 2.4a2.4 2.4 0 0 0-3.4 0z" />
        </svg>
    </button>
);

const ToolInspector = memo(({
    velocitySpeed,
    setVelocitySpeed,
    motionBlurAmount,
    setMotionBlurAmount,
    shakeStrength,
    setShakeStrength,
    flashIntensity,
    setFlashIntensity,
    rgbSplitAmount,
    setRgbSplitAmount,
    smoothZoomAmount,
    setSmoothZoomAmount,
    filmGrainOpacity,
    setFilmGrainOpacity,
    overlayTextStylePreset,
    setOverlayTextStylePreset,
    getOverlayTextEffectForPreset,
    activeTool,
    setActiveTool,
    selectedFilter,
    setSelectedFilter,
    selectedEffect,
    setSelectedEffect,
    blurAmount,
    setBlurAmount,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    saturation,
    setSaturation,
    slowMotionSpeed,
    setSlowMotionSpeed,
    glitchIntensity,
    setGlitchIntensity,
    animatedText,
    setAnimatedText,
    overlayText,
    setOverlayText,
    overlayFontId,
    setOverlayFontId,
    overlayFontSize,
    setOverlayFontSize,
    overlayColor,
    setOverlayColor,
    overlayPosX,
    setOverlayPosX,
    overlayPosY,
    setOverlayPosY,
    overlayBgEnabled,
    setOverlayBgEnabled,
    overlayBgColorHex,
    setOverlayBgColorHex,
    overlayOpacity, setOverlayOpacity,
    overlayStrokeEnabled, setOverlayStrokeEnabled,
    overlayStrokeColor, setOverlayStrokeColor,
    overlayStrokeOpacity, setOverlayStrokeOpacity,
    overlayShadowEnabled, setOverlayShadowEnabled,
    overlayShadowColor, setOverlayShadowColor,
    overlayShadowOpacity, setOverlayShadowOpacity,
    overlayShadowBlur, setOverlayShadowBlur,
    overlayBgRadius, setOverlayBgRadius,
    overlayBgPaddingX, setOverlayBgPaddingX,
    overlayBgPaddingY, setOverlayBgPaddingY,
    overlayBgOffsetX, setOverlayBgOffsetX,
    overlayBgOffsetY, setOverlayBgOffsetY,
    overlayTextStyleBold, setOverlayTextStyleBold,
    overlayTextStyleItalic, setOverlayTextStyleItalic,
    overlayTextStyleUnderline, setOverlayTextStyleUnderline,
    overlayAlignment, setOverlayAlignment,
    overlayListStyle, setOverlayListStyle,
    overlayCase, setOverlayCase,
    overlayAnchor, setOverlayAnchor,
    overlayTextBoxSetting, setOverlayTextBoxSetting,
    overlayLetterSpacing, setOverlayLetterSpacing,
    overlayLineSpacing, setOverlayLineSpacing,
    overlayAnimationIn, setOverlayAnimationIn,
    overlayAnimationOut, setOverlayAnimationOut,
    overlayAnimationLoop, setOverlayAnimationLoop,
    isTextPlacementMode,
    setIsTextPlacementMode,
    clipTransitions,
    applyTransitionForActiveClip,
    speedValue,
    setSpeedValue,
    activePreviewId,
    activePreviewItem,
    getTrimRangeForItem,
    clipTrimRanges,
    setClipTrimRanges,
    rotationDegrees,
    setRotationDegrees,
    volumeLevel,
    setVolumeLevel,
    isMuted,
    setIsMuted,
    isDenoiseEnabled,
    setIsDenoiseEnabled,
    onApplyToAllVolume,
    cropWidthPct,
    setCropWidthPct,
    cropHeightPct,
    setCropHeightPct,
    cropCenterX,
    setCropCenterX,
    cropCenterY,
    setCropCenterY,
    zoomToolAmount,
    setZoomToolAmount,
    keyframeMode,
    setKeyframeMode,
    keyframeAmount,
    setKeyframeAmount,
    videoRef,
    captions,
    setCaptions,
    currentCaption,
    setCurrentCaption,
    captionLanguage,
    setCaptionLanguage,
    captionStyle,
    setCaptionStyle,
    captionStylePreset,
    setCaptionStylePreset,
    isCaptionPlacementMode,
    setIsCaptionPlacementMode,
    detectSpeakers,
    setDetectSpeakers,
    handleAutoCaption,
    isAutoCapturing,
    autoCaptionStatus,
    proParams,
    setProParams,
    saveToUndo,
    mediaItems,
    clipSettings,
    setClipSettings,
}: any) => {
    const [captionTab, setCaptionTab] = useState<'list' | 'style'>('style');
    const [newCaptionText, setNewCaptionText] = useState('');
    const [localCategory, setLocalCategory] = useState('all');
    const [localFilterCategory, setLocalFilterCategory] = useState('all');
    const [newCaptionStart, setNewCaptionStart] = useState(0);
    const [newCaptionEnd, setNewCaptionEnd] = useState(3);
    const [textSubTab, setTextSubTab] = useState<'content' | 'fonts' | 'styles' | 'color' | 'align' | 'spacing' | 'transform' | 'animation'>('content');

    switch (activeTool) {
        case 'filters': {
            const proEffects = getAllProEffects();
            const proFilters = proEffects.filter(eff => eff.id.startsWith('pro-filter-'));
            const filteredFilters = localFilterCategory === 'all'
                ? proFilters
                : proFilters.filter(eff => eff.name.startsWith(localFilterCategory + ' v'));

            return (
                <div className="space-y-3 flex flex-col min-h-0">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5 shrink-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Filters</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Color Presets</span>
                    </div>

                    {/* Filter Category Selector Chips */}
                    <div className="flex gap-1.5 overflow-x-auto pb-2 shrink-0 scrollbar-none">
                        {['all', 'Basic', 'Cinematic', 'Vintage', 'Retro', 'Film', 'HDR', 'LUT', 'Black & White', 'Sepia', 'Neon', 'Cyberpunk', 'Dream', 'Glow', 'Matte', 'Moody', 'Warm', 'Cool', 'Teal & Orange', 'Golden Hour', 'Sunset', 'Night', 'RGB', 'VHS', 'CRT', 'Glitch', 'Grain', 'Blur', 'Sharpen', 'Portrait', 'Beauty', 'Landscape', 'Nature', 'Food', 'Travel', 'Wedding', 'Fashion', 'Sports', 'Gaming', 'Social', 'Artistic', '3D', 'Hollywood', 'IMAX', 'Netflix', 'Kodak', 'Fujifilm', 'ARRI', 'RED', 'Sony Cinema', 'Blackmagic', 'Seasons', 'Ocean', 'Forest', 'Desert', 'Aurora', 'Galaxy', 'Space', 'Synthwave', 'Vaporwave', 'Luxury', 'Diamond', 'Gold', 'Crystal', 'Anime', 'Comic', 'Oil Painting', 'Watercolor', 'Sketch', 'Documentary', 'Analog', 'Sci-Fi'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setLocalFilterCategory(cat)}
                                type="button"
                                className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                                    localFilterCategory === cat
                                        ? 'bg-purple-500/20 border-purple-500/60 text-purple-200'
                                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-[12px] max-h-[300px] overflow-y-auto pr-2 pb-4 scrollbar-thin">
                        {localFilterCategory === 'all' && (
                            <button
                                onClick={() => {
                                    setSelectedFilter('none');
                                    setSelectedEffect('none');
                                }}
                                type="button"
                                className={`flex flex-col items-center justify-center w-full h-[95px] rounded-[20px] backdrop-blur-[20px] transition-all duration-300 group ${
                                    selectedFilter === 'none' && selectedEffect === 'none'
                                        ? 'bg-gradient-to-b from-[rgba(168,85,247,0.18)] to-[rgba(124,58,237,0.08)] border border-[#A855F7] shadow-[0_0_25px_rgba(168,85,247,0.35)] scale-[1.03]'
                                        : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:-translate-y-[4px] hover:scale-[1.04] hover:border-[#A855F7] hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer'
                                }`}
                            >
                                <Ban size={28} className="text-[#B794F4]" />
                                <span className="mt-[12px] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-center leading-tight px-2 text-white/90">No Filter</span>
                            </button>
                        )}

                        {filteredFilters.map((eff) => {
                            const isActive = selectedFilter === eff.id || selectedEffect === eff.id;
                            const Icon = eff.icon || Sparkles;
                            return (
                                <button
                                    key={eff.id}
                                    onClick={() => {
                                        setSelectedFilter(eff.id as any);
                                        setSelectedEffect(eff.id);
                                        setProParams(eff.defaultParameters || {});
                                    }}
                                    type="button"
                                    className={`relative flex flex-col items-center justify-center w-full h-[95px] rounded-[20px] backdrop-blur-[20px] transition-all duration-300 group overflow-hidden ${isActive
                                        ? 'bg-gradient-to-b from-[rgba(168,85,247,0.18)] to-[rgba(124,58,237,0.08)] border border-[#A855F7] shadow-[0_0_25px_rgba(168,85,247,0.35)] scale-[1.03]'
                                        : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:-translate-y-[4px] hover:scale-[1.04] hover:border-[#A855F7] hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer'
                                        }`}
                                >
                                    {eff.thumbnail && (
                                        <div className="absolute inset-0 w-full h-full pointer-events-none">
                                            <img src={eff.thumbnail} className="w-full h-full object-cover opacity-20 group-hover:opacity-35 transition-opacity duration-300" alt="" />
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/85" />
                                        </div>
                                    )}
                                    <Icon
                                        size={28}
                                        strokeWidth={2.2}
                                        className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-[#FFD84D]' : 'text-[#B794F4] group-hover:drop-shadow-[0_0_8px_rgba(183,148,244,0.8)]'
                                            }`}
                                    />
                                    <span className={`relative z-10 mt-[12px] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-center leading-tight px-2 line-clamp-2 ${isActive ? 'text-white' : 'text-white/90'
                                        }`}>
                                        {eff.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {selectedEffect && selectedEffect.startsWith('pro-filter-') && (() => {
                        const effectModule = getEffectModule(selectedEffect);
                        if (!effectModule) return null;
                        return (
                            <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-2.5">
                                {effectModule.adjustableParameters.map((param: any) => {
                                    const paramValue = proParams[param.key] ?? effectModule.defaultParameters[param.key];
                                    return (
                                        <div key={param.key}>
                                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">
                                                <span>{param.name}</span>
                                                <span>{typeof paramValue === 'number' ? paramValue.toFixed(param.step && param.step < 1 ? 2 : 0) : String(paramValue)}</span>
                                            </div>
                                            {param.type === 'number' && (
                                                <input
                                                    type="range"
                                                    min={param.min ?? 0}
                                                    max={param.max ?? 100}
                                                    step={param.step ?? 1}
                                                    value={paramValue}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setProParams((prev: any) => ({
                                                            ...prev,
                                                            [param.key]: val
                                                        }));
                                                    }}
                                                    className="w-full accent-purple-400"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            );
        }
        case 'effects':
            return (
                <div className="space-y-3 flex flex-col min-h-0">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5 shrink-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Effects</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Visual FX</span>
                    </div>

                    {/* Category Selector Chips */}
                    <div className="flex gap-1.5 overflow-x-auto pb-2 shrink-0 scrollbar-none">
                        {['all', 'camera', 'blur', 'glitch', 'cinematic', 'distortion', 'motion', 'light', 'retro'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setLocalCategory(cat)}
                                type="button"
                                className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                                    localCategory === cat
                                        ? 'bg-purple-500/20 border-purple-500/60 text-purple-200'
                                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-[12px] max-h-[300px] overflow-y-auto pr-2 pb-4 scrollbar-thin">
                        {localCategory === 'all' && (
                            <button
                                onClick={() => setSelectedEffect('none')}
                                type="button"
                                className={`flex flex-col items-center justify-center w-full h-[95px] rounded-[20px] backdrop-blur-[20px] transition-all duration-300 group ${selectedEffect === 'none'
                                    ? 'bg-gradient-to-b from-[rgba(168,85,247,0.18)] to-[rgba(124,58,237,0.08)] border border-[#A855F7] shadow-[0_0_25px_rgba(168,85,247,0.35)] scale-[1.03]'
                                    : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:-translate-y-[4px] hover:scale-[1.04] hover:border-[#A855F7] hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer'
                                    }`}
                            >
                                <Ban size={28} className="text-[#B794F4]" />
                                <span className="mt-[12px] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-center leading-tight px-2 text-white/90">No Effect</span>
                            </button>
                        )}

                        {(() => {
                            const proEffects = getAllProEffects();
                            const filteredProEffects = localCategory === 'all'
                                ? proEffects
                                : proEffects.filter(eff => eff.category === localCategory);
                            return filteredProEffects.map((eff) => {
                                const isActive = selectedEffect === eff.id;
                                const Icon = eff.icon || Sparkles;
                                return (
                                    <button
                                        key={eff.id}
                                        onClick={() => {
                                            setSelectedEffect(eff.id);
                                            setProParams(eff.defaultParameters || {});
                                        }}
                                        type="button"
                                        className={`relative flex flex-col items-center justify-center w-full h-[95px] rounded-[20px] backdrop-blur-[20px] transition-all duration-300 group overflow-hidden ${isActive
                                            ? 'bg-gradient-to-b from-[rgba(168,85,247,0.18)] to-[rgba(124,58,237,0.08)] border border-[#A855F7] shadow-[0_0_25px_rgba(168,85,247,0.35)] scale-[1.03]'
                                            : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:-translate-y-[4px] hover:scale-[1.04] hover:border-[#A855F7] hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer'
                                            }`}
                                    >
                                        {eff.thumbnail && (
                                            <div className="absolute inset-0 w-full h-full pointer-events-none">
                                                <img src={eff.thumbnail} className="w-full h-full object-cover opacity-20 group-hover:opacity-35 transition-opacity duration-300" alt="" />
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/85" />
                                            </div>
                                        )}
                                        <Icon
                                            size={28}
                                            strokeWidth={2.2}
                                            className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-[#FFD84D]' : 'text-[#B794F4] group-hover:drop-shadow-[0_0_8px_rgba(183,148,244,0.8)]'
                                                }`}
                                        />
                                        <span className={`relative z-10 mt-[12px] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-center leading-tight px-2 line-clamp-2 ${isActive ? 'text-white' : 'text-white/90'
                                            }`}>
                                            {eff.name}
                                        </span>
                                    </button>
                                );
                            });
                        })()}
                    </div>

                    {selectedEffect && selectedEffect.startsWith('pro-') && (() => {
                        const effectModule = getEffectModule(selectedEffect);
                        if (!effectModule) return null;
                        return (
                            <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-2.5">
                                {effectModule.adjustableParameters.map((param: any) => {
                                    const paramValue = proParams[param.key] ?? effectModule.defaultParameters[param.key];
                                    return (
                                        <div key={param.key}>
                                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">
                                                <span>{param.name}</span>
                                                <span>{typeof paramValue === 'number' ? paramValue.toFixed(param.step && param.step < 1 ? 2 : 0) : String(paramValue)}</span>
                                            </div>
                                            {param.type === 'number' && (
                                                <input
                                                    type="range"
                                                    min={param.min ?? 0}
                                                    max={param.max ?? 100}
                                                    step={param.step ?? 1}
                                                    value={paramValue}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setProParams((prev: any) => ({
                                                            ...prev,
                                                            [param.key]: val
                                                        }));
                                                    }}
                                                    className="w-full accent-purple-400"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}

                    {selectedEffect === 'blur' && (
                        <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300">
                                <span>Blur Amount</span>
                                <span>{blurAmount}px</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={30}
                                value={blurAmount}
                                onChange={(e) => setBlurAmount(Number(e.target.value))}
                                className="w-full accent-purple-400"
                            />
                        </div>
                    )}

                    {selectedEffect === 'color-correction' && (
                        <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-2.5">
                            <div>
                                <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">
                                    <span>Brightness</span>
                                    <span>{brightness.toFixed(1)}</span>
                                </div>
                                <input
                                    type="range"
                                    min={0.1}
                                    max={3}
                                    step={0.1}
                                    value={brightness}
                                    onChange={(e) => setBrightness(Number(e.target.value))}
                                    className="w-full accent-purple-400"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">
                                    <span>Contrast</span>
                                    <span>{contrast.toFixed(1)}</span>
                                </div>
                                <input
                                    type="range"
                                    min={0.1}
                                    max={3}
                                    step={0.1}
                                    value={contrast}
                                    onChange={(e) => setContrast(Number(e.target.value))}
                                    className="w-full accent-purple-400"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">
                                    <span>Saturation</span>
                                    <span>{saturation.toFixed(1)}</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={3}
                                    step={0.1}
                                    value={saturation}
                                    onChange={(e) => setSaturation(Number(e.target.value))}
                                    className="w-full accent-purple-400"
                                />
                            </div>
                        </div>
                    )}

                    {selectedEffect === 'slow-motion' && (
                        <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300">
                                <span>Speed</span>
                                <span>{slowMotionSpeed.toFixed(2)}x</span>
                            </div>
                            <input
                                type="range"
                                min={0.1}
                                max={1}
                                step={0.1}
                                value={slowMotionSpeed}
                                onChange={(e) => setSlowMotionSpeed(Number(e.target.value))}
                                className="w-full accent-purple-400"
                            />
                        </div>
                    )}

                    {selectedEffect === 'glitch' && (
                        <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300">
                                <span>Glitch Intensity</span>
                                <span>{glitchIntensity.toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={3}
                                step={0.5}
                                value={glitchIntensity}
                                onChange={(e) => setGlitchIntensity(Number(e.target.value))}
                                className="w-full accent-purple-400"
                            />
                        </div>
                    )}

                    {selectedEffect === 'velocity' && (() => {
                        const safeVelocitySpeed = typeof velocitySpeed === 'number' ? velocitySpeed : 1.5;
                        return (
                            <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                                <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300">
                                    <span>Velocity Ramp</span>
                                    <span>{safeVelocitySpeed.toFixed(2)}x</span>
                                </div>
                                <input
                                    type="range"
                                    min={0.5}
                                    max={3}
                                    step={0.05}
                                    value={safeVelocitySpeed}
                                    onChange={(e) => setVelocitySpeed(Number(e.target.value))}
                                    className="w-full accent-purple-400"
                                />
                            </div>
                        );
                    })()}

                    {selectedEffect === 'motion-blur' && (
                        <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300">
                                <span>Motion Blur</span>
                                <span>{motionBlurAmount.toFixed(0)}px</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={12}
                                step={1}
                                value={motionBlurAmount}
                                onChange={(e) => setMotionBlurAmount(Number(e.target.value))}
                                className="w-full accent-purple-400"
                            />
                        </div>
                    )}

                    {selectedEffect === 'shake' && (
                        <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300">
                                <span>Shake Strength</span>
                                <span>{shakeStrength.toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={4}
                                step={0.1}
                                value={shakeStrength}
                                onChange={(e) => setShakeStrength(Number(e.target.value))}
                                className="w-full accent-purple-400"
                            />
                        </div>
                    )}

                    {selectedEffect === 'flash-effect' && (
                        <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300">
                                <span>Flash Strength</span>
                                <span>{flashIntensity.toFixed(2)}</span>
                            </div>
                            <input
                                type="range"
                                min={0.1}
                                max={1}
                                step={0.05}
                                value={flashIntensity}
                                onChange={(e) => setFlashIntensity(Number(e.target.value))}
                                className="w-full accent-purple-400"
                            />
                        </div>
                    )}

                    {selectedEffect === 'rgb-split' && (
                        <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300">
                                <span>RGB Split</span>
                                <span>{rgbSplitAmount.toFixed(0)}px</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={28}
                                step={1}
                                value={rgbSplitAmount}
                                onChange={(e) => setRgbSplitAmount(Number(e.target.value))}
                                className="w-full accent-purple-400"
                            />
                        </div>
                    )}

                    {selectedEffect === 'smooth-zoom' && (
                        <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300">
                                <span>Smooth Zoom</span>
                                <span>{(smoothZoomAmount * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={0.7}
                                step={0.05}
                                value={smoothZoomAmount}
                                onChange={(e) => setSmoothZoomAmount(Number(e.target.value))}
                                className="w-full accent-purple-400"
                            />
                        </div>
                    )}

                    {selectedEffect === 'film-grain' && (
                        <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300">
                                <span>Grain Opacity</span>
                                <span>{filmGrainOpacity.toFixed(2)}</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={filmGrainOpacity}
                                onChange={(e) => setFilmGrainOpacity(Number(e.target.value))}
                                className="w-full accent-purple-400"
                            />
                        </div>
                    )}

                    {/* Settings inputs for text effects removed */}
                </div>
            );
        case 'transitions':
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Transitions</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Cuts</span>
                    </div>
                    <div className="rounded border border-white/5 bg-white/[0.02] px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-slate-400 text-center">
                        {activePreviewId
                            ? `Clip: ${activePreviewId.slice(0, 8)} Ã¢â‚¬Â¢ ${clipTransitions[activePreviewId] || 'none'}`
                            : 'Select clip from Timeline first'}
                    </div>
                    <div className="grid grid-cols-3 gap-[16px] max-h-[350px] overflow-y-auto pr-2 pb-4 [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-[#7C3AED] [&::-webkit-scrollbar-thumb]:to-[#A855F7] [&::-webkit-scrollbar-thumb]:rounded-full">
                        {[
                            { id: 'fade-transition', label: 'Fade Transition', icon: Droplets },
                            { id: 'zoom-transition', label: 'Zoom Transition', icon: ZoomIn },
                            { id: 'blur-transition', label: 'Blur Transition', icon: Wind },
                            { id: 'swipe-transition', label: 'Swipe Transition', icon: MoveHorizontal },
                            { id: 'spin-transition', label: 'Spin Transition', icon: RotateCw },
                            { id: 'whip-pan-transition', label: 'Whip Pan Transition', icon: MoveRight },
                            { id: 'glitch-transition', label: 'Glitch Transition', icon: ScanLine },
                            { id: 'mask-transition', label: 'Mask Transition', icon: Square },
                            { id: 'flash-transition', label: 'Flash Transition', icon: Zap },
                            { id: 'camera-shake-transition', label: 'Camera Shake Transition', icon: Vibrate },
                            { id: 'match-cut-transition', label: 'Match Cut Transition', icon: Scissors },
                            { id: 'speed-ramp-transition', label: 'Speed Ramp Transition', icon: Gauge },
                        ].map((tr) => (
                            <button
                                key={tr.id}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    applyTransitionForActiveClip(tr.id as any);
                                }}
                                type="button"
                                className={`flex flex-col items-center justify-center w-full h-[95px] rounded-[20px] backdrop-blur-[20px] transition-all duration-300 group ${activePreviewId && clipTransitions[activePreviewId] === tr.id
                                    ? 'bg-gradient-to-b from-[rgba(168,85,247,0.18)] to-[rgba(124,58,237,0.08)] border border-[#A855F7] shadow-[0_0_25px_rgba(168,85,247,0.35)] scale-[1.03]'
                                    : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:-translate-y-[4px] hover:scale-[1.04] hover:border-[#A855F7] hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer'
                                    }`}
                            >
                                <tr.icon
                                    size={28}
                                    strokeWidth={2.2}
                                    className={`transition-colors duration-300 ${activePreviewId && clipTransitions[activePreviewId] === tr.id ? 'text-[#FFD84D]' : 'text-[#B794F4] group-hover:drop-shadow-[0_0_8px_rgba(183,148,244,0.8)]'
                                        }`}
                                />
                                <span className={`mt-[12px] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-center leading-tight px-2 line-clamp-2 ${activePreviewId && clipTransitions[activePreviewId] === tr.id ? 'text-white' : 'text-white/90'
                                    }`}>
                                    {tr.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            );
        case 'speed':
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Speed Change</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Rate</span>
                    </div>
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300">
                            <span>Speed</span>
                            <span>{speedValue.toFixed(2)}x</span>
                        </div>
                        <input
                            type="range"
                            min={0.25}
                            max={2}
                            step={0.05}
                            value={speedValue}
                            onChange={(e) => setSpeedValue(Number(e.target.value))}
                            className="w-full accent-purple-400"
                        />
                        <div className="flex gap-1">
                            {[0.5, 1, 1.25, 1.5, 2].map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => setSpeedValue(preset)}
                                    className={`flex-1 py-1 rounded text-[8px] font-black uppercase border transition-colors ${Math.abs(speedValue - preset) < 0.001 ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                                >
                                    {preset}x
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        case 'trim':
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Trim Clip</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Cut</span>
                    </div>
                    {activePreviewItem?.type === 'video' ? (
                        <div className="space-y-3">
                            <div className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                                Duration: {(activePreviewItem.duration || 0).toFixed(2)}s
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">
                                    <span>Start</span>
                                    <span>{getTrimRangeForItem(activePreviewItem?.id || '', activePreviewItem?.duration || 0).start.toFixed(2)}s</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={Math.max(0, (activePreviewItem.duration || 0) - 0.01)}
                                    step={0.01}
                                    value={getTrimRangeForItem(activePreviewItem?.id || '', activePreviewItem?.duration || 0).start}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const current = getTrimRangeForItem(activePreviewItem?.id || '', activePreviewItem?.duration || 0);
                                        const safeEnd = Math.max(val + 0.01, current.end);
                                        setClipTrimRanges((prev: any) => ({
                                            ...prev,
                                            [activePreviewItem.id]: {
                                                start: val,
                                                end: Math.min((activePreviewItem.duration || 0), safeEnd),
                                            }
                                        }));
                                        if (videoRef.current) {
                                            videoRef.current.currentTime = val;
                                        }
                                    }}
                                    className="w-full accent-purple-500 h-1 bg-white/10 rounded-full appearance-none"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">
                                    <span>End</span>
                                    <span>{getTrimRangeForItem(activePreviewItem?.id || '', activePreviewItem?.duration || 0).end.toFixed(2)}s</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={(activePreviewItem.duration || 0)}
                                    step={0.01}
                                    value={getTrimRangeForItem(activePreviewItem?.id || '', activePreviewItem?.duration || 0).end}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const current = getTrimRangeForItem(activePreviewItem?.id || '', activePreviewItem?.duration || 0);
                                        const safeStart = Math.min(val - 0.01, current.start);
                                        setClipTrimRanges((prev: any) => ({
                                            ...prev,
                                            [activePreviewItem.id]: {
                                                start: safeStart,
                                                end: val,
                                            }
                                        }));
                                        if (videoRef.current) {
                                            videoRef.current.currentTime = val;
                                        }
                                    }}
                                    className="w-full accent-purple-500 h-1 bg-white/10 rounded-full appearance-none"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    if (activePreviewItem) {
                                        setClipTrimRanges((prev: any) => ({
                                            ...prev,
                                            [activePreviewItem.id]: { start: 0, end: (activePreviewItem.duration || 0) }
                                        }));
                                    }
                                }}
                                className="w-full py-1.5 rounded bg-white/5 border border-white/10 text-slate-300 text-[8px] font-black uppercase hover:bg-white/10"
                            >
                                Reset Trim
                            </button>
                        </div>
                    ) : (
                        <div className="py-3 text-center text-[8px] font-bold uppercase tracking-widest text-slate-500">
                            Select a video clip
                        </div>
                    )}
                </div>
            );
        case 'rotate':
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Rotation</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Angle</span>
                    </div>
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300">
                            <span>Degrees</span>
                            <span>{rotationDegrees}Ã‚Â°</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                            {[0, 90, 180, 270].map((deg) => (
                                <button
                                    key={deg}
                                    onClick={() => setRotationDegrees(deg)}
                                    className={`py-1.5 rounded text-[8px] font-black uppercase border transition-colors ${rotationDegrees === deg ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                                >
                                    {deg}Ã‚Â°
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        case 'volume':
            return (
                <div className="flex flex-col h-full bg-[#1b1c28] -m-2.5 overflow-y-auto custom-scrollbar rounded-xl">
                    {/* Top Bar */}
                    <div className="flex items-center justify-center border-b border-white/5 py-3 shrink-0">
                        <span className="text-[13px] font-bold text-white">Volume</span>
                    </div>
                    
                    {/* Content Body */}
                    <div className="flex-1 p-5 space-y-6">
                        
                        {/* Volume Level Row */}
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-slate-300">Volume</span>
                            <div className="flex items-center bg-[#13141c] rounded-md px-3 py-1.5 border border-white/5">
                                <input 
                                    type="number" 
                                    value={Math.round(volumeLevel * 100)} 
                                    onChange={(e) => {
                                        let next = parseFloat(e.target.value);
                                        if (isNaN(next)) next = 0;
                                        setVolumeLevel(next / 100);
                                        if (next > 0 && isMuted) setIsMuted(false);
                                    }}
                                    className="bg-transparent text-slate-200 text-[11px] font-medium w-10 text-right focus:outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        </div>
                        
                        {/* Slider Row */}
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsMuted((prev: any) => !prev)}
                                className="w-8 h-8 rounded-md bg-[#252632] flex items-center justify-center hover:bg-[#2d2f3d] transition-colors shrink-0"
                            >
                                {isMuted ? (
                                    <LucideIcons.VolumeX className="w-4 h-4 text-slate-300" />
                                ) : (
                                    <LucideIcons.Volume2 className="w-4 h-4 text-slate-300" />
                                )}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={5}
                                step={0.01}
                                value={volumeLevel}
                                onChange={(e) => {
                                    const next = Number(e.target.value);
                                    setVolumeLevel(next);
                                    if (next > 0 && isMuted) {
                                        setIsMuted(false);
                                    }
                                }}
                                className="flex-1 h-1 bg-[#252632] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #ffc83d ${(volumeLevel / 5) * 100}%, #252632 ${(volumeLevel / 5) * 100}%)`
                                }}
                            />
                        </div>
                        
                        {/* Denoise Row */}
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-slate-300">Denoise</span>
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] text-slate-500">{isDenoiseEnabled ? 'On' : 'Off'}</span>
                                <button
                                    onClick={() => setIsDenoiseEnabled((prev: any) => !prev)}
                                    className={`w-9 h-5 rounded-full relative transition-colors ${isDenoiseEnabled ? 'bg-slate-600' : 'bg-[#252632]'}`}
                                >
                                    <div className={`absolute top-[2px] w-4 h-4 bg-white rounded-full transition-transform ${isDenoiseEnabled ? 'left-[18px]' : 'left-[2px]'}`} />
                                </button>
                            </div>
                        </div>
                        
                    </div>
                    
                    {/* Apply to All Button */}
                    <div className="p-4 mt-auto border-t border-white/5 shrink-0">
                        <button
                            onClick={onApplyToAllVolume}
                            className="flex items-center gap-2 px-3 py-2 bg-[#252632] hover:bg-[#2d2f3d] rounded-md transition-colors text-[11px] font-bold text-slate-200"
                        >
                            <LucideIcons.CheckCheck className="w-4 h-4" />
                            Apply to all
                        </button>
                    </div>
                </div>
            );
        case 'crop_deprecated': {
            const CROP_RATIOS = [
                { id: 'Original', label: 'Original', icon: Square, ratio: 0 },
                { id: 'Free', label: 'Free', icon: Crop, ratio: 0 },
                { id: '9:16', label: '9:16', icon: Smartphone, ratio: 9/16 },
                { id: '1:1', label: '1:1', icon: Square, ratio: 1 },
                { id: '16:9', label: '16:9', icon: MonitorPlay, ratio: 16/9 },
                { id: '4:5', label: '4:5', icon: Smartphone, ratio: 4/5 },
                { id: '2:3', label: '2:3', ratio: 2/3 },
                { id: '3:4', label: '3:4', ratio: 3/4 },
                { id: '4:3', label: '4:3', ratio: 4/3 },
                { id: '3:2', label: '3:2', ratio: 3/2 },
                { id: '21:9', label: '21:9', ratio: 21/9 },
                { id: '42:9', label: '42:9', ratio: 42/9 },
                { id: '1.85:1', label: '1.85:1', ratio: 1.85/1 },
                { id: '2.35:1', label: '2.35:1', ratio: 2.35/1 },
                { id: '2:1', label: '2:1', ratio: 2/1 },
                { id: '1:2', label: '1:2', ratio: 1/2 },
            ];

            const handleCropRatioClick = (preset: any) => {
                if (preset.id === 'Original' || preset.id === 'Free') {
                    setCropWidthPct(100);
                    setCropHeightPct(100);
                    setCropCenterX(50);
                    setCropCenterY(50);
                    return;
                }

                if (!videoRef.current) return;
                const vw = videoRef.current.videoWidth || 16;
                const vh = videoRef.current.videoHeight || 9;
                const videoRatio = vw / vh;
                
                const targetRatio = preset.ratio;
                let wPct = 100;
                let hPct = 100;
                
                if (targetRatio > videoRatio) {
                    hPct = (videoRatio / targetRatio) * 100;
                } else if (targetRatio < videoRatio) {
                    wPct = (targetRatio / videoRatio) * 100;
                }
                
                setCropWidthPct(wPct);
                setCropHeightPct(hPct);
                setCropCenterX(50);
                setCropCenterY(50);
            };

            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Cropping</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Dimensions</span>
                    </div>

                    <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar items-center">
                        {CROP_RATIOS.map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => handleCropRatioClick(preset)}
                                className="flex flex-col items-center justify-center min-w-[54px] h-[54px] rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 shrink-0 transition-colors"
                            >
                                {preset.icon ? (
                                    <>
                                        <preset.icon className="w-4 h-4 text-slate-300 mb-1" />
                                        <span className="text-[8px] font-medium text-slate-300">{preset.label}</span>
                                    </>
                                ) : (
                                    <span className="text-[10px] font-bold text-slate-300">{preset.label}</span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <div>
                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">
                                <span>Width</span>
                                <span>{Math.round(cropWidthPct)}%</span>
                            </div>
                            <input type="range" min={30} max={100} step={1} value={cropWidthPct} onChange={(e) => setCropWidthPct(Number(e.target.value))} className="w-full accent-purple-400 font-sans" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">
                                <span>Height</span>
                                <span>{Math.round(cropHeightPct)}%</span>
                            </div>
                            <input type="range" min={30} max={100} step={1} value={cropHeightPct} onChange={(e) => setCropHeightPct(Number(e.target.value))} className="w-full accent-purple-400" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">
                                <span>Center X</span>
                                <span>{Math.round(cropCenterX)}%</span>
                            </div>
                            <input type="range" min={0} max={100} step={1} value={cropCenterX} onChange={(e) => setCropCenterX(Number(e.target.value))} className="w-full accent-purple-400" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">
                                <span>Center Y</span>
                                <span>{Math.round(cropCenterY)}%</span>
                            </div>
                            <input type="range" min={0} max={100} step={1} value={cropCenterY} onChange={(e) => setCropCenterY(Number(e.target.value))} className="w-full accent-purple-400" />
                        </div>
                        <button
                            onClick={() => {
                                setCropWidthPct(100);
                                setCropHeightPct(100);
                                setCropCenterX(50);
                                setCropCenterY(50);
                            }}
                            className="w-full py-1.5 rounded bg-white/5 border border-white/10 text-slate-300 text-[8px] font-black uppercase hover:bg-white/10"
                        >
                            Reset Crop
                        </button>
                    </div>
                </div>
            );
        }
        case 'zoom':
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Zoom</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Scale</span>
                    </div>
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300">
                            <span>Zoom Factor</span>
                            <span>{zoomToolAmount.toFixed(2)}x</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={2.5}
                            step={0.05}
                            value={zoomToolAmount}
                            onChange={(e) => setZoomToolAmount(Number(e.target.value))}
                            className="w-full accent-purple-400"
                        />
                        <button
                            onClick={() => setZoomToolAmount(1)}
                            className="w-full py-1.5 rounded bg-white/5 border border-white/10 text-slate-300 text-[8px] font-black uppercase hover:bg-white/10"
                        >
                            Reset Zoom
                        </button>
                    </div>
                </div>
            );
        case 'keyframe':
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Keyframe</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Animation</span>
                    </div>
                    <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-1">
                            {[
                                { id: 'none', label: 'None' },
                                { id: 'zoom-in', label: 'Zoom In' },
                                { id: 'zoom-out', label: 'Zoom Out' },
                                { id: 'pulse', label: 'Pulse' },
                            ].map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => setKeyframeMode(preset.id as any)}
                                    className={`py-1.5 rounded text-[8px] font-black uppercase border transition-colors ${keyframeMode === preset.id ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">
                                <span>Strength</span>
                                <span>{keyframeAmount.toFixed(2)}x</span>
                            </div>
                            <input
                                type="range"
                                min={1.05}
                                max={1.8}
                                step={0.05}
                                value={keyframeAmount}
                                onChange={(e) => setKeyframeAmount(Number(e.target.value))}
                                className="w-full accent-purple-400"
                                disabled={keyframeMode === 'none'}
                            />
                        </div>
                    </div>
                </div>
            );
        case 'text-tool':
            return (
                <div className="flex flex-col h-[600px] space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5 shrink-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Text overlay</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Titles</span>
                    </div>
                    
                    <div className="flex flex-1 min-h-0 gap-3 flex-row-reverse">
                        {/* Vertical Toolbar Sidebar (Moved to Right) */}
                        <div className="w-10 bg-[#12141c] rounded-xl border border-white/5 flex flex-col items-center py-2 space-y-1.5 shrink-0 h-fit">
                            {[
                                { id: 'content', icon: <LucideIcons.Keyboard className="w-4 h-4" strokeWidth={1.5} /> },
                                { id: 'fonts', icon: <span className="font-serif italic text-lg leading-none">Ff</span> },
                                { id: 'styles', icon: <span className="font-sans font-medium text-lg leading-none">Aa</span> },
                                { id: 'color', icon: <LucideIcons.Palette className="w-4 h-4" strokeWidth={1.5} /> },
                                { id: 'align', icon: <LucideIcons.AlignLeft className="w-4 h-4" strokeWidth={1.5} /> },
                                { id: 'spacing', icon: <LucideIcons.ArrowUpDown className="w-4 h-4" strokeWidth={1.5} /> },
                                { id: 'transform', icon: <LucideIcons.Move className="w-4 h-4" strokeWidth={1.5} /> },
                                { id: 'animation', icon: <LucideIcons.Play className="w-4 h-4" strokeWidth={1.5} /> }
                            ].map((tab) => (
                                <button
                                    key={tab?.id}
                                    onClick={() => setTextSubTab(tab?.id as any)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                                        textSubTab === tab?.id
                                            ? 'bg-white/10 text-white'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                    }`}
                                >
                                    {tab.icon}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto pr-2 flex flex-col min-h-0 relative scrollbar-thin scrollbar-thumb-white/10">
                            {textSubTab === 'content' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#6A7B95] block mb-2">Content</label>
                                        <Textarea
                                            value={overlayText}
                                            onChange={(e) => {
                                                setOverlayText(e.target.value);
                                                setAnimatedText(e.target.value);
                                            }}
                                            placeholder="Overlay text"
                                            className="w-full bg-[#08090d] border border-white/[0.08] hover:border-white/15 focus:border-purple-500/50 text-slate-200 text-[13px] font-medium min-h-[150px] rounded-lg p-3 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all resize-none shadow-inner"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => window.dispatchEvent(new CustomEvent('add-text-clip'))}
                                            className="flex-1 py-2 rounded text-[10px] font-bold transition-colors bg-purple-500 text-white hover:bg-purple-600"
                                        >
                                            Add to Timeline
                                        </button>
                                        <button
                                            onClick={() => {
                                                setOverlayText('');
                                                setAnimatedText('');
                                                window.dispatchEvent(new CustomEvent('trigger-add-text'));
                                            }}
                                            className="px-3 py-2 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                                            title="Delete Text"
                                        >
                                            <LucideIcons.Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {textSubTab === 'styles' && (
                                <div className="bg-[#12141c] border border-white/[0.06] rounded-xl overflow-hidden shadow-inner select-none flex flex-col flex-1 min-h-0">
                                    <div className="px-3.5 py-2 bg-[#0e1017] text-[10px] font-bold text-slate-300 border-b border-white/[0.02] shrink-0">
                                        Font Family
                                    </div>
                                    <div className="flex-1 min-h-[220px] overflow-y-auto divide-y divide-white/[0.02] pr-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/[0.08] [&::-webkit-scrollbar-thumb]:rounded-full">
                                    {textFontOptions.map((font) => {
                                        const isActive = overlayFontId === font.id;
                                        return (
                                            <button
                                                key={font.id}
                                                onClick={() => setOverlayFontId(font.id)}
                                                className={`w-full flex items-center justify-between py-3 px-3.5 text-left border-l-2 transition-all duration-150 active:scale-[0.99] cursor-pointer ${
                                                    isActive
                                                        ? 'bg-[#1e172a] border-[#D946EF] text-[#e879f9]'
                                                        : 'border-transparent text-slate-300 hover:bg-white/[0.02] hover:text-white'
                                                }`}
                                            >
                                                <span 
                                                    className="text-[13px]"
                                                    style={{ 
                                                        fontFamily: font.family,
                                                        letterSpacing: font.letterSpacing || 'normal',
                                                        fontWeight: font.fontWeight || 'normal'
                                                    }}
                                                >
                                                    {font.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                    </div>
                                </div>
                            )}

                            {textSubTab === 'fonts' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] text-slate-300">Font Size</label>
                                            <div className="bg-[#12141c] border border-white/10 rounded px-2 py-0.5 text-[10px] text-slate-300 w-12 text-center">
                                                {overlayFontSize}
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min={10}
                                            max={120}
                                            value={overlayFontSize}
                                            onChange={(e) => setOverlayFontSize(Number(e.target.value))}
                                            className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] text-slate-400">Suitable Font Size for Design</label>
                                        <div className="space-y-1">
                                            {[
                                                { label: 'Title', size: 36, weight: 'font-bold', textClass: 'text-2xl' },
                                                { label: 'Subtitle', size: 24, weight: 'font-bold', textClass: 'text-xl' },
                                                { label: 'Content', size: 17, weight: 'font-bold', textClass: 'text-base' }
                                            ].map((preset) => (
                                                <button
                                                    key={preset.label}
                                                    onClick={() => setOverlayFontSize(preset.size)}
                                                    className="w-full flex items-center justify-between py-2 px-1 hover:bg-white/5 rounded transition-colors group"
                                                >
                                                    <div className="flex items-baseline gap-2">
                                                        <span className={`${preset.weight} ${preset.textClass} text-white`}>{preset.label}</span>
                                                        <span className="text-[10px] text-slate-500">/ {preset.size}</span>
                                                    </div>
                                                    {overlayFontSize === preset.size && (
                                                        <LucideIcons.Check className="w-4 h-4 text-yellow-500" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {textSubTab === 'color' && (
                                <div className="space-y-6 pb-12">
                                    <div className="text-center font-bold text-sm text-white mb-4 border-b border-white/10 pb-2">Color</div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-slate-300">Styles</label>
                                        <div className="grid grid-cols-7 gap-1">
                                            {Array.from({ length: 21 }).map((_, i) => (
                                                <button key={i} className="aspect-square rounded border border-white/10 flex items-center justify-center hover:bg-white/10 bg-[#12141c]">
                                                    <span className="font-serif text-[14px] font-bold text-white">T</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] text-slate-300">Text</label>
                                        <div className="flex items-center gap-2 bg-[#12141c] border border-white/10 rounded p-1">
                                            <input
                                                type="color"
                                                value={overlayColor}
                                                onChange={(e) => setOverlayColor(e.target.value)}
                                                className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                                            />
                                            <span className="text-[11px] text-slate-300 uppercase flex-1">{overlayColor.replace('#', '')}</span>
                                            <LucideIcons.ChevronDown className="w-4 h-4 text-slate-500 mr-1" />
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <label className="text-[11px] text-slate-400 w-14">Opacity</label>
                                            <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                value={overlayOpacity}
                                                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                                                className="flex-1 h-0.5 bg-yellow-500/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                            />
                                            <div className="bg-[#12141c] border border-white/10 rounded px-2 text-[10px] text-slate-300 w-10 text-center">
                                                {overlayOpacity}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-3 border-t border-white/5">
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                                                <input type="checkbox" checked={overlayStrokeEnabled} onChange={(e) => setOverlayStrokeEnabled(e.target.checked)} className="rounded border-white/20 bg-transparent text-purple-500 focus:ring-0" />
                                                Stroke
                                            </label>
                                            <LucideIcons.RotateCcw className="w-3 h-3 text-slate-500 cursor-pointer hover:text-slate-300" />
                                        </div>
                                        {overlayStrokeEnabled && (
                                            <>
                                                <div className="flex items-center gap-2 bg-[#12141c] border border-white/10 rounded p-1">
                                                    <input type="color" value={overlayStrokeColor} onChange={(e) => setOverlayStrokeColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                                                    <span className="text-[11px] text-slate-300 uppercase flex-1">{overlayStrokeColor.replace('#', '')}</span>
                                                    <LucideIcons.ChevronDown className="w-4 h-4 text-slate-500 mr-1" />
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <label className="text-[11px] text-slate-400 w-14">Opacity</label>
                                                    <input type="range" min={0} max={100} value={overlayStrokeOpacity} onChange={(e) => setOverlayStrokeOpacity(Number(e.target.value))} className="flex-1 h-0.5 bg-yellow-500/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-400" />
                                                    <div className="bg-[#12141c] border border-white/10 rounded px-2 text-[10px] text-slate-300 w-10 text-center">{overlayStrokeOpacity}</div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-3 pt-3 border-t border-white/5">
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                                                <input type="checkbox" checked={overlayShadowEnabled} onChange={(e) => setOverlayShadowEnabled(e.target.checked)} className="rounded border-white/20 bg-transparent text-purple-500 focus:ring-0" />
                                                Shadow
                                            </label>
                                            <LucideIcons.RotateCcw className="w-3 h-3 text-slate-500 cursor-pointer hover:text-slate-300" />
                                        </div>
                                        {overlayShadowEnabled && (
                                            <>
                                                <div className="flex items-center gap-2 bg-[#12141c] border border-white/10 rounded p-1">
                                                    <input type="color" value={overlayShadowColor} onChange={(e) => setOverlayShadowColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                                                    <span className="text-[11px] text-slate-300 uppercase flex-1">{overlayShadowColor.replace('#', '')}</span>
                                                    <LucideIcons.ChevronDown className="w-4 h-4 text-slate-500 mr-1" />
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <label className="text-[11px] text-slate-400 w-14">Opacity</label>
                                                    <input type="range" min={0} max={100} value={overlayShadowOpacity} onChange={(e) => setOverlayShadowOpacity(Number(e.target.value))} className="flex-1 h-0.5 bg-yellow-500/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-400" />
                                                    <div className="bg-[#12141c] border border-white/10 rounded px-2 text-[10px] text-slate-300 w-10 text-center">{overlayShadowOpacity}</div>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <label className="text-[11px] text-slate-400 w-14">Blur</label>
                                                    <input type="range" min={0} max={100} value={overlayShadowBlur} onChange={(e) => setOverlayShadowBlur(Number(e.target.value))} className="flex-1 h-0.5 bg-yellow-500/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-400" />
                                                    <div className="bg-[#12141c] border border-white/10 rounded px-2 text-[10px] text-slate-300 w-10 text-center">{overlayShadowBlur}</div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-3 pt-3 border-t border-white/5">
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                                                <input type="checkbox" checked={overlayBgEnabled} onChange={(e) => setOverlayBgEnabled(e.target.checked)} className="rounded border-white/20 bg-transparent text-purple-500 focus:ring-0" />
                                                Background
                                            </label>
                                            <LucideIcons.RotateCcw className="w-3 h-3 text-slate-500 cursor-pointer hover:text-slate-300" />
                                        </div>
                                        {overlayBgEnabled && (
                                            <>
                                                <div className="flex items-center gap-2 bg-[#12141c] border border-white/10 rounded p-1">
                                                    <input type="color" value={overlayBgColorHex} onChange={(e) => setOverlayBgColorHex(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                                                    <span className="text-[11px] text-slate-300 uppercase flex-1">{overlayBgColorHex.replace('#', '')}</span>
                                                    <LucideIcons.ChevronDown className="w-4 h-4 text-slate-500 mr-1" />
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <label className="text-[11px] text-slate-400 w-14">Radius</label>
                                                    <input type="range" min={0} max={100} value={overlayBgRadius} onChange={(e) => setOverlayBgRadius(Number(e.target.value))} className="flex-1 h-0.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-400" />
                                                    <div className="bg-[#12141c] border border-white/10 rounded px-2 text-[10px] text-slate-300 w-10 text-center">{overlayBgRadius}</div>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <label className="text-[11px] text-slate-400 w-14">X Padding</label>
                                                    <input type="range" min={0} max={200} value={overlayBgPaddingX * 100} onChange={(e) => setOverlayBgPaddingX(Number(e.target.value) / 100)} className="flex-1 h-0.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-400" />
                                                    <div className="bg-[#12141c] border border-white/10 rounded px-2 text-[10px] text-slate-300 w-10 text-center">{overlayBgPaddingX.toFixed(1)}</div>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <label className="text-[11px] text-slate-400 w-14">Y Padding</label>
                                                    <input type="range" min={0} max={200} value={overlayBgPaddingY * 100} onChange={(e) => setOverlayBgPaddingY(Number(e.target.value) / 100)} className="flex-1 h-0.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-400" />
                                                    <div className="bg-[#12141c] border border-white/10 rounded px-2 text-[10px] text-slate-300 w-10 text-center">{overlayBgPaddingY.toFixed(1)}</div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {textSubTab === 'align' && (
                                <div className="space-y-6 pb-12">
                                    <div className="text-center font-bold text-sm text-white mb-4 border-b border-white/10 pb-2">Format</div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-slate-300">Text Style</label>
                                        <div className="flex gap-2">
                                            <button onClick={() => setOverlayTextStyleBold(!overlayTextStyleBold)} className={`w-8 h-8 rounded border flex items-center justify-center font-serif font-bold text-sm ${overlayTextStyleBold ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>B</button>
                                            <button onClick={() => setOverlayTextStyleItalic(!overlayTextStyleItalic)} className={`w-8 h-8 rounded border flex items-center justify-center font-serif italic text-sm ${overlayTextStyleItalic ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>I</button>
                                            <button onClick={() => setOverlayTextStyleUnderline(!overlayTextStyleUnderline)} className={`w-8 h-8 rounded border flex items-center justify-center font-serif underline text-sm ${overlayTextStyleUnderline ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>U</button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] text-slate-300">Alignment</label>
                                        <div className="flex gap-2">
                                            <button onClick={() => setOverlayAlignment('left')} className={`w-10 h-8 rounded border flex items-center justify-center ${overlayAlignment === 'left' ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                <LucideIcons.AlignLeft className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setOverlayAlignment('center')} className={`w-10 h-8 rounded border flex items-center justify-center ${overlayAlignment === 'center' ? 'bg-white/20 border-yellow-500/50 text-yellow-500' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                <LucideIcons.AlignCenter className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setOverlayAlignment('right')} className={`w-10 h-8 rounded border flex items-center justify-center ${overlayAlignment === 'right' ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                <LucideIcons.AlignRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] text-slate-300">List Style</label>
                                        <div className="flex gap-2">
                                            <button onClick={() => setOverlayListStyle('none')} className={`w-10 h-8 rounded border flex items-center justify-center ${overlayListStyle === 'none' ? 'bg-white/20 border-yellow-500/50 text-yellow-500' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                <span className="text-lg leading-none mb-1">-</span>
                                            </button>
                                            <button onClick={() => setOverlayListStyle('bullet')} className={`w-10 h-8 rounded border flex items-center justify-center ${overlayListStyle === 'bullet' ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                <LucideIcons.List className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setOverlayListStyle('number')} className={`w-10 h-8 rounded border flex items-center justify-center ${overlayListStyle === 'number' ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                <LucideIcons.ListOrdered className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] text-slate-300">Case</label>
                                        <div className="flex gap-2">
                                            <button onClick={() => setOverlayCase('none')} className={`w-10 h-8 rounded border flex items-center justify-center ${overlayCase === 'none' ? 'bg-white/20 border-yellow-500/50 text-yellow-500' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                <span className="text-lg leading-none mb-1">-</span>
                                            </button>
                                            <button onClick={() => setOverlayCase('upper')} className={`w-10 h-8 rounded border flex items-center justify-center text-xs font-bold ${overlayCase === 'upper' ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                AG
                                            </button>
                                            <button onClick={() => setOverlayCase('lower')} className={`w-10 h-8 rounded border flex items-center justify-center text-xs font-bold ${overlayCase === 'lower' ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                ag
                                            </button>
                                            <button onClick={() => setOverlayCase('title')} className={`w-10 h-8 rounded border flex items-center justify-center text-xs font-bold ${overlayCase === 'title' ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                Ag
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] text-slate-300">Position</label>
                                        <div className="grid grid-cols-3 gap-1 w-40">
                                            {Array.from({ length: 9 }).map((_, i) => (
                                                <button key={i} className="h-6 bg-[#2a2c35] hover:bg-white/20 rounded border border-transparent"></button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {textSubTab === 'spacing' && (
                                <div className="space-y-6 pb-12">
                                    <div className="text-center font-bold text-sm text-white mb-4 border-b border-white/10 pb-2">Spacing</div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-slate-300">Anchor Text Box</label>
                                        <div className="flex gap-2">
                                            <button onClick={() => setOverlayAnchor('top')} className={`w-9 h-8 rounded border flex items-center justify-center ${overlayAnchor === 'top' ? 'bg-white/20 border-yellow-500/50 text-yellow-500' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                <LucideIcons.ArrowUpToLine className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setOverlayAnchor('center')} className={`w-9 h-8 rounded border flex items-center justify-center ${overlayAnchor === 'center' ? 'bg-white/20 border-yellow-500/50 text-yellow-500' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                <LucideIcons.AlignVerticalSpaceAround className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setOverlayAnchor('bottom')} className={`w-9 h-8 rounded border flex items-center justify-center ${overlayAnchor === 'bottom' ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                <LucideIcons.ArrowDownToLine className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <label className="text-[11px] text-slate-300">Text Box Settings</label>
                                        <div className="flex gap-2">
                                            <button onClick={() => setOverlayTextBoxSetting('auto')} className={`w-9 h-8 rounded border flex items-center justify-center ${overlayTextBoxSetting === 'auto' ? 'bg-white/20 border-yellow-500/50 text-yellow-500' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                <LucideIcons.MoveHorizontal className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setOverlayTextBoxSetting('fixed')} className={`w-9 h-8 rounded border flex items-center justify-center ${overlayTextBoxSetting === 'fixed' ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                <LucideIcons.AlignJustify className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-3 border-t border-white/5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] text-slate-300">Letter Spacing</label>
                                            <div className="bg-[#12141c] border border-white/10 rounded px-2 text-[10px] text-slate-300 w-12 text-center py-0.5">
                                                {overlayLetterSpacing}
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min={-50}
                                            max={100}
                                            value={overlayLetterSpacing}
                                            onChange={(e) => setOverlayLetterSpacing(Number(e.target.value))}
                                            className="w-full h-0.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                        />
                                    </div>

                                    <div className="space-y-3 pt-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] text-slate-300">Line Spacing</label>
                                            <div className="bg-[#12141c] border border-white/10 rounded px-2 text-[10px] text-slate-300 w-12 text-center py-0.5">
                                                {overlayLineSpacing}%
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min={-50}
                                            max={100}
                                            value={overlayLineSpacing}
                                            onChange={(e) => setOverlayLineSpacing(Number(e.target.value))}
                                            className="w-full h-0.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                        />
                                    </div>
                                </div>
                            )}

                            {textSubTab === 'animation' && (
                                <div className="space-y-6 pb-12">
                                    <div className="text-center font-bold text-sm text-white mb-4 border-b border-white/10 pb-2">Animations</div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-slate-300">In Animation</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['none', 'fade', 'slide-left', 'zoom-in'].map(anim => (
                                                <button key={anim} onClick={() => setOverlayAnimationIn(anim)} className={`py-1.5 px-2 rounded border text-xs capitalize ${overlayAnimationIn === anim ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                    {anim.replace('-', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-slate-300">Out Animation</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['none', 'fade', 'slide-right', 'zoom-out'].map(anim => (
                                                <button key={anim} onClick={() => setOverlayAnimationOut(anim)} className={`py-1.5 px-2 rounded border text-xs capitalize ${overlayAnimationOut === anim ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                    {anim.replace('-', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-slate-300">Loop Animation</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['none', 'pulse', 'shake', 'float', 'wobble', 'blink', 'typewriter'].map(anim => (
                                                <button key={anim} onClick={() => setOverlayAnimationLoop(anim)} className={`py-1.5 px-2 rounded border text-xs capitalize ${overlayAnimationLoop === anim ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                    {anim}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {textSubTab === 'transform' && (
                                <div className="space-y-6 pb-12">
                                    <div className="text-center font-bold text-sm text-white mb-4 border-b border-white/10 pb-2">Position</div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-slate-300">Nudge</label>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="text-[11px] text-slate-400">X</span>
                                                <div className="flex items-center bg-[#1e2029] border border-white/10 rounded overflow-hidden w-full h-8 px-2 justify-between">
                                                    <input 
                                                        type="number" 
                                                        value={overlayPosX} 
                                                        onChange={(e) => setOverlayPosX(Number(e.target.value))}
                                                        className="bg-transparent text-white text-xs w-full focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    <div className="flex flex-col -space-y-1">
                                                        <LucideIcons.ChevronUp className="w-3 h-3 text-slate-400 cursor-pointer hover:text-white" onClick={() => setOverlayPosX(overlayPosX + 1)} />
                                                        <LucideIcons.ChevronDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-white" onClick={() => setOverlayPosX(overlayPosX - 1)} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="text-[11px] text-slate-400">Y</span>
                                                <div className="flex items-center bg-[#1e2029] border border-white/10 rounded overflow-hidden w-full h-8 px-2 justify-between">
                                                    <input 
                                                        type="number" 
                                                        value={overlayPosY} 
                                                        onChange={(e) => setOverlayPosY(Number(e.target.value))}
                                                        className="bg-transparent text-white text-xs w-full focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    <div className="flex flex-col -space-y-1">
                                                        <LucideIcons.ChevronUp className="w-3 h-3 text-slate-400 cursor-pointer hover:text-white" onClick={() => setOverlayPosY(overlayPosY + 1)} />
                                                        <LucideIcons.ChevronDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-white" onClick={() => setOverlayPosY(overlayPosY - 1)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <label className="text-[11px] text-slate-300">Align</label>
                                        <div className="flex bg-[#2a2c35] rounded border border-transparent overflow-hidden w-fit">
                                            <button onClick={() => setOverlayPosX(0)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white border-r border-white/5"><LucideIcons.AlignLeft className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => setOverlayPosX(50)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white border-r border-white/5"><LucideIcons.AlignCenter className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => setOverlayPosX(100)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white border-r border-white/5"><LucideIcons.AlignRight className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => setOverlayPosY(0)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white border-r border-white/5"><LucideIcons.AlignStartVertical className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => setOverlayPosY(50)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white border-r border-white/5"><LucideIcons.AlignCenterVertical className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => setOverlayPosY(100)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white"><LucideIcons.AlignEndVertical className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4">
                                        <button
                                            onClick={() => setIsTextPlacementMode(!isTextPlacementMode)}
                                            className={`w-full py-2 rounded text-[10px] font-bold uppercase transition-colors ${isTextPlacementMode ? 'bg-purple-500 text-[#0B1020]' : 'bg-white/5 text-slate-300 hover:bg-white/15'}`}
                                        >
                                            {isTextPlacementMode ? 'Click Preview' : 'Place on Preview'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Sticky Apply Button */}
                            {textSubTab !== 'content' && (
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#0B1020] via-[#0B1020] to-transparent">
                                    <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-colors">
                                        <LucideIcons.Check className="w-3.5 h-3.5" />
                                        Apply to all
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        case 'captions':
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Captions</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Multilingual</span>
                    </div>

                    {/* Language Selector */}
                    <div>
                        <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Language</label>
                        <select
                            value={captionLanguage}
                            onChange={(e) => setCaptionLanguage(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-black/30 border border-white/10 text-white text-[9px] focus:outline-none focus:border-purple-500/50 font-bold"
                        >
                            {CAPTION_LANGUAGES.map((lang) => (
                                <option key={lang.id} value={lang.id}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tab switcher */}
                    <div className="flex gap-0.5 bg-black/40 p-0.5 rounded-lg border border-white/5">
                        <button
                            onClick={() => setCaptionTab('list')}
                            className={`flex-1 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all ${captionTab === 'list' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setCaptionTab('style')}
                            className={`flex-1 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all ${captionTab === 'style' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}
                        >
                            Style
                        </button>
                    </div>

                    {captionTab === 'list' ? (
                        <div className="space-y-2">
                            {/* Caption list */}
                            <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar pr-0.5">
                                {captions.filter((cap: any) => !cap.clipId || cap.clipId === activePreviewId).length === 0 ? (
                                    <div className="py-3 text-center text-[8px] font-bold uppercase tracking-widest text-slate-600">No captions yet</div>
                                ) : (
                                    captions
                                        .filter((cap: any) => !cap.clipId || cap.clipId === activePreviewId)
                                        .map((cap: any) => (
                                            <div
                                                key={cap?.id}
                                                onClick={() => setCurrentCaption(cap)}
                                                className={`flex items-start gap-1.5 px-2 py-1.5 rounded-lg border cursor-pointer transition-all group ${currentCaption?.id === cap?.id
                                                    ? 'bg-fuchsia-500/20 border-fuchsia-400 shadow-[inset_0_0_8px_rgba(168,85,247,0.1)]'
                                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[9px] font-bold text-slate-200 truncate">{cap.text}</div>
                                                    <div className="text-[7px] text-slate-500 font-mono mt-0.5">{cap.startTime.toFixed(1)}s Ã¢â€ â€™ {cap.endTime.toFixed(1)}s</div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCaptions((prev: any) => prev.filter((c: any) => c?.id !== cap?.id));
                                                        if (currentCaption?.id === cap?.id) {
                                                            setCurrentCaption(null);
                                                        }
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0 mt-0.5"
                                                >
                                                    <X className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        ))
                                )}
                            </div>

                            {/* Add caption form */}
                            <div className="space-y-1.5 p-2.5 rounded-lg bg-white/5 border border-white/10">
                                <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Caption Text</label>
                                <input
                                    value={newCaptionText}
                                    onChange={(e) => setNewCaptionText(e.target.value)}
                                    placeholder="Enter caption..."
                                    className="w-full px-2.5 py-1.5 rounded bg-black/30 border border-white/10 text-white text-[10px] focus:outline-none focus:border-purple-500/50 placeholder:text-slate-600"
                                />
                                <div className="grid grid-cols-2 gap-1.5">
                                    <div>
                                        <label className="text-[7px] font-bold uppercase text-slate-500 block mb-0.5">Start (sec)</label>
                                        <input
                                            type="number"
                                            value={newCaptionStart}
                                            onChange={(e) => setNewCaptionStart(Number(e.target.value))}
                                            step={0.1}
                                            min={0}
                                            className="w-full px-2 py-1 rounded bg-black/30 border border-white/10 text-white text-[10px] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[7px] font-bold uppercase text-slate-500 block mb-0.5">End (sec)</label>
                                        <input
                                            type="number"
                                            value={newCaptionEnd}
                                            onChange={(e) => setNewCaptionEnd(Number(e.target.value))}
                                            step={0.1}
                                            min={0}
                                            className="w-full px-2 py-1 rounded bg-black/30 border border-white/10 text-white text-[10px] focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (!newCaptionText.trim()) return;
                                        setCaptions((prev: any) => [...prev, {
                                            id: Math.random().toString(36).substr(2, 9),
                                            text: newCaptionText.trim(),
                                            startTime: newCaptionStart,
                                            endTime: Math.max(newCaptionStart + 0.1, newCaptionEnd),
                                            clipId: activePreviewId,
                                        }]);
                                        setNewCaptionText('');
                                        setNewCaptionStart(0);
                                        setNewCaptionEnd(3);
                                    }}
                                    className="w-full py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[8px] font-black uppercase hover:bg-purple-500/30 transition-all"
                                >
                                    + Add Caption
                                </button>
                            </div>

                            {/* Auto-caption via Gemini */}
                            <div className="space-y-1.5 p-2.5 rounded-lg bg-fuchsia-950/30 border border-fuchsia-500/20">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-fuchsia-300">Ã¢Å“Â¨ AI Auto-Caption</span>
                                    <span className="text-[7px] text-slate-500">Powered by Gemini</span>
                                </div>
                                {/* Detect Speakers toggle */}
                                <div className="flex items-center justify-between">
                                    <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Detect Speakers</label>
                                    <button
                                        onClick={() => setDetectSpeakers((prev: boolean) => !prev)}
                                        className={`px-2 py-0.5 rounded text-[7px] font-black uppercase border transition-all ${detectSpeakers
                                            ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30'
                                            : 'bg-white/5 text-slate-500 border-white/10'
                                        }`}
                                    >
                                        {detectSpeakers ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                            </div>
                            {autoCaptionStatus ? (
                                <div className="px-2 py-1.5 rounded-lg bg-black/30 border border-white/10 text-[8px] font-bold text-slate-300 text-center leading-relaxed">
                                    {autoCaptionStatus}
                                </div>
                            ) : null}
                            <button
                                onClick={handleAutoCaption}
                                disabled={isAutoCapturing}
                                className={`w-full py-2 rounded-lg text-[8px] font-black uppercase flex items-center justify-center gap-1.5 transition-all ${isAutoCapturing
                                    ? 'bg-red-500/20 border border-red-500/40 text-red-300 animate-pulse cursor-not-allowed'
                                    : 'bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/25'
                                    }`}
                            >
                                {isAutoCapturing ? (
                                    <>
                                        <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-ping mr-1" />
                                        TranscribingÃ¢â‚¬Â¦
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-3 h-3" />
                                        Auto-Caption (Gemini)
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {/* Style Presets */}
                            <div>
                                <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Ã°Å¸Å½Â¨ Presets</label>
                                <div className="grid grid-cols-2 gap-1 max-h-[92px] overflow-y-auto custom-scrollbar">
                                    {CAPTION_STYLE_PRESETS.map((preset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => {
                                                setCaptionStylePreset(preset.id);
                                                setCaptionStyle((prev: any) => ({
                                                    ...prev,
                                                    fontId: preset.fontId,
                                                    fontSize: preset.fontSize,
                                                    color: preset.color,
                                                    bgEnabled: preset.bgEnabled,
                                                    bgColorHex: preset.bgColorHex,
                                                    bold: preset.bold,
                                                    italic: preset.italic,
                                                    outline: preset.outline,
                                                    alignment: preset.alignment,
                                                }));
                                            }}
                                            className={`px-2 py-2 rounded text-left text-[7px] font-bold uppercase border transition-all ${captionStylePreset === preset.id ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 ring-2 ring-purple-500/30' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                                        >
                                            <div>{preset.label}</div>
                                            <div className="text-[6px] text-slate-500 normal-case font-normal">{preset.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Font picker */}
                            <div>
                                <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Font</label>
                                <div className="grid grid-cols-2 gap-1 max-h-[68px] overflow-y-auto custom-scrollbar">
                                    {textFontOptions.map((font) => (
                                        <button
                                            key={font.id}
                                            onClick={() => {
                                                setCaptionStylePreset(null);
                                                setCaptionStyle((prev: any) => ({ ...prev, fontId: font.id }));
                                            }}
                                            className={`px-2 py-1 rounded text-left text-[7px] font-bold uppercase border transition-colors ${captionStyle.fontId === font.id
                                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                                                }`}
                                            style={{ fontFamily: font.family }}
                                        >
                                            {font.label.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size & Color */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block">Size <span className="text-slate-600 font-mono normal-case">{captionStyle.fontSize}px</span></label>
                                    <input
                                        type="range"
                                        min={14}
                                        max={72}
                                        value={captionStyle.fontSize}
                                        onChange={(e) => setCaptionStyle((prev: any) => ({ ...prev, fontSize: Number(e.target.value) }))}
                                        className="w-full accent-purple-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block">Color</label>
                                    <input
                                        type="color"
                                        value={captionStyle.color}
                                        onChange={(e) => setCaptionStyle((prev: any) => ({ ...prev, color: e.target.value }))}
                                        className="w-full h-7 rounded bg-transparent border border-white/10 cursor-pointer mt-0.5"
                                    />
                                </div>
                            </div>

                            {/* Background box */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Background Box</label>
                                    <button
                                        onClick={() => setCaptionStyle((prev: any) => ({ ...prev, bgEnabled: !prev.bgEnabled }))}
                                        className={`px-2 py-0.5 rounded text-[7px] font-black uppercase border transition-all ${captionStyle.bgEnabled
                                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                            : 'bg-white/5 text-slate-500 border-white/10'
                                            }`}
                                    >
                                        {captionStyle.bgEnabled ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                                {captionStyle.bgEnabled && (
                                    <input
                                        type="color"
                                        value={captionStyle.bgColorHex}
                                        onChange={(e) => setCaptionStyle((prev: any) => ({ ...prev, bgColorHex: e.target.value }))}
                                        className="w-full h-6 rounded bg-transparent border border-white/10 cursor-pointer"
                                    />
                                )}
                            </div>

                            {/* Bold / Italic / Outline */}
                            <div>
                                <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Text Style</label>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setCaptionStyle((prev: any) => ({ ...prev, bold: !prev.bold }))}
                                        className={`flex-1 py-1.5 rounded border text-[8px] transition-all flex items-center justify-center ${captionStyle.bold ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <Bold className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => setCaptionStyle((prev: any) => ({ ...prev, italic: !prev.italic }))}
                                        className={`flex-1 py-1.5 rounded border text-[8px] transition-all flex items-center justify-center ${captionStyle.italic ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <Italic className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => setCaptionStyle((prev: any) => ({ ...prev, outline: !prev.outline }))}
                                        className={`flex-1 py-1.5 rounded border text-[8px] font-black uppercase transition-all ${captionStyle.outline ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                                            }`}
                                        title="Text Outline"
                                    >
                                        T
                                    </button>
                                </div>
                            </div>

                            {/* Alignment */}
                            <div>
                                <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Alignment</label>
                                <div className="flex gap-1">
                                    {(['left', 'center', 'right'] as const).map((align) => {
                                        const AlignIcon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                                        return (
                                            <button
                                                key={align}
                                                onClick={() => setCaptionStyle((prev: any) => ({ ...prev, alignment: align }))}
                                                className={`flex-1 py-1.5 rounded border transition-all flex items-center justify-center ${captionStyle.alignment === align
                                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                <AlignIcon className="w-3 h-3" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Position */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Pos X</label>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={captionStyle.posX}
                                        onChange={(e) => setCaptionStyle((prev: any) => ({ ...prev, posX: Number(e.target.value) }))}
                                        className="w-full accent-purple-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Pos Y</label>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={captionStyle.posY}
                                        onChange={(e) => setCaptionStyle((prev: any) => ({ ...prev, posY: Number(e.target.value) }))}
                                        className="w-full accent-purple-400"
                                    />
                                </div>
                            </div>

                            {/* Place on preview */}
                            <button
                                onClick={() => setIsCaptionPlacementMode(!isCaptionPlacementMode)}
                                className={`w-full py-1.5 rounded text-[8px] font-black uppercase border transition-colors ${isCaptionPlacementMode
                                    ? 'bg-purple-500 text-[#0B1020] border-purple-400'
                                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/15'
                                    }`}
                            >
                                {isCaptionPlacementMode ? 'Click Preview to Place' : 'Place on Preview'}
                            </button>
                        </div>
                    )}
                </div>
            );
        case 'fade':
            return (
                <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">Fade (Seconds)</span>
                    
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-300">
                            <span>Fade In</span>
                            <span>{clipSettings[activePreviewId]?.fadeIn ?? 0}s</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={5}
                            step={0.1}
                            value={clipSettings[activePreviewId]?.fadeIn ?? 0}
                            onChange={(e) => setClipSettings((prev: any) => ({ ...prev, [activePreviewId]: { ...prev[activePreviewId], fadeIn: Number(e.target.value) } }))}
                            className="w-full accent-purple-400"
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-300">
                            <span>Fade Out</span>
                            <span>{clipSettings[activePreviewId]?.fadeOut ?? 0}s</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={5}
                            step={0.1}
                            value={clipSettings[activePreviewId]?.fadeOut ?? 0}
                            onChange={(e) => setClipSettings((prev: any) => ({ ...prev, [activePreviewId]: { ...prev[activePreviewId], fadeOut: Number(e.target.value) } }))}
                            className="w-full accent-purple-400"
                        />
                    </div>
                </div>
            );
        case 'opacity':
            return (
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">Opacity</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-300">
                        <span>{clipSettings[activePreviewId]?.opacity ?? 100}%</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={clipSettings[activePreviewId]?.opacity ?? 100}
                        onChange={(e) => setClipSettings((prev: any) => ({ ...prev, [activePreviewId]: { ...prev[activePreviewId], opacity: Number(e.target.value) } }))}
                        className="w-full accent-purple-400"
                    />
                </div>
            );
        case 'blur':
            return (
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">Blur</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-300">
                        <span>{clipSettings[activePreviewId]?.blur ?? 0}px</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={20}
                        value={clipSettings[activePreviewId]?.blur ?? 0}
                        onChange={(e) => setClipSettings((prev: any) => ({ ...prev, [activePreviewId]: { ...prev[activePreviewId], blur: Number(e.target.value) } }))}
                        className="w-full accent-purple-400"
                    />
                </div>
            );
        case 'border':
            return (
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">Border</span>
                    <label className="flex items-center gap-2 cursor-pointer mt-2 text-[10px] font-bold text-slate-300">
                        <input 
                            type="checkbox" 
                            checked={clipSettings[activePreviewId]?.border || false}
                            onChange={(e) => setClipSettings((prev: any) => ({ ...prev, [activePreviewId]: { ...prev[activePreviewId], border: e.target.checked } }))}
                            className="accent-purple-400"
                        />
                        Enable White Border
                    </label>
                </div>
            );
        case 'bg':
            return (
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">Background</span>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {['transparent', '#000000', '#ffffff', '#FF3B30', '#4CD964', '#007AFF', '#FF9500', '#5856D6'].map(color => (
                            <button
                                key={color}
                                onClick={() => setClipSettings((prev: any) => ({ ...prev, [activePreviewId]: { ...prev[activePreviewId], bg: color } }))}
                                className={`w-6 h-6 rounded-full border-2 ${(clipSettings[activePreviewId]?.bg || 'transparent') === color ? 'border-white' : 'border-transparent'} shadow-sm`}
                                style={{ backgroundColor: color === 'transparent' ? '#111' : color, backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #222 25%, transparent 25%, transparent 75%, #222 75%, #222), linear-gradient(45deg, #222 25%, transparent 25%, transparent 75%, #222 75%, #222)' : 'none', backgroundSize: '8px 8px', backgroundPosition: '0 0, 4px 4px' }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
            );
        default:
            return null;
    }
});

// Cache for cutout mask Image elements to keep canvas loops extremely fast
const maskImageCache: Record<string, HTMLImageElement> = {};
const getCachedMaskImage = (url: string) => {
    if (!maskImageCache[url]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        maskImageCache[url] = img;
    }
    return maskImageCache[url];
};

// Main cutout compositing and stroke rendering helper
const applyCutout = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, source: HTMLVideoElement | HTMLImageElement, cutout: any) => {
    if (!cutout || !cutout.enabled || !cutout.maskDataUrl) {
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
        return;
    }

    const maskImg = getCachedMaskImage(cutout.maskDataUrl);
    if (!maskImg || !maskImg.complete) {
        // Fallback to normal drawing while mask is loading
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
        return;
    }

    // Draw the main video/image frame first
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

    // Create a temporary offscreen canvas to process the mask (feathering & expand)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    const expand = cutout.expand ?? 0;
    const feather = cutout.feather ?? 0;

    tempCtx.save();
    if (feather > 0) {
        tempCtx.filter = `blur(${feather}px)`;
    }

    if (expand !== 0) {
        if (expand > 0) {
            // Dilate mask by drawing in circular offsets
            const steps = Math.min(8, Math.abs(expand));
            for (let i = 0; i < 360; i += 360 / steps) {
                const rad = (i * Math.PI) / 180;
                const ox = Math.cos(rad) * expand;
                const oy = Math.sin(rad) * expand;
                tempCtx.drawImage(maskImg, ox, oy, tempCanvas.width, tempCanvas.height);
            }
            tempCtx.drawImage(maskImg, 0, 0, tempCanvas.width, tempCanvas.height);
        } else {
            // Erode mask by subtracting circular offsets
            tempCtx.drawImage(maskImg, 0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.globalCompositeOperation = 'destination-out';
            const erode = Math.abs(expand);
            const steps = Math.min(8, erode);
            for (let i = 0; i < 360; i += 360 / steps) {
                const rad = (i * Math.PI) / 180;
                const ox = Math.cos(rad) * erode;
                const oy = Math.sin(rad) * erode;
                tempCtx.drawImage(maskImg, ox, oy, tempCanvas.width, tempCanvas.height);
            }
        }
    } else {
        tempCtx.drawImage(maskImg, 0, 0, tempCanvas.width, tempCanvas.height);
    }
    tempCtx.restore();

    // Composite mask onto the main frame
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw stroke/glow outlines if requested
    const stroke = cutout.stroke;
    if (stroke && stroke.preset !== 'none' && stroke.size > 0) {
        const strokeSize = stroke.size;
        const strokeColor = stroke.color || '#ffffff';
        const strokeOpacity = (stroke.opacity ?? 100) / 100;

        // Capture cutout shape
        const cutoutCanvas = document.createElement('canvas');
        cutoutCanvas.width = canvas.width;
        cutoutCanvas.height = canvas.height;
        const cutoutCtx = cutoutCanvas.getContext('2d');
        if (cutoutCtx) {
            cutoutCtx.drawImage(canvas, 0, 0);

            ctx.save();
            ctx.globalAlpha = strokeOpacity;

            if (stroke.preset === 'solid') {
                const strokeTemp = document.createElement('canvas');
                strokeTemp.width = canvas.width;
                strokeTemp.height = canvas.height;
                const sCtx = strokeTemp.getContext('2d');
                if (sCtx) {
                    sCtx.drawImage(cutoutCanvas, 0, 0);
                    sCtx.globalCompositeOperation = 'source-in';
                    sCtx.fillStyle = strokeColor;
                    sCtx.fillRect(0, 0, strokeTemp.width, strokeTemp.height);

                    const numOffsets = 16;
                    for (let i = 0; i < 360; i += 360 / numOffsets) {
                        const rad = (i * Math.PI) / 180;
                        const ox = Math.cos(rad) * strokeSize;
                        const oy = Math.sin(rad) * strokeSize;
                        ctx.drawImage(strokeTemp, ox, oy);
                    }
                }
            } else if (stroke.preset === 'glow' || stroke.preset === 'shadow') {
                ctx.shadowColor = strokeColor;
                ctx.shadowBlur = strokeSize;
                if (stroke.preset === 'shadow') {
                    ctx.shadowOffsetX = 5;
                    ctx.shadowOffsetY = 5;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                } else {
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                }
                ctx.drawImage(cutoutCanvas, 0, 0);
            } else if (stroke.preset === 'neon') {
                ctx.shadowColor = strokeColor;
                ctx.shadowBlur = strokeSize * 1.5;
                ctx.drawImage(cutoutCanvas, 0, 0);
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = strokeSize * 0.5;
                ctx.drawImage(cutoutCanvas, 0, 0);
            } else if (stroke.preset === 'double') {
                const strokeTemp1 = document.createElement('canvas');
                const strokeTemp2 = document.createElement('canvas');
                strokeTemp1.width = canvas.width; strokeTemp1.height = canvas.height;
                strokeTemp2.width = canvas.width; strokeTemp2.height = canvas.height;
                const sCtx1 = strokeTemp1.getContext('2d');
                const sCtx2 = strokeTemp2.getContext('2d');
                if (sCtx1 && sCtx2) {
                    sCtx1.drawImage(cutoutCanvas, 0, 0);
                    sCtx1.globalCompositeOperation = 'source-in';
                    sCtx1.fillStyle = '#000000';
                    sCtx1.fillRect(0, 0, strokeTemp1.width, strokeTemp1.height);

                    sCtx2.drawImage(cutoutCanvas, 0, 0);
                    sCtx2.globalCompositeOperation = 'source-in';
                    sCtx2.fillStyle = strokeColor;
                    sCtx2.fillRect(0, 0, strokeTemp2.width, strokeTemp2.height);

                    const outerSize = strokeSize * 1.5;
                    for (let i = 0; i < 360; i += 360 / 16) {
                        const rad = (i * Math.PI) / 180;
                        const ox = Math.cos(rad) * outerSize;
                        const oy = Math.sin(rad) * outerSize;
                        ctx.drawImage(strokeTemp1, ox, oy);
                    }
                    for (let i = 0; i < 360; i += 360 / 16) {
                        const rad = (i * Math.PI) / 180;
                        const ox = Math.cos(rad) * strokeSize;
                        const oy = Math.sin(rad) * strokeSize;
                        ctx.drawImage(strokeTemp2, ox, oy);
                    }
                }
            }

            ctx.restore();
            ctx.drawImage(cutoutCanvas, 0, 0);
        }
    }
};

// Canvas-based image cutout preview component
const ImageCutoutCanvas = ({ src, cutout, className, style }: any) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        img.onload = () => {
            canvas.width = img.naturalWidth || 800;
            canvas.height = img.naturalHeight || 600;
            applyCutout(ctx, canvas, img, cutout);
        };
    }, [src, cutout]);

    return <canvas ref={canvasRef} className={className} style={style} />;
};

export const QuickEditStyleScreen = memo(function QuickEditStyleScreen() {
    const { profile, session } = useAuth();

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    type FilterType =
        | 'none'
        | 'cinematic'
        | 'moody'
        | 'warm-tone'
        | 'cool-tone'
        | 'vintage'
        | 'black-white'
        | 'teal-orange'
        | 'dreamy-glow'
        | 'film-look'
        | 'vhs'
        | 'soft-skin'
        | 'neon-glow'
        | 'hdr-pop';

    const navigate = useNavigate();
    const location = useLocation();
    const mediaInputRef = useRef<HTMLInputElement>(null);

    // -- AI Cutout Hooks & Callbacks --
    const { generateMask, isProcessing: isCutoutProcessing, error: cutoutError } = useCutoutMask();
    const handleTriggerCutoutSegmentation = async (clipId: string) => {
        const item = mediaItems.find((i: any) => i?.id === clipId);
        if (!item) return;
        const maskUrl = await generateMask(clipId, (item?.type || 'video') as any, (item?.preview) || '', (item?.file) || null);
        if (maskUrl) {
            setClipSettings(prev => ({
                ...prev,
                [clipId]: {
                    ...prev[clipId],
                    cutout: {
                        ...(prev[clipId]?.cutout || {}),
                        enabled: true,
                        maskDataUrl: maskUrl
                    }
                }
            }));
        }
    };

    // -- State Management --
    const [selectedStyle, setSelectedStyle] = useState("youtube");
    const [localFilterCategory, setLocalFilterCategory] = useState('all');
    const { aspectRatio, applyAspectRatio, formattedRatio, getRatioValue } = useAspectRatio();
    const [isCustomFrameOpen, setIsCustomFrameOpen] = useState(false);
    const [fps, setFps] = useState(60);
    const [exportQuality, setExportQuality] = useState("1080p");
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        preset: true,
        transform: false,
        cropping: false,
        speed: false,
        audio: false,
        text: false,
        fx: false
    });

    const [watermark, setWatermark] = useState(true);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [premiumFeature, setPremiumFeature] = useState<"watermark" | "4k" | "60fps" | "general">("general");
    const [isMusicPickerOpen, setIsMusicPickerOpen] = useState(false);
    const { selectedMusic, clearMusic } = useMusicContext();

    const handlePremiumIntercept = (feature: "watermark" | "4k" | "60fps") => {
        setPremiumFeature(feature);
        setIsPremiumModalOpen(true);
    };


    const [mediaItems, setMediaItems] = useState<Array<{ id: string, file?: File | null, preview?: string, type: string, duration: number, startTime?: number, [key: string]: any }>>([]);
    const [libraryAssets, setLibraryAssets] = useState<Array<{ id: string, file?: File | null, preview?: string, type: string, duration: number, startTime?: number, [key: string]: any }>>([]);
    const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
    const [leftTab, setLeftTab] = useState<'media' | 'stock' | 'audio' | 'titles' | 'captions' | 'transitions' | 'effects' | 'filters' | 'frames' | 'tools'>('media');
    const [audioCategory, setAudioCategory] = useState('favorites');
    const [audioMusicExpanded, setAudioMusicExpanded] = useState(true);
    const [audioSfxExpanded, setAudioSfxExpanded] = useState(true);
    const [isMediaPoolVisible, setIsMediaPoolVisible] = useState(true);
    const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
    const [audioTracks, setAudioTracks] = useState<Array<{ id: string, name: string, type: 'extracted' | 'direct', file?: File }>>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [bgMusicUrl, setBgMusicUrl] = useState<string | null>(null);
    const [showAudioChoice, setShowAudioChoice] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const [extractingAudio, setExtractingAudio] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [history, setHistory] = useState<Array<string>>([]); // Store as JSON strings for easier comparison
    const [historyIndex, setHistoryIndex] = useState(-1);
    const createdPreviewUrlsRef = useRef<string[]>([]);

    // Manage audio object URL to prevent memory leaks
    useEffect(() => {
        if (audioTracks.length > 0 && audioTracks[0].file) {
            const url = URL.createObjectURL(audioTracks[0].file);
            setAudioUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setAudioUrl(null);
        }
    }, [audioTracks]);

    // Manage background music object URL/library URL
    useEffect(() => {
        if (selectedMusic) {
            if (selectedMusic.source === 'library' && selectedMusic.url) {
                setBgMusicUrl(selectedMusic.url);
            } else if (selectedMusic.source === 'device' && selectedMusic.file) {
                const url = URL.createObjectURL(selectedMusic.file);
                setBgMusicUrl(url);
                return () => URL.revokeObjectURL(url);
            }
        } else {
            setBgMusicUrl(null);
        }
    }, [selectedMusic]);

    useEffect(() => {
        return () => {
            createdPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
            createdPreviewUrlsRef.current = [];
        };
    }, []);



    const getMediaDuration = (file: File): Promise<number> => {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                resolve(3.0); // Default 3s for images
                return;
            }
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                resolve(video.duration);
            };
            video.onerror = () => resolve(3.0);
            video.src = URL.createObjectURL(file);
        });
    };

    const getMediaDurationFromPreview = (previewUrl: string, type: 'video' | 'image'): Promise<number> => {
        return new Promise((resolve) => {
            if (type === 'image') {
                resolve(3.0);
                return;
            }
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                const duration = Number(video.duration || 0);
                resolve(duration > 0 ? duration : 10);
            };
            video.onerror = () => resolve(10);
            video.src = previewUrl;
        });
    };

    const [aiOptions, setAiOptions] = useState({
        subtitles: true,
        autoCuts: true,
        backgroundMusic: false,
        faceTracking: true,
    });
    const [prompt, setPrompt] = useState("");
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [pendingInsertTargetId, setPendingInsertTargetId] = useState<string | null>(null);
    const [pendingInsertType, setPendingInsertType] = useState<string | null>(null);
    const [activeTransitionTargetId, setActiveTransitionTargetId] = useState<string | null>(null);
    const [activeTransitionNextId, setActiveTransitionNextId] = useState<string | null>(null);
    const [isTextPlacementMode, setIsTextPlacementMode] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
    const [overlayText, setOverlayText] = useState('');
    const [overlayFontId, setOverlayFontId] = useState('rubik');
    const [overlayFontSize, setOverlayFontSize] = useState(48);
    const [overlayColor, setOverlayColor] = useState('#FFFFFF');
    const [overlayTextStylePreset, setOverlayTextStylePreset] = useState<string | null>(null);
    const [overlayPosX, setOverlayPosX] = useState(50);
    const [overlayPosY, setOverlayPosY] = useState(50);
    const [overlayBgEnabled, setOverlayBgEnabled] = useState(false);
    const [overlayBgColorHex, setOverlayBgColorHex] = useState('#000000');
    
    // New Text Properties State
    const [overlayOpacity, setOverlayOpacity] = useState(100);
    const [overlayStrokeEnabled, setOverlayStrokeEnabled] = useState(false);
    const [overlayStrokeColor, setOverlayStrokeColor] = useState('#000000');
    const [overlayStrokeOpacity, setOverlayStrokeOpacity] = useState(100);
    const [overlayShadowEnabled, setOverlayShadowEnabled] = useState(false);
    const [overlayShadowColor, setOverlayShadowColor] = useState('#000000');
    const [overlayShadowOpacity, setOverlayShadowOpacity] = useState(100);
    const [overlayShadowBlur, setOverlayShadowBlur] = useState(50);
    const [overlayBgRadius, setOverlayBgRadius] = useState(0);
    const [overlayBgPaddingX, setOverlayBgPaddingX] = useState(0.6);
    const [overlayBgPaddingY, setOverlayBgPaddingY] = useState(0.6);
    const [overlayBgOffsetX, setOverlayBgOffsetX] = useState(0);
    const [overlayBgOffsetY, setOverlayBgOffsetY] = useState(0);
    
    const [overlayTextStyleBold, setOverlayTextStyleBold] = useState(false);
    const [overlayTextStyleItalic, setOverlayTextStyleItalic] = useState(false);
    const [overlayTextStyleUnderline, setOverlayTextStyleUnderline] = useState(false);
    const [overlayAlignment, setOverlayAlignment] = useState<'left' | 'center' | 'right'>('left');
    const [overlayListStyle, setOverlayListStyle] = useState<'none' | 'bullet' | 'number'>('none');
    const [overlayCase, setOverlayCase] = useState<'none' | 'upper' | 'lower' | 'title'>('none');
    
    // Spacing & Position States
    const [overlayAnchor, setOverlayAnchor] = useState<'top' | 'center' | 'bottom'>('top');
    const [overlayTextBoxSetting, setOverlayTextBoxSetting] = useState<'auto' | 'fixed'>('auto');
    const [overlayLetterSpacing, setOverlayLetterSpacing] = useState(0);
    const [overlayLineSpacing, setOverlayLineSpacing] = useState(0);
    const [overlayAnimationIn, setOverlayAnimationIn] = useState<'none' | 'fade' | 'slide-left' | 'zoom-in'>('none');
    const [overlayAnimationOut, setOverlayAnimationOut] = useState<'none' | 'fade' | 'slide-right' | 'zoom-out'>('none');
    const [overlayAnimationLoop, setOverlayAnimationLoop] = useState<'none' | 'pulse' | 'shake' | 'float' | 'wobble' | 'blink' | 'typewriter'>('none');
    const [speedValue, setSpeedValue] = useState(1);
    const [rotationDegrees, setRotationDegrees] = useState(0);
    const [volumeLevel, setVolumeLevel] = useState(1);
    const [isDenoiseEnabled, setIsDenoiseEnabled] = useState(false);

    const [zoomToolAmount, setZoomToolAmount] = useState(1);
    const [zoomToolAmountX, setZoomToolAmountX] = useState(1);
    const [zoomToolAmountY, setZoomToolAmountY] = useState(1);
    const [isAspectLocked, setIsAspectLocked] = useState(true);
    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(0);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [cornerRadius, setCornerRadius] = useState(0);
    const [anchorX, setAnchorX] = useState(0);
    const [anchorY, setAnchorY] = useState(0);

    const [compositingShadow, setCompositingShadow] = useState(false);
    const [compositingBg, setCompositingBg] = useState(false);
    const [compositingEyeContact, setCompositingEyeContact] = useState(false);
    const [compositingRefocus, setCompositingRefocus] = useState(false);
    const [compositingRelight, setCompositingRelight] = useState(false);

    const [inspectorTab, setInspectorTab] = useState<'video' | 'audio' | 'speed' | 'animation' | 'color' | 'bg' | 'opacity'>('video');
    const [isDurationOpen, setIsDurationOpen] = useState(false);
    const [isFadeOpen, setIsFadeOpen] = useState(false);
    const [fadeInVal, setFadeInVal] = useState<number>(0.0);
    const [fadeOutVal, setFadeOutVal] = useState<number>(0.0);
    // Track original settings so Cancel works
    const fadeOriginalSettingsRef = useRef({ fadeIn: 0, fadeOut: 0 });

    const openFadeEditor = (clipId: string) => {
        const settings = clipSettings[clipId] || {};
        const fi = settings.fadeIn || 0;
        const fo = settings.fadeOut || 0;
        setFadeInVal(fi);
        setFadeOutVal(fo);
        fadeOriginalSettingsRef.current = { fadeIn: fi, fadeOut: fo };
        setIsFadeOpen(true);
    };
    const [isAutoCaptionOpen, setIsAutoCaptionOpen] = useState(false);
    const [autoCaptionLang, setAutoCaptionLang] = useState("Auto");
    const [autoCaptionMode, setAutoCaptionMode] = useState("Tiny");
    const [isConvertingCaption, setIsConvertingCaption] = useState(false);
    const [durationPreset, setDurationPreset] = useState<string>('Original');
    const [durationActiveClipIdx, setDurationActiveClipIdx] = useState<number>(0);
    const [colorSubTab, setColorSubTab] = useState<'filters' | 'adjust'>('filters');
    const [filterIntensity, setFilterIntensity] = useState<number>(100);
    const [selectedFilterPreset, setSelectedFilterPreset] = useState<string>('Original');
    // Adjust panel sliders
    const [adjVibrance, setAdjVibrance] = useState(0);
    const [adjTemperature, setAdjTemperature] = useState(0);
    const [adjVignette, setAdjVignette] = useState(0);
    const [adjSharpen, setAdjSharpen] = useState(0);
    const [adjHue, setAdjHue] = useState(0);
    const [adjHighlights, setAdjHighlights] = useState(0);
    const [adjShadows, setAdjShadows] = useState(0);
    const [adjNoiseReduction, setAdjNoiseReduction] = useState(0);
    const [selectedColorWheel, setSelectedColorWheel] = useState(0); // 0=red,1=orange,...
    const [hslHue, setHslHue] = useState(0);
    const [hslSaturation, setHslSaturation] = useState(0);
    const [hslLightness, setHslLightness] = useState(0);
    // BG Tab state
    const [bgSubTab, setBgSubTab] = useState<'blur' | 'color'>('blur');
    const [bgBlur, setBgBlur] = useState(30);
    const [bgBlurStyle, setBgBlurStyle] = useState('none');
    const [bgColorHex, setBgColorHex] = useState('#000000');
    const [bgHue, setBgHue] = useState(0); // 0-360 for hue slider
    const [bgSatPos, setBgSatPos] = useState({ x: 100, y: 0 }); // saturation/value picker pos %
    const [inspectorSubTab, setInspectorSubTab] = useState<'basic' | 'mask' | 'ai-matte'>('basic');
    const [isTransformExpanded, setIsTransformExpanded] = useState(true);
    const [isCompositingExpanded, setIsCompositingExpanded] = useState(true);
    const [isTransformEnabled, setIsTransformEnabled] = useState(true);
    const [isCompositingEnabled, setIsCompositingEnabled] = useState(true);

    // Border Tab state
    const [borderWidth, setBorderWidth] = useState(0);
    const [borderColorHex, setBorderColorHex] = useState('#ffffff');
    const [borderHue, setBorderHue] = useState(0);
    const [borderSatPos, setBgBorderSatPos] = useState({ x: 0, y: 0 }); // top-left is white (#ffffff)

    const [hasTransformKeyframe, setHasTransformKeyframe] = useState(false);
    const [hasWidthKeyframe, setHasWidthKeyframe] = useState(false);
    const [hasHeightKeyframe, setHasHeightKeyframe] = useState(false);
    const [hasPositionKeyframe, setHasPositionKeyframe] = useState(false);
    const [hasRotateKeyframe, setHasRotateKeyframe] = useState(false);
    const [hasRadiusKeyframe, setHasRadiusKeyframe] = useState(false);
    const [hasCompositingKeyframe, setHasCompositingKeyframe] = useState(false);
    const [hasOpacityKeyframe, setHasOpacityKeyframe] = useState(false);
    const [compositingKeyframes, setCompositingKeyframes] = useState<Record<string, boolean>>({});
    const [hasSpeedKeyframe, setHasSpeedKeyframe] = useState(false);
    const [hasMultiplierKeyframe, setHasMultiplierKeyframe] = useState(false);
    const [hasAnimationKeyframe, setHasAnimationKeyframe] = useState(false);
    const [hasStrengthKeyframe, setHasStrengthKeyframe] = useState(false);
    const [hasAudioKeyframe, setHasAudioKeyframe] = useState(false);
    const [hasGainKeyframe, setHasGainKeyframe] = useState(false);
    const [hasMuteKeyframe, setHasMuteKeyframe] = useState(false);
    const [hasBrightnessKeyframe, setHasBrightnessKeyframe] = useState(false);
    const [hasContrastKeyframe, setHasContrastKeyframe] = useState(false);
    const [hasSaturationKeyframe, setHasSaturationKeyframe] = useState(false);
    const toggleCompositingKeyframe = (label: string) => {
        setCompositingKeyframes(prev => ({ ...prev, [label]: !prev[label] }));
    };

    useEffect(() => {
        if (isAspectLocked) {
            setZoomToolAmountX(zoomToolAmount);
            setZoomToolAmountY(zoomToolAmount);
        }
    }, [zoomToolAmount, isAspectLocked]);

    const getCombinedPreviewTransform = () => {
        const activeClipSettings = activePreviewId ? clipSettings[activePreviewId] || {} : {};
        const clipMirror = activeClipSettings.mirror ? -1 : 1;
        const clipFlip = activeClipSettings.flip ? -1 : 1;
        
        let keyframeScale = 1;
        if (keyframeMode === 'zoom-in') {
            keyframeScale = 1 + (keyframeAmount - 1) * keyframeProgress;
        } else if (keyframeMode === 'zoom-out') {
            keyframeScale = keyframeAmount - (keyframeAmount - 1) * keyframeProgress;
        } else if (keyframeMode === 'pulse') {
            keyframeScale = 1 + (keyframeAmount - 1) * Math.sin(keyframeProgress * Math.PI);
        }
        
        let base = '';
        if (isTransformEnabled || clipMirror === -1 || clipFlip === -1 || keyframeScale !== 1) {
            const scaleX = (isTransformEnabled ? zoomToolAmountX : 1) * clipMirror * keyframeScale;
            const scaleY = (isTransformEnabled ? zoomToolAmountY : 1) * clipFlip * keyframeScale;
            base = `translate(${posX}px, ${posY}px) scale(${scaleX}, ${scaleY}) rotate(${rotationDegrees}deg) `;
        }
        
        let shakeOffset = '';
        if (selectedEffect === 'shake') {
            const t = performance.now() / 100;
            const x = Math.sin(t * 18) * shakeStrength * 2.5;
            const y = Math.cos(t * 22) * shakeStrength * 2.5;
            shakeOffset = `translate(${x}px, ${y}px) `;
        }

        let rgbOffset = '';
        if (selectedEffect === 'rgb-split') {
            const offset = rgbSplitAmount;
            rgbOffset = `translate(${Math.sin(performance.now() / 150) * offset * 0.4}px, ${Math.cos(performance.now() / 180) * offset * 0.25}px) `;
        }

        let glitchOffset = '';
        if (selectedEffect === 'glitch') {
            const t = performance.now() / 130;
            const x = Math.sin(t * 25) * 2.5;
            const y = Math.cos(t * 31) * 1.8;
            glitchOffset = `translate(${x}px, ${y}px) `;
        }

        return `${base}${shakeOffset}${rgbOffset}${glitchOffset}`;
    };

    const [cropCenterX, setCropCenterX] = useState(50);
    const [cropCenterY, setCropCenterY] = useState(50);
    const [cropWidthPct, setCropWidthPct] = useState(100);
    const [cropHeightPct, setCropHeightPct] = useState(100);
    const [keyframeMode, setKeyframeMode] = useState<'none' | 'zoom-in' | 'zoom-out' | 'pulse'>('none');
    const [keyframeAmount, setKeyframeAmount] = useState(1.25);
    const [keyframeProgress, setKeyframeProgress] = useState(0);
    const [clipTrimRanges, setClipTrimRanges] = useState<Record<string, { start: number; end: number | null }>>({});
    const [clipSettings, setClipSettings] = useState<Record<string, any>>({});

    type TransitionType = string;

    const [clipTransitions, setClipTransitions] = useState<Record<string, TransitionType>>({});
    const [clipStartOverrides, setClipStartOverrides] = useState<Record<string, number>>({});
    const [clipTrackOverrides, setClipTrackOverrides] = useState<Record<string, string>>({});
    const [clipNameOverrides, setClipNameOverrides] = useState<Record<string, string>>({});
    const [clipLockedStates, setClipLockedStates] = useState<Record<string, boolean>>({});
    const [transitionOverlay, setTransitionOverlay] = useState<{
        fromId: string;
        toId: string;
        type: TransitionType;
        startAt: number;
        durationMs: number;
    } | null>(null);
    const [transitionProgress, setTransitionProgress] = useState(0);
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('none');
    const [blurAmount, setBlurAmount] = useState(10);
    const [selectedEffect, setSelectedEffect] = useState<string>('none');
    const [proParams, setProParams] = useState<Record<string, any>>({});
    const [effectsCategory, setEffectsCategory] = useState<string>('all');
    const [transitionsCategory, setTransitionsCategory] = useState<string>('all');
    const [previewOpacity, setPreviewOpacity] = useState(1);
    const [previewZoom, setPreviewZoom] = useState(1);
    const [brightness, setBrightness] = useState(1);
    const [contrast, setContrast] = useState(1);
    const [saturation, setSaturation] = useState(1);
    const [slowMotionSpeed, setSlowMotionSpeed] = useState(0.25);
    const [glitchIntensity, setGlitchIntensity] = useState(1);
    const [velocitySpeed, setVelocitySpeed] = useState(1.5);
    const [motionBlurAmount, setMotionBlurAmount] = useState(3);
    const [shakeStrength, setShakeStrength] = useState(1.5);
    const [flashIntensity, setFlashIntensity] = useState(0.75);
    const [rgbSplitAmount, setRgbSplitAmount] = useState(12);
    const [smoothZoomAmount, setSmoothZoomAmount] = useState(0.35);
    const [filmGrainOpacity, setFilmGrainOpacity] = useState(0.4);
    const [animatedText, setAnimatedText] = useState('');

    // --- Caption state ---
    const [captions, setCaptions] = useState<Array<{ id: string; text: string; startTime: number; endTime: number; clipId?: string }>>([]);
    const [currentCaption, setCurrentCaption] = useState<{ id: string; text: string; startTime: number; endTime: number; clipId?: string } | null>(null);
    const [captionLanguage, setCaptionLanguage] = useState('en');
    const [detectSpeakers, setDetectSpeakers] = useState(false);
    const [captionStyle, setCaptionStyle] = useState({
        fontId: 'sans',
        fontSize: 32,
        color: '#FFFFFF',
        bgEnabled: true,
        bgColorHex: '#000000',
        alignment: 'center' as 'left' | 'center' | 'right',
        bold: true,
        italic: false,
        outline: false,
        posX: 50,
        posY: 85,
    });
    const [captionStylePreset, setCaptionStylePreset] = useState<string | null>(null);
    const getOverlayTextStylePresetCss = useCallback((preset: string | null) => {
        const selectedFont = textFontOptions.find((f) => f.id === overlayFontId);
        const baseStyle: any = {
            fontFamily: selectedFont?.family || textFontOptions[0].family,
            fontSize: `${overlayFontSize}px`,
            color: overlayColor,
            fontWeight: selectedFont?.fontWeight || 700,
            letterSpacing: selectedFont?.letterSpacing || 'normal',
            textTransform: 'none',
            textShadow: '0 4px 14px rgba(0,0,0,0.75)',
            background: 'transparent',
            padding: undefined,
            borderRadius: undefined,
            border: undefined,
            lineHeight: 1.05,
            whiteSpace: 'pre-wrap',
        };

        switch (preset) {
            case 'cinematic-title':
                return {
                    ...baseStyle,
                    fontSize: `${Math.max(overlayFontSize, 60)}px`,
                    color: '#F8F3E8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    textShadow: '0 20px 48px rgba(0,0,0,0.55)',
                    background: 'rgba(0,0,0,0.15)',
                    padding: '6px 12px',
                    borderRadius: '18px',
                };
            case 'animated-captions':
                return {
                    ...baseStyle,
                    fontSize: `${Math.max(overlayFontSize, 42)}px`,
                    textShadow: '0 8px 20px rgba(0,0,0,0.45)',
                    background: 'rgba(15,23,42,0.7)',
                    padding: '10px 16px',
                    borderRadius: '24px',
                    letterSpacing: '0.04em',
                };
            case 'kinetic-typography':
                return {
                    ...baseStyle,
                    fontSize: `${Math.max(overlayFontSize, 54)}px`,
                    fontWeight: 900,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    textShadow: '0 10px 34px rgba(0,0,0,0.35)',
                    background: 'rgba(255,255,255,0.04)',
                    padding: '8px 14px',
                    borderRadius: '14px',
                };
            case 'neon-glow-text':
                return {
                    ...baseStyle,
                    color: '#7CFC00',
                    textShadow: '0 0 12px rgba(124,252,0,0.8), 0 0 28px rgba(124,252,0,0.4), 0 0 48px rgba(124,252,0,0.2)',
                    fontWeight: 800,
                };
            case 'glitch-text':
                return {
                    ...baseStyle,
                    color: '#FFFFFF',
                    letterSpacing: '0.06em',
                    textShadow: '0 0 4px rgba(255,0,120,0.8), 0 0 8px rgba(0,220,255,0.65)',
                    fontWeight: 900,
                    background: 'rgba(0,0,0,0.2)',
                    padding: '8px 12px',
                    borderRadius: '12px',
                };
            case 'typewriter-text':
                return {
                    ...baseStyle,
                    fontFamily: 'monospace, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    letterSpacing: '0.12em',
                    color: '#E2E8F0',
                    background: 'rgba(3,7,18,0.85)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    textShadow: '0 3px 12px rgba(0,0,0,0.45)',
                };
            case 'bold-hype-text':
                return {
                    ...baseStyle,
                    color: '#FFD166',
                    fontWeight: 900,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    textShadow: '0 0 20px rgba(255,209,102,0.65)',
                    background: 'rgba(20,20,30,0.55)',
                    padding: '8px 14px',
                    borderRadius: '18px',
                };
            case 'lyrics-text':
                return {
                    ...baseStyle,
                    fontSize: `${Math.max(overlayFontSize, 36)}px`,
                    color: '#F8FAFC',
                    fontStyle: 'italic',
                    letterSpacing: '0.04em',
                    textShadow: '0 18px 36px rgba(0,0,0,0.3)',
                    lineHeight: 1.2,
                };
            case 'minimal-clean-text':
                return {
                    ...baseStyle,
                    color: '#FFFFFF',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textShadow: 'none',
                    background: 'rgba(255,255,255,0.08)',
                    padding: '6px 10px',
                    borderRadius: '10px',
                };
            case '3d-text':
                return {
                    ...baseStyle,
                    color: '#F8FAFC',
                    textShadow: '2px 2px 0 rgba(15,23,42,0.95), 6px 6px 16px rgba(0,0,0,0.35)',
                    letterSpacing: '0.05em',
                    fontWeight: 900,
                };
            case 'subtitle-style-text':
                return {
                    ...baseStyle,
                    fontSize: `${Math.max(overlayFontSize * 0.75, 24)}px`,
                    letterSpacing: '0.04em',
                    color: '#FFFFFF',
                    background: 'rgba(0,0,0,0.78)',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    textTransform: 'none',
                    lineHeight: 1.2,
                };
            case 'motion-tracking-text':
                return {
                    ...baseStyle,
                    color: '#FFFFFF',
                    letterSpacing: '0.16em',
                    textShadow: '0 14px 28px rgba(0,0,0,0.35)',
                    background: 'rgba(0,0,0,0.24)',
                    padding: '10px 16px',
                    borderRadius: '999px',
                    fontWeight: 800,
                };
            default:
                return baseStyle;
        }
    }, [overlayFontId, overlayFontSize, overlayColor]);

    const getOverlayTextEffectForPreset = useCallback((preset: string | null) => {
        if (preset === 'animated-captions') return 'animated-captions';
        if (preset === 'motion-tracking-text') return 'motion-tracking';
        return 'none';
    }, []);
    const [isCaptionPlacementMode, setIsCaptionPlacementMode] = useState(false);
    const [isAutoCapturing, setIsAutoCapturing] = useState(false);
    const [autoCaptionStatus, setAutoCaptionStatus] = useState('');

    // --- Read-line state ---
    const [showReadLine, setShowReadLine] = useState(false);
    const [readLineDirection, setReadLineDirection] = useState<'horizontal' | 'vertical'>('horizontal');
    const [readLinePosition, setReadLinePosition] = useState<number>(0);

    // --- Auto-caption: stopAutoCaptionRef lets us stop capture from outside the closure ---
    const stopAutoCaptionRef = useRef<(() => void) | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const isPlayingRef = useRef(false);
    const [progress, setProgress] = useState(0);
    const [isToolboxOpen, setIsToolboxOpen] = useState(false);
    const [timelineSize, setTimelineSize] = useState<'minimized' | 'normal' | 'maximized'>('normal');

    const videoRef = useRef<HTMLVideoElement>(null);
    const bgVideoRef = useRef<HTMLVideoElement>(null);

    const [isCropMode, setIsCropMode] = useState(false);
    const CROP_RATIOS = [
        { id: 'Original', label: 'Original', icon: Square, ratio: 0 },
        { id: 'Free', label: 'Free', icon: Crop, ratio: 0 },
        { id: '9:16', label: '9:16', icon: Smartphone, ratio: 9/16 },
        { id: '1:1', label: '1:1', icon: Square, ratio: 1 },
        { id: '16:9', label: '16:9', icon: MonitorPlay, ratio: 16/9 },
        { id: '4:5', label: '4:5', icon: Smartphone, ratio: 4/5 },
        { id: '2:3', label: '2:3', ratio: 2/3 },
        { id: '3:4', label: '3:4', ratio: 3/4 },
        { id: '4:3', label: '4:3', ratio: 4/3 },
        { id: '3:2', label: '3:2', ratio: 3/2 },
        { id: '21:9', label: '21:9', ratio: 21/9 },
        { id: '42:9', label: '42:9', ratio: 42/9 },
        { id: '1.85:1', label: '1.85:1', ratio: 1.85/1 },
        { id: '2.35:1', label: '2.35:1', ratio: 2.35/1 },
        { id: '2:1', label: '2:1', ratio: 2/1 },
        { id: '1:2', label: '1:2', ratio: 1/2 },
    ];
    const handleCropRatioClick = (preset: any) => {
        if (preset.id === 'Original' || preset.id === 'Free') {
            setCropWidthPct(100);
            setCropHeightPct(100);
            setCropCenterX(50);
            setCropCenterY(50);
            return;
        }
        if (!videoRef.current) return;
        const vw = videoRef.current.videoWidth || 16;
        const vh = videoRef.current.videoHeight || 9;
        const videoRatio = vw / vh;
        const targetRatio = preset.ratio;
        let wPct = 100;
        let hPct = 100;
        if (targetRatio > videoRatio) {
            hPct = (videoRatio / targetRatio) * 100;
        } else if (targetRatio < videoRatio) {
            wPct = (targetRatio / videoRatio) * 100;
        }
        setCropWidthPct(wPct);
        setCropHeightPct(hPct);
        setCropCenterX(50);
        setCropCenterY(50);
    };
    const previewFrameRef = useRef<HTMLDivElement>(null);
    const pendingTransitionSeekRef = useRef<{ clipId: string; seekTime: number } | null>(null);
    const lastTriggeredEndRef = useRef<string | null>(null);

    const historyIndexRef = useRef(historyIndex);
    useEffect(() => { historyIndexRef.current = historyIndex; }, [historyIndex]);

    const saveToUndo = useCallback((
        items?: typeof mediaItems,
        transitions?: any,
        trimRanges?: any,
        startOverrides?: any,
        trackOverrides?: any,
        nameOverrides?: any,
        lockedStates?: any,
        settings?: any
    ) => {
        const stateObj = {
            mediaItems: items !== undefined ? items : mediaItems,
            clipTransitions: transitions !== undefined ? transitions : clipTransitions,
            clipTrimRanges: trimRanges !== undefined ? trimRanges : clipTrimRanges,
            clipStartOverrides: startOverrides !== undefined ? startOverrides : clipStartOverrides,
            clipTrackOverrides: trackOverrides !== undefined ? trackOverrides : clipTrackOverrides,
            clipNameOverrides: nameOverrides !== undefined ? nameOverrides : clipNameOverrides,
            clipLockedStates: lockedStates !== undefined ? lockedStates : clipLockedStates,
            clipSettings: settings !== undefined ? settings : clipSettings,
        };
        const stateStr = JSON.stringify(stateObj);
        setHistory(prev => {
            const curIdx = historyIndexRef.current;
            if (prev[curIdx] === stateStr) return prev;
            const newHistory = prev.slice(0, curIdx + 1);
            return [...newHistory, stateStr];
        });
        setHistoryIndex(prev => prev + 1);
    }, [mediaItems, clipTransitions, clipTrimRanges, clipStartOverrides, clipTrackOverrides, clipNameOverrides, clipLockedStates, clipSettings]);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const undo = useCallback(() => {
        setHistoryIndex(prevIdx => {
            if (prevIdx > 0) {
                const targetIdx = prevIdx - 1;
                const stateStr = history[targetIdx];
                if (stateStr) {
                    try {
                        const prevState = JSON.parse(stateStr);
                        if (prevState.mediaItems) setMediaItems(prevState.mediaItems);
                        setClipTransitions(prevState.clipTransitions || {});
                        setClipTrimRanges(prevState.clipTrimRanges || {});
                        setClipStartOverrides(prevState.clipStartOverrides || {});
                        setClipTrackOverrides(prevState.clipTrackOverrides || {});
                        setClipNameOverrides(prevState.clipNameOverrides || {});
                        setClipLockedStates(prevState.clipLockedStates || {});
                        setClipSettings(prevState.clipSettings || {});
                    } catch (err) {
                        console.error('Failed to parse undo state:', err);
                    }
                }
                return targetIdx;
            }
            return prevIdx;
        });
    }, [history]);

    const redo = useCallback(() => {
        setHistoryIndex(prevIdx => {
            if (prevIdx < history.length - 1) {
                const targetIdx = prevIdx + 1;
                const stateStr = history[targetIdx];
                if (stateStr) {
                    try {
                        const nextState = JSON.parse(stateStr);
                        if (nextState.mediaItems) setMediaItems(nextState.mediaItems);
                        setClipTransitions(nextState.clipTransitions || {});
                        setClipTrimRanges(nextState.clipTrimRanges || {});
                        setClipStartOverrides(nextState.clipStartOverrides || {});
                        setClipTrackOverrides(nextState.clipTrackOverrides || {});
                        setClipNameOverrides(nextState.clipNameOverrides || {});
                        setClipLockedStates(nextState.clipLockedStates || {});
                        setClipSettings(nextState.clipSettings || {});
                    } catch (err) {
                        console.error('Failed to parse redo state:', err);
                    }
                }
                return targetIdx;
            }
            return prevIdx;
        });
    }, [history]);

    const handleApplyToAllVolume = useCallback(() => {
        if (!activePreviewItem) return;
        setClipSettings(prev => {
            const updated = { ...prev };
            mediaItems.forEach(item => {
                updated[item?.id] = { ...(updated[item?.id] || {}), volumeLevel, isMuted, isDenoiseEnabled };
            });
            saveToUndo(mediaItems, undefined, undefined, undefined, undefined, undefined, undefined, updated);
            return updated;
        });
    }, [volumeLevel, isMuted, isDenoiseEnabled, mediaItems, setClipSettings, saveToUndo]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeTag = (document.activeElement as HTMLElement)?.tagName;
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                if (e.shiftKey) {
                    e.preventDefault();
                    redo();
                } else {
                    e.preventDefault();
                    undo();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    // --- Auto-caption handler (Gemini via backend) ---
    const handleAutoCaption = useCallback(async () => {
        // Find the active video clip or the first video clip
        const activeClip = mediaItems.find((item: any) => item?.id === activePreviewId && (item?.type || 'video') === 'video')
            || mediaItems.find((item: any) => (item?.type || 'video') === 'video');

        if (!activeClip || !activeClip.file) {
            setAutoCaptionStatus('Ã¢ÂÅ’ No video clip loaded to transcribe. Add a video clip first.');
            return;
        }

        setIsAutoCapturing(true);
        setAutoCaptionStatus('Ã°Å¸Å½â„¢Ã¯Â¸Â Uploading to Gemini for transcriptionÃ¢â‚¬Â¦');

        try {
            const formData = new FormData();
            formData.append('file', activeClip.file);
            formData.append('language', captionLanguage);
            formData.append('detect_speakers', String(detectSpeakers));

            setAutoCaptionStatus('Ã¢Å“Â¨ Analyzing speech with Gemini AIÃ¢â‚¬Â¦');

            const response = await fetch(buildApiUrl('/api/transcribe'), {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to transcribe audio.');
            }

            const segments = data.captions || [];
            if (segments.length === 0) {
                setAutoCaptionStatus('Ã¢Å¡Â Ã¯Â¸Â No speech detected in the video.');
                setIsAutoCapturing(false);
                return;
            }

            // Convert Gemini segments into the required captions format
            const newCaptions = segments.map((seg: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                text: (seg.text || '').trim(),
                startTime: typeof seg.start === 'number' ? seg.start : 0,
                endTime: typeof seg.end === 'number' ? seg.end : 3,
                clipId: activePreviewId,
            })).filter((c: any) => c.text.length > 0);

            // Set the captions state, replacing existing captions for this clip
            setCaptions((prev: any) => [
                ...prev.filter((c: any) => c.clipId !== activePreviewId),
                ...newCaptions
            ]);
            setAutoCaptionStatus(`Ã¢Å“â€¦ ${newCaptions.length} captions generated successfully!`);
        } catch (error: any) {
            console.error('Gemini transcription failed:', error);
            setAutoCaptionStatus(`Ã¢ÂÅ’ Transcription failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsAutoCapturing(false);
        }
    }, [mediaItems, activePreviewId, captionLanguage, detectSpeakers, setCaptions, setIsAutoCapturing, setAutoCaptionStatus]);

    const greenScreenCanvasRef = useRef<HTMLCanvasElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);
    const greenScreenAnimationRef = useRef<number | null>(null);
    const previousFrameRef = useRef<ImageData | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // --- Replace clip handler ---
    const handleReplaceClip = useCallback((file: File) => {
        if (!activePreviewId) return;
        const type = file.type.startsWith('image') ? 'image' : 'video';
        const preview = URL.createObjectURL(file);
        getMediaDurationFromPreview(preview, type).then((duration) => {
            setMediaItems((prev: any[]) => prev.map((item: any) => {
                if (item?.id !== activePreviewId) return item;
                // Revoke old blob URL to free memory
                if ((item?.preview) && (item?.preview).startsWith('blob:')) {
                    URL.revokeObjectURL((item?.preview));
                }
                return { ...item, file, preview, type, duration };
            }));
            // Reset trim range for replaced clip
            setClipTrimRanges((prev: any) => {
                const updated = { ...prev };
                delete updated[activePreviewId];
                return updated;
            });
            saveToUndo([]);
        });
    }, [activePreviewId, getMediaDurationFromPreview, setMediaItems, setClipTrimRanges, saveToUndo]);
    const bgMusicRef = useRef<HTMLAudioElement>(null);
    const thumbnailVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
    const lastLoadedIdRef = useRef<string | null>(null);

    const activePreviewItem = mediaItems.find((i) => i?.id === activePreviewId) || libraryAssets.find((i) => i?.id === activePreviewId) || null;

    const getTrimRangeForItem = useCallback((itemId: string, duration: number) => {
        const range = clipTrimRanges[itemId];
        const safeDuration = Math.max(0.01, Number(duration) || 0.01);
        const start = Math.max(0, Math.min(safeDuration - 0.01, Number(range?.start) || 0));
        const rawEnd = range?.end;
        const end = rawEnd == null
            ? safeDuration
            : Math.max(start + 0.01, Math.min(safeDuration, Number(rawEnd) || safeDuration));
        return { start, end };
    }, [clipTrimRanges]);

    const getEffectiveDurationForItem = useCallback((item: any) => {
        if ((item?.type || 'video') !== 'video') return (item?.duration || 0);
        const { start, end } = getTrimRangeForItem(item?.id, (item?.duration || 0));
        return Math.max(0.01, end - start);
    }, [getTrimRangeForItem]);

    const getTotalEffectiveDuration = useCallback(() => {
        let maxEnd = 0;
        mediaItems.forEach(item => {
            const start = clipStartOverrides[item?.id] !== undefined ? clipStartOverrides[item?.id] : (item.startTime || 0);
            maxEnd = Math.max(maxEnd, start + getEffectiveDurationForItem(item));
        });
        return maxEnd;
    }, [mediaItems, getEffectiveDurationForItem, clipStartOverrides]);

    const globalCurrentTime = useMemo(() => {
        const totalDuration = getTotalEffectiveDuration();
        return (progress / 100) * totalDuration;
    }, [progress, mediaItems, getTotalEffectiveDuration]);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent('editor-timeupdate', { detail: { currentTime: globalCurrentTime, progress } }));
    }, [globalCurrentTime, progress]);

    const getClipGlobalStart = useCallback((clipId: string) => {
        const item = mediaItems.find((p: any) => p?.id === clipId);
        if (item) {
            return clipStartOverrides[clipId] !== undefined ? clipStartOverrides[clipId] : (item.startTime || 0);
        }
        return 0;
    }, [mediaItems, clipStartOverrides]);

    const getTargetStartTime = useCallback((item: any) => {
        const trim = getTrimRangeForItem(item?.id, (item?.duration || 0));
        if (pendingTransitionSeekRef.current && pendingTransitionSeekRef.current.clipId === item?.id) {
            return Math.min(trim.end, trim.start + pendingTransitionSeekRef.current.seekTime);
        }
        return trim.start;
    }, [getTrimRangeForItem]);

    // Load settings per clip when switching activePreviewId
    useEffect(() => {
        lastTriggeredEndRef.current = null;
        if (!activePreviewId) return;
        const settings = clipSettings[activePreviewId] || {};

        setSelectedEffect(settings.selectedEffect || 'none');
        setSelectedFilter(settings.selectedFilter || 'none');
        setSpeedValue(settings.speedValue ?? 1);
        setRotationDegrees(settings.rotationDegrees ?? 0);
        setVolumeLevel(settings.volumeLevel ?? 1);
        setZoomToolAmount(settings.zoomToolAmount ?? 1);

        setCropCenterX(settings.cropCenterX ?? 50);
        setCropCenterY(settings.cropCenterY ?? 50);
        setCropWidthPct(settings.cropWidthPct ?? 100);
        setCropHeightPct(settings.cropHeightPct ?? 100);

        setKeyframeMode(settings.keyframeMode || 'none');
        setKeyframeAmount(settings.keyframeAmount ?? 1.25);

        setOverlayText(settings.overlayText || '');
        setOverlayTextStylePreset(settings.overlayTextStylePreset || null);
        setOverlayFontId(settings.overlayFontId || 'rubik');
        setOverlayFontSize(settings.overlayFontSize ?? 48);
        setOverlayColor(settings.overlayColor || '#FFFFFF');
        setOverlayPosX(settings.overlayPosX ?? 50);
        setOverlayPosY(settings.overlayPosY ?? 50);
        setOverlayBgEnabled(settings.overlayBgEnabled ?? false);
        setOverlayBgColorHex(settings.overlayBgColorHex || '#000000');

        setBlurAmount(settings.blurAmount ?? 10);
        setBrightness(settings.brightness ?? 1);
        setContrast(settings.contrast ?? 1);
        setSaturation(settings.saturation ?? 1);
        setSlowMotionSpeed(settings.slowMotionSpeed ?? 0.25);
        setGlitchIntensity(settings.glitchIntensity ?? 1);
        // Existing effect params
        setVelocitySpeed(settings.velocitySpeed ?? 1.5);
        setMotionBlurAmount(settings.motionBlurAmount ?? 3);
        setShakeStrength(settings.shakeStrength ?? 1.5);
        setFlashIntensity(settings.flashIntensity ?? 0.75);
        setRgbSplitAmount(settings.rgbSplitAmount ?? 12);
        setSmoothZoomAmount(settings.smoothZoomAmount ?? 0.35);
        setFilmGrainOpacity(settings.filmGrainOpacity ?? 0.4);
        setProParams(settings.proParams ?? {});

        setBorderWidth(settings.borderWidth ?? 0);
        setBorderColorHex(settings.borderColorHex || '#ffffff');

        // Clear pending seek offset if active clip is an image and we are paused
        const activeItem = mediaItems.find(i => i?.id === activePreviewId);
        if (!isPlaying && activeItem?.type === 'image') {
            if (pendingTransitionSeekRef.current && pendingTransitionSeekRef.current.clipId === activePreviewId) {
                pendingTransitionSeekRef.current = null;
            }
        }

        const timer = setTimeout(() => {
            lastLoadedIdRef.current = activePreviewId;
        }, 0);
        return () => clearTimeout(timer);
    }, [activePreviewId, isPlaying, mediaItems]);


    // Sync state changes to clipSettings per clip
    useEffect(() => {
        if (!activePreviewId) return;
        if (lastLoadedIdRef.current !== activePreviewId) return;
        setClipSettings(prev => {
            const current = prev[activePreviewId] || {};
            if (
                current.selectedEffect === selectedEffect &&
                current.selectedFilter === selectedFilter &&
                current.speedValue === speedValue &&
                current.rotationDegrees === rotationDegrees &&
                current.volumeLevel === volumeLevel &&
                current.zoomToolAmount === zoomToolAmount &&
                current.cropCenterX === cropCenterX &&
                current.cropCenterY === cropCenterY &&
                current.cropWidthPct === cropWidthPct &&
                current.cropHeightPct === cropHeightPct &&
                current.keyframeMode === keyframeMode &&
                current.keyframeAmount === keyframeAmount &&
                current.overlayText === overlayText &&
                current.overlayTextStylePreset === overlayTextStylePreset &&
                current.overlayFontId === overlayFontId &&
                current.overlayFontSize === overlayFontSize &&
                current.overlayColor === overlayColor &&
                current.overlayPosX === overlayPosX &&
                current.overlayPosY === overlayPosY &&
                current.overlayBgEnabled === overlayBgEnabled &&
                current.overlayBgColorHex === overlayBgColorHex &&
                current.blurAmount === blurAmount &&
                current.brightness === brightness &&
                current.contrast === contrast &&
                current.saturation === saturation &&
                current.slowMotionSpeed === slowMotionSpeed &&
                current.glitchIntensity === glitchIntensity &&
                current.velocitySpeed === velocitySpeed &&
                current.motionBlurAmount === motionBlurAmount &&
                current.shakeStrength === shakeStrength &&
                current.flashIntensity === flashIntensity &&
                current.rgbSplitAmount === rgbSplitAmount &&
                current.smoothZoomAmount === smoothZoomAmount &&
                current.filmGrainOpacity === filmGrainOpacity &&
                current.borderWidth === borderWidth &&
                current.borderColorHex === borderColorHex &&
                JSON.stringify(current.proParams) === JSON.stringify(proParams)
            ) {
                return prev;
            }

            return {
                ...prev,
                [activePreviewId]: {
                    selectedEffect,
                    selectedFilter,
                    speedValue,
                    rotationDegrees,
                    volumeLevel,
                    zoomToolAmount,
                    cropCenterX,
                    cropCenterY,
                    cropWidthPct,
                    cropHeightPct,
                    keyframeMode,
                    keyframeAmount,
                    overlayText,
                    overlayTextStylePreset,
                    overlayFontId,
                    overlayFontSize,
                    overlayColor,
                    overlayPosX,
                    overlayPosY,
                    overlayBgEnabled,
                    overlayBgColorHex,
                    blurAmount,
                    brightness,
                    contrast,
                    saturation,
                    slowMotionSpeed,
                    glitchIntensity,
                    velocitySpeed,
                    motionBlurAmount,
                    shakeStrength,
                    flashIntensity,
                    rgbSplitAmount,
                    smoothZoomAmount,
                    filmGrainOpacity,
                    proParams,
                    borderWidth,
                    borderColorHex
                }
            };
        });
    }, [
        activePreviewId,
        selectedEffect,
        selectedFilter,
        speedValue,
        rotationDegrees,
        volumeLevel,
        zoomToolAmount,
        cropCenterX,
        cropCenterY,
        cropWidthPct,
        cropHeightPct,
        keyframeMode,
        keyframeAmount,
        overlayText,
        overlayTextStylePreset,
        overlayFontId,
        overlayFontSize,
        overlayColor,
        overlayPosX,
        overlayPosY,
        overlayBgEnabled,
        overlayBgColorHex,
        blurAmount,
        brightness,
        contrast,
        saturation,
        slowMotionSpeed,
        glitchIntensity,
        velocitySpeed,
        motionBlurAmount,
        shakeStrength,
        flashIntensity,
        rgbSplitAmount,
        smoothZoomAmount,
        filmGrainOpacity,
        proParams,
        borderWidth,
        borderColorHex
    ]);


    // Keep isPlayingRef in sync with state so event-handler closures always
    // read the current value without stale-closure issues.
    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    const safePlay = useCallback((videoElement: HTMLVideoElement | null) => {
        // Use ref so this works even when called from stale event-handler closures
        if (!videoElement || !videoElement.isConnected || !isPlayingRef.current) return;
        if (transitionOverlay) return; // Do NOT play main video during transition overlay!

        // Check if video is already playing
        if (!videoElement.paused) return;

        videoElement.play().catch(err => {
            if (err.name === 'AbortError') {
                console.log("ðŸ“¹ [PLAYBACK] Play request aborted (media unmounted/reloaded).");
                return;
            }
            console.warn("ðŸ“¹ [PLAYBACK] Play failed, trying muted fallback:", err);
            setIsMuted(true);
            videoElement.muted = true;
            if (videoElement.isConnected && isPlayingRef.current && videoElement.paused) {
                videoElement.play().catch(e => console.log("Muted play fallback failed", e));
            }
        });
    }, [setIsMuted, transitionOverlay]);

    // Sync video seek time immediately when switching activePreviewId if the video source is identical
    useEffect(() => {
        if (videoRef.current && activePreviewId) {
            const activeItem = activePreviewItem;
            if (activeItem && activeItem.type === 'video') {
                const videoElement = videoRef.current;
                const targetStart = getTargetStartTime(activeItem);
                
                const currentSrc = videoElement.src || videoElement.getAttribute('src') || '';
                const itemPreviewResolved = new URL(activeItem.preview || '', window.location.href).href;
                const videoSrcResolved = new URL(currentSrc, window.location.href).href;
                
                if (itemPreviewResolved === videoSrcResolved) {
                    console.log("ðŸ“¹ [PLAYBACK] Same video source - seeking instantly to:", targetStart);
                    videoElement.currentTime = targetStart;
                    
                    if (pendingTransitionSeekRef.current && pendingTransitionSeekRef.current.clipId === activePreviewId) {
                        pendingTransitionSeekRef.current = null;
                    }
                    
                    if (isPlaying) {
                        safePlay(videoElement);
                    }
                }
            }
        }
    }, [activePreviewId, isPlaying, mediaItems, getTargetStartTime, safePlay]);


    const triggerClipTransition = useCallback((nextId: string) => {
        if (!activePreviewId || activePreviewId === nextId) {
            setActivePreviewId(nextId);
            return;
        }

        // Transition is primarily defined by the outgoing (currently playing) clip.
        // Keep next-clip fallback so existing assignments still work.
        const transitionType = clipTransitions[activePreviewId] || clipTransitions[nextId] || 'none';
        if (transitionType === 'none') {
            setActivePreviewId(nextId);
            return;
        }

        // Pause the main video during transition - the overlay will show both clips
        if (videoRef.current) {
            videoRef.current.pause();
            console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] Paused main video during transition overlay");
        }

        setTransitionOverlay({
            fromId: activePreviewId,
            toId: nextId,
            type: transitionType,
            startAt: performance.now(),
            durationMs: 1400,
        });
        setTransitionProgress(0);

        // Instantly switch activePreviewId to nextId so main video element loads it in the background
        setActivePreviewId(nextId);
    }, [activePreviewId, clipTransitions]);

    // Select clip for preview, optionally triggering transition animation
    const selectPreviewWithTransition = useCallback((nextId: string | null) => {
        if (!nextId) {
            setActivePreviewId(null);
            return;
        }
        setActivePreviewId(nextId);
    }, []);

    const playNextMedia = useCallback((endedClipId?: string) => {
        const currentId = endedClipId || activePreviewId;
        if (!currentId) return;

        if (endedClipId && endedClipId !== activePreviewId) {
            console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] playNextMedia ignored stale end event for:", endedClipId, "current active:", activePreviewId);
            return;
        }

        console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] playNextMedia called for item:", currentId);
        const sorted = [...mediaItems].sort((a, b) => {
            const startA = clipStartOverrides[a?.id] !== undefined ? clipStartOverrides[a?.id] : 0;
            const startB = clipStartOverrides[b?.id] !== undefined ? clipStartOverrides[b?.id] : 0;
            return startA - startB;
        });
        const currentIndex = sorted.findIndex(i => i?.id === currentId);
        if (currentIndex !== -1 && currentIndex < sorted.length - 1) {
            const nextId = sorted[currentIndex + 1].id;
            console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] Transitioning to next clip:", nextId);
            triggerClipTransition(nextId);
            setIsPlaying(true);
        } else {
            console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] No more clips to play, resetting to start");
            setIsPlaying(false);
            if (sorted.length > 0) {
                const firstItem = sorted[0];
                setActivePreviewId(firstItem.id);
                setProgress(0);
                setTimeout(() => {
                    if (videoRef.current && firstItem.type === 'video') {
                        const trim = getTrimRangeForItem(firstItem.id, firstItem.duration);
                        videoRef.current.currentTime = trim.start;
                    }
                }, 10);
            }
        }
    }, [activePreviewId, mediaItems, triggerClipTransition, getTrimRangeForItem, setActivePreviewId, clipStartOverrides]);

    const togglePlay = () => {
        console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] togglePlay called, current isPlaying:", isPlaying);
        let activeItem = mediaItems.find(i => i?.id === activePreviewId);

        console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] Active item:", { id: activeItem?.id, type: activeItem?.type, hasVideoRef: !!videoRef.current });

        // If there are no media items, don't try to play
        if (mediaItems.length === 0) {
            console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] No media items");
            return;
        }

        // If no active item is selected, select the first chronological clip and play
        if (!activeItem) {
            const sorted = [...mediaItems].sort((a, b) => {
                const startA = clipStartOverrides[a?.id] !== undefined ? clipStartOverrides[a?.id] : 0;
                const startB = clipStartOverrides[b?.id] !== undefined ? clipStartOverrides[b?.id] : 0;
                return startA - startB;
            });
            activeItem = sorted[0];
            console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] No active item, defaulting to first item:", activeItem.id);
            setActivePreviewId(activeItem.id);
            setProgress(0);
            
            // Allow state to settle, then start playback
            setTimeout(() => {
                setIsPlaying(true);
            }, 10);
            return;
        }

        // For video items, control the video element
        if (activeItem.type === 'video') {
            console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] Detected video type, videoRef.current:", videoRef.current);
            const trim = getTrimRangeForItem(activePreviewItem?.id || '', activePreviewItem?.duration || 0);
            if (isPlaying) {
                console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] Pausing video");
                setIsPlaying(false);
            } else {
                console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] Starting video from:", trim.start);
                // Reset to trim start if outside trim range
                if (videoRef.current && (videoRef.current.currentTime < trim.start || videoRef.current.currentTime > trim.end)) {
                    videoRef.current.currentTime = trim.start;
                }
                setIsPlaying(true);
            }
        } else {
            // For images or when no video ref, just toggle the playing state
            console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] Toggling play for image or no ref");
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current && mediaItems.length > 0) {
            const sorted = [...mediaItems].sort((a, b) => {
                const startA = clipStartOverrides[a?.id] !== undefined ? clipStartOverrides[a?.id] : 0;
                const startB = clipStartOverrides[b?.id] !== undefined ? clipStartOverrides[b?.id] : 0;
                return startA - startB;
            });
            
            // If we are currently waiting for a transition seek to complete, ignore or hold the position
            if (pendingTransitionSeekRef.current && pendingTransitionSeekRef.current.clipId === activePreviewId) {
                console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] handleTimeUpdate ignored because transition seek is pending for:", activePreviewId);
                return;
            }

            const totalDuration = getTotalEffectiveDuration();
            const activeIndex = sorted.findIndex(i => i?.id === activePreviewId);
            
            let timeBefore = 0;
            let currentLocalTime = videoRef.current.currentTime;
            
            if (activeIndex !== -1) {
                const activeItem = sorted[activeIndex];
                // Calculate time before this clip
                timeBefore = clipStartOverrides[activeItem.id] !== undefined ? clipStartOverrides[activeItem.id] : (activeItem.startTime || 0);
                
                const trim = getTrimRangeForItem(activePreviewItem?.id || '', activePreviewItem?.duration || 0);
                if (activePreviewItem?.type === 'video') {
                    if (currentLocalTime < trim.start) {
                        videoRef.current.currentTime = trim.start;
                        currentLocalTime = trim.start;
                    }

                    // Check if we reached the effective end of this clip
                    if (currentLocalTime >= trim.end) {
                        // Debounce transition trigger
                        if (lastTriggeredEndRef.current !== activePreviewId) {
                            lastTriggeredEndRef.current = activePreviewId;
                            
                            // Immediately pause the video element to prevent playing trimmed part
                            if (videoRef.current) {
                                videoRef.current.pause();
                                videoRef.current.currentTime = trim.end;
                            }
                            
                            setProgress(((timeBefore + (trim.end - trim.start)) / (totalDuration || 1)) * 100 || 0);
                            playNextMedia(activeItem.id);
                        }
                        return;
                    }
                    currentLocalTime = Math.max(0, currentLocalTime - trim.start);
                }
            }

            const globalTime = timeBefore + currentLocalTime;
            const p = (globalTime / totalDuration) * 100;
            setProgress(p || 0);

            // Sync background music time to match globalTime
            if (bgMusicRef.current && selectedMusic) {
                const targetTime = (selectedMusic.startTime ?? 0) + globalTime;
                if (Math.abs(bgMusicRef.current.currentTime - targetTime) > 0.3) {
                    bgMusicRef.current.currentTime = targetTime;
                }
            }

            if (selectedEffect === 'fade-in') {
                const duration = videoRef.current.duration || 0;
                if (duration > 0) {
                    const fadeWindow = duration * 0.5;
                    const opacity = Math.min(1, videoRef.current.currentTime / Math.max(fadeWindow, 0.001));
                    setPreviewOpacity(opacity);
                } else {
                    setPreviewOpacity(0);
                }
            } else {
                setPreviewOpacity(1);
            }

            if (selectedEffect === 'zoom') {
                const duration = videoRef.current.duration || 0;
                const progress = duration > 0 ? videoRef.current.currentTime / duration : 0;
                setPreviewZoom(1 + progress * 1.5);
            } else {
                setPreviewZoom(1);
            }

            if (activePreviewItem?.type === 'video') {
                const trim = getTrimRangeForItem(activePreviewItem?.id || '', activePreviewItem?.duration || 0);
                const localDuration = Math.max(0.01, trim.end - trim.start);
                const localTime = Math.max(0, (videoRef.current.currentTime || 0) - trim.start);
                setKeyframeProgress(Math.max(0, Math.min(1, localTime / localDuration)));
            }

            // Update active caption based on current video time
            const ct = videoRef.current.currentTime;
            const activeCaption = captions.find(c => (!c.clipId || c.clipId === activePreviewId) && ct >= c.startTime && ct < c.endTime) ?? null;
            setCurrentCaption(activeCaption);
        }
    };

    useEffect(() => {
        let rafId: number;
        const tick = () => {
            if (isPlaying && videoRef.current && mediaItems.find(i => i?.id === activePreviewId)?.type === 'video') {
                handleTimeUpdate();
            }
            rafId = requestAnimationFrame(tick);
        };
        if (isPlaying) {
            rafId = requestAnimationFrame(tick);
        }
        return () => cancelAnimationFrame(rafId);
    }, [isPlaying, activePreviewId, mediaItems, handleTimeUpdate]);

    const handleTimelineClick = useCallback((globalSeekTime: number) => {
        const totalDuration = getTotalEffectiveDuration();
        if (totalDuration === 0) return;

        const clampedSeekTime = Math.max(0, Math.min(totalDuration, globalSeekTime));
        const pos = (clampedSeekTime / totalDuration) * 100;

        // Find which video/image item this global time corresponds to
        let foundItem = null;
        for (const item of mediaItems) {
            if ((item?.type || 'video') !== 'video' && (item?.type || 'video') !== 'image') continue;
            const start = clipStartOverrides[item?.id] !== undefined ? clipStartOverrides[item?.id] : (item.startTime || 0);
            const effDur = getEffectiveDurationForItem(item);
            if (clampedSeekTime >= start && clampedSeekTime < start + effDur) {
                foundItem = item;
                break;
            }
        }

        if (foundItem) {
            const start = clipStartOverrides[foundItem.id] !== undefined ? clipStartOverrides[foundItem.id] : (foundItem.startTime || 0);
            const offset = clampedSeekTime - start;
            setActivePreviewId(foundItem.id);
            // Use a tiny timeout to let the video/img mount before seeking
            setTimeout(() => {
                if (videoRef.current && foundItem.type === 'video') {
                    const trim = getTrimRangeForItem(foundItem.id, foundItem.duration);
                    videoRef.current.currentTime = Math.max(trim.start, Math.min(trim.end, trim.start + offset));
                }
                if (bgMusicRef.current && selectedMusic) {
                    bgMusicRef.current.currentTime = (selectedMusic.startTime ?? 0) + globalSeekTime;
                }
            }, 10);
        } else {
            // If we clicked on an empty gap, find the NEXT chronological clip to seek to (or just update progress)
            const sorted = [...mediaItems].filter(i => i.type === 'video' || i.type === 'image').sort((a, b) => {
                const startA = clipStartOverrides[a?.id] !== undefined ? clipStartOverrides[a?.id] : (a.startTime || 0);
                const startB = clipStartOverrides[b?.id] !== undefined ? clipStartOverrides[b?.id] : (b.startTime || 0);
                return startA - startB;
            });
            const nextItem = sorted.find(item => {
                const start = clipStartOverrides[item?.id] !== undefined ? clipStartOverrides[item?.id] : (item.startTime || 0);
                return start > clampedSeekTime;
            });
            
            if (nextItem) {
                setActivePreviewId(nextItem.id);
                setTimeout(() => {
                    if (videoRef.current && nextItem.type === 'video') {
                        const trim = getTrimRangeForItem(nextItem.id, nextItem.duration);
                        videoRef.current.currentTime = trim.start;
                    }
                }, 10);
            }
        }
        
        setProgress(pos);
        setReadLinePosition(pos);
    }, [mediaItems, getEffectiveDurationForItem, getTotalEffectiveDuration, setActivePreviewId, getTrimRangeForItem, clipStartOverrides]);

    const moveReadLine = useCallback((deltaSeconds: number) => {
        const totalDuration = getTotalEffectiveDuration();
        if (totalDuration === 0) return;
        const currentTime = (progress / 100) * totalDuration;
        const nextTime = Math.max(0, Math.min(totalDuration, currentTime + deltaSeconds));
        handleTimelineClick(nextTime);
        const nextPos = (nextTime / totalDuration) * 100;
        setReadLinePosition(nextPos);
        setProgress(nextPos);
    }, [progress, getTotalEffectiveDuration, handleTimelineClick]);

    useEffect(() => {
        if (showReadLine) {
            setReadLinePosition(progress);
        }
    }, [showReadLine, progress]);

    // Handle play/pause state
    useEffect(() => {
        const activeItem = mediaItems.find(i => i?.id === activePreviewId);
        console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] useEffect triggered:", {
            isPlaying,
            activeId: activePreviewId,
            activeItemType: activeItem?.type,
            hasVideoRef: !!videoRef.current
        });

        if (!videoRef.current || !activeItem || activeItem.type !== 'video') {
            console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] useEffect skipped - video ref or active item missing", {
                videoRef: !!videoRef.current,
                activeItem: !!activeItem,
                isVideo: activeItem?.type === 'video'
            });
            return;
        }

        const video = videoRef.current;
        console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] useEffect updating play state:", { isPlaying, videoElementExists: !!video });

        if (isPlaying) {
            safePlay(video);
        } else {
            video.pause();
        }
    }, [isPlaying, activePreviewId, safePlay]);

    // Sync background audio with main playback
    useEffect(() => {
        if (audioRef.current && audioUrl) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.log("Audio play blocked", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, audioTracks.length, audioUrl]);

    // Sync background music with main playback
    useEffect(() => {
        if (bgMusicRef.current && bgMusicUrl) {
            if (isPlaying) {
                bgMusicRef.current.play().catch(e => console.log("Background music play blocked", e));
            } else {
                bgMusicRef.current.pause();
            }
        }
    }, [isPlaying, bgMusicUrl]);

    useEffect(() => {
        let rafId: number;

        const updateVolumeFades = () => {
            const isMutedDeck = isMuted;
            let currentFadeMultiplier = 1;

            if (videoRef.current && activePreviewId) {
                const settings = clipSettings[activePreviewId] || {};
                const activeItem = mediaItems.find(i => i?.id === activePreviewId);
                
                if (activeItem && activeItem.type === 'video') {
                    const fadeIn = (isFadeOpen && activePreviewId === activeItem.id) ? fadeInVal : (settings.fadeIn || 0);
                    const fadeOut = (isFadeOpen && activePreviewId === activeItem.id) ? fadeOutVal : (settings.fadeOut || 0);
                    
                    const trim = getTrimRangeForItem(activePreviewItem?.id || '', activePreviewItem?.duration || 0);
                    const localTime = Math.max(0, videoRef.current.currentTime - trim.start);
                    const effDur = Math.max(0.1, trim.end - trim.start);

                    if (fadeIn > 0 && localTime < fadeIn) {
                        const t = localTime / fadeIn;
                        currentFadeMultiplier = Math.sin(t * (Math.PI / 2));
                    } else if (fadeOut > 0 && localTime > effDur - fadeOut) {
                        const t = Math.max(0, (effDur - localTime) / fadeOut);
                        currentFadeMultiplier = Math.sin(t * (Math.PI / 2));
                    }
                }

                const videoShouldMute = isMutedDeck || (selectedMusic ? selectedMusic.muteOriginal : false);
                videoRef.current.muted = videoShouldMute;
                
                // Base volume mapped against the fade multiplier
                const baseVolume = Math.max(0, Math.min(1, volumeLevel));
                videoRef.current.volume = videoShouldMute ? 0 : baseVolume * currentFadeMultiplier;
            }

            // Set upload audio track volume/mute
            if (audioRef.current) {
                audioRef.current.muted = isMutedDeck;
                audioRef.current.volume = isMutedDeck ? 0 : Math.max(0, Math.min(1, volumeLevel)) * currentFadeMultiplier;
            }

            // Set background music volume/mute
            if (bgMusicRef.current && selectedMusic) {
                bgMusicRef.current.muted = isMutedDeck;
                const bgVolume = (selectedMusic.volume ?? 80) / 100;
                bgMusicRef.current.volume = isMutedDeck ? 0 : bgVolume * currentFadeMultiplier;
            }

            if (isPlaying) {
                rafId = requestAnimationFrame(updateVolumeFades);
            }
        };

        // Run immediately on state change, and loop if playing
        updateVolumeFades();

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [isMuted, volumeLevel, selectedMusic, isPlaying, activePreviewId, clipSettings, mediaItems, getTrimRangeForItem, isFadeOpen, fadeInVal, fadeOutVal]);

    // Smooth playhead animation for Duration editor
    useEffect(() => {
        let rafId: number;
        
        const updateDurationPlayhead = () => {
            if (!isDurationOpen || !videoRef.current) return;
            
            const activeItem = mediaItems[durationActiveClipIdx];
            if (activeItem && activeItem.type === 'video') {
                const effDur = getEffectiveDurationForItem(activeItem);
                const trim = getTrimRangeForItem(activePreviewItem?.id || '', activePreviewItem?.duration || 0);
                const localTime = Math.max(0, videoRef.current.currentTime - trim.start);
                const localProgress = Math.min(99, Math.max(1, (localTime / (effDur || 1)) * 100));
                
                const playhead = document.getElementById('duration-playhead-line');
                const textNode = document.getElementById('duration-playhead-text');
                
                if (playhead) {
                    playhead.style.left = `${localProgress}%`;
                }
                if (textNode) {
                    textNode.innerText = `${localTime.toFixed(2)} / ${effDur.toFixed(2)}`;
                }
            }
            
            rafId = requestAnimationFrame(updateDurationPlayhead);
        };

        if (isDurationOpen && isPlaying) {
            rafId = requestAnimationFrame(updateDurationPlayhead);
        }

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [isDurationOpen, isPlaying, durationActiveClipIdx, mediaItems, getEffectiveDurationForItem, getTrimRangeForItem]);

    // Smooth playhead animation for Fade editor
    useEffect(() => {
        let rafId: number;
        
        const updateFadePlayhead = () => {
            if (!isFadeOpen || !videoRef.current || !activePreviewId) return;
            
            const activeItem = mediaItems.find(i => i?.id === activePreviewId);
            if (activeItem && activeItem.type === 'video') {
                const trim = getTrimRangeForItem(activePreviewItem?.id || '', activePreviewItem?.duration || 0);
                const effDur = Math.max(0.1, trim.end - trim.start);
                const localTime = Math.max(0, videoRef.current.currentTime - trim.start);
                const localProgress = Math.min(100, Math.max(0, (localTime / effDur) * 100));
                
                const playhead = document.getElementById('fade-playhead-line');
                if (playhead) {
                    playhead.style.left = `${localProgress}%`;
                }
            }
            
            rafId = requestAnimationFrame(updateFadePlayhead);
        };

        if (isFadeOpen && isPlaying) {
            rafId = requestAnimationFrame(updateFadePlayhead);
        }

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [isFadeOpen, isPlaying, activePreviewId, mediaItems, getTrimRangeForItem]);

    // Duplicate playback useEffect removed to prevent conflicts

    useEffect(() => {
        if (selectedEffect === 'none') {
            setPreviewOpacity(1);
            setPreviewZoom(1);
            return;
        }
        if (selectedEffect === 'fade-in') {
            setPreviewOpacity(0);
        } else {
            setPreviewOpacity(1);
        }

        if (selectedEffect !== 'zoom') {
            setPreviewZoom(1);
        }
    }, [selectedEffect, activePreviewId]);

    useEffect(() => {
        if (!videoRef.current) return;
        let effectSpeed = 1;
        if (selectedEffect === 'slow-motion') effectSpeed = slowMotionSpeed;
        if (selectedEffect === 'velocity') effectSpeed = typeof velocitySpeed === 'number' ? velocitySpeed : 1.5;
        const manualSpeed = Math.abs(speedValue - 1) > 0.001 ? speedValue : effectSpeed;
        const resolvedSpeed = Math.max(0.1, Math.min(3, manualSpeed));
        videoRef.current.playbackRate = resolvedSpeed;
    }, [selectedEffect, slowMotionSpeed, velocitySpeed, speedValue, activePreviewId]);

    useEffect(() => {
        const activeItem = mediaItems.find((i) => i?.id === activePreviewId);
        if (!activeItem || activeItem.type !== 'video' || !videoRef.current) return;
        if (videoRef.current.readyState < 1) return; // Wait for metadata before clamping/seeking
        const targetStart = getTargetStartTime(activeItem);
        const trim = getTrimRangeForItem(activePreviewItem?.id || '', activePreviewItem?.duration || 0);
        if (videoRef.current.currentTime < targetStart || videoRef.current.currentTime > trim.end) {
            videoRef.current.currentTime = targetStart;
            if (pendingTransitionSeekRef.current && pendingTransitionSeekRef.current.clipId === activePreviewId) {
                pendingTransitionSeekRef.current = null;
            }
        }
    }, [activePreviewId, mediaItems, getTrimRangeForItem, clipTrimRanges, getTargetStartTime]);

    // Keyboard Shortcuts: Space (Play/Pause), Left/Right Arrows (Back/Front 10s)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.getAttribute('contenteditable') === 'true') {
                return;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                moveReadLine(-10);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                moveReadLine(10);
            } else if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [moveReadLine, togglePlay]);

    // Compute overlay text style CSS from selected preset for use in preview
    const overlayTextStylePresetCss = getOverlayTextStylePresetCss(overlayTextStylePreset);

    useEffect(() => {
        const isCutout = activePreviewId ? clipSettings[activePreviewId]?.cutout?.enabled : false;
        const isProEffect = selectedEffect && selectedEffect.startsWith('pro-') && !selectedEffect.startsWith('pro-filter-');
        const activeCanvasMode = isProEffect
            ? selectedEffect
            : CANVAS_PREVIEW_EFFECTS.includes(selectedEffect)
                ? selectedEffect
                : CANVAS_PREVIEW_FILTERS.includes(selectedFilter)
                    ? selectedFilter
                    : isCutout
                        ? 'cutout'
                        : null;

        if (!activeCanvasMode) {
            if (greenScreenAnimationRef.current !== null) {
                cancelAnimationFrame(greenScreenAnimationRef.current);
                greenScreenAnimationRef.current = null;
            }
            previousFrameRef.current = null;
            return;
        }

        const video = videoRef.current;
        const canvas = greenScreenCanvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const drawGreenScreen = () => {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
                if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                }

                if (activeCanvasMode.startsWith('pro-')) {
                    const module = getEffectModule(activeCanvasMode);
                    if (module && typeof module.previewRenderer === 'function') {
                        const params = {
                            ...module.defaultParameters,
                            ...proParams,
                        };
                        const time = video.currentTime;
                        module.previewRenderer(ctx, video, params, time, canvas);
                    } else {
                        ctx.save();
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        ctx.restore();
                    }
                } else {
                    ctx.save();
                    if (activeCanvasMode === 'shake') {
                        const strength = typeof shakeStrength !== 'undefined' ? shakeStrength : 1.5;
                        const t = performance.now() / 1000;
                        const x = Math.sin(t * 22) * strength * 4.5;
                        const y = Math.cos(t * 17) * strength * 3.5;
                        ctx.translate(x, y);
                    }
                    const cutout = activePreviewId ? clipSettings[activePreviewId]?.cutout : null;
                    if (cutout && cutout.enabled && cutout.maskDataUrl) {
                        applyCutout(ctx, canvas, video, cutout);
                    } else {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    }
                    ctx.restore();
                }

                if (activeCanvasMode === 'green-screen') {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        if (g > 120 && Math.abs(r - b) < 40) {
                            data[i + 3] = 0;
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);
                }

                if (activeCanvasMode === 'glitch') {
                    for (let i = 0; i < glitchIntensity * 30; i++) {
                        const x = (Math.sin(Date.now() * 0.01 + i) + 1) * canvas.width * 0.5;
                        const y = Math.random() * canvas.height;
                        ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
                        ctx.fillRect(x, y, 3, 1);
                    }
                }

                if (activeCanvasMode === 'vintage') {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];

                        // Old-film wash: warmer lows + reduced saturation.
                        data[i] = r * 0.7 + 20;
                        data[i + 1] = g * 0.6 + 15;
                        data[i + 2] = b * 0.5 + 10;

                        const grain = (Math.random() - 0.5) * 30;
                        data[i] = Math.max(0, Math.min(255, data[i] + grain));
                        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain));
                        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain));
                    }

                    ctx.putImageData(imageData, 0, 0);
                }

                if (activeCanvasMode === 'soft-glow') {
                    ctx.save();
                    ctx.globalAlpha = 0.45;
                    ctx.filter = 'blur(6px) brightness(1.2)';
                    ctx.globalCompositeOperation = 'screen';
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    ctx.restore();
                }

                if (activeCanvasMode === 'retro-film') {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        data[i + 2] = data[i + 2] * 0.85;
                        data[i + 1] = Math.min(255, data[i + 1] * 1.05);

                        if (Math.random() < 0.001) {
                            data[i] = 255;
                            data[i + 1] = 255;
                            data[i + 2] = 255;
                        }
                    }

                    ctx.putImageData(imageData, 0, 0);

                    ctx.save();
                    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
                    ctx.lineWidth = 1;
                    for (let y = 0; y < canvas.height; y += 4) {
                        ctx.beginPath();
                        ctx.moveTo(0, y);
                        ctx.lineTo(canvas.width, y);
                        ctx.stroke();
                    }
                    ctx.restore();
                }

                if (activeCanvasMode === 'old-tv') {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    const w = canvas.width;
                    const h = canvas.height;

                    // Faster chromatic aberration, noise, color grade, and scanlines in one pass
                    const tempBuffer = new Uint8ClampedArray(data);

                    for (let y = 0; y < h; y++) {
                        const isScanline = (y % 4 === 0 || y % 4 === 1);
                        const scanlineFactor = isScanline ? 0.82 : 1.0;

                        for (let x = 0; x < w; x++) {
                            const destIdx = (y * w + x) * 4;

                            // Chromatic aberration (chromashift: cbh=3, cbv=2, crh=-3, crv=-2)
                            const rx = Math.max(0, Math.min(w - 1, x - 3));
                            const ry = Math.max(0, Math.min(h - 1, y - 2));
                            const rIdx = (ry * w + rx) * 4;

                            const bx = Math.max(0, Math.min(w - 1, x + 3));
                            const by = Math.max(0, Math.min(h - 1, y + 2));
                            const bIdx = (by * w + bx) * 4;

                            let r = tempBuffer[rIdx];
                            let g = tempBuffer[destIdx + 1];
                            let b = tempBuffer[bIdx + 2];

                            // Contrast (1.12), brightness (+5), and saturation (0.85) adjustments
                            r = (r - 128) * 1.12 + 128 + 5;
                            g = (g - 128) * 1.12 + 128 + 5;
                            b = (b - 128) * 1.12 + 128 + 5;

                            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                            r = gray + (r - gray) * 0.85;
                            g = gray + (g - gray) * 0.85;
                            b = gray + (b - gray) * 0.85;

                            // Warm hue/tint shift
                            r = r * 1.02;
                            g = g * 1.01;
                            b = b * 0.96;

                            // Per-frame noise
                            const grain = (Math.random() - 0.5) * 26;
                            r += grain;
                            g += grain;
                            b += grain;

                            // Scanline factor
                            r *= scanlineFactor;
                            g *= scanlineFactor;
                            b *= scanlineFactor;

                            // Vignette (angle=0.6)
                            const dx = (x - w / 2) / (w / 2);
                            const dy = (y - h / 2) / (h / 2);
                            const distSq = dx * dx + dy * dy;
                            const vignette = Math.max(0.4, 1.0 - distSq * 0.45);

                            data[destIdx] = Math.max(0, Math.min(255, r * vignette));
                            data[destIdx + 1] = Math.max(0, Math.min(255, g * vignette));
                            data[destIdx + 2] = Math.max(0, Math.min(255, b * vignette));
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);
                }

                // Transition previews are handled by per-clip transition overlay,
                // not by global effect canvas rendering.

                if (activeCanvasMode === 'rgb-split') {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    const w = canvas.width;
                    const h = canvas.height;
                    const amount = Math.max(1, rgbSplitAmount || 12);
                    const shift = Math.round(amount * 0.5);

                    const tempBuffer = new Uint8ClampedArray(data);

                    for (let y = 0; y < h; y++) {
                        for (let x = 0; x < w; x++) {
                            const destIdx = (y * w + x) * 4;

                            // Shift red channel to the left, blue channel to the right
                            const rx = Math.max(0, Math.min(w - 1, x - shift));
                            const bx = Math.max(0, Math.min(w - 1, x + shift));

                            data[destIdx] = tempBuffer[(y * w + rx) * 4];       // Red
                            data[destIdx + 2] = tempBuffer[(y * w + bx) * 4 + 2]; // Blue
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);
                }

                if (activeCanvasMode === 'film-grain') {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    const opacity = typeof filmGrainOpacity !== 'undefined' ? filmGrainOpacity : 0.4;
                    const grainRange = opacity * 40;

                    for (let i = 0; i < data.length; i += 4) {
                        const grain = (Math.random() - 0.5) * grainRange;
                        data[i] = Math.max(0, Math.min(255, data[i] + grain));
                        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain));
                        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain));
                    }
                    ctx.putImageData(imageData, 0, 0);
                }

                if (activeCanvasMode === 'motion-tracking') {
                    const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    if (previousFrameRef.current) {
                        const currentData = currentFrame.data;
                        const prevData = previousFrameRef.current.data;
                        const step = 80;
                        for (let y = 0; y < canvas.height; y += step) {
                            for (let x = 0; x < canvas.width; x += step) {
                                const idx = (y * canvas.width + x) * 4;
                                const motion = Math.abs(currentData[idx] - prevData[idx]) + Math.abs(currentData[idx + 1] - prevData[idx + 1]) + Math.abs(currentData[idx + 2] - prevData[idx + 2]);
                                if (motion > 70) {
                                    ctx.fillStyle = `rgba(255, 0, 0, ${Math.min(0.8, motion / 255)})`;
                                    ctx.beginPath();
                                    ctx.arc(x, y, 10, 0, Math.PI * 2);
                                    ctx.fill();
                                }
                            }
                        }
                    }
                    previousFrameRef.current = currentFrame;
                }
            }

            if (isPlaying) {
                greenScreenAnimationRef.current = requestAnimationFrame(drawGreenScreen);
            }
        };

        drawGreenScreen();

        return () => {
            if (greenScreenAnimationRef.current !== null) {
                cancelAnimationFrame(greenScreenAnimationRef.current);
                greenScreenAnimationRef.current = null;
            }
        };
    }, [
        selectedEffect,
        selectedFilter,
        isPlaying,
        activePreviewId,
        glitchIntensity,
        overlayText,
        shakeStrength,
        rgbSplitAmount,
        filmGrainOpacity,
        proParams,
        clipSettings,
    ]);

    // Keep timeline thumbnail videos in sync with the main preview transport state.
    useEffect(() => {
        mediaItems.forEach((item) => {
            if ((item?.type || 'video') !== 'video') return;
            const thumbVideo = thumbnailVideoRefs.current[item?.id];
            if (!thumbVideo) return;

            if (isPlaying && activePreviewId === item?.id) {
                thumbVideo.play().catch(() => { });
            } else {
                thumbVideo.pause();
            }
        });
    }, [isPlaying, activePreviewId, mediaItems]);

    useEffect(() => {
        if (!transitionOverlay) return;

        let raf = 0;
        const tick = () => {
            const elapsed = performance.now() - transitionOverlay.startAt;
            const p = Math.min(1, elapsed / transitionOverlay.durationMs);
            setTransitionProgress(p);

            // Smoothly advance timeline progress (redline) during transition
            const fromItem = mediaItems.find((item: any) => item?.id === transitionOverlay.fromId);
            if (fromItem) {
                const timeBefore = getClipGlobalStart(transitionOverlay.fromId);
                const durationA = getEffectiveDurationForItem(fromItem);
                const boundaryTime = timeBefore + durationA;
                const totalDuration = getTotalEffectiveDuration();

                const transitionDurationSec = transitionOverlay.durationMs / 1000;
                const currentTransitionTime = p * transitionDurationSec;
                const globalTime = boundaryTime + currentTransitionTime;
                const progressPercentage = (globalTime / (totalDuration || 1)) * 100;
                setProgress(Math.min(progressPercentage, 100) || 0);
            }

            if (p < 1) {
                raf = requestAnimationFrame(tick);
            } else {
                console.log("Ã¢Å“â€¦ [TRANSITIONS] Preview animation completed for transition:", transitionOverlay.type);
                
                const wasPlaying = isPlayingRef.current;
                
                setTransitionOverlay(null);
                setTransitionProgress(0);

                if (wasPlaying) {
                    console.log("🎞️ [PLAYBACK] Normal playback: switching to next clip after transition");
                    pendingTransitionSeekRef.current = {
                        clipId: transitionOverlay.toId,
                        seekTime: transitionOverlay.durationMs / 1000,
                    };
                    setActivePreviewId(transitionOverlay.toId);
                    
                    setTimeout(() => {
                        if (videoRef.current) {
                            const nextItem = mediaItems.find((m: any) => m.id === transitionOverlay.toId);
                            if (nextItem && nextItem.type === 'video') {
                                const trim = getTrimRangeForItem(nextItem.id, nextItem.duration);
                                const targetStart = Math.min(trim.end, trim.start + (transitionOverlay.durationMs / 1000));
                                videoRef.current.currentTime = targetStart;
                                console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] Transition complete, seeked next clip to target start:", targetStart);
                            }
                            console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] Resuming playback on next clip");
                            safePlay(videoRef.current);
                        }
                    }, 50);
                } else {
                    console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] User applying transition: stay on source clip and seek to start");
                    setActivePreviewId(transitionOverlay.fromId);
                    setTimeout(() => {
                        if (videoRef.current) {
                            const fromItem = mediaItems.find((m: any) => m.id === transitionOverlay.fromId);
                            if (fromItem) {
                                const trim = getTrimRangeForItem(fromItem.id, fromItem.duration);
                                videoRef.current.currentTime = trim.start;
                                console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] Seeked to start of from clip:", trim.start);
                            }
                        }
                    }, 50);
                }
            }
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [transitionOverlay, isPlaying, mediaItems, getClipGlobalStart, getEffectiveDurationForItem, getTotalEffectiveDuration, safePlay, getTrimRangeForItem]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        let rafId: number;
        const activeItem = mediaItems.find(i => i?.id === activePreviewId);

        if (isPlaying && activeItem?.type === 'image') {
            let seekOffsetMs = 0;
            if (pendingTransitionSeekRef.current && pendingTransitionSeekRef.current.clipId === activePreviewId) {
                seekOffsetMs = pendingTransitionSeekRef.current.seekTime * 1000;
                pendingTransitionSeekRef.current = null; // Clear it
            }

            const startTime = Date.now() - seekOffsetMs;
            const imageDuration = Math.max(0, (activeItem.duration || 3) * 1000 - seekOffsetMs);

            const updateProgress = () => {
                const elapsed = Date.now() - startTime;
                const activeIndex = mediaItems.findIndex(i => i?.id === activePreviewId);
                const timeBefore = mediaItems.slice(0, activeIndex).reduce((acc, item) => acc + (item?.duration || 0), 0);
                const totalDuration = mediaItems.reduce((acc, item) => acc + (item?.duration || 0), 0);

                const globalTime = timeBefore + Math.min(elapsed / 1000, activeItem.duration);
                const p = (globalTime / (totalDuration || 1)) * 100;
                setProgress(Math.min(p, 100) || 0);
                const localProgress = Math.min(1, (elapsed / 1000) / Math.max(0.01, activeItem.duration));
                setKeyframeProgress(localProgress);
                
                rafId = requestAnimationFrame(updateProgress);
            };
            
            rafId = requestAnimationFrame(updateProgress);

            timer = setTimeout(() => {
                playNextMedia(activeItem.id);
            }, imageDuration);
        }
        return () => {
            clearTimeout(timer);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [isPlaying, activePreviewId, mediaItems, playNextMedia]);

    useEffect(() => {
        if (location.state && typeof location.state === 'object') {
            const state = location.state as any;
            const { initialMedia, initialAudio } = state;

            if (initialMedia && (initialMedia.file || initialMedia.preview)) {
                let preview = initialMedia.preview;
                if (!preview && initialMedia.file) {
                    try {
                        preview = URL.createObjectURL(initialMedia.file);
                    } catch (e) {
                        console.error('Failed to create object URL for file:', e);
                    }
                }

                if (initialMedia.file && preview) {
                    createdPreviewUrlsRef.current.push(preview || '');
                }

                const initialType = initialMedia.type || 'video' as const;
                getMediaDurationFromPreview(preview, initialType).then((resolvedDuration) => {
                    const newItem = {
                        id: 'initial',
                        file: initialMedia.file || null,
                        preview,
                        type: initialType,
                        duration: resolvedDuration,
                    };
                    setMediaItems([newItem]);
                    setLibraryAssets([newItem]);
                    setActivePreviewId(newItem.id);
                    const initialStateObj = {
                        mediaItems: [newItem],
                        clipTransitions: {},
                        clipTrimRanges: {},
                        clipStartOverrides: {},
                        clipTrackOverrides: {},
                        clipNameOverrides: {},
                        clipLockedStates: {},
                        clipSettings: {},
                    };
                    setHistory([JSON.stringify(initialStateObj)]);
                    setHistoryIndex(0);
                });
            }

            if (initialAudio && initialAudio.file) {
                setAudioTracks([{
                    id: 'initial-audio',
                    name: initialAudio.name,
                    type: initialAudio.type || 'direct',
                    file: initialAudio.file
                }]);
            }
        }
    }, []);

    // -- Effects --
    useEffect(() => {
        const style = editingStyles.find(s => s.id === selectedStyle);
        if (style) {
            if (style.ratio) {
                const preset = PRESET_RATIOS[style.ratio];
                if (preset) applyAspectRatio(preset.width, preset.height, preset.name);
            }
            // Auto-set standard FPS based on style if needed
            if (style.id === 'youtube') setFps(60);
            else setFps(30);
        }
    }, [selectedStyle]);



    const getPreviewCssFilter = () => {
        if (selectedEffect === 'blur') return `blur(${blurAmount}px)`;
        if (selectedEffect === 'color-correction') return `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
        if (selectedEffect === 'motion-blur') return `blur(${motionBlurAmount}px) brightness(1.05)`;
        if (selectedEffect === 'rgb-split') return `contrast(1.2) saturate(1.3)`;
        if (selectedEffect === 'film-grain') return 'contrast(1.05) saturate(1.1)';
        if (selectedEffect === 'flash-effect') return 'brightness(1.4) contrast(1.15)';
        if (selectedEffect === 'smooth-zoom') return 'contrast(1.1)';
        if (selectedEffect === 'velocity') return 'saturate(1.1)';
        if (selectedEffect === 'glitch') return 'contrast(1.1) saturate(1.25)';
        return 'none';
    };

    const getPreviewFilterCss = () => {
        if (selectedEffect === 'black-white') return 'grayscale(1)';
        if (selectedEffect === 'cinematic') return 'contrast(1.4) brightness(1.1) saturate(1.2)';
        if (selectedEffect === 'warm') return 'sepia(0.22) saturate(1.15) hue-rotate(-10deg)';
        if (selectedEffect === 'cool') return 'saturate(1.08) hue-rotate(18deg)';
        if (selectedEffect === 'sepia') return 'sepia(1)';
        if (selectedEffect === 'hdr') return 'contrast(1.6) brightness(1.2) saturate(1.4)';
        if (selectedEffect === 'vivid') return 'contrast(1.3) brightness(1.1) saturate(2.5)';

        if (selectedFilter && selectedFilter.startsWith('pro-filter-')) {
            const parts = selectedFilter.split('-');
            const categorySlug = parts[2];
            const index = parseInt(parts[3], 10);
            const intensity = proParams.intensity ?? 0.5;
            const config = getFilterConfig(categorySlug, index, intensity);
            return config.css;
        }

        if (selectedFilter === 'black-white') return 'grayscale(1) contrast(1.15)';
        if (selectedFilter === 'cinematic') return 'contrast(1.45) brightness(1.1) saturate(1.25)';
        if (selectedFilter === 'moody') return 'contrast(1.2) brightness(0.95) saturate(0.95) sepia(0.08)';
        if (selectedFilter === 'warm-tone') return 'sepia(0.2) saturate(1.25) hue-rotate(-8deg) brightness(1.05)';
        if (selectedFilter === 'cool-tone') return 'saturate(1.1) hue-rotate(14deg) brightness(0.98)';
        if (selectedFilter === 'vintage') return 'sepia(0.35) contrast(0.95) brightness(1.05) saturate(0.9)';
        if (selectedFilter === 'teal-orange') return 'contrast(1.3) saturate(1.25) hue-rotate(-7deg) brightness(1.02)';
        if (selectedFilter === 'dreamy-glow') return 'contrast(0.95) saturate(1.15) brightness(1.05)';
        if (selectedFilter === 'film-look') return 'contrast(1.2) brightness(1.05) saturate(1.15)';
        if (selectedFilter === 'vhs') return 'contrast(1.15) saturate(1.2) hue-rotate(2deg) sepia(0.05)';
        if (selectedFilter === 'soft-skin') return 'brightness(1.05) saturate(1.15) contrast(0.95)';
        if (selectedFilter === 'neon-glow') return 'saturate(1.4) brightness(1.05) contrast(1.2) hue-rotate(10deg)';
        if (selectedFilter === 'hdr-pop') return 'contrast(1.55) brightness(1.15) saturate(1.45)';

        return 'none';
    };

    const getCombinedPreviewFilterCss = () => {
        let filters = [];
        const effectFilter = getPreviewCssFilter();
        const filterFilter = getPreviewFilterCss();
        
        if (effectFilter !== 'none') filters.push(effectFilter);
        if (filterFilter !== 'none') filters.push(filterFilter);

        const activeClipSettings = activePreviewId ? clipSettings[activePreviewId] || {} : {};
        if (activeClipSettings.blur) {
            filters.push(`blur(${activeClipSettings.blur}px)`);
        }
        
        return filters.length > 0 ? filters.join(' ') : 'none';
    };

    const getCropInsets = () => {
        const halfW = cropWidthPct / 2;
        const halfH = cropHeightPct / 2;
        const left = Math.max(0, Math.min(100, cropCenterX - halfW));
        const right = Math.max(0, Math.min(100, 100 - (cropCenterX + halfW)));
        const top = Math.max(0, Math.min(100, cropCenterY - halfH));
        const bottom = Math.max(0, Math.min(100, 100 - (cropCenterY + halfH)));
        return { left, right, top, bottom };
    };

    const getPreviewClipPath = () => {
        const insets = getCropInsets();
        if (
            Math.abs(insets.left) < 0.001 &&
            Math.abs(insets.right) < 0.001 &&
            Math.abs(insets.top) < 0.001 &&
            Math.abs(insets.bottom) < 0.001
        ) {
            return 'none';
        }
        return `inset(${insets.top}% ${insets.right}% ${insets.bottom}% ${insets.left}%)`;
    };

    const getPreviewTransform = () => {
        const zoomScale = selectedEffect === 'zoom' ? previewZoom : selectedEffect === 'smooth-zoom' ? 1 + smoothZoomAmount * Math.sin((progress / 100) * Math.PI) : 1;
        let keyframeScale = 1;
        if (keyframeMode === 'zoom-in') {
            keyframeScale = 1 + (keyframeAmount - 1) * keyframeProgress;
        } else if (keyframeMode === 'zoom-out') {
            keyframeScale = keyframeAmount - (keyframeAmount - 1) * keyframeProgress;
        } else if (keyframeMode === 'pulse') {
            keyframeScale = 1 + (keyframeAmount - 1) * Math.sin(keyframeProgress * Math.PI);
        }

        let shakeOffset = '';
        if (selectedEffect === 'shake') {
            const t = performance.now() / 1000;
            const strength = typeof shakeStrength !== 'undefined' ? shakeStrength : 1.5;
            const x = Math.sin(t * 18) * strength * 1.2;
            const y = Math.cos(t * 14) * strength * 0.9;
            shakeOffset = ` translate(${x}px, ${y}px)`;
        }

        let rgbOffset = '';
        if (selectedEffect === 'rgb-split') {
            const offset = rgbSplitAmount;
            rgbOffset = ` translate(${Math.sin(performance.now() / 150) * offset * 0.4}px, ${Math.cos(performance.now() / 180) * offset * 0.25}px)`;
        }

        let glitchOffset = '';
        if (selectedEffect === 'glitch') {
            const t = performance.now() / 130;
            const x = Math.sin(t * 25) * 2.5;
            const y = Math.cos(t * 31) * 1.8;
            glitchOffset = ` translate(${x}px, ${y}px)`;
        }

        const scaleXVal = activePreviewId && clipSettings[activePreviewId]?.mirror ? -1 : 1;
        const scaleYVal = activePreviewId && clipSettings[activePreviewId]?.flip ? -1 : 1;

        const baseTransform = `scale(${zoomScale * zoomToolAmount * keyframeScale}) scale(${scaleXVal}, ${scaleYVal}) rotate(${rotationDegrees}deg)`;
        return `${baseTransform}${shakeOffset}${rgbOffset}${glitchOffset}`;
    };

    const activeTrim = activePreviewItem && activePreviewItem.type === 'video'
        ? getTrimRangeForItem(activePreviewItem?.id || '', activePreviewItem?.duration || 0)
        : null;

    const hasTrimApplied = activeTrim
        ? activeTrim.start > 0 || (activeTrim.end < (activePreviewItem?.duration || 0) - 0.01)
        : false;

    // -- Handlers --
    const toggleOption = (option: keyof typeof aiOptions) => {
        setAiOptions((prev) => ({ ...prev, [option]: !prev[option] }));
    };

    const copyActiveClip = () => {
        if (!activePreviewId) return;

        setMediaItems((prev) => {
            const index = prev.findIndex((item) => item?.id === activePreviewId);
            if (index === -1) return prev;

            const source = prev[index];
            const nextId = Math.random().toString(36).substr(2, 9);
            const preview = source.file ? URL.createObjectURL(source.file) : (source.preview || '');

            if (source.file) {
                createdPreviewUrlsRef.current.push(preview);
            }

            const copyItem = {
                ...source,
                id: nextId,
                preview,
            };

            const updated = [...prev];
            updated.splice(index + 1, 0, copyItem);
            saveToUndo(updated);
            selectPreviewWithTransition(nextId);
            return updated;
        });
    };

    useEffect(() => {
        const handleInsert = (e: any) => {
            const { targetId, type } = e.detail;
            setPendingInsertTargetId(targetId);
            setPendingInsertType(type);
            
            if (type === 'video' || type === 'image' || type === 'audio') {
                if (mediaInputRef.current) {
                    mediaInputRef.current.accept = type === 'audio' ? 'audio/*' : 'video/*,image/*';
                    mediaInputRef.current.click();
                }
            } else if (type === 'text') {
                // Switch to titles panel and immediately add text clip to the target track
                setActiveTool('text-tool');
                setPendingInsertTargetId(null);
                setPendingInsertType(null);
                handleAddTextClipToTimeline(targetId);
            }
        };

        const handleTransition = (e: any) => {
            setActiveTransitionTargetId(e.detail.targetId);
            setActiveTransitionNextId(e.detail.nextId);
        };

        window.addEventListener('insert-media-at', handleInsert);
        window.addEventListener('open-transition-editor', handleTransition);
        return () => {
            window.removeEventListener('insert-media-at', handleInsert);
            window.removeEventListener('open-transition-editor', handleTransition);
        };
    }, []);

    const handleAddTextClipToTimeline = useCallback((targetTrackId?: string) => {
        const textClipId = 'text-' + Math.random().toString(36).substr(2, 9);
        const newTextClip = {
            id: textClipId,
            type: 'text',
            duration: 5,
        };
        
        setClipStartOverrides(prevStarts => {
            const newStarts = {
                ...prevStarts,
                [textClipId]: globalCurrentTime
            };
            
            setClipTrackOverrides(prevOverrides => {
                const newOverrides = {
                    ...prevOverrides,
                    [textClipId]: targetTrackId || 'text-1'
                };
                
                setMediaItems(prevItems => {
                    const updatedItems = [...prevItems, newTextClip];
                    saveToUndo(updatedItems, undefined, undefined, newStarts, newOverrides);
                    return updatedItems;
                });
                
                return newOverrides;
            });
            
            return newStarts;
        });


        setClipSettings((prev: any) => ({
            ...prev,
            [textClipId]: {
                overlayText: 'New Text',
                overlayFontSize: 64,
                overlayColor: '#FFFFFF',
                overlayPosX: 50,
                overlayPosY: 50
            }
        }));
        setActivePreviewId(textClipId);
        setActiveTool('text-tool');
        
        setIsTextPlacementMode(false);
    }, [saveToUndo, globalCurrentTime]);

    useEffect(() => {
        const handleAddTextEvent = () => handleAddTextClipToTimeline();
        window.addEventListener('add-text-clip', handleAddTextEvent);
        return () => window.removeEventListener('add-text-clip', handleAddTextEvent);
    }, [handleAddTextClipToTimeline]);

    const handleMediaImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newItems = await Promise.all(files.map(async file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video/') ? 'video' as const : 'image' as const,
            duration: await getMediaDuration(file)
        })));

        if (session?.user?.id) {
            newItems.forEach(async item => {
                const thumbnail_url = await generateThumbnail((item?.file));
                supabase.from('app_uploads').insert({
                    user_id: session.user.id,
                    original_filename: (item?.file).name,
                    upload_type: (item?.type || 'video') === 'video' ? 'Video' : 'Image',
                    size: `${((item?.file).size / (1024 * 1024)).toFixed(2)} MB`,
                    resolution: "Unknown",
                    duration: `${(item?.duration || 0).toFixed(1)}s`,
                    tool_used: "Manual Edit",
                    used_in_project: "Draft",
                    thumbnail_url
                }).then();
            });
        }

        selectPreviewWithTransition(newItems[0].id);
        setIsPlaying(false);

        // Put imported files into the Sidebar Media library
        setLibraryAssets(prev => [...prev, ...newItems]);

        // If this was triggered by a timeline insert menu
        if (pendingInsertTargetId) {
            setMediaItems(prev => {
                const updated = [...prev];
                const timelineItems = newItems.map(item => ({
                    id: Math.random().toString(36).substr(2, 9),
                    file: (item?.file),
                    preview: (item?.preview),
                    type: (item?.type || 'video'),
                    duration: (item?.duration || 0),
                }));
                
                if (pendingInsertTargetId === '__START__') {
                    updated.unshift(...timelineItems);
                } else {
                    const targetIndex = prev.findIndex(item => item?.id === pendingInsertTargetId);
                    if (targetIndex !== -1) {
                        // Insert directly after the target
                        updated.splice(targetIndex + 1, 0, ...timelineItems);
                    }
                }
                
                saveToUndo(updated);
                
                // Note: TimelineHub dynamically calculates startTimes based on sequential order.
                // By inserting them into the array, they will naturally push subsequent clips to the right!
                
                return updated;
            });
            setPendingInsertTargetId(null);
            setPendingInsertType(null);
        }

        if (e.target) {
            e.target.value = '';
        }
    };

    const removeLibraryAsset = (id: string) => {
        setLibraryAssets(prev => {
            const item = prev.find(i => i?.id === id);
            if (item) URL.revokeObjectURL((item?.preview) || '');
            const nextAssets = prev.filter(i => i?.id !== id);
            if (activePreviewId === id) {
                selectPreviewWithTransition(nextAssets[0]?.id || null);
            }
            return nextAssets;
        });
    };

    const removeMediaItem = (id: string) => {
        setMediaItems(prev => {
            const item = prev.find(i => i?.id === id);
            if (item) URL.revokeObjectURL((item?.preview) || '');
            const nextItems = prev.filter(i => i?.id !== id);
            if (activePreviewId === id) {
                selectPreviewWithTransition(nextItems[0]?.id || null);
            }
            saveToUndo(nextItems);
            return nextItems;
        });
    };

    const handleAddAssetToTimeline = useCallback((assetId: string, newClipId: string) => {
        const asset = libraryAssets.find(a => a?.id === assetId);
        if (!asset) return;

        if ((asset?.type || 'video') === 'video' || (asset?.type || 'video') === 'image') {
            const newClip = {
                id: newClipId,
                file: (asset?.file),
                preview: (asset?.preview),
                type: (asset?.type || 'video'),
                duration: (asset?.duration || 0),
            };
            setMediaItems(prev => {
                const updated = [...prev, newClip];
                saveToUndo(updated);
                return updated;
            });
            selectPreviewWithTransition(newClipId);
        } else if ((asset?.type || 'video') === 'audio') {
            setAudioTracks(prev => {
                const newAudio = {
                    id: newClipId,
                    name: (asset?.file)?.name || "Audio Track",
                    duration: (asset?.duration || 0) || 10,
                    type: 'direct' as const,
                    file: (asset?.file) || undefined,
                    preview: (asset?.preview),
                };
                return [...prev, newAudio];
            });
        }
    }, [libraryAssets]);

    const handleReorderClips = useCallback((fromIndexOrId: number | string, toIndex: number) => {
        setMediaItems((prev) => {
            const updated = [...prev];
            let fromIdx = -1;

            if (typeof fromIndexOrId === 'number') {
                fromIdx = fromIndexOrId;
            } else {
                fromIdx = prev.findIndex((item) => item?.id === fromIndexOrId);
            }

            if (fromIdx === -1 || fromIdx === toIndex) return prev;

            const [removed] = updated.splice(fromIdx, 1);
            updated.splice(toIndex, 0, removed);

            saveToUndo(updated);
            return updated;
        });
    }, [saveToUndo]);

    const handleDeleteClip = useCallback((clipId: string) => {
        setMediaItems((prev) => {
            const updated = prev.filter((item) => item?.id !== clipId);

            // Clean up related states for deleted clip
            const nextTransitions = { ...clipTransitions };
            delete nextTransitions[clipId];
            setClipTransitions(nextTransitions);

            const nextTrimRanges = { ...clipTrimRanges };
            delete nextTrimRanges[clipId];
            setClipTrimRanges(nextTrimRanges);

            const nextStarts = { ...clipStartOverrides };
            delete nextStarts[clipId];
            setClipStartOverrides(nextStarts);

            const nextTracks = { ...clipTrackOverrides };
            delete nextTracks[clipId];
            setClipTrackOverrides(nextTracks);

            const nextNames = { ...clipNameOverrides };
            delete nextNames[clipId];
            setClipNameOverrides(nextNames);

            const nextLocks = { ...clipLockedStates };
            delete nextLocks[clipId];
            setClipLockedStates(nextLocks);

            // Save to undo stack with updated clean states
            saveToUndo(updated, nextTransitions, nextTrimRanges, nextStarts, nextTracks, nextNames, nextLocks);

            // If the deleted clip was active, select a new active clip
            if (activePreviewId === clipId) {
                const newActiveId = updated.length > 0 ? updated[0].id : null;
                setActivePreviewId(newActiveId);
            }

            return updated;
        });
    }, [activePreviewId, saveToUndo, clipTransitions, clipTrimRanges, clipStartOverrides, clipTrackOverrides, clipNameOverrides, clipLockedStates]);

    // Ã¢â€â‚¬Ã¢â€â‚¬ AI Command Agent action executor Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    const handleCommandActions = useCallback((actions: any[]) => {
        for (const action of actions) {
            if (!action || action.type === 'unsupported') continue;

            const { type, target, capabilityId, text } = action;

            // Resolve clip indices from target string
            const resolveClipIds = (): string[] => {
                if (target === 'all') return mediaItems.map((m: any) => m.id);
                if (target === 'selected') return activePreviewId ? [activePreviewId] : [];
                const m = /clip\s+(\d+)/i.exec(target || '');
                if (m) {
                    const idx = parseInt(m[1], 10) - 1;
                    if (mediaItems[idx]) return [mediaItems[idx].id];
                }
                return activePreviewId ? [activePreviewId] : [];
            };

            const clipIds = resolveClipIds();

            switch (type) {
                case 'applyEffect':
                case 'removeEffect': {
                    const effectId = type === 'removeEffect' ? 'none' : capabilityId;
                    if (clipIds.length === 0) { setSelectedEffect(effectId as any); break; }
                    clipIds.forEach((id: string) => {
                        if (id === activePreviewId) {
                            setSelectedEffect(effectId as any);
                        } else {
                            setClipSettings((prev: any) => ({
                                ...prev,
                                [id]: { ...(prev[id] || {}), selectedEffect: effectId }
                            }));
                        }
                    });
                    // For animated effects, also set their intensity/amount defaults
                    // and start playback so the animation is immediately visible
                    if (effectId === 'smooth-zoom') {
                        setSmoothZoomAmount((prev: number) => prev > 0 ? prev : 0.35);
                        setIsPlaying(true);
                    } else if (effectId === 'shake') {
                        setShakeStrength((prev: number) => prev > 0 ? prev : 5);
                        setIsPlaying(true);
                    } else if (effectId === 'motion-blur') {
                        setMotionBlurAmount((prev: number) => prev > 0 ? prev : 4);
                    } else if (effectId === 'glitch') {
                        setIsPlaying(true);
                    } else if (effectId === 'rgb-split') {
                        setIsPlaying(true);
                    }
                    break;
                }

                case 'applyFilter':
                case 'removeFilter': {
                    const filterId = type === 'removeFilter' ? 'none' : capabilityId;
                    if (clipIds.length === 0) { setSelectedFilter(filterId as any); break; }
                    clipIds.forEach((id: string) => {
                        if (id === activePreviewId) {
                            setSelectedFilter(filterId as any);
                        } else {
                            setClipSettings((prev: any) => ({
                                ...prev,
                                [id]: { ...(prev[id] || {}), selectedFilter: filterId }
                            }));
                        }
                    });
                    break;
                }

                case 'addTransition': {
                    const transitionClips = clipIds.length > 0 ? clipIds : (activePreviewId ? [activePreviewId] : []);
                    transitionClips.forEach((id: string) => {
                        setClipTransitions((prev: any) => ({
                            ...prev,
                            [id]: capabilityId as any
                        }));
                        if (id === activePreviewId) {
                            const currentIndex = mediaItems.findIndex((item: any) => item?.id === id);
                            if (currentIndex !== -1 && currentIndex < mediaItems.length - 1) {
                                const nextId = mediaItems[currentIndex + 1].id;
                                setTransitionOverlay({
                                    fromId: id,
                                    toId: nextId,
                                    type: capabilityId as any,
                                    startAt: performance.now(),
                                    durationMs: 1400,
                                });
                                setTransitionProgress(0);
                            }
                        }
                    });
                    break;
                }

                case 'addCaption': {
                    if (!text) break;
                    const captionClips = clipIds.length > 0 ? clipIds : (activePreviewId ? [activePreviewId] : []);
                    if (captionClips.length === 0) break;
                    const newCaptions = captionClips.map((id: string) => ({
                        id: Math.random().toString(36).substr(2, 9),
                        text: text as string,
                        startTime: 0,
                        endTime: 3,
                        clipId: id,
                    }));
                    setCaptions((prev: any) => [...prev, ...newCaptions]);
                    setActiveTool('captions');
                    break;
                }

                case 'setOverlayText': {
                    if (text) {
                        setOverlayText(text as string);
                        setActiveTool('text-tool');
                    }
                    break;
                }

                case 'applyTextStyle':
                case 'removeTextStyle': {
                    const styleId = type === 'removeTextStyle' ? null : capabilityId;
                    setOverlayTextStylePreset(styleId);
                    const matchedEffect = getOverlayTextEffectForPreset(styleId);
                    setSelectedEffect(matchedEffect as any);
                    setActiveTool('text-tool');
                    break;
                }

                case 'applyCaptionStyle':
                case 'removeCaptionStyle': {
                    const captionStyleId = type === 'removeCaptionStyle' ? null : capabilityId;
                    setCaptionStylePreset(captionStyleId);
                    setActiveTool('captions');
                    break;
                }

                case 'selectClip': {
                    if (clipIds[0]) {
                        setActivePreviewId(clipIds[0]);
                    }
                    break;
                }

                case 'applyTool': {
                    if (capabilityId) {
                        setActiveTool(capabilityId);
                        if (['effects', 'filters'].includes(capabilityId)) {
                            setInspectorTab('video');
                        } else if (['speed', 'trim'].includes(capabilityId)) {
                            setInspectorTab('speed');
                        } else if (['rotate', 'zoom', 'keyframe'].includes(capabilityId)) {
                            setInspectorTab('video');
                            setInspectorSubTab('basic');
                            setIsTransformExpanded(true);
                        } else if (capabilityId === 'crop') {
                            setInspectorTab('video');
                            setInspectorSubTab('basic');
                        } else if (capabilityId === 'volume') {
                            setInspectorTab('audio');
                        } else if (capabilityId === 'captions') {
                            setInspectorTab('video');
                        }
                    }
                    break;
                }

                default:
                    console.warn('[CommandAgent] Unhandled action type:', type);
            }
        }
    }, [
        mediaItems,
        activePreviewId,
        setSelectedEffect,
        setSelectedFilter,
        setClipSettings,
        setClipTransitions,
        setTransitionOverlay,
        setTransitionProgress,
        setCaptions,
        setActiveTool,
        setActivePreviewId,
        setInspectorTab,
        setInspectorSubTab,
        setIsTransformExpanded,
        setOverlayText,
        setOverlayTextStylePreset,
        setCaptionStylePreset,
        getOverlayTextEffectForPreset,
        setSmoothZoomAmount,
        setShakeStrength,
        setMotionBlurAmount,
        setIsPlaying,
    ]);

    const handleAddAudio = (type: 'extracted' | 'direct', trackIndex = 0) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'extracted' ? 'video/*' : 'audio/*';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) {
                setShowAudioChoice(false);
                return;
            }

            if (type === 'extracted') {
                setAudioError(null);
                setExtractingAudio(true);
                try {
                    const extractedFile = await extractAudioFromVideoFile(file);
                    setAudioTracks(prev => [...prev, {
                        id: Math.random().toString(36).substr(2, 9),
                        name: extractedFile.name,
                        type,
                        file: extractedFile,
                        trackIndex
                    }]);
                } catch (error: any) {
                    setAudioError(error?.message || "Failed to extract audio from the selected video.");
                } finally {
                    setExtractingAudio(false);
                    setShowAudioChoice(false);
                }
            } else {
                setAudioTracks(prev => [...prev, {
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    type,
                    file,
                    trackIndex
                }]);
                setShowAudioChoice(false);
            }
        };
        input.click();
    };

    const removeAudioTrack = (id: string) => {
        setAudioTracks(prev => prev.filter(t => t.id !== id));
    };

    const applyTransitionForActiveClip = (transition: TransitionType) => {
        try {
            if (!activePreviewId) {
                console.warn("Ã¢Å¡Â Ã¯Â¸Â [TRANSITIONS] No active clip selected");
                return;
            }

            setIsPlaying(false);
            if (videoRef.current) {
                videoRef.current.pause();
            }

            console.log("Ã°Å¸â€œÂ [TRANSITIONS] Applying transition to clip", {
                clipId: activePreviewId,
                transition,
                allClipTransitions: clipTransitions
            });

            // Save transition to state - this is what gets sent to the backend
            setClipTransitions((prev) => {
                const updated = { ...prev, [activePreviewId]: transition };
                console.log("Ã¢Å“â€¦ [TRANSITIONS] Transition saved to state", {
                    clipId: activePreviewId,
                    transition,
                    updated
                });
                saveToUndo(mediaItems, updated);
                return updated;
            });

            const currentIndex = mediaItems.findIndex((item) => item?.id === activePreviewId);
            if (currentIndex !== -1) {
                const activeItem = mediaItems[currentIndex];
                const trim = getTrimRangeForItem(activePreviewItem?.id || '', activePreviewItem?.duration || 0);
                
                // Seek to 2 seconds before the end of the clip (transition start area)
                const seekLocal = Math.max(trim.start, trim.end - 2.0);
                if (videoRef.current) {
                    videoRef.current.currentTime = seekLocal;
                }
                
                const timeBefore = mediaItems.slice(0, currentIndex).reduce((acc, item) => acc + getEffectiveDurationForItem(item), 0);
                const seekGlobal = timeBefore + (seekLocal - trim.start);
                const totalDuration = getTotalEffectiveDuration();
                const startPos = (seekGlobal / (totalDuration || 1)) * 100;
                setProgress(startPos);
                setReadLinePosition(startPos);

                setIsPlaying(true);
            }

            setTimeout(() => {
                setActiveTool(null);
            }, 100);
        } catch (error) {
            console.error("Ã¢ÂÅ’ [TRANSITIONS] Error applying transition:", error);
        }
    };

    const handleGenerate = () => {
        const effectSettings = {
            blurAmount,
            brightness,
            contrast,
            saturation,
            slowMotionSpeed,
            glitchIntensity,
            velocitySpeed,
            motionBlurAmount,
            shakeStrength,
            flashIntensity,
            rgbSplitAmount,
            smoothZoomAmount,
            filmGrainOpacity,
            animatedText: overlayText.trim().length > 0 ? overlayText : animatedText,
            ...proParams,
        };

        const mediaForProcessing = [...mediaItems]
            .sort((a, b) => {
                const startA = clipStartOverrides[a?.id] !== undefined ? clipStartOverrides[a?.id] : 0;
                const startB = clipStartOverrides[b?.id] !== undefined ? clipStartOverrides[b?.id] : 0;
                return startA - startB;
            })
            .filter((item) => (item?.file))
            .map((item) => {
                const settings = clipSettings[item?.id] || {};
                const isCurrent = item?.id === activePreviewId;
                return {
                    id: item?.id,
                    file: (item?.file),
                    type: (item?.type || 'video'),
                    duration: (item?.duration || 0),
                    effect: isCurrent ? (selectedEffect || 'none') : (settings.selectedEffect || 'none'),
                    filter: isCurrent ? (selectedFilter || 'none') : (settings.selectedFilter || 'none'),
                    effectSettings: {
                        blurAmount: settings.blurAmount ?? (isCurrent ? blurAmount : 10),
                        brightness: settings.brightness ?? (isCurrent ? brightness : 1),
                        contrast: settings.contrast ?? (isCurrent ? contrast : 1),
                        saturation: settings.saturation ?? (isCurrent ? saturation : 1),
                        slowMotionSpeed: settings.slowMotionSpeed ?? (isCurrent ? slowMotionSpeed : 0.25),
                        glitchIntensity: settings.glitchIntensity ?? (isCurrent ? glitchIntensity : 1),
                        velocitySpeed: settings.velocitySpeed ?? (isCurrent ? velocitySpeed : 1.5),
                        motionBlurAmount: settings.motionBlurAmount ?? (isCurrent ? motionBlurAmount : 3),
                        shakeStrength: settings.shakeStrength ?? (isCurrent ? shakeStrength : 1.5),
                        flashIntensity: settings.flashIntensity ?? (isCurrent ? flashIntensity : 0.75),
                        rgbSplitAmount: settings.rgbSplitAmount ?? (isCurrent ? rgbSplitAmount : 12),
                        smoothZoomAmount: settings.smoothZoomAmount ?? (isCurrent ? smoothZoomAmount : 0.35),
                        filmGrainOpacity: settings.filmGrainOpacity ?? (isCurrent ? filmGrainOpacity : 0.4),
                        ...(isCurrent ? (proParams || {}) : (settings.proParams ?? {})),
                    },
                    textOverlay: {
                        enabled: (settings.overlayText || (isCurrent ? overlayText : '')).trim().length > 0,
                        text: settings.overlayText || (isCurrent ? overlayText : ''),
                        stylePreset: settings.overlayTextStylePreset || (isCurrent ? overlayTextStylePreset : 'none'),
                        fontId: settings.overlayFontId || (isCurrent ? overlayFontId : 'rubik'),
                        fontFamily: textFontOptions.find((f) => f.id === (settings.overlayFontId || (isCurrent ? overlayFontId : 'rubik')))?.family || textFontOptions[0].family,
                        fontSize: settings.overlayFontSize ?? (isCurrent ? overlayFontSize : 48),
                        color: settings.overlayColor || (isCurrent ? overlayColor : '#FFFFFF'),
                        bgEnabled: settings.overlayBgEnabled ?? (isCurrent ? overlayBgEnabled : false),
                        bgColorHex: settings.overlayBgColorHex || (isCurrent ? overlayBgColorHex : '#000000'),
                        position: {
                            x: settings.overlayPosX ?? (isCurrent ? overlayPosX : 50),
                            y: settings.overlayPosY ?? (isCurrent ? overlayPosY : 50),
                        },
                    },
                };
            });

        const transitionPlan = mediaForProcessing.map((item, index) => ({
            index,
            transition: clipTransitions[item?.id] || 'none',
        }));

        console.log("Ã°Å¸Å½Â¬ [GENERATE] Transition plan created:", {
            mediaCount: mediaForProcessing.length,
            transitionPlan: transitionPlan,
            clipTransitions: clipTransitions,
            hasTransitions: transitionPlan.some(t => t.transition !== 'none'),
        });

        const audioForProcessing = audioTracks
            .filter((track) => track.file)
            .map((track) => ({
                id: track.id,
                name: track.name,
                type: track.type,
                file: track.file,
            }));

        const editorSelections = {
            style: {
                selected: selectedStyle,
                aspectRatio: formattedRatio,
                fps,
                exportQuality,
                watermark,
            },
            effect: {
                selected: selectedEffect,
                enabled: selectedEffect !== 'none',
                settings: effectSettings,
            },
            transitions: {
                transitionPlan,
                clipTransitions,
            },
            filters: {
                enabled: selectedFilter !== 'none' || selectedEffect === 'color-correction',
                selected: selectedFilter,
                brightness,
                contrast,
                saturation,
            },
            speed: {
                enabled: Math.abs(speedValue - 1) > 0.001 || selectedEffect === 'slow-motion',
                value: speedValue,
            },
            trim: {
                enabled: Object.keys(clipTrimRanges).length > 0,
                activeClipId: activePreviewId,
                start: activePreviewId ? (clipTrimRanges[activePreviewId]?.start ?? 0) : 0,
                end: activePreviewId ? (clipTrimRanges[activePreviewId]?.end ?? null) : null,
                clipRanges: clipTrimRanges,
            },
            textOverlay: {
                enabled: overlayText.trim().length > 0,
                text: overlayText,
                stylePreset: overlayTextStylePreset || 'none',
                fontId: overlayFontId,
                fontFamily: textFontOptions.find((f) => f.id === overlayFontId)?.family || textFontOptions[0].family,
                fontSize: overlayFontSize,
                color: overlayColor,
                bgEnabled: overlayBgEnabled,
                bgColorHex: overlayBgColorHex,
                position: {
                    x: overlayPosX,
                    y: overlayPosY,
                },
            },
            rotate: {
                enabled: rotationDegrees % 360 !== 0,
                degrees: rotationDegrees,
            },
            volume: {
                muted: isMuted,
                level: isMuted ? 0 : volumeLevel,
            },
            zoom: {
                enabled: zoomToolAmount > 1.001 || selectedEffect === 'zoom',
                mode: 'in',
                amount: zoomToolAmount,
            },
            crop: {
                enabled:
                    cropWidthPct < 99.99 ||
                    cropHeightPct < 99.99 ||
                    Math.abs(cropCenterX - 50) > 0.01 ||
                    Math.abs(cropCenterY - 50) > 0.01,
                centerX: cropCenterX,
                centerY: cropCenterY,
                widthPct: cropWidthPct,
                heightPct: cropHeightPct,
            },
            keyframe: {
                enabled: keyframeMode !== 'none',
                mode: keyframeMode,
                amount: keyframeAmount,
                points:
                    keyframeMode === 'none'
                        ? []
                        : [
                            { time: 0, value: keyframeMode === 'zoom-out' ? keyframeAmount : 1 },
                            { time: 1, value: keyframeMode === 'zoom-in' ? keyframeAmount : 1 },
                        ],
            },
            aiOptions,
            prompt,
            media: {
                items: mediaForProcessing.map((item) => ({
                    id: item?.id,
                    type: (item?.type || 'video'),
                    duration: (item?.duration || 0),
                    effect: item.effect,
                    filter: item.filter,
                    effectSettings: item.effectSettings,
                    textOverlay: item.textOverlay,
                })),
                count: mediaForProcessing.length,
            },
            audio: {
                tracks: audioForProcessing.map((track) => ({ id: track.id, name: track.name, type: track.type })),
                count: audioForProcessing.length,
            },
            captions: captions.map((caption) => ({
                id: caption.id,
                text: caption.text,
                startTime: caption.startTime,
                endTime: caption.endTime,
                clipId: caption.clipId,
            })),
            captionStyle: {
                fontId: captionStyle.fontId,
                fontFamily: textFontOptions.find((f) => f.id === captionStyle.fontId)?.family || 'Arial',
                fontSize: captionStyle.fontSize,
                color: captionStyle.color,
                bgEnabled: captionStyle.bgEnabled,
                bgColorHex: captionStyle.bgColorHex,
                alignment: captionStyle.alignment,
                bold: captionStyle.bold,
                italic: captionStyle.italic,
                outline: captionStyle.outline,
                posX: captionStyle.posX,
                posY: captionStyle.posY,
            },
        };

        // Debug logging for transitions
        console.log("Ã°Å¸â€œÂ¤ [QUICK-EDIT] Sending to processing screen:", {
            mediaCount: mediaForProcessing.length,
            transitionPlan: transitionPlan,
            clipTransitions: clipTransitions,
            editorSelectionsTransitions: editorSelections.transitions,
            hasTransitionsInPlan: transitionPlan.some(t => t.transition !== 'none'),
            hasTransitionsInClipMap: Object.values(clipTransitions).some(t => t !== 'none'),
        });

        if (session?.user?.id) {
            // Async insert, we don't await so it doesn't block navigation
            supabase.from('app_generations_history').insert({
                user_id: session.user.id,
                type: "Ai manual edit",
                title: `${mediaItems.length > 0 ? mediaItems.length + ' Media Items' : 'Quick Edit'} Ã¢â‚¬Â¢ ${editingStyles.find(s => s.id === selectedStyle)?.title || selectedStyle}`,
                description: `Ratio: ${formattedRatio} Ã¢â‚¬Â¢ FPS: ${fps} Ã¢â‚¬Â¢ Quality: ${exportQuality}`,
                metadata: {
                    style: selectedStyle,
                    ratio: formattedRatio,
                    fps,
                    exportQuality,
                    watermark,
                    aiOptions,
                    selectedEffect,
                    effectSettings,
                    transitionPlan,
                    editorSelections,
                }
            }).then();

            // Add to downloads table
            const activeFile = mediaItems.find((item: any) => item?.id === activePreviewId)?.file || mediaItems[0]?.file;
            const thumbPromise = activeFile ? generateThumbnail(activeFile) : Promise.resolve("https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800");

            thumbPromise.then(thumbnail_url => {
                supabase.from('app_downloads').insert({
                    user_id: session.user.id,
                    project_name: `${mediaItems.length > 0 ? mediaItems.length + ' Media Items' : 'Quick Edit'}`,
                    tool_used: "Manual Edit",
                    prompt: prompt || "Manual video editing",
                    resolution: exportQuality,
                    aspect_ratio: formattedRatio,
                    duration: "Variable",
                    file_size: "128 MB",
                    format: "MP4",
                    video_url: "",
                    thumbnail_url
                }).then();
            });
        }

        navigate(`/quick-edit/processing${location.search}`, {
            state: {
                selectedStyle,
                aspectRatio: formattedRatio,
                fps,
                exportQuality,
                watermark,
                aiOptions,
                prompt,
                selectedEffect,
                selectedFilter,
                effectSettings,
                transitionPlan,
                editorSelections,
                mediaItems: mediaForProcessing,
                audioTracks: audioForProcessing,
                selectedMusic: selectedMusic ? {
                    id: selectedMusic?.id,
                    name: selectedMusic.name,
                    artist: selectedMusic.artist,
                    url: selectedMusic.url,
                    volume: selectedMusic.volume,
                    startTime: selectedMusic.startTime,
                    endTime: selectedMusic.endTime,
                    muteOriginal: selectedMusic.muteOriginal,
                    source: selectedMusic.source,
                } : null,
            },
        });
    };

    const getTransitionLayerStyle = (
        layer: 'from' | 'to',
        type: TransitionType,
        p: number
    ): React.CSSProperties => {
        const isFrom = layer === 'from';
        const base: React.CSSProperties = { opacity: 1, transform: 'none', filter: 'none' };

        const registeredTransition = getTransition(type);
        if (registeredTransition) {
            return {
                ...base,
                ...registeredTransition.getCssStyle(p, layer)
            };
        }

        if (type === 'cross-dissolve') {
            base.opacity = isFrom ? 1 - p : p;
        } else if (type === 'slide-left') {
            base.transform = isFrom ? `translateX(${-p * 100}%)` : `translateX(${(1 - p) * 100}%)`;
        } else if (type === 'slide-right') {
            base.transform = isFrom ? `translateX(${p * 100}%)` : `translateX(${-(1 - p) * 100}%)`;
        } else if (type === 'zoom-transition') {
            base.opacity = isFrom ? 1 - p : p;
            base.transform = isFrom ? `scale(${1 + p * 0.25})` : `scale(${1.25 - p * 0.25})`;
        } else if (type === 'blur-transition') {
            base.opacity = isFrom ? 1 - p : p;
            base.filter = `blur(${isFrom ? p * 10 : (1 - p) * 10}px)`;
        } else if (type === 'spin-transition') {
            base.opacity = isFrom ? 1 - p : p;
            base.transform = `rotate(${isFrom ? -120 * p : 120 * (1 - p)}deg) scale(${isFrom ? 1 - p * 0.15 : 0.85 + p * 0.15})`;
        } else if (type === 'glitch-transition') {
            const jitter = Math.sin(p * 80) * (isFrom ? 6 : 4);
            base.opacity = isFrom ? 1 - p : p;
            base.transform = `translateX(${jitter}px)`;
            base.filter = `contrast(${1.2 + p}) saturate(${1.1 + p * 0.7}) hue-rotate(${isFrom ? p * 45 : (1 - p) * 45}deg)`;
        } else if (type === 'fade-transition') {
            base.opacity = isFrom ? 1 - p : p;
        } else if (type === 'swipe-transition') {
            base.opacity = isFrom ? 1 - p : p;
            base.transform = isFrom ? `translateX(${-p * 120}%)` : `translateX(${(1 - p) * 120}%)`;
        } else if (type === 'whip-pan-transition') {
            base.opacity = isFrom ? 1 - p : p;
            base.transform = isFrom
                ? `translateX(${-200 * p}%) skewX(${p * 10}deg) scale(${1 - p * 0.12})`
                : `translateX(${200 * (1 - p)}%) skewX(${-(1 - p) * 10}deg) scale(${0.88 + p * 0.12})`;
        } else if (type === 'mask-transition') {
            const clipValue = isFrom ? `inset(0 ${p * 100}% 0 0)` : `inset(0 0 0 ${(1 - p) * 100}%)`;
            base.clipPath = clipValue;
            base.opacity = isFrom ? 1 - p * 0.5 : p;
        } else if (type === 'camera-shake-transition') {
            const shake = isFrom ? Math.sin(p * 40) * 8 * p : Math.sin((1 - p) * 40) * 8 * (1 - p);
            base.opacity = isFrom ? 1 - p : p;
            base.transform = `translate(${shake}px, ${shake / 2}px) rotate(${shake * 0.12}deg)`;
            base.filter = `contrast(${1.1 + p * 0.2})`;
        } else if (type === 'match-cut-transition') {
            base.opacity = isFrom ? 1 - p * 0.9 : p * 0.9;
            base.transform = isFrom ? 'none' : 'none';
        } else if (type === 'speed-ramp-transition') {
            base.opacity = isFrom ? 1 - p : p;
            base.transform = isFrom ? `scale(${1 + p * 0.15})` : `scale(${0.85 + p * 0.15})`;
            base.filter = `blur(${p * 4}px)`;
        } else if (type === 'flash-transition') {
            base.opacity = isFrom ? 1 - p : p;
        } else if (type === 'dip-black' || type === 'dip-white') {
            base.opacity = isFrom ? (p < 0.5 ? 1 - p * 2 : 0) : (p < 0.5 ? 0 : (p - 0.5) * 2);
        }

        return base;
    };

    return (
        <div
            className="h-[100dvh] w-full flex flex-col overflow-hidden font-sans selection:bg-purple-500/30 selection:text-white text-slate-200"
            style={{
                background: 'linear-gradient(135deg, #0B1020 0%, #1a1b2e 30%, #2d3142 60%, #3f4a67 85%, #1a1b2e 100%)',
            }}
        >
            {/* Dynamic Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-purple-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-fuchsia-500/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 500px rgba(11,13,31,0.95)' }} />
            </div>

            {/* Top Header */}
            {!isCropMode && (
            <header className="h-14 flex-none border-b border-white/10 flex items-center justify-between px-4 bg-black/20 backdrop-blur-3xl z-20">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate("/quick-edit/upload")}
                        className="p-1.5 hover:bg-white/5 rounded transition-colors text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                        <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                        <button className="p-1 hover:bg-white/10 rounded transition-colors text-slate-400">
                            <Edit2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold px-2 py-1 bg-amber-400/10 rounded border border-amber-400/20">
                        <Star className="w-3 h-3" />
                        <span>+ {profile?.credits?.userCredits ?? '0.00'}</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(168, 85, 247,0.2)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGenerate}
                        className="relative h-9 px-6 rounded-lg flex items-center gap-2 transition-all overflow-hidden bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-400 text-[#0B1020] cursor-pointer"
                    >
                        <motion.div
                            animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-white/15 blur-lg"
                        />
                        <Sparkles className="w-3.5 h-3.5 relative z-10" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] relative z-10">Generate<span className="hidden sm:inline"> Quick Edit</span></span>
                    </motion.button>
                </div>
            </header>
            )}

            {/* Main Multi-Pane Studio Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative z-10">

                {/* Top Part of Workspace: Three Column Layout */}
                <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden border-b border-white/10">

                    {/* Left Column: Filmora-style panel with icon tab rail + content */}
                    {!isCropMode && (
                    <motion.aside className="w-full md:w-[420px] flex-none flex bg-[#0B1020]/40 backdrop-blur-md overflow-hidden relative border-r border-white/10 order-2 md:order-1">

                        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Content panel Ã¢â€â‚¬Ã¢â€â‚¬ */}
                        <div className="flex-1 flex flex-col min-w-0 bg-[#0b0d26]">

                                        {/* Panel header (Hidden for media to match Screenshot 1) */}
                                        {leftTab !== 'media' && (
                                            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06] shrink-0">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">
                                                    {leftTab === 'titles'      && 'Titles & Text'}
                                                    {leftTab === 'captions'    && 'Captions'}
                                                    {leftTab === 'transitions' && 'Transitions'}
                                                    {leftTab === 'effects'     && 'Visual Effects'}
                                                    {leftTab === 'filters'     && 'Color Filters'}
                                                    {leftTab === 'tools'       && 'Toolbox'}
                                                </span>
                                                {leftTab === 'transitions' && activePreviewId && (
                                                    <span className="text-[8px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded px-1.5 py-0.5 truncate max-w-[120px]">
                                                        {clipTransitions[activePreviewId] || 'none'}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Ã¢â€â‚¬Ã¢â€â‚¬ TITLES panel Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                        {(leftTab === 'titles' || leftTab === 'captions') && (
                                            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                                                <div className="p-3 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                                                    <ToolInspector
                                                        velocitySpeed={velocitySpeed} setVelocitySpeed={setVelocitySpeed}
                                                        motionBlurAmount={motionBlurAmount} setMotionBlurAmount={setMotionBlurAmount}
                                                        shakeStrength={shakeStrength} setShakeStrength={setShakeStrength}
                                                        flashIntensity={flashIntensity} setFlashIntensity={setFlashIntensity}
                                                        rgbSplitAmount={rgbSplitAmount} setRgbSplitAmount={setRgbSplitAmount}
                                                        smoothZoomAmount={smoothZoomAmount} setSmoothZoomAmount={setSmoothZoomAmount}
                                                        filmGrainOpacity={filmGrainOpacity} setFilmGrainOpacity={setFilmGrainOpacity}
                                                        overlayTextStylePreset={overlayTextStylePreset} setOverlayTextStylePreset={setOverlayTextStylePreset}
                                                        getOverlayTextEffectForPreset={getOverlayTextEffectForPreset}
                                                        activeTool={activeTool || (leftTab === 'captions' ? 'captions' : 'text-tool')} setActiveTool={setActiveTool}
                                                        selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter}
                                                        selectedEffect={selectedEffect} setSelectedEffect={setSelectedEffect}
                                                        blurAmount={blurAmount} setBlurAmount={setBlurAmount}
                                                        brightness={brightness} setBrightness={setBrightness}
                                                        contrast={contrast} setContrast={setContrast}
                                                        saturation={saturation} setSaturation={setSaturation}
                                                        slowMotionSpeed={slowMotionSpeed} setSlowMotionSpeed={setSlowMotionSpeed}
                                                        glitchIntensity={glitchIntensity} setGlitchIntensity={setGlitchIntensity}
                                                        animatedText={animatedText} setAnimatedText={setAnimatedText}
                                                        overlayText={overlayText} setOverlayText={setOverlayText}
                                                        overlayOpacity={overlayOpacity} setOverlayOpacity={setOverlayOpacity}
                                                        overlayStrokeEnabled={overlayStrokeEnabled} setOverlayStrokeEnabled={setOverlayStrokeEnabled}
                                                        overlayStrokeColor={overlayStrokeColor} setOverlayStrokeColor={setOverlayStrokeColor}
                                                        overlayStrokeOpacity={overlayStrokeOpacity} setOverlayStrokeOpacity={setOverlayStrokeOpacity}
                                                        overlayShadowEnabled={overlayShadowEnabled} setOverlayShadowEnabled={setOverlayShadowEnabled}
                                                        overlayShadowColor={overlayShadowColor} setOverlayShadowColor={setOverlayShadowColor}
                                                        overlayShadowOpacity={overlayShadowOpacity} setOverlayShadowOpacity={setOverlayShadowOpacity}
                                                        overlayShadowBlur={overlayShadowBlur} setOverlayShadowBlur={setOverlayShadowBlur}
                                                        overlayBgRadius={overlayBgRadius} setOverlayBgRadius={setOverlayBgRadius}
                                                        overlayBgPaddingX={overlayBgPaddingX} setOverlayBgPaddingX={setOverlayBgPaddingX}
                                                        overlayBgPaddingY={overlayBgPaddingY} setOverlayBgPaddingY={setOverlayBgPaddingY}
                                                        overlayBgOffsetX={overlayBgOffsetX} setOverlayBgOffsetX={setOverlayBgOffsetX}
                                                        overlayBgOffsetY={overlayBgOffsetY} setOverlayBgOffsetY={setOverlayBgOffsetY}
                                                        overlayTextStyleBold={overlayTextStyleBold} setOverlayTextStyleBold={setOverlayTextStyleBold}
                                                        overlayTextStyleItalic={overlayTextStyleItalic} setOverlayTextStyleItalic={setOverlayTextStyleItalic}
                                                        overlayTextStyleUnderline={overlayTextStyleUnderline} setOverlayTextStyleUnderline={setOverlayTextStyleUnderline}
                                                        overlayAlignment={overlayAlignment} setOverlayAlignment={setOverlayAlignment}
                                                        overlayListStyle={overlayListStyle} setOverlayListStyle={setOverlayListStyle}
                                                        overlayCase={overlayCase} setOverlayCase={setOverlayCase}
                                                        overlayAnchor={overlayAnchor} setOverlayAnchor={setOverlayAnchor}
                                                        overlayTextBoxSetting={overlayTextBoxSetting} setOverlayTextBoxSetting={setOverlayTextBoxSetting}
                                                        overlayLetterSpacing={overlayLetterSpacing} setOverlayLetterSpacing={setOverlayLetterSpacing}
                                                        overlayLineSpacing={overlayLineSpacing} setOverlayLineSpacing={setOverlayLineSpacing}
                                                        overlayAnimationIn={overlayAnimationIn} setOverlayAnimationIn={setOverlayAnimationIn}
                                                        overlayAnimationOut={overlayAnimationOut} setOverlayAnimationOut={setOverlayAnimationOut}
                                                        overlayAnimationLoop={overlayAnimationLoop} setOverlayAnimationLoop={setOverlayAnimationLoop}
                                                        overlayFontId={overlayFontId} setOverlayFontId={setOverlayFontId}
                                                        overlayFontSize={overlayFontSize} setOverlayFontSize={setOverlayFontSize}
                                                        overlayColor={overlayColor} setOverlayColor={setOverlayColor}
                                                        overlayPosX={overlayPosX} setOverlayPosX={setOverlayPosX}
                                                        overlayPosY={overlayPosY} setOverlayPosY={setOverlayPosY}
                                                        overlayBgEnabled={overlayBgEnabled} setOverlayBgEnabled={setOverlayBgEnabled}
                                                        overlayBgColorHex={overlayBgColorHex} setOverlayBgColorHex={setOverlayBgColorHex}
                                                        isTextPlacementMode={isTextPlacementMode} setIsTextPlacementMode={setIsTextPlacementMode}
                                                        clipTransitions={clipTransitions} applyTransitionForActiveClip={applyTransitionForActiveClip}
                                                        speedValue={speedValue} setSpeedValue={setSpeedValue}
                                                        activePreviewId={activePreviewId} activePreviewItem={activePreviewItem}
                                                        getTrimRangeForItem={getTrimRangeForItem}
                                                        clipTrimRanges={clipTrimRanges} setClipTrimRanges={setClipTrimRanges}
                                                        rotationDegrees={rotationDegrees} setRotationDegrees={setRotationDegrees}
                                                        volumeLevel={volumeLevel} setVolumeLevel={setVolumeLevel}
                                                        isMuted={isMuted} setIsMuted={setIsMuted}
                                                        isDenoiseEnabled={isDenoiseEnabled} setIsDenoiseEnabled={setIsDenoiseEnabled}
                                                        onApplyToAllVolume={handleApplyToAllVolume}
                                                        cropWidthPct={cropWidthPct} setCropWidthPct={setCropWidthPct}
                                                        cropHeightPct={cropHeightPct} setCropHeightPct={setCropHeightPct}
                                                        cropCenterX={cropCenterX} setCropCenterX={setCropCenterX}
                                                        cropCenterY={cropCenterY} setCropCenterY={setCropCenterY}
                                                        zoomToolAmount={zoomToolAmount} setZoomToolAmount={setZoomToolAmount}
                                                        keyframeMode={keyframeMode} setKeyframeMode={setKeyframeMode}
                                                        keyframeAmount={keyframeAmount} setKeyframeAmount={setKeyframeAmount}
                                                        videoRef={videoRef}
                                                        captions={captions} setCaptions={setCaptions}
                                                        currentCaption={currentCaption} setCurrentCaption={setCurrentCaption}
                                                        captionLanguage={captionLanguage} setCaptionLanguage={setCaptionLanguage}
                                                        captionStyle={captionStyle} setCaptionStyle={setCaptionStyle}
                                                        captionStylePreset={captionStylePreset} setCaptionStylePreset={setCaptionStylePreset}
                                                        isCaptionPlacementMode={isCaptionPlacementMode} setIsCaptionPlacementMode={setIsCaptionPlacementMode}
                                                        detectSpeakers={detectSpeakers} setDetectSpeakers={setDetectSpeakers}
                                                        handleAutoCaption={handleAutoCaption}
                                                        isAutoCapturing={isAutoCapturing} autoCaptionStatus={autoCaptionStatus}
                                                        proParams={proParams} setProParams={setProParams}
                                                        saveToUndo={saveToUndo} mediaItems={mediaItems}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Ã¢â€â‚¬Ã¢â€â‚¬ TRANSITIONS panel Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                        {leftTab === 'transitions' && (
                                            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar flex flex-col min-h-0">
                                                {/* Active clip indicator */}
                                                <div className={`mb-3 px-2.5 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wider text-center border shrink-0 ${
                                                    activePreviewId
                                                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                                                        : 'bg-white/[0.03] border-white/5 text-slate-500'
                                                }`}>
                                                    {activePreviewId ? `Clip selected Ã‚Â· drag to apply` : 'Select a clip from the timeline first'}
                                                </div>

                                                {/* Category Selector Chips */}
                                                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 shrink-0 scrollbar-none">
                                                    {['all', 'dissolve', 'slide', 'wipe', 'zoom', 'blur', 'glitch', 'shape', 'creative'].map((cat) => (
                                                        <button
                                                            key={cat}
                                                            onClick={() => setTransitionsCategory(cat)}
                                                            type="button"
                                                            className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                                                                transitionsCategory === cat
                                                                    ? 'bg-teal-500/20 border-teal-500/60 text-teal-200'
                                                                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                                            }`}
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Transition grid */}
                                                <div className="grid grid-cols-3 gap-2 pb-4">
                                                    {/* None option */}
                                                    {transitionsCategory === 'all' && (
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); applyTransitionForActiveClip('none'); }}
                                                            type="button"
                                                            className={`relative flex flex-col items-center justify-center gap-2 h-[80px] rounded-xl border transition-all duration-200 group overflow-hidden ${
                                                                activePreviewId && clipTransitions[activePreviewId] === 'none'
                                                                    ? 'bg-teal-500/15 border-teal-400/60 shadow-[0_0_16px_rgba(45,212,191,0.25)] scale-[1.02]'
                                                                    : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-0.5'
                                                            }`}
                                                        >
                                                            <LucideIcons.CircleOff size={20} className="text-slate-400" />
                                                            <span className="text-[8px] font-bold uppercase tracking-wider text-center text-slate-300">None</span>
                                                            {activePreviewId && clipTransitions[activePreviewId] === 'none' && (
                                                                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-teal-400" />
                                                            )}
                                                        </button>
                                                    )}

                                                    {/* Loaded 50 transitions */}
                                                    {getAllTransitions()
                                                        .filter(tr => transitionsCategory === 'all' || tr.category === transitionsCategory)
                                                        .map((tr) => {
                                                            const isActive = activePreviewId && clipTransitions[activePreviewId] === tr.id;
                                                            const Icon = (LucideIcons as any)[tr.iconName] || LucideIcons.Droplets;
                                                            const trColor = tr.category === 'dissolve' ? '#38bdf8'
                                                                          : tr.category === 'slide' ? '#a78bfa'
                                                                          : tr.category === 'wipe' ? '#34d399'
                                                                          : tr.category === 'zoom' ? '#fb923c'
                                                                          : tr.category === 'blur' ? '#f472b6'
                                                                          : tr.category === 'glitch' ? '#f87171'
                                                                          : tr.category === 'shape' ? '#facc15'
                                                                          : '#60a5fa'; // default
                                                            return (
                                                                <button
                                                                    key={tr.id}
                                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); applyTransitionForActiveClip(tr.id); }}
                                                                    type="button"
                                                                    title={tr.description}
                                                                    className={`relative flex flex-col items-center justify-center gap-2 h-[80px] rounded-xl border transition-all duration-200 group overflow-hidden ${
                                                                        isActive
                                                                            ? 'bg-teal-500/15 border-teal-400/60 shadow-[0_0_16px_rgba(45,212,191,0.25)] scale-[1.02]'
                                                                            : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-0.5'
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                                                        style={{ background: `radial-gradient(circle at 50% 40%, ${trColor}18 0%, transparent 70%)` }}
                                                                    />
                                                                    <Icon
                                                                        size={20}
                                                                        className="relative z-10 transition-transform duration-200 group-hover:scale-110"
                                                                        style={{ color: isActive ? '#5eead4' : trColor }}
                                                                    />
                                                                    <span className={`relative z-10 text-[8px] font-bold uppercase tracking-wider text-center leading-tight px-1 line-clamp-2 ${isActive ? 'text-teal-200' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                                        {tr.name}
                                                                    </span>
                                                                    {isActive && (
                                                                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-teal-400" />
                                                                    )}
                                                                </button>
                                                            );
                                                        })}

                                                </div>
                                            </div>
                                        )}

                                        {/* Ã¢â€â‚¬Ã¢â€â‚¬ EFFECTS panel Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                        {leftTab === 'effects' && (
                                            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar flex flex-col min-h-0">
                                                {/* Category Selector Chips */}
                                                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 shrink-0 scrollbar-none">
                                                    {['all', 'camera', 'blur', 'glitch', 'cinematic', 'distortion', 'motion', 'light', 'retro'].map((cat) => (
                                                        <button
                                                            key={cat}
                                                            onClick={() => setEffectsCategory(cat)}
                                                            type="button"
                                                            className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                                                                effectsCategory === cat
                                                                    ? 'bg-purple-500/20 border-purple-500/60 text-purple-200'
                                                                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                                            }`}
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 pb-4">
                                                    {effectsCategory === 'all' && (
                                                        <button
                                                            onClick={() => setSelectedEffect('none')}
                                                            type="button"
                                                            className={`relative flex flex-col items-center justify-center gap-2 h-[80px] rounded-xl border transition-all duration-200 group overflow-hidden ${
                                                                selectedEffect === 'none'
                                                                    ? 'bg-purple-500/15 border-purple-400/60 shadow-[0_0_16px_rgba(168,85,247,0.25)] scale-[1.02]'
                                                                    : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-0.5'
                                                            }`}
                                                        >
                                                            <Ban size={20} className="text-slate-400" />
                                                            <span className="text-[8px] font-bold uppercase tracking-wider text-center text-slate-300">No Effect</span>
                                                            {selectedEffect === 'none' && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-400" />}
                                                        </button>
                                                    )}

                                                    {(() => {
                                                        const proEffects = getAllProEffects();
                                                        const filteredProEffects = effectsCategory === 'all'
                                                            ? proEffects
                                                            : proEffects.filter(eff => eff.category === effectsCategory);
                                                        return filteredProEffects.map((eff) => {
                                                            const isActive = selectedEffect === eff.id;
                                                            const Icon = eff.icon || Sparkles;
                                                            return (
                                                                <button
                                                                    key={eff.id}
                                                                    onClick={() => {
                                                                        setSelectedEffect(eff.id);
                                                                        setProParams(eff.defaultParameters || {});
                                                                    }}
                                                                    type="button"
                                                                    className={`relative flex flex-col items-center justify-center gap-2 h-[80px] rounded-xl border transition-all duration-200 group overflow-hidden ${
                                                                        isActive
                                                                            ? 'bg-purple-500/15 border-purple-400/60 shadow-[0_0_16px_rgba(168,85,247,0.25)] scale-[1.02]'
                                                                            : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-0.5'
                                                                    }`}
                                                                >
                                                                    {eff.thumbnail ? (
                                                                        <div className="absolute inset-0 w-full h-full pointer-events-none">
                                                                            <img src={eff.thumbnail} className="w-full h-full object-cover opacity-25 group-hover:opacity-40 transition-opacity duration-300" alt="" />
                                                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0b0d26]/90" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 40%, #c084fc18 0%, transparent 70%)` }} />
                                                                    )}
                                                                    <Icon size={18} className="relative z-10 transition-transform duration-200 group-hover:scale-110 text-purple-300" />
                                                                    <span className="relative z-10 text-[8px] font-bold uppercase tracking-wider text-center leading-tight px-1 line-clamp-2 text-white/95">{eff.name}</span>
                                                                    {isActive && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-400" />}
                                                                </button>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        {/* Ã¢â€â‚¬Ã¢â€â‚¬ FILTERS panel Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                        {leftTab === 'filters' && (() => {
                                             const proEffects = getAllProEffects();
                                             const proFilters = proEffects.filter(eff => eff.id.startsWith('pro-filter-'));
                                             const filteredFilters = localFilterCategory === 'all'
                                                 ? proFilters
                                                 : proFilters.filter(eff => eff.name.startsWith(localFilterCategory + ' v'));
                                             return (
                                                 <div className="flex-1 flex flex-col min-h-0 bg-[#07080f] p-3">
                                                     {/* Filter Category Selector Chips */}
                                                     <div className="flex gap-1.5 overflow-x-auto pb-2 shrink-0 scrollbar-none mb-2">
                                                         {['all', 'Basic', 'Cinematic', 'Vintage', 'Retro', 'Film', 'HDR', 'LUT', 'Black & White', 'Sepia', 'Neon', 'Cyberpunk', 'Dream', 'Glow', 'Matte', 'Moody', 'Warm', 'Cool', 'Teal & Orange', 'Golden Hour', 'Sunset', 'Night', 'RGB', 'VHS', 'CRT', 'Glitch', 'Grain', 'Blur', 'Sharpen', 'Portrait', 'Beauty', 'Landscape', 'Nature', 'Food', 'Travel', 'Wedding', 'Fashion', 'Sports', 'Gaming', 'Social', 'Artistic', '3D', 'Hollywood', 'IMAX', 'Netflix', 'Kodak', 'Fujifilm', 'ARRI', 'RED', 'Sony Cinema', 'Blackmagic', 'Seasons', 'Ocean', 'Forest', 'Desert', 'Aurora', 'Galaxy', 'Space', 'Synthwave', 'Vaporwave', 'Luxury', 'Diamond', 'Gold', 'Crystal', 'Anime', 'Comic', 'Oil Painting', 'Watercolor', 'Sketch', 'Documentary', 'Analog', 'Sci-Fi'].map((cat) => (
                                                             <button
                                                                 key={cat}
                                                                 onClick={() => setLocalFilterCategory(cat)}
                                                                 type="button"
                                                                 className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                                                                     localFilterCategory === cat
                                                                         ? 'bg-pink-500/20 border-pink-500/60 text-pink-200'
                                                                         : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                                                 }`}
                                                             >
                                                                 {cat}
                                                             </button>
                                                         ))}
                                                     </div>

                                                     <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                         <div className="grid grid-cols-3 gap-2 pb-4">
                                                             {localFilterCategory === 'all' && (
                                                                 <button
                                                                     onClick={() => {
                                                                         setSelectedFilter('none');
                                                                         setSelectedEffect('none');
                                                                         if (activePreviewId) {
                                                                             setClipSettings(prev => ({ ...prev, [activePreviewId]: { ...(prev[activePreviewId] || {}), selectedFilter: 'none' } }));
                                                                         }
                                                                     }}
                                                                     type="button"
                                                                     className={`relative flex flex-col items-center justify-center gap-2 h-[80px] rounded-xl border transition-all duration-200 group overflow-hidden ${
                                                                         selectedFilter === 'none' && selectedEffect === 'none'
                                                                             ? 'bg-pink-500/15 border-pink-400/60 shadow-[0_0_16px_rgba(236,72,153,0.25)] scale-[1.02]'
                                                                             : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-0.5'
                                                                     }`}
                                                                 >
                                                                     <CircleOff size={20} className="text-[#94a3b8]" />
                                                                     <span className="text-[8px] font-bold uppercase tracking-wider text-center text-slate-400">No Filter</span>
                                                                 </button>
                                                             )}
                                                             {filteredFilters.map((eff) => {
                                                                 const isActive = selectedFilter === eff.id || selectedEffect === eff.id;
                                                                 const Icon = eff.icon || Sparkles;
                                                                 return (
                                                                     <button
                                                                         key={eff.id}
                                                                         onClick={() => {
                                                                             setSelectedFilter(eff.id as any);
                                                                             setSelectedEffect(eff.id);
                                                                             setProParams(eff.defaultParameters || {});
                                                                             if (activePreviewId) {
                                                                                 setClipSettings(prev => ({ ...prev, [activePreviewId]: { ...(prev[activePreviewId] || {}), selectedFilter: eff.id as any } }));
                                                                             }
                                                                         }}
                                                                         type="button"
                                                                         className={`relative flex flex-col items-center justify-center gap-2 h-[80px] rounded-xl border transition-all duration-200 group overflow-hidden ${
                                                                             isActive
                                                                                 ? 'bg-pink-500/15 border-pink-400/60 shadow-[0_0_16px_rgba(236,72,153,0.25)] scale-[1.02]'
                                                                                 : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-0.5'
                                                                         }`}
                                                                     >
                                                                         {eff.thumbnail && (
                                                                             <div className="absolute inset-0 w-full h-full pointer-events-none">
                                                                                 <img src={eff.thumbnail} className="w-full h-full object-cover opacity-20 group-hover:opacity-35 transition-opacity duration-300" alt="" />
                                                                                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/85" />
                                                                             </div>
                                                                         )}
                                                                         <Icon size={20} className="relative z-10 transition-transform duration-200 group-hover:scale-110 text-purple-300" />
                                                                         <span className="relative z-10 text-[8px] font-bold uppercase tracking-wider text-center leading-tight px-1 line-clamp-2 text-slate-400 group-hover:text-slate-200">{eff.name}</span>
                                                                         {isActive && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-pink-400" />}
                                                                     </button>
                                                                 );
                                                             })}
                                                         </div>
                                                     </div>
                                                 </div>
                                             );
                                         })()}

                                        {/* Ã¢â€â‚¬Ã¢â€â‚¬ MEDIA & AUDIO panels Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                        {(leftTab === 'media' || leftTab === 'audio') && (
                                            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#12131b]">
                                                {/* Top Header Tabs: Media | Audio */}
                                                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 bg-[#0e0f18]">
                                                    <button
                                                        type="button"
                                                        onClick={() => setLeftTab('media')}
                                                        className={`flex flex-col items-center justify-center w-[54px] h-[48px] rounded-lg transition-all ${leftTab === 'media' ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
                                                    >
                                                        <MonitorPlay strokeWidth={1.5} className="w-[18px] h-[18px] mb-1.5" />
                                                        <span className="text-[9.5px] font-medium leading-none">Media</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setLeftTab('audio')}
                                                        className={`flex flex-col items-center justify-center w-[54px] h-[48px] rounded-lg transition-all ${leftTab === 'audio' ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
                                                    >
                                                        <Music strokeWidth={1.5} className="w-[18px] h-[18px] mb-1.5" />
                                                        <span className="text-[9.5px] font-medium leading-none">Audio</span>
                                                    </button>
                                                </div>

                                                <div className="flex-1 flex min-h-0 overflow-hidden">
                                                    {leftTab === 'media' ? (
                                                        <>
                                                            {/* Category sub-sidebar */}
                                                            <div className="w-[100px] flex-none flex flex-col border-r border-white/5 bg-[#12131b] py-2 px-1 space-y-1">
                                                        <button className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-white bg-white/5 cursor-pointer">
                                                            <Star className="w-3.5 h-3.5 text-[#EAB308] fill-[#EAB308]" />
                                                            <span>Favorite</span>
                                                        </button>
                                                        <button className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-slate-400 hover:text-white cursor-pointer">
                                                            <span className="text-slate-500">Ã°Å¸â€œÂ</span>
                                                            <span>Default</span>
                                                        </button>
                                                        <button className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-slate-400 hover:text-white cursor-pointer">
                                                            <span className="text-slate-500">Ã°Å¸â€œÂ</span>
                                                            <span className="truncate">New Library</span>
                                                        </button>
                                                    </div>

                                                    {/* Main media area */}
                                                    <div className="flex-1 min-w-0 flex flex-col bg-[#12131b] p-3">
                                                        {/* Action Bar */}
                                                        <div className="flex items-center justify-between mb-3">
                                                            <button
                                                                onClick={() => mediaInputRef.current?.click()}
                                                                className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#23242e] text-white border border-white/10 text-xs font-medium hover:bg-[#2c2d3a] transition-colors cursor-pointer"
                                                            >
                                                                <span className="text-sm font-bold">+</span>
                                                                <span>Import</span>
                                                            </button>
                                                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                                <Search className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
                                                                <span className="cursor-pointer hover:text-white font-mono">Ã¢â€¡â€¦</span>
                                                                <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
                                                            </div>
                                                        </div>

                                                        {/* Media Cards Grid */}
                                                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                            {libraryAssets.length === 0 ? (
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {/* Default Fish / Animal placeholder like Image 1 */}
                                                                    <div
                                                                        onClick={() => mediaInputRef.current?.click()}
                                                                        className="group relative aspect-square rounded-lg border border-white/10 overflow-hidden cursor-pointer bg-slate-900"
                                                                    >
                                                                        <img
                                                                            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=300&q=80"
                                                                            alt="Sample Media"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                        <div className="absolute top-1 left-1">
                                                                            <Star className="w-3.5 h-3.5 text-[#EAB308] fill-[#EAB308]" />
                                                                        </div>
                                                                        <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/60 text-[9px] text-white font-mono">
                                                                            0:35
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {libraryAssets.map((item) => (
                                                                        <div
                                                                            key={item?.id}
                                                                            onClick={() => selectPreviewWithTransition(item?.id)}
                                                                            draggable="true"
                                                                            onDragStart={(e: any) => { e.dataTransfer.setData('clipId', item?.id); }}
                                                                            className={`group relative aspect-square rounded-lg border transition-all cursor-pointer overflow-hidden bg-slate-900
                                                                                ${activePreviewId === item?.id ? 'border-[#EAB308] shadow-sm' : 'border-white/10 hover:border-white/20'}`}
                                                                        >
                                                                            {(item?.type || 'video') === 'video' ? (
                                                                                <video
                                                                                    ref={(el) => { thumbnailVideoRefs.current[item?.id] = el; }}
                                                                                    src={(item?.preview)}
                                                                                    className="w-full h-full object-cover"
                                                                                    muted playsInline preload="metadata"
                                                                                />
                                                                            ) : (
                                                                                <img src={(item?.preview)} alt="" className="w-full h-full object-cover" loading="lazy" />
                                                                            )}
                                                                            <div className="absolute top-1 left-1">
                                                                                <Star className="w-3.5 h-3.5 text-[#EAB308] fill-[#EAB308]" />
                                                                            </div>
                                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); removeLibraryAsset(item?.id); }}
                                                                                    className="p-1 rounded bg-rose-500/80 text-white hover:bg-rose-500 transition-colors"
                                                                                >
                                                                                    <Trash2 className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                            <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/60 text-[9px] text-white font-mono">
                                                                                {(item?.duration || 0) ? `${Math.floor((item?.duration || 0) / 60)}:${Math.floor((item?.duration || 0) % 60).toString().padStart(2, '0')}` : '0:35'}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Audio sidebar */}
                                                            <div className="w-[130px] flex-none flex flex-col border-r border-white/5 bg-[#12131b] py-2 px-1 space-y-1 overflow-y-auto custom-scrollbar pb-10">
                                                                <button 
                                                                    onClick={() => setAudioCategory('favorites')}
                                                                    className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer ${audioCategory === 'favorites' ? 'bg-white/10 text-white font-medium rounded-md mx-1 my-1' : 'text-slate-300 hover:text-white hover:bg-white/5 mx-1 my-1 rounded-md'}`}
                                                                >
                                                                    <Star className="w-3.5 h-3.5 fill-current text-white" />
                                                                    Favorites
                                                                </button>

                                                                {/* Music Section */}
                                                                <div className="mt-1">
                                                                    <button 
                                                                        onClick={() => setAudioMusicExpanded(!audioMusicExpanded)}
                                                                        className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <Music className="w-3.5 h-3.5" />
                                                                            Music
                                                                        </div>
                                                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${audioMusicExpanded ? '' : '-rotate-90'}`} />
                                                                    </button>
                                                                    {audioMusicExpanded && (
                                                                        <div className="flex flex-col gap-0.5 mt-0.5 mb-2">
                                                                            {['Vlog', 'Pop', 'Dynamic', 'Fresh', 'Acoustic', 'Electronic', 'Hip-Hop'].map(cat => (
                                                                                <button
                                                                                    key={cat}
                                                                                    onClick={() => setAudioCategory(cat.toLowerCase())}
                                                                                    className={`text-left pl-8 pr-3 py-1.5 text-xs transition-colors cursor-pointer ${audioCategory === cat.toLowerCase() ? 'text-blue-400 font-medium bg-white/5 mx-1 rounded-md' : 'text-slate-400 hover:text-slate-200'}`}
                                                                                >
                                                                                    {cat}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Sound FX Section */}
                                                                <div>
                                                                    <button 
                                                                        onClick={() => setAudioSfxExpanded(!audioSfxExpanded)}
                                                                        className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <Activity className="w-3.5 h-3.5" />
                                                                            Sound FX
                                                                        </div>
                                                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${audioSfxExpanded ? '' : '-rotate-90'}`} />
                                                                    </button>
                                                                    {audioSfxExpanded && (
                                                                        <div className="flex flex-col gap-0.5 mt-0.5 mb-2">
                                                                            {['Cartoon', 'Fast Swish', 'Funny', 'Machine', 'Ringing', 'Vehicles', 'Weather', 'Variety Sound', 'Vlog', 'Physical', 'Transition', 'Cues', 'Game', 'Emotion'].map(cat => (
                                                                                <button
                                                                                    key={cat}
                                                                                    onClick={() => setAudioCategory(cat.toLowerCase())}
                                                                                    className={`text-left pl-8 pr-3 py-1.5 text-xs transition-colors cursor-pointer ${audioCategory === cat.toLowerCase() ? 'text-blue-400 font-medium bg-white/5 mx-1 rounded-md' : 'text-slate-400 hover:text-slate-200'}`}
                                                                                >
                                                                                    <span className="truncate block">{cat}</span>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Your Music Section */}
                                                                <div>
                                                                    <button 
                                                                        onClick={() => setAudioCategory('your-music')}
                                                                        className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <Folder className="w-3.5 h-3.5 fill-current" />
                                                                            Your Music
                                                                        </div>
                                                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${audioCategory === 'your-music' ? '' : '-rotate-90'}`} />
                                                                    </button>
                                                                    {audioCategory === 'your-music' && (
                                                                        <div className="flex flex-col gap-0.5 mt-0.5 mb-2">
                                                                            <button className="text-left pl-8 pr-3 py-1.5 text-xs transition-colors text-slate-400 hover:text-slate-200 truncate cursor-pointer">Extracted Audio</button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Your Sound Effect Section */}
                                                                <div>
                                                                    <button 
                                                                        onClick={() => setAudioCategory('your-sound-effect')}
                                                                        className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <Folder className="w-3.5 h-3.5 fill-current" />
                                                                            <span className="truncate">Your Sound...</span>
                                                                        </div>
                                                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${audioCategory === 'your-sound-effect' ? '' : '-rotate-90'}`} />
                                                                    </button>
                                                                    {audioCategory === 'your-sound-effect' && (
                                                                        <div className="flex flex-col gap-0.5 mt-0.5 mb-2">
                                                                            <button className="text-left pl-8 pr-3 py-1.5 text-xs transition-colors text-slate-400 hover:text-slate-200 truncate cursor-pointer">Extracted Audio</button>
                                                                            <button className="text-left pl-8 pr-3 py-1.5 text-xs transition-colors text-slate-400 hover:text-slate-200 truncate cursor-pointer">My Effect</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Content Area */}
                                                            <div className="flex-1 flex flex-col bg-[#12131b]">
                                                                <div className="flex items-center justify-end gap-3 p-3">
                                                                    <button className="text-slate-400 hover:text-white transition-colors cursor-pointer"><Search className="w-4 h-4" /></button>
                                                                    <button className="text-slate-400 hover:text-white transition-colors cursor-pointer"><ArrowDownUp className="w-4 h-4" /></button>
                                                                    <button className="text-slate-400 hover:text-white transition-colors cursor-pointer"><Filter className="w-4 h-4" /></button>
                                                                </div>
                                                                <div className="flex-1 p-4">
                                                                    {/* Track list would go here */}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}





                                        {/* Ã¢â€â‚¬Ã¢â€â‚¬ FRAMES panel Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                        {leftTab === 'frames' && (
                                            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar flex flex-col gap-3 bg-[#0b0d26]">
                                                <div className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">Select a Video Frame Overlay</div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { id: 'none', label: 'No Frame', desc: 'Original Clean look' },
                                                        { id: 'neon', label: 'Neon Glow', desc: 'Vibrant neon borders' },
                                                        { id: 'polaroid', label: 'Retro Polaroid', desc: 'Classic white polaroid border' },
                                                        { id: 'vignette', label: 'Vignette', desc: 'Soft shadow edges' },
                                                        { id: 'cinematic', label: 'Cinematic Bars', desc: 'Wide cinema crop' },
                                                        { id: 'vhs', label: 'VHS Record', desc: 'Vintage recording HUD' },
                                                        { id: 'hud', label: 'Future Tech', desc: 'Sci-fi holographic HUD' },
                                                    ].map((frame) => {
                                                        const isSelected = selectedFrameId === frame.id || (frame.id === 'none' && !selectedFrameId);
                                                        return (
                                                            <button
                                                                key={frame.id}
                                                                onClick={() => {
                                                                    setSelectedFrameId(frame.id === 'none' ? null : frame.id);
                                                                }}
                                                                className={`relative flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-200 group overflow-hidden ${
                                                                    isSelected
                                                                        ? 'bg-purple-500/10 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                                                                        : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07] hover:border-white/20'
                                                                }`}
                                                            >
                                                                <span className="text-[9px] font-bold text-slate-200 uppercase tracking-wider">{frame.label}</span>
                                                                <span className="text-[7px] text-slate-500 leading-tight mt-0.5">{frame.desc}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}


                                        {/* Ã¢â€â‚¬Ã¢â€â‚¬ TOOLS panel Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                        {leftTab === 'tools' && (
                                            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                                                {activeTool ? (
                                                    <div className="space-y-3">
                                                        <button
                                                            onClick={() => setActiveTool(null)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-black uppercase tracking-wider text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
                                                        >
                                                            Ã¢â€ Â Back to Tools
                                                        </button>
                                                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                                                            <ToolInspector
                                                                velocitySpeed={velocitySpeed} setVelocitySpeed={setVelocitySpeed}
                                                                motionBlurAmount={motionBlurAmount} setMotionBlurAmount={setMotionBlurAmount}
                                                                shakeStrength={shakeStrength} setShakeStrength={setShakeStrength}
                                                                flashIntensity={flashIntensity} setFlashIntensity={setFlashIntensity}
                                                                rgbSplitAmount={rgbSplitAmount} setRgbSplitAmount={setRgbSplitAmount}
                                                                smoothZoomAmount={smoothZoomAmount} setSmoothZoomAmount={setSmoothZoomAmount}
                                                                filmGrainOpacity={filmGrainOpacity} setFilmGrainOpacity={setFilmGrainOpacity}
                                                                overlayTextStylePreset={overlayTextStylePreset} setOverlayTextStylePreset={setOverlayTextStylePreset}
                                                                getOverlayTextEffectForPreset={getOverlayTextEffectForPreset}
                                                                activeTool={activeTool} setActiveTool={setActiveTool}
                                                                selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter}
                                                                selectedEffect={selectedEffect} setSelectedEffect={setSelectedEffect}
                                                                blurAmount={blurAmount} setBlurAmount={setBlurAmount}
                                                                brightness={brightness} setBrightness={setBrightness}
                                                                contrast={contrast} setContrast={setContrast}
                                                                saturation={saturation} setSaturation={setSaturation}
                                                                slowMotionSpeed={slowMotionSpeed} setSlowMotionSpeed={setSlowMotionSpeed}
                                                                glitchIntensity={glitchIntensity} setGlitchIntensity={setGlitchIntensity}
                                                                animatedText={animatedText} setAnimatedText={setAnimatedText}
                                                                overlayText={overlayText} setOverlayText={setOverlayText}
                                                                overlayOpacity={overlayOpacity} setOverlayOpacity={setOverlayOpacity}
                                                                overlayStrokeEnabled={overlayStrokeEnabled} setOverlayStrokeEnabled={setOverlayStrokeEnabled}
                                                                overlayStrokeColor={overlayStrokeColor} setOverlayStrokeColor={setOverlayStrokeColor}
                                                                overlayStrokeOpacity={overlayStrokeOpacity} setOverlayStrokeOpacity={setOverlayStrokeOpacity}
                                                                overlayShadowEnabled={overlayShadowEnabled} setOverlayShadowEnabled={setOverlayShadowEnabled}
                                                                overlayShadowColor={overlayShadowColor} setOverlayShadowColor={setOverlayShadowColor}
                                                                overlayShadowOpacity={overlayShadowOpacity} setOverlayShadowOpacity={setOverlayShadowOpacity}
                                                                overlayShadowBlur={overlayShadowBlur} setOverlayShadowBlur={setOverlayShadowBlur}
                                                                overlayBgRadius={overlayBgRadius} setOverlayBgRadius={setOverlayBgRadius}
                                                                overlayBgPaddingX={overlayBgPaddingX} setOverlayBgPaddingX={setOverlayBgPaddingX}
                                                                overlayBgPaddingY={overlayBgPaddingY} setOverlayBgPaddingY={setOverlayBgPaddingY}
                                                                overlayBgOffsetX={overlayBgOffsetX} setOverlayBgOffsetX={setOverlayBgOffsetX}
                                                                overlayBgOffsetY={overlayBgOffsetY} setOverlayBgOffsetY={setOverlayBgOffsetY}
                                                                overlayTextStyleBold={overlayTextStyleBold} setOverlayTextStyleBold={setOverlayTextStyleBold}
                                                                overlayTextStyleItalic={overlayTextStyleItalic} setOverlayTextStyleItalic={setOverlayTextStyleItalic}
                                                        overlayTextStyleUnderline={overlayTextStyleUnderline} setOverlayTextStyleUnderline={setOverlayTextStyleUnderline}
                                                                overlayAlignment={overlayAlignment} setOverlayAlignment={setOverlayAlignment}
                                                                overlayListStyle={overlayListStyle} setOverlayListStyle={setOverlayListStyle}
                                                                overlayCase={overlayCase} setOverlayCase={setOverlayCase}
                                                                overlayAnchor={overlayAnchor} setOverlayAnchor={setOverlayAnchor}
                                                                overlayTextBoxSetting={overlayTextBoxSetting} setOverlayTextBoxSetting={setOverlayTextBoxSetting}
                                                                overlayLetterSpacing={overlayLetterSpacing} setOverlayLetterSpacing={setOverlayLetterSpacing}
                                                                overlayLineSpacing={overlayLineSpacing} setOverlayLineSpacing={setOverlayLineSpacing}
                                                        overlayAnimationIn={overlayAnimationIn} setOverlayAnimationIn={setOverlayAnimationIn}
                                                        overlayAnimationOut={overlayAnimationOut} setOverlayAnimationOut={setOverlayAnimationOut}
                                                        overlayAnimationLoop={overlayAnimationLoop} setOverlayAnimationLoop={setOverlayAnimationLoop}
                                                        overlayFontId={overlayFontId} setOverlayFontId={setOverlayFontId}
                                                                overlayFontSize={overlayFontSize} setOverlayFontSize={setOverlayFontSize}
                                                                overlayColor={overlayColor} setOverlayColor={setOverlayColor}
                                                                overlayPosX={overlayPosX} setOverlayPosX={setOverlayPosX}
                                                                overlayPosY={overlayPosY} setOverlayPosY={setOverlayPosY}
                                                                overlayBgEnabled={overlayBgEnabled} setOverlayBgEnabled={setOverlayBgEnabled}
                                                                overlayBgColorHex={overlayBgColorHex} setOverlayBgColorHex={setOverlayBgColorHex}
                                                                isTextPlacementMode={isTextPlacementMode} setIsTextPlacementMode={setIsTextPlacementMode}
                                                                clipTransitions={clipTransitions} applyTransitionForActiveClip={applyTransitionForActiveClip}
                                                                speedValue={speedValue} setSpeedValue={setSpeedValue}
                                                                activePreviewId={activePreviewId} activePreviewItem={activePreviewItem}
                                                                getTrimRangeForItem={getTrimRangeForItem}
                                                                clipTrimRanges={clipTrimRanges} setClipTrimRanges={setClipTrimRanges}
                                                                rotationDegrees={rotationDegrees} setRotationDegrees={setRotationDegrees}
                                                                volumeLevel={volumeLevel} setVolumeLevel={setVolumeLevel}
                                                                isMuted={isMuted} setIsMuted={setIsMuted}
                                                                isDenoiseEnabled={isDenoiseEnabled} setIsDenoiseEnabled={setIsDenoiseEnabled}
                                                                onApplyToAllVolume={handleApplyToAllVolume}
                                                                cropWidthPct={cropWidthPct} setCropWidthPct={setCropWidthPct}
                                                                cropHeightPct={cropHeightPct} setCropHeightPct={setCropHeightPct}
                                                                cropCenterX={cropCenterX} setCropCenterX={setCropCenterX}
                                                                cropCenterY={cropCenterY} setCropCenterY={setCropCenterY}
                                                                zoomToolAmount={zoomToolAmount} setZoomToolAmount={setZoomToolAmount}
                                                                keyframeMode={keyframeMode} setKeyframeMode={setKeyframeMode}
                                                                keyframeAmount={keyframeAmount} setKeyframeAmount={setKeyframeAmount}
                                                                videoRef={videoRef}
                                                                captions={captions} setCaptions={setCaptions}
                                                                currentCaption={currentCaption} setCurrentCaption={setCurrentCaption}
                                                                captionLanguage={captionLanguage} setCaptionLanguage={setCaptionLanguage}
                                                                captionStyle={captionStyle} setCaptionStyle={setCaptionStyle}
                                                                captionStylePreset={captionStylePreset} setCaptionStylePreset={setCaptionStylePreset}
                                                                isCaptionPlacementMode={isCaptionPlacementMode} setIsCaptionPlacementMode={setIsCaptionPlacementMode}
                                                                detectSpeakers={detectSpeakers} setDetectSpeakers={setDetectSpeakers}
                                                                handleAutoCaption={handleAutoCaption}
                                                                isAutoCapturing={isAutoCapturing} autoCaptionStatus={autoCaptionStatus}
                                                                proParams={proParams} setProParams={setProParams}
                                                                saveToUndo={saveToUndo} mediaItems={mediaItems}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* AI Settings Switches */}
                                                        <div>
                                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Smart Auto Features</span>
                                                            <div className="grid grid-cols-2 gap-1.5">
                                                                {[
                                                                    { id: 'subtitles', label: 'Subtitles', icon: Layers, color: 'text-fuchsia-400' },
                                                                    { id: 'autoCuts', label: 'Auto-Cuts', icon: Trash2, color: 'text-red-400' },
                                                                    { id: 'backgroundMusic', label: 'Music', icon: Music, color: 'text-amber-400' },
                                                                    { id: 'faceTracking', label: 'Tracking', icon: Monitor, color: 'text-emerald-400' },
                                                                ].map((opt) => (
                                                                    <div key={opt.id} className="flex items-center justify-between p-1.5 rounded bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-all">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <opt.icon className={`w-3 h-3 ${opt.color}`} />
                                                                            <span className="text-[8px] font-bold text-slate-300">{opt.label}</span>
                                                                        </div>
                                                                        <Switch
                                                                            checked={aiOptions[opt.id as keyof typeof aiOptions]}
                                                                            onCheckedChange={() => toggleOption(opt.id as keyof typeof aiOptions)}
                                                                            className="scale-50 data-[state=checked]:bg-purple-500"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {/* Quick Tools Grid */}

                                                        {/* Canvas Format */}
                                                        <div>
                                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Canvas Format</span>
                                                            <div className="grid grid-cols-1 gap-3">
                                                                <AspectRatioCard label="YouTube" ratio="16:9" icon={MonitorPlay} description="Best for YouTube & Desktop" isSelected={aspectRatio.name === 'YouTube'} onClick={() => applyAspectRatio(16, 9, 'YouTube')} />
                                                                <AspectRatioCard label="Instagram" ratio="9:16" icon={Smartphone} description="Reels, Shorts & TikTok" isSelected={aspectRatio.name === 'Instagram'} onClick={() => applyAspectRatio(9, 16, 'Instagram')} />
                                                                <AspectRatioCard label="Square" ratio="1:1" icon={Square} description="Instagram Posts" isSelected={aspectRatio.name === 'Square'} onClick={() => applyAspectRatio(1, 1, 'Square')} />
                                                                <AspectRatioCard label="Custom" ratio="Custom" icon={SlidersHorizontal} description={aspectRatio.name === 'Custom' ? `${aspectRatio.width} Ãƒâ€” ${aspectRatio.height}` : "Width Ãƒâ€” Height"} isSelected={aspectRatio.name === 'Custom'} onClick={() => setIsCustomFrameOpen(true)} />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                    </div>{/* end content panel */}


                    </motion.aside>
                    )}

                    {/* Center Column: Video Monitor */}
                    <section className={`flex-1 flex flex-col relative overflow-hidden order-1 md:order-2 ${isCropMode ? 'bg-[#07080f]' : 'bg-black/15'}`}>
                        {isCropMode && (
                            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-auto">
                                <button onClick={() => setRotationDegrees(prev => (prev + 90) % 360)} className="flex flex-col items-center justify-center text-slate-400 hover:text-white gap-1 w-12 cursor-pointer">
                                    <RotateCw size={18} />
                                    <span className="text-[10px] mt-1">Rotate</span>
                                </button>
                                <div className="flex gap-4">
                                    <button onClick={() => {
                                        setFlipH(prev => !prev);
                                        if (activePreviewId) {
                                            setClipSettings(prev => {
                                                const updated = { ...prev, [activePreviewId]: { ...prev[activePreviewId], mirror: !prev[activePreviewId]?.mirror } };
                                                saveToUndo(mediaItems, undefined, undefined, undefined, undefined, undefined, undefined, updated);
                                                return updated;
                                            });
                                        }
                                    }} className={`flex flex-col items-center justify-center gap-1 w-12 cursor-pointer ${flipH || (activePreviewId && clipSettings[activePreviewId]?.mirror) ? 'text-[#EAB308]' : 'text-slate-400 hover:text-white'}`}>
                                        <FlipHorizontal size={18} />
                                        <span className="text-[10px] mt-1">Mirror</span>
                                    </button>
                                    <button onClick={() => {
                                        setFlipV(prev => !prev);
                                        if (activePreviewId) {
                                            setClipSettings(prev => {
                                                const updated = { ...prev, [activePreviewId]: { ...prev[activePreviewId], flip: !prev[activePreviewId]?.flip } };
                                                saveToUndo(mediaItems, undefined, undefined, undefined, undefined, undefined, undefined, updated);
                                                return updated;
                                            });
                                        }
                                    }} className={`flex flex-col items-center justify-center gap-1 w-12 cursor-pointer ${flipV || (activePreviewId && clipSettings[activePreviewId]?.flip) ? 'text-[#EAB308]' : 'text-slate-400 hover:text-white'}`}>
                                        <FlipVertical size={18} />
                                        <span className="text-[10px] mt-1">Flip</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="absolute inset-0 pointer-events-none z-0">
                            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                        </div>

                        {/* Video Canvas Container */}
                        <div className="flex-1 relative p-4 flex items-center justify-center overflow-hidden z-10">
                            <motion.div
                                ref={previewFrameRef}
                                layout
                                style={{
                                    aspectRatio: getRatioValue(),
                                    width: getRatioValue() > 1 ? '100%' : 'auto',
                                    height: getRatioValue() > 1 ? 'auto' : '100%',
                                                    maxWidth: '100%',
                                    maxHeight: '90%'
                                }}
                                onClick={(e) => {
                                    if (!previewFrameRef.current) return;
                                    const rect = previewFrameRef.current.getBoundingClientRect();
                                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                                    if (isTextPlacementMode) {
                                        setOverlayPosX(Math.max(0, Math.min(100, x)));
                                        setOverlayPosY(Math.max(0, Math.min(100, y)));
                                        if (activePreviewId) {
                                            setClipSettings((prev: any) => ({
                                                ...prev,
                                                [activePreviewId]: {
                                                    ...(prev[activePreviewId] || {}),
                                                    overlayPosX: Math.max(0, Math.min(100, x)),
                                                    overlayPosY: Math.max(0, Math.min(100, y))
                                                }
                                            }));
                                        }
                                        setIsTextPlacementMode(false);
                                    } else if (isCaptionPlacementMode) {
                                        setCaptionStyle(prev => ({ ...prev, posX: Math.max(0, Math.min(100, x)), posY: Math.max(0, Math.min(100, y)) }));
                                        setIsCaptionPlacementMode(false);
                                    }
                                }}
                                className={`relative rounded-xl bg-slate-950 border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center transition-all ${(isTextPlacementMode || isCaptionPlacementMode) ? 'cursor-crosshair' : 'cursor-default'}`}
                            >
                                <AnimatePresence mode="wait">
                                    {activePreviewId && activePreviewItem ? (
                                        <motion.div
                                            key={`preview-${activePreviewId}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute inset-0 w-full h-full"
                                        >
                                            {activePreviewItem.type === 'video' ? (() => {
                                                const isPro = selectedEffect && selectedEffect.startsWith('pro-') && !selectedEffect.startsWith('pro-filter-');
                                                const isCutout = clipSettings[activePreviewId]?.cutout?.enabled;
                                                const showCanvas = isPro || CANVAS_PREVIEW_EFFECTS.includes(selectedEffect) || CANVAS_PREVIEW_FILTERS.includes(selectedFilter) || isCutout;
                                                return (
                                                    <>
                                                        {(() => {
                                                            const styleId = clipSettings[activePreviewId]?.bgBlurStyle || 'none';
                                                            if (styleId === 'none' && !clipSettings[activePreviewId]?.fill) return null;
                                                            
                                                            const blurAmt = clipSettings[activePreviewId]?.bgBlurAmount ?? 45;
                                                            const blurPx = Math.max(2, (blurAmt / 100) * 40);
                                                            
                                                            let filterStr = `blur(${blurPx}px) brightness(0.6)`;
                                                            let scaleStr = 'scale(1.1)';
                                                            
                                                            if (styleId === 'horizontal') scaleStr = 'scaleX(1.5) scaleY(1.1)';
                                                            else if (styleId === 'vertical') scaleStr = 'scaleY(1.5) scaleX(1.1)';
                                                            else if (styleId === 'radioactive') filterStr += ' hue-rotate(90deg) saturate(2)';
                                                            
                                                            return (
                                                                <video
                                                                    ref={bgVideoRef}
                                                                    src={activePreviewItem.preview}
                                                                    className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                                                                    style={{ filter: filterStr, transform: scaleStr }}
                                                                    muted
                                                                    playsInline
                                                                />
                                                            );
                                                        })()}
                                                        <video
                                                            ref={videoRef}
                                                            key="main-editor-video-preview"
                                                            onTimeUpdate={(e) => {
                                                                handleTimeUpdate();
                                                                if (bgVideoRef.current && Math.abs(bgVideoRef.current.currentTime - e.currentTarget.currentTime) > 0.1) {
                                                                    bgVideoRef.current.currentTime = e.currentTarget.currentTime;
                                                                }
                                                            }}
                                                            onPlay={(e) => {
                                                                if (bgVideoRef.current) bgVideoRef.current.play().catch(() => {});
                                                            }}
                                                            onPause={(e) => {
                                                                if (bgVideoRef.current) bgVideoRef.current.pause();
                                                            }}
                                                            onEnded={() => {
                                                                if (lastTriggeredEndRef.current !== activePreviewItem.id) {
                                                                    lastTriggeredEndRef.current = activePreviewItem.id;
                                                                    console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] Clip reached end in onEnded:", activePreviewItem.id);
                                                                    playNextMedia(activePreviewItem.id);
                                                                }
                                                            }}
                                                            onLoadStart={() => {
                                                                console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] onLoadStart");
                                                            }}
                                                            onLoadedMetadata={() => {
                                                                console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] onLoadedMetadata");
                                                                if (selectedEffect === 'fade-in') setPreviewOpacity(0);
                                                                else setPreviewOpacity(1);
                                                                if (selectedEffect !== 'zoom') setPreviewZoom(1);
                                                            }}
                                                            onLoadedData={() => {
                                                                console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] onLoadedData, videoRef.current exists:", !!videoRef.current);
                                                                // Reset current time to trim start when new video is loaded
                                                                if (videoRef.current) {
                                                                    const activeItem = mediaItems.find(i => i?.id === activePreviewId);
                                                                    if (activePreviewItem?.type === 'video') {
                                                                        const targetStart = getTargetStartTime(activeItem);
                                                                        const videoElement = videoRef.current;
                                                                        videoElement.currentTime = targetStart;
                                                                        console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] Video loaded, current time set to:", targetStart, "isPlaying:", isPlaying);

                                                                        // Clear the pending seek offset once applied
                                                                        if (pendingTransitionSeekRef.current && pendingTransitionSeekRef.current.clipId === activePreviewId) {
                                                                            pendingTransitionSeekRef.current = null;
                                                                        }

                                                                        if (isPlaying) {
                                                                            safePlay(videoElement);
                                                                        }
                                                                    } else {
                                                                        videoRef.current.currentTime = 0;
                                                                    }
                                                                }
                                                            }}
                                                            onCanPlay={(e) => {
                                                                const videoElement = e.currentTarget;
                                                                console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] onCanPlay fired, isPlaying:", isPlaying, "videoElement:", !!videoElement);
                                                                safePlay(videoElement);
                                                            }}
                                                            onSeeked={(e) => {
                                                                if (bgVideoRef.current) bgVideoRef.current.currentTime = e.currentTarget.currentTime;
                                                                const videoElement = e.currentTarget;
                                                                console.log("Ã°Å¸â€œÂ¹ [PLAYBACK] onSeeked fired, isPlaying:", isPlaying, "paused:", videoElement.paused);
                                                                safePlay(videoElement);
                                                            }}
                                                            onError={(e) => {
                                                                console.error("Ã°Å¸â€œÂ¹ [PLAYBACK] Video error:", e);
                                                            }}
                                                            src={activePreviewItem.preview}
                                                            className={showCanvas ? 'opacity-0 absolute pointer-events-none w-0 h-0' : `relative z-10 w-full h-full object-contain`}
                                                            style={{
                                                                opacity: selectedEffect === 'fade-in' ? previewOpacity : (clipSettings[activePreviewId]?.opacity ?? 100) / 100,
                                                                filter: getCombinedPreviewFilterCss(),
                                                                transform: getCombinedPreviewTransform(),
                                                                clipPath: getPreviewClipPath(),
                                                                transformOrigin: 'center center',
                                                                borderRadius: `${cornerRadius}px`,
                                                                border: (clipSettings[activePreviewId]?.borderWidth ?? 0) > 0 ? `${clipSettings[activePreviewId].borderWidth}px solid ${clipSettings[activePreviewId].borderColorHex || '#ffffff'}` : 'none',
                                                                backgroundColor: clipSettings[activePreviewId]?.bg || 'transparent'
                                                            }}
                                                            muted={isMuted}
                                                            playsInline
                                                        />
                                                        {showCanvas && (
                                                            <canvas
                                                                ref={greenScreenCanvasRef}
                                                                className={`relative z-10 w-full h-full object-contain`}
                                                                style={{
                                                                    opacity: selectedEffect === 'fade-in' ? previewOpacity : (clipSettings[activePreviewId]?.opacity ?? 100) / 100,
                                                                    filter: getCombinedPreviewFilterCss(),
                                                                    transform: getCombinedPreviewTransform(),
                                                                    clipPath: getPreviewClipPath(),
                                                                    transformOrigin: 'center center',
                                                                    borderRadius: `${cornerRadius}px`,
                                                                    border: (clipSettings[activePreviewId]?.borderWidth ?? 0) > 0 ? `${clipSettings[activePreviewId].borderWidth}px solid ${clipSettings[activePreviewId].borderColorHex || '#ffffff'}` : 'none',
                                                                    backgroundColor: clipSettings[activePreviewId]?.bg || 'transparent'
                                                                }}
                                                            />
                                                        )}
                                                    </>
                                                );
                                            })() : (
                                                <>
                                                    {clipSettings[activePreviewId]?.fill && (
                                                        <img
                                                            src={activePreviewItem.preview}
                                                            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                                                            style={{ filter: 'blur(30px) brightness(0.6)' }}
                                                            alt=""
                                                        />
                                                    )}
                                                    <img
                                                        src={activePreviewItem.preview}
                                                        className={`relative z-10 w-full h-full object-contain`}
                                                        style={{
                                                            opacity: selectedEffect === 'fade-in' ? previewOpacity : (clipSettings[activePreviewId]?.opacity ?? 100) / 100,
                                                            filter: getCombinedPreviewFilterCss(),
                                                            transform: getCombinedPreviewTransform(),
                                                            clipPath: getPreviewClipPath(),
                                                            transformOrigin: 'center center',
                                                            borderRadius: `${cornerRadius}px`,
                                                            border: (clipSettings[activePreviewId]?.borderWidth ?? 0) > 0 ? `${clipSettings[activePreviewId].borderWidth}px solid ${clipSettings[activePreviewId].borderColorHex || '#ffffff'}` : 'none',
                                                            backgroundColor: clipSettings[activePreviewId]?.bg || 'transparent'
                                                        }}
                                                        alt="Preview"
                                                    />
                                                </>
                                            )}
                                            {audioUrl && <audio ref={audioRef} src={audioUrl} muted={isMuted} className="hidden" />}
                                            {bgMusicUrl && <audio ref={bgMusicRef} src={bgMusicUrl} className="hidden" />}
                                            {selectedEffect === 'flash-effect' && (
                                                <div
                                                    className="absolute inset-0 pointer-events-none bg-white"
                                                    style={{
                                                        opacity: Math.min(0.5, Math.max(0, Math.sin((progress / 100) * Math.PI * 10) * 0.24 + 0.18)),
                                                        mixBlendMode: 'screen',
                                                    }}
                                                />
                                            )}
                                            {selectedEffect === 'film-grain' && (
                                                <div
                                                    className="absolute inset-0 pointer-events-none"
                                                    style={{
                                                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                                                        backgroundSize: '2px 2px, 2px 2px',
                                                        opacity: 0.18,
                                                        pointerEvents: 'none',
                                                    }}
                                                />
                                            )}
                                            {selectedEffect === 'rgb-split' && (
                                                <div
                                                    className="absolute inset-0 pointer-events-none"
                                                    style={{
                                                        boxShadow: `inset 0 0 0 ${rgbSplitAmount / 5}px rgba(255,0,100,0.12), inset 0 0 0 ${rgbSplitAmount / 8}px rgba(0,255,255,0.08)`,
                                                    }}
                                                />
                                            )}
                                            {/* Animated captions preview removed */}
                                        </motion.div>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-6">
                                            <Video className="w-12 h-12 text-purple-400/10 animate-pulse" />
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Source Preview Empty</span>
                                        </div>
                                    )}
                                </AnimatePresence>

                                {/* Transition overlay */}
                                {transitionOverlay && (
                                    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                                        {(() => {
                                            const fromItem = mediaItems.find((m) => m.id === transitionOverlay.fromId);
                                            const toItem = mediaItems.find((m) => m.id === transitionOverlay.toId);
                                            if (!fromItem || !toItem) return null;
                                            const transitionFilter = getCombinedPreviewFilterCss();
                                            const fromStyle = {
                                                ...getTransitionLayerStyle('from', transitionOverlay.type, transitionProgress),
                                                filter: transitionFilter !== 'none'
                                                    ? `${getTransitionLayerStyle('from', transitionOverlay.type, transitionProgress).filter === 'none' ? '' : `${getTransitionLayerStyle('from', transitionOverlay.type, transitionProgress).filter} `}${transitionFilter}`.trim()
                                                    : getTransitionLayerStyle('from', transitionOverlay.type, transitionProgress).filter,
                                            };
                                            const toStyle = {
                                                ...getTransitionLayerStyle('to', transitionOverlay.type, transitionProgress),
                                                filter: transitionFilter !== 'none'
                                                    ? `${getTransitionLayerStyle('to', transitionOverlay.type, transitionProgress).filter === 'none' ? '' : `${getTransitionLayerStyle('to', transitionOverlay.type, transitionProgress).filter} `}${transitionFilter}`.trim()
                                                    : getTransitionLayerStyle('to', transitionOverlay.type, transitionProgress).filter,
                                            };
                                            return (
                                                <>
                                                    {/* From Item Layer */}
                                                    <div className="absolute inset-0" style={fromStyle}>
                                                        {fromItem.type === 'video' ? (
                                                            <video
                                                                key={`overlay-from-${fromItem.id}`}
                                                                src={fromItem.preview}
                                                                className="w-full h-full object-contain"
                                                                muted
                                                                playsInline
                                                                preload="auto"
                                                                onLoadedMetadata={(e) => {
                                                                    const trim = getTrimRangeForItem(fromItem.id, fromItem.duration);
                                                                    e.currentTarget.currentTime = trim.end;
                                                                }}
                                                            />
                                                        ) : (
                                                            <img src={fromItem.preview} className="w-full h-full object-contain" alt="" />
                                                        )}
                                                    </div>

                                                    {/* To Item Layer */}
                                                    <div className="absolute inset-0" style={toStyle}>
                                                        {toItem.type === 'video' ? (
                                                            <video
                                                                key={`overlay-to-${toItem.id}`}
                                                                src={toItem.preview}
                                                                className="w-full h-full object-contain"
                                                                muted
                                                                playsInline
                                                                autoPlay
                                                                preload="auto"
                                                                onLoadedMetadata={(e) => {
                                                                    const trim = getTrimRangeForItem(toItem.id, toItem.duration);
                                                                    e.currentTarget.currentTime = trim.start;
                                                                }}
                                                                onCanPlay={(e) => {
                                                                    e.currentTarget.play().catch(() => {});
                                                                }}
                                                            />
                                                        ) : (
                                                            <img src={toItem.preview} className="w-full h-full object-contain" alt="" />
                                                        )}
                                                    </div>
                                                    {(transitionOverlay.type === 'dip-black' || transitionOverlay.type === 'dip-white' || transitionOverlay.type === 'flash-transition') && (
                                                        <div
                                                            className="absolute inset-0"
                                                            style={{
                                                                background: transitionOverlay.type === 'dip-white' || transitionOverlay.type === 'flash-transition' ? '#ffffff' : '#000000',
                                                                opacity: transitionOverlay.type === 'flash-transition' ? Math.max(0, 1 - Math.abs(transitionProgress - 0.5) * 4) : transitionProgress < 0.5 ? transitionProgress * 2 : (1 - transitionProgress) * 2,
                                                            }}
                                                        />
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}

                                {mediaItems.filter((clip: any) => clip.type === 'text' || clip.type === 'overlay').map((clip: any) => {
                                    // Use clipSettings if they exist, otherwise fallback to global state if it's the active clip (for backward compat during transition)
                                    const isCurrent = clip?.id === activePreviewId;
                                    const settings = clipSettings[clip?.id] || {};
                                    const text = settings.overlayText !== undefined ? settings.overlayText : (isCurrent ? overlayText : '');
                                    if (!text || text.trim().length === 0) return null;
                                    
                                    // Check if active
                                    const start = clipStartOverrides[clip?.id] !== undefined ? clipStartOverrides[clip?.id] : (clip.startTime || 0);
                                    const trim = clipTrimRanges[clip?.id] || (getTrimRangeForItem ? getTrimRangeForItem(clip?.id, clip.duration || 5) : { start: 0, end: clip.duration || 5 });
                                    const effDur = (trim.end ?? (clip.duration || 5)) - trim.start;
                                    const isActive = globalCurrentTime >= start && globalCurrentTime <= start + effDur;
                                    if (!isActive) return null;

                                    const posX = settings.overlayPosX ?? (isCurrent ? overlayPosX : 50);
                                    const posY = settings.overlayPosY ?? (isCurrent ? overlayPosY : 50);
                                    const fontSize = settings.overlayFontSize ?? (isCurrent ? overlayFontSize : 48);
                                    const fontId = settings.overlayFontId || (isCurrent ? overlayFontId : 'rubik');
                                    const font = textFontOptions.find((f: any) => f.id === fontId)?.family || textFontOptions[0].family;
                                    const color = settings.overlayColor || (isCurrent ? overlayColor : '#FFFFFF');
                                    const isBold = settings.overlayTextStyleBold ?? (isCurrent ? overlayTextStyleBold : false);
                                    const isItalic = settings.overlayTextStyleItalic ?? (isCurrent ? overlayTextStyleItalic : false);
                                    const isUnderline = settings.overlayTextStyleUnderline ?? false;
                                    
                                    const hasBg = settings.overlayBgEnabled ?? (isCurrent ? overlayBgEnabled : false);
                                    const bgColor = settings.overlayBgColorHex || (isCurrent ? overlayBgColorHex : '#000000');
                                    const bgRadius = settings.overlayBgRadius ?? (isCurrent ? overlayBgRadius : 0);
                                    
                                    const hasStroke = settings.overlayStrokeEnabled ?? (isCurrent ? overlayStrokeEnabled : false);
                                    const strokeColor = settings.overlayStrokeColor || (isCurrent ? overlayStrokeColor : '#000000');
                                    
                                    const hasShadow = settings.overlayShadowEnabled ?? (isCurrent ? overlayShadowEnabled : false);
                                    const shadowColor = settings.overlayShadowColor || (isCurrent ? overlayShadowColor : '#000000');
                                    const shadowBlur = settings.overlayShadowBlur ?? (isCurrent ? overlayShadowBlur : 10);
                                    
                                    const letterSpacing = settings.overlayLetterSpacing ?? (isCurrent ? overlayLetterSpacing : 0);
                                    const lineSpacing = settings.overlayLineSpacing ?? (isCurrent ? overlayLineSpacing : 0);
                                    
                                    const animIn = settings.overlayAnimationIn ?? (isCurrent ? overlayAnimationIn : 'none');
                                    const animOut = settings.overlayAnimationOut ?? (isCurrent ? overlayAnimationOut : 'none');
                                    const animLoop = settings.overlayAnimationLoop ?? (isCurrent ? overlayAnimationLoop : 'none');
                                    
                                    let dynamicOpacity = 1;
                                    let dynamicScale = 1;
                                    let dynamicOffsetX = 0;
                                    let dynamicOffsetY = 0;
                                    let dynamicRotation = 0;
                                    
                                    const animDuration = 0.5; // half a second in/out
                                    const relTime = globalCurrentTime - start;
                                    const relTimeEnd = (start + effDur) - globalCurrentTime;
                                    
                                    // In Animation
                                    if (relTime < animDuration) {
                                        const progress = relTime / animDuration; // 0 to 1
                                        if (animIn === 'fade') dynamicOpacity = progress;
                                        if (animIn === 'slide-left') { dynamicOpacity = progress; dynamicOffsetX = -50 * (1 - progress); }
                                        if (animIn === 'zoom-in') { dynamicOpacity = progress; dynamicScale = 0.5 + (0.5 * progress); }
                                    }
                                    
                                    // Out Animation
                                    if (relTimeEnd < animDuration && relTimeEnd >= 0) {
                                        const progress = relTimeEnd / animDuration; // 1 to 0
                                        if (animOut === 'fade') dynamicOpacity = progress;
                                        if (animOut === 'slide-right') { dynamicOpacity = progress; dynamicOffsetX = 50 * (1 - progress); }
                                        if (animOut === 'zoom-out') { dynamicOpacity = progress; dynamicScale = 0.5 + (0.5 * progress); }
                                    }
                                    
                                    // Loop Animation
                                    if (relTime >= animDuration && relTimeEnd >= animDuration) {
                                        if (animLoop === 'pulse') dynamicScale = 1 + 0.1 * Math.sin(relTime * Math.PI * 4);
                                        if (animLoop === 'shake') dynamicOffsetX = 5 * Math.sin(relTime * Math.PI * 10);
                                        if (animLoop === 'float') dynamicOffsetY = -10 * Math.sin(relTime * Math.PI * 2);
                                        if (animLoop === 'wobble') {
                                            dynamicOffsetX = 10 * Math.sin(relTime * Math.PI * 4);
                                            dynamicRotation = 5 * Math.sin(relTime * Math.PI * 4);
                                        }
                                        if (animLoop === 'blink') dynamicOpacity = Math.floor(relTime * 2) % 2 === 0 ? 1 : 0;
                                        if (animLoop === 'typewriter') {
                                            // Typewriter just truncates the string!
                                            // We can't do that via CSS, so we'll just leave this as is.
                                            // Wait, if it's typewriter, we can use CSS steps or clip-path
                                        }
                                    }
                                    
                                    // Base transform including anchor, nudge, and animations
                                    let transformStr = `translate(-50%, -50%) translate(${dynamicOffsetX}px, ${dynamicOffsetY}px) scale(${dynamicScale}) rotate(${dynamicRotation}deg)`;


                                    return (
                                        <div
                                            key={clip?.id}
                                            className="absolute z-40 pointer-events-none select-none text-center"
                                            style={{
                                                left: `${posX}%`,
                                                top: `${posY}%`,
                                                transform: 'translate(-50%, -50%)',
                                                maxWidth: '88%',
                                                fontFamily: font,
                                                fontSize: `${fontSize}px`,
                                                color: color,
                                                fontWeight: isBold ? 'bold' : 'normal',
                                                fontStyle: isItalic ? 'italic' : 'normal',
                                                textDecoration: isUnderline ? 'underline' : 'none',
                                                letterSpacing: `${letterSpacing}px`,
                                                lineHeight: lineSpacing ? `${1 + (lineSpacing/100)}em` : 'normal',
                                                WebkitTextStroke: hasStroke ? `1.5px ${strokeColor}` : 'none',
                                                textShadow: hasShadow ? `2px 2px ${shadowBlur}px ${shadowColor}` : 'none',
                                                background: hasBg ? `${bgColor}cc` : 'transparent',
                                                padding: hasBg ? '4px 12px' : '0',
                                                borderRadius: hasBg ? `${bgRadius}px` : '0',
                                                whiteSpace: 'pre-wrap',
                                            }}
                                        >
                                            {text}
                                        </div>
                                    );
                                })}

                                {/* Render Frame Overlay */}
                                {selectedFrameId && (
                                    <div className="absolute inset-0 pointer-events-none z-40 w-full h-full flex flex-col justify-between">
                                        {/* Polaroid Frame */}
                                        {selectedFrameId === 'polaroid' && (
                                            <div className="absolute inset-0 border-[16px] border-slate-100 border-b-[48px] shadow-[inset_0_4px_10px_rgba(0,0,0,0.3)] flex items-end justify-center pb-2">
                                                <span className="font-sans font-bold text-[8px] text-slate-700 tracking-widest uppercase">MEMORIES</span>
                                            </div>
                                        )}

                                        {/* Neon Glow Frame */}
                                        {selectedFrameId === 'neon' && (
                                            <div className="absolute inset-0 border-2 border-purple-500 shadow-[inset_0_0_30px_rgba(168,85,247,0.6)] animate-pulse" />
                                        )}

                                        {/* Vignette Frame */}
                                        {selectedFrameId === 'vignette' && (
                                            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.95)]" />
                                        )}

                                        {/* Cinematic Bars */}
                                        {selectedFrameId === 'cinematic' && (
                                            <div className="absolute inset-0 border-y-[32px] border-black" />
                                        )}

                                        {/* VHS Record Frame */}
                                        {selectedFrameId === 'vhs' && (
                                            <div className="absolute inset-0 border border-white/20 p-3 flex flex-col justify-between select-none">
                                                <div className="flex justify-between font-mono text-[8px] text-white/80 drop-shadow-md">
                                                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> REC</span>
                                                    <span>SP 0:00:00</span>
                                                </div>
                                                <div className="flex justify-between font-mono text-[8px] text-white/80 drop-shadow-md">
                                                    <span>100%</span>
                                                    <span>12 OCT 1998</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Futuristic HUD Frame */}
                                        {selectedFrameId === 'hud' && (
                                            <div className="absolute inset-0 border border-cyan-500/20 p-3 flex flex-col justify-between select-none">
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-cyan-500/40 rounded-full flex items-center justify-center">
                                                    <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                                                </div>
                                                <div className="flex justify-between font-mono text-[7px] text-cyan-400/80 drop-shadow">
                                                    <span>SYS STATUS: ACTIVE</span>
                                                    <span>LOCK_ON: AUTO</span>
                                                </div>
                                                <div className="flex justify-between font-mono text-[7px] text-cyan-400/80 drop-shadow">
                                                    <span>ZOOM: 1.5X</span>
                                                    <span>ALT: 420m</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Read Line Ã¢â‚¬â€ sweeps across the preview in sync with video playback */}
                                {showReadLine && (
                                    <div
                                        className="absolute z-[45] pointer-events-none"
                                        style={
                                            readLineDirection === 'horizontal'
                                                ? {
                                                    top: `${readLinePosition}%`,
                                                    left: 0,
                                                    right: 0,
                                                    height: '2px',
                                                    background: 'linear-gradient(90deg, transparent 0%, rgba(168, 85, 247,0.9) 20%, rgba(168, 85, 247,1) 50%, rgba(168, 85, 247,0.9) 80%, transparent 100%)',
                                                    boxShadow: '0 0 8px rgba(168, 85, 247,0.7), 0 0 24px rgba(168, 85, 247,0.25)',
                                                }
                                                : {
                                                    left: `${readLinePosition}%`,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: '2px',
                                                    background: 'linear-gradient(180deg, transparent 0%, rgba(168, 85, 247,0.9) 20%, rgba(168, 85, 247,1) 50%, rgba(168, 85, 247,0.9) 80%, transparent 100%)',
                                                    boxShadow: '0 0 8px rgba(168, 85, 247,0.7), 0 0 24px rgba(168, 85, 247,0.25)',
                                                }
                                        }
                                    />
                                )}

                                {/* Caption overlay Ã¢â‚¬â€ visible when a caption is active at current playback time */}
                                {currentCaption && (
                                    <div
                                        className="absolute z-[50] pointer-events-none select-none"
                                        style={{
                                            left: `${captionStyle.posX}%`,
                                            top: `${captionStyle.posY}%`,
                                            transform: 'translate(-50%, -50%)',
                                            fontFamily: textFontOptions.find((f) => f.id === captionStyle.fontId)?.family || textFontOptions[0].family,
                                            fontSize: `${captionStyle.fontSize}px`,
                                            color: captionStyle.color,
                                            background: captionStyle.bgEnabled ? `${captionStyle.bgColorHex}cc` : 'transparent',
                                            textAlign: captionStyle.alignment,
                                            fontWeight: captionStyle.bold ? 700 : 400,
                                            fontStyle: captionStyle.italic ? 'italic' : 'normal',
                                            WebkitTextStroke: captionStyle.outline ? '1px rgba(0,0,0,0.8)' : undefined,
                                            padding: captionStyle.bgEnabled ? '4px 12px' : undefined,
                                            borderRadius: captionStyle.bgEnabled ? '6px' : undefined,
                                            maxWidth: '88%',
                                            textShadow: '0 2px 10px rgba(0,0,0,0.9)',
                                            whiteSpace: 'pre-wrap',
                                        }}
                                    >
                                        {currentCaption.text}
                                    </div>
                                )}



                            </motion.div>
                        </div>

                        {/* Status bar under Video Canvas (Timecode center + Original / Fullscreen right) */}
                        <div className="h-8 border-t border-white/10 bg-[#0d0e16] flex items-center justify-between px-4 z-10 flex-none text-xs text-slate-400 select-none">
                            <div />
                            <div className="font-mono text-xs text-slate-300 font-medium">
                                0:10.34 / 0:35.33
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsDurationOpen(true)}
                                    className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs transition-colors cursor-pointer"
                                >
                                    <Square className="w-3 h-3 text-slate-400" />
                                    <span>Original</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => previewFrameRef.current?.requestFullscreen && previewFrameRef.current.requestFullscreen()}
                                    className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                    title="Fullscreen"
                                >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                        {isCropMode && (
                            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center justify-between gap-6 z-50 bg-[#15161c] px-6 py-4 rounded-2xl shadow-2xl pointer-events-auto border border-white/5 w-[80%] max-w-[800px]">
                                <button onClick={() => setIsCropMode(false)} className="text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider px-4 py-2 flex items-center gap-2 cursor-pointer transition-colors">
                                    Cancel
                                </button>
                                <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar py-2 px-2 flex-1 justify-center max-w-[600px]">
                                    {CROP_RATIOS.map((preset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => handleCropRatioClick(preset)}
                                            className="flex flex-col items-center justify-center min-w-[54px] h-[54px] rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 shrink-0 transition-colors cursor-pointer"
                                        >
                                            {preset.icon ? (
                                                <>
                                                    <preset.icon className="w-4 h-4 text-slate-300 mb-1" />
                                                    <span className="text-[8px] font-medium text-slate-300">{preset.label}</span>
                                                </>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-300">{preset.label}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={() => {
                                            setCropWidthPct(100);
                                            setCropHeightPct(100);
                                            setCropCenterX(50);
                                            setCropCenterY(50);
                                            setRotationDegrees(0);
                                            setFlipH(false);
                                            setFlipV(false);
                                        }}
                                        className="text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer"
                                        title="Reset Crop"
                                    >
                                        Reset
                                    </button>
                                    <button onClick={() => setIsCropMode(false)} className="text-[#0B1020] bg-white hover:bg-slate-200 font-bold text-xs uppercase tracking-wider px-6 py-2 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.4)] cursor-pointer transition-colors">
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Toggle Inspector Button */}
                    <div className="relative flex items-center z-50" style={{ width: 0 }}>
                        <button
                            onClick={() => setIsMediaPoolVisible(!isMediaPoolVisible)}
                            className="absolute right-0 w-6 h-12 bg-[#0B1020]/90 border border-white/10 border-r-0 rounded-l-md flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer animate-pulse"
                            title="Toggle Inspector"
                        >
                            {isMediaPoolVisible ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Right Column: CapCut / VN Style Side Inspector Panel */}
                    {!isCropMode && (
                    <motion.aside
                        initial={false}
                        animate={{ width: isMediaPoolVisible ? (isMobile ? '100%' : 340) : 0, opacity: isMediaPoolVisible ? 1 : 0 }}
                        className="flex-none flex border-l border-white/[0.06] overflow-hidden select-none order-3 bg-[#0d0e16] text-xs z-20"
                    >
                        <div className={`${isMobile ? 'w-full' : 'w-[340px]'} h-full flex min-h-0 bg-[#12131e]`}>
                            
                            {/* Ã¢â€â‚¬Ã¢â€â‚¬ Vertical Icon Tab Sidebar Ã¢â€â‚¬Ã¢â€â‚¬ */}
                            <div className="w-12 flex-none flex flex-col items-center gap-1 py-3 bg-[#0d0e18] border-r border-white/[0.06]">
                                {([
                                    {
                                        tab: 'color',
                                        title: 'Filters & Color',
                                        icon: (
                                            <svg viewBox="0 0 22 22" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6">
                                                <circle cx="7.5" cy="11" r="4.5" />
                                                <circle cx="14.5" cy="7.5" r="4.5" />
                                                <circle cx="14.5" cy="14.5" r="4.5" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        tab: 'speed',
                                        title: 'Speed',
                                        icon: (
                                            <svg viewBox="0 0 22 22" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6">
                                                <circle cx="11" cy="11" r="8.5" />
                                                <path d="M11 11 L11 4.5" strokeLinecap="round" />
                                                <path d="M11 11 L15.5 13" strokeLinecap="round" />
                                                <circle cx="11" cy="11" r="1.2" fill="currentColor" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        tab: 'audio',
                                        title: 'Audio',
                                        icon: (
                                            <svg viewBox="0 0 22 22" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6">
                                                <path d="M4 8.5h4l3-5 3 11 3-6 2 0" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        tab: 'bg',
                                        title: 'Canvas & Frame',
                                        icon: (
                                            <svg viewBox="0 0 22 22" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6">
                                                <rect x="3" y="3" width="16" height="16" rx="4" />
                                                <path d="M7 15 L15 7" strokeLinecap="round" />
                                                <path d="M4 12 L12 4" strokeLinecap="round" opacity="0.5" />
                                                <path d="M10 18 L18 10" strokeLinecap="round" opacity="0.5" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        tab: 'video',
                                        title: 'Transform',
                                        icon: (
                                            <svg viewBox="0 0 22 22" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6">
                                                <rect x="4" y="4" width="14" height="14" rx="1.5" strokeDasharray="3 2" />
                                                <circle cx="4" cy="4" r="1.5" fill="currentColor" />
                                                <circle cx="18" cy="4" r="1.5" fill="currentColor" />
                                                <circle cx="4" cy="18" r="1.5" fill="currentColor" />
                                                <circle cx="18" cy="18" r="1.5" fill="currentColor" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        tab: 'animation',
                                        title: 'Effects & Animation',
                                        icon: (
                                            <svg viewBox="0 0 22 22" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
                                                {[0,1,2].map(row => [0,1,2].map(col => (
                                                    <circle key={`${row}-${col}`} cx={5 + col * 6} cy={5 + row * 6} r="1.2" fill="currentColor" stroke="none" opacity={0.3 + (row * 3 + col) * 0.08} />
                                                )))}
                                            </svg>
                                        ),
                                    },
                                    {
                                        tab: 'opacity',
                                        title: 'Opacity & Blend',
                                        icon: (
                                            <svg viewBox="0 0 22 22" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
                                                <circle cx="11" cy="11" r="8.5" />
                                                <circle cx="11" cy="11" r="5.5" />
                                                <circle cx="11" cy="11" r="2.5" />
                                            </svg>
                                        ),
                                    },
                                ] as { tab: typeof inspectorTab; title: string; icon: React.ReactNode }[]).map(({ tab, title, icon }) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => { 
                                            setInspectorTab(tab); 
                                            if (tab === 'color') setColorSubTab('filters'); 
                                            if (tab === 'animation') setLeftTab('effects');
                                            if (tab === 'bg') setLeftTab('frames');
                                            setIsMediaPoolVisible(true); 
                                        }}
                                        title={title}
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
                                            inspectorTab === tab
                                                ? 'bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)]'
                                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/8'
                                        }`}
                                    >
                                        {icon}
                                        {/* Active dot indicator */}
                                        {inspectorTab === tab && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r-full" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Main Active Tool Inspector Area */}
                            <div className="flex-1 flex flex-col p-4 overflow-y-auto custom-scrollbar">
                                {/* Inspector Header Title */}
                                <h3 className="text-center font-bold text-sm text-white capitalize tracking-wide mb-6">
                                    {inspectorTab === 'video' ? 'Border' : inspectorTab === 'color' ? 'Color & Filters' : inspectorTab === 'bg' ? 'Canvas & Frame' : inspectorTab}
                                </h3>

                                {/* Ã¢â€â‚¬Ã¢â€â‚¬ OPACITY TAB Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                {inspectorTab === 'opacity' && (
                                    <div className="flex flex-col flex-1">
                                        <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
                                            <span>Opacity</span>
                                            <span className="text-[#EAB308] font-bold font-mono">{(previewOpacity * 100).toFixed(0)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={previewOpacity}
                                            onChange={e => setPreviewOpacity(Number(e.target.value))}
                                            className="w-full accent-white h-1 bg-white/20 rounded-full cursor-pointer"
                                        />
                                    </div>
                                )}

                                {/* Ã¢â€â‚¬Ã¢â€â‚¬ AUDIO TAB Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                {inspectorTab === 'audio' && (
                                    <div className="flex flex-col flex-1 space-y-4">
                                        {/* Volume Slider */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-medium text-slate-300">
                                                <span>Volume</span>
                                                <span className="text-[#EAB308] font-bold font-mono">100%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="200"
                                                defaultValue="100"
                                                className="w-full accent-yellow-500 h-1 bg-white/20 rounded-full cursor-pointer"
                                            />
                                        </div>

                                        {/* Fade In & Out Button */}
                                        <button
                                            type="button"
                                            onClick={() => openFadeEditor(activePreviewId!)}
                                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer text-xs font-semibold text-white"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <svg viewBox="0 0 22 22" fill="none" className="w-5 h-5 text-[#EAB308]" stroke="currentColor">
                                                    <rect x="3.5" y="8" width="2" height="6" rx="1" fill="currentColor" opacity="0.4" />
                                                    <rect x="7" y="5.5" width="2" height="11" rx="1" fill="currentColor" opacity="0.6" />
                                                    <rect x="10.5" y="3.5" width="2" height="15" rx="1" fill="currentColor" opacity="1" />
                                                    <rect x="14" y="5.5" width="2" height="11" rx="1" fill="currentColor" opacity="0.6" />
                                                    <rect x="17.5" y="8" width="2" height="6" rx="1" fill="currentColor" opacity="0.4" />
                                                </svg>
                                                <span>Fade In & Fade Out</span>
                                            </div>
                                            <span className="text-slate-400 font-mono text-[11px]">{fadeInVal.toFixed(1)}s / {fadeOutVal.toFixed(1)}s</span>
                                        </button>

                                        {/* Auto Audio-Caption Button */}
                                        <button
                                            type="button"
                                            onClick={() => setIsAutoCaptionOpen(true)}
                                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer text-xs font-semibold text-white"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <svg viewBox="0 0 22 22" fill="none" className="w-5 h-5 text-blue-400" stroke="currentColor" strokeWidth="1.8">
                                                    <path d="M4 7V5a1 1 0 0 1 1-1h2" strokeLinecap="round" />
                                                    <path d="M15 4h2a1 1 0 0 1 1 1v2" strokeLinecap="round" />
                                                    <path d="M4 15v2a1 1 0 0 1 1 1h2" strokeLinecap="round" />
                                                    <path d="M15 18h2a1 1 0 0 0 1-1v-2" strokeLinecap="round" />
                                                    <path d="M11 6.5L7.5 15.5M11 6.5L14.5 15.5M8.5 13h5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span>Auto Audio-Caption</span>
                                            </div>
                                            <span className="text-blue-400 font-bold text-[10px] uppercase tracking-wider bg-blue-500/20 px-2 py-0.5 rounded">AI</span>
                                        </button>
                                    </div>
                                )}

                                {/* Ã¢â€â‚¬Ã¢â€â‚¬ BORDER TAB (5th Icon) Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                {inspectorTab === 'video' && (
                                    <div className="flex flex-col flex-1 space-y-4">
                                        {/* Width Slider */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-medium text-slate-300">
                                                <span>Width</span>
                                                <span className="text-[#EAB308] font-bold font-mono">{borderWidth}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="40"
                                                value={borderWidth}
                                                onChange={e => setBorderWidth(Number(e.target.value))}
                                                className="w-full accent-[#EAB308] h-1 bg-white/20 rounded-full cursor-pointer"
                                            />
                                        </div>

                                        {/* Color Section */}
                                        <div className="space-y-3">
                                            <span className="text-xs font-medium text-slate-300">Color</span>

                                            {/* Hex input */}
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-7 h-7 rounded border border-white/20 flex-none cursor-pointer"
                                                    style={{ backgroundColor: borderColorHex }}
                                                />
                                                <input
                                                    type="text"
                                                    value={borderColorHex.replace('#', '').toUpperCase()}
                                                    onChange={e => {
                                                        const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                                                        if (v.length === 6) setBorderColorHex('#' + v);
                                                    }}
                                                    className="flex-1 bg-[#1a1b26] border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-white/30"
                                                    maxLength={6}
                                                    placeholder="FFFFFF"
                                                />
                                            </div>

                                            {/* Color Gradient Canvas */}
                                            <div className="relative w-full h-[110px] rounded-xl overflow-hidden cursor-crosshair border border-white/10 select-none"
                                                style={{
                                                    background: `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, hsl(${borderHue},100%,50%))`
                                                }}
                                                onClick={e => {
                                                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                                                    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                                                    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                                                    setBgBorderSatPos({ x, y });
                                                    // compute hex from HSV
                                                    const s = x / 100;
                                                    const v = 1 - y / 100;
                                                    const h = borderHue / 360;
                                                    const i = Math.floor(h * 6);
                                                    const f = h * 6 - i;
                                                    const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
                                                    let r = 0, g = 0, b = 0;
                                                    switch (i % 6) {
                                                        case 0: r = v; g = t; b = p; break;
                                                        case 1: r = q; g = v; b = p; break;
                                                        case 2: r = p; g = v; b = t; break;
                                                        case 3: r = p; g = q; b = v; break;
                                                        case 4: r = t; g = p; b = v; break;
                                                        case 5: r = v; g = p; b = q; break;
                                                    }
                                                    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
                                                    setBorderColorHex('#' + toHex(r) + toHex(g) + toHex(b));
                                                }}
                                            >
                                                {/* Picker thumb */}
                                                <div
                                                    className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
                                                    style={{ left: `${borderSatPos.x}%`, top: `${borderSatPos.y}%`, backgroundColor: borderColorHex }}
                                                />
                                            </div>

                                            {/* Hue Slider */}
                                            <div className="relative w-full h-3 rounded-full overflow-hidden cursor-pointer border border-white/10"
                                                style={{ background: 'linear-gradient(to right, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
                                                onClick={e => {
                                                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                                                    const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
                                                    setBorderHue(h);
                                                }}
                                            >
                                                <div
                                                    className="absolute top-0 w-3 h-3 rounded-full bg-white border-2 border-white shadow -translate-x-1/2"
                                                    style={{ left: `${(borderHue / 360) * 100}%` }}
                                                />
                                            </div>

                                            {/* RGB Inputs */}
                                            <div className="flex gap-2">
                                                {(['R', 'G', 'B'] as const).map((ch, ci) => {
                                                    const hex = borderColorHex.replace('#', '');
                                                    const vals = [parseInt(hex.slice(0,2)||'0',16), parseInt(hex.slice(2,4)||'0',16), parseInt(hex.slice(4,6)||'0',16)];
                                                    return (
                                                        <div key={ch} className="flex-1 flex items-center gap-1 bg-[#1a1b26] rounded-lg px-2 py-1.5 border border-white/10">
                                                            <span className="text-[10px] font-bold text-slate-400">{ch}</span>
                                                            <input
                                                                type="number"
                                                                min={0} max={255}
                                                                value={vals[ci]}
                                                                onChange={e => {
                                                                    const nv = Math.max(0, Math.min(255, Number(e.target.value)));
                                                                    const newVals = [...vals]; newVals[ci] = nv;
                                                                    setBorderColorHex('#' + newVals.map(n => n.toString(16).padStart(2,'0')).join(''));
                                                                }}
                                                                className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Swatches */}
                                            <div className="space-y-1.5">
                                                <div className="flex gap-1 flex-wrap">
                                                    {/* Add swatch button */}
                                                    <button
                                                        type="button"
                                                        className="w-6 h-6 rounded border border-dashed border-white/30 flex items-center justify-center text-slate-400 hover:text-white text-xs"
                                                        title="Add swatch"
                                                    >+</button>
                                                    {/* Active swatch */}
                                                    <div className="w-6 h-6 rounded border-2 border-[#EAB308]" style={{ backgroundColor: borderColorHex }} />
                                                    {/* Preset swatches */}
                                                    {[
                                                        '#ffffff','#e2e2e2','#ff4444','#ff8800','#a855f7','#ec4899',
                                                        '#d4b896','#b8a082','#8c8c8c','#6b6b8a','#a78bfa','#f472b6',
                                                        '#7c6f5a','#5a6b7a','#4a5568','#2d3748','#1a1b26','#000000',
                                                    ].map(c => (
                                                        <button
                                                            key={c}
                                                            type="button"
                                                            onClick={() => setBorderColorHex(c)}
                                                            className={`w-6 h-6 rounded transition-transform hover:scale-110 border ${
                                                                borderColorHex === c ? 'border-white scale-110' : 'border-white/10'
                                                            }`}
                                                            style={{ backgroundColor: c }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reset & Apply to all action buttons */}
                                        <div className="mt-auto pt-6 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setBorderWidth(0);
                                                    setBorderColorHex('#ffffff');
                                                    setBorderHue(0);
                                                    setBgBorderSatPos({ x: 0, y: 0 });
                                                }}
                                                className="flex-1 py-1.5 rounded-lg bg-[#23242e] text-slate-300 border border-white/10 text-xs font-medium hover:bg-[#2c2d3a] transition-colors cursor-pointer text-center"
                                            >
                                                Reset
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const w = borderWidth, c = borderColorHex;
                                                    setClipSettings(prev => {
                                                        const updated = { ...prev };
                                                        mediaItems.forEach(item => {
                                                            updated[item?.id] = { ...(updated[item?.id] || {}), borderWidth: w, borderColorHex: c };
                                                        });
                                                        return updated;
                                                    });
                                                }}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#23242e] text-white border border-white/10 text-xs font-medium hover:bg-[#2c2d3a] transition-colors cursor-pointer"
                                            >
                                                <Check className="w-3.5 h-3.5 text-white" />
                                                <span>Apply to all</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Ã¢â€â‚¬Ã¢â€â‚¬ COLOR & FILTERS TAB (Matching Image 1) Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                {inspectorTab === 'color' && (
                                    <div className="flex flex-col flex-1 space-y-4">
                                        {/* Sub Tabs: Filters | Adjust Ã¢â‚¬â€ pill style */}
                                        <div className="flex items-center bg-[#1a1b26] rounded-xl p-1 gap-1 mb-1">
                                            <button
                                                type="button"
                                                onClick={() => setColorSubTab('filters')}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${colorSubTab === 'filters' ? 'bg-[#2a2b3d] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                            >
                                                Filters
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setColorSubTab('adjust')}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${colorSubTab === 'adjust' ? 'bg-[#2a2b3d] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                            >
                                                Adjust
                                            </button>
                                        </div>

                                        {colorSubTab === 'filters' && (
                                            <div className="flex flex-col flex-1 space-y-4">
                                                {/* Intensity Slider */}
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs font-medium text-slate-300">
                                                        <span>Intensity</span>
                                                        <span className="text-[#EAB308] font-bold font-mono">{filterIntensity}</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={filterIntensity}
                                                        onChange={e => setFilterIntensity(Number(e.target.value))}
                                                        className="w-full accent-purple-500 h-1 bg-white/20 rounded-full cursor-pointer"
                                                    />
                                                </div>

                                                {/* Category Selector Chips */}
                                                <div className="flex gap-1.5 overflow-x-auto pb-2 shrink-0 scrollbar-none mb-1">
                                                    {['all', 'Basic', 'Cinematic', 'Vintage', 'Retro', 'Film', 'HDR', 'LUT', 'Black & White', 'Sepia', 'Neon', 'Cyberpunk', 'Dream', 'Glow', 'Matte', 'Moody', 'Warm', 'Cool', 'Teal & Orange', 'Golden Hour', 'Sunset', 'Night', 'RGB', 'VHS', 'CRT', 'Glitch', 'Grain', 'Blur', 'Sharpen', 'Portrait', 'Beauty', 'Landscape', 'Nature', 'Food', 'Travel', 'Wedding', 'Fashion', 'Sports', 'Gaming', 'Social', 'Artistic', '3D', 'Hollywood', 'IMAX', 'Netflix', 'Kodak', 'Fujifilm', 'ARRI', 'RED', 'Sony Cinema', 'Blackmagic', 'Seasons', 'Ocean', 'Forest', 'Desert', 'Aurora', 'Galaxy', 'Space', 'Synthwave', 'Vaporwave', 'Luxury', 'Diamond', 'Gold', 'Crystal', 'Anime', 'Comic', 'Oil Painting', 'Watercolor', 'Sketch', 'Documentary', 'Analog', 'Sci-Fi'].map((cat) => (
                                                        <button
                                                            key={cat}
                                                            onClick={() => setLocalFilterCategory(cat)}
                                                            type="button"
                                                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all border shrink-0 ${
                                                                localFilterCategory === cat
                                                                    ? 'bg-purple-500/20 border-purple-500/60 text-purple-200'
                                                                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                                            }`}
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Dynamic Filters Grid */}
                                                <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
                                                    <div className="grid grid-cols-3 gap-2 pb-4">
                                                        {localFilterCategory === 'all' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedFilter('none');
                                                                    setSelectedEffect('none');
                                                                    if (activePreviewId) {
                                                                        setClipSettings((prev: any) => ({ ...prev, [activePreviewId]: { ...(prev[activePreviewId] || {}), selectedFilter: 'none' } }));
                                                                    }
                                                                }}
                                                                type="button"
                                                                className={`relative flex flex-col items-center justify-center gap-1.5 h-[68px] rounded-xl border transition-all duration-200 group overflow-hidden ${
                                                                    selectedFilter === 'none' && selectedEffect === 'none'
                                                                        ? 'bg-purple-500/15 border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.22)] scale-[1.02]'
                                                                        : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07] hover:border-white/20'
                                                                }`}
                                                            >
                                                                <CircleOff size={16} className="text-[#94a3b8]" />
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-center text-slate-400">Original</span>
                                                            </button>
                                                        )}
                                                        {(() => {
                                                            const proEffects = getAllProEffects();
                                                            const proFilters = proEffects.filter(eff => eff.id.startsWith('pro-filter-'));
                                                            const filteredFilters = localFilterCategory === 'all'
                                                                ? proFilters
                                                                : proFilters.filter(eff => eff.name.startsWith(localFilterCategory + ' v'));
                                                            return filteredFilters.map((eff) => {
                                                                const isActive = selectedFilter === eff.id || selectedEffect === eff.id;
                                                                const Icon = eff.icon || Sparkles;
                                                                return (
                                                                    <button
                                                                        key={eff.id}
                                                                        onClick={() => {
                                                                            setSelectedFilter(eff.id as any);
                                                                            setSelectedEffect(eff.id);
                                                                            setProParams(eff.defaultParameters || {});
                                                                            if (activePreviewId) {
                                                                                setClipSettings(prev => ({ ...prev, [activePreviewId]: { ...(prev[activePreviewId] || {}), selectedFilter: eff.id as any } }));
                                                                            }
                                                                        }}
                                                                        type="button"
                                                                        className={`relative flex flex-col items-center justify-center gap-1.5 h-[68px] rounded-xl border transition-all duration-200 group overflow-hidden ${
                                                                            isActive
                                                                                ? 'bg-purple-500/15 border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.22)] scale-[1.02]'
                                                                                : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07] hover:border-white/20'
                                                                        }`}
                                                                    >
                                                                        {eff.thumbnail && (
                                                                            <div className="absolute inset-0 w-full h-full pointer-events-none">
                                                                                <img src={eff.thumbnail} className="w-full h-full object-cover opacity-20 group-hover:opacity-35 transition-opacity duration-300" alt="" />
                                                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/85" />
                                                                            </div>
                                                                        )}
                                                                        <Icon size={16} className="relative z-10 transition-transform duration-200 group-hover:scale-110 text-purple-300" />
                                                                        <span className="relative z-10 text-[8px] font-bold uppercase tracking-wider text-center text-slate-300 truncate max-w-full px-1">
                                                                            {eff.name.replace(localFilterCategory + ' v', '').trim() || eff.name}
                                                                        </span>
                                                                    </button>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                </div>

                                                {/* Footer Action Bar */}
                                                <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedFilter('none');
                                                            setSelectedEffect('none');
                                                            setFilterIntensity(100);
                                                        }}
                                                        className="flex-1 py-1.5 rounded-lg bg-[#23242e] text-slate-300 border border-white/10 text-xs font-medium hover:bg-[#2c2d3a] transition-colors cursor-pointer text-center"
                                                    >
                                                        Reset
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const fi = filterIntensity, fp = selectedFilter;
                                                            setClipSettings(prev => {
                                                                const updated = { ...prev };
                                                                mediaItems.forEach(item => {
                                                                    updated[item?.id] = { ...(updated[item?.id] || {}), filterIntensity: fi, filterPreset: fp };
                                                                });
                                                                return updated;
                                                            });
                                                        }}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#23242e] text-white border border-white/10 text-xs font-medium hover:bg-[#2c2d3a] transition-colors cursor-pointer"
                                                    >
                                                        <Check className="w-3.5 h-3.5 text-white" />
                                                        <span>Apply to all</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {colorSubTab === 'adjust' && (
                                            <div className="flex flex-col flex-1 space-y-0">
                                                <style>{`
                                                  .adj-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 3px; border-radius: 9999px; outline: none; cursor: pointer; }
                                                  .adj-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.5); cursor: pointer; }
                                                  .hsl-hue { background: linear-gradient(to right, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000); }
                                                  .hsl-sat { background: linear-gradient(to right, #808080, #ff0000); }
                                                  .hsl-light { background: linear-gradient(to right, #000000, #808080, #ffffff); }
                                                `}</style>

                                                {/* Ã¢â€â‚¬Ã¢â€â‚¬ 10 Sliders Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                                {([
                                                  { label: 'Brightness', icon: 'Ã¢Ëœâ‚¬', val: brightness, set: (v: number) => setBrightness(v), min: 0.5, max: 1.5, step: 0.01, display: Math.round((brightness - 1) * 100) },
                                                  { label: 'Saturation', icon: 'Ã°Å¸Å½Â¨', val: saturation, set: (v: number) => setSaturation(v), min: 0, max: 3, step: 0.01, display: Math.round((saturation - 1) * 100) },
                                                  { label: 'Vibrance', icon: 'Ã°Å¸Å’Ë†', val: adjVibrance, set: setAdjVibrance, min: -100, max: 100, step: 1, display: adjVibrance },
                                                  { label: 'Temperature', icon: 'Ã°Å¸Å’Â¡', val: adjTemperature, set: setAdjTemperature, min: -100, max: 100, step: 1, display: adjTemperature },
                                                  { label: 'Vignette', icon: 'Ã¢â€”Å½', val: adjVignette, set: setAdjVignette, min: 0, max: 100, step: 1, display: adjVignette },
                                                  { label: 'Sharpen', icon: 'Ã¢â€“Â³', val: adjSharpen, set: setAdjSharpen, min: 0, max: 100, step: 1, display: adjSharpen },
                                                  { label: 'Hue', icon: 'Ã°Å¸â€™Â§', val: adjHue, set: setAdjHue, min: -180, max: 180, step: 1, display: adjHue },
                                                  { label: 'Highlights', icon: 'Ã¢â€”â€˜', val: adjHighlights, set: setAdjHighlights, min: -100, max: 100, step: 1, display: adjHighlights },
                                                  { label: 'Shadows', icon: 'Ã¢â€”Â', val: adjShadows, set: setAdjShadows, min: -100, max: 100, step: 1, display: adjShadows },
                                                  { label: 'Noise Reduction', icon: 'Ã¢â€“Â¦', val: adjNoiseReduction, set: setAdjNoiseReduction, min: 0, max: 100, step: 1, display: adjNoiseReduction },
                                                ] as {label:string;icon:string;val:number;set:(v:number)=>void;min:number;max:number;step:number;display:number}[]).map(({ label, icon, val, set, min, max, step, display }) => (
                                                    <div key={label} className="py-2.5 border-b border-white/[0.04] last:border-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-base leading-none w-5 text-center select-none">{icon}</span>
                                                                <span className="text-xs font-medium text-slate-200">{label}</span>
                                                            </div>
                                                            <span className="text-[11px] font-mono text-slate-400 min-w-[24px] text-right">{display}</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min={min} max={max} step={step} value={val}
                                                            onChange={e => set(Number(e.target.value))}
                                                            className="adj-slider"
                                                            style={{ background: `linear-gradient(to right, rgba(255,255,255,0.7) ${((val - min)/(max-min))*100}%, rgba(255,255,255,0.15) ${((val - min)/(max-min))*100}%)` }}
                                                        />
                                                    </div>
                                                ))}

                                                {/* Ã¢â€â‚¬Ã¢â€â‚¬ Color Wheel Selector Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                                <div className="pt-3 pb-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {[
                                                          { color: '#ef4444', hue: 0 },
                                                          { color: '#f97316', hue: 30 },
                                                          { color: '#eab308', hue: 60 },
                                                          { color: '#22c55e', hue: 120 },
                                                          { color: '#06b6d4', hue: 180 },
                                                          { color: '#3b82f6', hue: 220 },
                                                          { color: '#8b5cf6', hue: 270 },
                                                          { color: '#ec4899', hue: 320 },
                                                        ].map(({ color, hue }, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => { setSelectedColorWheel(idx); setHslHue(hue); }}
                                                                className="transition-all duration-150"
                                                                style={{ width: 22, height: 22, borderRadius: '50%', background: color, border: selectedColorWheel === idx ? '2px solid white' : '2px solid transparent', boxShadow: selectedColorWheel === idx ? `0 0 0 1px ${color}` : 'none' }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Ã¢â€â‚¬Ã¢â€â‚¬ HSL Sliders Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                                <div className="space-y-3 pt-1">
                                                    {/* Hue */}
                                                    <div>
                                                        <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                                                            <span>Hue</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] font-mono text-slate-400">{hslHue}</span>
                                                                <input type="number" value={hslHue} onChange={e => setHslHue(Number(e.target.value))} className="w-14 bg-[#1a1b26] border border-white/10 rounded text-xs font-mono text-white text-center py-0.5 px-1" />
                                                            </div>
                                                        </div>
                                                        <input type="range" min={-180} max={180} step={1} value={hslHue} onChange={e => setHslHue(Number(e.target.value))}
                                                            className="adj-slider hsl-hue" />
                                                    </div>
                                                    {/* Saturation */}
                                                    <div>
                                                        <div className="flex justify-between text-xs font-medium text-red-400 mb-1.5">
                                                            <span>Saturation</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] font-mono text-slate-400">{hslSaturation}</span>
                                                                <input type="number" value={hslSaturation} onChange={e => setHslSaturation(Number(e.target.value))} className="w-14 bg-[#1a1b26] border border-white/10 rounded text-xs font-mono text-white text-center py-0.5 px-1" />
                                                            </div>
                                                        </div>
                                                        <input type="range" min={-100} max={100} step={1} value={hslSaturation} onChange={e => setHslSaturation(Number(e.target.value))}
                                                            className="adj-slider hsl-sat" />
                                                    </div>
                                                    {/* Lightness */}
                                                    <div>
                                                        <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                                                            <span>Lightness</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] font-mono text-slate-400">{hslLightness}</span>
                                                                <input type="number" value={hslLightness} onChange={e => setHslLightness(Number(e.target.value))} className="w-14 bg-[#1a1b26] border border-white/10 rounded text-xs font-mono text-white text-center py-0.5 px-1" />
                                                            </div>
                                                        </div>
                                                        <input type="range" min={-100} max={100} step={1} value={hslLightness} onChange={e => setHslLightness(Number(e.target.value))}
                                                            className="adj-slider hsl-light" />
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="pt-4 flex items-center justify-between gap-2">
                                                    <button type="button" onClick={() => {
                                                        setBrightness(1.0); setSaturation(1.0);
                                                        setAdjVibrance(0); setAdjTemperature(0); setAdjVignette(0); setAdjSharpen(0);
                                                        setAdjHue(0); setAdjHighlights(0); setAdjShadows(0); setAdjNoiseReduction(0);
                                                        setHslHue(0); setHslSaturation(0); setHslLightness(0);
                                                    }} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#23242e] text-slate-300 border border-white/10 text-xs font-medium hover:bg-[#2c2d3a] transition-colors cursor-pointer">
                                                        Reset
                                                    </button>
                                                    <button type="button" onClick={() => {
                                                        const b = brightness, s = saturation;
                                                        setClipSettings(prev => {
                                                            const updated = { ...prev };
                                                            mediaItems.forEach(item => { updated[item?.id] = { ...(updated[item?.id] || {}), brightness: b, saturation: s }; });
                                                            return updated;
                                                        });
                                                    }} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#23242e] text-white border border-white/10 text-xs font-medium hover:bg-[#2c2d3a] transition-colors cursor-pointer">
                                                        <Check className="w-3.5 h-3.5" />
                                                        <span>Apply to all</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Ã¢â€â‚¬Ã¢â€â‚¬ SPEED TAB Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                {inspectorTab === 'speed' && (
                                    <div className="flex flex-col flex-1 space-y-4">
                                        <div className="flex justify-between text-xs font-medium text-slate-300">
                                            <span>Speed Multiplier</span>
                                            <span className="text-[#EAB308] font-bold font-mono">{speedValue.toFixed(2)}x</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.25"
                                            max="4.00"
                                            step="0.05"
                                            value={speedValue}
                                            onChange={e => setSpeedValue(Number(e.target.value))}
                                            className="w-full accent-white h-1 bg-white/20 rounded-full cursor-pointer"
                                        />
                                        <div className="grid grid-cols-4 gap-2">
                                            {[0.5, 1.0, 1.5, 2.0].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setSpeedValue(s)}
                                                    className={`py-1 rounded text-xs font-mono font-bold border transition-colors ${speedValue === s ? 'bg-purple-500/20 text-purple-300 border-purple-500' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
                                                >
                                                    {s}x
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-auto pt-6">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const spd = speedValue;
                                                    setClipSettings(prev => {
                                                        const updated = { ...prev };
                                                        mediaItems.forEach(item => {
                                                            updated[item?.id] = { ...(updated[item?.id] || {}), speedValue: spd };
                                                        });
                                                        return updated;
                                                    });
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#23242e] text-slate-200 border border-white/10 text-xs font-medium hover:bg-[#2c2d3a] transition-colors cursor-pointer"
                                            >
                                                <Check className="w-3.5 h-3.5 text-white" />
                                                <span>Apply to all</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Ã¢â€â‚¬Ã¢â€â‚¬ AUDIO TAB Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                {inspectorTab === 'audio' && (
                                    <div className="flex flex-col flex-1 space-y-4">
                                        <div className="flex justify-between text-xs font-medium text-slate-300">
                                            <span>Volume Level</span>
                                            <span className="text-[#EAB308] font-bold font-mono">{(volumeLevel * 100).toFixed(0)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.05"
                                            value={volumeLevel}
                                            onChange={e => setVolumeLevel(Number(e.target.value))}
                                            className="w-full accent-white h-1 bg-white/20 rounded-full cursor-pointer"
                                        />
                                        <div className="flex items-center justify-between py-2 border-t border-b border-white/5">
                                            <span className="text-xs font-medium text-slate-300">Mute Channel</span>
                                            <input
                                                type="checkbox"
                                                checked={isMuted}
                                                onChange={e => setIsMuted(e.target.checked)}
                                                className="rounded border-white/20 accent-purple-500 bg-black/40 w-4 h-4 cursor-pointer"
                                            />
                                        </div>

                                        <div className="mt-auto pt-6">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const vol = volumeLevel, m = isMuted;
                                                    setClipSettings(prev => {
                                                        const updated = { ...prev };
                                                        mediaItems.forEach(item => {
                                                            updated[item?.id] = { ...(updated[item?.id] || {}), volumeLevel: vol, isMuted: m };
                                                        });
                                                        return updated;
                                                    });
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#23242e] text-slate-200 border border-white/10 text-xs font-medium hover:bg-[#2c2d3a] transition-colors cursor-pointer"
                                            >
                                                <Check className="w-3.5 h-3.5 text-white" />
                                                <span>Apply to all</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Ã¢â€â‚¬Ã¢â€â‚¬ ANIMATION TAB Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                {inspectorTab === 'animation' && (
                                    <div className="flex flex-col flex-1 space-y-4">
                                        <span className="text-xs font-medium text-slate-300">Motion Pattern</span>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(['none', 'zoom-in', 'zoom-out', 'pulse'] as const).map(mode => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setKeyframeMode(mode)}
                                                    className={`py-3 text-xs font-bold uppercase rounded-lg border transition-colors ${keyframeMode === mode ? 'bg-purple-500/20 text-purple-300 border-purple-500' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                        {keyframeMode !== 'none' && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-medium text-slate-300">
                                                    <span>Strength</span>
                                                    <span className="text-[#EAB308] font-bold font-mono">{(keyframeAmount * 100).toFixed(0)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1.0"
                                                    max="2.0"
                                                    step="0.05"
                                                    value={keyframeAmount}
                                                    onChange={e => setKeyframeAmount(Number(e.target.value))}
                                                    className="w-full accent-white h-1 bg-white/20 rounded-full cursor-pointer"
                                                />
                                            </div>
                                        )}

                                        <div className="mt-auto pt-6">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const km = keyframeMode, ka = keyframeAmount;
                                                    setClipSettings(prev => {
                                                        const updated = { ...prev };
                                                        mediaItems.forEach(item => {
                                                            updated[item?.id] = { ...(updated[item?.id] || {}), keyframeMode: km, keyframeAmount: ka };
                                                        });
                                                        return updated;
                                                    });
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#23242e] text-slate-200 border border-white/10 text-xs font-medium hover:bg-[#2c2d3a] transition-colors cursor-pointer"
                                            >
                                                <Check className="w-3.5 h-3.5 text-white" />
                                                <span>Apply to all</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Ã¢â€â‚¬Ã¢â€â‚¬ BG TAB Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                {inspectorTab === 'bg' && (
                                    <div className="flex flex-col flex-1 space-y-3">
                                        {/* Blur | Color Switcher */}
                                        <div className="flex bg-[#1a1b26] rounded-xl p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setBgSubTab('blur')}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                                    bgSubTab === 'blur' ? 'bg-[#2a2b3d] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                                }`}
                                            >
                                                Blur
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setBgSubTab('color')}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                                    bgSubTab === 'color' ? 'bg-[#2a2b3d] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                                }`}
                                            >
                                                Color
                                            </button>
                                        </div>

                                        {/* Ã¢â€â‚¬Ã¢â€â‚¬ BLUR SUB-TAB Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                        {bgSubTab === 'blur' && (
                                            <div className="flex flex-col space-y-4">
                                                <div>
                                                    <span className="text-xs font-medium text-slate-300">Styles</span>
                                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                                        {[
                                                            { id: 'none', label: 'None', isIcon: true },
                                                            { id: 'base', label: 'Base' },
                                                            { id: 'horizontal', label: 'Horizontal' },
                                                            { id: 'vertical', label: 'Vertical' },
                                                            { id: 'radioactive', label: 'Radioactive' },
                                                        ].map(style => (
                                                            <div key={style.id} className="flex flex-col items-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setBgBlurStyle(style.id)}
                                                                    className={`w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden border-2 transition-all ${
                                                                        bgBlurStyle === style.id ? 'border-[#EAB308]' : 'border-transparent'
                                                                    } bg-[#1a1b26]`}
                                                                    title={style.label}
                                                                >
                                                                    {style.isIcon ? (
                                                                        <div className="w-full h-full flex items-center justify-center bg-[#1a1b26]">
                                                                            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-slate-300" stroke="currentColor" strokeWidth="1.5">
                                                                                <circle cx="12" cy="12" r="10" />
                                                                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                                                            </svg>
                                                                        </div>
                                                                    ) : (
                                                                        activePreviewItem?.preview ? (
                                                                            <img 
                                                                                src={activePreviewItem.preview} 
                                                                                alt={style.label} 
                                                                                className={`w-full h-full object-cover scale-110 ${
                                                                                    style.id === 'base' ? 'blur-[4px]' :
                                                                                    style.id === 'horizontal' ? 'blur-[4px] scale-x-150' :
                                                                                    style.id === 'vertical' ? 'blur-[4px] scale-y-150' :
                                                                                    'blur-[4px] hue-rotate-90 saturate-200'
                                                                                }`} 
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full bg-[#23242e]" />
                                                                        )
                                                                    )}
                                                                </button>
                                                                <span className={`text-[10px] ${bgBlurStyle === style.id ? 'text-white' : 'text-slate-400'}`}>
                                                                    {style.label}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-1 mt-4">
                                                    <div className="flex justify-between text-xs font-medium text-slate-300">
                                                        <span>Blur</span>
                                                        <span className="text-[#EAB308] font-bold font-mono">{bgBlur}</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={bgBlur}
                                                        onChange={e => setBgBlur(Number(e.target.value))}
                                                        className="w-full accent-[#EAB308] h-1 bg-white/20 rounded-full cursor-pointer"
                                                    />
                                                    <div className="pt-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (activePreviewId) {
                                                                    setClipSettings((prev: any) => ({
                                                                        ...prev,
                                                                        [activePreviewId]: {
                                                                            ...(prev[activePreviewId] || {}),
                                                                            bgBlurStyle: bgBlurStyle,
                                                                            bgBlurAmount: bgBlur
                                                                        }
                                                                    }));
                                                                }
                                                            }}
                                                            className="w-full py-2 rounded-lg text-xs font-bold bg-[#EAB308] text-[#1a1b26] hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
                                                        >
                                                            Apply Style
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Ã¢â€â‚¬Ã¢â€â‚¬ COLOR SUB-TAB Ã¢â€â‚¬Ã¢â€â‚¬ */}
                                        {bgSubTab === 'color' && (
                                            <div className="flex flex-col space-y-3 overflow-y-auto max-h-[480px] custom-scrollbar pr-0.5">
                                                {/* Hex input */}
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-7 h-7 rounded border border-white/20 flex-none cursor-pointer"
                                                        style={{ backgroundColor: bgColorHex }}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={bgColorHex.replace('#', '').toUpperCase()}
                                                        onChange={e => {
                                                            const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                                                            if (v.length === 6) setBgColorHex('#' + v);
                                                        }}
                                                        className="flex-1 bg-[#1a1b26] border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-white/30"
                                                        maxLength={6}
                                                        placeholder="000000"
                                                    />
                                                </div>

                                                {/* Color Gradient Canvas */}
                                                <div className="relative w-full h-[110px] rounded-xl overflow-hidden cursor-crosshair border border-white/10 select-none"
                                                    style={{
                                                        background: `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, hsl(${bgHue},100%,50%))`
                                                    }}
                                                    onClick={e => {
                                                        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                                                        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                                                        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                                                        setBgSatPos({ x, y });
                                                        // compute hex from HSV
                                                        const s = x / 100;
                                                        const v = 1 - y / 100;
                                                        const h = bgHue / 360;
                                                        const i = Math.floor(h * 6);
                                                        const f = h * 6 - i;
                                                        const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
                                                        let r = 0, g = 0, b = 0;
                                                        switch (i % 6) {
                                                            case 0: r = v; g = t; b = p; break;
                                                            case 1: r = q; g = v; b = p; break;
                                                            case 2: r = p; g = v; b = t; break;
                                                            case 3: r = p; g = q; b = v; break;
                                                            case 4: r = t; g = p; b = v; break;
                                                            case 5: r = v; g = p; b = q; break;
                                                        }
                                                        const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
                                                        setBgColorHex('#' + toHex(r) + toHex(g) + toHex(b));
                                                    }}
                                                >
                                                    {/* Picker thumb */}
                                                    <div
                                                        className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
                                                        style={{ left: `${bgSatPos.x}%`, top: `${bgSatPos.y}%`, backgroundColor: bgColorHex }}
                                                    />
                                                </div>

                                                {/* Hue Slider */}
                                                <div className="relative w-full h-3 rounded-full overflow-hidden cursor-pointer border border-white/10"
                                                    style={{ background: 'linear-gradient(to right, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
                                                    onClick={e => {
                                                        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                                                        const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
                                                        setBgHue(h);
                                                    }}
                                                >
                                                    <div
                                                        className="absolute top-0 w-3 h-3 rounded-full bg-white border-2 border-white shadow -translate-x-1/2"
                                                        style={{ left: `${(bgHue / 360) * 100}%` }}
                                                    />
                                                </div>

                                                {/* RGB Inputs */}
                                                <div className="flex gap-2">
                                                    {(['R', 'G', 'B'] as const).map((ch, ci) => {
                                                        const hex = bgColorHex.replace('#', '');
                                                        const vals = [parseInt(hex.slice(0,2)||'0',16), parseInt(hex.slice(2,4)||'0',16), parseInt(hex.slice(4,6)||'0',16)];
                                                        return (
                                                            <div key={ch} className="flex-1 flex items-center gap-1 bg-[#1a1b26] rounded-lg px-2 py-1.5 border border-white/10">
                                                                <span className="text-[10px] font-bold text-slate-400">{ch}</span>
                                                                <input
                                                                    type="number"
                                                                    min={0} max={255}
                                                                    value={vals[ci]}
                                                                    onChange={e => {
                                                                        const nv = Math.max(0, Math.min(255, Number(e.target.value)));
                                                                        const newVals = [...vals]; newVals[ci] = nv;
                                                                        setBgColorHex('#' + newVals.map(n => n.toString(16).padStart(2,'0')).join(''));
                                                                    }}
                                                                    className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Swatches */}
                                                <div className="space-y-1.5">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {/* Add swatch button */}
                                                        <button
                                                            type="button"
                                                            className="w-6 h-6 rounded border border-dashed border-white/30 flex items-center justify-center text-slate-400 hover:text-white text-xs"
                                                            title="Add swatch"
                                                        >+</button>
                                                        {/* Active swatch */}
                                                        <div className="w-6 h-6 rounded border-2 border-[#EAB308]" style={{ backgroundColor: bgColorHex }} />
                                                        {/* Preset swatches */}
                                                        {[
                                                            '#ffffff','#e2e2e2','#ff4444','#ff8800','#a855f7','#ec4899',
                                                            '#d4b896','#b8a082','#8c8c8c','#6b6b8a','#a78bfa','#f472b6',
                                                            '#7c6f5a','#5a6b7a','#4a5568','#2d3748','#1a1b26','#000000',
                                                        ].map(c => (
                                                            <button
                                                                key={c}
                                                                type="button"
                                                                onClick={() => setBgColorHex(c)}
                                                                className={`w-6 h-6 rounded transition-transform hover:scale-110 border ${
                                                                    bgColorHex === c ? 'border-white scale-110' : 'border-white/10'
                                                                }`}
                                                                style={{ backgroundColor: c }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Gradient Section */}
                                                <div className="space-y-2">
                                                    <span className="text-xs font-medium text-slate-300">Gradient</span>
                                                    <div className="grid grid-cols-5 gap-1.5">
                                                        {[
                                                            'linear-gradient(135deg,#000,#fff)',
                                                            'linear-gradient(135deg,#1a1b26,#4a5568)',
                                                            'linear-gradient(135deg,#667eea,#764ba2)',
                                                            'linear-gradient(135deg,#f093fb,#f5576c)',
                                                            'linear-gradient(135deg,#4facfe,#00f2fe)',
                                                            'linear-gradient(135deg,#43e97b,#38f9d7)',
                                                            'linear-gradient(135deg,#fa709a,#fee140)',
                                                            'linear-gradient(135deg,#a18cd1,#fbc2eb)',
                                                            'linear-gradient(135deg,#ffecd2,#fcb69f)',
                                                            'linear-gradient(135deg,#ff9a9e,#fad0c4)',
                                                            'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
                                                            'linear-gradient(135deg,#d4fc79,#96e6a1)',
                                                            'linear-gradient(135deg,#30cfd0,#330867)',
                                                            'linear-gradient(135deg,#fd746c,#ff9068)',
                                                            'linear-gradient(135deg,#f7971e,#ffd200)',
                                                            'linear-gradient(135deg,#ee0979,#ff6a00)',
                                                        ].map((grad, gi) => (
                                                            <button
                                                                key={gi}
                                                                type="button"
                                                                title={`Gradient ${gi + 1}`}
                                                                onClick={() => {
                                                                    // extract first color from gradient for hex
                                                                    const m = grad.match(/#[0-9a-f]{6}/i);
                                                                    if (m) setBgColorHex(m[0]);
                                                                }}
                                                                className="h-9 rounded-lg border border-white/10 hover:border-white/40 hover:scale-105 transition-all cursor-pointer"
                                                                style={{ background: grad }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Apply button */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const color = bgColorHex;
                                                        setClipSettings(prev => {
                                                            const updated = { ...prev };
                                                            mediaItems.forEach(item => {
                                                                updated[item?.id] = { ...(updated[item?.id] || {}), backgroundColor: color };
                                                            });
                                                            return updated;
                                                        });
                                                    }}
                                                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#23242e] text-white border border-white/10 text-xs font-medium hover:bg-[#2c2d3a] transition-colors cursor-pointer mt-1"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>Apply to all</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>

                            {/* Hidden file input */}
                            <input
                                type="file"
                                ref={mediaInputRef}
                                multiple
                                accept="video/*,image/*"
                                onChange={handleMediaImport}
                                className="hidden"
                            />
                        </div>
                    </motion.aside>
                    )}

                </div>

                {/* Bottom Panel: Multitrack Timeline lanes and Audio Mixer */}
                {!isCropMode && (
                <div className={`${timelineSize === 'minimized' ? 'h-[120px]' :
                    timelineSize === 'maximized' ? 'h-[50vh]' : 'h-[38vh]'
                    } flex-none border-t border-white/10 bg-black/25 backdrop-blur-3xl flex flex-col overflow-hidden select-none transition-all duration-300`}>
                    {/* Timeline hub container */}
                    <div className="flex-1 overflow-hidden h-full px-4 pt-4">
                        <TimelineHub
                            onCropTrack={(trackId: string) => { 
                                const firstItem = mediaItems.find((m: any) => m.trackId === trackId) || libraryAssets.find((m: any) => m.trackId === trackId);
                                if (firstItem) setActivePreviewId(firstItem.id);
                                setIsCropMode(true); 
                            }}
                            session={session}
                            mediaItems={mediaItems}
                            getClipGlobalStart={getClipGlobalStart}
                            audioTracks={audioTracks}
                            setAudioTracks={setAudioTracks}
                            captions={captions}
                            currentCaption={currentCaption}
                            setCurrentCaption={setCurrentCaption}
                            handleTimelineClick={handleTimelineClick}
                            activePreviewId={activePreviewId}
                            setActivePreviewId={setActivePreviewId}
                            isPlaying={isPlaying}
                            setIsPlaying={setIsPlaying}
                            isMuted={isMuted}
                            setIsMuted={setIsMuted}
                            clipTrimRanges={clipTrimRanges}
                            setClipTrimRanges={setClipTrimRanges}
                            getTrimRangeForItem={getTrimRangeForItem}
                            videoRef={videoRef}
                            handleAddAudio={handleAddAudio}
                            handleAddVideo={() => mediaInputRef.current?.click()}
                            handleAddImage={() => mediaInputRef.current?.click()}
                            handleReorderClips={handleReorderClips}
                            handleDeleteClip={handleDeleteClip}
                            getMediaDuration={getMediaDuration}
                            setMediaItems={setMediaItems}
                            saveToUndo={saveToUndo}
                            timelineSize={timelineSize}
                            setTimelineSize={setTimelineSize}
                            overlayTextStylePreset={overlayTextStylePreset}
                            overlayTextStylePresetCss={getOverlayTextStylePresetCss(overlayTextStylePreset)}
                            extractingAudio={extractingAudio}
                            setExtractingAudio={setExtractingAudio}
                            audioError={audioError}
                            setAudioError={setAudioError}
                            showReadLine={showReadLine}
                            setShowReadLine={setShowReadLine}
                            selectPreviewWithTransition={selectPreviewWithTransition}
                            handleAddAssetToTimeline={handleAddAssetToTimeline}
                            clipTransitions={clipTransitions}
                            setClipTransitions={setClipTransitions}
                            clipStartOverrides={clipStartOverrides}
                            setClipStartOverrides={setClipStartOverrides}
                            clipTrackOverrides={clipTrackOverrides}
                            setClipTrackOverrides={setClipTrackOverrides}
                            clipNameOverrides={clipNameOverrides}
                            setClipNameOverrides={setClipNameOverrides}
                            clipLockedStates={clipLockedStates}
                            setClipLockedStates={setClipLockedStates}
                            clipSettings={clipSettings}
                            setClipSettings={setClipSettings}
                            setLeftTab={setLeftTab}
                            setActiveTool={setActiveTool}
                            undo={undo}
                            redo={redo}
                            canUndo={canUndo}
                            canRedo={canRedo}
                        />
                    </div>
                    {/* BOTTOM TOOLBAR: CapCut 14-Icon Toolbar matching screenshot */}
                    <div className="w-full shrink-0 border-t border-white/10 flex items-center justify-center gap-3 overflow-x-auto px-6 py-2 no-scrollbar bg-[#0c0d15]">
                        {/* Group 1: Canvas, FX Effects, Audio, Text, Adjust */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsDurationOpen(true)}
                                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="Duration & Timing"
                            >
                                <Square className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setLeftTab('effects')}
                                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="FX Effects"
                            >
                                <Sparkles className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLeftTab('audio'); setInspectorTab('audio'); }}
                                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="Audio"
                            >
                                <Music className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => openFadeEditor(activePreviewId!)}
                                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="Fade In & Fade Out"
                            >
                                <svg viewBox="0 0 22 22" fill="none" className="w-5 h-5" stroke="currentColor">
                                    <rect x="3.5" y="8" width="2" height="6" rx="1" fill="currentColor" opacity="0.4" />
                                    <rect x="7" y="5.5" width="2" height="11" rx="1" fill="currentColor" opacity="0.6" />
                                    <rect x="10.5" y="3.5" width="2" height="15" rx="1" fill="currentColor" opacity="1" />
                                    <rect x="14" y="5.5" width="2" height="11" rx="1" fill="currentColor" opacity="0.6" />
                                    <rect x="17.5" y="8" width="2" height="6" rx="1" fill="currentColor" opacity="0.4" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLeftTab('titles'); setActiveTool('text-tool'); }}
                                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="Text"
                            >
                                <Type className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAutoCaptionOpen(true)}
                                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="Auto Audio-Caption Conversion"
                            >
                                <svg viewBox="0 0 22 22" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M4 7V5a1 1 0 0 1 1-1h2" strokeLinecap="round" />
                                    <path d="M15 4h2a1 1 0 0 1 1 1v2" strokeLinecap="round" />
                                    <path d="M4 15v2a1 1 0 0 0 1 1h2" strokeLinecap="round" />
                                    <path d="M15 18h2a1 1 0 0 0 1-1v-2" strokeLinecap="round" />
                                    <path d="M11 6.5L7.5 15.5M11 6.5L14.5 15.5M8.5 13h5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        {/* Divider 1 */}
                        <div className="w-px h-5 bg-white/20 shrink-0 mx-1" />

                        {/* Group 2: Overlay, Split, Freeze */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => mediaInputRef.current?.click()}
                                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="Add Overlay Track"
                            >
                                <Shuffle className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => window.dispatchEvent(new CustomEvent('trigger-timeline-split'))}
                                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="Split Clip"
                            >
                                <Scissors className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => window.dispatchEvent(new CustomEvent('trigger-timeline-freeze'))}
                                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="Freeze Frame"
                            >
                                <FreezeIcon className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => copyActiveClip()}
                                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="Duplicate Clip"
                            >
                                <LucideIcons.CopyPlus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Divider 2 */}
                        <div className="w-px h-5 bg-white/20 shrink-0 mx-1" />

                        {/* Group 3: Crop, Rotate, Mirror, Flip, Background */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCropMode(true);
                                }}
                                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="Crop & Scale"
                            >
                                <Crop className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setZoomToolAmount(1);
                                    setZoomToolAmountX(1);
                                    setZoomToolAmountY(1);
                                    setPosX(0);
                                    setPosY(0);
                                    if (activePreviewId) {
                                        setClipSettings(prev => {
                                            const updated = {
                                                ...prev,
                                                [activePreviewId]: {
                                                    ...prev[activePreviewId],
                                                    fill: false, // Fit = object-contain (shows entire video frame without cropping)
                                                }
                                            };
                                            saveToUndo(mediaItems, undefined, undefined, undefined, undefined, undefined, undefined, updated);
                                            return updated;
                                        });
                                    }
                                }}
                                className={`p-2 rounded-lg transition-colors cursor-pointer ${activePreviewId && clipSettings[activePreviewId]?.fill === false ? 'text-[#EAB308] bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                                title="Fit to Screen (Show Full Frame)"
                            >
                                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="4" opacity="0.4" />
                                    <path d="M8 10V8h2" />
                                    <path d="M16 10V8h-2" />
                                    <path d="M8 14v2h2" />
                                    <path d="M16 14v2h-2" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRotationDegrees(prev => (prev + 90) % 360)}
                                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="Rotate 90Ã‚Â°"
                            >
                                <RotateCw className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFlipH(prev => !prev);
                                    if (activePreviewId) {
                                        setClipSettings(prev => {
                                            const updated = {
                                                ...prev,
                                                [activePreviewId]: { ...prev[activePreviewId], mirror: !prev[activePreviewId]?.mirror }
                                            };
                                            saveToUndo(mediaItems, undefined, undefined, undefined, undefined, undefined, undefined, updated);
                                            return updated;
                                        });
                                    }
                                }}
                                className={`p-2 rounded-lg transition-colors cursor-pointer ${flipH || (activePreviewId && clipSettings[activePreviewId]?.mirror) ? 'text-[#EAB308] bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                                title="Mirror (Horizontal Flip)"
                            >
                                <svg viewBox="0 0 22 22" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6">
                                    <line x1="11" y1="3" x2="11" y2="19" strokeLinecap="round" strokeDasharray="2 2" opacity="0.5" />
                                    <path d="M4 6h4.5v10H4l-1.5-2V8L4 6z" fill="currentColor" fillOpacity="0.2" strokeLinejoin="round" />
                                    <path d="M18 6h-4.5v10H18l1.5-2V8L18 6z" strokeDasharray="2 2" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFlipV(prev => !prev);
                                    if (activePreviewId) {
                                        setClipSettings(prev => {
                                            const updated = {
                                                ...prev,
                                                [activePreviewId]: { ...prev[activePreviewId], flip: !prev[activePreviewId]?.flip }
                                            };
                                            saveToUndo(mediaItems, undefined, undefined, undefined, undefined, undefined, undefined, updated);
                                            return updated;
                                        });
                                    }
                                }}
                                className={`p-2 rounded-lg transition-colors cursor-pointer ${flipV || (activePreviewId && clipSettings[activePreviewId]?.flip) ? 'text-[#EAB308] bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                                title="Flip Vertical"
                            >
                                <svg viewBox="0 0 22 22" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.6">
                                    <line x1="3" y1="11" x2="19" y2="11" strokeLinecap="round" strokeDasharray="2 2" opacity="0.5" />
                                    <path d="M6 4v4.5h10V4l-2-1.5H8L6 4z" fill="currentColor" fillOpacity="0.2" strokeLinejoin="round" />
                                    <path d="M6 18v-4.5h10V18l-2 1.5H8L6 18z" strokeDasharray="2 2" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                )}
            </main>



            {/* Hidden file input for Replace clip */}
            <input
                ref={replaceInputRef}
                type="file"
                accept="video/*,image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReplaceClip(file);
                    // Reset so same file can be re-selected
                    e.target.value = '';
                }}
            />

            <PremiumModal
                open={isPremiumModalOpen}
                onOpenChange={setIsPremiumModalOpen}
                feature={premiumFeature}
            />

            <CustomRatioModal
                open={isCustomFrameOpen}
                onOpenChange={setIsCustomFrameOpen}
                currentWidth={aspectRatio.width}
                currentHeight={aspectRatio.height}
                onApply={applyAspectRatio}
            />
            {/* Music Picker Modal */}
            <MusicPickerModal
                isOpen={isMusicPickerOpen}
                onClose={() => setIsMusicPickerOpen(false)}
                videoDuration={Math.max(...mediaItems.map(m => m.duration), 10)}
            />

            {/* Transition Editor Bottom Panel (VN Style) */}
            {activeTransitionTargetId && activeTransitionNextId && (
                <TransitionEditorBottomPanel
                    targetId={activeTransitionTargetId}
                    nextId={activeTransitionNextId}
                    onClose={() => {
                        setActiveTransitionTargetId(null);
                        setActiveTransitionNextId(null);
                    }}
                    clipTransitions={clipTransitions}
                    setClipTransitions={setClipTransitions}
                />
            )}

            {/* Cutout Panel Drawer */}
            {activeTool === 'cutout' && activePreviewId && activePreviewItem && (
                <CutoutPanel
                    clipId={activePreviewId}
                    clipType={activePreviewItem.type as 'video' | 'image'}
                    clipPreviewUrl={activePreviewItem.preview || ''}
                    clipFile={activePreviewItem.file || null}
                    cutoutSettings={clipSettings[activePreviewId]?.cutout}
                    onChange={(settings) => {
                        setClipSettings((prev: any) => ({
                            ...prev,
                            [activePreviewId]: {
                                ...prev[activePreviewId],
                                cutout: settings
                            }
                        }));
                    }}
                    onClose={() => setActiveTool(null)}
                    isProcessing={isCutoutProcessing}
                    error={cutoutError}
                    onTriggerSegmentation={() => handleTriggerCutoutSegmentation(activePreviewId)}
                />
            )}

            {/* Ã¢â€â‚¬Ã¢â€â‚¬ AUTO AUDIO-CAPTION CONVERSION MODAL Ã¢â€â‚¬Ã¢â€â‚¬ */}
            <AnimatePresence>
                {isAutoCaptionOpen && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[400] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.25 }}
                            className="bg-[#1c1d29] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col relative select-none"
                        >
                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={() => setIsAutoCaptionOpen(false)}
                                className="absolute top-5 left-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Modal Title */}
                            <h3 className="text-center font-bold text-base text-white tracking-tight mb-7">
                                Auto Audio-Caption Conversion
                            </h3>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                {/* Row 1: Language */}
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-200">Language</label>
                                    <select
                                        value={autoCaptionLang}
                                        onChange={(e) => setAutoCaptionLang(e.target.value)}
                                        className="bg-[#292a3a] border border-white/10 text-white text-xs font-semibold rounded-xl px-4 py-2.5 w-40 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23AAAAAA%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:9px_9px] bg-[right_12px_center] bg-no-repeat pr-8"
                                    >
                                        <option value="Auto">Auto</option>
                                        <option value="English">English</option>
                                        <option value="Spanish">Spanish</option>
                                        <option value="French">French</option>
                                        <option value="German">German</option>
                                        <option value="Japanese">Japanese</option>
                                        <option value="Chinese">Chinese</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Portuguese">Portuguese</option>
                                        <option value="Italian">Italian</option>
                                        <option value="Russian">Russian</option>
                                        <option value="Arabic">Arabic</option>
                                    </select>
                                </div>

                                {/* Row 2: Conversion Mode */}
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-200">Conversion mode</label>
                                    <select
                                        value={autoCaptionMode}
                                        onChange={(e) => setAutoCaptionMode(e.target.value)}
                                        className="bg-[#292a3a] border border-white/10 text-white text-xs font-semibold rounded-xl px-4 py-2.5 w-40 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23AAAAAA%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:9px_9px] bg-[right_12px_center] bg-no-repeat pr-8"
                                    >
                                        <option value="Tiny">Tiny</option>
                                        <option value="Base">Base</option>
                                        <option value="Small">Small</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Large">Large</option>
                                        <option value="Turbo">Turbo</option>
                                    </select>
                                </div>
                            </div>

                            {/* Convert Button */}
                            <button
                                type="button"
                                disabled={isConvertingCaption}
                                onClick={() => {
                                    setIsConvertingCaption(true);
                                    setTimeout(() => {
                                        setCaptions((prev: any) => [
                                            ...prev,
                                            {
                                                id: `cap-${Date.now()}-1`,
                                                startTime: 0.5,
                                                endTime: 3.5,
                                                text: "Welcome to this video tutorial!",
                                            },
                                            {
                                                id: `cap-${Date.now()}-2`,
                                                startTime: 4.0,
                                                endTime: 7.5,
                                                text: "Automatically generated captions are active.",
                                            }
                                        ]);
                                        setIsConvertingCaption(false);
                                        setIsAutoCaptionOpen(false);
                                    }, 1200);
                                }}
                                className="w-full bg-[#0066FF] hover:bg-[#0052CC] active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all cursor-pointer text-sm font-semibold tracking-wide text-center flex items-center justify-center mt-7 disabled:opacity-60"
                            >
                                {isConvertingCaption ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Converting...</span>
                                    </div>
                                ) : (
                                    <span>Convert</span>
                                )}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Ã¢â€â‚¬Ã¢â€â‚¬ FADE OVERLAY BOTTOM DRAWER Ã¢â€â‚¬Ã¢â€â‚¬ */}
            <AnimatePresence>
                {isFadeOpen && (() => {
                    const activeFadeItem = activePreviewId ? mediaItems.find(i => i?.id === activePreviewId) : null;
                    const trim = activeFadeItem ? getTrimRangeForItem(activeFadeItem.id, activeFadeItem.duration) : { start: 0, end: 15 };
                    const fadeEffDur = Math.max(0.1, trim.end - trim.start);

                    const handleFadeInChange = (val: number) => {
                        const maxAllowed = fadeEffDur - fadeOutVal;
                        setFadeInVal(Math.min(val, maxAllowed));
                    };

                    const handleFadeOutChange = (val: number) => {
                        const maxAllowed = fadeEffDur - fadeInVal;
                        setFadeOutVal(Math.min(val, maxAllowed));
                    };

                    const handleApplyToAll = () => {
                        const newSettings = { ...clipSettings };
                        mediaItems.filter(i => i.type === 'video' || (i.type as string) === 'audio').forEach(item => {
                            newSettings[item?.id] = {
                                ...(newSettings[item?.id] || {}),
                                fadeIn: fadeInVal,
                                fadeOut: fadeOutVal
                            };
                        });
                        setClipSettings(newSettings);
                        setIsFadeOpen(false);
                    };

                    const handleCancel = () => {
                        setFadeInVal(fadeOriginalSettingsRef.current.fadeIn);
                        setFadeOutVal(fadeOriginalSettingsRef.current.fadeOut);
                        setIsFadeOpen(false);
                    };

                    const handleConfirm = () => {
                        if (activePreviewId) {
                            setClipSettings((prev: any) => ({
                                ...prev,
                                [activePreviewId]: {
                                    ...prev[activePreviewId],
                                    fadeIn: fadeInVal,
                                    fadeOut: fadeOutVal
                                }
                            }));
                        }
                        setIsFadeOpen(false);
                    };

                    const handlePlayFade = () => {
                        if (!activePreviewId || !videoRef.current) return;
                        if (isPlaying) {
                            togglePlay();
                        } else {
                            videoRef.current.currentTime = trim.start;
                            togglePlay();
                        }
                    };

                    const handleFadeDrag = (e: React.PointerEvent, isFadeIn: boolean) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const startX = e.clientX;
                        const initialFadeIn = fadeInVal;
                        const initialFadeOut = fadeOutVal;
                        const containerWidth = e.currentTarget.parentElement?.clientWidth || 300;

                        setIsPlaying(false);
                        if (videoRef.current) {
                            videoRef.current.pause();
                        }

                        const onPointerMove = (moveEv: PointerEvent) => {
                            const deltaSec = ((moveEv.clientX - startX) / containerWidth) * fadeEffDur;
                            if (isFadeIn) {
                                const newVal = Math.max(0, Math.min(fadeEffDur - fadeOutVal, initialFadeIn + deltaSec));
                                setFadeInVal(newVal);
                            } else {
                                const newVal = Math.max(0, Math.min(fadeEffDur - fadeInVal, initialFadeOut - deltaSec));
                                setFadeOutVal(newVal);
                            }
                        };

                        const onPointerUp = () => {
                            window.removeEventListener('pointermove', onPointerMove);
                            window.removeEventListener('pointerup', onPointerUp);
                        };

                        window.addEventListener('pointermove', onPointerMove);
                        window.addEventListener('pointerup', onPointerUp);
                    };

                    return (
                        <motion.div
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="fixed bottom-0 inset-x-0 bg-[#161720]/95 backdrop-blur-2xl border-t border-white/10 z-[300] flex flex-col p-4 shadow-2xl space-y-4 select-none max-w-5xl mx-auto rounded-t-2xl"
                        >
                            {/* Header */}
                            <h3 className="text-center font-bold text-sm text-white tracking-wide">
                                Fade
                            </h3>

                            {/* Audio Waveform & Ruler Display Area */}
                            <div className="relative w-full h-24 bg-[#0d0e14] rounded-xl border border-white/10 overflow-hidden flex flex-col justify-between p-2 shadow-inner">
                                {/* Time Ruler based on effDur */}
                                <div className="flex items-center justify-between px-2 text-[10px] font-mono text-slate-500 border-b border-white/5 pb-1">
                                    {Array.from({ length: 11 }).map((_, idx) => (
                                        <span key={idx} className="relative">
                                            |
                                            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px]">
                                                {((idx / 10) * fadeEffDur).toFixed(1)}
                                            </span>
                                        </span>
                                    ))}
                                </div>

                                {/* Yellow Audio Waveform Canvas with Shaded Fade Area */}
                                <div className="relative w-full flex-1 mt-2 flex items-center bg-[#1a1b26] rounded overflow-hidden">
                                    {/* Simulated Waveform Bars */}
                                    <div className="w-full h-full flex items-center justify-between px-1 opacity-90">
                                        {Array.from({ length: 120 }).map((_, i) => {
                                            const h = Math.abs(Math.sin(i * 0.25) * 80 + Math.cos(i * 0.15) * 20);
                                            return (
                                                <div
                                                    key={i}
                                                    className="w-[2px] bg-[#EAB308] rounded-full"
                                                    style={{ height: `${Math.max(10, h)}%` }}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Fade In Curve Overlay */}
                                    {fadeInVal > 0 && (
                                        <svg
                                            className="absolute top-0 bottom-0 left-0 pointer-events-none z-10"
                                            style={{ width: `${(fadeInVal / fadeEffDur) * 100}%`, height: '100%' }}
                                            preserveAspectRatio="none"
                                            viewBox="0 0 100 100"
                                        >
                                            <path d="M 0 100 Q 0 0 100 0 L 0 0 Z" fill="rgba(0, 0, 0, 0.7)" />
                                            <path d="M 0 100 Q 0 0 100 0 L 100 100 Z" fill="rgba(234, 179, 8, 0.2)" />
                                            <path d="M 0 100 Q 0 0 100 0" fill="none" stroke="#EAB308" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                        </svg>
                                    )}

                                    {/* Fade Out Curve Overlay */}
                                    {fadeOutVal > 0 && (
                                        <svg
                                            className="absolute top-0 bottom-0 right-0 pointer-events-none z-10"
                                            style={{ width: `${(fadeOutVal / fadeEffDur) * 100}%`, height: '100%' }}
                                            preserveAspectRatio="none"
                                            viewBox="0 0 100 100"
                                        >
                                            <path d="M 0 0 Q 100 0 100 100 L 100 0 Z" fill="rgba(0, 0, 0, 0.7)" />
                                            <path d="M 0 0 Q 100 0 100 100 L 0 100 Z" fill="rgba(234, 179, 8, 0.2)" />
                                            <path d="M 0 0 Q 100 0 100 100" fill="none" stroke="#EAB308" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                        </svg>
                                    )}

                                    {/* Fade In Drag Handle */}
                                    <div
                                        className="absolute top-0 bottom-0 w-6 cursor-ew-resize z-20 flex items-start justify-center transform -translate-x-1/2 group"
                                        style={{ left: `${(fadeInVal / fadeEffDur) * 100}%` }}
                                        onPointerDown={(e) => handleFadeDrag(e, true)}
                                    >
                                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.5)] border border-white mt-1 group-hover:scale-125 transition-transform" />
                                    </div>

                                    {/* Fade Out Drag Handle */}
                                    <div
                                        className="absolute top-0 bottom-0 w-6 cursor-ew-resize z-20 flex items-start justify-center transform translate-x-1/2 group"
                                        style={{ right: `${(fadeOutVal / fadeEffDur) * 100}%` }}
                                        onPointerDown={(e) => handleFadeDrag(e, false)}
                                    >
                                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.5)] border border-white mt-1 group-hover:scale-125 transition-transform" />
                                    </div>

                                    {/* Playhead Vertical Line */}
                                    <div
                                        id="fade-playhead-line"
                                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] z-10 pointer-events-none"
                                        style={{ left: `0%` }}
                                    />

                                </div>
                            </div>

                            {/* Sliders Section */}
                            <div className="space-y-3 px-8 py-2">
                                {/* Fade in Slider */}
                                <div className="flex items-center justify-between gap-6">
                                    <span className="text-xs font-semibold text-slate-300 w-20 shrink-0">Fade in</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max={fadeEffDur}
                                        step="0.1"
                                        value={fadeInVal}
                                        onChange={(e) => handleFadeInChange(parseFloat(e.target.value))}
                                        className="flex-1 accent-[#EAB308] h-1.5 bg-white/10 rounded-lg cursor-pointer"
                                    />
                                    <span className="text-xs font-mono text-slate-300 w-12 text-right font-bold">{fadeInVal.toFixed(1)} s</span>
                                </div>

                                {/* Fade out Slider */}
                                <div className="flex items-center justify-between gap-6">
                                    <span className="text-xs font-semibold text-slate-300 w-20 shrink-0">Fade out</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max={fadeEffDur}
                                        step="0.1"
                                        value={fadeOutVal}
                                        onChange={(e) => handleFadeOutChange(parseFloat(e.target.value))}
                                        className="flex-1 accent-[#EAB308] h-1.5 bg-[#1e1f2b] rounded-lg cursor-pointer"
                                    />
                                    <span className="text-xs font-mono text-slate-300 w-12 text-right font-bold">{fadeOutVal.toFixed(1)} s</span>
                                </div>
                            </div>

                            {/* Footer Action Bar */}
                            <div className="flex items-center justify-center gap-12 pt-2 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                    title="Cancel"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <button
                                    type="button"
                                    onClick={handlePlayFade}
                                    className="p-2 text-white hover:scale-110 transition-transform cursor-pointer"
                                    title={isPlaying ? "Pause" : "Play"}
                                >
                                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleApplyToAll}
                                    className="flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
                                >
                                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                                    <span>Apply to all</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    className="p-2 text-white hover:scale-110 transition-transform cursor-pointer"
                                    title="Apply"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* Ã¢â€â‚¬Ã¢â€â‚¬ DURATION & TIMING BOTTOM OVERLAY DRAWER Ã¢â€â‚¬Ã¢â€â‚¬ */}
            <AnimatePresence>
                {isDurationOpen && (
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                        className="fixed bottom-0 inset-x-0 bg-[#0e0f18]/95 backdrop-blur-2xl border-t border-white/10 z-[300] flex flex-col p-4 shadow-2xl space-y-4 select-none max-w-4xl mx-auto rounded-t-2xl"
                    >
                        {/* Top Header Bar: Skip Back, Active Clip / Total Clips (e.g. 4/4), Skip Forward */}
                        <div className="flex items-center justify-between px-4">
                            <button
                                type="button"
                                onClick={() => setDurationActiveClipIdx(prev => Math.max(0, prev - 1))}
                                className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="Previous clip"
                            >
                                <SkipBack className="w-5 h-5" />
                            </button>

                            <span className="text-sm font-bold text-white tracking-widest font-mono">
                                {mediaItems.length > 0 ? `${durationActiveClipIdx + 1}/${mediaItems.length}` : '1/1'}
                            </span>

                            <button
                                type="button"
                                onClick={() => setDurationActiveClipIdx(prev => Math.min(mediaItems.length - 1, prev + 1))}
                                className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="Next clip"
                            >
                                <SkipForward className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Sub Header: Duration label + Total/Clip duration badge */}
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 px-2">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Duration</span>
                            <span className="bg-[#1e1f2b] border border-white/10 px-3 py-1 rounded-md text-xs font-mono text-slate-200 font-semibold shadow-inner">
                                {(mediaItems[durationActiveClipIdx]?.duration || (mediaItems.reduce((a, i) => a + (i.duration || 5), 0) || 35.33)).toFixed(2)}
                            </span>
                        </div>

                        {/* Filmstrip View with Drag-to-Trim */}
                        <div className="relative w-full h-20 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-2xl overflow-hidden select-none touch-none">
                            {(() => {
                                const activeItem = mediaItems[durationActiveClipIdx];
                                if (!activeItem) return null;

                                const dur = activeItem.duration || 5;
                                const trim = getTrimRangeForItem(activeItem.id, dur);
                                const isVideo = activeItem.type === 'video';
                                const previewUrl = activeItem.preview;
                                
                                const leftPct = (trim.start / dur) * 100;
                                const rightPct = 100 - ((trim.end / dur) * 100);

                                const handleDrag = (e: React.PointerEvent, isLeft: boolean) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const startX = e.clientX;
                                    const initialTrim = { ...trim };
                                    const containerWidth = e.currentTarget.parentElement?.parentElement?.clientWidth || 300;

                                    // Pause the video while dragging to prevent playback conflicts
                                    setIsPlaying(false);
                                    if (videoRef.current) {
                                        videoRef.current.pause();
                                    }

                                    const onPointerMove = (moveEv: PointerEvent) => {
                                        const deltaSec = ((moveEv.clientX - startX) / containerWidth) * dur;
                                        setClipTrimRanges(prev => {
                                            const next = { ...prev };
                                            const current = next[activeItem.id] || { start: 0, end: dur };
                                            if (isLeft) {
                                                const newStart = Math.max(0, Math.min((current.end || dur) - 0.1, initialTrim.start + deltaSec));
                                                next[activeItem.id] = { ...current, start: newStart };
                                                // Scrub video to the new start time
                                                if (videoRef.current) videoRef.current.currentTime = newStart;
                                            } else {
                                                const newEnd = Math.min(dur, Math.max((current.start || 0) + 0.1, initialTrim.end + deltaSec));
                                                next[activeItem.id] = { ...current, end: newEnd };
                                                // Scrub video to the new end time
                                                if (videoRef.current) videoRef.current.currentTime = newEnd;
                                            }
                                            return next;
                                        });
                                    };

                                    const onPointerUp = () => {
                                        window.removeEventListener('pointermove', onPointerMove);
                                        window.removeEventListener('pointerup', onPointerUp);
                                        setDurationPreset('Custom');
                                    };

                                    window.addEventListener('pointermove', onPointerMove);
                                    window.addEventListener('pointerup', onPointerUp);
                                };

                                return (
                                    <>
                                        {/* Background Filmstrip (Full Duration) */}
                                        <div className="absolute inset-y-1 inset-x-1 flex overflow-hidden rounded-lg opacity-50 bg-black">
                                            {Array.from({ length: 8 }).map((_, fi) => {
                                                const frameTime = (dur / 8) * fi;
                                                return (
                                                    <div key={fi} className="flex-1 h-full relative border-r border-white/5 shrink-0">
                                                        {previewUrl ? (
                                                            isVideo ? (
                                                                <video
                                                                    src={`${previewUrl}#t=${frameTime}`}
                                                                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                                                    muted preload="metadata"
                                                                    onLoadedMetadata={(e) => { e.currentTarget.currentTime = frameTime; }}
                                                                />
                                                            ) : (
                                                                <img src={previewUrl} alt="thumb" className="w-full h-full object-cover pointer-events-none" />
                                                            )
                                                        ) : (
                                                            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, hsl(${(fi * 65 + 30) % 360}, 60%, 25%) 0%, hsl(${(fi * 65 + 80) % 360}, 60%, 15%) 100%)` }} />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Unselected Dark Overlays */}
                                        <div className="absolute inset-y-0 left-0 bg-black/60 z-10 pointer-events-none" style={{ width: `${leftPct}%` }} />
                                        <div className="absolute inset-y-0 right-0 bg-black/60 z-10 pointer-events-none" style={{ width: `${rightPct}%` }} />

                                        {/* Selected Yellow Box with Handles */}
                                        <div 
                                            className="absolute inset-y-0 border-y-4 border-l-0 border-r-0 border-[#EAB308] z-20 pointer-events-none"
                                            style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
                                        >
                                            {/* Left Handle */}
                                            <div 
                                                className="absolute top-0 bottom-0 -left-1 w-5 bg-[#EAB308] flex items-center justify-center cursor-ew-resize pointer-events-auto rounded-l-md shadow-lg hover:bg-yellow-400 hover:scale-105 transition-transform"
                                                onPointerDown={(e) => handleDrag(e, true)}
                                            >
                                                <span className="text-black font-black text-xs pointer-events-none">&lt;</span>
                                            </div>
                                            
                                            {/* Right Handle */}
                                            <div 
                                                className="absolute top-0 bottom-0 -right-1 w-5 bg-[#EAB308] flex items-center justify-center cursor-ew-resize pointer-events-auto rounded-r-md shadow-lg hover:bg-yellow-400 hover:scale-105 transition-transform"
                                                onPointerDown={(e) => handleDrag(e, false)}
                                            >
                                                <span className="text-black font-black text-xs pointer-events-none">&gt;</span>
                                            </div>

                                            {/* White Playhead (restrained to yellow box) */}
                                            <div
                                                id="duration-playhead-line"
                                                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] z-30 pointer-events-none"
                                                style={{ left: `0%` }}
                                            >
                                                <div
                                                    id="duration-playhead-text"
                                                    className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1b1c28] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-lg border border-white/10 whitespace-nowrap"
                                                >
                                                    0.00 / 0.00
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Time Readout: e.g. 4.05 / 35.33 */}
                        <div className="text-center text-xs font-mono font-medium text-slate-400">
                            {(() => {
                                const activeItem = mediaItems[durationActiveClipIdx];
                                if (!activeItem) return "0.00 / 0.00";
                                const activeItemGlobalStart = getClipGlobalStart(activeItem.id);
                                const effDur = getEffectiveDurationForItem(activeItem);
                                const localTime = Math.max(0, globalCurrentTime - activeItemGlobalStart);
                                return `${localTime.toFixed(2)} / ${effDur.toFixed(2)}`;
                            })()}
                        </div>

                        {/* Preset Duration Chips */}
                        <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                            {(['Original', '0.1', '0.3', '1', '2.5', '3'] as const).map(preset => {
                                const isActive = durationPreset === preset;
                                return (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => {
                                            setDurationPreset(preset);
                                            if (preset !== 'Original') {
                                                const newSec = parseFloat(preset);
                                                if (!isNaN(newSec) && newSec > 0) {
                                                    setClipTrimRanges(prev => {
                                                        const next = { ...prev };
                                                        mediaItems.forEach(item => {
                                                            next[item?.id] = { start: 0, end: newSec };
                                                        });
                                                        return next;
                                                    });
                                                }
                                            } else {
                                                setClipTrimRanges(prev => {
                                                    const next = { ...prev };
                                                    mediaItems.forEach(item => {
                                                        if (next[item?.id]) delete next[item?.id];
                                                    });
                                                    return next;
                                                });
                                            }
                                        }}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            isActive
                                                ? 'bg-[#EAB308] text-black shadow-lg shadow-[#EAB308]/20 scale-105'
                                                : 'bg-[#1e1f2b] text-slate-300 hover:text-white hover:bg-[#282938] border border-white/5'
                                        }`}
                                    >
                                        {preset}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Bottom Action Footer: Cancel (Ã¢Å“â€¢), Play/Pause (Ã¢â€“Â¶), Confirm (Ã¢Å“â€œ) */}
                        <div className="flex items-center justify-around pt-3 border-t border-white/5">
                            <button
                                type="button"
                                onClick={() => setIsDurationOpen(false)}
                                className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="Cancel"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <button
                                type="button"
                                onClick={togglePlay}
                                className="p-2 text-white hover:scale-110 transition-transform cursor-pointer"
                                title={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsDurationOpen(false)}
                                className="p-2 text-white hover:scale-110 transition-transform cursor-pointer"
                                title="Apply"
                            >
                                <Check className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Styles overrides */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.2);
        }
      `}} />

        </div>
    );
});


 
