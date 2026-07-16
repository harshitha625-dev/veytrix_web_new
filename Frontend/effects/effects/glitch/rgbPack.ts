import { 
  Tv, Zap, Sparkles, Waves, RefreshCw, Shuffle, Activity, Eye, Video, 
  Layers, Film, Camera, RotateCcw, Crosshair, Sun, Moon, Disc, Wind, Flame, HelpCircle
} from 'lucide-react';
import { EffectModule } from '../types';

// Helper for default params
const makeDefaultParams = (intensity: number, speed: number) => ({
  intensity,
  speed,
  duration: 4,
  opacity: 1,
  blendMode: 'normal',
  enabled: true
});

const makeAdjustableParams = (name: string, min = 1, max = 20, step = 0.5) => [
  { name, key: 'intensity', type: 'number' as const, min, max, step },
  { name: 'Speed', key: 'speed', type: 'number' as const, min: 0.1, max: 5, step: 0.1 },
  { name: 'Duration', key: 'duration', type: 'number' as const, min: 0.5, max: 10, step: 0.5 },
  { name: 'Opacity', key: 'opacity', type: 'number' as const, min: 0, max: 1, step: 0.05 },
  { name: 'Blend Mode', key: 'blendMode', type: 'select' as const, options: ['normal', 'multiply', 'screen', 'overlay', 'color-dodge'] }
];

// Helper to draw split channels
const renderChannelSplit = (
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  rx: number, ry: number,
  gx: number, gy: number,
  bx: number, by: number,
  opacity = 1,
  blendMode = 'normal'
) => {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = blendMode as any;

  // Red
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(video, rx, ry, canvas.width, canvas.height);
  ctx.restore();

  // Green
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(video, gx, gy, canvas.width, canvas.height);
  ctx.restore();

  // Blue
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(video, bx, by, canvas.width, canvas.height);
  ctx.restore();

  ctx.restore();
};

export const rgbWave: EffectModule = {
  id: 'pro-rgb-wave',
  name: 'RGB Wave',
  category: 'glitch',
  icon: Waves,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Oscillating wave split in color channels.',
  defaultParameters: makeDefaultParams(10, 1.5),
  adjustableParameters: makeAdjustableParams('Wave Strength', 1, 30, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    const t = time * params.speed;
    const rx = Math.sin(t * 1.5) * params.intensity;
    const gx = Math.sin(t * 1.2 + 1) * params.intensity * 0.7;
    const bx = Math.sin(t * 0.9 + 2) * params.intensity * 1.2;
    renderChannelSplit(ctx, video, canvas, rx, 0, gx, 0, bx, 0, params.opacity, params.blendMode);
  },
  ffmpegExportFilter: (params) => [`rgbashift=rh=${params.intensity}:bh=-${params.intensity}`]
};

