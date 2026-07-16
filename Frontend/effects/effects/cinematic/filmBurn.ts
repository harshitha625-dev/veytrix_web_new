import { Flame } from 'lucide-react';
import { EffectModule } from '../types';

export const filmBurn: EffectModule = {
  id: 'pro-film-burn',
  name: 'Film Burn',
  category: 'cinematic',
  icon: Flame,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Hot glowing film edges and flares.',
  defaultParameters: {"intensity":0.6,"speed":1,"duration":3,"opacity":0.7,"blendMode":"screen","enabled":true},
  adjustableParameters: [{"name":"Brightness","key":"intensity","type":"number","min":0.1,"max":1.5,"step":0.05}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const grad = ctx.createRadialGradient(0, canvas.height/2, 10, 0, canvas.height/2, canvas.width * 0.62 * params.intensity);
    const intensityOffset = Math.sin(time * 3.5) * 0.15;
    const finalOpacity = Math.max(0, params.opacity + intensityOffset);
    grad.addColorStop(0, `rgba(235, 87, 87, ${finalOpacity})`);
    grad.addColorStop(0.5, `rgba(242, 153, 74, ${finalOpacity * 0.6})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`colorbalance=rs=0.18:gs=0.08:bs=-0.12`];
  }
};
