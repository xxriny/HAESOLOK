import os

src_dir = r'E:\HAESOLOK\src'

def fix_file(path):
    with open(path, 'rb') as f:
        content = f.read()
    
    # Check for BOM
    has_bom = content.startswith(b'\xef\xbb\xbf')
    if has_bom:
        content = content[3:]
    
    try:
        text = content.decode('utf-8')
    except UnicodeDecodeError:
        # Fallback to ignore errors if it's not valid utf-8
        text = content.decode('utf-8', errors='ignore')
        print(f"Warning: UnicodeDecodeError in {path}, used ignore.")

    # Rule:
    # \\\" (literal 3 backslashes + quote) -> \" (literal 1 backslash + quote)
    # \" (literal 1 backslash + quote) -> " (literal 0 backslashes + quote)
    
    # In Python strings:
    # '\\\\\\"' is 3 backslashes + quote
    # '\\"' is 1 backslash + quote
    
    # We use a placeholder for the 3-backslash case to avoid double replacement
    new_text = text.replace('\\\\\\"', 'TEMP_TRIPLE_BACKSLASH_QUOTE')
    new_text = new_text.replace('\\"', '"')
    new_text = new_text.replace('TEMP_TRIPLE_BACKSLASH_QUOTE', '\\"')
    
    if new_text != text or has_bom:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_text)
        return True
    return False

count = 0
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx', '.css')):
            path = os.path.join(root, file)
            if fix_file(path):
                print(f"Fixed: {path}")
                count += 1

print(f"Total files fixed: {count}")
