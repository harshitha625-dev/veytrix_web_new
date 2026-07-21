import re

def find_surrounding_function(file_path, target_line_idx):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for i in range(target_line_idx, -1, -1):
        if 'const ' in lines[i] and '=>' in lines[i]:
            print(f"Line {i+1}: {lines[i].strip()}")
        if 'function ' in lines[i]:
            print(f"Line {i+1}: {lines[i].strip()}")

find_surrounding_function(r'd:\new_veytrix\veytrix_web_new\Frontend\src\app\pages\quick-edit\style-screen.tsx', 800)
