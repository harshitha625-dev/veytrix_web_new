import { Compass } from 'lucide-react';
import { EffectModule } from '../types';

export const kaleidoscope: EffectModule = {
  id: 'pro-kaleidoscope',
  name: 'Kaleidoscope',
  category: 'distortion',
  icon: Compass,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: '8-segment visual reflection matrix.',
  defaultParameters: {"intensity":8,"speed":1,"duration":4,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Segments","key":"intensity","type":"number","min":4,"max":16,"step":2}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    const segments = params.intensity;
    const angle = (Math.PI * 2) / segments;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    for (let i = 0; i < segments; i++) {
      ctx.rotate(angle);
      ctx.drawImage(video, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    }
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`scale=iw/2:ih/2,split=4[a][b][c][d];[b]hflip[b_h];[c]vflip[c_v];[d]hflip,vflip[d_hv];[a][b_h]hstack[top];[c_v][d_hv]hstack[bottom];[top][bottom]vstack`];
  }
};
