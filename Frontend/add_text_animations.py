import re

def main():
    file_path = r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\style-screen.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add state variables
    state_str = "    const [overlayLineSpacing, setOverlayLineSpacing] = useState(0);\n"
    new_state_str = state_str + "    const [overlayAnimationIn, setOverlayAnimationIn] = useState<'none' | 'fade' | 'slide-left' | 'zoom-in'>('none');\n"
    new_state_str += "    const [overlayAnimationOut, setOverlayAnimationOut] = useState<'none' | 'fade' | 'slide-right' | 'zoom-out'>('none');\n"
    new_state_str += "    const [overlayAnimationLoop, setOverlayAnimationLoop] = useState<'none' | 'pulse' | 'shake' | 'float'>('none');\n"
    content = content.replace(state_str, new_state_str)

    # 2. Add to textSubTab type definition
    type_str = "    const [textSubTab, setTextSubTab] = useState<'content' | 'fonts' | 'styles' | 'color' | 'align' | 'spacing' | 'transform'>('content');"
    new_type_str = "    const [textSubTab, setTextSubTab] = useState<'content' | 'fonts' | 'styles' | 'color' | 'align' | 'spacing' | 'transform' | 'animation'>('content');"
    content = content.replace(type_str, new_type_str)

    # 3. Add to sync effect (setClipSettings)
    sync_str = "overlayLineSpacing: overlayLineSpacing,"
    if sync_str in content:
        new_sync_str = sync_str + "\n            overlayAnimationIn: overlayAnimationIn,\n            overlayAnimationOut: overlayAnimationOut,\n            overlayAnimationLoop: overlayAnimationLoop,"
        content = content.replace(sync_str, new_sync_str)
        print("Updated sync for animations.")

    # 4. Add to load effect (setOverlay...)
    load_str = "setOverlayLineSpacing(settings.overlayLineSpacing ?? 0);"
    if load_str in content:
        new_load_str = load_str + "\n            setOverlayAnimationIn(settings.overlayAnimationIn ?? 'none');\n            setOverlayAnimationOut(settings.overlayAnimationOut ?? 'none');\n            setOverlayAnimationLoop(settings.overlayAnimationLoop ?? 'none');"
        content = content.replace(load_str, new_load_str)
        print("Updated load for animations.")
        
    # 5. Add to props for TextPropertiesPanel (at around line 6870 and 7420)
    # Just to be safe, we'll replace in two places
    panel_prop_str = "overlayLineSpacing={overlayLineSpacing} setOverlayLineSpacing={setOverlayLineSpacing}\n"
    new_panel_prop_str = panel_prop_str + """                                                        overlayAnimationIn={overlayAnimationIn} setOverlayAnimationIn={setOverlayAnimationIn}
                                                        overlayAnimationOut={overlayAnimationOut} setOverlayAnimationOut={setOverlayAnimationOut}
                                                        overlayAnimationLoop={overlayAnimationLoop} setOverlayAnimationLoop={setOverlayAnimationLoop}\n"""
    # this will replace it twice if it finds it twice
    content = content.replace(panel_prop_str, new_panel_prop_str)
    # The second one has different indentation
    panel_prop_str2 = "overlayLineSpacing={overlayLineSpacing} setOverlayLineSpacing={setOverlayLineSpacing}\n"
    new_panel_prop_str2 = panel_prop_str2 + """                                                                overlayAnimationIn={overlayAnimationIn} setOverlayAnimationIn={setOverlayAnimationIn}
                                                                overlayAnimationOut={overlayAnimationOut} setOverlayAnimationOut={setOverlayAnimationOut}
                                                                overlayAnimationLoop={overlayAnimationLoop} setOverlayAnimationLoop={setOverlayAnimationLoop}\n"""
    # actually replace is global in python so we just need to replace the exact string without relying on whitespace if possible
    content = re.sub(r'(overlayLineSpacing=\{overlayLineSpacing\} setOverlayLineSpacing=\{setOverlayLineSpacing\}\s*\n)', r'\1                                                        overlayAnimationIn={overlayAnimationIn} setOverlayAnimationIn={setOverlayAnimationIn}\n                                                        overlayAnimationOut={overlayAnimationOut} setOverlayAnimationOut={setOverlayAnimationOut}\n                                                        overlayAnimationLoop={overlayAnimationLoop} setOverlayAnimationLoop={setOverlayAnimationLoop}\n', content)

    # 6. Add tab to UI array
    tab_str = "{ id: 'transform', icon: <LucideIcons.Move className=\"w-4 h-4\" strokeWidth={1.5} /> }"
    new_tab_str = tab_str + ",\n                                { id: 'animation', icon: <LucideIcons.Play className=\"w-4 h-4\" strokeWidth={1.5} /> }"
    content = content.replace(tab_str, new_tab_str)

    # 7. Add UI for animation subtab
    ui_block = """                            {textSubTab === 'animation' && (
                                <div className="space-y-6 pb-12">
                                    <div className="text-center font-bold text-sm text-white mb-4 border-b border-white/10 pb-2">Animations</div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-slate-300">In Animation</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['none', 'fade', 'slide-left', 'zoom-in'].map(anim => (
                                                <button key={anim} onClick={() => setOverlayAnimationIn(anim)} className={`py-1.5 px-2 rounded border text-xs capitalize ${overlayAnimationIn === anim ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                    {anim.replace('-', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-slate-300">Out Animation</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['none', 'fade', 'slide-right', 'zoom-out'].map(anim => (
                                                <button key={anim} onClick={() => setOverlayAnimationOut(anim)} className={`py-1.5 px-2 rounded border text-xs capitalize ${overlayAnimationOut === anim ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                    {anim.replace('-', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-slate-300">Loop Animation</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['none', 'pulse', 'shake', 'float'].map(anim => (
                                                <button key={anim} onClick={() => setOverlayAnimationLoop(anim)} className={`py-1.5 px-2 rounded border text-xs capitalize ${overlayAnimationLoop === anim ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>
                                                    {anim}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
"""
    # Insert after transform subtab
    transform_tab = "                            {textSubTab === 'transform' && ("
    transform_end = "                            {textSubTab === 'text-to-speech' && ("
    if transform_end in content:
        content = content.replace(transform_end, ui_block + transform_end)
    else:
        # Fallback
        content = content.replace("                            {textSubTab === 'transform' && (", ui_block + "                            {textSubTab === 'transform' && (")

    # 8. Render animation effects inline
    render_start = r"                                    const lineSpacing = settings.overlayLineSpacing \?\? \(isCurrent \? overlayLineSpacing : 0\);"
    
    # We will inject computation right after lineSpacing
    render_inject = """                                    const lineSpacing = settings.overlayLineSpacing ?? (isCurrent ? overlayLineSpacing : 0);
                                    
                                    const animIn = settings.overlayAnimationIn ?? (isCurrent ? overlayAnimationIn : 'none');
                                    const animOut = settings.overlayAnimationOut ?? (isCurrent ? overlayAnimationOut : 'none');
                                    const animLoop = settings.overlayAnimationLoop ?? (isCurrent ? overlayAnimationLoop : 'none');
                                    
                                    let dynamicOpacity = 1;
                                    let dynamicScale = 1;
                                    let dynamicOffsetX = 0;
                                    let dynamicOffsetY = 0;
                                    let dynamicRotation = 0;
                                    
                                    const animDuration = 0.5; // half a second in/out
                                    const relTime = globalCurrentTime - start;
                                    const relTimeEnd = (start + dur) - globalCurrentTime;
                                    
                                    // In Animation
                                    if (relTime < animDuration) {
                                        const progress = relTime / animDuration; // 0 to 1
                                        if (animIn === 'fade') dynamicOpacity = progress;
                                        if (animIn === 'slide-left') { dynamicOpacity = progress; dynamicOffsetX = -50 * (1 - progress); }
                                        if (animIn === 'zoom-in') { dynamicOpacity = progress; dynamicScale = 0.5 + (0.5 * progress); }
                                    }
                                    
                                    // Out Animation
                                    if (relTimeEnd < animDuration && relTimeEnd >= 0) {
                                        const progress = relTimeEnd / animDuration; // 1 to 0
                                        if (animOut === 'fade') dynamicOpacity = progress;
                                        if (animOut === 'slide-right') { dynamicOpacity = progress; dynamicOffsetX = 50 * (1 - progress); }
                                        if (animOut === 'zoom-out') { dynamicOpacity = progress; dynamicScale = 0.5 + (0.5 * progress); }
                                    }
                                    
                                    // Loop Animation
                                    if (relTime >= animDuration && relTimeEnd >= animDuration) {
                                        if (animLoop === 'pulse') dynamicScale = 1 + 0.1 * Math.sin(relTime * Math.PI * 4);
                                        if (animLoop === 'shake') dynamicOffsetX = 5 * Math.sin(relTime * Math.PI * 10);
                                        if (animLoop === 'float') dynamicOffsetY = -10 * Math.sin(relTime * Math.PI * 2);
                                    }
                                    
                                    // Base transform including anchor, nudge, and animations
                                    let transformStr = `translate(-50%, -50%) translate(${dynamicOffsetX}px, ${dynamicOffsetY}px) scale(${dynamicScale})`;
"""
    content = re.sub(render_start, render_inject, content)

    # 9. Update the actual div inline style to use dynamicOpacity and transformStr
    # find `opacity: 1,` inside the text renderer and `transform: 'translate(-50%, -50%)',`
    # replace them
    content = content.replace("transform: 'translate(-50%, -50%)',", "transform: transformStr,")
    content = content.replace("opacity: 1,", "opacity: dynamicOpacity,")

    # Fix any destructuring issues for TextPropertiesPanel props
    # Let's write a small script to find the TextPropertiesPanel definition and add the props
    prop_def_str = "    overlayLineSpacing, setOverlayLineSpacing,"
    new_prop_def_str = prop_def_str + "\n    overlayAnimationIn, setOverlayAnimationIn,\n    overlayAnimationOut, setOverlayAnimationOut,\n    overlayAnimationLoop, setOverlayAnimationLoop,"
    content = content.replace(prop_def_str, new_prop_def_str)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Text animations injected successfully")

if __name__ == '__main__':
    main()
