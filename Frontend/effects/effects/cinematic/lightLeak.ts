import { Sun } from 'lucide-react';
import { EffectModule } from '../types';

export const lightLeak: EffectModule = {
  id: 'pro-light-leak',
  name: 'Light Leak',
  category: 'cinematic',
  icon: Sun,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Cinematic colored flares moving across screen.',
  defaultParameters: {"intensity":0.5,"speed":1,"duration":3,"opacity":0.6,"blendMode":"screen","enabled":true},
  adjustableParameters: [{"name":"Light Size","key":"intensity","type":"number","min":0.1,"max":2,"step":0.1}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const x = canvas.width * (0.5 + 0.3 * Math.sin(time * params.speed));
    const y = canvas.height * (0.5 + 0.2 * Math.cos(time * params.speed * 0.8));
    const rad = canvas.width * 0.45 * params.intensity;
    const grad = ctx.createRadialGradient(x, y, rad * 0.1, x, y, rad);
    grad.addColorStop(0, `rgba(255, 180, 50, ${params.opacity})`);
    grad.addColorStop(0.4, `rgba(255, 100, 200, ${params.opacity * 0.5})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`colorbalance=rs=0.10:bs=-0.08`];
  }
};
