export const timeToPixel = (time: number, zoomLevel: number): number => {
  return time * zoomLevel;
};

export const pixelToTime = (pixel: number, zoomLevel: number): number => {
  return Math.max(0, pixel / zoomLevel);
};

export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100); // 100 frames/cents
  
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

export const getSnapTime = (
  time: number, 
  clips: { start: number, duration: number }[], 
  thresholdPixels: number, 
  zoomLevel: number,
  ignoreClipId?: string
) => {
  const snapPoints: number[] = [0]; // Always snap to 0
  
  clips.forEach(clip => {
    // Add start and end points of other clips
    snapPoints.push(clip.start);
    snapPoints.push(clip.start + clip.duration);
  });
  
  const thresholdTime = thresholdPixels / zoomLevel;
  
  for (const point of snapPoints) {
    if (Math.abs(time - point) < thresholdTime) {
      return point;
    }
  }
  
  return time;
};
