def strip_t(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    out = []
    for line in lines:
        if "useTranslation" in line:
            continue
        out.append(line)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(out)

strip_t("src/app/page.tsx")
