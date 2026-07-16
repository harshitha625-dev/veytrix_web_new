import { Layers } from 'lucide-react';
import { EffectModule } from '../types';

export const rgbSplit: EffectModule = {
  id: 'pro-rgb-split',
  name: 'RGB Split',
  category: 'glitch',
  icon: Layers,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Classic red and cyan channel chromatic split.',
  defaultParameters: {"intensity":15,"speed":2,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Offset Pixels","key":"intensity","type":"number","min":2,"max":40,"step":1}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = params.opacity * 0.5;
    ctx.translate(-params.intensity, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.translate(params.intensity * 2, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`chromashift=cbh=${Math.round(params.intensity/3)}:cbv=0:crh=${Math.round(-params.intensity/3)}:crv=0`];
  }
};
