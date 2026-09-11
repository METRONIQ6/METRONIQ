import os

filepath = "frontend/src/app/page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace main title
content = content.replace(
    'PostgreSQL Supported Security & Operations',
    'Legal Metrology & Food Safety Operations'
)

# Replace description
content = content.replace(
    'Beyond the aesthetic lies an intensely robust foundation. MetronIQ employs persistent, immutable enterprise grade storage.',
    'Engineered exclusively for government enforcement directorates, ensuring statutory compliance, packaged commodity governance, and rigorous consumer protection across the supply chain.'
)

# Replace list items to be more government/food safety focused
content = content.replace(
    '"Real-time Enterprise PostgeSQL Fabric"',
    '"Secure State-Level Data Fabric"'
)

# Replace the graphic labels
content = content.replace(
    '"PostgreSQL Active"',
    '"Secure Govt Node Hosted"'
)
content = content.replace(
    '"System Audit Stream"',
    '"National Compliance Stream"'
)

# Ensure "Government Enterprise Systems" looks official
content = content.replace(
    'Confidential AI Deployment Architecture.',
    'Department of Legal Metrology & Consumer Affairs.'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
