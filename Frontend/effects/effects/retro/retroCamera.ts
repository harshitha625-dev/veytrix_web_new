import { Clapperboard } from 'lucide-react';
import { EffectModule } from '../types';

export const retroCamera: EffectModule = {
  id: 'pro-retro-camera',
  name: 'Retro Camera',
  category: 'retro',
  icon: Clapperboard,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Warm retro camera styling with soft light leak accents.',
  defaultParameters: {"intensity":0.4,"speed":1,"duration":5,"opacity":0.8,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Leak Strength","key":"intensity","type":"number","min":0.1,"max":1,"step":0.05},{"name":"Leak Speed","key":"speed","type":"number","min":0.2,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","overlay","screen","multiply"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Warm tone look
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] * 1.05 + 10;
      data[i+1] = data[i+1] * 0.95;
      data[i+2] = data[i+2] * 0.85;
    }
    ctx.putImageData(imageData, 0, 0);

    // Dynamic light leak simulation
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = params.opacity;
    const progress = (time * params.speed * 0.25) % 1;
    const grad = ctx.createRadialGradient(
      canvas.width * progress, canvas.height * 0.1, 0,
      canvas.width * progress, canvas.height * 0.1, canvas.width * 0.4
    );
    grad.addColorStop(0, `rgba(255,100,50,${params.intensity * 0.85})`);
    grad.addColorStop(0.5, `rgba(255,180,100,${params.intensity * 0.3})`);
    grad.addColorStop(1, 'rgba(255,100,50,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`colorbalance=rs=0.15:gs=-0.05:bs=-0.15`];
  }
};
