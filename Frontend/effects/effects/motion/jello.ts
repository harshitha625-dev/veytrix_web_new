import { Dessert } from 'lucide-react';
import { EffectModule } from '../types';

export const jello: EffectModule = {
  id: 'pro-jello',
  name: 'Jello',
  category: 'motion',
  icon: Dessert,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Wobbly jello-like deformation with skew distortion.',
  defaultParameters: {"intensity":8,"speed":2,"duration":4,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Wobble","key":"intensity","type":"number","min":2,"max":20,"step":1},{"name":"Speed","key":"speed","type":"number","min":0.5,"max":5,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const t = time * params.speed;
    const skewX = Math.sin(t * 3) * params.intensity * 0.002;
    const skewY = Math.cos(t * 2.5) * params.intensity * 0.001;
    const scaleX = 1 + Math.sin(t * 4) * params.intensity * 0.005;
    const scaleY = 1 + Math.cos(t * 3.5) * params.intensity * 0.005;
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.transform(scaleX, skewY, skewX, scaleY, 0, 0);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`perspective=x0=0:y0=0:x1=W:y1=0:x2=0+${params.intensity}*sin(t*3):y2=H:x3=W-${params.intensity}*sin(t*3):y3=H`];
  }
};
