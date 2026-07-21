import re

def main():
    file_path = r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\style-screen.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find handleAddTextClipToTimeline
    # We want to add setClipSettings and setActivePreviewId before setIsTextPlacementMode(false);
    
    inject_str = """
        setClipSettings(prev => ({
            ...prev,
            [textClipId]: {
                overlayText: 'New Text',
                overlayFontSize: 64,
                overlayColor: '#FFFFFF',
                overlayPosX: 50,
                overlayPosY: 50
            }
        }));
        setActivePreviewId(textClipId);
        setActiveTool('text-tool');
        
        setIsTextPlacementMode(false);"""
        
    content = content.replace("        setIsTextPlacementMode(false);", inject_str)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Updated handleAddTextClipToTimeline")

if __name__ == '__main__':
    main()
