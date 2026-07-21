import re

def main():
    file_path = r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\style-screen.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. We need to replace the single overlayText render with a map over active text clips.
    # We find:
    # {overlayText.trim().length > 0 && (
    #     <div ...
    #     </div>
    # )}
    
    # We will replace it with rendering active text clips from mediaItems.
    
    old_overlay_render = """                                {overlayText.trim().length > 0 && (
                                    <div
                                        className="absolute z-40 pointer-events-none select-none text-center"
                                        style={{
                                            left: `${overlayPosX}%`,
                                            top: `${overlayPosY}%`,
                                            transform: overlayTextStylePreset === 'motion-tracking-text'
                                                ? `translate(-50%, -50%) translateX(${Math.sin((progress / 100) * Math.PI * 2) * 12}px)`
                                                : 'translate(-50%, -50%)',
                                            maxWidth: '88%',
                                            ...getOverlayTextStylePresetCss(overlayTextStylePreset),
                                            background: overlayBgEnabled ? `${overlayBgColorHex}cc` : getOverlayTextStylePresetCss(overlayTextStylePreset).background,
                                            padding: overlayBgEnabled ? '4px 12px' : getOverlayTextStylePresetCss(overlayTextStylePreset).padding,
                                            borderRadius: overlayBgEnabled ? '6px' : getOverlayTextStylePresetCss(overlayTextStylePreset).borderRadius,
                                        }}
                                    >
                                        {overlayText}
                                    </div>
                                )}"""

    new_overlay_render = """                                {mediaItems.filter((clip: any) => clip.type === 'text' || clip.type === 'overlay').map((clip: any) => {
                                    // Use clipSettings if they exist, otherwise fallback to global state if it's the active clip (for backward compat during transition)
                                    const isCurrent = clip.id === activePreviewId;
                                    const settings = clipSettings[clip.id] || {};
                                    const text = settings.overlayText !== undefined ? settings.overlayText : (isCurrent ? overlayText : '');
                                    if (!text || text.trim().length === 0) return null;
                                    
                                    // Check if active
                                    const start = clipStartOverrides[clip.id] ?? 0;
                                    const dur = clip.duration || 5;
                                    const isActive = globalCurrentTime >= start && globalCurrentTime <= start + dur;
                                    if (!isActive) return null;

                                    const posX = settings.overlayPosX ?? (isCurrent ? overlayPosX : 50);
                                    const posY = settings.overlayPosY ?? (isCurrent ? overlayPosY : 50);
                                    const fontSize = settings.overlayFontSize ?? (isCurrent ? overlayFontSize : 48);
                                    const fontId = settings.overlayFontId || (isCurrent ? overlayFontId : 'rubik');
                                    const font = textFontOptions.find((f: any) => f.id === fontId)?.family || textFontOptions[0].family;
                                    const color = settings.overlayColor || (isCurrent ? overlayColor : '#FFFFFF');
                                    const isBold = settings.overlayTextStyleBold ?? (isCurrent ? overlayTextStyleBold : false);
                                    const isItalic = settings.overlayTextStyleItalic ?? (isCurrent ? overlayTextStyleItalic : false);
                                    const isUnderline = settings.overlayTextStyleUnderline ?? false;
                                    
                                    const hasBg = settings.overlayBgEnabled ?? (isCurrent ? overlayBgEnabled : false);
                                    const bgColor = settings.overlayBgColorHex || (isCurrent ? overlayBgColorHex : '#000000');
                                    const bgRadius = settings.overlayBgRadius ?? (isCurrent ? overlayBgRadius : 0);
                                    
                                    const hasStroke = settings.overlayStrokeEnabled ?? (isCurrent ? overlayStrokeEnabled : false);
                                    const strokeColor = settings.overlayStrokeColor || (isCurrent ? overlayStrokeColor : '#000000');
                                    
                                    const hasShadow = settings.overlayShadowEnabled ?? (isCurrent ? overlayShadowEnabled : false);
                                    const shadowColor = settings.overlayShadowColor || (isCurrent ? overlayShadowColor : '#000000');
                                    const shadowBlur = settings.overlayShadowBlur ?? (isCurrent ? overlayShadowBlur : 10);
                                    
                                    const letterSpacing = settings.overlayLetterSpacing ?? (isCurrent ? overlayLetterSpacing : 0);
                                    const lineSpacing = settings.overlayLineSpacing ?? (isCurrent ? overlayLineSpacing : 0);

                                    return (
                                        <div
                                            key={clip.id}
                                            className="absolute z-40 pointer-events-none select-none text-center"
                                            style={{
                                                left: `${posX}%`,
                                                top: `${posY}%`,
                                                transform: 'translate(-50%, -50%)',
                                                maxWidth: '88%',
                                                fontFamily: font,
                                                fontSize: `${fontSize}px`,
                                                color: color,
                                                fontWeight: isBold ? 'bold' : 'normal',
                                                fontStyle: isItalic ? 'italic' : 'normal',
                                                textDecoration: isUnderline ? 'underline' : 'none',
                                                letterSpacing: `${letterSpacing}px`,
                                                lineHeight: lineSpacing ? `${1 + (lineSpacing/100)}em` : 'normal',
                                                WebkitTextStroke: hasStroke ? `1.5px ${strokeColor}` : 'none',
                                                textShadow: hasShadow ? `2px 2px ${shadowBlur}px ${shadowColor}` : 'none',
                                                background: hasBg ? `${bgColor}cc` : 'transparent',
                                                padding: hasBg ? '4px 12px' : '0',
                                                borderRadius: hasBg ? `${bgRadius}px` : '0',
                                                whiteSpace: 'pre-wrap',
                                            }}
                                        >
                                            {text}
                                        </div>
                                    );
                                })}"""

    if old_overlay_render in content:
        content = content.replace(old_overlay_render, new_overlay_render)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Canvas overlay rendering updated successfully!")
    else:
        print("Could not find the exact old_overlay_render block.")

if __name__ == '__main__':
    main()
