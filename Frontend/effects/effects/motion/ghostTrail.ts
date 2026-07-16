import { Ghost } from 'lucide-react';
import { EffectModule } from '../types';

export const ghostTrail: EffectModule = {
  id: 'pro-ghost-trail',
  name: 'Ghost Trail',
  category: 'motion',
  icon: Ghost,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Translucent trailing copies creating a ghostly trail.',
  defaultParameters: {"intensity":5,"speed":1,"duration":4,"opacity":0.3,"blendMode":"screen","enabled":true},
  adjustableParameters: [{"name":"Trail Count","key":"intensity","type":"number","min":2,"max":10,"step":1},{"name":"Trail Spread","key":"speed","type":"number","min":0.5,"max":4,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Ghost Opacity","key":"opacity","type":"number","min":0.1,"max":0.6,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["screen","normal","multiply","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const trails = Math.round(params.intensity);
    for (let i = 1; i <= trails; i++) {
      ctx.save();
      ctx.globalAlpha = params.opacity * (1 - i / (trails + 1));
      ctx.globalCompositeOperation = params.blendMode;
      const offset = Math.sin(time * params.speed - i * 0.3) * i * 4;
      ctx.translate(offset, offset * 0.5);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`tmix=frames=${Math.round(params.intensity)}:weights='1 ${Array(Math.round(params.intensity)-1).fill('0.3').join(' ')}'`];
  }
};
