import re

def main():
    file_path = r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\style-screen.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the big useEffect that syncs everything to clipSettings.
    # It probably looks like:
    # overlayTextStyleBold: overlayTextStyleBold,
    # overlayTextStyleItalic: overlayTextStyleItalic,
    
    prop_str = "overlayTextStyleItalic: overlayTextStyleItalic,"
    if prop_str in content:
        new_prop_str = prop_str + "\n            overlayTextStyleUnderline: overlayTextStyleUnderline,"
        content = content.replace(prop_str, new_prop_str)
        print("Updated sync for underline.")
    
    # Also we need to sync when a clip is loaded (when activePreviewId changes).
    # That is likely in another useEffect or a function called loadClipSettings.
    # It probably looks like:
    # setOverlayTextStyleItalic(settings.overlayTextStyleItalic ?? false);
    
    load_str = "setOverlayTextStyleItalic(settings.overlayTextStyleItalic ?? false);"
    if load_str in content:
        new_load_str = load_str + "\n            setOverlayTextStyleUnderline(settings.overlayTextStyleUnderline ?? false);"
        content = content.replace(load_str, new_load_str)
        print("Updated load for underline.")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()
