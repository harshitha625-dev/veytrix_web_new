import { Expand } from 'lucide-react';
import { EffectModule } from '../types';

export const stretch: EffectModule = {
  id: 'pro-stretch',
  name: 'Stretch',
  category: 'distortion',
  icon: Expand,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Wide anamorphic stretch lens effect.',
  defaultParameters: {"intensity":1.3,"speed":1,"duration":4,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Stretch Width","key":"intensity","type":"number","min":1,"max":2,"step":0.05},{"name":"Pulse Speed","key":"speed","type":"number","min":0,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const pulse = params.speed > 0 ? 1 + (params.intensity - 1) * (0.5 + 0.5 * Math.sin(time * params.speed * 2)) : params.intensity;
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(pulse, 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`scale=iw*${params.intensity}:ih,crop=iw/${params.intensity}:ih`];
  }
};
