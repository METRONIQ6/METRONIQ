import os
import re

routes_dir = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\backend\app\api\routes"

for filename in os.listdir(routes_dir):
    if filename.endswith(".py") and filename != "__init__.py":
        filepath = os.path.join(routes_dir, filename)
        with open(filepath, 'r') as f:
            lines = f.readlines()
        
        print(f"\n--- {filename} ---")
        for i, line in enumerate(lines):
            if "@router." in line:
                func_line_idx = i + 1
                func_content = lines[func_line_idx]
                # collect lines until colon if multi-line
                while ":" not in func_content and func_line_idx < len(lines)-1:
                    func_line_idx += 1
                    func_content += lines[func_line_idx]
                
                auth = "None"
                if "get_current_admin" in func_content: auth = "Admin"
                elif "get_current_officer" in func_content: auth = "Officer"
                elif "get_current_manufacturer" in func_content: auth = "Manufacturer"
                elif "get_current_user" in func_content: auth = "User"
                
                func_name_match = re.search(r'(?:def|async def)\s+([a-zA-Z0-9_]+)', func_content)
                func_name = func_name_match.group(1) if func_name_match else "unknown"
                
                print(f"{func_name:30} | {auth:15}")
