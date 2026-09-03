import os

total = 0
found_href = False

for root, _, files in os.walk("frontend/src"):
    for f in files:
        if f.endswith(".tsx"):
            with open(os.path.join(root, f), "r", encoding="utf-8") as file:
                content = file.read()
                if 'href="#"' in content:
                    found_href = True
                    print(f"Dead href found in: {os.path.join(root, f)}")
                
                total += content.count("<Button")
                total += content.count("<button")

print(f"Total buttons approx: {total}")
if not found_href:
    print("No dead hrefs found.")
