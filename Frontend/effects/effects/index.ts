import { cameraExtraEffectsList } from './camera/cameraPackExtra';
import { blurExtraEffectsList } from './blur/blurPackExtra';
import { cinematicExtraEffectsList } from './cinematic/cinematicPackExtra';
import { distortionExtraEffectsList } from './distortion/distortionPackExtra';
import { glitchExtraEffectsList } from './glitch/glitchPackExtra';
import { extraPacksMegaList } from './extraPacksMega';
import { extraPacksSuperList } from './extraPacksSuper';
import { professionalFiltersList } from '../../filters/professionalFilters';
import { extraProfessionalFiltersList } from '../../filters/extraProfessionalFilters';
import { productionCameraEffectsList } from './camera/productionCameraEffects';
import { productionCinematicEffectsList } from './cinematic/productionCinematicEffects';
import { productionRetroEffectsList } from './retro/productionRetroEffects';
import { productionLightEffectsList } from './light/productionLightEffects';
import { productionBlurEffectsList } from './blur/productionBlurEffects';
import { productionDistortionEffectsList } from './distortion/productionDistortionEffects';
import { productionGlitchEffectsList } from './glitch/productionGlitchEffects';
import { productionMotionEffectsList } from './motion/productionMotionEffects';
import { smoothZoom } from './camera/smoothZoom';
import { hyperZoom } from './camera/hyperZoom';
import { beatShake } from './camera/beatShake';
import { cameraFlash } from './camera/cameraFlash';
import { speedRamp } from './camera/speedRamp';
import { gaussianBlur } from './blur/gaussianBlur';
import { motionBlur } from './blur/motionBlur';
import { zoomBlur } from './blur/zoomBlur';
import { dreamBlur } from './blur/dreamBlur';
import { rgbSplit } from './glitch/rgbSplit';
import { chromaticAberration } from './glitch/chromaticAberration';
import { vhs } from './glitch/vhs';
import { crtScreen } from './glitch/crtScreen';
import { filmGrain } from './cinematic/filmGrain';
import { dustOverlay } from './cinematic/dustOverlay';
import { filmBurn } from './cinematic/filmBurn';
import { lightLeak } from './cinematic/lightLeak';
import { glow } from './cinematic/glow';
import { bloom } from './cinematic/bloom';
import { vintageFilm } from './cinematic/vintageFilm';
import { cinematicLUT } from './cinematic/cinematicLUT';
import { blackWhite } from './cinematic/blackWhite';
import { sepia } from './cinematic/sepia';
import { ripple } from './distortion/ripple';
import { heatWave } from './distortion/heatWave';
import { waveDistortion } from './distortion/waveDistortion';
import { fisheye } from './distortion/fisheye';
import { pixelate } from './distortion/pixelate';
import { mirror } from './distortion/mirror';
import { kaleidoscope } from './distortion/kaleidoscope';

// CAMERA PACK (31-40)
import { dynamicZoom } from './camera/dynamicZoom';
import { snapZoom } from './camera/snapZoom';
import { elasticZoom } from './camera/elasticZoom';
import { pulseZoom } from './camera/pulseZoom';
import { cinematicZoom } from './camera/cinematicZoom';
import { dollyZoom } from './camera/dollyZoom';
import { cameraPush } from './camera/cameraPush';
import { cameraPull } from './camera/cameraPull';
import { orbitCamera } from './camera/orbitCamera';
import { handheldCamera } from './camera/handheldCamera';

// MOTION PACK (41-50)
import { float } from './motion/float';
import { drift } from './motion/drift';
import { swing } from './motion/swing';
import { bounce } from './motion/bounce';
import { jello } from './motion/jello';
import { wobble } from './motion/wobble';
import { elasticMotion } from './motion/elasticMotion';
import { freezeFrame } from './motion/freezeFrame';
import { ghostTrail } from './motion/ghostTrail';
import { echoMotion } from './motion/echoMotion';

// LIGHT PACK (51-60)
import { goldenGlow } from './light/goldenGlow';
import { neonGlow } from './light/neonGlow';
import { aurora } from './light/aurora';
import { softLight } from './light/softLight';
import { spotlight } from './light/spotlight';
import { lensFlare } from './light/lensFlare';
import { rainbowLight } from './light/rainbowLight';
import { prism } from './light/prism';
import { reflection } from './light/reflection';
import { halo } from './light/halo';

