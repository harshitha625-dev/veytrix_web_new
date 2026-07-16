import { RotateCcw } from 'lucide-react';
import { EffectModule } from '../types';

export const wobble: EffectModule = {
  id: 'pro-wobble',
  name: 'Wobble',
  category: 'motion',
  icon: RotateCcw,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Rotational wobble around the center axis.',
  defaultParameters: {"intensity":3,"speed":2,"duration":4,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Wobble Angle","key":"intensity","type":"number","min":1,"max":10,"step":0.5},{"name":"Speed","key":"speed","type":"number","min":0.3,"max":5,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const angle = Math.sin(time * params.speed * 2) * params.intensity * (Math.PI / 180);
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`rotate='${params.intensity}*PI/180*sin(t*${params.speed}*2)':fillcolor=black`];
  }
};
