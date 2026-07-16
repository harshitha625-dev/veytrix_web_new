import { Hand } from 'lucide-react';
import { EffectModule } from '../types';

export const handheldCamera: EffectModule = {
  id: 'pro-handheld-camera',
  name: 'Handheld Camera',
  category: 'camera',
  icon: Hand,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Organic jittery handheld camera motion with micro-rotations.',
  defaultParameters: {"intensity":4,"speed":2,"duration":5,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Shake Amount","key":"intensity","type":"number","min":1,"max":12,"step":0.5},{"name":"Speed","key":"speed","type":"number","min":0.5,"max":5,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const t = time * params.speed;
    const ox = Math.sin(t * 7.3) * params.intensity + Math.sin(t * 13.7) * params.intensity * 0.3;
    const oy = Math.cos(t * 9.1) * params.intensity * 0.8 + Math.cos(t * 17.3) * params.intensity * 0.2;
    const rot = Math.sin(t * 5.7) * 0.003 * params.intensity;
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.translate(canvas.width / 2 + ox, canvas.height / 2 + oy);
    ctx.rotate(rot);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`crop=iw-${params.intensity*3}:ih-${params.intensity*3}:${params.intensity}+${params.intensity}*sin(t*7):${params.intensity}+${params.intensity}*cos(t*9)`];
  }
};
