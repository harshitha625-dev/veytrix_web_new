import { EyeOff, Eye, Wind, Sun, Compass, Sliders, Moon, ZoomIn } from 'lucide-react';
import { EffectModule } from '../types';

const createBlurEffect = (id: string, name: string, description: string, icon: any, defaultParams: any, adjustableParams: any[], renderer: any, ffmpegFilter: string[]): EffectModule => ({
  id,
  name,
  category: 'blur',
  icon,
  thumbnail: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=150&auto=format&fit=crop&q=60',
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

export const blurExtraEffectsList: EffectModule[] = [
  createBlurEffect(
    'pro-blur-bokeh', 'Bokeh Blur', 'Recreates beautiful circular out-of-focus camera light circles.', Sun,
    { radius: 10, count: 6 },
    [{ name: 'Bokeh Radius', key: 'radius', type: 'number', min: 2, max: 30, step: 1 }, { name: 'Circle Count', key: 'count', type: 'number', min: 2, max: 15, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.radius * 0.7}px) brightness(1.15)`;
    },
    ['boxblur=8:1']
  ),
  createBlurEffect(
    'pro-blur-radial-zoom', 'Radial Zoom Blur', 'Zoom-in burst blur expanding from canvas center.', ZoomIn,
    { strength: 12 },
    [{ name: 'Blur Strength', key: 'strength', type: 'number', min: 2, max: 40, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.strength * 0.4}px)`;
    },
    ['boxblur=10:1']
  ),
  createBlurEffect(
    'pro-blur-linear-motion', 'Linear Motion Blur', 'Horizontal directional motion blur simulating high speed panning.', Wind,
    { length: 15 },
    [{ name: 'Blur Length', key: 'length', type: 'number', min: 2, max: 50, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.length * 0.3}px)`;
    },
    ['boxblur=12:1']
  ),
  createBlurEffect(
    'pro-blur-prism', 'Prism Blur', 'Split color blur imitating a refractive glass prism.', Sliders,
    { strength: 10, offset: 4 },
    [{ name: 'Blur Strength', key: 'strength', type: 'number', min: 2, max: 30, step: 1 }, { name: 'Color Offset', key: 'offset', type: 'number', min: 1, max: 12, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.strength * 0.5}px)`;
    },
    ['boxblur=6:1']
  ),
  createBlurEffect(
    'pro-blur-misty', 'Misty Blur', 'Soft atmosphere bloom blur resembling morning mist.', Compass,
    { intensity: 14, opacity: 0.8 },
    [{ name: 'Mist Intensity', key: 'intensity', type: 'number', min: 2, max: 40, step: 1 }, { name: 'Opacity', key: 'opacity', type: 'number', min: 0.1, max: 1, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.intensity * 0.6}px)`;
      ctx.globalAlpha = params.opacity;
    },
    ['boxblur=9:1']
  ),
  createBlurEffect(
    'pro-blur-glow', 'Glow Blur', 'Dreamlike dream-glow filter overlay.', Sun,
    { intensity: 12, brightness: 1.25 },
    [{ name: 'Glow Intensity', key: 'intensity', type: 'number', min: 2, max: 30, step: 1 }, { name: 'Brightness', key: 'brightness', type: 'number', min: 1, max: 2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.intensity * 0.5}px) brightness(${params.brightness})`;
    },
    ['boxblur=7:1']
  ),
  createBlurEffect(
    'pro-blur-soft-iris', 'Soft Iris Blur', 'Radial vignette defocus leaving center focal point sharp.', Eye,
    { radius: 20 },
    [{ name: 'Focus Radius', key: 'radius', type: 'number', min: 5, max: 60, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(4px)`;
    },
    ['boxblur=4:1']
  ),
  createBlurEffect(
    'pro-blur-defocus', 'Lens Defocus', 'Professional high-aperture defocus blur.', Sliders,
    { size: 16 },
    [{ name: 'Defocus Size', key: 'size', type: 'number', min: 2, max: 45, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.size * 0.7}px)`;
    },
    ['boxblur=11:1']
  ),
  createBlurEffect(
    'pro-blur-milkyway', 'Milky Way Blur', 'Magical stardust noise blur style.', Moon,
    { density: 10, radius: 8 },
    [{ name: 'Stardust Density', key: 'density', type: 'number', min: 2, max: 30, step: 1 }, { name: 'Radius', key: 'radius', type: 'number', min: 2, max: 25, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.radius * 0.5}px) contrast(1.1)`;
    },
    ['boxblur=6:1']
  ),
  createBlurEffect(
    'pro-blur-fast-box', 'Fast Box Blur', 'High performance fast box blur.', EyeOff,
    { radius: 10 },
    [{ name: 'Radius', key: 'radius', type: 'number', min: 1, max: 50, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.radius}px)`;
    },
    ['boxblur=10:1']
  ),
  createBlurEffect(
    'pro-blur-spin', 'Spin Blur', 'Swirling spiral blur filter.', Compass,
    { angle: 0.1, radius: 10 },
    [{ name: 'Spin Angle', key: 'angle', type: 'number', min: 0.01, max: 0.5, step: 0.02 }, { name: 'Blur Radius', key: 'radius', type: 'number', min: 2, max: 30, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.radius * 0.4}px)`;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(params.angle);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    },
    ['boxblur=5:1']
  ),
  createBlurEffect(
    'pro-blur-horizontal', 'Horizontal Blur', 'Clean horizontal stretch blur.', Wind,
    { length: 20 },
    [{ name: 'Length', key: 'length', type: 'number', min: 2, max: 60, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.length * 0.3}px)`;
    },
    ['boxblur=10:1']
  ),
  createBlurEffect(
    'pro-blur-vertical', 'Vertical Blur', 'Clean vertical stretch blur.', Wind,
    { length: 20 },
    [{ name: 'Length', key: 'length', type: 'number', min: 2, max: 60, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.length * 0.3}px)`;
    },
    ['boxblur=10:1']
  ),
  createBlurEffect(
    'pro-blur-diagonal', 'Diagonal Blur', 'Angle-based directional motion blur.', Wind,
    { length: 18, angle: 45 },
    [{ name: 'Length', key: 'length', type: 'number', min: 2, max: 50, step: 1 }, { name: 'Angle', key: 'angle', type: 'number', min: 0, max: 360, step: 5 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.length * 0.4}px)`;
    },
    ['boxblur=8:1']
  ),
  createBlurEffect(
    'pro-blur-underwater', 'Underwater Blur', 'Wavy fluid refraction liquid blur.', Compass,
    { frequency: 2, waveBlur: 8 },
    [{ name: 'Wave Frequency', key: 'frequency', type: 'number', min: 0.5, max: 5, step: 0.1 }, { name: 'Wave Blur', key: 'waveBlur', type: 'number', min: 2, max: 25, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const currentBlur = params.waveBlur + Math.sin(time * params.frequency) * 3;
      ctx.filter = `blur(${currentBlur}px)`;
    },
    ['boxblur=6:1']
  ),
  createBlurEffect(
    'pro-blur-dreamy-glow', 'Dreamy Glow', 'Ethereal high-bloom dream-world glow blur.', Sun,
    { intensity: 25, saturation: 1.35 },
    [{ name: 'Intensity', key: 'intensity', type: 'number', min: 5, max: 50, step: 1 }, { name: 'Saturation', key: 'saturation', type: 'number', min: 1, max: 2, step: 0.05 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.intensity * 0.4}px) saturate(${params.saturation}) brightness(1.1)`;
    },
    ['boxblur=12:1']
  ),
  createBlurEffect(
    'pro-blur-starburst', 'Starburst Blur', 'Radiating lens starburst flares with micro-blur.', Sun,
    { beams: 8, radius: 10 },
    [{ name: 'Beams', key: 'beams', type: 'number', min: 4, max: 16, step: 1 }, { name: 'Radius', key: 'radius', type: 'number', min: 2, max: 30, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.radius * 0.5}px) contrast(1.15)`;
    },
    ['boxblur=5:1']
  ),
  createBlurEffect(
    'pro-blur-cross', 'Cross Blur', 'Two pass orthogonal cross blur grid.', Sliders,
    { radius: 12 },
    [{ name: 'Radius', key: 'radius', type: 'number', min: 2, max: 40, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.radius * 0.6}px)`;
    },
    ['boxblur=7:1']
  ),
  createBlurEffect(
    'pro-blur-zoom-pulse', 'Zoom Pulse', 'Pulsing radial zoom blur synced to rhythm speed.', ZoomIn,
    { frequency: 3, maxBlur: 16 },
    [{ name: 'Pulse Frequency', key: 'frequency', type: 'number', min: 0.5, max: 6, step: 0.1 }, { name: 'Max Blur', key: 'maxBlur', type: 'number', min: 2, max: 35, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      const currentBlur = Math.abs(Math.sin(time * params.frequency)) * params.maxBlur;
      ctx.filter = `blur(${currentBlur}px)`;
    },
    ['boxblur=8:1']
  ),
  createBlurEffect(
    'pro-blur-vignette', 'Vignette Blur', 'Soft dark blur focused around video frame margins.', Compass,
    { intensity: 15 },
    [{ name: 'Blur Intensity', key: 'intensity', type: 'number', min: 2, max: 40, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(3px)`;
    },
    ['boxblur=3:1']
  ),
  createBlurEffect(
    'pro-blur-ghost', 'Ghosting Blur', 'Leaves faded frame residue ghosting trails.', Eye,
    { density: 0.4, steps: 3 },
    [{ name: 'Ghost Density', key: 'density', type: 'number', min: 0.1, max: 0.9, step: 0.05 }, { name: 'Steps', key: 'steps', type: 'number', min: 1, max: 6, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(2px)`;
      ctx.globalAlpha = params.density;
    },
    ['boxblur=2:1']
  ),
  createBlurEffect(
    'pro-blur-aberration', 'Aberration Blur', 'Prismatic RGB dispersion aberration blur.', Sliders,
    { radius: 10, shift: 6 },
    [{ name: 'Radius', key: 'radius', type: 'number', min: 2, max: 30, step: 1 }, { name: 'RGB Shift', key: 'shift', type: 'number', min: 1, max: 15, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.radius * 0.4}px)`;
    },
    ['boxblur=5:1']
  ),
  createBlurEffect(
    'pro-blur-shimmer', 'Shimmer Blur', 'Sparkling glowing particles shimmering on highlights.', Sun,
    { speed: 2, shimmerScale: 12 },
    [{ name: 'Speed', key: 'speed', type: 'number', min: 0.5, max: 5, step: 0.1 }, { name: 'Shimmer Scale', key: 'shimmerScale', type: 'number', min: 2, max: 30, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(4px) brightness(1.1)`;
    },
    ['boxblur=4:1']
  ),
  createBlurEffect(
    'pro-blur-halo', 'Halo Blur', 'Glowing ring aura halo blur effect.', Moon,
    { ringWidth: 10, glowIntensity: 15 },
    [{ name: 'Ring Width', key: 'ringWidth', type: 'number', min: 2, max: 30, step: 1 }, { name: 'Glow Intensity', key: 'glowIntensity', type: 'number', min: 2, max: 40, step: 1 }],
    (ctx: any, video: any, params: any, time: number, canvas: any) => {
      ctx.filter = `blur(${params.glowIntensity * 0.5}px)`;
    },
    ['boxblur=8:1']
  )
];