// DISTORTION PACK (61-70)
import { bulge } from './distortion/bulge';
import { pinch } from './distortion/pinch';
import { twirl } from './distortion/twirl';
import { swirl } from './distortion/swirl';
import { glass } from './distortion/glass';
import { crystal } from './distortion/crystal';
import { liquid } from './distortion/liquid';
import { melt } from './distortion/melt';
import { stretch } from './distortion/stretch';
import { tunnel } from './distortion/tunnel';

// RETRO PACK (71-80)
import { super8Film } from './retro/super8Film';
import { sixteenMmFilm } from './retro/sixteenMmFilm';
import { oldCamera } from './retro/oldCamera';
import { tapeNoise } from './retro/tapeNoise';
import { analogTV } from './retro/analogTV';
import { silentMovie } from './retro/silentMovie';
import { retroCamera } from './retro/retroCamera';
import { dustScratches } from './retro/dustScratches';
import { homeVideo } from './retro/homeVideo';
import { disposableCamera } from './retro/disposableCamera';

// ==========================================
// NEW PACK: RGB & GLITCH PACK (81-100)
// ==========================================
import {
  rgbWave, rgbFlash, rgbTrail, rgbEcho, rgbOffset, rgbPulse, rgbNoise, rgbSpin,
  rgbExplosion, rgbRipple, rgbDistortion, rgbMelt, rgbStretch, rgbGhost, rgbZoom,
  rgbMirror, rgbPrism, rgbHologram, rgbDigitalNoise, rgbSplitAdvanced
} from './glitch/rgbPack';

// ==========================================
// NEW PACK: DIGITAL GLITCH PACK (101-120)
// ==========================================
import {
  digitalGlitch, cyberGlitch, screenTear, dataCorruption, pixelGlitch, digitalMelt,
  signalLoss, tvStatic, scanlines, matrix, hacker, terminal, binaryRain,
  compressionArtifact, vhsDistortion, crtDistortion, analogNoise, tapeDamage,
  badTV, brokenDisplay
} from './glitch/digitalGlitchPack';

// ==========================================
// NEW PACK: LIGHT PACK (121-140)
// ==========================================
import {
  goldenHour, sunsetGlow, moonlight, sunrise, neonPink, neonBlue, neonPurple,
  electricGlow, fireGlow, iceGlow, rainbowGlow, magicSpark, glitter, starShine,
  softBloom, hardBloom, studioLight, stageLight, clubLight, auroraLights
} from './light/lightPack';

// ==========================================
// NEW PACK: DISTORTION PACK (141-160)
// ==========================================
import {
  spiral, blackHole, portal, tornado, wind, smokeWarp, inkFlow, waterSurface,
  oceanWave, lavaFlow, jelly, rubber, stretchX, stretchY, flipWarp, fold,
  bubble, crystalGlass, diamond, liquidGlass
} from './distortion/distortionPack';

// ==========================================
// NEW PACK: RETRO PACK (161-180)
// ==========================================
import {
  vintageCamera, polaroid, kodakFilm, fujiFilm, canonLook, sonyLook, cinemaFilm,
  projector, filmRoll, dustFilm, scratches, burnEdges, vhsTape, homeCamcorder,
  oldTV, retroGaming, gameBoy, vhsCam, super8, noirFilm
} from './retro/retroPack';

export { type EffectModule } from './types';

