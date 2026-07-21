import re
import sys

def main():
    file_path = r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\style-screen.tsx'
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    # 1. Add state variable
    state_target = '    const [volumeLevel, setVolumeLevel] = useState(1);'
    state_replacement = '    const [volumeLevel, setVolumeLevel] = useState(1);\n    const [isDenoiseEnabled, setIsDenoiseEnabled] = useState(false);'
    
    if state_target in content:
        content = content.replace(state_target, state_replacement)
    else:
        print("Could not find state_target")

    # 2. Add handleApplyToAllVolume
    callback_target = '    const [isDenoiseEnabled, setIsDenoiseEnabled] = useState(false);'
    callback_replacement = '''    const [isDenoiseEnabled, setIsDenoiseEnabled] = useState(false);

    const handleApplyToAllVolume = useCallback(() => {
        setClipSettings(prev => {
            const updated = { ...prev };
            mediaItems.forEach(item => {
                updated[item.id] = { ...(updated[item.id] || {}), volumeLevel, isMuted, isDenoiseEnabled };
            });
            saveToUndo(mediaItems, undefined, undefined, undefined, undefined, undefined, undefined, updated);
            return updated;
        });
    }, [volumeLevel, isMuted, isDenoiseEnabled, mediaItems, setClipSettings, saveToUndo]);'''
    
    if callback_target in content and 'handleApplyToAllVolume' not in content:
        content = content.replace(callback_target, callback_replacement)

    # 3. Update ToolInspector props
    props_target = '''    isMuted,
    setIsMuted,'''
    props_replacement = '''    isMuted,
    setIsMuted,
    isDenoiseEnabled,
    setIsDenoiseEnabled,
    onApplyToAllVolume,'''
    
    if props_target in content:
        content = content.replace(props_target, props_replacement)
    elif props_target.replace('\n', '\r\n') in content:
        content = content.replace(props_target.replace('\n', '\r\n'), props_replacement.replace('\n', '\r\n'))
    else:
        print("Could not find props_target")

    # 4. Update ToolInspector instantiations
    # Use regex to find `volumeLevel={volumeLevel} setVolumeLevel={setVolumeLevel}\s+isMuted={isMuted} setIsMuted={setIsMuted}`
    pattern_instantiation = re.compile(r'(volumeLevel={volumeLevel}\s+setVolumeLevel={setVolumeLevel}\s*)\n(\s*isMuted={isMuted}\s+setIsMuted={setIsMuted})')
    content = pattern_instantiation.sub(r'\1\n\2\n\2'.replace('isMuted={isMuted} setIsMuted={setIsMuted}', 'isDenoiseEnabled={isDenoiseEnabled} setIsDenoiseEnabled={setIsDenoiseEnabled}\n' + r'\2'.replace('isMuted={isMuted} setIsMuted={setIsMuted}', 'onApplyToAllVolume={handleApplyToAllVolume}')), content)
    
    # 5. Update case 'volume' block
    old_volume_block = """        case 'volume':
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Volume</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Audio Level</span>
                    </div>
                    <div className="space-y-2.5">
                        <button
                            onClick={() => setIsMuted((prev: any) => !prev)}
                            className={`w-full py-2 rounded-lg text-[8px] font-black uppercase border transition-colors ${isMuted ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/15'}`}
                        >
                            {isMuted ? 'Unmute' : 'Mute'}
                        </button>
                        <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-300">
                            <span>Volume</span>
                            <span>{Math.round(volumeLevel * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volumeLevel}
                            onChange={(e) => {
                                const next = Number(e.target.value);
                                setVolumeLevel(next);
                                if (next > 0 && isMuted) {
                                    setIsMuted(false);
                                }
                            }}
                            className="w-full accent-purple-400"
                        />
                    </div>
                </div>
            );"""

    new_volume_block = """        case 'volume':
            return (
                <div className="flex flex-col h-full bg-[#1b1c28] -mx-4 -mt-4 -mb-4 overflow-y-auto custom-scrollbar">
                    {/* Top Bar */}
                    <div className="flex items-center justify-center border-b border-white/5 py-3 shrink-0">
                        <span className="text-[13px] font-bold text-white">Volume</span>
                    </div>
                    
                    {/* Content Body */}
                    <div className="flex-1 p-5 space-y-6">
                        
                        {/* Volume Level Row */}
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-slate-300">Volume</span>
                            <div className="flex items-center bg-[#13141c] rounded-md px-3 py-1.5 border border-white/5">
                                <input 
                                    type="number" 
                                    value={Math.round(volumeLevel * 100)} 
                                    onChange={(e) => {
                                        let next = parseFloat(e.target.value);
                                        if (isNaN(next)) next = 0;
                                        setVolumeLevel(next / 100);
                                        if (next > 0 && isMuted) setIsMuted(false);
                                    }}
                                    className="bg-transparent text-slate-200 text-[11px] font-medium w-10 text-right focus:outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        </div>
                        
                        {/* Slider Row */}
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsMuted((prev: any) => !prev)}
                                className="w-8 h-8 rounded-md bg-[#252632] flex items-center justify-center hover:bg-[#2d2f3d] transition-colors shrink-0"
                            >
                                {isMuted ? (
                                    <LucideIcons.VolumeX className="w-4 h-4 text-slate-300" />
                                ) : (
                                    <LucideIcons.Volume2 className="w-4 h-4 text-slate-300" />
                                )}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={5}
                                step={0.01}
                                value={volumeLevel}
                                onChange={(e) => {
                                    const next = Number(e.target.value);
                                    setVolumeLevel(next);
                                    if (next > 0 && isMuted) {
                                        setIsMuted(false);
                                    }
                                }}
                                className="flex-1 h-1 bg-[#252632] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #ffc83d ${(volumeLevel / 5) * 100}%, #252632 ${(volumeLevel / 5) * 100}%)`
                                }}
                            />
                        </div>
                        
                        {/* Denoise Row */}
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-slate-300">Denoise</span>
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] text-slate-500">{isDenoiseEnabled ? 'On' : 'Off'}</span>
                                <button
                                    onClick={() => setIsDenoiseEnabled((prev: any) => !prev)}
                                    className={`w-9 h-5 rounded-full relative transition-colors ${isDenoiseEnabled ? 'bg-slate-600' : 'bg-[#252632]'}`}
                                >
                                    <div className={`absolute top-[2px] w-4 h-4 bg-white rounded-full transition-transform ${isDenoiseEnabled ? 'left-[18px]' : 'left-[2px]'}`} />
                                </button>
                            </div>
                        </div>
                        
                    </div>
                    
                    {/* Apply to All Button */}
                    <div className="p-4 mt-auto border-t border-white/5 shrink-0">
                        <button
                            onClick={onApplyToAllVolume}
                            className="flex items-center gap-2 px-3 py-2 bg-[#252632] hover:bg-[#2d2f3d] rounded-md transition-colors text-[11px] font-bold text-slate-200"
                        >
                            <LucideIcons.CheckCheck className="w-4 h-4" />
                            Apply to all
                        </button>
                    </div>
                </div>
            );"""

    if old_volume_block in content:
        content = content.replace(old_volume_block, new_volume_block)
    elif old_volume_block.replace('\n', '\r\n') in content:
        content = content.replace(old_volume_block.replace('\n', '\r\n'), new_volume_block.replace('\n', '\r\n'))
    else:
        print("Could not find old_volume_block")

    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Update complete")

if __name__ == '__main__':
    main()
