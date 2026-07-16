import { Sunrise } from 'lucide-react';
import { EffectModule } from '../types';

export const goldenGlow: EffectModule = {
  id: 'pro-golden-glow',
  name: 'Golden Glow',
  category: 'light',
  icon: Sunrise,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Warm golden hour glow with soft radiance.',
  defaultParameters: {"intensity":0.4,"speed":1,"duration":5,"opacity":0.5,"blendMode":"screen","enabled":true},
  adjustableParameters: [{"name":"Glow Warmth","key":"intensity","type":"number","min":0.1,"max":0.8,"step":0.05},{"name":"Pulse Speed","key":"speed","type":"number","min":0,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["screen","normal","multiply","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const pulse = params.speed > 0 ? 0.8 + 0.2 * Math.sin(time * params.speed) : 1;
    const grad = ctx.createRadialGradient(canvas.width*0.6, canvas.height*0.3, 0, canvas.width*0.6, canvas.height*0.3, canvas.width*0.8);
    grad.addColorStop(0, `rgba(255,200,50,${params.intensity * pulse})`);
    grad.addColorStop(0.5, `rgba(255,150,30,${params.intensity * 0.4 * pulse})`);
    grad.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.globalCompositeOperation = params.blendMode;
    ctx.globalAlpha = params.opacity;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`colorbalance=rs=${params.intensity}:gs=${params.intensity*0.5}:bs=0,eq=brightness=0.05`];
  }
};
