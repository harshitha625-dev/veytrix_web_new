import re

def find_components(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    matches = re.finditer(r'(?:export\s+)?(?:const|function)\s+([A-Z][a-zA-Z0-9_]*)\s*=', content)
    for m in matches:
        print(f"Component/Variable: {m.group(1)}")

find_components(r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\style-screen.tsx')
