import re

def main():
    file_path = r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\style-screen.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The block to move
    callback_block = """
    const handleApplyToAllVolume = useCallback(() => {
        setClipSettings(prev => {
            const updated = { ...prev };
            mediaItems.forEach(item => {
                updated[item.id] = { ...(updated[item.id] || {}), volumeLevel, isMuted, isDenoiseEnabled };
            });
            saveToUndo(mediaItems, undefined, undefined, undefined, undefined, undefined, undefined, updated);
            return updated;
        });
    }, [volumeLevel, isMuted, isDenoiseEnabled, mediaItems, setClipSettings, saveToUndo]);"""
    
    # Remove from current location
    if callback_block in content:
        content = content.replace(callback_block, "")
    elif callback_block.replace('\n', '\r\n') in content:
        content = content.replace(callback_block.replace('\n', '\r\n'), "")
    else:
        print("Could not find the callback block to remove!")
        
    # Find saveToUndo definition block
    # Insert after the closing brace of saveToUndo. We can just insert it before useEffect around 4164 or so.
    # To be totally safe, let's insert it before `const applyUndoState = useCallback`
    
    target = '    const applyUndoState = useCallback(('
    replacement = callback_block + '\n\n' + target
    
    if target in content:
        content = content.replace(target, replacement)
    else:
        print("Could not find applyUndoState target!")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Fix applied successfully")

if __name__ == '__main__':
    main()
