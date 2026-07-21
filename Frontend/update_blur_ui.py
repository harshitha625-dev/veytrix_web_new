import re

def main():
    file_path = r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\style-screen.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add bgBlurStyle state
    content = content.replace(
        "const [bgBlur, setBgBlur] = useState(30);",
        "const [bgBlur, setBgBlur] = useState(30);\n    const [bgBlurStyle, setBgBlurStyle] = useState('none');"
    )

    # Replace the Blur sub-tab content
    # The block starts with {bgSubTab === 'blur' && (
    # and ends right before {/* ── COLOR SUB-TAB ── */}
    
    blur_tab_pattern = re.compile(r'\{bgSubTab === \'blur\' && \(\s*<div className="flex flex-col space-y-4">.*?</div>\s*\)\}\s*\{/\* ── COLOR SUB-TAB ── \*/\}', re.DOTALL)
    
    new_blur_tab = """{bgSubTab === 'blur' && (
                                            <div className="flex flex-col space-y-4">
                                                <div>
                                                    <span className="text-xs font-medium text-slate-300">Styles</span>
                                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                                        {[
                                                            { id: 'none', label: 'None', isIcon: true },
                                                            { id: 'base', label: 'Base' },
                                                            { id: 'horizontal', label: 'Horizontal' },
                                                            { id: 'vertical', label: 'Vertical' },
                                                            { id: 'radioactive', label: 'Radioactive' },
                                                        ].map(style => (
                                                            <div key={style.id} className="flex flex-col items-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setBgBlurStyle(style.id)}
                                                                    className={`w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden border-2 transition-all ${
                                                                        bgBlurStyle === style.id ? 'border-[#EAB308]' : 'border-transparent'
                                                                    } bg-[#1a1b26]`}
                                                                    title={style.label}
                                                                >
                                                                    {style.isIcon ? (
                                                                        <div className="w-full h-full flex items-center justify-center bg-[#1a1b26]">
                                                                            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-slate-300" stroke="currentColor" strokeWidth="1.5">
                                                                                <circle cx="12" cy="12" r="10" />
                                                                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                                                            </svg>
                                                                        </div>
                                                                    ) : (
                                                                        activePreviewItem?.preview ? (
                                                                            <img 
                                                                                src={activePreviewItem.preview} 
                                                                                alt={style.label} 
                                                                                className={`w-full h-full object-cover scale-110 ${
                                                                                    style.id === 'base' ? 'blur-[4px]' :
                                                                                    style.id === 'horizontal' ? 'blur-[4px] scale-x-150' :
                                                                                    style.id === 'vertical' ? 'blur-[4px] scale-y-150' :
                                                                                    'blur-[4px] hue-rotate-90 saturate-200'
                                                                                }`} 
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full bg-[#23242e]" />
                                                                        )
                                                                    )}
                                                                </button>
                                                                <span className={`text-[10px] ${bgBlurStyle === style.id ? 'text-white' : 'text-slate-400'}`}>
                                                                    {style.label}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-1 mt-4">
                                                    <div className="flex justify-between text-xs font-medium text-slate-300">
                                                        <span>Blur</span>
                                                        <span className="text-[#EAB308] font-bold font-mono">{bgBlur}</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={bgBlur}
                                                        onChange={e => setBgBlur(Number(e.target.value))}
                                                        className="w-full accent-[#EAB308] h-1 bg-white/20 rounded-full cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* ── COLOR SUB-TAB ── */}"""
    
    if not blur_tab_pattern.search(content):
        print("Could not find the blur tab pattern!")
    else:
        content = blur_tab_pattern.sub(new_blur_tab, content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Replacement successful")

if __name__ == '__main__':
    main()
