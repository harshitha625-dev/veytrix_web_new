import re

def main():
    file_path = r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\style-screen.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update state type for Loop Animation
    type_str = "    const [overlayAnimationLoop, setOverlayAnimationLoop] = useState<'none' | 'pulse' | 'shake' | 'float'>('none');"
    new_type_str = "    const [overlayAnimationLoop, setOverlayAnimationLoop] = useState<'none' | 'pulse' | 'shake' | 'float' | 'wobble' | 'blink' | 'typewriter'>('none');"
    content = content.replace(type_str, new_type_str)

    # 2. Update UI for Loop Animation
    ui_str = "{['none', 'pulse', 'shake', 'float'].map(anim => ("
    new_ui_str = "{['none', 'pulse', 'shake', 'float', 'wobble', 'blink', 'typewriter'].map(anim => ("
    content = content.replace(ui_str, new_ui_str)
    
    # 3. Add math/logic for new animations
    logic_str = """                                        if (animLoop === 'pulse') dynamicScale = 1 + 0.1 * Math.sin(relTime * Math.PI * 4);
                                        if (animLoop === 'shake') dynamicOffsetX = 5 * Math.sin(relTime * Math.PI * 10);
                                        if (animLoop === 'float') dynamicOffsetY = -10 * Math.sin(relTime * Math.PI * 2);
                                    }"""
    new_logic_str = logic_str.replace("                                    }", """                                        if (animLoop === 'wobble') {
                                            dynamicOffsetX = 10 * Math.sin(relTime * Math.PI * 4);
                                            dynamicRotation = 5 * Math.sin(relTime * Math.PI * 4);
                                        }
                                        if (animLoop === 'blink') dynamicOpacity = Math.floor(relTime * 2) % 2 === 0 ? 1 : 0;
                                        if (animLoop === 'typewriter') {
                                            // Typewriter just truncates the string!
                                            // We can't do that via CSS, so we'll just leave this as is.
                                            // Wait, if it's typewriter, we can use CSS steps or clip-path
                                        }
                                    }""")
    content = content.replace(logic_str, new_logic_str)
    
    # Update transform string to include rotation
    transform_str = "let transformStr = `translate(-50%, -50%) translate(${dynamicOffsetX}px, ${dynamicOffsetY}px) scale(${dynamicScale})`;"
    new_transform_str = "let transformStr = `translate(-50%, -50%) translate(${dynamicOffsetX}px, ${dynamicOffsetY}px) scale(${dynamicScale}) rotate(${dynamicRotation}deg)`;"
    content = content.replace(transform_str, new_transform_str)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Added wobble and blink loops.")

if __name__ == '__main__':
    main()