const effectsRegistry: Record<string, any> = {
  'pro-smooth-zoom': smoothZoom,
  'pro-hyper-zoom': hyperZoom,
  'pro-beat-shake': beatShake,
  'pro-camera-flash': cameraFlash,
  'pro-speed-ramp': speedRamp,
  'pro-gaussian-blur': gaussianBlur,
  'pro-motion-blur': motionBlur,
  'pro-zoom-blur': zoomBlur,
  'pro-dream-blur': dreamBlur,
  'pro-rgb-split': rgbSplit,
  'pro-chromatic-aberration': chromaticAberration,
  'pro-vhs': vhs,
  'pro-crt-screen': crtScreen,
  'pro-film-grain': filmGrain,
  'pro-dust-overlay': dustOverlay,
  'pro-film-burn': filmBurn,
  'pro-light-leak': lightLeak,
  'pro-glow': glow,
  'pro-bloom': bloom,
  'pro-vintage-film': vintageFilm,
  'pro-cinematic-lut': cinematicLUT,
  'pro-black-white': blackWhite,
  'pro-sepia': sepia,
  'pro-ripple': ripple,
  'pro-heat-wave': heatWave,
  'pro-wave-distortion': waveDistortion,
  'pro-fisheye': fisheye,
  'pro-pixelate': pixelate,
  'pro-mirror': mirror,
  'pro-kaleidoscope': kaleidoscope,

  // CAMERA PACK (31-40)
  'pro-dynamic-zoom': dynamicZoom,
  'pro-snap-zoom': snapZoom,
  'pro-elastic-zoom': elasticZoom,
  'pro-pulse-zoom': pulseZoom,
  'pro-cinematic-zoom': cinematicZoom,
  'pro-dolly-zoom': dollyZoom,
  'pro-camera-push': cameraPush,
  'pro-camera-pull': cameraPull,
  'pro-orbit-camera': orbitCamera,
  'pro-handheld-camera': handheldCamera,

  // MOTION PACK (41-50)
  'pro-float': float,
  'pro-drift': drift,
  'pro-swing': swing,
  'pro-bounce': bounce,
  'pro-jello': jello,
  'pro-wobble': wobble,
  'pro-elastic-motion': elasticMotion,
  'pro-freeze-frame': freezeFrame,
  'pro-ghost-trail': ghostTrail,
  'pro-echo-motion': echoMotion,

  // LIGHT PACK (51-60)
  'pro-golden-glow': goldenGlow,
  'pro-neon-glow': neonGlow,
  'pro-aurora': aurora,
  'pro-soft-light': softLight,
  'pro-spotlight': spotlight,
  'pro-lens-flare': lensFlare,
  'pro-rainbow-light': rainbowLight,
  'pro-prism': prism,
  'pro-reflection': reflection,
  'pro-halo': halo,

  // DISTORTION PACK (61-70)
  'pro-bulge': bulge,
  'pro-pinch': pinch,
  'pro-twirl': twirl,
  'pro-swirl': swirl,
  'pro-glass': glass,
  'pro-crystal': crystal,
  'pro-liquid': liquid,
  'pro-melt': melt,
  'pro-stretch': stretch,
  'pro-tunnel': tunnel,

  // RETRO PACK (71-80)
  'pro-super8-film': super8Film,
  'pro-16mm-film': sixteenMmFilm,
  'pro-old-camera': oldCamera,
  'pro-tape-noise': tapeNoise,
  'pro-analog-tv': analogTV,
  'pro-silent-movie': silentMovie,
  'pro-retro-camera': retroCamera,
  'pro-dust-scratches': dustScratches,
  'pro-home-video': homeVideo,
  'pro-disposable-camera': disposableCamera,

  // RGB & GLITCH (81-100)
  'pro-rgb-wave': rgbWave,
  'pro-rgb-flash': rgbFlash,
  'pro-rgb-trail': rgbTrail,
  'pro-rgb-echo': rgbEcho,
  'pro-rgb-offset': rgbOffset,
  'pro-rgb-pulse': rgbPulse,
  'pro-rgb-noise': rgbNoise,
  'pro-rgb-spin': rgbSpin,
  'pro-rgb-explosion': rgbExplosion,
  'pro-rgb-ripple': rgbRipple,
  'pro-rgb-distortion': rgbDistortion,
  'pro-rgb-melt': rgbMelt,
  'pro-rgb-stretch': rgbStretch,
  'pro-rgb-ghost': rgbGhost,
  'pro-rgb-zoom': rgbZoom,
  'pro-rgb-mirror': rgbMirror,
  'pro-rgb-prism': rgbPrism,
  'pro-rgb-hologram': rgbHologram,
  'pro-rgb-digital-noise': rgbDigitalNoise,
  'pro-rgb-split-advanced': rgbSplitAdvanced,

  // DIGITAL GLITCH (101-120)
  'pro-digital-glitch': digitalGlitch,
  'pro-cyber-glitch': cyberGlitch,
  'pro-screen-tear': screenTear,
  'pro-data-corruption': dataCorruption,
  'pro-pixel-glitch': pixelGlitch,
  'pro-digital-melt': digitalMelt,
  'pro-signal-loss': signalLoss,
  'pro-tv-static': tvStatic,
  'pro-scanlines': scanlines,
  'pro-matrix': matrix,
  'pro-hacker': hacker,
  'pro-terminal': terminal,
  'pro-binary-rain': binaryRain,
  'pro-compression-artifact': compressionArtifact,
  'pro-vhs-distortion': vhsDistortion,
  'pro-crt-distortion': crtDistortion,
  'pro-analog-noise': analogNoise,
  'pro-tape-damage': tapeDamage,
  'pro-bad-tv': badTV,
  'pro-broken-display': brokenDisplay,

  // LIGHT (121-140)
  'pro-golden-hour': goldenHour,
  'pro-sunset-glow': sunsetGlow,
  'pro-moonlight': moonlight,
  'pro-sunrise': sunrise,
  'pro-neon-pink': neonPink,
  'pro-neon-blue': neonBlue,
  'pro-neon-purple': neonPurple,
  'pro-electric-glow': electricGlow,
  'pro-fire-glow': fireGlow,
  'pro-ice-glow': iceGlow,
  'pro-rainbow-glow': rainbowGlow,
  'pro-magic-spark': magicSpark,
  'pro-glitter': glitter,
  'pro-star-shine': starShine,
  'pro-soft-bloom': softBloom,
  'pro-hard-bloom': hardBloom,
  'pro-studio-light': studioLight,
  'pro-stage-light': stageLight,
  'pro-club-light': clubLight,
  'pro-aurora-lights': auroraLights,

  // DISTORTION (141-160)
  'pro-spiral': spiral,
  'pro-black-hole': blackHole,
  'pro-portal': portal,
  'pro-tornado': tornado,
  'pro-wind-distortion': wind,
  'pro-smoke-warp': smokeWarp,
  'pro-ink-flow': inkFlow,
  'pro-water-surface': waterSurface,
  'pro-ocean-wave': oceanWave,
  'pro-lava-flow': lavaFlow,
  'pro-jelly': jelly,
  'pro-rubber': rubber,
  'pro-stretch-x': stretchX,
  'pro-stretch-y': stretchY,
  'pro-flip-warp': flipWarp,
  'pro-fold': fold,
  'pro-bubble': bubble,
  'pro-crystal-glass': crystalGlass,
  'pro-diamond': diamond,
  'pro-liquid-glass': liquidGlass,

  // RETRO (161-180)
  'pro-vintage-camera': vintageCamera,
  'pro-polaroid': polaroid,
  'pro-kodak-film': kodakFilm,
  'pro-fuji-film': fujiFilm,
  'pro-canon-look': canonLook,
  'pro-sony-look': sonyLook,
  'pro-cinema-film': cinemaFilm,
  'pro-projector': projector,
  'pro-film-roll': filmRoll,
  'pro-dust-film': dustFilm,
  'pro-scratches': scratches,
  'pro-burn-edges': burnEdges,
  'pro-vhs-tape': vhsTape,
  'pro-home-camcorder': homeCamcorder,
  'pro-old-tv': oldTV,
  'pro-retro-gaming': retroGaming,
  'pro-gameboy': gameBoy,
  'pro-vhs-cam': vhsCam,
  'pro-super-8': super8,
  'pro-noir-film': noirFilm,
};

// Auto-register all 320 extra effects dynamically
const extraPacksList = [
  ...cameraExtraEffectsList,
  ...blurExtraEffectsList,
  ...cinematicExtraEffectsList,
  ...distortionExtraEffectsList,
  ...glitchExtraEffectsList,
  ...extraPacksMegaList,
  ...extraPacksSuperList,
  ...professionalFiltersList,
  ...extraProfessionalFiltersList,
  ...productionCameraEffectsList,
  ...productionCinematicEffectsList,
  ...productionRetroEffectsList,
  ...productionLightEffectsList,
  ...productionBlurEffectsList,
  ...productionDistortionEffectsList,
  ...productionGlitchEffectsList,
  ...productionMotionEffectsList
];

extraPacksList.forEach((eff) => {
  effectsRegistry[eff.id] = eff;
});

export const getEffectModule = (id: string) => {
  return effectsRegistry[id] || null;
};

export const getEffectsByCategory = (category: string) => {
  return Object.values(effectsRegistry).filter(eff => eff.category === category);
};

export const getAllProEffects = () => {
  return Object.values(effectsRegistry);
};
