import { 
  Sun, Moon, Sunrise as Rise, Sparkles, Wand2, Star, Eye, Flame, Layers
} from 'lucide-react';
import { EffectModule } from '../types';

const makeDefaultParams = (intensity: number, speed: number) => ({
  intensity,
  speed,
  duration: 4,
  opacity: 0.6,
  blendMode: 'screen',
  enabled: true
});

const makeAdjustableParams = (name: string, min = 0.1, max = 2, step = 0.05) => [
  { name, key: 'intensity', type: 'number' as const, min, max, step },
  { name: 'Pulse Speed', key: 'speed', type: 'number' as const, min: 0, max: 4, step: 0.1 },
  { name: 'Duration', key: 'duration', type: 'number' as const, min: 0.5, max: 10, step: 0.5 },
  { name: 'Opacity', key: 'opacity', type: 'number' as const, min: 0, max: 1, step: 0.05 },
  { name: 'Blend Mode', key: 'blendMode', type: 'select' as const, options: ['screen', 'color-dodge', 'overlay', 'normal'] }
];

export const goldenHour: EffectModule = {
  id: 'pro-golden-hour',
  name: 'Golden Hour',
  category: 'light',
  icon: Sun,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Warm volumetric golden sunrays overlay.',
  defaultParameters: makeDefaultParams(0.5, 0.8),
  adjustableParameters: makeAdjustableParams('Warmth', 0.1, 1.2, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    const pulse = 0.85 + 0.15 * Math.sin(time * params.speed);
    const grad = ctx.createRadialGradient(0, 0, canvas.width * 0.1, 0, 0, canvas.width * 0.9);
    grad.addColorStop(0, `rgba(255,180,60,${params.intensity * pulse})`);
    grad.addColorStop(0.5, `rgba(255,120,40,${params.intensity * 0.4 * pulse})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=rs=0.15:gs=0.08:bs=-0.1`]
};

export const sunsetGlow: EffectModule = {
  id: 'pro-sunset-glow',
  name: 'Sunset Glow',
  category: 'light',
  icon: Sun,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Intense crimson orange sky glow gradient.',
  defaultParameters: makeDefaultParams(0.6, 0.6),
  adjustableParameters: makeAdjustableParams('Glow Depth', 0.1, 1.3, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, `rgba(255,40,80,${params.intensity * 0.9})`);
    grad.addColorStop(0.5, `rgba(255,120,40,${params.intensity * 0.45})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=rs=0.25:gs=0.05:bs=-0.15`]
};

export const moonlight: EffectModule = {
  id: 'pro-moonlight',
  name: 'Moonlight',
  category: 'light',
  icon: Moon,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Cool blue moonlight overlay with soft shadows.',
  defaultParameters: makeDefaultParams(0.4, 0.3),
  adjustableParameters: makeAdjustableParams('Coolness', 0.1, 1.2, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    const grad = ctx.createRadialGradient(canvas.width, 0, canvas.width*0.2, canvas.width, 0, canvas.width * 1.1);
    grad.addColorStop(0, `rgba(200,230,255,${params.intensity})`);
    grad.addColorStop(0.6, `rgba(50,80,200,${params.intensity * 0.3})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=rs=-0.15:gs=-0.05:bs=0.2`]
};

export const sunrise: EffectModule = {
  id: 'pro-sunrise-glow',
  name: 'Sunrise',
  category: 'light',
  icon: Rise,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Soft pink/orange dawn transition lighting.',
  defaultParameters: makeDefaultParams(0.4, 0.5),
  adjustableParameters: makeAdjustableParams('Sun Strength', 0.1, 1, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
    grad.addColorStop(0, `rgba(255,160,50,${params.intensity * 0.9})`);
    grad.addColorStop(0.5, `rgba(255,80,150,${params.intensity * 0.4})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=rs=0.15:gs=0.05:bs=-0.05`]
};

export const neonPink: EffectModule = {
  id: 'pro-neon-pink',
  name: 'Neon Pink',
  category: 'light',
  icon: Star,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Vibrant hot pink light leak vignette.',
  defaultParameters: makeDefaultParams(0.5, 1.2),
  adjustableParameters: makeAdjustableParams('Glow Bloom', 0.1, 1.5, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    const pulse = 0.8 + 0.2 * Math.sin(time * params.speed * 2);
    const grad = ctx.createRadialGradient(0, canvas.height/2, 0, 0, canvas.height/2, canvas.width * 0.5);
    grad.addColorStop(0, `rgba(255,0,150,${params.intensity * pulse})`);
    grad.addColorStop(1, 'rgba(255,0,150,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=rs=0.2:bs=0.2`]
};

export const neonBlue: EffectModule = {
  id: 'pro-neon-blue',
  name: 'Neon Blue',
  category: 'light',
  icon: Star,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Electric cyanish-blue glow filter.',
  defaultParameters: makeDefaultParams(0.5, 1.2),
  adjustableParameters: makeAdjustableParams('Glow Bloom', 0.1, 1.5, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    const pulse = 0.8 + 0.2 * Math.sin(time * params.speed * 2 + 1);
    const grad = ctx.createRadialGradient(canvas.width, canvas.height/2, 0, canvas.width, canvas.height/2, canvas.width * 0.5);
    grad.addColorStop(0, `rgba(0,180,255,${params.intensity * pulse})`);
    grad.addColorStop(1, 'rgba(0,180,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=bs=0.25:gs=0.1`]
};

export const neonPurple: EffectModule = {
  id: 'pro-neon-purple',
  name: 'Neon Purple',
  category: 'light',
  icon: Star,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Cyberpunk purple light wash overlay.',
  defaultParameters: makeDefaultParams(0.5, 1.2),
  adjustableParameters: makeAdjustableParams('Glow Bloom', 0.1, 1.5, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    const pulse = 0.8 + 0.2 * Math.sin(time * params.speed * 2.2);
    const grad = ctx.createRadialGradient(canvas.width/2, 0, 0, canvas.width/2, 0, canvas.width * 0.45);
    grad.addColorStop(0, `rgba(168,85,247,${params.intensity * pulse})`);
    grad.addColorStop(1, 'rgba(168,85,247,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=rs=0.15:bs=0.2`]
};

export const electricGlow: EffectModule = {
  id: 'pro-electric-glow',
  name: 'Electric Glow',
  category: 'light',
  icon: Sparkles,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'High-voltage electric flickering sparks.',
  defaultParameters: makeDefaultParams(0.4, 2.5),
  adjustableParameters: makeAdjustableParams('Flicker', 0.1, 1.3, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const trigger = Math.sin(time * params.speed * 18) > 0.65;
    if (trigger) {
      ctx.globalCompositeOperation = params.blendMode as any;
      ctx.globalAlpha = params.opacity * params.intensity;
      ctx.filter = 'brightness(1.4) saturate(1.5)';
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`eq=brightness=0.05`]
};

export const fireGlow: EffectModule = {
  id: 'pro-fire-glow',
  name: 'Fire Glow',
  category: 'light',
  icon: Flame,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Pulsing hot orange flame glow overlay.',
  defaultParameters: makeDefaultParams(0.5, 2),
  adjustableParameters: makeAdjustableParams('Flame Radiance', 0.1, 1.2, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    const pulse = 0.8 + 0.2 * Math.sin(time * params.speed * 3);
    const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height*0.3);
    grad.addColorStop(0, `rgba(255,80,0,${params.intensity * pulse})`);
    grad.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=rs=0.25:gs=0.05`]
};

export const iceGlow: EffectModule = {
  id: 'pro-ice-glow',
  name: 'Ice Glow',
  category: 'light',
  icon: Moon,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Cool frosty blue frosted glass glow.',
  defaultParameters: makeDefaultParams(0.4, 0.5),
  adjustableParameters: makeAdjustableParams('Frostiness', 0.1, 1.1, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, `rgba(0,180,255,${params.intensity})`);
    grad.addColorStop(1, `rgba(150,230,255,${params.intensity * 0.1})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=bs=0.2:rs=-0.1`]
};

export const rainbowGlow: EffectModule = {
  id: 'pro-rainbow-glow',
  name: 'Rainbow Glow',
  category: 'light',
  icon: Sparkles,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Prismatic color glow sweeping dynamically.',
  defaultParameters: makeDefaultParams(0.35, 1.2),
  adjustableParameters: makeAdjustableParams('Glow Range', 0.1, 0.9, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    const hue = (time * params.speed * 45) % 360;
    ctx.fillStyle = `hsla(${hue}, 90%, 60%, ${params.intensity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`hue=h=t*${params.speed*15}`]
};

export const magicSpark: EffectModule = {
  id: 'pro-magic-spark',
  name: 'Magic Spark',
  category: 'light',
  icon: Wand2,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Magical sparkles overlays flickering around screen.',
  defaultParameters: makeDefaultParams(6, 1.8),
  adjustableParameters: makeAdjustableParams('Spark Counts', 2, 18, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    ctx.fillStyle = '#ffffff';
    const count = Math.round(params.intensity);
    for (let i = 0; i < count; i++) {
      const rx = Math.random() * canvas.width;
      const ry = Math.random() * canvas.height;
      const size = Math.random() * 4 + 2;
      ctx.fillRect(rx, ry, size, size);
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`eq=brightness=0.03`]
};

export const glitter: EffectModule = {
  id: 'pro-glitter',
  name: 'Glitter',
  category: 'light',
  icon: Sparkles,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Dynamic golden glitter dust flakes.',
  defaultParameters: makeDefaultParams(10, 2),
  adjustableParameters: makeAdjustableParams('Glitter Amount', 3, 25, 1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    ctx.fillStyle = '#ffe070';
    const count = Math.round(params.intensity);
    for (let i = 0; i < count; i++) {
      const rx = Math.random() * canvas.width;
      const ry = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.arc(rx, ry, Math.random()*2.5 + 0.5, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`eq=brightness=0.02`]
};

export const starShine: EffectModule = {
  id: 'pro-star-shine',
  name: 'Star Shine',
  category: 'light',
  icon: Star,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Twinkling 4-point light flares on highlights.',
  defaultParameters: makeDefaultParams(4, 1.2),
  adjustableParameters: makeAdjustableParams('Star Size', 1, 10, 0.5),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    const px = canvas.width * 0.4;
    const py = canvas.height * 0.35;
    const len = params.intensity * 8;
    const pulse = 0.8 + 0.2 * Math.sin(time * params.speed * 4);
    ctx.beginPath();
    ctx.moveTo(px - len * pulse, py); ctx.lineTo(px + len * pulse, py);
    ctx.moveTo(px, py - len * pulse); ctx.lineTo(px, py + len * pulse);
    ctx.stroke();
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`eq=brightness=0.03`]
};

export const softBloom: EffectModule = {
  id: 'pro-soft-bloom',
  name: 'Soft Bloom',
  category: 'light',
  icon: Layers,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Dreamy highlights halo glow.',
  defaultParameters: makeDefaultParams(1.15, 0),
  adjustableParameters: makeAdjustableParams('Bloom Width', 1, 1.5, 0.02),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    ctx.filter = `blur(10px) brightness(${params.intensity})`;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`gblur=sigma=2,eq=brightness=0.05`]
};

export const hardBloom: EffectModule = {
  id: 'pro-hard-bloom',
  name: 'Hard Bloom',
  category: 'light',
  icon: Layers,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Intense overexposed highlights bloom.',
  defaultParameters: makeDefaultParams(1.3, 0),
  adjustableParameters: makeAdjustableParams('Overexpose', 1, 1.8, 0.02),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    ctx.filter = `blur(6px) brightness(${params.intensity}) contrast(1.1)`;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`gblur=sigma=1.2,eq=brightness=0.08:contrast=1.1`]
};

export const studioLight: EffectModule = {
  id: 'pro-studio-light',
  name: 'Studio Light',
  category: 'light',
  icon: Sun,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Professional key-light fill simulation.',
  defaultParameters: makeDefaultParams(0.3, 0),
  adjustableParameters: makeAdjustableParams('Key Fill', 0.1, 0.8, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, `rgba(255,255,255,${params.intensity})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`eq=brightness=0.06`]
};

export const stageLight: EffectModule = {
  id: 'pro-stage-light',
  name: 'Stage Light',
  category: 'light',
  icon: Eye,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Dramatic spotlight beam pointing down.',
  defaultParameters: makeDefaultParams(0.35, 1),
  adjustableParameters: makeAdjustableParams('Beam Angle', 0.1, 0.6, 0.02),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    const cx = canvas.width / 2 + Math.sin(time * params.speed) * canvas.width * 0.25;
    const grad = ctx.createRadialGradient(cx, 0, 0, cx, 0, canvas.height);
    grad.addColorStop(0, `rgba(255,255,230,${params.intensity})`);
    grad.addColorStop(0.3, `rgba(255,255,230,${params.intensity * 0.3})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`vignette=PI/3`]
};

export const clubLight: EffectModule = {
  id: 'pro-club-light',
  name: 'Club Light',
  category: 'light',
  icon: Sparkles,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Color-cycling party strobe laser.',
  defaultParameters: makeDefaultParams(0.5, 2),
  adjustableParameters: makeAdjustableParams('Strobe speed', 0.5, 4, 0.1),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    const step = Math.floor(time * params.speed * 4) % 3;
    ctx.fillStyle = step === 0 ? 'rgba(255,0,100,0.2)' : step === 1 ? 'rgba(0,180,255,0.2)' : 'rgba(168,85,247,0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`hue=h=t*${params.speed*30}`]
};

export const auroraLights: EffectModule = {
  id: 'pro-aurora-lights',
  name: 'Aurora Lights',
  category: 'light',
  icon: Layers,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Volumetric color aurora curtains.',
  defaultParameters: makeDefaultParams(0.4, 0.8),
  adjustableParameters: makeAdjustableParams('Brightness', 0.1, 0.9, 0.05),
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode as any;
    ctx.globalAlpha = params.opacity;
    const wave = Math.sin(time * params.speed) * canvas.height * 0.1;
    const grad = ctx.createLinearGradient(0, canvas.height * 0.1 + wave, 0, canvas.height * 0.6 + wave);
    grad.addColorStop(0, 'rgba(0,255,128,0)');
    grad.addColorStop(0.5, `rgba(0,255,128,${params.intensity})`);
    grad.addColorStop(1, 'rgba(0,255,128,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => [`colorbalance=gs=0.2:bs=0.1`]
};
