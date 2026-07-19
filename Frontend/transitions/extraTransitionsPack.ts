import React from 'react';
import { TransitionModule } from './types';
import { Blend, Tv, Orbit, ZoomIn, Eye, Zap, RefreshCw, Sun, Moon, Flame, Wind } from 'lucide-react';

const createBaseStyles = (progress: number, layer: 'from' | 'to'): React.CSSProperties => {
  return {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    boxSizing: 'border-box',
  };
};

export const extraTransitionsPack: TransitionModule[] = [];

// 1. Creative Transitions (100)
// 10 themes * 10 variations
const creativeThemes = [
  { name: 'Mosaic Wave', xfade: 'radial', iconName: 'Blend', icon: Blend },
  { name: 'Kaleido Twist', xfade: 'dizzy', iconName: 'Orbit', icon: Orbit },
  { name: 'Spiral Vortex', xfade: 'radial', iconName: 'Orbit', icon: Orbit },
  { name: 'Star Pop', xfade: 'circleopen', iconName: 'Sparkles', icon: Blend },
  { name: 'Heart Reveal', xfade: 'circleopen', iconName: 'Sparkles', icon: Blend },
  { name: 'Cross Hatch', xfade: 'radial', iconName: 'Blend', icon: Blend },
  { name: 'Vector Grid', xfade: 'radial', iconName: 'Blend', icon: Blend },
  { name: 'Plasma Swirl', xfade: 'radial', iconName: 'Orbit', icon: Orbit },
  { name: 'Luma Fade', xfade: 'dissolve', iconName: 'Sun', icon: Sun },
  { name: 'Pixel Explosion', xfade: 'radial', iconName: 'Zap', icon: Zap }
];
creativeThemes.forEach((t) => {
  for (let v = 1; v <= 10; v++) {
    extraTransitionsPack.push({
      id: `pro-trans-creative-${t.name.toLowerCase().replace(/ /g, '-')}-${v}`,
      name: `${t.name} v${v}`,
      category: 'creative',
      description: `Premium creative ${t.name} transition variation ${v}.`,
      defaultDurationSec: 0.8,
      ffmpegTransitionName: t.xfade,
      iconName: t.iconName,
      thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150&auto=format&fit=crop&q=60',
      getCssStyle: (p, layer) => ({
        ...createBaseStyles(p, layer),
        opacity: layer === 'from' ? 1 - p : p,
        transform: layer === 'from' ? `rotate(${p * 15 * v}deg) scale(${1 - p * 0.1})` : `rotate(${(1 - p) * -15 * v}deg) scale(${p * 0.1 + 0.9})`,
      }),
      previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
        ctx.save();
        ctx.globalAlpha = 1 - p;
        ctx.drawImage(fromImg, 0, 0, w, h);
        ctx.globalAlpha = p;
        ctx.drawImage(toImg, 0, 0, w, h);
        ctx.restore();
      }
    });
  }
});

// 2. Shape Transitions (100)
// 10 themes * 10 variations
const shapeThemes = [
  { name: 'Circle Reveal', xfade: 'circleopen', iconName: 'Orbit', icon: Orbit },
  { name: 'Square Zoom', xfade: 'rectcrop', iconName: 'Orbit', icon: Orbit },
  { name: 'Diamond Wipe', xfade: 'radial', iconName: 'Blend', icon: Blend },
  { name: 'Triangle Cross', xfade: 'radial', iconName: 'Blend', icon: Blend },
  { name: 'Star Mask', xfade: 'circleopen', iconName: 'Blend', icon: Blend },
  { name: 'Grid Gate', xfade: 'horzopen', iconName: 'Tv', icon: Tv },
  { name: 'Hexagon Web', xfade: 'circleopen', iconName: 'Orbit', icon: Orbit },
  { name: 'Oval Wrap', xfade: 'circleopen', iconName: 'Orbit', icon: Orbit },
  { name: 'Ring Sweep', xfade: 'circleclose', iconName: 'Orbit', icon: Orbit },
  { name: 'Cross Cut', xfade: 'vertopen', iconName: 'Tv', icon: Tv }
];
shapeThemes.forEach((t) => {
  for (let v = 1; v <= 10; v++) {
    extraTransitionsPack.push({
      id: `pro-trans-shape-${t.name.toLowerCase().replace(/ /g, '-')}-${v}`,
      name: `${t.name} v${v}`,
      category: 'shape',
      description: `Geometrical shape ${t.name} transition variation ${v}.`,
      defaultDurationSec: 0.9,
      ffmpegTransitionName: t.xfade,
      iconName: t.iconName,
      thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150&auto=format&fit=crop&q=60',
      getCssStyle: (p, layer) => ({
        ...createBaseStyles(p, layer),
        clipPath: layer === 'from' ? `circle(${(1 - p) * 100}% at 50% 50%)` : `circle(${p * 100}% at 50% 50%)`,
      }),
      previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
        ctx.save();
        if (p < 0.5) {
          ctx.drawImage(fromImg, 0, 0, w, h);
        } else {
          ctx.drawImage(toImg, 0, 0, w, h);
        }
        ctx.restore();
      }
    });
  }
});

