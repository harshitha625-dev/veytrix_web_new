import { Disc } from 'lucide-react';
import { EffectModule } from '../types';

export const sixteenMmFilm: EffectModule = {
  id: 'pro-16mm-film',
  name: '16mm Film',
  category: 'retro',
  icon: Disc,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: '16mm cinematic color saturation, vignette, and grain.',
  defaultParameters: {"intensity":0.5,"speed":1.5,"duration":5,"opacity":0.8,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Grain Size","key":"intensity","type":"number","min":0.1,"max":1.2,"step":0.05},{"name":"Speed","key":"speed","type":"number","min":0.5,"max":4,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","overlay","multiply","screen"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const len = data.length;
    
    // Low saturated vintage look with slight yellow cast
    for (let i = 0; i < len; i += 4) {
      data[i] = data[i] * 0.9 + 10;
      data[i+1] = data[i+1] * 0.95 + 5;
      data[i+2] = data[i+2] * 0.85;
      // Add grain
      const grain = (Math.random() - 0.5) * params.intensity * 40;
      data[i] = Math.max(0, Math.min(255, data[i] + grain));
      data[i+1] = Math.max(0, Math.min(255, data[i+1] + grain));
      data[i+2] = Math.max(0, Math.min(255, data[i+2] + grain));
    }
    ctx.putImageData(imageData, 0, 0);

    // Subtle vignette
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width*0.4, canvas.width/2, canvas.height/2, canvas.width*0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`noise=alls=20:allf=t+u,vignette=PI/4`];
  }
};
