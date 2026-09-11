import os

filepath = "frontend/src/app/page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace footer text
content = content.replace(
    'Government Enterprise Systems. Department of Legal Metrology & Consumer Affairs.',
    'METRONIQ.'
)

# I should also make sure it didn't use &amp; instead of &
content = content.replace(
    'Government Enterprise Systems. Department of Legal Metrology &amp; Consumer Affairs.',
    'METRONIQ.'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
