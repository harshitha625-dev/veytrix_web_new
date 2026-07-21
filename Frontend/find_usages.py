import sys

def find_usages(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for i in range(4100):
        if 'saveToUndo' in lines[i] or 'setClipSettings' in lines[i]:
            print(f"Line {i+1}: {lines[i].strip()}")

find_usages(r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\style-screen.tsx')
