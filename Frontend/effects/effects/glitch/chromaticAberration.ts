import { Sliders } from 'lucide-react';
import { EffectModule } from '../types';

export const chromaticAberration: EffectModule = {
  id: 'pro-chromatic-aberration',
  name: 'Chromatic Aberration',
  category: 'glitch',
  icon: Sliders,
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
  description: 'Color fringing distortion near screen borders.',
  defaultParameters: {"intensity":12,"speed":1,"duration":3,"opacity":1,"blendMode":"normal","enabled":true},
  adjustableParameters: [{"name":"Fringiness","key":"intensity","type":"number","min":2,"max":35,"step":1}],
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = params.opacity * 0.4;
    // Red Channel zoomed
    ctx.save();
    const rScale = 1 + params.intensity * 0.001;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(rScale, rScale);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    // Blue Channel shrunk
    ctx.save();
    const bScale = 1 - params.intensity * 0.001;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(bScale, bScale);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    ctx.restore();
  },
  ffmpegExportFilter: (params) => {
    return [`chromashift=cbh=2:cbv=2:crh=-2:crv=-2`];
  }
};
