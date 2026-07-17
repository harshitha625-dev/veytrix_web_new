import React from 'react';
import { TransitionModule } from './types';

// Helper for CSS transitions
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

export const transitionsPack: TransitionModule[] = [
  // ==========================================
  // DISSOLVES & FADES (5)
  // ==========================================
  {
    id: 'cross-dissolve',
    name: 'Cross Dissolve',
    category: 'dissolve',
    description: 'A smooth, classic blending transition from the outgoing clip to the incoming clip.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'dissolve',
    iconName: 'Blend',
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
  },
  {
    id: 'fade-black',
    name: 'Dip to Black',
    category: 'dissolve',
    description: 'Fades out completely to black before fading in the next clip.',
    defaultDurationSec: 1.0,
    ffmpegTransitionName: 'fadeblack',
    iconName: 'Moon',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      opacity: layer === 'from' ? (p < 0.5 ? 1 - p * 2 : 0) : (p < 0.5 ? 0 : (p - 0.5) * 2),
      backgroundColor: 'black',
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      if (p < 0.5) {
        ctx.drawImage(fromImg, 0, 0, w, h);
        ctx.fillStyle = 'rgba(0, 0, 0, ' + (p * 2) + ')';
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.drawImage(toImg, 0, 0, w, h);
        ctx.fillStyle = 'rgba(0, 0, 0, ' + ((1 - p) * 2) + ')';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();
    }
  },
  {
    id: 'fade-white',
    name: 'Dip to White',
    category: 'dissolve',
    description: 'Fades out completely to white, producing a flash-like transition between clips.',
    defaultDurationSec: 1.0,
    ffmpegTransitionName: 'fadewhite',
    iconName: 'Sun',
    thumbnailUrl: 'https://images.unsplash.com/photo-1548263591-192b9ff877e3?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      opacity: layer === 'from' ? (p < 0.5 ? 1 - p * 2 : 0) : (p < 0.5 ? 0 : (p - 0.5) * 2),
      backgroundColor: 'white',
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      if (p < 0.5) {
        ctx.drawImage(fromImg, 0, 0, w, h);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (p * 2) + ')';
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.drawImage(toImg, 0, 0, w, h);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + ((1 - p) * 2) + ')';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();
    }
  },
  {
    id: 'color-burn',
    name: 'Color Burn',
    category: 'dissolve',
    description: 'Simulates film chemistry burning through to reveal the next scene.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'burn',
    iconName: 'Flame',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524169358666-79f22534bc6e?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      opacity: layer === 'from' ? 1 - p : p,
      filter: `contrast(${1 + p * 3}) saturate(${1 + p * 2})`,
      mixBlendMode: layer === 'from' ? 'normal' : 'color-burn',
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.globalAlpha = p;
      ctx.globalCompositeOperation = 'color-burn';
      ctx.filter = `contrast(${1 + p * 3}) saturate(${1 + p * 2})`;
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'exposure-glow',
    name: 'Exposure Glow',
    category: 'dissolve',
    description: 'A sudden bright overexposure transition blooming into the next shot.',
    defaultDurationSec: 0.7,
    ffmpegTransitionName: 'exposure',
    iconName: 'Zap',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const isFrom = layer === 'from';
      const factor = p < 0.5 ? p * 2 : (1 - p) * 2;
      return {
        ...createBaseStyles(p, layer),
        opacity: isFrom ? 1 - p : p,
        filter: `brightness(${1 + factor * 2.5}) contrast(${1 - factor * 0.4})`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      const factor = p < 0.5 ? p * 2 : (1 - p) * 2;
      ctx.filter = `brightness(${1 + factor * 2.5}) contrast(${1 - factor * 0.4})`;
      ctx.globalAlpha = 1 - p;
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.globalAlpha = p;
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },

  // ==========================================
  // SLIDES (12)
  // ==========================================
  {
    id: 'slide-left',
    name: 'Slide Left',
    category: 'slide',
    description: 'Pushes the old clip out to the left as the new clip slides in from the right.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'slideleft',
    iconName: 'ArrowLeft',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=150&auto=format&fit=crop&q=60',
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
  },
  {
    id: 'slide-right',
    name: 'Slide Right',
    category: 'slide',
    description: 'Pushes the old clip out to the right as the new clip slides in from the left.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'slideright',
    iconName: 'ArrowRight',
    thumbnailUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      transform: layer === 'from' ? `translateX(${p * 100}%)` : `translateX(${-(1 - p) * 100}%)`,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, p * w, 0, w, h);
      ctx.drawImage(toImg, -(1 - p) * w, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'slide-up',
    name: 'Slide Up',
    category: 'slide',
    description: 'Slides the new clip upward from the bottom of the frame.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'slideup',
    iconName: 'ArrowUp',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      transform: layer === 'from' ? `translateY(${-p * 100}%)` : `translateY(${(1 - p) * 100}%)`,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, -p * h, w, h);
      ctx.drawImage(toImg, 0, (1 - p) * h, w, h);
      ctx.restore();
    }
  },
  {
    id: 'slide-down',
    name: 'Slide Down',
    category: 'slide',
    description: 'Slides the new clip downward from the top of the frame.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'slidedown',
    iconName: 'ArrowDown',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      transform: layer === 'from' ? `translateY(${p * 100}%)` : `translateY(${-(1 - p) * 100}%)`,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, p * h, w, h);
      ctx.drawImage(toImg, 0, -(1 - p) * h, w, h);
      ctx.restore();
    }
  },
  {
    id: 'smooth-slide-left',
    name: 'Smooth Slide Left',
    category: 'slide',
    description: 'Slightly eased slide left transition for a premium editorial dynamic.',
    defaultDurationSec: 0.9,
    ffmpegTransitionName: 'smoothleft',
    iconName: 'ChevronLeft',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550859492-d5da97c445c5?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const ease = p * p * (3 - 2 * p); // Cubic ease-in-out
      return {
        ...createBaseStyles(p, layer),
        transform: layer === 'from' ? `translateX(${-ease * 100}%)` : `translateX(${(1 - ease) * 100}%)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      const ease = p * p * (3 - 2 * p);
      ctx.drawImage(fromImg, -ease * w, 0, w, h);
      ctx.drawImage(toImg, (1 - ease) * w, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'smooth-slide-right',
    name: 'Smooth Slide Right',
    category: 'slide',
    description: 'Slightly eased slide right transition with dynamic inertia.',
    defaultDurationSec: 0.9,
    ffmpegTransitionName: 'smoothright',
    iconName: 'ChevronRight',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const ease = p * p * (3 - 2 * p);
      return {
        ...createBaseStyles(p, layer),
        transform: layer === 'from' ? `translateX(${ease * 100}%)` : `translateX(${-(1 - ease) * 100}%)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      const ease = p * p * (3 - 2 * p);
      ctx.drawImage(fromImg, ease * w, 0, w, h);
      ctx.drawImage(toImg, -(1 - ease) * w, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'smooth-slide-up',
    name: 'Smooth Slide Up',
    category: 'slide',
    description: 'Smooth eased scroll upward revealing the next scene.',
    defaultDurationSec: 0.9,
    ffmpegTransitionName: 'smoothup',
    iconName: 'ChevronUp',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const ease = p * p * (3 - 2 * p);
      return {
        ...createBaseStyles(p, layer),
        transform: layer === 'from' ? `translateY(${-ease * 100}%)` : `translateY(${(1 - ease) * 100}%)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      const ease = p * p * (3 - 2 * p);
      ctx.drawImage(fromImg, 0, -ease * h, w, h);
      ctx.drawImage(toImg, 0, (1 - ease) * h, w, h);
      ctx.restore();
    }
  },
  {
    id: 'smooth-slide-down',
    name: 'Smooth Slide Down',
    category: 'slide',
    description: 'Smooth eased scroll downward revealing the next scene.',
    defaultDurationSec: 0.9,
    ffmpegTransitionName: 'smoothdown',
    iconName: 'ChevronDown',
    thumbnailUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const ease = p * p * (3 - 2 * p);
      return {
        ...createBaseStyles(p, layer),
        transform: layer === 'from' ? `translateY(${ease * 100}%)` : `translateY(${-(1 - ease) * 100}%)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      const ease = p * p * (3 - 2 * p);
      ctx.drawImage(fromImg, 0, ease * h, w, h);
      ctx.drawImage(toImg, 0, -(1 - ease) * h, w, h);
      ctx.restore();
    }
  },
  {
    id: 'squeeze-horizontal',
    name: 'Squeeze Horizontal',
    category: 'slide',
    description: 'Compresses outgoing clip horizontally into a line as the incoming clip unfolds.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'squeezeh',
    iconName: 'Scale',
    thumbnailUrl: 'https://images.unsplash.com/photo-1502239608882-93b729c6af43?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      transform: layer === 'from' ? `scaleX(${1 - p})` : `scaleX(${p})`,
      opacity: layer === 'from' ? 1 - p * 0.5 : 0.5 + p * 0.5,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, (p * w) / 2, 0, w * (1 - p), h);
      ctx.globalAlpha = p;
      ctx.drawImage(toImg, ((1 - p) * w) / 2, 0, w * p, h);
      ctx.restore();
    }
  },
  {
    id: 'squeeze-vertical',
    name: 'Squeeze Vertical',
    category: 'slide',
    description: 'Compresses outgoing clip vertically into a line as the incoming clip unfolds.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'squeezev',
    iconName: 'Scale',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      transform: layer === 'from' ? `scaleY(${1 - p})` : `scaleY(${p})`,
      opacity: layer === 'from' ? 1 - p * 0.5 : 0.5 + p * 0.5,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, (p * h) / 2, w, h * (1 - p));
      ctx.globalAlpha = p;
      ctx.drawImage(toImg, 0, ((1 - p) * h) / 2, w, h * p);
      ctx.restore();
    }
  },
  {
    id: 'squeeze-full',
    name: 'Full Squeeze',
    category: 'slide',
    description: 'Squeezes the outgoing clip into the center in both axes while the new clip expands.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'squeeze',
    iconName: 'Minimize2',
    thumbnailUrl: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      transform: layer === 'from' ? `scale(${1 - p})` : `scale(${p})`,
      opacity: layer === 'from' ? 1 - p : p,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, (p * w) / 2, (p * h) / 2, w * (1 - p), h * (1 - p));
      ctx.globalAlpha = p;
      ctx.drawImage(toImg, ((1 - p) * w) / 2, ((1 - p) * h) / 2, w * p, h * p);
      ctx.restore();
    }
  },
  {
    id: 'diagonal-slide',
    name: 'Diagonal Slide',
    category: 'slide',
    description: 'Slides the incoming clip diagonally from the lower-left to upper-right corner.',
    defaultDurationSec: 0.9,
    ffmpegTransitionName: 'diaglt',
    iconName: 'CornerDownLeft',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      transform: layer === 'from'
        ? `translate(${-p * 100}%, ${p * 100}%)`
        : `translate(${(1 - p) * 100}%, ${-(1 - p) * 100}%)`,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, -p * w, p * h, w, h);
      ctx.drawImage(toImg, (1 - p) * w, -(1 - p) * h, w, h);
      ctx.restore();
    }
  },

  // ==========================================
  // WIPES (16)
  // ==========================================
  {
    id: 'swipe-left',
    name: 'Swipe Left',
    category: 'wipe',
    description: 'A sharp, sweeping line wipe from right to left.',
    defaultDurationSec: 0.7,
    ffmpegTransitionName: 'wipeleft',
    iconName: 'ArrowLeftSquare',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const isFrom = layer === 'from';
      return {
        ...createBaseStyles(p, layer),
        clipPath: isFrom ? `inset(0 ${p * 100}% 0 0)` : `inset(0 0 0 ${(1 - p) * 100}%)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      ctx.rect((1 - p) * w, 0, p * w, h);
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'swipe-right',
    name: 'Swipe Right',
    category: 'wipe',
    description: 'A sharp, sweeping line wipe from left to right.',
    defaultDurationSec: 0.7,
    ffmpegTransitionName: 'wiperight',
    iconName: 'ArrowRightSquare',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const isFrom = layer === 'from';
      return {
        ...createBaseStyles(p, layer),
        clipPath: isFrom ? `inset(0 0 0 ${p * 100}%)` : `inset(0 ${(1 - p) * 100}% 0 0)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      ctx.rect(0, 0, p * w, h);
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'swipe-up',
    name: 'Swipe Up',
    category: 'wipe',
    description: 'A vertical sweeping line wipe from bottom to top.',
    defaultDurationSec: 0.7,
    ffmpegTransitionName: 'wipeup',
    iconName: 'ArrowUpSquare',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const isFrom = layer === 'from';
      return {
        ...createBaseStyles(p, layer),
        clipPath: isFrom ? `inset(0 0 ${p * 100}% 0)` : `inset(${(1 - p) * 100}% 0 0 0)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      ctx.rect(0, (1 - p) * h, w, p * h);
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'swipe-down',
    name: 'Swipe Down',
    category: 'wipe',
    description: 'A vertical sweeping line wipe from top to bottom.',
    defaultDurationSec: 0.7,
    ffmpegTransitionName: 'wipedown',
    iconName: 'ArrowDownSquare',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const isFrom = layer === 'from';
      return {
        ...createBaseStyles(p, layer),
        clipPath: isFrom ? `inset(${p * 100}% 0 0 0)` : `inset(0 0 ${(1 - p) * 100}% 0)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      ctx.rect(0, 0, w, p * h);
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'diagonal-wipe-ul-lr',
    name: 'Diagonal Wipe UL-LR',
    category: 'wipe',
    description: 'Diagonally sweeps across the screen from Upper-Left to Lower-Right.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'diagld',
    iconName: 'TrendingDown',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544300309-67a212d5cd7b?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const pct = p * 100;
      return {
        ...createBaseStyles(p, layer),
        clipPath: layer === 'from'
          ? `polygon(0% 0%, ${100 - pct}% 0%, 0% ${100 - pct}%)`
          : `polygon(100% 100%, ${100 - pct}% 100%, 100% ${100 - pct}%)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      ctx.moveTo(w, h);
      ctx.lineTo(w - p * w * 2, h);
      ctx.lineTo(w, h - p * h * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'diagonal-wipe-ll-ur',
    name: 'Diagonal Wipe LL-UR',
    category: 'wipe',
    description: 'Diagonally sweeps across the screen from Lower-Left to Upper-Right.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'diaglt',
    iconName: 'TrendingUp',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const pct = p * 100;
      return {
        ...createBaseStyles(p, layer),
        clipPath: layer === 'from'
          ? `polygon(0% 100%, 0% ${pct}%, ${100 - pct}% 100%)`
          : `polygon(100% 0%, 100% ${pct}%, ${100 - pct}% 0%)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      ctx.moveTo(w, 0);
      ctx.lineTo(w - p * w * 2, 0);
      ctx.lineTo(w, p * h * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'diagonal-wipe-ur-ll',
    name: 'Diagonal Wipe UR-LL',
    category: 'wipe',
    description: 'Diagonally sweeps across the screen from Upper-Right to Lower-Left.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'diagrd',
    iconName: 'CornerUpLeft',
    thumbnailUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const pct = p * 100;
      return {
        ...createBaseStyles(p, layer),
        clipPath: layer === 'from'
          ? `polygon(100% 0%, ${pct}% 0%, 100% ${100 - pct}%)`
          : `polygon(0% 100%, ${pct}% 100%, 0% ${100 - pct}%)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(p * w * 2, h);
      ctx.lineTo(0, h - p * h * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'diagonal-wipe-lr-ul',
    name: 'Diagonal Wipe LR-UL',
    category: 'wipe',
    description: 'Diagonally sweeps across the screen from Lower-Right to Upper-Left.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'diagrt',
    iconName: 'CornerUpRight',
    thumbnailUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const pct = p * 100;
      return {
        ...createBaseStyles(p, layer),
        clipPath: layer === 'from'
          ? `polygon(100% 100%, 100% ${pct}%, ${pct}% 100%)`
          : `polygon(0% 0%, 0% ${pct}%, ${pct}% 0%)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(p * w * 2, 0);
      ctx.lineTo(0, p * h * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'horizontal-open',
    name: 'Horizontal Open',
    category: 'wipe',
    description: 'Splits open like a double door from the center outward.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'horizopen',
    iconName: 'Columns',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const half = p * 50;
      return {
        ...createBaseStyles(p, layer),
        clipPath: layer === 'from'
          ? `polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%, 100% 100%, 50% 100%, 50% 0%, 100% 0%)`
          : `polygon(${50 - half}% 0%, ${50 + half}% 0%, ${50 + half}% 100%, ${50 - half}% 100%)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      ctx.rect(w / 2 - (p * w) / 2, 0, p * w, h);
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'horizontal-close',
    name: 'Horizontal Close',
    category: 'wipe',
    description: 'Closes like a set of shutters meeting in the center.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'horizclose',
    iconName: 'Minimize',
    thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const half = p * 50;
      return {
        ...createBaseStyles(p, layer),
        clipPath: layer === 'from'
          ? `polygon(${half}% 0%, ${100 - half}% 0%, ${100 - half}% 100%, ${half}% 100%)`
          : `polygon(0% 0%, ${half}% 0%, ${half}% 100%, 0% 100%, 100% 100%, ${100 - half}% 100%, ${100 - half}% 0%, 100% 0%)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      ctx.rect(0, 0, (p * w) / 2, h);
      ctx.rect(w - (p * w) / 2, 0, (p * w) / 2, h);
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'vertical-open',
    name: 'Vertical Open',
    category: 'wipe',
    description: 'Splits open vertically from the horizontal centerline.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'vertopen',
    iconName: 'Rows',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const half = p * 50;
      return {
        ...createBaseStyles(p, layer),
        clipPath: layer === 'from'
          ? 'none'
          : `polygon(0% ${50 - half}%, 100% ${50 - half}%, 100% ${50 + half}%, 0% ${50 + half}%)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      ctx.rect(0, h / 2 - (p * h) / 2, w, p * h);
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'vertical-close',
    name: 'Vertical Close',
    category: 'wipe',
    description: 'Closes like vertical gates meeting in the center.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'vertclose',
    iconName: 'AlignJustify',
    thumbnailUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const half = p * 50;
      return {
        ...createBaseStyles(p, layer),
        clipPath: layer === 'from'
          ? `polygon(0% ${half}%, 100% ${half}%, 100% ${100 - half}%, 0% ${100 - half}%)`
          : `polygon(0% 0%, 100% 0%, 100% ${half}%, 0% ${half}%, 0% 100%, 100% 100%, 100% ${100 - half}%, 0% ${100 - half}%)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      ctx.rect(0, 0, w, (p * h) / 2);
      ctx.rect(0, h - (p * h) / 2, w, (p * h) / 2);
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'radial-wipe',
    name: 'Radial Wipe',
    category: 'wipe',
    description: 'A circular radial wipe resembling a clock hand.',
    defaultDurationSec: 1.0,
    ffmpegTransitionName: 'radial',
    iconName: 'Clock',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const angle = p * 360;
      return {
        ...createBaseStyles(p, layer),
        clipPath: layer === 'from'
          ? 'none'
          : `conic-gradient(from 0deg, white 0deg, white ${angle}deg, transparent ${angle}deg)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.arc(w / 2, h / 2, Math.max(w, h), -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2, false);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'circle-crop-wipe',
    name: 'Circle Crop Wipe',
    category: 'wipe',
    description: 'Transition masking via circular zoom reveal.',
    defaultDurationSec: 0.9,
    ffmpegTransitionName: 'circlecrop',
    iconName: 'CircleDot',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      clipPath: layer === 'from' ? 'none' : `circle(${p * 75}% at 50% 50%)`,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      const r = Math.sqrt(w * w + h * h) * p;
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'random-blocks',
    name: 'Random Blocks',
    category: 'wipe',
    description: 'Reveals the new clip using a randomized grid of mosaic blocks.',
    defaultDurationSec: 1.2,
    ffmpegTransitionName: 'random',
    iconName: 'Grid',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      opacity: layer === 'from' ? 1 - p : p,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      const cols = 10;
      const rows = 10;
      const blockW = w / cols;
      const blockH = h / rows;
      
      ctx.beginPath();
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const val = ((c * 17 + r * 37) % 100) / 100;
          if (val < p) {
            ctx.rect(c * blockW, r * blockH, blockW, blockH);
          }
        }
      }
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'wind-wipe',
    name: 'Wind Wipe',
    category: 'wipe',
    description: 'A windy, feathered horizontal scan transition.',
    defaultDurationSec: 1.0,
    ffmpegTransitionName: 'wind',
    iconName: 'Wind',
    thumbnailUrl: 'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      opacity: layer === 'from' ? 1 - p : p,
      transform: layer === 'from' ? `skewX(${p * 30}deg) translateX(${-p * 50}%)` : `skewX(${-(1 - p) * 30}deg) translateX(${(1 - p) * 50}%)`,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const jaggedPoints = 15;
      const step = h / jaggedPoints;
      for (let i = 0; i <= jaggedPoints; i++) {
        const y = i * step;
        const xOffset = Math.sin(y * 0.05 + p * 10) * 40 * (1 - p);
        const targetX = p * w + xOffset;
        ctx.lineTo(targetX, y);
      }
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.clip();
      
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },

  // ==========================================
  // ZOOMS (4)
  // ==========================================
  {
    id: 'zoom-in',
    name: 'Zoom In',
    category: 'zoom',
    description: 'Zooms in sharply towards the screen to reveal the next clip.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'zoomin',
    iconName: 'ZoomIn',
    thumbnailUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      transform: layer === 'from' ? `scale(${1 + p * 1.5})` : `scale(${0.3 + p * 0.7})`,
      opacity: layer === 'from' ? 1 - p : p,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      if (p < 0.5) {
        ctx.globalAlpha = 1 - p * 2;
        const s = 1 + p * 2;
        ctx.drawImage(fromImg, (w - w * s) / 2, (h - h * s) / 2, w * s, h * s);
      } else {
        ctx.globalAlpha = (p - 0.5) * 2;
        const s = 0.5 + (p - 0.5) * 1;
        ctx.drawImage(toImg, (w - w * s) / 2, (h - h * s) / 2, w * s, h * s);
      }
      ctx.restore();
    }
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out',
    category: 'zoom',
    description: 'Zooms out from the current clip to frame the next clip.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'zoomout',
    iconName: 'ZoomOut',
    thumbnailUrl: 'https://images.unsplash.com/photo-1489533119213-66a5cd877091?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      transform: layer === 'from' ? `scale(${1 - p * 0.7})` : `scale(${2.5 - p * 1.5})`,
      opacity: layer === 'from' ? 1 - p : p,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      if (p < 0.5) {
        ctx.globalAlpha = 1 - p * 2;
        const s = 1 - p;
        ctx.drawImage(fromImg, (w - w * s) / 2, (h - h * s) / 2, w * s, h * s);
      } else {
        ctx.globalAlpha = (p - 0.5) * 2;
        const s = 2 - p;
        ctx.drawImage(toImg, (w - w * s) / 2, (h - h * s) / 2, w * s, h * s);
      }
      ctx.restore();
    }
  },
  {
    id: 'cross-zoom',
    name: 'Cross Zoom',
    category: 'zoom',
    description: 'Zooms deeply into the outgoing clip and zooms out from the incoming clip.',
    defaultDurationSec: 0.9,
    ffmpegTransitionName: 'crosszoom',
    iconName: 'Maximize',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      transform: layer === 'from' ? `scale(${1 + p * 3})` : `scale(${0.1 + p * 0.9})`,
      opacity: layer === 'from' ? 1 - p : p,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      if (p < 0.5) {
        ctx.globalAlpha = 1 - p * 2;
        const s = 1 + p * 3;
        ctx.drawImage(fromImg, (w - w * s) / 2, (h - h * s) / 2, w * s, h * s);
      } else {
        ctx.globalAlpha = (p - 0.5) * 2;
        const s = 0.1 + (p - 0.5) * 1.8;
        ctx.drawImage(toImg, (w - w * s) / 2, (h - h * s) / 2, w * s, h * s);
      }
      ctx.restore();
    }
  },
  {
    id: 'spiral-zoom',
    name: 'Spiral Zoom',
    category: 'zoom',
    description: 'Spins dynamically while zooming in to reveal the incoming clip.',
    defaultDurationSec: 1.0,
    ffmpegTransitionName: 'circleclose',
    iconName: 'RotateCw',
    thumbnailUrl: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      transform: layer === 'from'
        ? `scale(${1 + p * 2}) rotate(${p * 180}deg)`
        : `scale(${0.2 + p * 0.8}) rotate(${(1 - p) * -180}deg)`,
      opacity: layer === 'from' ? 1 - p : p,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.translate(w / 2, h / 2);
      if (p < 0.5) {
        ctx.globalAlpha = 1 - p * 2;
        ctx.rotate(p * Math.PI);
        const s = 1 + p * 2;
        ctx.drawImage(fromImg, -w * s / 2, -h * s / 2, w * s, h * s);
      } else {
        ctx.globalAlpha = (p - 0.5) * 2;
        ctx.rotate((1 - p) * -Math.PI);
        const s = 0.2 + (p - 0.5) * 1.6;
        ctx.drawImage(toImg, -w * s / 2, -h * s / 2, w * s, h * s);
      }
      ctx.restore();
    }
  },

  // ==========================================
  // BLURS & GLITCHES (5)
  // ==========================================
  {
    id: 'blur-horizontal',
    name: 'Horizontal Blur',
    category: 'blur',
    description: 'Blurs horizontally as the scenes blend for a dream-like transition.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'hblur',
    iconName: 'EyeOff',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const isFrom = layer === 'from';
      const factor = p < 0.5 ? p * 20 : (1 - p) * 20;
      return {
        ...createBaseStyles(p, layer),
        opacity: isFrom ? 1 - p : p,
        filter: `blur(${factor}px) contrast(1.1)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      const factor = p < 0.5 ? p * 20 : (1 - p) * 20;
      ctx.filter = `blur(${factor}px)`;
      ctx.globalAlpha = 1 - p;
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.globalAlpha = p;
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'blur-vertical',
    name: 'Vertical Blur',
    category: 'blur',
    description: 'Blurs vertically as the scenes blend.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'vblur',
    iconName: 'EyeOff',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const isFrom = layer === 'from';
      const factor = p < 0.5 ? p * 20 : (1 - p) * 20;
      return {
        ...createBaseStyles(p, layer),
        opacity: isFrom ? 1 - p : p,
        filter: `blur(${factor}px) contrast(1.1)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      const factor = p < 0.5 ? p * 20 : (1 - p) * 20;
      ctx.filter = `blur(${factor}px)`;
      ctx.globalAlpha = 1 - p;
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.globalAlpha = p;
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'pixelize-glitch',
    name: 'Pixelize Glitch',
    category: 'glitch',
    description: 'Dissolves using retro-pixelation block artifacts.',
    defaultDurationSec: 1.0,
    ffmpegTransitionName: 'pixelize',
    iconName: 'Cpu',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      return {
        ...createBaseStyles(p, layer),
        opacity: layer === 'from' ? 1 - p : p,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      // Draw pixelated blocks
      ctx.globalAlpha = 1 - p;
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.globalAlpha = p;
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'rgb-split-glitch',
    name: 'RGB Split Glitch',
    category: 'glitch',
    description: 'Splits red, green, and blue color channels for a digital glitch appearance.',
    defaultDurationSec: 0.8,
    ffmpegTransitionName: 'dissolve',
    iconName: 'Tv',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const shift = Math.sin(p * Math.PI) * 12;
      return {
        ...createBaseStyles(p, layer),
        opacity: layer === 'from' ? 1 - p : p,
        transform: layer === 'from' ? `translateX(${shift}px)` : `translateX(${-shift}px)`,
        filter: p > 0.05 && p < 0.95 ? 'hue-rotate(45deg)' : 'none',
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      const shift = Math.sin(p * Math.PI) * 20;
      ctx.globalAlpha = 1 - p;
      ctx.drawImage(fromImg, -shift, 0, w, h);
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = p;
      ctx.drawImage(toImg, shift, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'whip-pan',
    name: 'Whip Pan',
    category: 'glitch',
    description: 'A rapid, motion-blurred pan sliding from right to left.',
    defaultDurationSec: 0.6,
    ffmpegTransitionName: 'slideleft',
    iconName: 'Move',
    thumbnailUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      transform: layer === 'from'
        ? `translateX(${-p * 150}%) skewX(${p * 20}deg) scale(${1 - p * 0.1})`
        : `translateX(${(1 - p) * 150}%) skewX(${-(1 - p) * 20}deg) scale(${0.9 + p * 0.1})`,
      filter: p > 0.05 && p < 0.95 ? `blur(${p * (1 - p) * 15}px)` : 'none',
      opacity: layer === 'from' ? 1 - p : p,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      const blurFactor = p * (1 - p) * 25;
      ctx.filter = `blur(${blurFactor}px)`;
      ctx.drawImage(fromImg, -p * w * 1.5, 0, w, h);
      ctx.drawImage(toImg, (1 - p) * w * 1.5, 0, w, h);
      ctx.restore();
    }
  },

  // ==========================================
  // SHAPES & CREATIVE (8)
  // ==========================================
  {
    id: 'circle-open',
    name: 'Circle Open',
    category: 'shape',
    description: 'An iris reveal starting as a small dot in the center expanding to full screen.',
    defaultDurationSec: 0.9,
    ffmpegTransitionName: 'circleopen',
    iconName: 'Circle',
    thumbnailUrl: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      clipPath: layer === 'from' ? 'none' : `circle(${p * 100}% at 50% 50%)`,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      const r = Math.sqrt(w * w + h * h) * p;
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'circle-close',
    name: 'Circle Close',
    category: 'shape',
    description: 'An iris close focusing onto the center before displaying the next clip.',
    defaultDurationSec: 0.9,
    ffmpegTransitionName: 'circleclose',
    iconName: 'CircleDot',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      clipPath: layer === 'from' ? `circle(${(1 - p) * 100}% at 50% 50%)` : 'none',
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.beginPath();
      const r = Math.sqrt(w * w + h * h) * (1 - p);
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'heart-reveal',
    name: 'Heart Reveal',
    category: 'shape',
    description: 'A romantic heart-shaped wipe expanding outwards.',
    defaultDurationSec: 1.0,
    ffmpegTransitionName: 'heart',
    iconName: 'Heart',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      opacity: layer === 'from' ? 1 - p : p,
      transform: layer === 'from' ? 'none' : `scale(${0.8 + p * 0.2})`,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      
      const x = w / 2;
      const y = h / 2;
      
      ctx.translate(x, y);
      ctx.scale(p, p);
      
      ctx.moveTo(0, -100);
      ctx.bezierCurveTo(-100, -200, -250, -50, 0, 150);
      ctx.bezierCurveTo(250, -50, 100, -200, 0, -100);
      
      ctx.closePath();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'star-reveal',
    name: 'Star Reveal',
    category: 'shape',
    description: 'An expanding star-shaped mask reveals the next scene.',
    defaultDurationSec: 1.0,
    ffmpegTransitionName: 'star',
    iconName: 'Star',
    thumbnailUrl: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      opacity: layer === 'from' ? 1 - p : p,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      
      const spikes = 5;
      const outerRadius = Math.max(w, h) * p * 1.5;
      const innerRadius = outerRadius * 0.4;
      const cx = w / 2;
      const cy = h / 2;
      
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;

      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.clip();
      
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'kaleidoscope',
    name: 'Kaleidoscope',
    category: 'creative',
    description: 'Mirrors and rotates the images dynamically to transition between shots.',
    defaultDurationSec: 1.1,
    ffmpegTransitionName: 'radial',
    iconName: 'Compass',
    thumbnailUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      opacity: layer === 'from' ? 1 - p : p,
      transform: `rotate(${p * 90}deg) scale(${1 - p * 0.1})`,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.globalAlpha = 1 - p;
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.globalAlpha = p;
      ctx.translate(w / 2, h / 2);
      ctx.rotate(p * Math.PI * 0.5);
      ctx.drawImage(toImg, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
  },
  {
    id: 'elastic-wobble',
    name: 'Elastic Wobble',
    category: 'creative',
    description: 'Bounces the frame back and forth elastically as it transitions.',
    defaultDurationSec: 0.9,
    ffmpegTransitionName: 'wobble',
    iconName: 'Activity',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550859492-d5da97c445c5?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const amp = Math.sin(p * Math.PI * 3.5) * (1 - p) * 15;
      return {
        ...createBaseStyles(p, layer),
        transform: `translateY(${amp}px)`,
        opacity: layer === 'from' ? 1 - p : p,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      const amp = Math.sin(p * Math.PI * 3.5) * (1 - p) * 20;
      ctx.globalAlpha = 1 - p;
      ctx.drawImage(fromImg, 0, amp, w, h);
      ctx.globalAlpha = p;
      ctx.drawImage(toImg, 0, -amp, w, h);
      ctx.restore();
    }
  },
  {
    id: 'ripple-wave',
    name: 'Ripple Wave',
    category: 'creative',
    description: 'Distorts the image like water ripples spreading outward.',
    defaultDurationSec: 1.0,
    ffmpegTransitionName: 'waterdrop',
    iconName: 'Waves',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => ({
      ...createBaseStyles(p, layer),
      opacity: layer === 'from' ? 1 - p : p,
      transform: `scale(${1.0 + Math.sin(p * Math.PI) * 0.05})`,
    }),
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.globalAlpha = 1 - p;
      ctx.drawImage(fromImg, 0, 0, w, h);
      
      ctx.globalAlpha = p;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.max(w, h) * p, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'diamond-wipe',
    name: 'Diamond Wipe',
    category: 'creative',
    description: 'Reveals the new scene from a growing diamond shape in the center.',
    defaultDurationSec: 0.9,
    ffmpegTransitionName: 'rectcrop',
    iconName: 'Gem',
    thumbnailUrl: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=150&auto=format&fit=crop&q=60',
    getCssStyle: (p, layer) => {
      const pct = p * 100;
      return {
        ...createBaseStyles(p, layer),
        clipPath: layer === 'from' ? 'none' : `polygon(50% ${50 - pct}%, ${50 + pct}% 50%, 50% ${50 + pct}%, ${50 - pct}% 50%)`,
      };
    },
    previewRenderer: (ctx, fromImg, toImg, p, w, h) => {
      ctx.save();
      ctx.drawImage(fromImg, 0, 0, w, h);
      ctx.beginPath();
      
      const hw = (w * p) / 2;
      const hh = (h * p) / 2;
      const cx = w / 2;
      const cy = h / 2;
      
      ctx.moveTo(cx, cy - hh);
      ctx.lineTo(cx + hw, cy);
      ctx.lineTo(cx, cy + hh);
      ctx.lineTo(cx - hw, cy);
      ctx.closePath();
      
      ctx.clip();
      ctx.drawImage(toImg, 0, 0, w, h);
      ctx.restore();
    }
  }
];