export const rgbFlash: EffectModule = {
  id: 'pro-rgb-flash',
  name: 'RGB Flash',
  category: 'glitch',
  icon: Zap,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Rhythmic strobe color channel flash.',
  defaultParameters: makeDefaultParams(8, 2.5),
  adjustableParameters: makeAdjustableParams('Flicker', 2, 20, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const tick = Math.floor(time * params.speed * 4) % 3;
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = params.opacity * 0.25;
    if (tick === 0) { ctx.fillStyle = 'red'; ctx.fillRect(0,0,canvas.width,canvas.height); }
    else if (tick === 1) { ctx.fillStyle = 'green'; ctx.fillRect(0,0,canvas.width,canvas.height); }
    else { ctx.fillStyle = 'blue'; ctx.fillRect(0,0,canvas.width,canvas.height); }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=10:allf=t+u`]
};

export const rgbTrail: EffectModule = {
  id: 'pro-rgb-trail',
  name: 'RGB Trail',
  category: 'glitch',
  icon: Activity,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Trailing color copies on fast motion.',
  defaultParameters: makeDefaultParams(6, 1.2),
  adjustableParameters: makeAdjustableParams('Trail Spread', 2, 18, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    const rx = Math.cos(time * params.speed) * params.intensity;
    const ry = Math.sin(time * params.speed) * params.intensity;
    renderChannelSplit(ctx, video, canvas, rx, ry, -rx * 0.5, -ry * 0.5, 0, 0, params.opacity, params.blendMode);
  },
  ffmpegExportFilter: (params) => [`rgbashift=rh=${params.intensity}:rv=${params.intensity}`]
};

export const rgbEcho: EffectModule = {
  id: 'pro-rgb-echo',
  name: 'RGB Echo',
  category: 'glitch',
  icon: RefreshCw,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Stroboscopic color channel echoing outlines.',
  defaultParameters: makeDefaultParams(5, 1.5),
  adjustableParameters: makeAdjustableParams('Echo Spread', 1, 15, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    const step = params.intensity;
    renderChannelSplit(ctx, video, canvas, -step, -step, 0, 0, step, step, params.opacity, params.blendMode);
  },
  ffmpegExportFilter: (params) => [`rgbashift=rh=${params.intensity}:rv=${params.intensity}:bh=-${params.intensity}`]
};

export const rgbOffset: EffectModule = {
  id: 'pro-rgb-offset',
  name: 'RGB Offset',
  category: 'glitch',
  icon: Shuffle,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Constant static offset between color channels.',
  defaultParameters: makeDefaultParams(8, 0),
  adjustableParameters: makeAdjustableParams('Shift Distance', 1, 25, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    renderChannelSplit(ctx, video, canvas, -params.intensity, 0, 0, 0, params.intensity, 0, params.opacity, params.blendMode);
  },
  ffmpegExportFilter: (params) => [`rgbashift=rh=${params.intensity}:bh=-${params.intensity}`]
};

export const rgbPulse: EffectModule = {
  id: 'pro-rgb-pulse',
  name: 'RGB Pulse',
  category: 'glitch',
  icon: Activity,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Pulsing color separation triggered rhythmically.',
  defaultParameters: makeDefaultParams(12, 2),
  adjustableParameters: makeAdjustableParams('Pulse Width', 2, 35, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    const p = Math.abs(Math.sin(time * params.speed * Math.PI)) * params.intensity;
    renderChannelSplit(ctx, video, canvas, -p, 0, 0, 0, p, 0, params.opacity, params.blendMode);
  },
  ffmpegExportFilter: (params) => [`rgbashift=rh=${params.intensity}:bh=-${params.intensity}`]
};

export const rgbNoise: EffectModule = {
  id: 'pro-rgb-noise',
  name: 'RGB Noise',
  category: 'glitch',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Flickering color noise specs.',
  defaultParameters: makeDefaultParams(10, 2),
  adjustableParameters: makeAdjustableParams('Noise level', 2, 30, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const len = d.length;
    for (let i = 0; i < len; i += 400) {
      if (Math.random() < 0.15) {
        const offset = Math.round((Math.random() - 0.5) * params.intensity);
        d[i] = d[Math.max(0, Math.min(len - 1, i + offset * 4))];
        d[i+2] = d[Math.max(0, Math.min(len - 1, i - offset * 4 + 2))];
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=15:allf=t+u`]
};

export const rgbSpin: EffectModule = {
  id: 'pro-rgb-spin',
  name: 'RGB Spin',
  category: 'glitch',
  icon: RotateCcw,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Independent rotation angles for red, green, and blue.',
  defaultParameters: makeDefaultParams(3, 1.5),
  adjustableParameters: makeAdjustableParams('Max Angle', 1, 10, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    const angle = Math.sin(time * params.speed) * params.intensity * (Math.PI / 180);
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode as any;

    // Draw base
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Overlay color shifts
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(angle);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`rotate='${params.intensity}*PI/180*sin(t*${params.speed})'`]
};

// RotateCcw is imported directly from lucide-react

export const rgbExplosion: EffectModule = {
  id: 'pro-rgb-explosion',
  name: 'RGB Explosion',
  category: 'glitch',
  icon: Sparkles,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Chromatic radial zooming scaling offsets.',
  defaultParameters: makeDefaultParams(1.15, 2.5),
  adjustableParameters: makeAdjustableParams('Scale Factor', 1, 1.5, 0.02),
  previewRenderer: (ctx, video, params, time, canvas) => {
    const pulse = 1 + (params.intensity - 1) * Math.pow(Math.sin((time * params.speed) % Math.PI), 4);
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode as any;

    // Green
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Red
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(pulse, pulse);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`scale=iw*${params.intensity}:ih*${params.intensity},crop=iw:ih`]
};