// 3. Glitch Transitions (100)
// 10 themes * 10 variations
const glitchThemes = [
  { name: 'Analog Scanline', xfade: 'slidehalftone', iconName: 'Tv', icon: Tv },
  { name: 'Data Slip', xfade: 'dizzy', iconName: 'Tv', icon: Tv },
  { name: 'RGB Split', xfade: 'slidehalftone', iconName: 'Zap', icon: Zap },
  { name: 'Voxel Grid', xfade: 'slidehalftone', iconName: 'Tv', icon: Tv },
  { name: 'Phase Shift', xfade: 'dizzy', iconName: 'Tv', icon: Tv },
  { name: 'Static Tear', xfade: 'slidehalftone', iconName: 'Tv', icon: Tv },
  { name: 'Frame Slip', xfade: 'dizzy', iconName: 'Tv', icon: Tv },
  { name: 'Strobe Slice', xfade: 'slidehalftone', iconName: 'Zap', icon: Zap },
  { name: 'Bitrate Burn', xfade: 'dizzy', iconName: 'Flame', icon: Flame },
  { name: 'Sync Noise', xfade: 'slidehalftone', iconName: 'Tv', icon: Tv }
];
glitchThemes.forEach((t) => {
  for (let v = 1; v <= 10; v++) {
    extraTransitionsPack.push({
      id: `pro-trans-glitch-${t.name.toLowerCase().replace(/ /g, '-')}-${v}`,
      name: `${t.name} v${v}`,
      category: 'glitch',
      description: `Digital glitch ${t.name} transition variation ${v}.`,
      defaultDurationSec: 0.6,
      ffmpegTransitionName: t.xfade,
      iconName: t.iconName,
      thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150&auto=format&fit=crop&q=60',
      getCssStyle: (p, layer) => ({
        ...createBaseStyles(p, layer),
        opacity: layer === 'from' ? 1 - p : p,
        filter: `contrast(${1 + p * 2}) saturate(${1 + p * 3})`,
      }),
      previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
        ctx.save();
        ctx.drawImage(fromImg, 0, 0, w, h);
        ctx.globalAlpha = p;
        ctx.drawImage(toImg, 0, 0, w, h);
        ctx.restore();
      }
    });
  }
});

