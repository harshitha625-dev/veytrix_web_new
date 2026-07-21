import re

def main():
    file_path = r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\style-screen.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The duplicated lines are:
    # isMuted={isMuted} setIsMuted={setIsMuted}
    # isMuted={isMuted} setIsMuted={setIsMuted}
    # We want to replace the second one with:
    # isDenoiseEnabled={isDenoiseEnabled} setIsDenoiseEnabled={setIsDenoiseEnabled}
    # onApplyToAllVolume={handleApplyToAllVolume}
    
    # We can match two identical consecutive isMuted lines with any leading whitespace
    pattern = re.compile(r'([ \t]*)isMuted=\{isMuted\}\s+setIsMuted=\{setIsMuted\}\r?\n([ \t]*)isMuted=\{isMuted\}\s+setIsMuted=\{setIsMuted\}')
    
    def replacer(match):
        indent1 = match.group(1)
        indent2 = match.group(2)
        return f"{indent1}isMuted={{isMuted}} setIsMuted={{setIsMuted}}\n{indent2}isDenoiseEnabled={{isDenoiseEnabled}} setIsDenoiseEnabled={{setIsDenoiseEnabled}}\n{indent2}onApplyToAllVolume={{handleApplyToAllVolume}}"

    new_content = pattern.sub(replacer, content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Duplicates fixed successfully")
    else:
        print("No duplicates found to fix.")

if __name__ == '__main__':
    main()
