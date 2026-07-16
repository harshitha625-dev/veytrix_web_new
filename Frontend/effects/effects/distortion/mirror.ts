import { Columns } from 'lucide-react';
import { EffectModule } from '../types';

export const mirror: EffectModule = {
  id: 'pro-mirror',
  name: 'Mirror split',
  category: 'distortion',
  icon: Columns,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Reflective horizontal mirror split.',
  defaultParameters: {"intensity":1,"speed":1,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width / 2, canvas.height, 0, 0, canvas.width / 2, canvas.height);
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width / 2, canvas.height, 0, 0, canvas.width / 2, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`crop=iw/2:ih:0:0,split[left][tmp];[tmp]hflip[right];[left][right]hstack`];
  }
};
