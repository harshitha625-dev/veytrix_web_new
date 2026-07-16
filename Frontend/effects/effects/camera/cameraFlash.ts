import { Lightbulb } from 'lucide-react';
import { EffectModule } from '../types';

export const cameraFlash: EffectModule = {
  id: 'pro-camera-flash',
  name: 'Camera Flash',
  category: 'camera',
  icon: Lightbulb,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Quick white flash burst.',
  defaultParameters: {"intensity":0.8,"speed":2,"duration":2,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Intensity","key":"intensity","type":"number","min":0.1,"max":1,"step":0.05},{"name":"Speed","key":"speed","type":"number","min":0.5,"max":5,"step":0.1}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const flashOpacity = Math.max(0, 1 - (time * params.speed) % 1) * params.intensity;
    ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
    ctx.globalCompositeOperation = 'screen';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`eq=brightness=${(params.intensity*0.2).toFixed(2)}:contrast=${(1+params.intensity*0.2).toFixed(2)}`];
  }
};
