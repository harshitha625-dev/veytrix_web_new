import { useState } from "react";
import { VideoTimelineEditor } from "./video-timeline-editor";
import { Timeline, PreviewPlayer } from "../../../components/VideoEditor/Timeline";
import { ToolboxPanel } from "./toolbox-panel";
import { MediaPool } from "./media-pool";

interface MediaItem {
  id: string;
  type: 'video' | 'audio' | 'image';
  name: string;
  thumbnail?: string;
  duration?: number;
}

export function EditorLayout() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  const handleAddMedia = (file: File) => {
    const id = Math.random().toString(36).slice(2, 11);
    const type = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image';
    
    const newItem: MediaItem = {
      id,
      type,
      name: file.name,
    };

    // Generate thumbnail for videos
    if (type === 'video') {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          newItem.thumbnail = canvas.toDataURL();
        }
        newItem.duration = video.duration;
        setMediaItems(prev => [...prev, newItem]);
      };
      video.src = URL.createObjectURL(file);
    } else {
      setMediaItems(prev => [...prev, newItem]);
    }
  };

  return (
    <div className="flex h-full bg-[#080b16]">
      {/* Toolbox Panel - Left Sidebar */}
      <ToolboxPanel onSelectTool={setSelectedTool} />

      {/* Timeline - Center */}
      <div className="flex-1 overflow-hidden flex flex-col pb-8">
        <div className="flex-1 min-h-0 bg-black flex items-center justify-center border-b border-white/10">
           <PreviewPlayer />
        </div>
        <div className="h-72 shrink-0">
          <Timeline />
        </div>
      </div>

      {/* Media Pool - Right Sidebar */}
      <MediaPool
        media={mediaItems}
        onAddMedia={handleAddMedia}
        onSelectMedia={setSelectedMedia}
      />
    </div>
  );
}
