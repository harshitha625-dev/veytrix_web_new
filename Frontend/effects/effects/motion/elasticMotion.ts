import { Activity } from 'lucide-react';
import { EffectModule } from '../types';

export const elasticMotion: EffectModule = {
  id: 'pro-elastic-motion',
  name: 'Elastic Motion',
  category: 'motion',
  icon: Activity,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Rubber-band elastic stretch and snap motion.',
  defaultParameters: {"intensity":10,"speed":2,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Elastic Force","key":"intensity","type":"number","min":2,"max":25,"step":1},{"name":"Speed","key":"speed","type":"number","min":0.5,"max":5,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":0.5,"max":8,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const t = (time * params.speed) % 3;
    const decay = Math.exp(-t * 2);
    const stretchX = 1 + Math.sin(t * 8) * params.intensity * 0.005 * decay;
    const stretchY = 1 + Math.cos(t * 8) * params.intensity * 0.005 * decay;
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(stretchX, stretchY);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`scale='iw*(1+${params.intensity*0.005}*sin(t*8)*exp(-mod(t,3)*2))':'ih*(1+${params.intensity*0.005}*cos(t*8)*exp(-mod(t,3)*2))'`];
  }
};
