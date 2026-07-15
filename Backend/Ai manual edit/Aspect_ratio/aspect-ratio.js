/**
 * Aspectratio.js
 * Backend utility for generating FFmpeg filter arguments to
 * crop or scale video to a target aspect ratio.
 */

"use strict";

/**
 * All supported preset aspect ratios mapped to [width, height] units.
 * @type {Record<string, [number, number]>}
 */
const PRESETS = {
  "16:9":  [16, 9],
  "9:16":  [9, 16],
  "4:3":   [4, 3],
  "3:4":   [3, 4],
  "1:1":   [1, 1],
  "4:5":   [4, 5],
  "21:9":  [21, 9],
};

/**
 * Parse an aspect ratio string like "16:9" or "4:3" into a decimal.
 * @param {string} ratioStr
 * @returns {number}
 */
function parseRatio(ratioStr) {
  if (typeof ratioStr !== "string") {
    throw new TypeError(`Expected a ratio string, got ${typeof ratioStr}`);
  }
  const parts = ratioStr.split(":");
  if (parts.length !== 2) {
    throw new Error(`Invalid ratio format: "${ratioStr}". Expected "W:H".`);
  }
  const [w, h] = parts.map(Number);
  if (!w || !h || isNaN(w) || isNaN(h)) {
    throw new Error(`Invalid ratio values: "${ratioStr}".`);
  }
  return w / h;
}

/**
 * Build an FFmpeg `crop` filter string that crops the video to the
 * target aspect ratio without scaling (preserves original resolution).
 *
 * @param {number} srcWidth   - Source video width in pixels
 * @param {number} srcHeight  - Source video height in pixels
 * @param {string|number} targetRatio - e.g. "16:9" or a decimal like 1.7778
 * @returns {{ filter: string, outWidth: number, outHeight: number }}
 */
function buildCropFilter(srcWidth, srcHeight, targetRatio) {
  const ratio = typeof targetRatio === "string"
    ? parseRatio(targetRatio)
    : targetRatio;

  const srcRatio = srcWidth / srcHeight;
  let outWidth, outHeight;

  if (srcRatio > ratio) {
    // Source is wider — crop sides
    outHeight = srcHeight;
    outWidth  = Math.floor(srcHeight * ratio);
    // Ensure even numbers for codec compatibility
    outWidth  = outWidth % 2 === 0 ? outWidth : outWidth - 1;
  } else {
    // Source is taller — crop top/bottom
    outWidth  = srcWidth;
    outHeight = Math.floor(srcWidth / ratio);
    outHeight = outHeight % 2 === 0 ? outHeight : outHeight - 1;
  }

  const x = Math.floor((srcWidth  - outWidth)  / 2);
  const y = Math.floor((srcHeight - outHeight) / 2);

  return {
    filter: `crop=${outWidth}:${outHeight}:${x}:${y}`,
    outWidth,
    outHeight,
  };
}

/**
 * Build an FFmpeg `scale` + `pad` filter string that fits the video
 * inside the target ratio by adding letterbox/pillarbox bars.
 *
 * @param {number} srcWidth
 * @param {number} srcHeight
 * @param {string|number} targetRatio
 * @param {string} [padColor="black"]
 * @returns {{ filter: string, outWidth: number, outHeight: number }}
 */
function buildPadFilter(srcWidth, srcHeight, targetRatio, padColor = "black") {
  const ratio = typeof targetRatio === "string"
    ? parseRatio(targetRatio)
    : targetRatio;

  const srcRatio = srcWidth / srcHeight;
  let scaleW, scaleH;

  if (srcRatio > ratio) {
    // Source wider than target — fit by width, pad top/bottom
    scaleW = srcWidth;
    scaleH = Math.floor(srcWidth / ratio);
    scaleH = scaleH % 2 === 0 ? scaleH : scaleH + 1;
  } else {
    // Source taller than target — fit by height, pad sides
    scaleH = srcHeight;
    scaleW = Math.floor(srcHeight * ratio);
    scaleW = scaleW % 2 === 0 ? scaleW : scaleW + 1;
  }

  const padX = Math.floor((scaleW - srcWidth)  / 2);
  const padY = Math.floor((scaleH - srcHeight) / 2);

  const filter = [
    `scale=${srcWidth}:${srcHeight}`,
    `pad=${scaleW}:${scaleH}:${padX}:${padY}:${padColor}`,
  ].join(",");

  return { filter, outWidth: scaleW, outHeight: scaleH };
}

/**
 * Get a list of all supported preset ratio strings.
 * @returns {string[]}
 */
function getSupportedPresets() {
  return Object.keys(PRESETS);
}

/**
 * Validate whether a ratio string is a known preset.
 * @param {string} ratioStr
 * @returns {boolean}
 */
function isPreset(ratioStr) {
  return Object.prototype.hasOwnProperty.call(PRESETS, ratioStr);
}

module.exports = {
  PRESETS,
  parseRatio,
  buildCropFilter,
  buildPadFilter,
  getSupportedPresets,
  isPreset,
};
