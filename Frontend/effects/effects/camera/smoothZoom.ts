import { ZoomIn } from 'lucide-react';
import { EffectModule } from '../types';

export const smoothZoom: EffectModule = {
  id: 'pro-smooth-zoom',
  name: 'Smooth Zoom',
  category: 'camera',
  icon: ZoomIn,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Smooth cinematic zoom with adjustable speed.',
  defaultParameters: {"intensity":1.3,"speed":2,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Intensity","key":"intensity","type":"number","min":1,"max":2,"step":0.05},{"name":"Speed","key":"speed","type":"number","min":0.5,"max":5,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":0.5,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const scale = 1 + (params.intensity - 1) * Math.sin((time * params.speed) % Math.PI);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`scale=iw*${params.intensity}:ih*${params.intensity},crop=iw/${params.intensity}:ih/${params.intensity}`];
  }
};
