import { FlipVertical } from 'lucide-react';
import { EffectModule } from '../types';

export const reflection: EffectModule = {
  id: 'pro-reflection',
  name: 'Reflection',
  category: 'light',
  icon: FlipVertical,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Mirror reflection at the bottom with fade gradient.',
  defaultParameters: {"intensity":0.35,"speed":0,"duration":5,"opacity":0.4,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Reflection Height","key":"intensity","type":"number","min":0.1,"max":0.5,"step":0.02},{"name":"Wave","key":"speed","type":"number","min":0,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":0.7,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","screen","overlay"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const mainH = canvas.height * (1 - params.intensity);
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, mainH);
    // Reflected part
    ctx.save();
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
    ctx.globalAlpha = params.opacity;
    ctx.drawImage(video, 0, canvas.height - mainH, canvas.width, mainH);
    ctx.restore();
    // Fade gradient
    const grad = ctx.createLinearGradient(0, mainH, 0, canvas.height);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, mainH, canvas.width, canvas.height - mainH);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`split[a][b];[b]vflip,crop=iw:ih*${params.intensity}:0:ih*(1-${params.intensity}),format=rgba,colorchannelmixer=aa=${params.opacity}[r];[a][r]overlay=0:H-h`];
  }
};