export const rgbRipple: EffectModule = {
  id: 'pro-rgb-ripple',
  name: 'RGB Ripple',
  category: 'glitch',
  icon: Waves,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Color channel separate sine displacement wave.',
  defaultParameters: makeDefaultParams(8, 2),
  adjustableParameters: makeAdjustableParams('Ripple Strength', 2, 25, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const phase = time * params.speed * 3;
    for (let y = 0; y < h; y++) {
      const rxOffset = Math.sin(y * 0.05 + phase) * params.intensity;
      const bxOffset = Math.cos(y * 0.04 + phase) * params.intensity;
      for (let x = 0; x < w; x++) {
        const di = (y * w + x) * 4;
        const srx = Math.max(0, Math.min(w-1, Math.round(x + rxOffset)));
        const sbx = Math.max(0, Math.min(w-1, Math.round(x + bxOffset)));
        d[di] = temp[(y*w+srx)*4];
        d[di+2] = temp[(y*w+sbx)*4+2];
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`geq=r='p(X+sin(Y/15)*${params.intensity},Y)':b='p(X-sin(Y/15)*${params.intensity},Y)'`]
};

export const rgbDistortion: EffectModule = {
  id: 'pro-rgb-distortion',
  name: 'RGB Distortion',
  category: 'glitch',
  icon: Activity,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Intermittent chromatic shears and displacements.',
  defaultParameters: makeDefaultParams(10, 1.5),
  adjustableParameters: makeAdjustableParams('Shear Force', 2, 30, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    const isShearing = Math.sin(time * params.speed * 4) > 0.6;
    const shift = isShearing ? params.intensity : 0;
    renderChannelSplit(ctx, video, canvas, -shift, 0, 0, 0, shift, 0, params.opacity, params.blendMode);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`rgbashift=rh=${params.intensity}`]
};

export const rgbMelt: EffectModule = {
  id: 'pro-rgb-melt',
  name: 'RGB Melt',
  category: 'glitch',
  icon: Flame,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Color channel separate vertical dripping.',
  defaultParameters: makeDefaultParams(8, 2),
  adjustableParameters: makeAdjustableParams('Drip Size', 2, 25, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    const t = time * params.speed;
    for (let x = 0; x < w; x++) {
      const rdrip = Math.sin(x*0.06 + t) * params.intensity;
      const bdrip = Math.cos(x*0.04 + t) * params.intensity;
      for (let y = 0; y < h; y++) {
        const rsy = Math.max(0, Math.min(h-1, Math.round(y - rdrip)));
        const bsy = Math.max(0, Math.min(h-1, Math.round(y - bdrip)));
        const di = (y * w + x) * 4;
        d[di] = temp[(rsy*w+x)*4];
        d[di+2] = temp[(bsy*w+x)*4+2];
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`geq=r='p(X,Y+sin(X/10)*${params.intensity})':b='p(X,Y-cos(X/10)*${params.intensity})'`]
};

export const rgbStretch: EffectModule = {
  id: 'pro-rgb-stretch',
  name: 'RGB Stretch',
  category: 'glitch',
  icon: Film,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Channel separate horizontal scale stretch.',
  defaultParameters: makeDefaultParams(1.2, 1),
  adjustableParameters: makeAdjustableParams('Stretch Width', 1, 1.6, 0.02),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode as any;

    // Green
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Red
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(params.intensity, 1);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`scale=iw*${params.intensity}:ih,crop=iw:ih`]
};

export const rgbGhost: EffectModule = {
  id: 'pro-rgb-ghost',
  name: 'RGB Ghost',
  category: 'glitch',
  icon: Eye,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Translucent chromatic duplicate layers.',
  defaultParameters: makeDefaultParams(6, 1.5),
  adjustableParameters: makeAdjustableParams('Ghost Distance', 2, 20, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    const rx = Math.sin(time * params.speed) * params.intensity;
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = params.opacity * 0.45;
    ctx.drawImage(video, rx, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`rgbashift=rh=${params.intensity}`]
};

export const rgbZoom: EffectModule = {
  id: 'pro-rgb-zoom',
  name: 'RGB Zoom',
  category: 'glitch',
  icon: Crosshair,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Independent focal scaling in color channels.',
  defaultParameters: makeDefaultParams(1.15, 0),
  adjustableParameters: makeAdjustableParams('Zoom Factor', 1, 1.4, 0.02),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode as any;

    // Base
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Zoomed overlay
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(params.intensity, params.intensity);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`scale=iw*${params.intensity}:ih*${params.intensity},crop=iw:ih`]
};

export const rgbMirror: EffectModule = {
  id: 'pro-rgb-mirror',
  name: 'RGB Mirror',
  category: 'glitch',
  icon: Film,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Symmetric reflection split in color channels.',
  defaultParameters: makeDefaultParams(5, 0),
  adjustableParameters: makeAdjustableParams('Mirror Split', 1, 15, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Symmetric flip horizontal on half screen with R/B displacement
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const mid = Math.floor(w / 2);
    const shift = Math.round(params.intensity);
    for (let y = 0; y < h; y++) {
      for (let x = mid; x < w; x++) {
        const rdi = (y * w + x) * 4;
        const lsi = (y * w + (w - x)) * 4;
        const lsiShift = (y * w + Math.max(0, w - x - shift)) * 4;
        const lsiShiftRight = (y * w + Math.min(w-1, w - x + shift)) * 4;
        d[rdi] = d[lsiShift];      // Red
        d[rdi+1] = d[lsi+1];      // Green
        d[rdi+2] = d[lsiShiftRight+2];  // Blue
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`crop=iw/2:ih:0:0,split[left][tmp];[tmp]vflip,hflip[right];[left][right]hstack`]
};

export const rgbPrism: EffectModule = {
  id: 'pro-rgb-prism',
  name: 'RGB Prism',
  category: 'glitch',
  icon: Layers,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Concentric refraction ring color splitting.',
  defaultParameters: makeDefaultParams(10, 1.2),
  adjustableParameters: makeAdjustableParams('Refraction Index', 2, 22, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    const shift = Math.sin(time * params.speed) * params.intensity;
    renderChannelSplit(ctx, video, canvas, -shift, -shift * 0.5, 0, 0, shift, shift * 0.5, params.opacity, params.blendMode);
  },
  ffmpegExportFilter: (params) => [`rgbashift=rh=${params.intensity}:rv=${params.intensity}:bh=-${params.intensity}`]
};

export const rgbHologram: EffectModule = {
  id: 'pro-rgb-hologram',
  name: 'RGB Hologram',
  category: 'glitch',
  icon: Tv,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Flickering horizontal scanline displacement.',
  defaultParameters: makeDefaultParams(6, 2),
  adjustableParameters: makeAdjustableParams('Jitter Amplitude', 2, 20, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const d = img.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(d);
    
    const scale = params.intensity;
    for (let y = 0; y < h; y += 2) {
      const shift = Math.round(Math.sin(y * 0.2 + time * params.speed * 8) * scale);
      for (let x = 0; x < w; x++) {
        const di = (y * w + x) * 4;
        const sx = Math.max(0, Math.min(w-1, x + shift));
        d[di] = temp[(y*w+sx)*4]; // Red channel offset
      }
    }
    ctx.putImageData(img, 0, 0);

    // Green scan lines overlay
    ctx.fillStyle = 'rgba(0,255,100,0.07)';
    for (let y = 0; y < canvas.height; y += 6) {
      ctx.fillRect(0, y, canvas.width, 2);
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=10:allf=t+u`]
};

export const rgbDigitalNoise: EffectModule = {
  id: 'pro-rgb-digital-noise',
  name: 'RGB Digital Noise',
  category: 'glitch',
  icon: Shuffle,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Digital square block chromatic noise.',
  defaultParameters: makeDefaultParams(15, 2.5),
  adjustableParameters: makeAdjustableParams('Block Size', 5, 40, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const size = Math.round(params.intensity);
    const flicker = Math.sin(time * params.speed * 12) > 0.4;
    if (flicker) {
      ctx.fillStyle = 'rgba(255,0,0,0.18)';
      for(let i=0; i<8; i++){
        ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, size*2, size);
      }
      ctx.fillStyle = 'rgba(0,0,255,0.18)';
      for(let i=0; i<8; i++){
        ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, size, size*2);
      }
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`noise=alls=20:allf=t+u`]
};

export const rgbSplitAdvanced: EffectModule = {
  id: 'pro-rgb-split-advanced',
  name: 'RGB Split Advanced',
  category: 'glitch',
  icon: Layers,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Full multi-directional color channel shear split.',
  defaultParameters: makeDefaultParams(12, 1),
  adjustableParameters: makeAdjustableParams('Shear Scale', 2, 35, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    const shift = params.intensity;
    renderChannelSplit(ctx, video, canvas, -shift, -shift * 0.4, shift * 0.3, shift * 0.3, 0, -shift * 0.7, params.opacity, params.blendMode);
  },
  ffmpegExportFilter: (params) => [`rgbashift=rh=${params.intensity}:rv=${params.intensity}:bh=-${params.intensity}:bv=-${params.intensity}`]
};
