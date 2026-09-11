from deep_translator import GoogleTranslator
import json

res = GoogleTranslator(source='en', target='ta').translate('save')
with open('test.json', 'w', encoding='utf-8') as f:
    json.dump({'test': res}, f, ensure_ascii=False)
