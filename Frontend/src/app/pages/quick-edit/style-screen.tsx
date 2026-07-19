import { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
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
    Pause,
    Undo2,
    Redo2,
    ScanLine,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    MessageSquare,
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
    FastForward
} from "lucide-react";
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
import { CommandAgentPanel } from "./components/CommandAgentPanel";

import { PremiumModal } from "@/components/premium-modal";
import { MusicPickerModal } from "@/components/editor/music-picker-modal";
import { TransitionEditorBottomPanel } from "./components/TransitionEditorBottomPanel";
import { MusicStrip } from "@/components/editor/music-strip";
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
    { id: 'es', label: 'Spanish', name: 'Español' },
    { id: 'fr', label: 'French', name: 'Français' },
    { id: 'de', label: 'German', name: 'Deutsch' },
    { id: 'it', label: 'Italian', name: 'Italiano' },
    { id: 'pt', label: 'Portuguese', name: 'Português' },
    { id: 'ja', label: 'Japanese', name: '日本語' },
    { id: 'zh', label: 'Chinese', name: '中文' },
    { id: 'ko', label: 'Korean', name: '한국어' },
    { id: 'ru', label: 'Russian', name: 'Русский' },
    { id: 'ar', label: 'Arabic', name: 'العربية' },
    { id: 'hi', label: 'Hindi', name: 'हिंदी' },
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
    { id: 'audio', icon: LucideIcons.Music, label: 'Audio' },
    { id: 'titles', icon: LucideIcons.Type, label: 'Titles' },
    { id: 'captions', icon: LucideIcons.Captions, label: 'Captions' },
    { id: 'transitions', icon: LucideIcons.Layers, label: 'Transitions' },
    { id: 'effects', icon: LucideIcons.Sparkle, label: 'Effects' },
    { id: 'filters', icon: LucideIcons.Palette, label: 'Filters' },
    { id: 'frames', icon: LucideIcons.Square, label: 'Frames' },
    { id: 'tools', icon: LucideIcons.Zap, label: 'Tools' },
];

