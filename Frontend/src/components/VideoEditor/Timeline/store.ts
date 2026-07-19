import { create } from 'zustand';

export type TrackType = 'video' | 'audio' | 'overlay' | 'music' | 'text';

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  locked: boolean;
  hidden: boolean;
  muted: boolean;
  order: number;
  placeholder?: string;
}

export interface Clip {
  id: string;
  trackId: string;
  name: string;
  start: number; // Start time in seconds on the timeline
  duration: number; // Duration in seconds
  sourceStart?: number; // Where the media starts inside the clip
  color?: string; // For effects/overlays
  type: 'video' | 'audio' | 'text' | 'image' | 'effect';
  mediaUrl?: string; // URL for the media (blob or external)
  hasExtractedAudio?: boolean; // Whether audio was extracted
}

export interface Marker {
  id: string;
  time: number;
  label: string;
  color: string;
  type: 'chapter' | 'note' | 'edit' | 'comment';
}

interface TimelineState {
  tracks: Track[];
  clips: Clip[];
  markers: Marker[];
  playheadTime: number;
  zoomLevel: number; // Pixels per second
  isPlaying: boolean;
  selectedClipIds: string[];
  duration: number;
  
  // Actions
  setPlayheadTime: (time: number) => void;
  setZoomLevel: (zoom: number) => void;
  togglePlay: () => void;
  selectClip: (clipId: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  
  updateClip: (clipId: string, updates: Partial<Clip>) => void;
  moveClip: (clipId: string, trackId: string, start: number) => void;
  addClip: (clip: Clip) => void;
  deleteSelectedClips: () => void;
  splitClip: (clipId: string, time: number) => void;
  extractAudio: (clipId: string) => void;
  
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  addTrack: (track: Track) => void;
  deleteTrack: (trackId: string) => void;
  
  addMarker: (marker: Marker) => void;
  removeMarker: (markerId: string) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  tracks: [
    { id: 'music-1', name: 'Music', type: 'music', locked: false, hidden: false, muted: false, order: 0, placeholder: 'Tap to add music' },
    { id: 'text-1', name: 'Text', type: 'text', locked: false, hidden: false, muted: false, order: 1, placeholder: 'Tap to add subtitle' },
    { id: 'overlay-1', name: 'Overlay', type: 'overlay', locked: false, hidden: false, muted: false, order: 2, placeholder: 'Tap to add sticker / Overlay' },
    { id: 'video-1', name: 'Main Video', type: 'video', locked: false, hidden: false, muted: false, order: 3 },
    { id: 'audio-1', name: 'Audio', type: 'audio', locked: false, hidden: false, muted: false, order: 4 },
  ],
  clips: [
    { id: 'clip-1', trackId: 'video-1', name: 'Sunset.mp4', start: 0, duration: 10, type: 'video', color: 'bg-blue-500' },
  ],
  markers: [
    { id: 'm1', time: 5, label: 'Intro End', color: 'text-red-500', type: 'chapter' }
  ],
  playheadTime: 0,
  zoomLevel: 100, // 100 pixels = 1 second
  isPlaying: false,
  selectedClipIds: [],
  duration: 60, // 1 minute timeline for now
  
  setPlayheadTime: (time) => set({ playheadTime: Math.max(0, time) }),
  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(10, Math.min(1000, zoom)) }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  selectClip: (clipId, multiSelect = false) => set((state) => {
    if (multiSelect) {
      return {
        selectedClipIds: state.selectedClipIds.includes(clipId)
          ? state.selectedClipIds.filter(id => id !== clipId)
          : [...state.selectedClipIds, clipId]
      };
    }
    return { selectedClipIds: [clipId] };
  }),
  clearSelection: () => set({ selectedClipIds: [] }),
  
  updateClip: (clipId, updates) => set((state) => ({
    clips: state.clips.map(c => c.id === clipId ? { ...c, ...updates } : c)
  })),
  
  moveClip: (clipId, trackId, start) => set((state) => ({
    clips: state.clips.map(c => c.id === clipId ? { ...c, trackId, start: Math.max(0, start) } : c)
  })),
  
  addClip: (clip) => set((state) => ({ clips: [...state.clips, clip] })),
  
  deleteSelectedClips: () => set((state) => ({
    clips: state.clips.filter(c => !state.selectedClipIds.includes(c.id)),
    selectedClipIds: []
  })),
  
  splitClip: (clipId, time) => set((state) => {
    const clip = state.clips.find(c => c.id === clipId);
    if (!clip || time <= clip.start || time >= clip.start + clip.duration) return state;
    
    const newClip1 = { ...clip, duration: time - clip.start };
    const newClip2 = {
      ...clip,
      id: `${clip.id}-split-${Date.now()}`,
      start: time,
      duration: (clip.start + clip.duration) - time,
      sourceStart: (clip.sourceStart || 0) + (time - clip.start)
    };
    
    return {
      clips: state.clips.map(c => c.id === clipId ? newClip1 : c).concat(newClip2)
    };
  }),
  
  extractAudio: (clipId) => set((state) => {
    const clip = state.clips.find(c => c.id === clipId);
    if (!clip || clip.type !== 'video' || clip.hasExtractedAudio) return state;
    
    // Find audio track
    const audioTrack = state.tracks.find(t => t.type === 'audio');
    if (!audioTrack) return state;

    const audioClip: Clip = {
      ...clip,
      id: `${clip.id}-audio-${Date.now()}`,
      trackId: audioTrack.id,
      name: `${clip.name} (Audio)`,
      type: 'audio',
      color: 'bg-emerald-500',
    };

    return {
      clips: state.clips.map(c => c.id === clipId ? { ...c, hasExtractedAudio: true } : c).concat(audioClip)
    };
  }),
  
  updateTrack: (trackId, updates) => set((state) => ({
    tracks: state.tracks.map(t => t.id === trackId ? { ...t, ...updates } : t)
  })),
  addTrack: (track) => set((state) => ({ tracks: [...state.tracks, track] })),
  deleteTrack: (trackId) => set((state) => ({ tracks: state.tracks.filter(t => t.id !== trackId) })),
  
  addMarker: (marker) => set((state) => ({ markers: [...state.markers, marker] })),
  removeMarker: (markerId) => set((state) => ({ markers: state.markers.filter(m => m.id !== markerId) }))
}));
