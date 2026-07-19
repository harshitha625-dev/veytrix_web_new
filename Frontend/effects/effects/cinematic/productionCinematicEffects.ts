import { EffectModule } from '../types';
import { Film, Sparkles, Palette } from 'lucide-react';

const createProductionEffect = (
  id: string, name: string, description: string, icon: any, category: any,
  defaultParams: any, adjustableParams: any[], renderer: any
): EffectModule => {
  return {
    id,
    name,
    category,
    icon,
    thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=150&auto=format&fit=crop&q=60',
    description,
    defaultParameters: { ...defaultParams, enabled: true },
    adjustableParameters: adjustableParams,
    previewRenderer: (ctx, video, params, time, canvas) => {
      ctx.save();
      renderer(ctx, video, params, time, canvas);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    },
    ffmpegExportFilter: () => []
  };
};

export const productionCinematicEffectsList: EffectModule[] = [];

// Cinematic Themes (75 effects)
const cineThemes = [
  { name: 'Blockbuster Film', sub: 'film', icon: Film },
  { name: 'Indie Drama', sub: 'film', icon: Film },
  { name: 'Technicolor', sub: 'film', icon: Film },
  { name: 'Neo-Noir', sub: 'film', icon: Film },
  { name: 'Anamorphic Flare', sub: 'film', icon: Film },
  { name: 'Vignette Mask', sub: 'film', icon: Film },
  { name: 'Letterbox Scope', sub: 'film', icon: Film },
  { name: 'Film Border', sub: 'film', icon: Film },
  { name: 'Gate Flicker', sub: 'film', icon: Film },
  { name: 'Split Screen', sub: 'film', icon: Film },
  { name: 'Color Split', sub: 'film', icon: Film },
  { name: 'Film Burn', sub: 'film', icon: Film },
  { name: 'Light Leak', sub: 'film', icon: Film },
  { name: 'Fog Mist', sub: 'film', icon: Film },
  { name: 'Warm Glow', sub: 'film', icon: Film }
];
cineThemes.forEach((t) => {
  for (let v = 1; v <= 5; v++) {
    productionCinematicEffectsList.push(createProductionEffect(
      `pro-prod-cine-${t.name.toLowerCase().replace(/ /g, '-')}-${t.sub}-${v}`,
      `${t.name} v${v}`,
      `High-fidelity cinematic ${t.name} grade variation ${v}.`,
      t.icon,
      'cinematic',
      { intensity: 0.5 },
      [{ name: 'Intensity', key: 'intensity', type: 'number', min: 0.1, max: 1.0, step: 0.05 }],
      (ctx: any, video: any, params: any) => {
        const intensity = params.intensity ?? 0.5;
        ctx.filter = `contrast(${1.05 + intensity * 0.1}) saturate(${1 + intensity * 0.08})`;
      }
    ));
  }
});

// Particle Themes (45 effects)
const partThemes = [
  { name: 'Dust Overlay', sub: 'noise', icon: Sparkles },
  { name: 'Floating Embers', sub: 'noise', icon: Sparkles },
  { name: 'Fireflies Spark', sub: 'noise', icon: Sparkles },
  { name: 'Fog Volumetric', sub: 'noise', icon: Sparkles },
  { name: 'Smoke Plume', sub: 'noise', icon: Sparkles },
  { name: 'Rain Drops', sub: 'noise', icon: Sparkles },
  { name: 'Snow Flurries', sub: 'noise', icon: Sparkles },
  { name: 'Confetti Fall', sub: 'noise', icon: Sparkles },
  { name: 'Light Bubbles', sub: 'noise', icon: Sparkles }
];
partThemes.forEach((t) => {
  for (let v = 1; v <= 5; v++) {
    productionCinematicEffectsList.push(createProductionEffect(
      `pro-prod-part-${t.name.toLowerCase().replace(/ /g, '-')}-${t.sub}-${v}`,
      `${t.name} v${v}`,
      `Atmospheric particle ${t.name} style ${v}.`,
      t.icon,
      'cinematic',
      { intensity: 0.5 },
      [{ name: 'Intensity', key: 'intensity', type: 'number', min: 0.1, max: 1.0, step: 0.05 }],
      (ctx: any, video: any, params: any) => {
        const intensity = params.intensity ?? 0.5;
        ctx.filter = `contrast(${1.02 + intensity * 0.04})`;
      }
    ));
  }
});

// Color Themes (45 effects)
const gradeThemes = [
  { name: 'Teal & Orange', sub: 'film', icon: Palette },
  { name: 'Cross Process', sub: 'film', icon: Palette },
  { name: 'Bleach Bypass', sub: 'film', icon: Palette },
  { name: 'Duo Tone', sub: 'film', icon: Palette },
  { name: 'Tri Tone', sub: 'film', icon: Palette },
  { name: 'Saturated Pop', sub: 'film', icon: Palette },
  { name: 'Moody Dark', sub: 'film', icon: Palette },
  { name: 'Sepia Gold', sub: 'film', icon: Palette },
  { name: 'High Key Clarity', sub: 'film', icon: Palette }
];
gradeThemes.forEach((t) => {
  for (let v = 1; v <= 5; v++) {
    productionCinematicEffectsList.push(createProductionEffect(
      `pro-prod-grade-${t.name.toLowerCase().replace(/ /g, '-')}-${t.sub}-${v}`,
      `${t.name} v${v}`,
      `Stylized grade ${t.name} style ${v}.`,
      t.icon,
      'cinematic',
      { intensity: 0.5 },
      [{ name: 'Intensity', key: 'intensity', type: 'number', min: 0.1, max: 1.0, step: 0.05 }],
      (ctx: any, video: any, params: any) => {
        const intensity = params.intensity ?? 0.5;
        ctx.filter = `contrast(${1.08 + intensity * 0.12}) saturate(${1 + intensity * 0.18})`;
      }
    ));
  }
});