const CLIP_TOOLS = [
    { id: 'replace', icon: LucideIcons.RefreshCw, label: 'Replace' },
    { id: 'keyframe', icon: LucideIcons.Diamond, label: 'Keyframe' },
    { id: 'split', icon: LucideIcons.Scissors, label: 'Split' },
    { id: 'cutout', icon: LucideIcons.UserMinus, label: 'Cutout' },
    { id: 'extract-audio', icon: LucideIcons.AudioWaveform, label: 'Extract Audio' },
    { id: 'denoise', icon: LucideIcons.Activity, label: 'Denoise' },
    { id: 'voice-effect', icon: LucideIcons.Mic, label: 'Voice Effect' },
    { id: 'auto-captions', icon: LucideIcons.MessageSquareQuote, label: 'Auto Captions' },
    { id: 'tts', icon: LucideIcons.MessageSquareText, label: 'TTS' },
    { id: 'mosaic', icon: LucideIcons.Grid, label: 'Mosaic' },
    { id: 'magnifier', icon: LucideIcons.ZoomIn, label: 'Magnifier' },
    { id: 'stories', icon: LucideIcons.LayoutList, label: 'Stories' },
    { id: 'reverse', icon: LucideIcons.RotateCcw, label: 'Reverse' },
    { id: 'freeze', icon: LucideIcons.Snowflake, label: 'Freeze' },
    { id: 'overlay-track', icon: LucideIcons.Layers, label: 'Overlay Track' },
    { id: 'fade', icon: LucideIcons.Activity, label: 'Fade' },
    { id: 'mirror', icon: LucideIcons.FlipHorizontal, label: 'Mirror' },
    { id: 'flip', icon: LucideIcons.FlipVertical, label: 'Flip' },
    { id: 'fill', icon: LucideIcons.Maximize, label: 'Fill' },
    { id: 'bg', icon: LucideIcons.Square, label: 'BG' },
    { id: 'border', icon: LucideIcons.SquareDashedBottom, label: 'Border' },
    { id: 'blur', icon: LucideIcons.Droplet, label: 'Blur' },
    { id: 'opacity', icon: LucideIcons.Eye, label: 'Opacity' },
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


/* ─────────────────── Filmora-Style Left Panel ─────────────────── */
const FilmoraLeftPanel = memo(({
    activePreviewId, clipTransitions, applyTransitionForActiveClip,
    selectedEffect, setSelectedEffect, selectedFilter, setSelectedFilter,
    activeTool, setActiveTool,
    /* tools panel props */
    velocitySpeed, setVelocitySpeed, motionBlurAmount, setMotionBlurAmount,
    shakeStrength, setShakeStrength, flashIntensity, setFlashIntensity,
    rgbSplitAmount, setRgbSplitAmount, smoothZoomAmount, setSmoothZoomAmount,
    filmGrainOpacity, setFilmGrainOpacity,
    overlayTextStylePreset, setOverlayTextStylePreset, getOverlayTextEffectForPreset,
    blurAmount, setBlurAmount, brightness, setBrightness, contrast, setContrast,
    saturation, setSaturation, slowMotionSpeed, setSlowMotionSpeed,
    glitchIntensity, setGlitchIntensity, animatedText, setAnimatedText,
    overlayText, setOverlayText, overlayFontId, setOverlayFontId,
    overlayFontSize, setOverlayFontSize, overlayColor, setOverlayColor,
    overlayPosX, setOverlayPosX, overlayPosY, setOverlayPosY,
    overlayBgEnabled, setOverlayBgEnabled, overlayBgColorHex, setOverlayBgColorHex,
    isTextPlacementMode, setIsTextPlacementMode,
    speedValue, setSpeedValue, activePreviewItem, getTrimRangeForItem,
    clipTrimRanges, setClipTrimRanges, rotationDegrees, setRotationDegrees,
    volumeLevel, setVolumeLevel, isMuted, setIsMuted,
    cropWidthPct, setCropWidthPct, cropHeightPct, setCropHeightPct,
    cropCenterX, setCropCenterX, cropCenterY, setCropCenterY,
    zoomToolAmount, setZoomToolAmount, keyframeMode, setKeyframeMode,
    keyframeAmount, setKeyframeAmount, videoRef,
    captions, setCaptions, currentCaption, setCurrentCaption,
    captionLanguage, setCaptionLanguage, captionStyle, setCaptionStyle,
    captionStylePreset, setCaptionStylePreset,
    isCaptionPlacementMode, setIsCaptionPlacementMode,
    detectSpeakers, setDetectSpeakers,
    handleAutoCaption, isAutoCapturing, autoCaptionStatus,
    proParams, setProParams,
    /* smart features + tools grid */
    aiOptions, toggleOption, copyActiveClip, setExpandedSections,
    /* aspect ratio */
    aspectRatio, applyAspectRatio, setIsCustomFrameOpen,
    saveToUndo, mediaItems,
    clipSettings, setClipSettings
}: any) => {
    const [leftTab, setLeftTab] = useState<'media' | 'titles' | 'captions' | 'transitions' | 'effects' | 'filters' | 'tools'>('transitions');
    const [localFilterCategory, setLocalFilterCategory] = useState('all');

    const leftTabs = [
        { id: 'media',       icon: Film,    label: 'Media'       },
        { id: 'titles',      icon: Type,    label: 'Titles'      },
        { id: 'transitions', icon: Layers,  label: 'Trans.'      },
        { id: 'effects',     icon: Sparkle, label: 'Effects'     },
        { id: 'filters',     icon: Palette, label: 'Filters'     },
        { id: 'tools',       icon: Zap,     label: 'Tools'       },
    ] as const;

    const transitionItems = [
        { id: 'none',                    label: 'None',       icon: CircleOff,      color: '#94a3b8' },
        { id: 'fade-transition',         label: 'Fade',       icon: Droplets,       color: '#38bdf8' },
        { id: 'zoom-transition',         label: 'Zoom',       icon: ZoomIn,         color: '#a78bfa' },
        { id: 'blur-transition',         label: 'Blur',       icon: Wind,           color: '#c084fc' },
        { id: 'swipe-transition',        label: 'Swipe',      icon: MoveHorizontal, color: '#34d399' },
        { id: 'spin-transition',         label: 'Spin',       icon: RotateCw,       color: '#fb923c' },
        { id: 'whip-pan-transition',     label: 'Whip Pan',   icon: MoveRight,      color: '#f472b6' },
        { id: 'glitch-transition',       label: 'Glitch',     icon: ScanLine,       color: '#f87171' },
        { id: 'mask-transition',         label: 'Mask',       icon: Square,         color: '#facc15' },
        { id: 'flash-transition',        label: 'Flash',      icon: Zap,            color: '#fbbf24' },
        { id: 'camera-shake-transition', label: 'Shake',      icon: Vibrate,        color: '#60a5fa' },
        { id: 'match-cut-transition',    label: 'Match Cut',  icon: Scissors,       color: '#4ade80' },
        { id: 'speed-ramp-transition',   label: 'Speed Ramp', icon: Gauge,          color: '#e879f9' },
        { id: 'wipe-transition',         label: 'Wipe',       icon: ChevronRight,   color: '#22d3ee' },
        { id: 'dissolve-transition',     label: 'Dissolve',   icon: Droplets,       color: '#a3e635' },
    ];

    const effectItems = [
        { id: 'none',            label: 'No Effect',   icon: Ban,       color: '#94a3b8' },
        { id: 'fade-in',         label: 'Fade In',     icon: Sunrise,   color: '#fbbf24' },
        { id: 'velocity',        label: 'Velocity',    icon: Zap,       color: '#f59e0b' },
        { id: 'motion-blur',     label: 'Motion Blur', icon: Wind,      color: '#c084fc' },
        { id: 'shake',           label: 'Shake',       icon: Vibrate,   color: '#60a5fa' },
        { id: 'flash-effect',    label: 'Flash',       icon: Zap,       color: '#facc15' },
        { id: 'rgb-split',       label: 'RGB Split',   icon: Palette,   color: '#f472b6' },
        { id: 'film-grain',      label: 'Film Grain',  icon: Film,      color: '#a78bfa' },
        { id: 'soft-glow',       label: 'Soft Glow',   icon: Sparkles,  color: '#e879f9' },
        { id: 'old-tv',          label: 'Old TV',      icon: Tv,        color: '#34d399' },
        { id: 'slow-motion',     label: 'Slow Mo',     icon: Clock3,    color: '#38bdf8' },
        { id: 'smooth-zoom',     label: 'Smooth Zoom', icon: ZoomIn,    color: '#fb923c' },
        { id: 'glitch',          label: 'Glitch',      icon: ScanLine,  color: '#f87171' },
        { id: 'motion-tracking', label: 'Tracking',    icon: Crosshair, color: '#4ade80' },
    ];

    const filterItems = [
        { id: 'none',        label: 'No Filter',   icon: CircleOff,    color: '#94a3b8' },
        { id: 'cinematic',   label: 'Cinematic',   icon: Clapperboard, color: '#a78bfa' },
        { id: 'moody',       label: 'Moody',       icon: MoonStar,     color: '#6366f1' },
        { id: 'warm-tone',   label: 'Warm',        icon: Sun,          color: '#f59e0b' },
        { id: 'cool-tone',   label: 'Cool',        icon: Snowflake,    color: '#38bdf8' },
        { id: 'vintage',     label: 'Vintage',     icon: Clock3,       color: '#fb923c' },
        { id: 'black-white', label: 'B&W',         icon: Contrast,     color: '#94a3b8' },
        { id: 'teal-orange', label: 'Teal+Orange', icon: Palette,      color: '#2dd4bf' },
        { id: 'dreamy-glow', label: 'Dreamy',      icon: Sparkles,     color: '#e879f9' },
        { id: 'film-look',   label: 'Film Look',   icon: Film,         color: '#c084fc' },
        { id: 'vhs',         label: 'VHS',         icon: Tv,           color: '#4ade80' },
        { id: 'soft-skin',   label: 'Soft Skin',   icon: Smile,        color: '#f9a8d4' },
        { id: 'neon-glow',   label: 'Neon',        icon: Lightbulb,    color: '#facc15' },
        { id: 'hdr-pop',     label: 'HDR Pop',     icon: Aperture,     color: '#f87171' },
    ];

    const renderGrid = (
        items: { id: string; label: string; icon: any; color: string }[],
        activeId: string | undefined,
        onSelect: (id: string) => void,
        activeColor: string,
        activeDot: string,
    ) => (
        <div className="grid grid-cols-3 gap-2">
            {items.map((item) => {
                const isActive = activeId === item.id;
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(item.id); }}
                        type="button"
                        title={item.label}
                        className={`relative flex flex-col items-center justify-center gap-2 h-[76px] rounded-xl border transition-all duration-200 group overflow-hidden ${
                            isActive
                                ? `border-opacity-60 scale-[1.02] ${activeColor}`
                                : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-0.5'
                        }`}
                    >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{ background: `radial-gradient(circle at 50% 40%, ${item.color}20 0%, transparent 70%)` }} />
                        <Icon size={19} className="relative z-10 transition-transform duration-200 group-hover:scale-110"
                            style={{ color: isActive ? '#fff' : item.color }} />
                        <span className={`relative z-10 text-[7.5px] font-bold uppercase tracking-wider text-center leading-tight px-1 line-clamp-2 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                            {item.label}
                        </span>
                        {isActive && <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${activeDot}`} />}
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className="flex h-full w-full">
            {/* ── Narrow icon tab strip ── */}
            <div className="flex-none w-[68px] flex flex-col items-center gap-0.5 py-2 bg-[#07080f] border-r border-white/[0.05]">
                {leftTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = leftTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setLeftTab(tab.id as any);
                                if ((tab.id as string) === 'titles') {
                                    setActiveTool('text-tool');
                                } else if ((tab.id as string) === 'captions') {
                                    setActiveTool('captions');
                                } else if (activeTool === 'text-tool' || activeTool === 'captions') {
                                    setActiveTool(null);
                                }
                            }}
                            title={tab.label}
                            className={`relative flex flex-col items-center justify-center gap-1 w-[56px] h-[54px] rounded-xl transition-all duration-200 group ${
                                isActive
                                    ? 'bg-purple-500/[0.12] text-purple-300'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                            }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-purple-400 rounded-r-full" />
                            )}
                            <Icon className={`w-[15px] h-[15px] transition-colors ${isActive ? 'text-purple-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span className={`text-[7.5px] font-bold uppercase tracking-wide leading-none text-center ${isActive ? 'text-purple-300' : 'text-slate-600 group-hover:text-slate-400'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Content panel ── */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0b0d26]">
                {/* Panel header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.05] shrink-0">
                    <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-200">
                        {leftTab === 'media'       && 'Media Library'}
                        {leftTab === 'titles'      && 'Titles & Text'}
                        {leftTab === 'captions'    && 'Captions'}
                        {leftTab === 'transitions' && 'Transitions'}
                        {leftTab === 'effects'     && 'Visual Effects'}
                        {leftTab === 'filters'     && 'Color Filters'}
                        {leftTab === 'tools'       && 'Toolbox'}
                    </span>
                    {leftTab === 'transitions' && activePreviewId && (
                        <span className="text-[7.5px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded px-1.5 py-0.5 truncate max-w-[110px]">
                            {clipTransitions[activePreviewId] || 'none'}
                        </span>
                    )}
                </div>

                {/* ── TRANSITIONS ── */}
                {leftTab === 'transitions' && (
                    <div className="flex-1 overflow-y-auto p-2.5 custom-scrollbar">
                        <div className={`mb-2.5 px-2.5 py-1.5 rounded-lg text-[7.5px] font-bold uppercase tracking-wider text-center border ${
                            activePreviewId
                                ? 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                                : 'bg-white/[0.03] border-white/5 text-slate-500'
                        }`}>
                            {activePreviewId ? 'Clip selected — click to apply' : 'Select a clip from the timeline'}
                        </div>
                        {renderGrid(
                            transitionItems,
                            activePreviewId ? clipTransitions[activePreviewId] : undefined,
                            (id) => applyTransitionForActiveClip(id),
                            'bg-purple-500/15 border-purple-400/60 shadow-[0_0_14px_rgba(168,85,247,0.22)]',
                            'bg-purple-400',
                        )}
                    </div>
                )}

                {/* ── EFFECTS ── */}
                {leftTab === 'effects' && (
                    <div className="flex-1 overflow-y-auto p-2.5 custom-scrollbar">
                        {renderGrid(
                            effectItems,
                            selectedEffect,
                            setSelectedEffect,
                            'bg-purple-500/15 border-purple-400/60 shadow-[0_0_14px_rgba(168,85,247,0.22)]',
                            'bg-purple-400',
                        )}
                    </div>
                )}

                {/* ── FILTERS ── */}
                {leftTab === 'filters' && (() => {
                    const proEffects = getAllProEffects();
                    const proFilters = proEffects.filter(eff => eff.id.startsWith('pro-filter-'));
                    const filteredFilters = localFilterCategory === 'all'
                        ? proFilters
                        : proFilters.filter(eff => eff.name.startsWith(localFilterCategory + ' v'));
                    return (
                        <div className="flex-1 flex flex-col min-h-0 p-2.5">
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

                            {selectedEffect && selectedEffect.startsWith('pro-filter-') && (() => {
                                const effectModule = getEffectModule(selectedEffect);
                                if (!effectModule) return null;
                                return (
                                    <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-2.5 shrink-0">
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
                })()}{/* ── MEDIA ── */}
                {leftTab === 'media' && (
                    <div className="flex-1 overflow-y-auto p-2.5 custom-scrollbar flex flex-col gap-3">
                        <div className="text-[7.5px] font-bold uppercase tracking-widest text-slate-500">Project Media</div>
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/10 rounded-xl min-h-[120px]">
                            <Film className="w-8 h-8 text-slate-600" />
                            <span className="text-[8.5px] text-slate-500 font-bold text-center">Drag & drop media here<br /><span className="text-slate-600 font-normal">or use Add Video button</span></span>
                        </div>
                    </div>
                )}

                {/* ── TITLES ── */}
                {(leftTab === 'titles' || leftTab === 'captions') && (
                    <div className="flex-1 overflow-y-auto p-2.5 custom-scrollbar">
                        <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 shadow-inner">
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

                {/* ── TOOLS ── */}
                {leftTab === 'tools' && (
                    <div className="flex-1 overflow-y-auto p-2.5 space-y-3 custom-scrollbar">
                        {activeTool ? (
                            <div className="space-y-3">
                                <button onClick={() => setActiveTool(null)}
                                    className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[8px] font-black uppercase tracking-wider text-slate-300 transition-all flex items-center gap-1 cursor-pointer">
                                    ← Back to Tools
                                </button>
                                <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 shadow-inner">
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
                                        clipSettings={clipSettings} setClipSettings={setClipSettings}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Smart Auto Features</span>
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
                                                    <span className="text-[7.5px] font-bold text-slate-300">{opt.label}</span>
                                                </div>
                                                <Switch checked={aiOptions[opt.id]} onCheckedChange={() => toggleOption(opt.id)} className="scale-50 data-[state=checked]:bg-purple-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Canvas Format</span>
                                    <div className="grid grid-cols-1 gap-2">
                                        <AspectRatioCard label="YouTube" ratio="16:9" icon={MonitorPlay} description="Best for YouTube & Desktop" isSelected={aspectRatio.name === 'YouTube'} onClick={() => applyAspectRatio(16, 9, 'YouTube')} />
                                        <AspectRatioCard label="Instagram" ratio="9:16" icon={Smartphone} description="Reels, Shorts & TikTok" isSelected={aspectRatio.name === 'Instagram'} onClick={() => applyAspectRatio(9, 16, 'Instagram')} />
                                        <AspectRatioCard label="Square" ratio="1:1" icon={Square} description="Instagram Posts" isSelected={aspectRatio.name === 'Square'} onClick={() => applyAspectRatio(1, 1, 'Square')} />
                                        <AspectRatioCard label="Custom" ratio="Custom" icon={SlidersHorizontal} description={aspectRatio.name === 'Custom' ? `${aspectRatio.width} × ${aspectRatio.height}` : 'Width × Height'} isSelected={aspectRatio.name === 'Custom'} onClick={() => setIsCustomFrameOpen(true)} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

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
    const [textSubTab, setTextSubTab] = useState<'fonts' | 'styles'>('fonts');

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
                            ? `Clip: ${activePreviewId.slice(0, 8)} • ${clipTransitions[activePreviewId] || 'none'}`
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
                                Duration: {activePreviewItem.duration.toFixed(2)}s
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">
                                    <span>Start</span>
                                    <span>{getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration).start.toFixed(2)}s</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={Math.max(0, activePreviewItem.duration - 0.01)}
                                    step={0.01}
                                    value={getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration).start}
                                    onChange={(e) => {
                                        const nextStart = Number(e.target.value);
                                        const current = getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration);
                                        const safeEnd = Math.max(nextStart + 0.01, current.end);
                                        setClipTrimRanges((prev: any) => ({
                                            ...prev,
                                            [activePreviewItem.id]: {
                                                start: nextStart,
                                                end: Math.min(activePreviewItem.duration, safeEnd),
                                            },
                                        }));
                                        if (videoRef.current) {
                                            videoRef.current.currentTime = nextStart;
                                        }
                                    }}
                                    onMouseUp={() => {
                                        saveToUndo(mediaItems, undefined, clipTrimRanges);
                                    }}
                                    className="w-full accent-purple-400"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">
                                    <span>End</span>
                                    <span>{getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration).end.toFixed(2)}s</span>
                                </div>
                                <input
                                    type="range"
                                    min={0.01}
                                    max={activePreviewItem.duration}
                                    step={0.01}
                                    value={getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration).end}
                                    onChange={(e) => {
                                        const nextEnd = Number(e.target.value);
                                        const current = getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration);
                                        setClipTrimRanges((prev: any) => ({
                                            ...prev,
                                            [activePreviewItem.id]: {
                                                start: current.start,
                                                end: Math.max(current.start + 0.01, nextEnd),
                                            },
                                        }));
                                    }}
                                    onMouseUp={() => {
                                        saveToUndo(mediaItems, undefined, clipTrimRanges);
                                    }}
                                    className="w-full accent-purple-400"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    if (activePreviewItem) {
                                        const updatedTrim = {
                                            ...clipTrimRanges,
                                            [activePreviewItem.id]: { start: 0, end: activePreviewItem.duration }
                                        };
                                        setClipTrimRanges(updatedTrim);
                                        saveToUndo(mediaItems, undefined, updatedTrim);
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
                            <span>{rotationDegrees}°</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                            {[0, 90, 180, 270].map((deg) => (
                                <button
                                    key={deg}
                                    onClick={() => setRotationDegrees(deg)}
                                    className={`py-1.5 rounded text-[8px] font-black uppercase border transition-colors ${rotationDegrees === deg ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                                >
                                    {deg}°
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        case 'volume':
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Volume</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Audio Level</span>
                    </div>
                    <div className="space-y-2.5">
                        <button
                            onClick={() => setIsMuted((prev: any) => !prev)}
                            className={`w-full py-2 rounded-lg text-[8px] font-black uppercase border transition-colors ${isMuted ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/15'}`}
                        >
                            {isMuted ? 'Unmute' : 'Mute'}
                        </button>
                        <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300">
                            <span>Volume</span>
                            <span>{Math.round(volumeLevel * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volumeLevel}
                            onChange={(e) => {
                                const next = Number(e.target.value);
                                setVolumeLevel(next);
                                if (next > 0 && isMuted) {
                                    setIsMuted(false);
                                }
                            }}
                            className="w-full accent-purple-400"
                        />
                    </div>
                </div>
            );
        case 'crop':
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Cropping</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Dimensions</span>
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
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Text overlay</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Titles</span>
                    </div>
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
                                className="mt-1 w-full bg-[#08090d] border border-white/[0.08] hover:border-white/15 focus:border-purple-500/50 text-slate-200 text-[13px] font-medium min-h-[85px] rounded-lg p-3 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all resize-none shadow-inner"
                            />
                        </div>
                        {/* Category Selector Chips */}
                        <div className="flex gap-1.5 pb-1 shrink-0 scrollbar-none">
                            {[
                                { id: 'fonts', label: 'Project Fonts' },
                                { id: 'styles', label: 'Text Style' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setTextSubTab(tab.id as any)}
                                    type="button"
                                    className={`px-3 py-1.5 rounded-full text-[8.5px] font-black uppercase tracking-wider transition-all border shrink-0 cursor-pointer ${
                                        textSubTab === tab.id
                                            ? 'bg-purple-500/20 border-purple-500/60 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                                            : 'bg-[#12141c]/50 border-white/[0.06] text-slate-400 hover:bg-[#12141c] hover:text-slate-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Switch Content based on textSubTab */}
                        {textSubTab === 'fonts' ? (
                            <div className="flex-1 min-h-0 flex flex-col">
                                <div className="bg-[#12141c] border border-white/[0.06] rounded-xl overflow-hidden shadow-inner select-none flex flex-col flex-1 min-h-0">
                                    <div className="px-3.5 py-1.5 bg-[#0e1017] text-[8.5px] font-extrabold uppercase tracking-widest text-[#5c6e8e] border-b border-white/[0.02] shrink-0">
                                        My Fonts
                                    </div>
                                    <div className="flex-1 min-h-[220px] overflow-y-auto divide-y divide-white/[0.02] pr-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/[0.08] [&::-webkit-scrollbar-thumb]:rounded-full">
                                        {textFontOptions.map((font) => {
                                            const isActive = overlayFontId === font.id;
                                            
                                            // Specific icons from the user's mockup image
                                            const showUpload = ['rubik', 'abril', 'adderley', 'adelia', 'akira'].includes(font.id);
                                            const showChevron = ['rubik', 'abeezee', 'adderley', 'advent'].includes(font.id);

                                            return (
                                                <button
                                                    key={font.id}
                                                    onClick={() => setOverlayFontId(font.id)}
                                                    className={`w-full flex items-center justify-between py-2.5 px-3.5 text-left border-l-2 transition-all duration-150 active:scale-[0.99] cursor-pointer ${
                                                        isActive
                                                            ? 'bg-[#1e172a] border-[#D946EF] text-[#e879f9]'
                                                            : 'border-transparent text-slate-300 hover:bg-white/[0.02] hover:text-white'
                                                    }`}
                                                >
                                                    <span 
                                                        className="text-[12.5px] font-medium leading-none"
                                                        style={{ 
                                                            fontFamily: font.family,
                                                            letterSpacing: font.letterSpacing || 'normal',
                                                            fontWeight: font.fontWeight || 'normal'
                                                        }}
                                                    >
                                                        {font.label}
                                                    </span>
                                                    
                                                    <div className="flex items-center gap-2.5 text-slate-500 group-hover:text-slate-400 shrink-0">
                                                        {showUpload && (
                                                            <Upload className={`w-3 h-3 transition-colors ${isActive ? 'text-[#D946EF]/70' : 'text-slate-500 hover:text-slate-300'}`} />
                                                        )}
                                                        {showChevron && (
                                                            <ChevronDown className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-[#D946EF]/70' : 'text-slate-500'}`} />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 min-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                                <div className="grid grid-cols-2 gap-2.5 pb-2">
                                    {[
                                        { id: 'cinematic-title', label: 'Cinematic Title' },
                                        { id: 'animated-captions', label: 'Animated Captions' },
                                        { id: 'kinetic-typography', label: 'Kinetic Typography' },
                                        { id: 'neon-glow-text', label: 'Neon Glow Text' },
                                        { id: 'glitch-text', label: 'Glitch Text' },
                                        { id: 'typewriter-text', label: 'Typewriter Text' },
                                        { id: 'bold-hype-text', label: 'Bold Hype Text' },
                                        { id: 'lyrics-text', label: 'Lyrics Text' },
                                        { id: 'minimal-clean-text', label: 'Minimal Clean Text' },
                                        { id: '3d-text', label: '3D Text' },
                                        { id: 'subtitle-style-text', label: 'Subtitle Style Text' },
                                        { id: 'motion-tracking-text', label: 'Motion Tracking Text' },
                                    ].map((style) => {
                                        const isActive = overlayTextStylePreset === style.id;
                                        return (
                                            <button
                                                key={style.id}
                                                onClick={() => {
                                                    setOverlayTextStylePreset(style.id);
                                                    setSelectedEffect(getOverlayTextEffectForPreset(style.id));
                                                    if (style.id === 'animated-captions') {
                                                        setAnimatedText(overlayText);
                                                    }
                                                }}
                                                className={`h-10 px-3 flex items-center justify-center text-[9px] font-bold uppercase tracking-wider border rounded-lg transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                                                    isActive
                                                        ? 'bg-[#181125] text-[#D946EF] border-[#A855F7] shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                                                        : 'bg-[#0e111a]/60 text-slate-200 border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 hover:text-white'
                                                }`}
                                            >
                                                {style.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Size</label>
                                <input
                                    type="range"
                                    min={18}
                                    max={96}
                                    value={overlayFontSize}
                                    onChange={(e) => setOverlayFontSize(Number(e.target.value))}
                                    className="w-full accent-purple-400"
                                />
                            </div>
                            <div>
                                <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Color</label>
                                <input
                                    type="color"
                                    value={overlayColor}
                                    onChange={(e) => setOverlayColor(e.target.value)}
                                    className="w-full h-6 rounded bg-transparent border border-white/10 cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">Background</label>
                                <button
                                    type="button"
                                    onClick={() => setOverlayBgEnabled(!overlayBgEnabled)}
                                    className={`w-full py-1.5 rounded text-[8px] font-black uppercase border transition-all ${overlayBgEnabled ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 ring-2 ring-purple-500/30' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                                >
                                    {overlayBgEnabled ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            {overlayBgEnabled && (
                                <div>
                                    <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400">BG Color</label>
                                    <input
                                        type="color"
                                        value={overlayBgColorHex}
                                        onChange={(e) => setOverlayBgColorHex(e.target.value)}
                                        className="w-full h-6 rounded bg-transparent border border-white/10 cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Position X</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={overlayPosX}
                                    onChange={(e) => setOverlayPosX(Number(e.target.value))}
                                    className="w-full accent-purple-400"
                                />
                            </div>
                            <div>
                                <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Position Y</label>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={overlayPosY}
                                    onChange={(e) => setOverlayPosY(Number(e.target.value))}
                                    className="w-full accent-purple-400"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => setIsTextPlacementMode(!isTextPlacementMode)}
                            className={`w-full py-1.5 rounded text-[8px] font-black uppercase border transition-colors ${isTextPlacementMode ? 'bg-purple-500 text-[#0B1020] border-purple-400' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/15'}`}
                        >
                            {isTextPlacementMode ? 'Click Preview' : 'Place on Preview'}
                        </button>
                        <button
                            onClick={() => {
                                setOverlayText('');
                                setAnimatedText('');
                                setIsTextPlacementMode(false);
                            }}
                            className="w-full py-1.5 rounded bg-red-500/15 border border-red-500/40 text-red-300 text-[8px] font-black uppercase hover:bg-red-500/25"
                        >
                            Delete Text
                        </button>
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
                                                key={cap.id}
                                                onClick={() => setCurrentCaption(cap)}
                                                className={`flex items-start gap-1.5 px-2 py-1.5 rounded-lg border cursor-pointer transition-all group ${currentCaption?.id === cap.id
                                                    ? 'bg-fuchsia-500/20 border-fuchsia-400 shadow-[inset_0_0_8px_rgba(168,85,247,0.1)]'
                                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[9px] font-bold text-slate-200 truncate">{cap.text}</div>
                                                    <div className="text-[7px] text-slate-500 font-mono mt-0.5">{cap.startTime.toFixed(1)}s → {cap.endTime.toFixed(1)}s</div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCaptions((prev: any) => prev.filter((c: any) => c.id !== cap.id));
                                                        if (currentCaption?.id === cap.id) {
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
                                    <span className="text-[8px] font-black uppercase tracking-widest text-fuchsia-300">✨ AI Auto-Caption</span>
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
                                        Transcribing…
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
                                <label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block mb-1">🎨 Presets</label>
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


    const [mediaItems, setMediaItems] = useState<Array<{ id: string, file: File | null, preview: string, type: 'video' | 'image', duration: number }>>([]);
    const [libraryAssets, setLibraryAssets] = useState<Array<{ id: string, file: File | null, preview: string, type: 'video' | 'image' | 'audio', duration: number }>>([]);
    const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
    const [leftTab, setLeftTab] = useState<'media' | 'stock' | 'audio' | 'titles' | 'captions' | 'transitions' | 'effects' | 'filters' | 'frames' | 'tools'>('media');
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
    const [speedValue, setSpeedValue] = useState(1);
    const [rotationDegrees, setRotationDegrees] = useState(0);
    const [volumeLevel, setVolumeLevel] = useState(1);
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

    const [inspectorTab, setInspectorTab] = useState<'video' | 'audio' | 'speed' | 'animation' | 'color'>('video');
    const [inspectorSubTab, setInspectorSubTab] = useState<'basic' | 'mask' | 'ai-matte'>('basic');
    const [isTransformExpanded, setIsTransformExpanded] = useState(true);
    const [isCompositingExpanded, setIsCompositingExpanded] = useState(true);
    const [isTransformEnabled, setIsTransformEnabled] = useState(true);
    const [isCompositingEnabled, setIsCompositingEnabled] = useState(true);

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
        
        let base = '';
        if (isTransformEnabled || clipMirror === -1 || clipFlip === -1) {
            const scaleX = (isTransformEnabled ? zoomToolAmountX : 1) * (flipH ? -1 : 1) * clipMirror;
            const scaleY = (isTransformEnabled ? zoomToolAmountY : 1) * (flipV ? -1 : 1) * clipFlip;
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
    const previewFrameRef = useRef<HTMLDivElement>(null);
    const pendingTransitionSeekRef = useRef<{ clipId: string; seekTime: number } | null>(null);
    const lastTriggeredEndRef = useRef<string | null>(null);

    const saveToUndo = useCallback((
        items: typeof mediaItems,
        transitions?: any,
        trimRanges?: any,
        startOverrides?: any,
        trackOverrides?: any,
        nameOverrides?: any,
        lockedStates?: any,
        settings?: any
    ) => {
        const stateObj = {
            mediaItems: items,
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
            if (prev[historyIndex] === stateStr) return prev;
            const newHistory = prev.slice(0, historyIndex + 1);
            return [...newHistory, stateStr];
        });
        setHistoryIndex(prev => prev + 1);
    }, [historyIndex, clipTransitions, clipTrimRanges, clipStartOverrides, clipTrackOverrides, clipNameOverrides, clipLockedStates, clipSettings]);

    const undo = () => {
        if (historyIndex > 0) {
            const prevState = JSON.parse(history[historyIndex - 1]);
            setMediaItems(prevState.mediaItems);
            setClipTransitions(prevState.clipTransitions || {});
            setClipTrimRanges(prevState.clipTrimRanges || {});
            setClipStartOverrides(prevState.clipStartOverrides || {});
            setClipTrackOverrides(prevState.clipTrackOverrides || {});
            setClipNameOverrides(prevState.clipNameOverrides || {});
            setClipLockedStates(prevState.clipLockedStates || {});
            setClipSettings(prevState.clipSettings || {});
            setHistoryIndex(prev => prev - 1);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const nextState = JSON.parse(history[historyIndex + 1]);
            setMediaItems(nextState.mediaItems);
            setClipTransitions(nextState.clipTransitions || {});
            setClipTrimRanges(nextState.clipTrimRanges || {});
            setClipStartOverrides(nextState.clipStartOverrides || {});
            setClipTrackOverrides(nextState.clipTrackOverrides || {});
            setClipNameOverrides(nextState.clipNameOverrides || {});
            setClipLockedStates(nextState.clipLockedStates || {});
            setClipSettings(nextState.clipSettings || {});
            setHistoryIndex(prev => prev + 1);
        }
    };

    // --- Auto-caption handler (Gemini via backend) ---
    const handleAutoCaption = useCallback(async () => {
        // Find the active video clip or the first video clip
        const activeClip = mediaItems.find((item: any) => item.id === activePreviewId && item.type === 'video')
            || mediaItems.find((item: any) => item.type === 'video');

        if (!activeClip || !activeClip.file) {
            setAutoCaptionStatus('❌ No video clip loaded to transcribe. Add a video clip first.');
            return;
        }

        setIsAutoCapturing(true);
        setAutoCaptionStatus('🎙️ Uploading to Gemini for transcription…');

        try {
            const formData = new FormData();
            formData.append('file', activeClip.file);
            formData.append('language', captionLanguage);
            formData.append('detect_speakers', String(detectSpeakers));

            setAutoCaptionStatus('✨ Analyzing speech with Gemini AI…');

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
                setAutoCaptionStatus('⚠️ No speech detected in the video.');
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
            setAutoCaptionStatus(`✅ ${newCaptions.length} captions generated successfully!`);
        } catch (error: any) {
            console.error('Gemini transcription failed:', error);
            setAutoCaptionStatus(`❌ Transcription failed: ${error.message || 'Unknown error'}`);
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
                if (item.id !== activePreviewId) return item;
                // Revoke old blob URL to free memory
                if (item.preview && item.preview.startsWith('blob:')) {
                    URL.revokeObjectURL(item.preview);
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

    const activePreviewItem = mediaItems.find((i) => i.id === activePreviewId) || libraryAssets.find((i) => i.id === activePreviewId) || null;

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

    const getEffectiveDurationForItem = useCallback((item: { id: string; type: 'video' | 'image'; duration: number }) => {
        if (item.type !== 'video') return item.duration;
        const { start, end } = getTrimRangeForItem(item.id, item.duration);
        return Math.max(0.01, end - start);
    }, [getTrimRangeForItem]);

    const getTotalEffectiveDuration = useCallback(() => {
        return mediaItems.reduce((acc, item) => acc + getEffectiveDurationForItem(item), 0);
    }, [mediaItems, getEffectiveDurationForItem]);

    const globalCurrentTime = useMemo(() => {
        const totalDuration = getTotalEffectiveDuration();
        return (progress / 100) * totalDuration;
    }, [progress, mediaItems, getTotalEffectiveDuration]);

    const getClipGlobalStart = useCallback((clipId: string) => {
        let accumulated = 0;
        const sorted = [...mediaItems].sort((a, b) => {
            const startA = clipStartOverrides[a.id] !== undefined ? clipStartOverrides[a.id] : 0;
            const startB = clipStartOverrides[b.id] !== undefined ? clipStartOverrides[b.id] : 0;
            return startA - startB;
        });
        for (const item of sorted) {
            if (item.id === clipId) {
                return accumulated;
            }
            accumulated += getEffectiveDurationForItem(item);
        }
        return 0;
    }, [mediaItems, getEffectiveDurationForItem, clipStartOverrides]);

    const getTargetStartTime = useCallback((item: any) => {
        const trim = getTrimRangeForItem(item.id, item.duration);
        if (pendingTransitionSeekRef.current && pendingTransitionSeekRef.current.clipId === item.id) {
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

        // Clear pending seek offset if active clip is an image and we are paused
        const activeItem = mediaItems.find(i => i.id === activePreviewId);
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
                console.log("📹 [PLAYBACK] Play request aborted (media unmounted/reloaded).");
                return;
            }
            console.warn("📹 [PLAYBACK] Play failed, trying muted fallback:", err);
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
            const activeItem = mediaItems.find(i => i.id === activePreviewId);
            if (activeItem?.type === 'video') {
                const videoElement = videoRef.current;
                const targetStart = getTargetStartTime(activeItem);
                
                const currentSrc = videoElement.src || videoElement.getAttribute('src') || '';
                const itemPreviewResolved = new URL(activeItem.preview, window.location.href).href;
                const videoSrcResolved = new URL(currentSrc, window.location.href).href;
                
                if (itemPreviewResolved === videoSrcResolved) {
                    console.log("📹 [PLAYBACK] Same video source - seeking instantly to:", targetStart);
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
            console.log("📹 [PLAYBACK] Paused main video during transition overlay");
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
            console.log("📹 [PLAYBACK] playNextMedia ignored stale end event for:", endedClipId, "current active:", activePreviewId);
            return;
        }

        console.log("📹 [PLAYBACK] playNextMedia called for item:", currentId);
        const sorted = [...mediaItems].sort((a, b) => {
            const startA = clipStartOverrides[a.id] !== undefined ? clipStartOverrides[a.id] : 0;
            const startB = clipStartOverrides[b.id] !== undefined ? clipStartOverrides[b.id] : 0;
            return startA - startB;
        });
        const currentIndex = sorted.findIndex(i => i.id === currentId);
        if (currentIndex !== -1 && currentIndex < sorted.length - 1) {
            const nextId = sorted[currentIndex + 1].id;
            console.log("📹 [PLAYBACK] Transitioning to next clip:", nextId);
            triggerClipTransition(nextId);
            setIsPlaying(true);
        } else {
            console.log("📹 [PLAYBACK] No more clips to play, resetting to start");
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
        console.log("📹 [PLAYBACK] togglePlay called, current isPlaying:", isPlaying);
        const activeItem = mediaItems.find(i => i.id === activePreviewId);

        console.log("📹 [PLAYBACK] Active item:", { id: activeItem?.id, type: activeItem?.type, hasVideoRef: !!videoRef.current });

        // If there are no media items, don't try to play
        if (!activeItem || mediaItems.length === 0) {
            console.log("📹 [PLAYBACK] No active item or media items");
            return;
        }

        // For video items, control the video element
        if (activeItem.type === 'video') {
            console.log("📹 [PLAYBACK] Detected video type, videoRef.current:", videoRef.current);
            const trim = getTrimRangeForItem(activeItem.id, activeItem.duration);
            if (isPlaying) {
                console.log("📹 [PLAYBACK] Pausing video");
                setIsPlaying(false);
            } else {
                console.log("📹 [PLAYBACK] Starting video from:", trim.start);
                // Reset to trim start if outside trim range
                if (videoRef.current && (videoRef.current.currentTime < trim.start || videoRef.current.currentTime > trim.end)) {
                    videoRef.current.currentTime = trim.start;
                }
                setIsPlaying(true);
            }
        } else {
            // For images or when no video ref, just toggle the playing state
            console.log("📹 [PLAYBACK] Toggling play for image or no ref");
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current && mediaItems.length > 0) {
            const sorted = [...mediaItems].sort((a, b) => {
                const startA = clipStartOverrides[a.id] !== undefined ? clipStartOverrides[a.id] : 0;
                const startB = clipStartOverrides[b.id] !== undefined ? clipStartOverrides[b.id] : 0;
                return startA - startB;
            });
            const activeIndex = sorted.findIndex(i => i.id === activePreviewId);
            if (activeIndex < 0) return; // Safety check

            // If we are currently waiting for a transition seek to complete, ignore or hold the position
            if (pendingTransitionSeekRef.current && pendingTransitionSeekRef.current.clipId === activePreviewId) {
                console.log("📹 [PLAYBACK] handleTimeUpdate ignored because transition seek is pending for:", activePreviewId);
                return;
            }

            const activeItem = activeIndex >= 0 ? sorted[activeIndex] : null;
            const timeBefore = sorted
                .slice(0, activeIndex)
                .reduce((acc, item) => acc + getEffectiveDurationForItem(item), 0);
            const totalDuration = getTotalEffectiveDuration();

            let currentLocalTime = videoRef.current.currentTime;
            if (activeItem?.type === 'video') {
                const trim = getTrimRangeForItem(activeItem.id, activeItem.duration);
                if (currentLocalTime < trim.start) {
                    videoRef.current.currentTime = trim.start;
                    currentLocalTime = trim.start;
                }

                // Check if there is a transition on this clip to trigger overlap early
                const transitionType = clipTransitions[activeItem.id] || 'none';
                const hasTransition = transitionType !== 'none';
                const transitionDuration = 1.4; // 1.4 seconds matching durationMs
                const endTriggerTime = hasTransition ? Math.max(trim.start, trim.end - transitionDuration) : trim.end;

                if (currentLocalTime >= endTriggerTime) {
                    if (lastTriggeredEndRef.current !== activeItem.id) {
                        lastTriggeredEndRef.current = activeItem.id;
                        console.log("📹 [PLAYBACK] Clip reached transition/end boundary in handleTimeUpdate:", activeItem.id, "at:", currentLocalTime);
                        
                        // Immediately pause the video element to prevent playing trimmed part
                        if (videoRef.current) {
                            videoRef.current.pause();
                            videoRef.current.currentTime = endTriggerTime;
                        }
                        
                        setProgress(((timeBefore + (endTriggerTime - trim.start)) / (totalDuration || 1)) * 100 || 0);
                        playNextMedia(activeItem.id);
                    }
                    return;
                }
                currentLocalTime = Math.max(0, currentLocalTime - trim.start);
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

            if (activeItem?.type === 'video') {
                const trim = getTrimRangeForItem(activeItem.id, activeItem.duration);
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

    const handleTimelineClick = useCallback((globalSeekTime: number) => {
        const totalDuration = getTotalEffectiveDuration();
        if (totalDuration === 0) return;

        const clampedSeekTime = Math.max(0, Math.min(totalDuration, globalSeekTime));
        const pos = (clampedSeekTime / totalDuration) * 100;

        // Find which item this global time corresponds to
        let accumulated = 0;
        for (const item of mediaItems) {
            const itemEffectiveDuration = getEffectiveDurationForItem(item);
            if (clampedSeekTime <= accumulated + itemEffectiveDuration) {
                const offset = clampedSeekTime - accumulated;
                setActivePreviewId(item.id);
                // Use a tiny timeout to let the video/img mount before seeking
                setTimeout(() => {
                    if (videoRef.current && item.type === 'video') {
                        const trim = getTrimRangeForItem(item.id, item.duration);
                        videoRef.current.currentTime = Math.max(trim.start, Math.min(trim.end, trim.start + offset));
                    }
                    if (bgMusicRef.current && selectedMusic) {
                        bgMusicRef.current.currentTime = (selectedMusic.startTime ?? 0) + globalSeekTime;
                    }
                }, 10);
                break;
            }
            accumulated += itemEffectiveDuration;
        }
        setProgress(pos);
        setReadLinePosition(pos);
    }, [mediaItems, getEffectiveDurationForItem, getTotalEffectiveDuration, setActivePreviewId, getTrimRangeForItem]);

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
        const activeItem = mediaItems.find(i => i.id === activePreviewId);
        console.log("📹 [PLAYBACK] useEffect triggered:", {
            isPlaying,
            activeId: activePreviewId,
            activeItemType: activeItem?.type,
            hasVideoRef: !!videoRef.current
        });

        if (!videoRef.current || !activeItem || activeItem.type !== 'video') {
            console.log("📹 [PLAYBACK] useEffect skipped - video ref or active item missing", {
                videoRef: !!videoRef.current,
                activeItem: !!activeItem,
                isVideo: activeItem?.type === 'video'
            });
            return;
        }

        const video = videoRef.current;
        console.log("📹 [PLAYBACK] useEffect updating play state:", { isPlaying, videoElementExists: !!video });

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
        const isMutedDeck = isMuted;

        // Set video element volume/mute
        if (videoRef.current) {
            const videoShouldMute = isMutedDeck || (selectedMusic ? selectedMusic.muteOriginal : false);
            videoRef.current.muted = videoShouldMute;
            videoRef.current.volume = videoShouldMute ? 0 : Math.max(0, Math.min(1, volumeLevel));
        }

        // Set upload audio track volume/mute
        if (audioRef.current) {
            audioRef.current.muted = isMutedDeck;
            audioRef.current.volume = isMutedDeck ? 0 : Math.max(0, Math.min(1, volumeLevel));
        }

        // Set background music volume/mute
        if (bgMusicRef.current && selectedMusic) {
            bgMusicRef.current.muted = isMutedDeck;
            const bgVolume = (selectedMusic.volume ?? 80) / 100;
            bgMusicRef.current.volume = isMutedDeck ? 0 : bgVolume;
        }
    }, [isMuted, volumeLevel, selectedMusic]);

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
        const activeItem = mediaItems.find((i) => i.id === activePreviewId);
        if (!activeItem || activeItem.type !== 'video' || !videoRef.current) return;
        if (videoRef.current.readyState < 1) return; // Wait for metadata before clamping/seeking
        const targetStart = getTargetStartTime(activeItem);
        const trim = getTrimRangeForItem(activeItem.id, activeItem.duration);
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
        const isProEffect = selectedEffect && selectedEffect.startsWith('pro-') && !selectedEffect.startsWith('pro-filter-');
        const activeCanvasMode = isProEffect
            ? selectedEffect
            : CANVAS_PREVIEW_EFFECTS.includes(selectedEffect)
                ? selectedEffect
                : CANVAS_PREVIEW_FILTERS.includes(selectedFilter)
                    ? selectedFilter
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
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
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
    ]);

    // Keep timeline thumbnail videos in sync with the main preview transport state.
    useEffect(() => {
        mediaItems.forEach((item) => {
            if (item.type !== 'video') return;
            const thumbVideo = thumbnailVideoRefs.current[item.id];
            if (!thumbVideo) return;

            if (isPlaying && activePreviewId === item.id) {
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
            const fromItem = mediaItems.find((item: any) => item.id === transitionOverlay.fromId);
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
                console.log("✅ [TRANSITIONS] Preview animation completed for transition:", transitionOverlay.type);
                
                const wasPlaying = isPlayingRef.current;
                
                setTransitionOverlay(null);
                setTransitionProgress(0);

                if (wasPlaying) {
                    console.log("📹 [PLAYBACK] Normal playback: switching to next clip after transition");
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
                                console.log("📹 [PLAYBACK] Transition complete, seeked next clip to target start:", targetStart);
                            }
                            console.log("📹 [PLAYBACK] Resuming playback on next clip");
                            safePlay(videoRef.current);
                        }
                    }, 50);
                } else {
                    console.log("📹 [PLAYBACK] User applying transition: stay on source clip and seek to start");
                    setActivePreviewId(transitionOverlay.fromId);
                    setTimeout(() => {
                        if (videoRef.current) {
                            const fromItem = mediaItems.find((m: any) => m.id === transitionOverlay.fromId);
                            if (fromItem) {
                                const trim = getTrimRangeForItem(fromItem.id, fromItem.duration);
                                videoRef.current.currentTime = trim.start;
                                console.log("📹 [PLAYBACK] Seeked to start of from clip:", trim.start);
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
        let progressInterval: ReturnType<typeof setInterval>;
        const activeItem = mediaItems.find(i => i.id === activePreviewId);

        if (isPlaying && activeItem?.type === 'image') {
            let seekOffsetMs = 0;
            if (pendingTransitionSeekRef.current && pendingTransitionSeekRef.current.clipId === activePreviewId) {
                seekOffsetMs = pendingTransitionSeekRef.current.seekTime * 1000;
                pendingTransitionSeekRef.current = null; // Clear it
            }

            const startTime = Date.now() - seekOffsetMs;
            const imageDuration = Math.max(0, (activeItem.duration || 3) * 1000 - seekOffsetMs);

            progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const activeIndex = mediaItems.findIndex(i => i.id === activePreviewId);
                const timeBefore = mediaItems.slice(0, activeIndex).reduce((acc, item) => acc + item.duration, 0);
                const totalDuration = mediaItems.reduce((acc, item) => acc + item.duration, 0);

                const globalTime = timeBefore + Math.min(elapsed / 1000, activeItem.duration);
                const p = (globalTime / (totalDuration || 1)) * 100;
                setProgress(Math.min(p, 100) || 0);
                const localProgress = Math.min(1, (elapsed / 1000) / Math.max(0.01, activeItem.duration));
                setKeyframeProgress(localProgress);
            }, 100);

            timer = setTimeout(() => {
                playNextMedia(activeItem.id);
            }, imageDuration);
        }
        return () => {
            clearTimeout(timer);
            if (progressInterval) clearInterval(progressInterval);
        };
    }, [isPlaying, activePreviewId, mediaItems, playNextMedia]);

    useEffect(() => {
        if (location.state && typeof location.state === 'object') {
            const state = location.state as any;
            const { initialMedia, initialAudio } = state;

            if (initialMedia && (initialMedia.file || initialMedia.preview)) {
                const preview = initialMedia.file
                    ? URL.createObjectURL(initialMedia.file)
                    : initialMedia.preview;

                if (initialMedia.file && preview) {
                    createdPreviewUrlsRef.current.push(preview);
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
                    setActivePreviewId('initial');
                    // Initialize undo history with initial state
                    setHistory([JSON.stringify([newItem])]);
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

        const baseTransform = `scale(${zoomScale * zoomToolAmount * keyframeScale}) rotate(${rotationDegrees}deg)`;
        return `${baseTransform}${shakeOffset}${rgbOffset}${glitchOffset}`;
    };

    const activeTrim = activePreviewItem && activePreviewItem.type === 'video'
        ? getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration)
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
            const index = prev.findIndex((item) => item.id === activePreviewId);
            if (index === -1) return prev;

            const source = prev[index];
            const nextId = Math.random().toString(36).substr(2, 9);
            const preview = source.file ? URL.createObjectURL(source.file) : source.preview;

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
                // Switch to titles panel to let user add text overlay
                setActiveTool('text-tool');
                setPendingInsertTargetId(null);
                setPendingInsertType(null);
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
                const thumbnail_url = await generateThumbnail(item.file);
                supabase.from('app_uploads').insert({
                    user_id: session.user.id,
                    original_filename: item.file.name,
                    upload_type: item.type === 'video' ? 'Video' : 'Image',
                    size: `${(item.file.size / (1024 * 1024)).toFixed(2)} MB`,
                    resolution: "Unknown",
                    duration: `${item.duration.toFixed(1)}s`,
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
                    file: item.file,
                    preview: item.preview,
                    type: item.type,
                    duration: item.duration,
                }));
                
                if (pendingInsertTargetId === '__START__') {
                    updated.unshift(...timelineItems);
                } else {
                    const targetIndex = prev.findIndex(item => item.id === pendingInsertTargetId);
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
            const item = prev.find(i => i.id === id);
            if (item) URL.revokeObjectURL(item.preview);
            const nextAssets = prev.filter(i => i.id !== id);
            if (activePreviewId === id) {
                selectPreviewWithTransition(nextAssets[0]?.id || null);
            }
            return nextAssets;
        });
    };

    const removeMediaItem = (id: string) => {
        setMediaItems(prev => {
            const item = prev.find(i => i.id === id);
            if (item) URL.revokeObjectURL(item.preview);
            const nextItems = prev.filter(i => i.id !== id);
            if (activePreviewId === id) {
                selectPreviewWithTransition(nextItems[0]?.id || null);
            }
            saveToUndo(nextItems);
            return nextItems;
        });
    };

    const handleAddAssetToTimeline = useCallback((assetId: string, newClipId: string) => {
        const asset = libraryAssets.find(a => a.id === assetId);
        if (!asset) return;

        if (asset.type === 'video' || asset.type === 'image') {
            const newClip = {
                id: newClipId,
                file: asset.file,
                preview: asset.preview,
                type: asset.type,
                duration: asset.duration,
            };
            setMediaItems(prev => {
                const updated = [...prev, newClip];
                saveToUndo(updated);
                return updated;
            });
            selectPreviewWithTransition(newClipId);
        } else if (asset.type === 'audio') {
            setAudioTracks(prev => {
                const newAudio = {
                    id: newClipId,
                    name: asset.file?.name || "Audio Track",
                    duration: asset.duration || 10,
                    type: 'direct' as const,
                    file: asset.file || undefined,
                    preview: asset.preview,
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
                fromIdx = prev.findIndex((item) => item.id === fromIndexOrId);
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
            const updated = prev.filter((item) => item.id !== clipId);

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

    // ── AI Command Agent action executor ──────────────────────────────────────
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
                            const currentIndex = mediaItems.findIndex((item: any) => item.id === id);
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
                console.warn("⚠️ [TRANSITIONS] No active clip selected");
                return;
            }

            setIsPlaying(false);
            if (videoRef.current) {
                videoRef.current.pause();
            }

            console.log("📝 [TRANSITIONS] Applying transition to clip", {
                clipId: activePreviewId,
                transition,
                allClipTransitions: clipTransitions
            });

            // Save transition to state - this is what gets sent to the backend
            setClipTransitions((prev) => {
                const updated = { ...prev, [activePreviewId]: transition };
                console.log("✅ [TRANSITIONS] Transition saved to state", {
                    clipId: activePreviewId,
                    transition,
                    updated
                });
                saveToUndo(mediaItems, updated);
                return updated;
            });

            const currentIndex = mediaItems.findIndex((item) => item.id === activePreviewId);
            if (currentIndex !== -1) {
                const activeItem = mediaItems[currentIndex];
                const trim = getTrimRangeForItem(activeItem.id, activeItem.duration);
                
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
            console.error("❌ [TRANSITIONS] Error applying transition:", error);
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
                const startA = clipStartOverrides[a.id] !== undefined ? clipStartOverrides[a.id] : 0;
                const startB = clipStartOverrides[b.id] !== undefined ? clipStartOverrides[b.id] : 0;
                return startA - startB;
            })
            .filter((item) => item.file)
            .map((item) => {
                const settings = clipSettings[item.id] || {};
                const isCurrent = item.id === activePreviewId;
                return {
                    id: item.id,
                    file: item.file,
                    type: item.type,
                    duration: item.duration,
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
            transition: clipTransitions[item.id] || 'none',
        }));

        console.log("🎬 [GENERATE] Transition plan created:", {
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
                    id: item.id,
                    type: item.type,
                    duration: item.duration,
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
        console.log("📤 [QUICK-EDIT] Sending to processing screen:", {
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
                title: `${mediaItems.length > 0 ? mediaItems.length + ' Media Items' : 'Quick Edit'} • ${editingStyles.find(s => s.id === selectedStyle)?.title || selectedStyle}`,
                description: `Ratio: ${formattedRatio} • FPS: ${fps} • Quality: ${exportQuality}`,
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
            const activeFile = mediaItems.find((item: any) => item.id === activePreviewId)?.file || mediaItems[0]?.file;
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
                    id: selectedMusic.id,
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

            {/* Main Multi-Pane Studio Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative z-10">

                {/* Top Part of Workspace: Three Column Layout */}
                <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden border-b border-white/10">

                    {/* Left Column: Filmora-style panel with icon tab rail + content */}
                    <aside className="w-full md:w-[420px] flex-none flex bg-[#0B1020]/40 backdrop-blur-md overflow-hidden relative border-r border-white/10 order-2 md:order-1">

                        {/* ── Icon Tab Rail (far left, like Filmora) ── */}
                        {(() => {
                            const leftTabs = [
                                { id: 'media',       icon: Film,         label: 'Media'       },
                                { id: 'stock',       icon: Crown,        label: 'Stock Media' },
                            ] as const;

                            return (
                                <div className="flex h-full w-full">

                                    {/* ── Narrow icon tab strip ── */}
                                    <div className="flex-none w-[72px] flex flex-col items-center gap-1 py-3 bg-[#07080f] border-r border-white/[0.06]">
                                        {leftTabs.map((tab) => {
                                            const Icon = tab.icon;
                                            const isActive = leftTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => {
                                                        setLeftTab(tab.id as any);
                                                        if ((tab.id as string) === 'titles') {
                                                            setActiveTool('text-tool');
                                                        } else if ((tab.id as string) === 'captions') {
                                                            setActiveTool('captions');
                                                        } else if (activeTool === 'text-tool' || activeTool === 'captions') {
                                                            setActiveTool(null);
                                                        }
                                                    }}
                                                    title={tab.label}
                                                    className={`relative flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-xl transition-all duration-200 group ${
                                                        isActive
                                                            ? 'bg-purple-500/15 text-purple-300'
                                                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                                    }`}
                                                >
                                                    {isActive && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-purple-400 rounded-r-full" />
                                                    )}
                                                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-purple-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                                    <span className={`text-[8px] font-bold uppercase tracking-wide leading-none text-center px-0.5 ${isActive ? 'text-purple-300' : 'text-slate-600 group-hover:text-slate-400'}`}>
                                                        {tab.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* ── Content panel ── */}
                                    <div className="flex-1 flex flex-col min-w-0 bg-[#0b0d26]">

                                        {/* Panel header */}
                                        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06] shrink-0">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">
                                                {leftTab === 'media'       && 'Media Library'}
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

                                        {/* ── TITLES panel ── */}
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

                                        {/* ── TRANSITIONS panel ── */}
                                        {leftTab === 'transitions' && (
                                            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar flex flex-col min-h-0">
                                                {/* Active clip indicator */}
                                                <div className={`mb-3 px-2.5 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wider text-center border shrink-0 ${
                                                    activePreviewId
                                                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                                                        : 'bg-white/[0.03] border-white/5 text-slate-500'
                                                }`}>
                                                    {activePreviewId ? `Clip selected · drag to apply` : 'Select a clip from the timeline first'}
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

                                        {/* ── EFFECTS panel ── */}
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

                                        {/* ── FILTERS panel ── */}
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
                                         })()}{/* ── MEDIA panel (Wondershare Filmora-style Left Column Media Pool) ── */}
                                        {leftTab === 'media' && (
                                            <div className="flex-1 flex min-h-0 overflow-hidden bg-[#07080f]">
                                                {/* Category rail */}
                                                <div className="w-[100px] flex-none flex flex-col border-r border-white/[0.05] bg-[#07080f] py-1.5 overflow-y-auto custom-scrollbar">
                                                    {[
                                                        { label: 'Project Media', active: true },
                                                        { label: 'Folder', indent: true },
                                                        { label: 'Global Media' },
                                                        { label: 'Cloud Media', indent: true },
                                                        { label: 'Audio' },
                                                        { label: 'Favorites' },
                                                    ].map(({ label, active, indent }) => (
                                                        <button
                                                            key={label}
                                                            className={`w-full text-left px-2 py-2 text-[9px] font-bold transition-colors truncate
                                                                ${active ? 'text-purple-300 bg-white/5 border-l-2 border-purple-500' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'}
                                                                ${indent ? 'pl-4' : ''}`}
                                                        >
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Main media list area */}
                                                <div className="flex-1 min-w-0 flex flex-col bg-[#0b0d26]">
                                                    {/* Toolbar */}
                                                    <div className="h-9 flex-none flex items-center gap-1.5 px-2 border-b border-white/[0.05] bg-[#090b14]">
                                                        <button
                                                            onClick={() => mediaInputRef.current?.click()}
                                                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                                        >
                                                            <Upload className="w-3 h-3" />
                                                            <span>Import</span>
                                                        </button>
                                                        <div className="flex-1" />
                                                    </div>

                                                    {/* Media content */}
                                                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                                        {libraryAssets.length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center py-8">
                                                                <div
                                                                    onClick={() => mediaInputRef.current?.click()}
                                                                    className="w-16 h-16 rounded-xl bg-black/40 border border-white/[0.07] flex items-center justify-center mb-3 cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group"
                                                                >
                                                                    <Plus className="w-5 h-5 text-slate-500 group-hover:text-purple-400" />
                                                                </div>
                                                                <span className="text-[9px] text-slate-500 font-bold text-center">Import Media</span>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {libraryAssets.map((item) => (
                                                                    <div
                                                                        key={item.id}
                                                                        onClick={() => selectPreviewWithTransition(item.id)}
                                                                        draggable="true"
                                                                        onDragStart={(e: any) => { e.dataTransfer.setData('clipId', item.id); }}
                                                                        className={`group relative aspect-video rounded-lg border transition-all cursor-pointer overflow-hidden bg-slate-900
                                                                            ${activePreviewId === item.id
                                                                                ? 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                                                                                : 'border-white/[0.06] hover:border-white/20'}`}
                                                                    >
                                                                        {item.type === 'video' ? (
                                                                            <video
                                                                                ref={(el) => { thumbnailVideoRefs.current[item.id] = el; }}
                                                                                src={item.preview}
                                                                                className="w-full h-full object-cover"
                                                                                muted playsInline preload="metadata"
                                                                            />
                                                                        ) : (
                                                                            <img src={item.preview} alt="" className="w-full h-full object-cover" loading="lazy" />
                                                                        )}
                                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); removeLibraryAsset(item.id); }}
                                                                                className="p-1 rounded-md bg-rose-500/80 text-white hover:bg-rose-500 transition-colors"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>
                                                                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[7px] font-black text-white/70 uppercase">
                                                                            {item.type}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── STOCK MEDIA panel ── */}
                                        {leftTab === 'stock' && (
                                            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar flex flex-col gap-3 bg-[#0b0d26]">
                                                <div className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">Premium Stock Media</div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['Nature', 'Cityscapes', 'Abstract', 'Slow Motion', 'Vlog Clips', 'Intro Backgrounds'].map((c) => (
                                                        <div key={c} className="group relative aspect-video rounded-xl bg-slate-900 border border-white/5 overflow-hidden flex flex-col justify-end p-2 cursor-pointer hover:border-purple-500/40">
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                                                            <span className="relative z-10 text-[9px] font-bold text-white uppercase">{c}</span>
                                                            <span className="relative z-10 text-[7px] text-purple-400 font-mono font-medium">Free stock</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* ── AUDIO library panel ── */}
                                        {leftTab === 'audio' && (
                                            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar flex flex-col gap-3 bg-[#0b0d26]">
                                                <div className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">Audio & Sound FX</div>
                                                <div className="flex flex-col gap-2">
                                                    {[
                                                        { name: 'Upbeat Summer Pop', dur: '2:45', mood: 'Cheerful' },
                                                        { name: 'Cinematic Ambient Pad', dur: '4:12', mood: 'Atmospheric' },
                                                        { name: 'Lo-Fi Chill Beats', dur: '3:10', mood: 'Relaxed' },
                                                        { name: 'Tech Sound FX Pack', dur: '0:18', mood: 'Short' },
                                                    ].map((track) => (
                                                        <div key={track.name} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors cursor-pointer group">
                                                            <div className="min-w-0">
                                                                <div className="text-[10px] font-bold text-slate-200 truncate group-hover:text-white">{track.name}</div>
                                                                <div className="text-[8px] text-slate-500">{track.mood}</div>
                                                            </div>
                                                            <span className="text-[8px] font-mono text-slate-400">{track.dur}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* ── FRAMES panel ── */}
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


                                        {/* ── TOOLS panel ── */}
                                        {leftTab === 'tools' && (
                                            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                                                {activeTool ? (
                                                    <div className="space-y-3">
                                                        <button
                                                            onClick={() => setActiveTool(null)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-black uppercase tracking-wider text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
                                                        >
                                                            ← Back to Tools
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
                                                                <AspectRatioCard label="Custom" ratio="Custom" icon={SlidersHorizontal} description={aspectRatio.name === 'Custom' ? `${aspectRatio.width} × ${aspectRatio.height}` : "Width × Height"} isSelected={aspectRatio.name === 'Custom'} onClick={() => setIsCustomFrameOpen(true)} />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                    </div>{/* end content panel */}
                                </div>
                            );
                        })()}

                    </aside>

                    {/* Center Column: Video Monitor */}
                    <section className="flex-1 flex flex-col bg-black/15 relative overflow-hidden order-1 md:order-2">
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
                                                const showCanvas = isPro || CANVAS_PREVIEW_EFFECTS.includes(selectedEffect) || CANVAS_PREVIEW_FILTERS.includes(selectedFilter);
                                                return (
                                                    <>
                                                        <video
                                                            ref={videoRef}
                                                            key="main-editor-video-preview"
                                                            onTimeUpdate={handleTimeUpdate}
                                                            onEnded={() => {
                                                                if (lastTriggeredEndRef.current !== activePreviewItem.id) {
                                                                    lastTriggeredEndRef.current = activePreviewItem.id;
                                                                    console.log("📹 [PLAYBACK] Clip reached end in onEnded:", activePreviewItem.id);
                                                                    playNextMedia(activePreviewItem.id);
                                                                }
                                                            }}
                                                            onLoadStart={() => {
                                                                console.log("📹 [PLAYBACK] onLoadStart");
                                                            }}
                                                            onLoadedMetadata={() => {
                                                                console.log("📹 [PLAYBACK] onLoadedMetadata");
                                                                if (selectedEffect === 'fade-in') setPreviewOpacity(0);
                                                                else setPreviewOpacity(1);
                                                                if (selectedEffect !== 'zoom') setPreviewZoom(1);
                                                            }}
                                                            onLoadedData={() => {
                                                                console.log("📹 [PLAYBACK] onLoadedData, videoRef.current exists:", !!videoRef.current);
                                                                // Reset current time to trim start when new video is loaded
                                                                if (videoRef.current) {
                                                                    const activeItem = mediaItems.find(i => i.id === activePreviewId);
                                                                    if (activeItem?.type === 'video') {
                                                                        const targetStart = getTargetStartTime(activeItem);
                                                                        const videoElement = videoRef.current;
                                                                        videoElement.currentTime = targetStart;
                                                                        console.log("📹 [PLAYBACK] Video loaded, current time set to:", targetStart, "isPlaying:", isPlaying);

                                                                        // Clear the pending seek offset once applied
                                                                        if (pendingTransitionSeekRef.current && pendingTransitionSeekRef.current.clipId === activePreviewId) {
                                                                            pendingTransitionSeekRef.current = null;
                                                                        }

                                                                        safePlay(videoElement);
                                                                    } else {
                                                                        videoRef.current.currentTime = 0;
                                                                    }
                                                                }
                                                            }}
                                                            onCanPlay={(e) => {
                                                                const videoElement = e.currentTarget;
                                                                console.log("📹 [PLAYBACK] onCanPlay fired, isPlaying:", isPlaying, "videoElement:", !!videoElement);
                                                                safePlay(videoElement);
                                                            }}
                                                            onSeeked={(e) => {
                                                                const videoElement = e.currentTarget;
                                                                console.log("📹 [PLAYBACK] onSeeked fired, isPlaying:", isPlaying, "paused:", videoElement.paused);
                                                                safePlay(videoElement);
                                                            }}
                                                            onError={(e) => {
                                                                console.error("📹 [PLAYBACK] Video error:", e);
                                                            }}
                                                            src={activePreviewItem.preview}
                                                            className={showCanvas ? 'opacity-0 absolute pointer-events-none w-0 h-0' : `w-full h-full ${clipSettings[activePreviewId]?.fill ? 'object-cover' : 'object-contain'}`}
                                                            style={{
                                                                opacity: selectedEffect === 'fade-in' ? previewOpacity : (clipSettings[activePreviewId]?.opacity ?? 100) / 100,
                                                                filter: getCombinedPreviewFilterCss(),
                                                                transform: getCombinedPreviewTransform(),
                                                                clipPath: getPreviewClipPath(),
                                                                transformOrigin: 'center center',
                                                                borderRadius: `${cornerRadius}px`,
                                                                border: clipSettings[activePreviewId]?.border ? `2px solid white` : 'none',
                                                                backgroundColor: clipSettings[activePreviewId]?.bg || 'transparent'
                                                            }}
                                                            muted={isMuted}
                                                            playsInline
                                                        />
                                                        {showCanvas && (
                                                            <canvas
                                                                ref={greenScreenCanvasRef}
                                                                className={`w-full h-full ${clipSettings[activePreviewId]?.fill ? 'object-cover' : 'object-contain'}`}
                                                                style={{
                                                                    opacity: selectedEffect === 'fade-in' ? previewOpacity : (clipSettings[activePreviewId]?.opacity ?? 100) / 100,
                                                                    filter: getCombinedPreviewFilterCss(),
                                                                    transform: getCombinedPreviewTransform(),
                                                                    clipPath: getPreviewClipPath(),
                                                                    transformOrigin: 'center center',
                                                                    borderRadius: `${cornerRadius}px`,
                                                                    border: clipSettings[activePreviewId]?.border ? `2px solid white` : 'none',
                                                                    backgroundColor: clipSettings[activePreviewId]?.bg || 'transparent'
                                                                }}
                                                            />
                                                        )}
                                                    </>
                                                );
                                            })() : (
                                                <>
                                                    <img
                                                        src={activePreviewItem.preview}
                                                        className={`w-full h-full ${clipSettings[activePreviewId]?.fill ? 'object-cover' : 'object-contain'}`}
                                                        style={{
                                                            opacity: selectedEffect === 'fade-in' ? previewOpacity : (clipSettings[activePreviewId]?.opacity ?? 100) / 100,
                                                            filter: getCombinedPreviewFilterCss(),
                                                            transform: getCombinedPreviewTransform(),
                                                            clipPath: getPreviewClipPath(),
                                                            transformOrigin: 'center center',
                                                            borderRadius: `${cornerRadius}px`,
                                                            border: clipSettings[activePreviewId]?.border ? `2px solid white` : 'none',
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

                                {overlayText.trim().length > 0 && (
                                    <div
                                        className="absolute z-40 pointer-events-none select-none text-center"
                                        style={{
                                            left: `${overlayPosX}%`,
                                            top: `${overlayPosY}%`,
                                            transform: overlayTextStylePreset === 'motion-tracking-text'
                                                ? `translate(-50%, -50%) translateX(${Math.sin((progress / 100) * Math.PI * 2) * 12}px)`
                                                : 'translate(-50%, -50%)',
                                            maxWidth: '88%',
                                            ...getOverlayTextStylePresetCss(overlayTextStylePreset),
                                            background: overlayBgEnabled ? `${overlayBgColorHex}cc` : getOverlayTextStylePresetCss(overlayTextStylePreset).background,
                                            padding: overlayBgEnabled ? '4px 12px' : getOverlayTextStylePresetCss(overlayTextStylePreset).padding,
                                            borderRadius: overlayBgEnabled ? '6px' : getOverlayTextStylePresetCss(overlayTextStylePreset).borderRadius,
                                        }}
                                    >
                                        {overlayText}
                                    </div>
                                )}

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

                                {/* Read Line — sweeps across the preview in sync with video playback */}
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

                                {/* Caption overlay — visible when a caption is active at current playback time */}
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

                                {/* HUD Overlay Badges */}
                                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-40 max-w-[80%]">
                                    {Math.abs(speedValue - 1) > 0.001 && <div className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-400/30 text-[8px] font-black uppercase text-purple-200">Speed {speedValue.toFixed(2)}x</div>}
                                    {hasTrimApplied && activePreviewId && <div className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-[8px] font-black uppercase text-emerald-200">Trimmed</div>}
                                    {rotationDegrees % 360 !== 0 && <div className="px-1.5 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-400/30 text-[8px] font-black uppercase text-fuchsia-200">Rotated {rotationDegrees}°</div>}
                                    {isMuted && <div className="px-1.5 py-0.5 rounded bg-red-500/20 border border-red-400/30 text-[8px] font-black uppercase text-red-200">Muted</div>}
                                    {zoomToolAmount > 1.001 && <div className="px-1.5 py-0.5 rounded bg-yellow-500/20 border border-yellow-400/30 text-[8px] font-black uppercase text-yellow-200">Zoom {zoomToolAmount.toFixed(2)}x</div>}
                                </div>

                            </motion.div>
                        </div>

                        {/* Video Player Transport Bar */}
                        <div className="h-12 border-t border-white/10 bg-black/35 flex items-center justify-between px-6 z-10 flex-none select-none">
                            {/* Timeline Time Code display */}
                            <div className="font-mono text-[10px] text-slate-400 tracking-wider">
                                {activePreviewId && activePreviewItem ? (
                                    <span>
                                        00:00:
                                        {Math.floor((progress * activePreviewItem.duration) / 100).toString().padStart(2, '0')}
                                        :
                                        {Math.floor((progress * fps) % fps).toString().padStart(2, '0')}
                                    </span>
                                ) : (
                                    <span>00:00:00:00</span>
                                )}
                            </div>

                            {/* Hardware Transport Deck buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={undo}
                                    disabled={historyIndex <= 0}
                                    className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                                >
                                    <Undo2 className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => {
                                        setIsPlaying(false);
                                        setProgress(0);
                                        setReadLinePosition(0);
                                        // Go back to first clip
                                        const firstId = mediaItems[0]?.id ?? null;
                                        if (firstId) setActivePreviewId(firstId);
                                        // Reset video to trim start
                                        if (videoRef.current) {
                                            const firstItem = mediaItems[0];
                                            if (firstItem?.type === 'video') {
                                                const trim = getTrimRangeForItem(firstItem.id, firstItem.duration);
                                                videoRef.current.currentTime = trim.start;
                                                videoRef.current.pause();
                                            }
                                        }
                                        if (audioRef.current) {
                                            audioRef.current.currentTime = 0;
                                            audioRef.current.pause();
                                        }
                                        if (bgMusicRef.current) {
                                            bgMusicRef.current.currentTime = 0;
                                            bgMusicRef.current.pause();
                                        }
                                    }}
                                    className="p-1 text-slate-400 hover:text-white transition-colors"
                                    title="Reset to beginning"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => moveReadLine(-10)}
                                    className="p-1.5 text-slate-400 hover:text-white transition-all duration-150 active:scale-95 cursor-pointer hover:bg-white/5 rounded-lg"
                                    title="Back 10s (Left Arrow)"
                                >
                                    <Rewind className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={togglePlay}
                                    className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-[#0B1020] hover:scale-105 active:scale-95 transition-all shadow-md shadow-purple-500/10"
                                >
                                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                </button>

                                <button
                                    onClick={() => moveReadLine(10)}
                                    className="p-1.5 text-slate-400 hover:text-white transition-all duration-150 active:scale-95 cursor-pointer hover:bg-white/5 rounded-lg"
                                    title="Forward 10s (Right Arrow)"
                                >
                                    <FastForward className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="p-1 text-slate-400 hover:text-white transition-colors"
                                >
                                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
                                </button>

                                <button
                                    onClick={redo}
                                    disabled={historyIndex >= history.length - 1}
                                    className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                                >
                                    <Redo2 className="w-4 h-4" />
                                </button>

                                <div className="w-[1px] h-4 bg-white/10 mx-1" />

                                {/* Read-line toggle */}
                                <button
                                    onClick={() => setShowReadLine(v => !v)}
                                    title={showReadLine ? 'Hide Read Line' : 'Show Read Line'}
                                    className={`p-1 rounded transition-all ${showReadLine ? 'text-purple-400 bg-purple-500/15' : 'text-slate-500 hover:text-white'
                                        }`}
                                >
                                    <ScanLine className="w-4 h-4" />
                                </button>

                                {showReadLine && (
                                    <>
                                        <button
                                            onClick={() => moveReadLine(-1)}
                                            title="Move Read Line Left"
                                            className="p-1 rounded transition-all text-slate-400 hover:text-white hover:bg-white/5"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => moveReadLine(1)}
                                            title="Move Read Line Right"
                                            className="p-1 rounded transition-all text-slate-400 hover:text-white hover:bg-white/5"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setReadLineDirection(d => d === 'horizontal' ? 'vertical' : 'horizontal')}
                                            title={`Direction: ${readLineDirection}`}
                                            className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-purple-500/30 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-all"
                                        >
                                            {readLineDirection === 'horizontal' ? '↔' : '↕'}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* FPS & Ratio status info */}
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                {formattedRatio} • {fps} FPS
                            </div>
                        </div>

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

                    {/* Right Column: Inspector Panel (Filmora-style) */}
                    <motion.aside
                        initial={false}
                        animate={{ width: isMediaPoolVisible ? (isMobile ? '100%' : 340) : 0, opacity: isMediaPoolVisible ? 1 : 0 }}
                        className="flex-none flex flex-col border-l border-white/[0.06] overflow-hidden select-none order-3 bg-[#090b16] text-xs z-20"
                    >
                        <div className={`${isMobile ? 'w-full' : 'w-[340px]'} h-full flex flex-col min-h-0`}>
                            {/* Tab Rail Header */}
                            <div className="h-10 flex-none border-b border-white/[0.05] bg-[#07080f] flex items-center px-1 gap-1">
                                {(['video', 'audio', 'speed', 'animation', 'color'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setInspectorTab(tab)}
                                        className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider text-center rounded-md transition-colors cursor-pointer ${
                                            inspectorTab === tab
                                                ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                                                : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Sub Tabs for Video */}
                            {inspectorTab === 'video' && (
                                <div className="h-8 flex-none border-b border-white/[0.03] bg-black/10 flex items-center px-2 gap-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                    {(['basic', 'mask', 'ai-matte'] as const).map(subTab => (
                                        <button
                                            key={subTab}
                                            onClick={() => setInspectorSubTab(subTab)}
                                            className={`transition-colors relative py-1 ${
                                                inspectorSubTab === subTab
                                                    ? 'text-purple-300'
                                                    : 'hover:text-slate-200'
                                            }`}
                                        >
                                            {subTab}
                                            {inspectorSubTab === subTab && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400 rounded-full" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Main Inspector Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-slate-300">
                                
                                {/* ── VIDEO -> BASIC TAB ── */}
                                {inspectorTab === 'video' && inspectorSubTab === 'basic' && (
                                    <div className="space-y-4">
                                        
                                        {/* TRANSFORM SECTION */}
                                        <div className="border border-white/[0.05] rounded-xl bg-black/25 overflow-hidden">
                                            <div className="flex items-center justify-between px-3 py-2.5 bg-white/[0.02] border-b border-white/[0.05]">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isTransformEnabled}
                                                        onChange={e => setIsTransformEnabled(e.target.checked)}
                                                        className="rounded border-white/20 accent-purple-500 bg-black/40 w-3 h-3 cursor-pointer"
                                                    />
                                                    <span className="font-bold text-[10px] uppercase tracking-wider text-slate-200">Transform</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <KeyframeButton active={hasTransformKeyframe} onClick={() => setHasTransformKeyframe(!hasTransformKeyframe)} />
                                                    <button
                                                        onClick={() => setIsTransformExpanded(!isTransformExpanded)}
                                                        className="text-slate-500 hover:text-slate-200 cursor-pointer"
                                                    >
                                                        {isTransformExpanded ? <ChevronLeft className="w-3.5 h-3.5 rotate-90" /> : <ChevronLeft className="w-3.5 h-3.5 -rotate-90" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {isTransformExpanded && (
                                                <div className={`p-3 space-y-3.5 ${!isTransformEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
                                                    
                                                    {/* Scale Width / Height */}
                                                    <div className="flex items-end gap-2.5">
                                                        <div className="flex-1 space-y-1.5">
                                                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                                <span>SCALE (WIDTH)</span>
                                                                <span className="font-mono text-purple-400">{(zoomToolAmountX * 100).toFixed(0)}%</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="range"
                                                                    min="0.1"
                                                                    max="3.0"
                                                                    step="0.01"
                                                                    value={zoomToolAmountX}
                                                                    onChange={e => {
                                                                        const val = Number(e.target.value);
                                                                        setZoomToolAmountX(val);
                                                                        if (isAspectLocked) {
                                                                            setZoomToolAmountY(val);
                                                                            setZoomToolAmount(val);
                                                                        }
                                                                    }}
                                                                    className="flex-1 accent-purple-500 h-1 bg-white/10 rounded-full cursor-pointer"
                                                                />
                                                                <button
                                                                    onClick={() => setIsAspectLocked(!isAspectLocked)}
                                                                    className={`p-1 rounded border transition-colors cursor-pointer ${
                                                                        isAspectLocked
                                                                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                                                            : 'bg-white/5 text-slate-500 border-white/10 hover:text-slate-300'
                                                                    }`}
                                                                    title="Lock Aspect Ratio"
                                                                >
                                                                    <SlidersHorizontal className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <KeyframeButton active={hasWidthKeyframe} onClick={() => setHasWidthKeyframe(!hasWidthKeyframe)} />
                                                    </div>

                                                    <div className="flex items-end gap-2.5">
                                                        <div className="flex-1 space-y-1.5">
                                                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                                <span>SCALE (HEIGHT)</span>
                                                                <span className="font-mono text-purple-400">{(zoomToolAmountY * 100).toFixed(0)}%</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="0.1"
                                                                max="3.0"
                                                                step="0.01"
                                                                value={zoomToolAmountY}
                                                                onChange={e => {
                                                                    const val = Number(e.target.value);
                                                                    setZoomToolAmountY(val);
                                                                    if (isAspectLocked) {
                                                                        setZoomToolAmountX(val);
                                                                        setZoomToolAmount(val);
                                                                    }
                                                                }}
                                                                className="w-full accent-purple-500 h-1 bg-white/10 rounded-full cursor-pointer"
                                                            />
                                                        </div>
                                                        <KeyframeButton active={hasHeightKeyframe} onClick={() => setHasHeightKeyframe(!hasHeightKeyframe)} />
                                                    </div>

                                                    {/* Position X / Y */}
                                                    <div className="flex items-end gap-2.5">
                                                        <div className="flex-1 grid grid-cols-2 gap-3.5">
                                                            <div className="space-y-1">
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">POSITION X</span>
                                                                <div className="flex items-center bg-black/40 border border-white/10 rounded px-2 py-1">
                                                                    <input
                                                                        type="number"
                                                                        value={posX}
                                                                        onChange={e => setPosX(Number(e.target.value))}
                                                                        className="w-full bg-transparent focus:outline-none text-white text-[11px] font-mono"
                                                                    />
                                                                    <span className="text-[9px] text-slate-600 font-bold ml-1">px</span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">POSITION Y</span>
                                                                <div className="flex items-center bg-black/40 border border-white/10 rounded px-2 py-1">
                                                                    <input
                                                                        type="number"
                                                                        value={posY}
                                                                        onChange={e => setPosY(Number(e.target.value))}
                                                                        className="w-full bg-transparent focus:outline-none text-white text-[11px] font-mono"
                                                                    />
                                                                    <span className="text-[9px] text-slate-600 font-bold ml-1">px</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <KeyframeButton active={hasPositionKeyframe} onClick={() => setHasPositionKeyframe(!hasPositionKeyframe)} />
                                                    </div>

                                                    {/* Rotation degrees */}
                                                    <div className="flex items-end gap-2.5">
                                                        <div className="flex-1 space-y-1.5">
                                                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                                <span>ROTATE</span>
                                                                <span className="font-mono text-purple-400">{rotationDegrees}°</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="range"
                                                                    min="-180"
                                                                    max="180"
                                                                    value={rotationDegrees}
                                                                    onChange={e => setRotationDegrees(Number(e.target.value))}
                                                                    className="flex-1 accent-purple-500 h-1 bg-white/10 rounded-full cursor-pointer"
                                                                />
                                                                <button
                                                                    onClick={() => setRotationDegrees(0)}
                                                                    className="text-[9px] font-bold text-slate-500 hover:text-white uppercase transition-colors cursor-pointer"
                                                                >
                                                                    Reset
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <KeyframeButton active={hasRotateKeyframe} onClick={() => setHasRotateKeyframe(!hasRotateKeyframe)} />
                                                    </div>

                                                    {/* Flip Horizontal / Vertical */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">FLIP</span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setFlipH(!flipH)}
                                                                className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold transition-all cursor-pointer ${
                                                                    flipH
                                                                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                                                        : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                                                                }`}
                                                            >
                                                                Horizontal
                                                            </button>
                                                            <button
                                                                onClick={() => setFlipV(!flipV)}
                                                                className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold transition-all cursor-pointer ${
                                                                    flipV
                                                                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                                                        : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                                                                }`}
                                                            >
                                                                Vertical
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Corner Radius */}
                                                    <div className="flex items-end gap-2.5">
                                                        <div className="flex-1 space-y-1.5">
                                                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                                <span>CORNER RADIUS</span>
                                                                <span className="font-mono text-purple-400">{cornerRadius}px</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                value={cornerRadius}
                                                                onChange={e => setCornerRadius(Number(e.target.value))}
                                                                className="w-full accent-purple-500 h-1 bg-white/10 rounded-full cursor-pointer"
                                                            />
                                                        </div>
                                                        <KeyframeButton active={hasRadiusKeyframe} onClick={() => setHasRadiusKeyframe(!hasRadiusKeyframe)} />
                                                    </div>

                                                </div>
                                            )}
                                        </div>

                                        {/* COMPOSITING SECTION */}
                                        <div className="border border-white/[0.05] rounded-xl bg-black/25 overflow-hidden">
                                            <div className="flex items-center justify-between px-3 py-2.5 bg-white/[0.02] border-b border-white/[0.05]">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isCompositingEnabled}
                                                        onChange={e => setIsCompositingEnabled(e.target.checked)}
                                                        className="rounded border-white/20 accent-purple-500 bg-black/40 w-3 h-3 cursor-pointer"
                                                    />
                                                    <span className="font-bold text-[10px] uppercase tracking-wider text-slate-200">Compositing</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <KeyframeButton active={hasCompositingKeyframe} onClick={() => setHasCompositingKeyframe(!hasCompositingKeyframe)} />
                                                    <button
                                                        onClick={() => setIsCompositingExpanded(!isCompositingExpanded)}
                                                        className="text-slate-500 hover:text-slate-200 cursor-pointer"
                                                    >
                                                        {isCompositingExpanded ? <ChevronLeft className="w-3.5 h-3.5 rotate-90" /> : <ChevronLeft className="w-3.5 h-3.5 -rotate-90" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {isCompositingExpanded && (
                                                <div className={`p-3 space-y-4 ${!isCompositingEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
                                                    
                                                    {/* Opacity slider */}
                                                    <div className="flex items-end gap-2.5">
                                                        <div className="flex-1 space-y-1.5">
                                                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                                <span>OPACITY</span>
                                                                <span className="font-mono text-purple-400">{(previewOpacity * 100).toFixed(0)}%</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1"
                                                                step="0.01"
                                                                value={previewOpacity}
                                                                onChange={e => setPreviewOpacity(Number(e.target.value))}
                                                                className="w-full accent-purple-500 h-1 bg-white/10 rounded-full cursor-pointer"
                                                            />
                                                        </div>
                                                        <KeyframeButton active={hasOpacityKeyframe} onClick={() => setHasOpacityKeyframe(!hasOpacityKeyframe)} />
                                                    </div>

                                                    {/* Compositing features switches */}
                                                    <div className="space-y-2 text-[10px] font-bold text-slate-400">
                                                        {[
                                                            { label: 'Background Color', val: compositingBg, set: setCompositingBg },
                                                            { label: 'Drop Shadow', val: compositingShadow, set: setCompositingShadow },
                                                            { label: 'AI Eye Contact Fix', val: compositingEyeContact, set: setCompositingEyeContact },
                                                            { label: 'AI Smart Refocus', val: compositingRefocus, set: setCompositingRefocus },
                                                            { label: 'Dynamic Relighting', val: compositingRelight, set: setCompositingRelight },
                                                        ].map(feat => (
                                                            <div key={feat.label} className="flex items-center justify-between py-1 border-b border-white/[0.03] last:border-0">
                                                                <span>{feat.label}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={feat.val}
                                                                        onChange={e => feat.set(e.target.checked)}
                                                                        className="rounded border-white/20 accent-purple-500 bg-black/40 w-3 h-3 cursor-pointer"
                                                                    />
                                                                    <KeyframeButton 
                                                                        active={!!compositingKeyframes[feat.label]} 
                                                                        onClick={() => toggleCompositingKeyframe(feat.label)} 
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                </div>
                                            )}
                                        </div>

                                    </div>
                                )}

                                {/* ── VIDEO -> MASK & AI MATTE PLACEHOLDERS ── */}
                                {inspectorTab === 'video' && inspectorSubTab !== 'basic' && (
                                    <div className="flex flex-col h-full items-center justify-center py-2 text-center gap-2">
                                        {inspectorSubTab === 'ai-matte' ? (
                                            <div className="w-full h-[320px] bg-black/20 rounded-xl overflow-hidden p-2">
                                                <CommandAgentPanel onExecuteActions={handleCommandActions} />
                                            </div>
                                        ) : (
                                            <>
                                                <Wand2 className="w-8 h-8 text-purple-400 animate-pulse mt-8" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">{inspectorSubTab} Controls</span>
                                                <span className="text-[9px] text-slate-500 max-w-[200px]">Advanced AI tools are ready to analyze and map targets. Click generate to apply.</span>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* ── AUDIO TAB ── */}
                                {inspectorTab === 'audio' && (
                                    <div className="space-y-4">
                                        <div className="border border-white/[0.05] rounded-xl bg-black/25 p-3.5 space-y-3.5">
                                            <div className="flex items-center justify-between">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Volume Settings</div>
                                                <KeyframeButton active={hasAudioKeyframe} onClick={() => setHasAudioKeyframe(!hasAudioKeyframe)} />
                                            </div>
                                            
                                            <div className="flex items-end gap-2.5">
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                        <span>GAIN LEVEL</span>
                                                        <span className="font-mono text-purple-400">{(volumeLevel * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="2"
                                                        step="0.05"
                                                        value={volumeLevel}
                                                        onChange={e => setVolumeLevel(Number(e.target.value))}
                                                        className="w-full accent-purple-500 h-1 bg-white/10 rounded-full cursor-pointer"
                                                    />
                                                </div>
                                                <KeyframeButton active={hasGainKeyframe} onClick={() => setHasGainKeyframe(!hasGainKeyframe)} />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-slate-400">MUTE AUDIO CHANNEL</span>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isMuted}
                                                        onChange={e => setIsMuted(e.target.checked)}
                                                        className="rounded border-white/20 accent-purple-500 bg-black/40 w-3.5 h-3.5 cursor-pointer"
                                                    />
                                                    <KeyframeButton active={hasMuteKeyframe} onClick={() => setHasMuteKeyframe(!hasMuteKeyframe)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── SPEED TAB ── */}
                                {inspectorTab === 'speed' && (
                                    <div className="space-y-4">
                                        <div className="border border-white/[0.05] rounded-xl bg-black/25 p-3.5 space-y-3.5">
                                            <div className="flex items-center justify-between">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Speed Control</div>
                                                <KeyframeButton active={hasSpeedKeyframe} onClick={() => setHasSpeedKeyframe(!hasSpeedKeyframe)} />
                                            </div>
                                            
                                            <div className="flex items-end gap-2.5">
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                        <span>MULTIPLIER</span>
                                                        <span className="font-mono text-purple-400">{speedValue.toFixed(2)}x</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0.25"
                                                        max="4.00"
                                                        step="0.05"
                                                        value={speedValue}
                                                        onChange={e => setSpeedValue(Number(e.target.value))}
                                                        className="w-full accent-purple-500 h-1 bg-white/10 rounded-full cursor-pointer"
                                                    />
                                                </div>
                                                <KeyframeButton active={hasMultiplierKeyframe} onClick={() => setHasMultiplierKeyframe(!hasMultiplierKeyframe)} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── ANIMATION TAB ── */}
                                {inspectorTab === 'animation' && (
                                    <div className="space-y-4">
                                        <div className="border border-white/[0.05] rounded-xl bg-black/25 p-3.5 space-y-3.5">
                                            <div className="flex items-center justify-between">
                                                <div className="text-[11px] font-black uppercase tracking-wider text-slate-200">KEYFRAME EFFECTS</div>
                                                <KeyframeButton active={hasAnimationKeyframe} onClick={() => setHasAnimationKeyframe(!hasAnimationKeyframe)} />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">MOTION PATTERN</span>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {(['none', 'zoom-in', 'zoom-out', 'pulse'] as const).map(mode => (
                                                        <button
                                                            key={mode}
                                                            onClick={() => setKeyframeMode(mode)}
                                                            className={`py-4 text-[10px] font-black uppercase border rounded-xl transition-all cursor-pointer ${
                                                                keyframeMode === mode
                                                                    ? 'bg-[#1a0f24] text-purple-300 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                                                                    : 'bg-[#13141f] text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-200'
                                                            }`}
                                                        >
                                                            {mode}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {keyframeMode !== 'none' && (
                                                <div className="flex items-end gap-2.5 pt-1">
                                                    <div className="flex-1 space-y-1.5">
                                                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                            <span>EFFECT STRENGTH</span>
                                                            <span className="font-mono text-purple-400">{(keyframeAmount * 100).toFixed(0)}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="1.0"
                                                            max="2.0"
                                                            step="0.05"
                                                            value={keyframeAmount}
                                                            onChange={e => setKeyframeAmount(Number(e.target.value))}
                                                            className="w-full accent-purple-500 h-1 bg-white/10 rounded-full cursor-pointer"
                                                        />
                                                    </div>
                                                    <KeyframeButton active={hasStrengthKeyframe} onClick={() => setHasStrengthKeyframe(!hasStrengthKeyframe)} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── COLOR TAB ── */}
                                {inspectorTab === 'color' && (
                                    <div className="space-y-4">
                                        <div className="border border-white/[0.05] rounded-xl bg-black/25 p-3.5 space-y-3.5">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Color Correction</div>
                                            
                                            {/* Brightness */}
                                            <div className="flex items-end gap-2.5">
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                        <span>BRIGHTNESS</span>
                                                        <span className="font-mono text-purple-400">{brightness.toFixed(1)}</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min={0.5}
                                                        max={1.5}
                                                        step={0.05}
                                                        value={brightness}
                                                        onChange={e => setBrightness(Number(e.target.value))}
                                                        className="w-full accent-purple-500 h-1 bg-white/10 rounded-full cursor-pointer"
                                                    />
                                                </div>
                                                <KeyframeButton active={hasBrightnessKeyframe} onClick={() => setHasBrightnessKeyframe(!hasBrightnessKeyframe)} />
                                            </div>

                                            {/* Contrast */}
                                            <div className="flex items-end gap-2.5">
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                        <span>CONTRAST</span>
                                                        <span className="font-mono text-purple-400">{contrast.toFixed(1)}</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min={0.1}
                                                        max={3}
                                                        step={0.1}
                                                        value={contrast}
                                                        onChange={e => setContrast(Number(e.target.value))}
                                                        className="w-full accent-purple-500 h-1 bg-white/10 rounded-full cursor-pointer"
                                                    />
                                                </div>
                                                <KeyframeButton active={hasContrastKeyframe} onClick={() => setHasContrastKeyframe(!hasContrastKeyframe)} />
                                            </div>

                                            {/* Saturation */}
                                            <div className="flex items-end gap-2.5">
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                        <span>SATURATION</span>
                                                        <span className="font-mono text-purple-400">{saturation.toFixed(1)}</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={3}
                                                        step={0.1}
                                                        value={saturation}
                                                        onChange={e => setSaturation(Number(e.target.value))}
                                                        className="w-full accent-purple-500 h-1 bg-white/10 rounded-full cursor-pointer"
                                                    />
                                                </div>
                                                <KeyframeButton active={hasSaturationKeyframe} onClick={() => setHasSaturationKeyframe(!hasSaturationKeyframe)} />
                                            </div>

                                            {/* Reset Color Correction */}
                                            <button
                                                onClick={() => {
                                                    setBrightness(1);
                                                    setContrast(1);
                                                    setSaturation(1);
                                                }}
                                                className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[9px] font-black uppercase hover:bg-white/10 transition-colors cursor-pointer"
                                            >
                                                Reset Color Settings
                                            </button>
                                        </div>
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

                </div>

                {/* Bottom Panel: Multitrack Timeline lanes and Audio Mixer */}
                <div className={`${timelineSize === 'minimized' ? 'h-[120px]' :
                    timelineSize === 'maximized' ? 'h-[50vh]' : 'h-[38vh]'
                    } flex-none border-t border-white/10 bg-black/25 backdrop-blur-3xl flex flex-col overflow-hidden select-none transition-all duration-300`}>
                    {/* Timeline hub container */}
                    <div className="flex-1 overflow-hidden h-full px-4 pt-4">
                        <TimelineHub
                            session={session}
                            mediaItems={mediaItems}
                            currentTime={globalCurrentTime}
                            getClipGlobalStart={getClipGlobalStart}
                            audioTracks={audioTracks}
                            captions={captions}
                            currentCaption={currentCaption}
                                            setCurrentCaption={setCurrentCaption}
                            progress={progress}
                            handleTimelineClick={handleTimelineClick}
                            activePreviewId={activePreviewId}
                            setActivePreviewId={setActivePreviewId}
                            isPlaying={isPlaying}
                            setIsPlaying={setIsPlaying}
                            clipTrimRanges={clipTrimRanges}
                            setClipTrimRanges={setClipTrimRanges}
                            getTrimRangeForItem={getTrimRangeForItem}
                            videoRef={videoRef}
                            handleAddAudio={handleAddAudio}
                            handleAddVideo={() => mediaInputRef.current?.click()}
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
                        />
                    </div>
                    {/* BOTTOM TOOLBAR */}
                    <div className="w-full shrink-0 border-t border-white/5 flex items-center gap-6 overflow-x-auto px-4 py-3 no-scrollbar bg-[#140a24]">
                        <QuickToolsGrid 
                            QUICK_TOOLS={QUICK_TOOLS} 
                            activeTool={activeTool} 
                            setActiveTool={setActiveTool} 
                            copyActiveClip={copyActiveClip} 
                            setExpandedSections={setExpandedSections}
                            leftTab={leftTab}
                            setLeftTab={setLeftTab} 
                        />
                        {activePreviewId && (
                            <>
                                <div className="w-[1px] h-8 bg-white/10 shrink-0 mx-2" />
                                <ClipToolsGrid 
                                    tools={CLIP_TOOLS}
                                    onToolClick={(toolId: string) => {
                                        if (toolId === 'split') {
                                            window.dispatchEvent(new CustomEvent('trigger-timeline-split'));
                                        } else if (toolId === 'replace') {
                                            replaceInputRef.current?.click();
                                        } else if (toolId === 'delete') {
                                            handleDeleteClip(activePreviewId);
                                        } else if (toolId === 'mirror') {
                                            setClipSettings(prev => ({
                                                ...prev,
                                                [activePreviewId]: { ...prev[activePreviewId], mirror: !prev[activePreviewId]?.mirror }
                                            }));
                                        } else if (toolId === 'flip') {
                                            setClipSettings(prev => ({
                                                ...prev,
                                                [activePreviewId]: { ...prev[activePreviewId], flip: !prev[activePreviewId]?.flip }
                                            }));
                                        } else if (toolId === 'fill') {
                                            setClipSettings(prev => ({
                                                ...prev,
                                                [activePreviewId]: { ...prev[activePreviewId], fill: !prev[activePreviewId]?.fill }
                                            }));
                                        } else if (toolId === 'auto-captions') {
                                            setLeftTab('captions');
                                            setActiveTool('captions');
                                        } else if (['tts', 'denoise', 'voice-effect', 'reverse', 'freeze', 'stories', 'extract-audio'].includes(toolId)) {
                                            alert(`${toolId} requires backend processing (Coming soon)`);
                                        } else {
                                            // Open Active Tool Panel for opacity, blur, border, bg, etc.
                                            setLeftTab('tools');
                                            setActiveTool(toolId);
                                        }
                                    }}
                                />
                            </>
                        )}
                    </div>
                </div>
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
