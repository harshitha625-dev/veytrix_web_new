import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCheck, X, ChevronRight } from 'lucide-react';

// ─── All available transitions ──────────────────────────────────────────────
const TRANSITIONS: { id: string; label: string; type: string; icon: string; desc: string }[] = [
  // Base
  { id: 'none',      label: 'None',     type: 'none',   icon: '⊘', desc: 'Cut directly' },
  { id: 'dissolve',  label: 'Dissolve', type: 'base',   icon: '◐', desc: 'Smooth cross-fade' },
  { id: 'black',     label: 'Black',    type: 'base',   icon: '⬛', desc: 'Fade through black' },
  { id: 'white',     label: 'White',    type: 'base',   icon: '⬜', desc: 'Fade through white' },
  { id: 'dip-color', label: 'Dip',      type: 'base',   icon: '🎨', desc: 'Dip to colour' },
  { id: 'flash',     label: 'Flash',    type: 'base',   icon: '⚡', desc: 'White flash' },
  // Matte
  { id: 'zoom-in',   label: 'Zoom In',  type: 'matte',  icon: '🔍', desc: 'Zoom into next' },
  { id: 'zoom-out',  label: 'Zoom Out', type: 'matte',  icon: '🔎', desc: 'Zoom out to next' },
  { id: 'wipe-left', label: 'Wipe ←',   type: 'matte',  icon: '◁', desc: 'Wipe from right' },
  { id: 'wipe-right',label: 'Wipe →',   type: 'matte',  icon: '▷', desc: 'Wipe from left' },
  { id: 'slide-up',  label: 'Slide ↑',  type: 'matte',  icon: '△', desc: 'Slide upward' },
  { id: 'slide-down',label: 'Slide ↓',  type: 'matte',  icon: '▽', desc: 'Slide downward' },
  { id: 'spin',      label: 'Spin',     type: 'matte',  icon: '🌀', desc: '360° spin' },
  { id: 'iris',      label: 'Iris',     type: 'matte',  icon: '⊙', desc: 'Circular iris' },
  // Effect
  { id: 'blur',      label: 'Blur',     type: 'effect', icon: '💧', desc: 'Blur morph' },
  { id: 'glitch',    label: 'Glitch',   type: 'effect', icon: '⚡', desc: 'Digital glitch' },
  { id: 'pixelate',  label: 'Pixel',    type: 'effect', icon: '🟥', desc: 'Pixelate wipe' },
  { id: 'shake',     label: 'Shake',    type: 'effect', icon: '〰️', desc: 'Camera shake' },
  { id: 'film-burn', label: 'Burn',     type: 'effect', icon: '🔥', desc: 'Film burn' },
  { id: 'luma-fade', label: 'Luma',     type: 'effect', icon: '✦', desc: 'Luma fade' },
];

const TABS = ['all', 'base', 'matte', 'effect'] as const;
type Tab = typeof TABS[number];

// Colour indicator for each tab
const TAB_COLOURS: Record<Tab, string> = {
  all:    'text-white border-white',
  base:   'text-blue-400 border-blue-400',
  matte:  'text-purple-400 border-purple-400',
  effect: 'text-orange-400 border-orange-400',
};

const TRANSITION_CARD_COLOURS: Record<string, string> = {
  none:   'bg-slate-900/80',
  base:   'bg-blue-900/30',
  matte:  'bg-purple-900/30',
  effect: 'bg-orange-900/20',
};

