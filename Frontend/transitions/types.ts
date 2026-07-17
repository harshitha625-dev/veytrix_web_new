import React from 'react';

export interface TransitionModule {
  id: string;
  name: string;
  category: 'dissolve' | 'slide' | 'wipe' | 'zoom' | 'blur' | 'glitch' | 'shape' | 'creative';
  description: string;
  defaultDurationSec: number;
  ffmpegTransitionName: string; // Corresponding FFmpeg xfade transition name
  iconName: string; // Name of Lucide icon to use
  thumbnailUrl: string; // Preview/thumbnail image URL

  /**
   * Generates CSS properties for DOM-based rendering of the transition between two layers.
   * @param progress Progress of transition from 0 to 1
   * @param layer Which layer style to get ('from' is outgoing clip, 'to' is incoming clip)
   */
  getCssStyle: (progress: number, layer: 'from' | 'to') => React.CSSProperties;

  /**
   * Renders the transition frame on a 2D canvas context.
   * @param ctx Target canvas rendering context
   * @param fromImg Outgoing frame/video/canvas
   * @param toImg Incoming frame/video/canvas
   * @param progress Current progress of the transition (0.0 to 1.0)
   * @param width Width of the canvas
   * @param height Height of the canvas
   */
  previewRenderer: (
    ctx: CanvasRenderingContext2D,
    fromImg: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement,
    toImg: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement,
    progress: number,
    width: number,
    height: number
  ) => void;
}