// 4. Blur Transitions (100)
// 10 themes * 10 variations
const blurThemes = [
  { name: 'Gaussian Blur', xfade: 'radial', iconName: 'Eye', icon: Eye },
  { name: 'Radial Zoom', xfade: 'zoomin', iconName: 'Eye', icon: Eye },
  { name: 'Spin Blur', xfade: 'radial', iconName: 'Orbit', icon: Orbit },
  { name: 'Horizontal Smear', xfade: 'radial', iconName: 'Eye', icon: Eye },
  { name: 'Vertical Defocus', xfade: 'radial', iconName: 'Eye', icon: Eye },
  { name: 'Bokeh Fade', xfade: 'radial', iconName: 'Eye', icon: Eye },
  { name: 'Tilt Drift', xfade: 'radial', iconName: 'Eye', icon: Eye },
  { name: 'Focus Pull', xfade: 'radial', iconName: 'Eye', icon: Eye },
  { name: 'Ghost Blur', xfade: 'radial', iconName: 'Eye', icon: Eye },
  { name: 'Motion Leak', xfade: 'radial', iconName: 'Eye', icon: Eye }
];
blurThemes.forEach((t) => {
  for (let v = 1; v <= 10; v++) {
    extraTransitionsPack.push({
      id: `pro-trans-blur-${t.name.toLowerCase().replace(/ /g, '-')}-${v}`,
      name: `${t.name} v${v}`,
      category: 'blur',
      description: `Soft blur defocus ${t.name} transition variation ${v}.`,
      defaultDurationSec: 0.8,
      ffmpegTransitionName: t.xfade,
      iconName: t.iconName,
      thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150&auto=format&fit=crop&q=60',
      getCssStyle: (p, layer) => ({
        ...createBaseStyles(p, layer),
        opacity: layer === 'from' ? 1 - p : p,
        filter: `blur(${p * 8 * v}px)`,
      }),
      previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
        ctx.save();
        ctx.globalAlpha = 1 - p;
        ctx.drawImage(fromImg, 0, 0, w, h);
        ctx.globalAlpha = p;
        ctx.drawImage(toImg, 0, 0, w, h);
        ctx.restore();
      }
    });
  }
});

// 5. Slide Transitions (100)
// 10 themes * 10 variations
const slideThemes = [
  { name: 'Push Left', xfade: 'slideleft', iconName: 'Wind', icon: Wind },
  { name: 'Push Right', xfade: 'slideright', iconName: 'Wind', icon: Wind },
  { name: 'Slide Up', xfade: 'slideup', iconName: 'Wind', icon: Wind },
  { name: 'Slide Down', xfade: 'slidedown', iconName: 'Wind', icon: Wind },
  { name: 'Split Slide', xfade: 'hlslice', iconName: 'Tv', icon: Tv },
  { name: 'Diagonal Slide', xfade: 'slideleft', iconName: 'Wind', icon: Wind },
  { name: 'Corner Sweep', xfade: 'hrslice', iconName: 'Wind', icon: Wind },
  { name: 'Bypass Slide', xfade: 'slideleft', iconName: 'Wind', icon: Wind },
  { name: 'Elastic Push', xfade: 'slideleft', iconName: 'Wind', icon: Wind },
  { name: 'Whip Pan', xfade: 'slideleft', iconName: 'Wind', icon: Wind }
];
slideThemes.forEach((t) => {
  for (let v = 1; v <= 10; v++) {
    extraTransitionsPack.push({
      id: `pro-trans-slide-${t.name.toLowerCase().replace(/ /g, '-')}-${v}`,
      name: `${t.name} v${v}`,
      category: 'slide',
      description: `Dynamic sliding pan ${t.name} transition variation ${v}.`,
      defaultDurationSec: 0.7,
      ffmpegTransitionName: t.xfade,
      iconName: t.iconName,
      thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150&auto=format&fit=crop&q=60',
      getCssStyle: (p, layer) => ({
        ...createBaseStyles(p, layer),
        transform: layer === 'from' ? `translateX(${-p * 100}%)` : `translateX(${(1 - p) * 100}%)`,
      }),
      previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
        ctx.save();
        ctx.drawImage(fromImg, -p * w, 0, w, h);
        ctx.drawImage(toImg, (1 - p) * w, 0, w, h);
        ctx.restore();
      }
    });
  }
});