export const TransitionEditorBottomPanel = ({
  targetId,
  nextId,
  onClose,
  clipTransitions,
  setClipTransitions,
}: {
  targetId: string;
  nextId: string;
  onClose: () => void;
  clipTransitions: Record<string, string>;
  setClipTransitions: any;
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [duration, setDuration] = useState(0.8);
  const currentTransition = clipTransitions[targetId] || 'none';

  const visibleTransitions =
    activeTab === 'all'
      ? TRANSITIONS
      : TRANSITIONS.filter((t) => t.type === activeTab || t.type === 'none');

  const handleSelect = (id: string) => {
    setClipTransitions((prev: any) => ({ ...prev, [targetId]: id }));
    onClose();
  };

  const handleApplyAll = () => {
    // Apply selected transition to every clip junction
    setClipTransitions((prev: any) => {
      const next = { ...prev };
      // We mark all existing keys + targetId with the same transition
      Object.keys(next).forEach((k) => {
        next[k] = currentTransition;
      });
      next[targetId] = currentTransition;
      return next;
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
      className="absolute bottom-0 left-0 w-full bg-[#0d0e1c] border-t border-white/10 flex flex-col z-[200]"
      style={{ height: '52%' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-slate-100 tracking-tight">Transitions</span>
          <span className="text-[10px] text-slate-500">
            {currentTransition === 'none'
              ? 'No transition selected'
              : `Current: ${TRANSITIONS.find((t) => t.id === currentTransition)?.label ?? currentTransition}`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleApplyAll}
            title="Apply to all clips"
            className="p-1.5 hover:bg-white/5 rounded-full transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={onClose}
            title="Apply & close"
            className="p-1.5 bg-teal-500/10 hover:bg-teal-500/20 rounded-full transition-colors"
          >
            <Check className="w-4 h-4 text-teal-400" />
          </button>
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <div className="flex items-center gap-1 px-4 pt-2 pb-1 shrink-0 border-b border-white/5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize transition-all ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {tab === 'all' ? 'All' : tab}
              <span className="ml-1 text-[9px] opacity-60">
                ({tab === 'all' ? TRANSITIONS.length : TRANSITIONS.filter((t) => t.type === tab).length})
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Transition Grid ── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-3 py-3 flex items-center gap-2.5 no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2.5"
          >
            {visibleTransitions.map((t) => {
              const isSelected = currentTransition === t.id;
              const cardBg = TRANSITION_CARD_COLOURS[t.type] ?? 'bg-slate-900/40';
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  title={t.desc}
                  className={`relative flex flex-col items-center gap-1.5 shrink-0 group rounded-xl p-1.5 transition-all duration-200 ${
                    isSelected
                      ? 'bg-teal-500/15 ring-2 ring-teal-400 ring-offset-1 ring-offset-[#0d0e1c]'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {/* Thumbnail box */}
                  <div
                    className={`w-[60px] h-[46px] rounded-lg flex items-center justify-center relative overflow-hidden border transition-all duration-200 ${
                      isSelected
                        ? 'border-teal-400/80 shadow-[0_0_12px_rgba(20,184,166,0.4)]'
                        : 'border-white/10 group-hover:border-white/25'
                    } ${cardBg}`}
                  >
                    {/* Clip separator line visual */}
                    <div className="absolute inset-0 flex">
                      <div className="flex-1 bg-slate-700/30" />
                      <div className="w-px bg-white/20" />
                      <div className="flex-1 bg-slate-600/30" />
                    </div>
                    {/* Icon */}
                    <span className="relative z-10 text-xl leading-none">{t.icon}</span>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-teal-500 flex items-center justify-center">
                        <Check className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] font-semibold w-[60px] text-center truncate transition-colors ${
                      isSelected ? 'text-teal-300' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Duration Slider ── */}
      <div className="px-5 py-3 flex items-center gap-4 bg-black/20 border-t border-white/5 shrink-0">
        <span className="text-[10px] font-semibold text-slate-400 w-14 shrink-0">Duration</span>
        <input
          type="range"
          min="0.1"
          max="3.0"
          step="0.1"
          value={duration}
          onChange={(e) => setDuration(parseFloat(e.target.value))}
          className="flex-1 h-1 bg-slate-800 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-400 [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <span className="text-[10px] font-bold text-slate-300 w-10 text-right shrink-0">{duration.toFixed(1)}s</span>
      </div>
    </motion.div>
  );
};
