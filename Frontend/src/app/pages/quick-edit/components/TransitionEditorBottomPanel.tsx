import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck, X } from 'lucide-react';

const TRANSITIONS = [
  { id: 'none', label: 'None', type: 'none' },
  { id: 'black', label: 'Black', type: 'base' },
  { id: 'white', label: 'White', type: 'base' },
  { id: 'dissolve', label: 'Dissolve', type: 'base' },
  { id: 'blur', label: 'Blur', type: 'effect' },
  { id: 'zoom-in', label: 'Zoom 1', type: 'matte' },
  { id: 'zoom-out', label: 'Zoom 2', type: 'matte' },
];

export const TransitionEditorBottomPanel = ({
  targetId,
  nextId,
  onClose,
  clipTransitions,
  setClipTransitions
}: {
  targetId: string;
  nextId: string;
  onClose: () => void;
  clipTransitions: Record<string, string>;
  setClipTransitions: any;
}) => {
  const [activeTab, setActiveTab] = useState('base');
  const [duration, setDuration] = useState(0.8);
  const currentTransition = clipTransitions[targetId] || 'none';

  const handleSelect = (id: string) => {
    setClipTransitions((prev: any) => ({ ...prev, [targetId]: id }));
  };

  const handleApplyAll = () => {
    // Basic apply all - ideally we'd pass all clip IDs down, but for now just close
    onClose();
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      className="absolute bottom-0 left-0 w-full bg-[#111322] border-t border-white/10 flex flex-col z-[200]"
      style={{ height: "45%" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
        <span className="text-sm font-semibold text-slate-200">Transition</span>
        <div className="flex items-center gap-2">
          <button onClick={handleApplyAll} className="p-1.5 hover:bg-white/5 rounded-full transition-colors" title="Apply to all">
            <CheckCheck className="w-5 h-5 text-slate-400" />
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-full transition-colors" title="Apply">
            <Check className="w-5 h-5 text-teal-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 px-4 py-2">
        {['base', 'matte', 'effect'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-semibold capitalize transition-colors ${activeTab === tab ? 'text-white border-b-2 border-white pb-1' : 'text-slate-500 pb-1'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-x-auto px-4 py-3 flex gap-3 no-scrollbar">
        {TRANSITIONS.filter(t => t.type === activeTab || t.type === 'none').map(t => (
          <button
            key={t.id}
            onClick={() => handleSelect(t.id)}
            className={`flex flex-col items-center gap-1.5 shrink-0`}
          >
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all ${
              currentTransition === t.id 
                ? 'border-2 border-teal-500 bg-teal-500/10' 
                : 'border border-white/10 bg-black/40 hover:border-white/30'
            }`}>
              <div className="w-6 h-6 rounded bg-slate-700/50 flex items-center justify-center">
                <span className="text-[8px] text-white/50">fx</span>
              </div>
            </div>
            <span className={`text-[10px] font-medium ${currentTransition === t.id ? 'text-teal-400' : 'text-slate-400'}`}>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* Duration Slider */}
      <div className="px-6 py-4 flex items-center gap-4 bg-black/20">
        <span className="text-[10px] font-medium text-slate-400 w-16">Duration</span>
        <input
          type="range"
          min="0.1"
          max="2.0"
          step="0.1"
          value={duration}
          onChange={(e) => setDuration(parseFloat(e.target.value))}
          className="flex-1 h-1 bg-slate-800 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
        />
        <span className="text-[10px] font-medium text-slate-300 w-8">{duration.toFixed(1)}s</span>
      </div>
    </motion.div>
  );
};
