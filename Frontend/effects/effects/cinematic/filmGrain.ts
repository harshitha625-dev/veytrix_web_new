import { Film } from 'lucide-react';
import { EffectModule } from '../types';

export const filmGrain: EffectModule = {
  id: 'pro-film-grain',
  name: 'Film Grain',
  category: 'cinematic',
  icon: Film,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Vibrant organic film grain overlay.',
  defaultParameters: {"intensity":0.4,"speed":1,"duration":4,"opacity":0.15,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Roughness","key":"intensity","type":"number","min":0.1,"max":1.5,"step":0.05},{"name":"Opacity","key":"opacity","type":"number","min":0.02,"max":0.5,"step":0.01}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const len = data.length;
    const grainStrength = params.intensity * 32;
    for (let i = 0; i < len; i += 4) {
      const g = (Math.random() - 0.5) * grainStrength * params.opacity;
      data[i] = Math.max(0, Math.min(255, data[i] + g));
      data[i+1] = Math.max(0, Math.min(255, data[i+1] + g));
      data[i+2] = Math.max(0, Math.min(255, data[i+2] + g));
    }
    ctx.putImageData(imageData, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`noise=alls=${Math.round(8 + params.intensity * 12)}:allf=t+u`];
  }
};
