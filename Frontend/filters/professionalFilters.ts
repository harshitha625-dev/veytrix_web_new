import { Palette, Sun, Moon, Tv, Zap, Camera, Film, Compass, Eye, Sliders, Wind, Play, Sparkles, Clapperboard } from 'lucide-react';
import { EffectModule } from '../effects/effects/types';

// Helper function to calculate identical CSS filters and parameters
export function getFilterConfig(categorySlug: string, index: number, intensity: number) {
  const i = index;
  let css = 'none';
  let ffmpeg: string[] = [];

  switch (categorySlug) {
    case 'basic': {
      const contrast = (1 + i * 0.03 * intensity).toFixed(3);
      const saturate = (1 + (i - 7) * 0.05 * intensity).toFixed(3);
      const brightness = (1 + (i - 7) * 0.015 * intensity).toFixed(3);
      const brightnessFfmpeg = ((i - 7) * 0.015 * intensity).toFixed(3);
      css = `contrast(${contrast}) saturate(${saturate}) brightness(${brightness})`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate}:brightness=${brightnessFfmpeg}`];
      break;
    }
    case 'cinematic': {
      const contrast = (1.1 + i * 0.03 * intensity).toFixed(3);
      const saturate = (1.0 + i * 0.02 * intensity).toFixed(3);
      const sepia = (0.04 * i * intensity).toFixed(3);
      const hue = (-i * 1.5 * intensity).toFixed(1);
      css = `contrast(${contrast}) saturate(${saturate}) sepia(${sepia}) hue-rotate(${hue}deg)`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate},colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131,hue=h=${hue}`];
      break;
    }
    case 'vintage': {
      const sepia = (0.1 + i * 0.05 * intensity).toFixed(3);
      const contrast = (1 - i * 0.02 * intensity).toFixed(3);
      const saturate = (1 - i * 0.03 * intensity).toFixed(3);
      const brightness = (1.0 + i * 0.01 * intensity).toFixed(3);
      const brightnessFfmpeg = (i * 0.01 * intensity).toFixed(3);
      css = `sepia(${sepia}) contrast(${contrast}) saturate(${saturate}) brightness(${brightness})`;
      ffmpeg = [`colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131,eq=contrast=${contrast}:saturation=${saturate}:brightness=${brightnessFfmpeg}`];
      break;
    }
    case 'retro': {
      const sepia = (0.05 * i * intensity).toFixed(3);
      const contrast = (1.0 + (i - 7) * 0.03 * intensity).toFixed(3);
      const saturate = (0.9 + i * 0.02 * intensity).toFixed(3);
      css = `sepia(${sepia}) contrast(${contrast}) saturate(${saturate})`;
      ffmpeg = [`colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131,eq=contrast=${contrast}:saturation=${saturate}`];
      break;
    }
    case 'film': {
      const contrast = (1.05 + i * 0.02 * intensity).toFixed(3);
      const saturate = (1.0 + (i - 7) * 0.04 * intensity).toFixed(3);
      const hue = ((i - 7) * 1.2 * intensity).toFixed(1);
      css = `contrast(${contrast}) saturate(${saturate}) hue-rotate(${hue}deg)`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate},hue=h=${hue}`];
      break;
    }
    case 'hdr': {
      const contrast = (1.2 + i * 0.04 * intensity).toFixed(3);
      const saturate = (1.1 + i * 0.03 * intensity).toFixed(3);
      const brightness = (1.02 + i * 0.01 * intensity).toFixed(3);
      const brightnessFfmpeg = (0.02 + i * 0.01 * intensity).toFixed(3);
      css = `contrast(${contrast}) saturate(${saturate}) brightness(${brightness})`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate}:brightness=${brightnessFfmpeg},unsharp=5:5:0.8:5:5:0.0`];
      break;
    }
    case 'lut': {
      const contrast = (1.08 + i * 0.02 * intensity).toFixed(3);
      const saturate = (0.95 + (i - 7) * 0.05 * intensity).toFixed(3);
      const hue = ((i - 7) * 1.5 * intensity).toFixed(1);
      css = `contrast(${contrast}) saturate(${saturate}) hue-rotate(${hue}deg)`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate},hue=h=${hue}`];
      break;
    }
    case 'black-white': {
      const contrast = (1.0 + i * 0.05 * intensity).toFixed(3);
      const brightness = (0.96 + i * 0.01 * intensity).toFixed(3);
      const brightnessFfmpeg = (-0.04 + i * 0.01 * intensity).toFixed(3);
      css = `grayscale(1) contrast(${contrast}) brightness(${brightness})`;
      ffmpeg = [`hue=s=0,eq=contrast=${contrast}:brightness=${brightnessFfmpeg}`];
      break;
    }
    case 'sepia': {
      const sepia = (0.4 + i * 0.04 * intensity).toFixed(3);
      const contrast = (0.9 + i * 0.02 * intensity).toFixed(3);
      const saturate = (0.85 + i * 0.015 * intensity).toFixed(3);
      css = `sepia(${sepia}) contrast(${contrast}) saturate(${saturate})`;
      ffmpeg = [`colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131,eq=contrast=${contrast}:saturation=${saturate}`];
      break;
    }
    case 'neon': {
      const saturate = (1.35 + i * 0.06 * intensity).toFixed(3);
      const brightness = (1.04 + i * 0.015 * intensity).toFixed(3);
      const brightnessFfmpeg = (0.04 + i * 0.015 * intensity).toFixed(3);
      const hue = ((i - 7) * 3 * intensity).toFixed(1);
      css = `saturate(${saturate}) brightness(${brightness}) hue-rotate(${hue}deg)`;
      ffmpeg = [`eq=saturation=${saturate}:brightness=${brightnessFfmpeg},hue=h=${hue}`];
      break;
    }
    case 'cyberpunk': {
      const hue = (-20 + i * 2.5 * intensity).toFixed(1);
      const saturate = (1.15 + i * 0.04 * intensity).toFixed(3);
      const contrast = (1.08 + i * 0.02 * intensity).toFixed(3);
      css = `hue-rotate(${hue}deg) saturate(${saturate}) contrast(${contrast})`;
      ffmpeg = [`hue=h=${hue},eq=saturation=${saturate}:contrast=${contrast}`];
      break;
    }
    case 'dream': {
      const brightness = (1.06 + i * 0.015 * intensity).toFixed(3);
      const brightnessFfmpeg = (0.06 + i * 0.015 * intensity).toFixed(3);
      const contrast = (0.96 - i * 0.015 * intensity).toFixed(3);
      const saturate = (1.0 + i * 0.02 * intensity).toFixed(3);
      css = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`;
      ffmpeg = [`eq=brightness=${brightnessFfmpeg}:contrast=${contrast}:saturation=${saturate}`];
      break;
    }
    case 'glow': {
      const brightness = (1.03 + i * 0.015 * intensity).toFixed(3);
      const brightnessFfmpeg = (0.03 + i * 0.015 * intensity).toFixed(3);
      const saturate = (1.1 + i * 0.025 * intensity).toFixed(3);
      const contrast = (1.04 + i * 0.015 * intensity).toFixed(3);
      css = `brightness(${brightness}) saturate(${saturate}) contrast(${contrast})`;
      ffmpeg = [`eq=brightness=${brightnessFfmpeg}:saturation=${saturate}:contrast=${contrast}`];
      break;
    }
    case 'matte': {
      const contrast = (0.88 - i * 0.015 * intensity).toFixed(3);
      const saturate = (0.78 + i * 0.015 * intensity).toFixed(3);
      const brightness = (1.01 + i * 0.008 * intensity).toFixed(3);
      const brightnessFfmpeg = (0.01 + i * 0.008 * intensity).toFixed(3);
      css = `contrast(${contrast}) saturate(${saturate}) brightness(${brightness})`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate}:brightness=${brightnessFfmpeg}`];
      break;
    }
    case 'moody': {
      const brightness = (0.96 - i * 0.015 * intensity).toFixed(3);
      const brightnessFfmpeg = (-0.04 - i * 0.015 * intensity).toFixed(3);
      const contrast = (1.08 + i * 0.035 * intensity).toFixed(3);
      const saturate = (0.92 - i * 0.025 * intensity).toFixed(3);
      css = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`;
      ffmpeg = [`eq=brightness=${brightnessFfmpeg}:contrast=${contrast}:saturation=${saturate}`];
      break;
    }
    case 'warm': {
      const sepia = (0.12 + i * 0.03 * intensity).toFixed(3);
      const saturate = (1.06 + i * 0.025 * intensity).toFixed(3);
      const hue = (-i * 1.2 * intensity).toFixed(1);
      css = `sepia(${sepia}) saturate(${saturate}) hue-rotate(${hue}deg)`;
      ffmpeg = [`colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131,eq=saturation=${saturate},hue=h=${hue}`];
      break;
    }
    case 'cool': {
      const saturate = (1.03 + i * 0.018 * intensity).toFixed(3);
      const hue = (8 + i * 2.2 * intensity).toFixed(1);
      const brightness = (0.99 - i * 0.008 * intensity).toFixed(3);
      const brightnessFfmpeg = (-0.01 - i * 0.008 * intensity).toFixed(3);
      css = `saturate(${saturate}) hue-rotate(${hue}deg) brightness(${brightness})`;
      ffmpeg = [`eq=saturation=${saturate}:brightness=${brightnessFfmpeg},hue=h=${hue}`];
      break;
    }
    case 'teal-orange': {
      const contrast = (1.12 + i * 0.03 * intensity).toFixed(3);
      const saturate = (1.08 + i * 0.025 * intensity).toFixed(3);
      const hue = (-5 - i * 0.8 * intensity).toFixed(1);
      css = `contrast(${contrast}) saturate(${saturate}) hue-rotate(${hue}deg)`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate},hue=h=${hue}`];
      break;
    }
    case 'golden-hour': {
      const sepia = (0.1 + i * 0.025 * intensity).toFixed(3);
      const saturate = (1.12 + i * 0.03 * intensity).toFixed(3);
      const brightness = (1.02 + i * 0.008 * intensity).toFixed(3);
      const brightnessFfmpeg = (0.02 + i * 0.008 * intensity).toFixed(3);
      css = `sepia(${sepia}) saturate(${saturate}) brightness(${brightness})`;
      ffmpeg = [`colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131,eq=saturation=${saturate}:brightness=${brightnessFfmpeg}`];
      break;
    }
    case 'sunset': {
      const sepia = (0.18 + i * 0.03 * intensity).toFixed(3);
      const saturate = (1.16 + i * 0.04 * intensity).toFixed(3);
      const hue = (-6 - i * 1.5 * intensity).toFixed(1);
      css = `sepia(${sepia}) saturate(${saturate}) hue-rotate(${hue}deg)`;
      ffmpeg = [`colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131,eq=saturation=${saturate},hue=h=${hue}`];
      break;
    }
    case 'night': {
      const brightness = (0.78 - i * 0.025 * intensity).toFixed(3);
      const brightnessFfmpeg = (-0.22 - i * 0.025 * intensity).toFixed(3);
      const contrast = (0.96 + i * 0.015 * intensity).toFixed(3);
      const hue = (12 + i * 2.5 * intensity).toFixed(1);
      const saturate = (0.72 + i * 0.015 * intensity).toFixed(3);
      css = `brightness(${brightness}) contrast(${contrast}) hue-rotate(${hue}deg) saturate(${saturate})`;
      ffmpeg = [`eq=brightness=${brightnessFfmpeg}:contrast=${contrast}:saturation=${saturate},hue=h=${hue}`];
      break;
    }
    case 'rgb': {
      const contrast = (1.06 + i * 0.015 * intensity).toFixed(3);
      const saturate = (1.12 + i * 0.025 * intensity).toFixed(3);
      css = `contrast(${contrast}) saturate(${saturate})`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate},colorbalance=rs=${(i * 0.01 * intensity).toFixed(3)}:bs=${(-i * 0.01 * intensity).toFixed(3)}`];
      break;
    }
    case 'vhs': {
      const contrast = (1.04 + i * 0.015 * intensity).toFixed(3);
      const saturate = (1.08 + i * 0.025 * intensity).toFixed(3);
      const sepia = (0.04 * intensity).toFixed(3);
      css = `contrast(${contrast}) saturate(${saturate}) sepia(${sepia})`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate},colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131`];
      break;
    }
    case 'crt': {
      const contrast = (1.04 + i * 0.015 * intensity).toFixed(3);
      const saturate = (0.96 + i * 0.015 * intensity).toFixed(3);
      css = `contrast(${contrast}) saturate(${saturate})`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate},drawgrid=width=iw:height=4:thickness=1:color=black@0.08`];
      break;
    }
    case 'glitch': {
      const contrast = (1.08 + i * 0.025 * intensity).toFixed(3);
      const saturate = (1.15 + i * 0.03 * intensity).toFixed(3);
      css = `contrast(${contrast}) saturate(${saturate})`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate},noise=alls=${Math.round(5 + i * intensity)}:allf=t+u`];
      break;
    }
    case 'grain': {
      const contrast = (1.03 + i * 0.015 * intensity).toFixed(3);
      const brightness = (1.01 + i * 0.008 * intensity).toFixed(3);
      const brightnessFfmpeg = (0.01 + i * 0.008 * intensity).toFixed(3);
      css = `contrast(${contrast}) brightness(${brightness})`;
      ffmpeg = [`eq=contrast=${contrast}:brightness=${brightnessFfmpeg},noise=alls=${Math.round(4 + i * intensity)}:allf=t+u`];
      break;
    }
    case 'blur': {
      const val = (i * 0.4 * intensity).toFixed(2);
      css = `blur(${val}px)`;
      ffmpeg = [`gblur=sigma=${val}`];
      break;
    }
    case 'sharpen': {
      const contrast = (1.1 + i * 0.03 * intensity).toFixed(3);
      const saturate = (1.01 + i * 0.015 * intensity).toFixed(3);
      css = `contrast(${contrast}) saturate(${saturate})`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate},unsharp=5:5:${(0.4 + i * 0.08 * intensity).toFixed(2)}:5:5:0.0`];
      break;
    }
    case 'portrait': {
      const brightness = (1.01 + i * 0.008 * intensity).toFixed(3);
      const brightnessFfmpeg = (0.01 + i * 0.008 * intensity).toFixed(3);
      const contrast = (0.99 - i * 0.008 * intensity).toFixed(3);
      const saturate = (1.04 + i * 0.015 * intensity).toFixed(3);
      css = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`;
      ffmpeg = [`eq=brightness=${brightnessFfmpeg}:contrast=${contrast}:saturation=${saturate}`];
      break;
    }
    case 'beauty': {
      const brightness = (1.04 + i * 0.015 * intensity).toFixed(3);
      const brightnessFfmpeg = (0.04 + i * 0.015 * intensity).toFixed(3);
      const contrast = (0.97 - i * 0.008 * intensity).toFixed(3);
      const saturate = (1.08 + i * 0.015 * intensity).toFixed(3);
      css = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`;
      ffmpeg = [`eq=brightness=${brightnessFfmpeg}:contrast=${contrast}:saturation=${saturate}`];
      break;
    }
    case 'landscape': {
      const contrast = (1.1 + i * 0.025 * intensity).toFixed(3);
      const saturate = (1.15 + i * 0.04 * intensity).toFixed(3);
      css = `contrast(${contrast}) saturate(${saturate})`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate}`];
      break;
    }
    case 'nature': {
      const contrast = (1.08 + i * 0.018 * intensity).toFixed(3);
      const saturate = (1.12 + i * 0.035 * intensity).toFixed(3);
      const hue = (i * 0.9 * intensity).toFixed(1);
      css = `contrast(${contrast}) saturate(${saturate}) hue-rotate(${hue}deg)`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate},hue=h=${hue}`];
      break;
    }
    case 'food': {
      const saturate = (1.2 + i * 0.05 * intensity).toFixed(3);
      const brightness = (1.03 + i * 0.008 * intensity).toFixed(3);
      const brightnessFfmpeg = (0.03 + i * 0.008 * intensity).toFixed(3);
      const contrast = (1.04 + i * 0.015 * intensity).toFixed(3);
      css = `saturate(${saturate}) brightness(${brightness}) contrast(${contrast})`;
      ffmpeg = [`eq=saturation=${saturate}:brightness=${brightnessFfmpeg}:contrast=${contrast}`];
      break;
    }
    case 'travel': {
      const contrast = (1.08 + i * 0.025 * intensity).toFixed(3);
      const saturate = (1.1 + i * 0.03 * intensity).toFixed(3);
      const hue = (-i * 0.6 * intensity).toFixed(1);
      css = `contrast(${contrast}) saturate(${saturate}) hue-rotate(${hue}deg)`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate},hue=h=${hue}`];
      break;
    }
    case 'wedding': {
      const brightness = (1.04 + i * 0.01 * intensity).toFixed(3);
      const brightnessFfmpeg = (0.04 + i * 0.01 * intensity).toFixed(3);
      const contrast = (0.95 - i * 0.008 * intensity).toFixed(3);
      const saturate = (1.01 + i * 0.008 * intensity).toFixed(3);
      const sepia = (0.015 * i * intensity).toFixed(3);
      css = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate}) sepia(${sepia})`;
      ffmpeg = [`eq=brightness=${brightnessFfmpeg}:contrast=${contrast}:saturation=${saturate},colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131`];
      break;
    }
    case 'fashion': {
      const contrast = (1.2 + i * 0.04 * intensity).toFixed(3);
      const saturate = (1.04 + i * 0.025 * intensity).toFixed(3);
      const brightness = (1.01 + i * 0.008 * intensity).toFixed(3);
      const brightnessFfmpeg = (0.01 + i * 0.008 * intensity).toFixed(3);
      css = `contrast(${contrast}) saturate(${saturate}) brightness(${brightness})`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate}:brightness=${brightnessFfmpeg}`];
      break;
    }
    case 'sports': {
      const contrast = (1.12 + i * 0.035 * intensity).toFixed(3);
      const saturate = (1.25 + i * 0.05 * intensity).toFixed(3);
      css = `contrast(${contrast}) saturate(${saturate})`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate}`];
      break;
    }
    case 'gaming': {
      const contrast = (1.2 + i * 0.035 * intensity).toFixed(3);
      const saturate = (1.3 + i * 0.04 * intensity).toFixed(3);
      const hue = (-8 + i * 1.5 * intensity).toFixed(1);
      css = `contrast(${contrast}) saturate(${saturate}) hue-rotate(${hue}deg)`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate},hue=h=${hue}`];
      break;
    }
    case 'social': {
      const brightness = (1.05 + i * 0.015 * intensity).toFixed(3);
      const brightnessFfmpeg = (0.05 + i * 0.015 * intensity).toFixed(3);
      const contrast = (0.97 - i * 0.012 * intensity).toFixed(3);
      const saturate = (1.1 + i * 0.025 * intensity).toFixed(3);
      css = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`;
      ffmpeg = [`eq=brightness=${brightnessFfmpeg}:contrast=${contrast}:saturation=${saturate}`];
      break;
    }
    case 'artistic': {
      const contrast = (1.12 + i * 0.04 * intensity).toFixed(3);
      const saturate = (1.2 + i * 0.04 * intensity).toFixed(3);
      const hue = (i * 4 * intensity).toFixed(1);
      css = `contrast(${contrast}) saturate(${saturate}) hue-rotate(${hue}deg)`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate},hue=h=${hue}`];
      break;
    }
    case '3d': {
      const contrast = (1.08 + i * 0.025 * intensity).toFixed(3);
      const saturate = (1.12 + i * 0.025 * intensity).toFixed(3);
      css = `contrast(${contrast}) saturate(${saturate})`;
      ffmpeg = [`eq=contrast=${contrast}:saturation=${saturate}`];
      break;
    }
  }

  return { css, ffmpeg };
}

// 41 Categories configuration list
const categoriesList = [
  { name: 'Basic', slug: 'basic', baseCat: 'cinematic', icon: Sliders },
  { name: 'Cinematic', slug: 'cinematic', baseCat: 'cinematic', icon: Clapperboard },
  { name: 'Vintage', slug: 'vintage', baseCat: 'retro', icon: Film },
  { name: 'Retro', slug: 'retro', baseCat: 'retro', icon: Tv },
  { name: 'Film', slug: 'film', baseCat: 'retro', icon: Film },
  { name: 'HDR', slug: 'hdr', baseCat: 'cinematic', icon: Clapperboard },
  { name: 'LUT', slug: 'lut', baseCat: 'cinematic', icon: Palette },
  { name: 'Black & White', slug: 'black-white', baseCat: 'cinematic', icon: Eye },
  { name: 'Sepia', slug: 'sepia', baseCat: 'retro', icon: Palette },
  { name: 'Neon', slug: 'neon', baseCat: 'light', icon: Zap },
  { name: 'Cyberpunk', slug: 'cyberpunk', baseCat: 'glitch', icon: Zap },
  { name: 'Dream', slug: 'dream', baseCat: 'light', icon: Sparkles },
  { name: 'Glow', slug: 'glow', baseCat: 'light', icon: Sparkles },
  { name: 'Matte', slug: 'matte', baseCat: 'retro', icon: Palette },
  { name: 'Moody', slug: 'moody', baseCat: 'cinematic', icon: Moon },
  { name: 'Warm', slug: 'warm', baseCat: 'light', icon: Sun },
  { name: 'Cool', slug: 'cool', baseCat: 'light', icon: Compass },
  { name: 'Teal & Orange', slug: 'teal-orange', baseCat: 'cinematic', icon: Palette },
  { name: 'Golden Hour', slug: 'golden-hour', baseCat: 'light', icon: Sun },
  { name: 'Sunset', slug: 'sunset', baseCat: 'light', icon: Sun },
  { name: 'Night', slug: 'night', baseCat: 'light', icon: Moon },
  { name: 'RGB', slug: 'rgb', baseCat: 'glitch', icon: Tv },
  { name: 'VHS', slug: 'vhs', baseCat: 'retro', icon: Tv },
  { name: 'CRT', slug: 'crt', baseCat: 'retro', icon: Tv },
  { name: 'Glitch', slug: 'glitch', baseCat: 'glitch', icon: Zap },
  { name: 'Grain', slug: 'grain', baseCat: 'retro', icon: Film },
  { name: 'Blur', slug: 'blur', baseCat: 'blur', icon: Eye },
  { name: 'Sharpen', slug: 'sharpen', baseCat: 'blur', icon: Eye },
  { name: 'Portrait', slug: 'portrait', baseCat: 'cinematic', icon: Camera },
  { name: 'Beauty', slug: 'beauty', baseCat: 'cinematic', icon: Sparkles },
  { name: 'Landscape', slug: 'landscape', baseCat: 'cinematic', icon: Compass },
  { name: 'Nature', slug: 'nature', baseCat: 'cinematic', icon: Compass },
  { name: 'Food', slug: 'food', baseCat: 'cinematic', icon: Palette },
  { name: 'Travel', slug: 'travel', baseCat: 'cinematic', icon: Camera },
  { name: 'Wedding', slug: 'wedding', baseCat: 'cinematic', icon: Sparkles },
  { name: 'Fashion', slug: 'fashion', baseCat: 'cinematic', icon: Camera },
  { name: 'Sports', slug: 'sports', baseCat: 'motion', icon: Wind },
  { name: 'Gaming', slug: 'gaming', baseCat: 'glitch', icon: Play },
  { name: 'Social', slug: 'social', baseCat: 'cinematic', icon: Tv },
  { name: 'Artistic', slug: 'artistic', baseCat: 'distortion', icon: Palette },
  { name: '3D', slug: '3d', baseCat: 'distortion', icon: Camera }
];

export const professionalFiltersList: EffectModule[] = [];

// Dynamically populate 533 professional filters (13 filters per category)
categoriesList.forEach((cat) => {
  for (let idx = 1; idx <= 13; idx++) {
    const id = `pro-filter-${cat.slug}-${idx}`;
    const name = `${cat.name} v${idx}`;
    const description = `[${cat.name}] Professional grading preset style ${idx} with real-time intensity adjustments.`;

    professionalFiltersList.push({
      id,
      name,
      category: cat.baseCat as any,
      icon: cat.icon,
      thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=150&auto=format&fit=crop&q=60',
      description,
      defaultParameters: { intensity: 0.5, enabled: true },
      adjustableParameters: [
        { name: 'Filter Intensity', key: 'intensity', type: 'number', min: 0, max: 1, step: 0.05 }
      ],
      previewRenderer: (ctx, video, params, time, canvas) => {
        ctx.save();
        const intensity = params.intensity ?? 0.5;
        const { css } = getFilterConfig(cat.slug, idx, intensity);
        if (css !== 'none') {
          ctx.filter = css;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      },
      ffmpegExportFilter: (params) => {
        const intensity = params.intensity ?? 0.5;
        const { ffmpeg } = getFilterConfig(cat.slug, idx, intensity);
        return ffmpeg;
      }
    });
  }
});
