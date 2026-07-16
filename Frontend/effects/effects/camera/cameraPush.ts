import { ArrowRight } from 'lucide-react';
import { EffectModule } from '../types';

export const cameraPush: EffectModule = {
  id: 'pro-camera-push',
  name: 'Camera Push',
  category: 'camera',
  icon: ArrowRight,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Slow push forward into the scene.',
  defaultParameters: {"intensity":1.3,"speed":1,"duration":5,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Push Depth","key":"intensity","type":"number","min":1,"max":2,"step":0.05},{"name":"Speed","key":"speed","type":"number","min":0.2,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":15,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay","color-dodge"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    const progress = ((time * params.speed * 0.1) % 1);
    const scale = 1 + (params.intensity - 1) * progress;
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`zoompan=z='1+${(params.intensity-1).toFixed(2)}*(on/duration)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=hd720`];
  }
};
