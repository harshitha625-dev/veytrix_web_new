import { GlassWater } from 'lucide-react';
import { EffectModule } from '../types';

export const glass: EffectModule = {
  id: 'pro-glass',
  name: 'Glass',
  category: 'distortion',
  icon: GlassWater,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Frosted glass refraction distortion.',
  defaultParameters: {"intensity":8,"speed":1,"duration":4,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Refraction","key":"intensity","type":"number","min":2,"max":20,"step":1},{"name":"Animation","key":"speed","type":"number","min":0,"max":3,"step":0.1},{"name":"Duration","key":"duration","type":"number","min":1,"max":10,"step":0.5},{"name":"Opacity","key":"opacity","type":"number","min":0,"max":1,"step":0.05},{"name":"Blend Mode","key":"blendMode","type":"select","options":["normal","multiply","screen","overlay"]}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width, h = canvas.height;
    const temp = new Uint8ClampedArray(data);
    const phase = time * params.speed;
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const ox = Math.round(Math.sin(y * 0.1 + phase) * params.intensity * 0.5);
        const oy = Math.round(Math.cos(x * 0.1 + phase) * params.intensity * 0.5);
        const sx = Math.max(0, Math.min(w-1, x+ox));
        const sy = Math.max(0, Math.min(h-1, y+oy));
        const di = (y*w+x)*4, si = (sy*w+sx)*4;
        data[di]=temp[si]; data[di+1]=temp[si+1]; data[di+2]=temp[si+2];
        if(x+1<w){data[di+4]=temp[si]; data[di+5]=temp[si+1]; data[di+6]=temp[si+2];}
      }
    }
    ctx.putImageData(imageData, 0, 0);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`geq=r='p(X+sin(Y/10+N/25)*${params.intensity},Y+cos(X/10+N/25)*${params.intensity})':g='p(X+sin(Y/10+N/25)*${params.intensity},Y+cos(X/10+N/25)*${params.intensity})':b='p(X+sin(Y/10+N/25)*${params.intensity},Y+cos(X/10+N/25)*${params.intensity})'`];
  }
};
