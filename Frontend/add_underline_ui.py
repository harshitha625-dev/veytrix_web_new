import re

def main():
    file_path = r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\style-screen.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add state variable
    state_str = "    const [overlayTextStyleItalic, setOverlayTextStyleItalic] = useState(false);\n"
    new_state_str = state_str + "    const [overlayTextStyleUnderline, setOverlayTextStyleUnderline] = useState(false);\n"
    content = content.replace(state_str, new_state_str)

    # 2. Add to TextPropertiesPanel props in two places (around line 6857 and 7408)
    prop_str = "                                                        overlayTextStyleItalic={overlayTextStyleItalic} setOverlayTextStyleItalic={setOverlayTextStyleItalic}\n"
    new_prop_str = prop_str + "                                                        overlayTextStyleUnderline={overlayTextStyleUnderline} setOverlayTextStyleUnderline={setOverlayTextStyleUnderline}\n"
    content = content.replace(prop_str, new_prop_str)

    # 3. Add to the UI (Format tab)
    ui_str = """                                            <button onClick={() => setOverlayTextStyleItalic(!overlayTextStyleItalic)} className={`w-8 h-8 rounded border flex items-center justify-center font-serif italic text-sm ${overlayTextStyleItalic ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>I</button>
                                        </div>"""
    new_ui_str = """                                            <button onClick={() => setOverlayTextStyleItalic(!overlayTextStyleItalic)} className={`w-8 h-8 rounded border flex items-center justify-center font-serif italic text-sm ${overlayTextStyleItalic ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>I</button>
                                            <button onClick={() => setOverlayTextStyleUnderline(!overlayTextStyleUnderline)} className={`w-8 h-8 rounded border flex items-center justify-center font-serif underline text-sm ${overlayTextStyleUnderline ? 'bg-white/20 border-white/30 text-white' : 'bg-[#2a2c35] border-transparent text-slate-300'}`}>U</button>
                                        </div>"""
    content = content.replace(ui_str, new_ui_str)
    
    # 4. Also fix the opacity-50 for stroke and shadow controls when enabled
    content = content.replace('className="flex items-center gap-2 bg-[#12141c] border border-white/10 rounded p-1 opacity-50"', 'className="flex items-center gap-2 bg-[#12141c] border border-white/10 rounded p-1"')
    content = content.replace('className="flex items-center justify-between gap-3 opacity-50"', 'className="flex items-center justify-between gap-3"')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Underline UI added successfully")

if __name__ == '__main__':
    main()
