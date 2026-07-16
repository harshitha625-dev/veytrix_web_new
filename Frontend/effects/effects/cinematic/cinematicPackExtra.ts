import { Film, Clapperboard, Sparkles, Sun, Moon, Eye, Palette } from 'lucide-react';
import { EffectModule } from '../types';

const createCinematicEffect = (id: string, name: string, description: string, icon: any, defaultParams: any, adjustableParams: any[], renderer: any, ffmpegFilter: string[]): EffectModule => ({
  id,
  name,
  category: 'cinematic',
  icon,
  thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=150&auto=format&fit=crop&q=60',
  description,
  defaultParameters: { ...defaultParams, enabled: true },
  adjustableParameters: adjustableParams,
  previewRenderer: (ctx, video, params, time, canvas) => {
    ctx.save();
    renderer(ctx, video, params, time, canvas);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  },
  ffmpegExportFilter: () => ffmpegFilter
});

export const cinematicExtraEffectsList: EffectModule[] = [
  createCinematicEffect(
    'pro-cine-hollywood', 'Hollywood Grade', 'Premium blockbuster color grading with optimized contrast.', Clapperboard,
    { contrast: 1.15, saturation: 1.05 },
    [{ name: 'Contrast', key: 'contrast', type: 'number', min: 0.8, max: 1.5, step: 0.05 }, { name: 'Saturation', key: 'saturation', type: 'number', min: 0.5, max: 1.5, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `contrast(${params.contrast}) saturate(${params.saturation})`;
    },
    ['eq=contrast=1.15:saturation=1.05']
  ),
  createCinematicEffect(
    'pro-cine-technicolor', 'Technicolor 3-Strip', 'Vibrant vintage 3-strip Technicolor process simulator.', Palette,
    { redBoost: 1.25, saturation: 1.2 },
    [{ name: 'Red Boost', key: 'redBoost', type: 'number', min: 1, max: 2, step: 0.05 }, { name: 'Saturation', key: 'saturation', type: 'number', min: 0.5, max: 1.8, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `saturate(${params.saturation}) brightness(1.05)`;
    },
    ['eq=saturation=1.2']
  ),
  createCinematicEffect(
    'pro-cine-kodachrome', 'Vintage Kodachrome', 'Iconic Kodachrome film look with warm saturated tones.', Film,
    { warmTint: 1.1, saturation: 1.15 },
    [{ name: 'Warm Tint', key: 'warmTint', type: 'number', min: 1, max: 1.5, step: 0.05 }, { name: 'Saturation', key: 'saturation', type: 'number', min: 0.5, max: 1.6, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `sepia(0.12) saturate(${params.saturation})`;
    },
    ['eq=saturation=1.15']
  ),
  createCinematicEffect(
    'pro-cine-bleach-bypass', 'Bleach Bypass', 'High contrast, low saturation bypass look mimicking cinematic grit.', Film,
    { contrast: 1.35, saturation: 0.65 },
    [{ name: 'Contrast', key: 'contrast', type: 'number', min: 1, max: 1.8, step: 0.05 }, { name: 'Saturation', key: 'saturation', type: 'number', min: 0.2, max: 1, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `contrast(${params.contrast}) saturate(${params.saturation})`;
    },
    ['eq=contrast=1.35:saturation=0.65']
  ),
  createCinematicEffect(
    'pro-cine-cross-process', 'Cross Processing', 'Stylised color shifts resembling cross-processed negative films.', Palette,
    { greenHue: 1.1, contrast: 1.15 },
    [{ name: 'Green Hue Shift', key: 'greenHue', type: 'number', min: 1, max: 1.5, step: 0.05 }, { name: 'Contrast', key: 'contrast', type: 'number', min: 0.8, max: 1.5, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `hue-rotate(15deg) contrast(${params.contrast})`;
    },
    ['hue=h=15,eq=contrast=1.15']
  ),
  createCinematicEffect(
    'pro-cine-moody-teal', 'Moody Teal & Orange', 'Iconic teal shadows and orange highlight skin tones grade.', Palette,
    { depth: 1.2 },
    [{ name: 'Color Depth', key: 'depth', type: 'number', min: 0.5, max: 2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `contrast(${params.depth * 0.9}) saturate(1.1)`;
    },
    ['eq=contrast=1.1:saturation=1.1']
  ),
  createCinematicEffect(
    'pro-cine-cyanide', 'Cyanide Shadows', 'Rich deep cyan colored shadow grading.', Moon,
    { cyanShift: 1.2 },
    [{ name: 'Cyan Intensity', key: 'cyanShift', type: 'number', min: 0.5, max: 2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `hue-rotate(-10deg) saturate(1.05)`;
    },
    ['hue=h=-10']
  ),
  createCinematicEffect(
    'pro-cine-pastel', 'Soft Pastel Film', 'Delicate pastel palette with soft contrast curves.', Sparkles,
    { brightness: 1.12, contrast: 0.9 },
    [{ name: 'Brightness', key: 'brightness', type: 'number', min: 0.9, max: 1.4, step: 0.02 }, { name: 'Contrast', key: 'contrast', type: 'number', min: 0.6, max: 1.2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `brightness(${params.brightness}) contrast(${params.contrast}) saturate(0.95)`;
    },
    ['eq=brightness=1.12:contrast=0.9']
  ),
  createCinematicEffect(
    'pro-cine-warm-sunset', 'Warm Sunset', 'Golden hour sunshine overlay coloring.', Sun,
    { warmStrength: 0.25, saturation: 1.15 },
    [{ name: 'Warm Strength', key: 'warmStrength', type: 'number', min: 0, max: 0.8, step: 0.05 }, { name: 'Saturation', key: 'saturation', type: 'number', min: 0.5, max: 1.6, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `sepia(${params.warmStrength}) saturate(${params.saturation})`;
    },
    ['eq=saturation=1.15']
  ),
  createCinematicEffect(
    'pro-cine-glacial', 'Glacial Blue', 'Cool arctic blue coloring.', Moon,
    { coolStrength: 1.15 },
    [{ name: 'Cool Intensity', key: 'coolStrength', type: 'number', min: 0.5, max: 2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `hue-rotate(10deg) saturate(0.95)`;
    },
    ['hue=h=10']
  ),
  createCinematicEffect(
    'pro-cine-noir-classic', 'Noir Classic', 'Super-high contrast monochrome cinema look.', Eye,
    { contrast: 1.5 },
    [{ name: 'Contrast', key: 'contrast', type: 'number', min: 1, max: 2.2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `grayscale(1) contrast(${params.contrast})`;
    },
    ['eq=contrast=1.5:saturation=0']
  ),
  createCinematicEffect(
    'pro-cine-sepia-vintage', 'Vintage Sepia', 'Retro classic sepia wash coloring.', Film,
    { intensity: 0.65 },
    [{ name: 'Sepia Intensity', key: 'intensity', type: 'number', min: 0.1, max: 1, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `sepia(${params.intensity}) contrast(1.05)`;
    },
    ['eq=contrast=1.05']
  ),
  createCinematicEffect(
    'pro-cine-cyberpunk', 'Cyberpunk Neon', 'Dystopian neon blue and hot magenta grading.', Sparkles,
    { intensity: 1.25 },
    [{ name: 'Neon Boost', key: 'intensity', type: 'number', min: 0.5, max: 2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `hue-rotate(-25deg) saturate(${params.intensity})`;
    },
    ['hue=h=-25,eq=saturation=1.25']
  ),
  createCinematicEffect(
    'pro-cine-retro-warmth', 'Retro Warmth', 'Warm high-saturation retro warm styling.', Sun,
    { warmth: 0.3 },
    [{ name: 'Warmth Factor', key: 'warmth', type: 'number', min: 0.05, max: 0.9, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `sepia(${params.warmth}) saturate(1.2)`;
    },
    ['eq=saturation=1.2']
  ),
  createCinematicEffect(
    'pro-cine-royal-gold', 'Royal Golden', 'Majestic golden tone highlight grade.', Palette,
    { goldenGlow: 0.22 },
    [{ name: 'Glow Factor', key: 'goldenGlow', type: 'number', min: 0.05, max: 0.8, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `sepia(${params.goldenGlow}) brightness(1.04) saturate(1.1)`;
    },
    ['eq=saturation=1.1']
  ),
  createCinematicEffect(
    'pro-cine-matrix-green', 'Matrix Green', 'Iconic green shadow tint mimicking sci-fi look.', Eye,
    { greenHue: 1.2 },
    [{ name: 'Green Factor', key: 'greenHue', type: 'number', min: 0.5, max: 2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `hue-rotate(45deg) saturate(0.9)`;
    },
    ['hue=h=45,eq=saturation=0.9']
  ),
  createCinematicEffect(
    'pro-cine-emerald', 'Emerald Forest', 'Rich green foliage color boost styling.', Palette,
    { foliageBoost: 1.15 },
    [{ name: 'Foliage Boost', key: 'foliageBoost', type: 'number', min: 0.8, max: 1.6, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `hue-rotate(15deg) saturate(${params.foliageBoost})`;
    },
    ['hue=h=15,eq=saturation=1.15']
  ),
  createCinematicEffect(
    'pro-cine-lavender', 'Lavender twilight', 'Magical sunset violet/lavender tint.', Sparkles,
    { purpleShift: 1.1 },
    [{ name: 'Purple Shift', key: 'purpleShift', type: 'number', min: 0.5, max: 2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `hue-rotate(-40deg) saturate(1.08)`;
    },
    ['hue=h=-40']
  ),
  createCinematicEffect(
    'pro-cine-faded-log', 'Faded Log', 'Simulates flat cinematic raw camera log footage.', Film,
    { fade: 0.35 },
    [{ name: 'Fade Level', key: 'fade', type: 'number', min: 0.1, max: 0.8, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `brightness(1.08) contrast(${1 - params.fade}) saturate(0.8)`;
    },
    ['eq=brightness=1.08:contrast=0.65:saturation=0.8']
  ),
  createCinematicEffect(
    'pro-cine-high-key', 'High-Key Light', 'Ultra-bright, soft glowing style.', Sun,
    { brightness: 1.25, contrast: 0.85 },
    [{ name: 'Brightness', key: 'brightness', type: 'number', min: 1, max: 1.5, step: 0.05 }, { name: 'Contrast', key: 'contrast', type: 'number', min: 0.6, max: 1.2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `brightness(${params.brightness}) contrast(${params.contrast})`;
    },
    ['eq=brightness=1.25:contrast=0.85']
  ),
  createCinematicEffect(
    'pro-cine-low-key', 'Low-Key Drama', 'Dark moody aesthetic emphasizing dramatic shadows.', Moon,
    { brightness: 0.78, contrast: 1.35 },
    [{ name: 'Brightness', key: 'brightness', type: 'number', min: 0.5, max: 1, step: 0.05 }, { name: 'Contrast', key: 'contrast', type: 'number', min: 1, max: 1.8, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `brightness(${params.brightness}) contrast(${params.contrast})`;
    },
    ['eq=brightness=0.78:contrast=1.35']
  ),
  createCinematicEffect(
    'pro-cine-documentary', 'Documentary Matte', 'Muted real-life color palette optimal for journalism.', Eye,
    { contrast: 0.95, saturation: 0.78 },
    [{ name: 'Contrast', key: 'contrast', type: 'number', min: 0.7, max: 1.3, step: 0.05 }, { name: 'Saturation', key: 'saturation', type: 'number', min: 0.4, max: 1.2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `contrast(${params.contrast}) saturate(${params.saturation})`;
    },
    ['eq=contrast=0.95:saturation=0.78']
  ),
  createCinematicEffect(
    'pro-cine-indie-film', 'Indie Film', 'Artistic cool shadows with slight warm highlight split.', Clapperboard,
    { shadowCool: 1.1 },
    [{ name: 'Cool shadows', key: 'shadowCool', type: 'number', min: 0.5, max: 2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `hue-rotate(5deg) saturate(1.05)`;
    },
    ['hue=h=5']
  ),
  createCinematicEffect(
    'pro-cine-silver-screen', 'Silver Screen', 'Classic glowing silver grey-scale monochrome.', Film,
    { contrast: 1.25, glow: 1.15 },
    [{ name: 'Contrast', key: 'contrast', type: 'number', min: 0.9, max: 1.8, step: 0.05 }, { name: 'Glow Boost', key: 'glow', type: 'number', min: 1, max: 1.5, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `grayscale(1) contrast(${params.contrast}) brightness(1.05)`;
    },
    ['eq=contrast=1.25:saturation=0']
  )
];
