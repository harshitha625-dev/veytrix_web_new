import { Sun } from 'lucide-react';
import { EffectModule } from '../types';

export const softLight: EffectModule = {
  id: 'pro-soft-light',
  name: 'Soft Light',
  category: 'light',
  icon: Sun,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Diffused soft light bloom for a dreamy look.',
  defaultParameters: {"intensity":1.15,"speed":0,"duration":5,"opacity":0.35,"blendMode":"screen","enabled":true},
  adjustableParameters: [{"name":"Brightness","key":"intensity","type":"number","min":1,"max":1.5,"step":0.02},{"name":"Pulse","key":"speed","type":"number","min":0,"max":2,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":0.7,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["screen","normal","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const pulse = params.speed > 0 ? 0.9 + 0.1 * Math.sin(time * params.speed) : 1;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.globalAlpha = params.opacity * pulse;
    ctx.filter = `blur(15px) brightness(${params.intensity})`;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`gblur=sigma=3,eq=brightness=0.06:contrast=1.02`];
  }
};
