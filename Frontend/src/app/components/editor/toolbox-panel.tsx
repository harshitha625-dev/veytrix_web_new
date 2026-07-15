import { Sparkles, Type, RotateCw, Volume2, Zap, Copy, Scissors, Sliders } from "lucide-react";
import { motion } from "framer-motion";

interface ToolboxPanelProps {
  onSelectTool?: (tool: string) => void;
}

export function ToolboxPanel({ onSelectTool }: ToolboxPanelProps) {
  const smartAutoFeatures = [
    { id: 'subtitles', label: 'Subtitles', icon: Type, enabled: false },
    { id: 'music', label: 'Music', icon: Sparkles, enabled: false },
    { id: 'auto-cuts', label: 'Auto Cuts', icon: Scissors, enabled: false },
    { id: 'tracking', label: 'Tracking', icon: Zap, enabled: false },
  ];

  const creativeTools = [
    { id: 'effects', label: 'Effects', icon: Sparkles, description: 'Add visual effects' },
    { id: 'transitions', label: 'Transitions', icon: Sliders, description: 'Transition between clips' },
    { id: 'filters', label: 'Filters', icon: Sliders, description: 'Apply filters' },
    { id: 'speed', label: 'Speed', icon: Zap, description: 'Adjust playback speed' },
    { id: 'trim', label: 'Trim', icon: Scissors, description: 'Trim clips' },
    { id: 'copy', label: 'Copy', icon: Copy, description: 'Copy effects' },
    { id: 'text', label: 'Text', icon: Type, description: 'Add text overlays' },
    { id: 'rotate', label: 'Rotate', icon: RotateCw, description: 'Rotate video' },
    { id: 'volume', label: 'Volume', icon: Volume2, description: 'Adjust volume' },
  ];

  return (
    <div className="w-80 border-r border-white/10 bg-[#08111f]/95 p-4 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 font-black mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Toolbox Options
        </h2>
      </div>

      {/* Smart Auto Features Section */}
      <div className="mb-8">
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold mb-3">Smart Auto Features</h3>
        <div className="space-y-2">
          {smartAutoFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.button
                key={feature.id}
                whileHover={{ x: 2 }}
                onClick={() => onSelectTool?.(feature.id)}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-[#0b1321] hover:bg-[#111a2f] hover:border-purple-500/30 transition group"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-purple-300 group-hover:text-purple-200" />
                  <span className="text-sm text-slate-200 group-hover:text-white">{feature.label}</span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                  feature.enabled 
                    ? 'bg-purple-500 border-purple-500' 
                    : 'border-white/20 hover:border-purple-500/50'
                }`}>
                  {feature.enabled && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Creative Quick Tools Section */}
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold mb-3">Creative Quick Tools</h3>
        <div className="grid grid-cols-3 gap-2">
          {creativeTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <motion.button
                key={tool.id}
                whileHover={{ y: -2 }}
                onClick={() => onSelectTool?.(tool.id)}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/10 bg-[#0b1321] hover:bg-[#111a2f] hover:border-purple-500/30 transition group"
                title={tool.description}
              >
                <Icon className="w-5 h-5 text-purple-300 group-hover:text-purple-200 mb-2" />
                <span className="text-[10px] font-semibold text-slate-300 group-hover:text-white text-center">
                  {tool.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
