import { Grid } from 'lucide-react';
import { EffectModule } from '../types';

export const pixelate: EffectModule = {
  id: 'pro-pixelate',
  name: 'Pixelate',
  category: 'distortion',
  icon: Grid,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Hardware-accelerated pixel art filter.',
  defaultParameters: {"intensity":10,"speed":1,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Pixel Size","key":"intensity","type":"number","min":2,"max":40,"step":1}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    const size = Math.max(1, params.intensity);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(video, 0, 0, canvas.width / size, canvas.height / size);
    ctx.drawImage(canvas, 0, 0, canvas.width / size, canvas.height / size, 0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`scale=${Math.round(640/params.intensity)}:${Math.round(360/params.intensity)}:flags=neighbor,scale=640:360:flags=neighbor`];
  }
};
