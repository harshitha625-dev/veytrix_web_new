import { useState, useCallback } from 'react';
import { removeBackground } from '@imgly/background-removal';

// Global cache of mask URLs by clip ID
const maskCache = new Map<string, string>();

const extractVideoFrame = (videoUrl: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = videoUrl;
        video.crossOrigin = 'anonymous';
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;

        // Set a timeout to prevent hanging forever
        const timeout = setTimeout(() => {
            video.src = '';
            video.load();
            reject(new Error('Video frame extraction timed out'));
        }, 10000);

        video.onloadedmetadata = () => {
            video.currentTime = Math.min(1, video.duration / 2);
        };

        video.onseeked = () => {
            clearTimeout(timeout);
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get 2d context for video frame extraction'));
                    return;
                }
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to convert canvas to blob'));
                    }
                    video.src = '';
                    video.load();
                }, 'image/png');
            } catch (err) {
                reject(err);
            }
        };

        video.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Failed to load video for frame extraction'));
        };
    });
};

export const useCutoutMask = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateMask = useCallback(async (clipId: string, type: 'video' | 'image', previewUrl: string, file: File | null): Promise<string | null> => {
        if (maskCache.has(clipId)) {
            return maskCache.get(clipId) || null;
        }

        setIsProcessing(true);
        setError(null);

        try {
            let inputSource: Blob | File | string = file || previewUrl;

            // If it's a video, extract a representative frame
            if (type === 'video') {
                inputSource = await extractVideoFrame(previewUrl);
            }

            // Run background removal
            const resultBlob = await removeBackground(inputSource, {
                progress: (key, current, total) => {
                    console.log(`[AI Cutout] ${key}: ${Math.round((current / total) * 100)}%`);
                }
            });

            // Convert the result blob to an object URL
            const maskUrl = URL.createObjectURL(resultBlob);
            maskCache.set(clipId, maskUrl);
            setIsProcessing(false);
            return maskUrl;
        } catch (err: any) {
            console.error('[AI Cutout Error]', err);
            setError(err?.message || 'Failed to remove background');
            setIsProcessing(false);
            return null;
        }
    }, []);

    const clearMaskCache = useCallback((clipId?: string) => {
        if (clipId) {
            const url = maskCache.get(clipId);
            if (url) URL.revokeObjectURL(url);
            maskCache.delete(clipId);
        } else {
            maskCache.forEach((url) => URL.revokeObjectURL(url));
            maskCache.clear();
        }
    }, []);

    return {
        generateMask,
        isProcessing,
        error,
        clearMaskCache,
        maskCache
    };
};
