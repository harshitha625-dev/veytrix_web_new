import { Circle } from 'lucide-react';
import { EffectModule } from '../types';

export const halo: EffectModule = {
  id: 'pro-halo',
  name: 'Halo',
  category: 'light',
  icon: Circle,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Luminous halo ring around the center.',
  defaultParameters: {"intensity":0.3,"speed":0.5,"duration":5,"opacity":0.5,"blendMode":"screen","enabled":true},
  adjustableParameters: [{"name":"Ring Size","key":"intensity","type":"number","min":0.1,"max":0.6,"step":0.02},{"name":"Pulse Speed","key":"speed","type":"number","min":0,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":0.8,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["screen","color-dodge","overlay","normal"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode;
    const pulse = params.speed > 0 ? 0.85 + 0.15 * Math.sin(time * params.speed * 2) : 1;
    ctx.globalAlpha = params.opacity * pulse;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const innerR = canvas.width * params.intensity * 0.6;
    const outerR = canvas.width * params.intensity;
    const grad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.5, 'rgba(255,240,220,0.6)');
    grad.addColorStop(1, 'rgba(255,200,150,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`vignette=PI/4:mode=backward,eq=brightness=0.04`];
  }
};
