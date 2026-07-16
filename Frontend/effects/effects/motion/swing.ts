import { Anchor } from 'lucide-react';
import { EffectModule } from '../types';

export const swing: EffectModule = {
  id: 'pro-swing',
  name: 'Swing',
  category: 'motion',
  icon: Anchor,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Pendulum swing rotation from a top pivot point.',
  defaultParameters: {"intensity":5,"speed":1.5,"duration":4,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Swing Angle","key":"intensity","type":"number","min":1,"max":15,"step":0.5},{"name":"Speed","key":"speed","type":"number","min":0.3,"max":4,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const angle = Math.sin(time * params.speed) * params.intensity * (Math.PI / 180);
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.translate(canvas.width / 2, 0);
    ctx.rotate(angle);
    ctx.translate(-canvas.width / 2, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`rotate='${params.intensity}*PI/180*sin(t*${params.speed})':fillcolor=black`];
  }
};
