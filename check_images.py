from PIL import Image
import os

# Check test_label.jpg
try:
    img = Image.open('test_label.jpg')
    sz = os.path.getsize('test_label.jpg')
    print(f'test_label.jpg: {img.size} {img.mode} {sz}B')
except Exception as e:
    print(f'test_label.jpg ERROR: {e}')

# Find largest uploads
uploads = 'backend/uploads'
jpg_files = []
for f in os.listdir(uploads):
    if f.endswith('.jpg'):
        fp = os.path.join(uploads, f)
        jpg_files.append((os.path.getsize(fp), f, fp))

jpg_files.sort(reverse=True)
print('\nTop 5 uploads by size:')
for sz, fn, fp in jpg_files[:5]:
    try:
        img2 = Image.open(fp)
        print(f'  {fn}: {img2.size} {img2.mode} {sz}B')
    except Exception as e:
        print(f'  {fn}: UNREADABLE {e}')
