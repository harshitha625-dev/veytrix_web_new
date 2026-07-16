import { Heart } from 'lucide-react';
import { EffectModule } from '../types';

export const pulseZoom: EffectModule = {
  id: 'pro-pulse-zoom',
  name: 'Pulse Zoom',
  category: 'camera',
  icon: Heart,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Heartbeat-style rhythmic zoom pulse.',
  defaultParameters: {"intensity":1.15,"speed":2.5,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Pulse Size","key":"intensity","type":"number","min":1,"max":1.6,"step":0.02},{"name":"BPM","key":"speed","type":"number","min":0.5,"max":6,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":0.5,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const t = (time * params.speed) % 1;
    const pulse = t < 0.15 ? Math.sin(t / 0.15 * Math.PI) : t < 0.35 ? Math.sin((t - 0.15) / 0.2 * Math.PI) * 0.6 : 0;
    const scale = 1 + (params.intensity - 1) * pulse;
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
    return [`zoompan=z='1+${(params.intensity-1).toFixed(2)}*abs(sin(on/12*${params.speed}))':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=hd720`];
  }
};
