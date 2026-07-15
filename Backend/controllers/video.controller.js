import logger from "../utils/logger.js";

const toErrorMessage = (value, fallback = "Unexpected error") => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message || fallback;
  return String(value);
};

export const generateSceneImages = async (req, res) => {
  res.status(404).json({ success: false, error: "Scene image generation is no longer available" });
};

export const generateCinematicVideo = async (req, res) => {
  res.status(404).json({ success: false, error: "Cinematic video generation is no longer available" });
};
