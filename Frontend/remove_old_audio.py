import re

def main():
    file_path = r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\style-screen.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove the entire `inspectorTab === 'audio'` block
    # We will use regex to find `{/* ── AUDIO TAB ── */}` up to the closing `)}`
    audio_tab_pattern = re.compile(r'[ \t]*\{/\*\s*── AUDIO TAB ──\s*\*/\}[^}]*\{inspectorTab === \'audio\' && \([^}]*\{/\* Volume Slider \*/\}[^}]*\{/\* Fade In & Out Button \*/\}[^}]*\{/\* Auto Audio-Caption Button \*/\}.*?\n[ \t]*\)\}\r?\n', re.DOTALL)
    
    content = audio_tab_pattern.sub('', content)

    # 2. Remove the Audio Tab button in the sidebar nav
    audio_btn_pattern = re.compile(r'[ \t]*<button[^>]*onClick=\{[^}]*setInspectorTab\(\'audio\'\)[^}]*\}[^>]*>.*?title="Audio".*?</button>\r?\n', re.DOTALL)
    
    content = audio_btn_pattern.sub('', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Removal successful")

if __name__ == '__main__':
    main()
