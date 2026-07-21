import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Sliders, Palette, Eye, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CutoutPanelProps {
    clipId: string;
    clipType: 'video' | 'image';
    clipPreviewUrl: string;
    clipFile: File | null;
    cutoutSettings: any;
    onChange: (settings: any) => void;
    onClose: () => void;
    isProcessing: boolean;
    error: string | null;
    onTriggerSegmentation: () => void;
}

const STROKE_PRESETS = [
    { id: 'none', label: 'None', description: 'No outline' },
    { id: 'solid', label: 'Solid', description: 'Sharp border' },
    { id: 'glow', label: 'Glow', description: 'Soft outer glow' },
    { id: 'neon', label: 'Neon', description: 'Vibrant multi-glow' },
    { id: 'double', label: 'Double', description: 'Two-tone border' },
    { id: 'shadow', label: 'Shadow', description: 'Drop shadow' },
];

const PRESET_COLORS = [
    '#ffffff', // White
    '#000000', // Black
    '#ff4a4a', // Neon Red
    '#ff9900', // Gold/Orange
    '#ffff00', // Yellow
    '#00ff66', // Neon Green
    '#00ffff', // Cyan
    '#3b82f6', // Bright Blue
    '#cc00ff', // Neon Purple
    '#ff007f', // Hot Pink
];