// 6. Zoom Transitions (100)
// 10 themes * 10 variations
const zoomThemes = [
  { name: 'Zoom In', xfade: 'zoomin', iconName: 'ZoomIn', icon: ZoomIn },
  { name: 'Zoom Out', xfade: 'zoomin', iconName: 'ZoomIn', icon: ZoomIn },
  { name: 'Elastic Zoom', xfade: 'zoomin', iconName: 'ZoomIn', icon: ZoomIn },
  { name: 'Smooth Dolly', xfade: 'zoomin', iconName: 'ZoomIn', icon: ZoomIn },
  { name: 'Crash Zoom', xfade: 'zoomin', iconName: 'ZoomIn', icon: ZoomIn },
  { name: 'Spin Zoom', xfade: 'zoomin', iconName: 'Orbit', icon: Orbit },
  { name: 'Pinch Reveal', xfade: 'zoomin', iconName: 'ZoomIn', icon: ZoomIn },
  { name: 'Bulge Exit', xfade: 'zoomin', iconName: 'ZoomIn', icon: ZoomIn },
  { name: 'Scale Jump', xfade: 'zoomin', iconName: 'ZoomIn', icon: ZoomIn },
  { name: 'Depth Orbit', xfade: 'zoomin', iconName: 'Orbit', icon: Orbit }
];
zoomThemes.forEach((t) => {
  for (let v = 1; v <= 10; v++) {
    extraTransitionsPack.push({
      id: `pro-trans-zoom-${t.name.toLowerCase().replace(/ /g, '-')}-${v}`,
      name: `${t.name} v${v}`,
      category: 'zoom',
      description: `Impactful zoom scale ${t.name} transition variation ${v}.`,
      defaultDurationSec: 0.8,
      ffmpegTransitionName: t.xfade,
      iconName: t.iconName,
      thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150&auto=format&fit=crop&q=60',
      getCssStyle: (p, layer) => ({
        ...createBaseStyles(p, layer),
        transform: layer === 'from' ? `scale(${1 - p})` : `scale(${p})`,
        opacity: layer === 'from' ? 1 - p : p,
      }),
      previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
        ctx.save();
        ctx.globalAlpha = 1 - p;
        ctx.drawImage(fromImg, 0, 0, w, h);
        ctx.globalAlpha = p;
        ctx.drawImage(toImg, 0, 0, w, h);
        ctx.restore();
      }
    });
  }
});

// 7. Dissolve & Wipe Transitions (100)
// 10 themes * 10 variations
const dissolveThemes = [
  { name: 'Cross Dissolve', xfade: 'dissolve', iconName: 'Blend', icon: Blend },
  { name: 'Dip to Black', xfade: 'fadeblack', iconName: 'Moon', icon: Moon },
  { name: 'Dip to White', xfade: 'fadewhite', iconName: 'Sun', icon: Sun },
  { name: 'Color Burn', xfade: 'dissolve', iconName: 'Flame', icon: Flame },
  { name: 'Film Melt', xfade: 'dissolve', iconName: 'Flame', icon: Flame },
  { name: 'Luma Dissolve', xfade: 'dissolve', iconName: 'Sun', icon: Sun },
  { name: 'Ripple Wipe', xfade: 'radial', iconName: 'RefreshCw', icon: RefreshCw },
  { name: 'Smooth Wipe', xfade: 'smoothleft', iconName: 'Wind', icon: Wind },
  { name: 'Radial Wipe', xfade: 'radial', iconName: 'RefreshCw', icon: RefreshCw },
  { name: 'Linear Wipe', xfade: 'wipeleft', iconName: 'Wind', icon: Wind }
];
dissolveThemes.forEach((t) => {
  for (let v = 1; v <= 10; v++) {
    extraTransitionsPack.push({
      id: `pro-trans-dissolve-${t.name.toLowerCase().replace(/ /g, '-')}-${v}`,
      name: `${t.name} v${v}`,
      category: 'dissolve',
      description: `Seamless blending dissolve/wipe ${t.name} transition variation ${v}.`,
      defaultDurationSec: 0.8,
      ffmpegTransitionName: t.xfade,
      iconName: t.iconName,
      thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150&auto=format&fit=crop&q=60',
      getCssStyle: (p, layer) => ({
        ...createBaseStyles(p, layer),
        opacity: layer === 'from' ? 1 - p : p,
      }),
      previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
        ctx.save();
        ctx.globalAlpha = 1 - p;
        ctx.drawImage(fromImg, 0, 0, w, h);
        ctx.globalAlpha = p;
        ctx.drawImage(toImg, 0, 0, w, h);
        ctx.restore();
      }
    });
  }
});
