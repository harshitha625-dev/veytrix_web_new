import { Camera } from 'lucide-react';
import { EffectModule } from '../types';

export const disposableCamera: EffectModule = {
  id: 'pro-disposable-camera',
  name: 'Disposable Camera',
  category: 'retro',
  icon: Camera,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Retro disposable camera film grain, green-yellow tint, and flash flare.',
  defaultParameters: {"intensity":0.5,"speed":1,"duration":5,"opacity":0.8,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Tint Strength","key":"intensity","type":"number","min":0.1,"max":1.2,"step":0.05},{"name":"Speed","key":"speed","type":"number","min":0.2,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","overlay","multiply","screen"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // High contrast green-yellow film tint
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] * 0.95; // Slightly less red
      data[i+1] = data[i+1] * 1.05 + 10; // More green
      data[i+2] = data[i+2] * 0.8;      // Less blue
      // High contrast
      const avg = (data[i] + data[i+1] + data[i+2]) / 3;
      data[i] = data[i] + (data[i] - avg) * 0.15;
      data[i+1] = data[i+1] + (data[i+1] - avg) * 0.15;
      data[i+2] = data[i+2] + (data[i+2] - avg) * 0.15;
    }
    ctx.putImageData(imageData, 0, 0);

    // Warm orange light flare in bottom-right corner
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = params.opacity * 0.35;
    const grad = ctx.createRadialGradient(
      canvas.width, canvas.height, 0,
      canvas.width, canvas.height, canvas.width * 0.35
    );
    grad.addColorStop(0, 'rgba(255,120,30,0.95)');
    grad.addColorStop(0.5, 'rgba(255,160,50,0.45)');
    grad.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`colorbalance=rs=-0.05:gs=0.1:bs=-0.15,eq=contrast=1.15`];
  }
};
