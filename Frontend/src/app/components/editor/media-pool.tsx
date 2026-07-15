import { Plus, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";

interface MediaItem {
  id: string;
  type: 'video' | 'audio' | 'image';
  name: string;
  thumbnail?: string;
  duration?: number;
}

interface MediaPoolProps {
  media?: MediaItem[];
  onAddMedia?: (file: File) => void;
  onSelectMedia?: (mediaId: string) => void;
}

export function MediaPool({ media = [], onAddMedia, onSelectMedia }: MediaPoolProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      Array.from(files).forEach(file => onAddMedia?.(file));
    }
    e.currentTarget.value = '';
  };

  return (
    <div className="w-80 border-l border-white/10 bg-[#08111f]/95 p-4 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 font-black mb-4">Media Pool</h2>
        
        {/* Add Media Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 hover:border-purple-500/60 transition"
        >
          <Plus className="w-4 h-4 text-purple-300" />
          <span className="text-sm font-semibold text-purple-200">Add Media</span>
        </motion.button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,audio/*,image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Media Items */}
      <div className="space-y-2">
        {media.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <div className="text-sm mb-2">No media yet</div>
            <div className="text-xs text-slate-500">Import media to get started</div>
          </div>
        ) : (
          media.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ x: 2 }}
              onClick={() => onSelectMedia?.(item.id)}
              className="group p-3 rounded-2xl border border-white/10 bg-[#0b1321] hover:bg-[#111a2f] hover:border-purple-500/30 transition cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative rounded-lg overflow-hidden bg-black mb-2 h-24 flex items-center justify-center">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-purple-900/20 flex items-center justify-center">
                    <Play className="w-6 h-6 text-purple-400/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
              </div>

              {/* Info */}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-white">
                  {item.name}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="capitalize">{item.type}</span>
                  {item.duration && (
                    <span>{Math.floor(item.duration)}s</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
