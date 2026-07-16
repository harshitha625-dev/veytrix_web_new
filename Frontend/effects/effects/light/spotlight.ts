import { Flashlight } from 'lucide-react';
import { EffectModule } from '../types';

export const spotlight: EffectModule = {
  id: 'pro-spotlight',
  name: 'Spotlight',
  category: 'light',
  icon: Flashlight,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Moving spotlight that illuminates part of the frame.',
  defaultParameters: {"intensity":0.25,"speed":1,"duration":5,"opacity":0.7,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Spot Size","key":"intensity","type":"number","min":0.1,"max":0.5,"step":0.02},{"name":"Speed","key":"speed","type":"number","min":0.2,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Darkness","key":"opacity","type":"number","min":0.3,"max":0.9,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","overlay"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const cx = canvas.width * (0.5 + 0.3 * Math.sin(time * params.speed));
    const cy = canvas.height * (0.5 + 0.2 * Math.cos(time * params.speed * 0.7));
    const radius = canvas.width * params.intensity;
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${params.opacity})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`vignette=PI/${Math.round(2/params.intensity)}`];
  }
};
