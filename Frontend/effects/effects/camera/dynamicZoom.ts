import { Search } from 'lucide-react';
import { EffectModule } from '../types';

export const dynamicZoom: EffectModule = {
  id: 'pro-dynamic-zoom',
  name: 'Dynamic Zoom',
  category: 'camera',
  icon: Search,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Breathing zoom that smoothly oscillates between close and wide.',
  defaultParameters: {"intensity":1.25,"speed":1.5,"duration":4,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Zoom Range","key":"intensity","type":"number","min":1,"max":2,"step":0.05},{"name":"Speed","key":"speed","type":"number","min":0.3,"max":5,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":0.5,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const t = time * params.speed;
    const scale = 1 + (params.intensity - 1) * (0.5 + 0.5 * Math.sin(t * 2));
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`zoompan=z='1+${(params.intensity-1).toFixed(2)}*sin(on/25*${params.speed})':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=hd720`];
  }
};
