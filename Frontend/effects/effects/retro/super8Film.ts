import { Film } from 'lucide-react';
import { EffectModule } from '../types';

export const super8Film: EffectModule = {
  id: 'pro-super8-film',
  name: 'Super 8 Film',
  category: 'retro',
  icon: Film,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Classic vintage Super 8 film texture, jitter, and gate weave.',
  defaultParameters: {"intensity":0.4,"speed":2,"duration":5,"opacity":0.7,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Gate Jitter","key":"intensity","type":"number","min":0.1,"max":1,"step":0.05},{"name":"Frame Rate","key":"speed","type":"number","min":1,"max":4,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","overlay","multiply","screen"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    // Vintage color tint (warmer, slightly low contrast)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] * 0.95 + 15; // Red warmer
      data[i+1] = data[i+1] * 0.9 + 10; // Green warmer
      data[i+2] = data[i+2] * 0.8;      // Blue cooler
    }
    ctx.putImageData(imageData, 0, 0);

    // Gate weave / jitter
    ctx.save();
    ctx.globalAlpha = params.opacity;
    ctx.globalCompositeOperation = params.blendMode;
    const jitterX = (Math.random() - 0.5) * params.intensity * 6;
    const jitterY = (Math.random() - 0.5) * params.intensity * 8;
    ctx.translate(jitterX, jitterY);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Film hair and scratches
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    if (Math.random() < 0.3) {
      ctx.beginPath();
      const sx = Math.random() * canvas.width;
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx + (Math.random() - 0.5) * 20, canvas.height);
      ctx.stroke();
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`curves=vintage,noise=alls=15:allf=t+u`];
  }
};
