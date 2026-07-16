import { Droplets } from 'lucide-react';
import { EffectModule } from '../types';

export const liquid: EffectModule = {
  id: 'pro-liquid',
  name: 'Liquid',
  category: 'distortion',
  icon: Droplets,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Fluid liquid warp distortion.',
  defaultParameters: {"intensity":12,"speed":1.5,"duration":4,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Flow Strength","key":"intensity","type":"number","min":3,"max":30,"step":1},{"name":"Flow Speed","key":"speed","type":"number","min":0.3,"max":4,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(data);
    const t = time * params.speed;
    for (let y = 0; y < h; y++) {
      const ox = Math.round(Math.sin(y*0.03 + t*2) * params.intensity + Math.sin(y*0.07 + t*3)*params.intensity*0.5);
      for (let x = 0; x < w; x++) {
        const oy = Math.round(Math.cos(x*0.04 + t*1.5) * params.intensity*0.5);
        const sx = Math.max(0, Math.min(w-1, x+ox));
        const sy = Math.max(0, Math.min(h-1, y+oy));
        const di = (y*w+x)*4, si=(sy*w+sx)*4;
        data[di]=temp[si]; data[di+1]=temp[si+1]; data[di+2]=temp[si+2];
      }
    }
    ctx.putImageData(imageData, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`geq=r='p(X+sin(Y/30+N/15)*${params.intensity},Y+cos(X/40+N/20)*${Math.round(params.intensity/2)})':g='p(X+sin(Y/30+N/15)*${params.intensity},Y+cos(X/40+N/20)*${Math.round(params.intensity/2)})':b='p(X+sin(Y/30+N/15)*${params.intensity},Y+cos(X/40+N/20)*${Math.round(params.intensity/2)})'`];
  }
};
