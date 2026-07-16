import { Rainbow } from 'lucide-react';
import { EffectModule } from '../types';

export const aurora: EffectModule = {
  id: 'pro-aurora',
  name: 'Aurora',
  category: 'light',
  icon: Rainbow,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Northern lights aurora curtain overlay.',
  defaultParameters: {"intensity":0.4,"speed":1,"duration":6,"opacity":0.35,"blendMode":"screen","enabled":true},
  adjustableParameters: [{"name":"Aurora Brightness","key":"intensity","type":"number","min":0.1,"max":0.8,"step":0.05},{"name":"Wave Speed","key":"speed","type":"number","min":0.2,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":2,"max":15,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":0.7,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["screen","normal","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = params.blendMode;
    ctx.globalAlpha = params.opacity;
    const t = time * params.speed;
    for (let i = 0; i < 5; i++) {
      const y = canvas.height * 0.1 + Math.sin(t + i * 0.8) * canvas.height * 0.15;
      const hue = (t * 30 + i * 60) % 360;
      const grad = ctx.createLinearGradient(0, y - 40, 0, y + 80);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.5, `hsla(${hue}, 80%, 60%, ${params.intensity})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`colorbalance=rs=0.1:gs=0.2:bs=0.3,eq=brightness=0.03:saturation=1.3`];
  }
};
