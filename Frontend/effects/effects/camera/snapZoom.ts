import { Crosshair } from 'lucide-react';
import { EffectModule } from '../types';

export const snapZoom: EffectModule = {
  id: 'pro-snap-zoom',
  name: 'Snap Zoom',
  category: 'camera',
  icon: Crosshair,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Quick snap zoom with sharp transition in/out.',
  defaultParameters: {"intensity":1.5,"speed":3,"duration":2,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Zoom Amount","key":"intensity","type":"number","min":1,"max":3,"step":0.1},{"name":"Snap Speed","key":"speed","type":"number","min":1,"max":8,"step":0.5},{"name":"Duration","key":"duration","type":"number","min":0.5,"max":5,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const cycle = (time * params.speed) % (Math.PI * 2);
    const raw = Math.pow(Math.abs(Math.sin(cycle)), 8);
    const scale = 1 + (params.intensity - 1) * raw;
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
    return [`zoompan=z='1+${(params.intensity-1).toFixed(2)}*abs(sin(on/10*${params.speed}))^8':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=hd720`];
  }
};