export const CutoutPanel = ({
    clipId,
    clipType,
    clipPreviewUrl,
    clipFile,
    cutoutSettings,
    onChange,
    onClose,
    isProcessing,
    error,
    onTriggerSegmentation
}: CutoutPanelProps) => {
    const [activeTab, setActiveTab] = useState<'cutout' | 'stroke'>('cutout');

    // Default cutout settings if not defined
    const settings = cutoutSettings || {
        enabled: false,
        maskDataUrl: null,
        feather: 0,
        expand: 0,
        stroke: {
            preset: 'none',
            color: '#ffffff',
            size: 15,
            opacity: 100,
        }
    };

    const handleToggleEnabled = async (checked: boolean) => {
        if (checked) {
            onChange({ ...settings, enabled: true });
            if (!settings.maskDataUrl) {
                onTriggerSegmentation();
            }
        } else {
            onChange({ ...settings, enabled: false });
        }
    };

    const handleUpdateFeather = (val: number) => {
        onChange({ ...settings, feather: val });
    };

    const handleUpdateExpand = (val: number) => {
        onChange({ ...settings, expand: val });
    };

    const handleUpdateStrokePreset = (presetId: string) => {
        onChange({
            ...settings,
            stroke: {
                ...settings.stroke,
                preset: presetId
            }
        });
    };

    const handleUpdateStrokeColor = (color: string) => {
        onChange({
            ...settings,
            stroke: {
                ...settings.stroke,
                color
            }
        });
    };

    const handleUpdateStrokeSize = (size: number) => {
        onChange({
            ...settings,
            stroke: {
                ...settings.stroke,
                size
            }
        });
    };

    const handleUpdateStrokeOpacity = (opacity: number) => {
        onChange({
            ...settings,
            stroke: {
                ...settings.stroke,
                opacity
            }
        });
    };

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="absolute bottom-0 left-0 w-full bg-[#0b0c16]/98 border-t border-white/10 flex flex-col z-[200] shadow-[0_-8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md"
            style={{ height: '42%' }}
        >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.01]">
                <button 
                    onClick={onClose} 
                    type="button"
                    className="p-1.5 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-200">AI Subject Cutout</span>
                </div>
                <button 
                    onClick={onClose} 
                    type="button"
                    className="p-1.5 hover:bg-purple-500/20 rounded-full transition-colors text-purple-400 hover:text-purple-300"
                >
                    <Check className="w-4 h-4" />
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-6 px-4 py-1.5 border-b border-white/5 shrink-0 bg-white/[0.005]">
                <button
                    onClick={() => setActiveTab('cutout')}
                    type="button"
                    className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider pb-1 transition-all ${
                        activeTab === 'cutout'
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <Sliders className="w-3 h-3" />
                    Cutout Controls
                </button>
                <button
                    onClick={() => setActiveTab('stroke')}
                    type="button"
                    disabled={!settings.enabled}
                    className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider pb-1 transition-all ${
                        !settings.enabled
                            ? 'opacity-40 cursor-not-allowed text-slate-600'
                            : activeTab === 'stroke'
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <Palette className="w-3 h-3" />
                    Stroke & Effects
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 custom-scrollbar">
                {activeTab === 'cutout' && (
                    <div className="space-y-4">
                        {/* Toggle switch for enabled */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                            <div className="space-y-0.5">
                                <Label className="text-xs font-bold text-slate-200">Enable AI Segment Cutout</Label>
                                <p className="text-[9px] text-slate-500">Automatically isolate the subject from the background</p>
                            </div>
                            <Switch
                                checked={settings.enabled}
                                onCheckedChange={handleToggleEnabled}
                            />
                        </div>

                        {isProcessing && (
                            <div className="flex flex-col items-center justify-center py-4 gap-2 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 animate-pulse">Running AI Segmentation...</span>
                                <span className="text-[8px] text-slate-500">Downloading model on first use (approx. 40MB)</span>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[9px] font-medium text-center">
                                Error: {error}
                            </div>
                        )}

                        {settings.enabled && !isProcessing && !error && (
                            <div className="space-y-4">
                                {/* Feather slider */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        <span>Edge Feathering</span>
                                        <span className="text-purple-400 font-mono">{settings.feather}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="60"
                                        step="1"
                                        value={settings.feather}
                                        onChange={(e) => handleUpdateFeather(parseInt(e.target.value))}
                                        className="w-full accent-purple-400 h-1 bg-slate-800 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-400"
                                    />
                                </div>

                                {/* Expand slider */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        <span>Mask Expand / Contract</span>
                                        <span className="text-purple-400 font-mono">{settings.expand > 0 ? `+${settings.expand}` : settings.expand}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="-30"
                                        max="30"
                                        step="1"
                                        value={settings.expand}
                                        onChange={(e) => handleUpdateExpand(parseInt(e.target.value))}
                                        className="w-full accent-purple-400 h-1 bg-slate-800 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-400"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'stroke' && settings.enabled && (
                    <div className="space-y-4">
                        {/* Stroke Presets */}
                        <div className="space-y-1.5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Stroke Preset</span>
                            <div className="grid grid-cols-6 gap-2">
                                {STROKE_PRESETS.map((preset) => {
                                    const isSelected = (settings.stroke?.preset || 'none') === preset.id;
                                    return (
                                        <button
                                            key={preset.id}
                                            onClick={() => handleUpdateStrokePreset(preset.id)}
                                            type="button"
                                            className={`py-2 rounded-lg border text-[9px] font-bold flex flex-col items-center justify-center transition-all ${
                                                isSelected
                                                    ? 'bg-purple-500/15 border-purple-500/60 text-purple-200'
                                                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                                            }`}
                                        >
                                            <span className="capitalize">{preset.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {settings.stroke?.preset !== 'none' && (
                            <>
                                {/* Stroke Color Selection */}
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Stroke Color</span>
                                    <div className="flex items-center gap-3">
                                        {/* Preset colors */}
                                        <div className="flex-1 flex flex-wrap gap-1.5">
                                            {PRESET_COLORS.map((col) => {
                                                const isColSelected = settings.stroke?.color === col;
                                                return (
                                                    <button
                                                        key={col}
                                                        onClick={() => handleUpdateStrokeColor(col)}
                                                        type="button"
                                                        className="w-5 h-5 rounded-full border border-white/10 relative transition-transform hover:scale-110"
                                                        style={{ backgroundColor: col }}
                                                    >
                                                        {isColSelected && (
                                                            <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-[#0b0c16] flex items-center justify-center" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {/* Custom Picker */}
                                        <div className="flex items-center gap-1.5 pl-2 border-l border-white/10 shrink-0">
                                            <input
                                                type="color"
                                                value={settings.stroke?.color || '#ffffff'}
                                                onChange={(e) => handleUpdateStrokeColor(e.target.value)}
                                                className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                                            />
                                            <span className="text-[9px] font-mono text-slate-400 uppercase">{settings.stroke?.color}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stroke Size slider */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        <span>Stroke Size</span>
                                        <span className="text-purple-400 font-mono">{settings.stroke?.size || 15}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="60"
                                        step="1"
                                        value={settings.stroke?.size || 15}
                                        onChange={(e) => handleUpdateStrokeSize(parseInt(e.target.value))}
                                        className="w-full accent-purple-400 h-1 bg-slate-800 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-400"
                                    />
                                </div>

                                {/* Stroke Opacity slider */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        <span>Stroke Opacity</span>
                                        <span className="text-purple-400 font-mono">{settings.stroke?.opacity || 100}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        step="5"
                                        value={settings.stroke?.opacity || 100}
                                        onChange={(e) => handleUpdateStrokeOpacity(parseInt(e.target.value))}
                                        className="w-full accent-purple-400 h-1 bg-slate-800 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-400"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
