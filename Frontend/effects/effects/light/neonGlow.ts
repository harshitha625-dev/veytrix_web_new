import { Zap } from 'lucide-react';
import { EffectModule } from '../types';

export const neonGlow: EffectModule = {
  id: 'pro-neon-glow',
  name: 'Neon Glow',
  category: 'light',
  icon: Zap,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Electric neon edge glow with color cycling.',
  defaultParameters: {"intensity":0.5,"speed":1.5,"duration":4,"opacity":0.6,"blendMode":"screen","enabled":true},
  adjustableParameters: [{"name":"Glow Strength","key":"intensity","type":"number","min":0.1,"max":1,"step":0.05},{"name":"Color Speed","key":"speed","type":"number","min":0.3,"max":5,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["screen","normal","multiply","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const hue = (time * params.speed * 60) % 360;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.globalAlpha = params.opacity * params.intensity;
    ctx.filter = `blur(8px) brightness(1.5) saturate(2)`;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.globalAlpha = params.intensity * 0.3;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`gblur=sigma=3,eq=brightness=0.1:saturation=2,colorbalance=rs=0.2:gs=-0.1:bs=0.3`];
  }
};
