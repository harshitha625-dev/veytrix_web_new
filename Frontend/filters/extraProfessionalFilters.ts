import { EffectModule } from '../effects/effects/types';
import { Palette, Sun, Moon, Tv, Zap, Camera, Film, Compass, Eye, Sliders, Wind, Play, Sparkles, Clapperboard } from 'lucide-react';
import { getFilterConfig } from './professionalFilters';

// 30 themes configuration
const themes = [
  { name: 'Hollywood', baseCat: 'cinematic', offset: 14, icon: Clapperboard },
  { name: 'IMAX', baseCat: 'cinematic', offset: 24, icon: Clapperboard },
  { name: 'Netflix', baseCat: 'cinematic', offset: 34, icon: Clapperboard },
  { name: 'ARRI', baseCat: 'cinematic', offset: 44, icon: Camera },
  { name: 'RED', baseCat: 'cinematic', offset: 54, icon: Camera },
  { name: 'Sony Cinema', baseCat: 'cinematic', offset: 64, icon: Camera },
  { name: 'Blackmagic', baseCat: 'cinematic', offset: 74, icon: Camera },
  { name: 'Documentary', baseCat: 'cinematic', offset: 84, icon: Film },
  { name: 'Kodak', baseCat: 'film', offset: 14, icon: Film },
  { name: 'Fujifilm', baseCat: 'film', offset: 24, icon: Film },
  { name: 'Analog', baseCat: 'film', offset: 34, icon: Tv },
  { name: 'Seasons', baseCat: 'landscape', offset: 14, icon: Compass },
  { name: 'Ocean', baseCat: 'landscape', offset: 24, icon: Compass },
  { name: 'Forest', baseCat: 'landscape', offset: 34, icon: Compass },
  { name: 'Desert', baseCat: 'landscape', offset: 44, icon: Sun },
  { name: 'Aurora', baseCat: 'neon', offset: 14, icon: Zap },
  { name: 'Galaxy', baseCat: 'neon', offset: 24, icon: Sparkles },
  { name: 'Space', baseCat: 'neon', offset: 34, icon: Moon },
  { name: 'Synthwave', baseCat: 'neon', offset: 44, icon: Zap },
  { name: 'Vaporwave', baseCat: 'neon', offset: 54, icon: Tv },
  { name: 'Sci-Fi', baseCat: 'neon', offset: 64, icon: Zap },
  { name: 'Luxury', baseCat: 'fashion', offset: 14, icon: Palette },
  { name: 'Diamond', baseCat: 'fashion', offset: 24, icon: Sparkles },
  { name: 'Gold', baseCat: 'fashion', offset: 34, icon: Sun },
  { name: 'Crystal', baseCat: 'fashion', offset: 44, icon: Palette },
  { name: 'Anime', baseCat: '3d', offset: 14, icon: Play },
  { name: 'Comic', baseCat: '3d', offset: 24, icon: Play },
  { name: 'Oil Painting', baseCat: '3d', offset: 34, icon: Palette },
  { name: 'Watercolor', baseCat: '3d', offset: 44, icon: Palette },
  { name: 'Sketch', baseCat: '3d', offset: 54, icon: Eye }
];

export const extraProfessionalFiltersList: EffectModule[] = [];

themes.forEach((t) => {
  for (let idx = 1; idx <= 10; idx++) {
    const realIndex = t.offset + idx - 1;
    const id = `pro-filter-${t.baseCat}-${realIndex}`;
    const name = `${t.name} v${idx}`;
    const description = `${t.name} grading preset style ${idx} with adjustable intensity.`;

    extraProfessionalFiltersList.push({
      id,
      name,
      category: t.baseCat as any,
      icon: t.icon,
      thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=150&auto=format&fit=crop&q=60',
      description,
      defaultParameters: { intensity: 0.5, enabled: true },
      adjustableParameters: [
        { name: 'Filter Intensity', key: 'intensity', type: 'number', min: 0, max: 1, step: 0.05 }
      ],
      previewRenderer: (ctx, video, params, time, canvas) => {
        ctx.save();
        const intensity = params.intensity ?? 0.5;
        const { css } = getFilterConfig(t.baseCat, realIndex, intensity);
        if (css !== 'none') {
          ctx.filter = css;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      },
      ffmpegExportFilter: (params) => {
        const intensity = params.intensity ?? 0.5;
        const { ffmpeg } = getFilterConfig(t.baseCat, realIndex, intensity);
        return ffmpeg;
      }
    });
  }
});
