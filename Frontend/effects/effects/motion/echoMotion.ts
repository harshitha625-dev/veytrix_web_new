import { Repeat } from 'lucide-react';
import { EffectModule } from '../types';

export const echoMotion: EffectModule = {
  id: 'pro-echo-motion',
  name: 'Echo Motion',
  category: 'motion',
  icon: Repeat,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Stroboscopic echo duplicating motion across frames.',
  defaultParameters: {"intensity":4,"speed":1,"duration":3,"opacity":0.4,"blendMode":"screen","enabled":true},
  adjustableParameters: [{"name":"Echo Count","key":"intensity","type":"number","min":2,"max":8,"step":1},{"name":"Decay Rate","key":"speed","type":"number","min":0.3,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":0.5,"max":8,"step":0.5},{"name":"Echo Opacity","key":"opacity","type":"number","min":0.1,"max":0.7,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["screen","normal","multiply","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const echoes = Math.round(params.intensity);
    for (let i = 1; i <= echoes; i++) {
      ctx.save();
      ctx.globalAlpha = params.opacity * Math.pow(0.7, i);
      ctx.globalCompositeOperation = params.blendMode;
      const scale = 1 - i * 0.02;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`tmix=frames=${Math.round(params.intensity)}:weights='1 ${Array(Math.round(params.intensity)-1).fill(String(params.opacity.toFixed(1))).join(' ')}'`];
  }
};
