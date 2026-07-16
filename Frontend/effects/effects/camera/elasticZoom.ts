import { Magnet } from 'lucide-react';
import { EffectModule } from '../types';

export const elasticZoom: EffectModule = {
  id: 'pro-elastic-zoom',
  name: 'Elastic Zoom',
  category: 'camera',
  icon: Magnet,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Springy elastic zoom with overshoot and bounce-back.',
  defaultParameters: {"intensity":1.4,"speed":2,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Bounce","key":"intensity","type":"number","min":1,"max":2.5,"step":0.05},{"name":"Speed","key":"speed","type":"number","min":0.5,"max":6,"step":0.2},{"name":"Duration","key":"duration","type":"number","min":0.5,"max":8,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const t = (time * params.speed) % 4;
    const decay = Math.exp(-t * 1.5);
    const bounce = Math.sin(t * 6) * decay;
    const scale = 1 + (params.intensity - 1) * Math.abs(bounce);
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
    return [`zoompan=z='1+${(params.intensity-1).toFixed(2)}*abs(sin(on/8)*exp(-on/40))':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=hd720`];
  }
};
