
import sys
import time
import logging
import paddle
logging.getLogger('ppocr').setLevel(logging.ERROR)

def run():
    try:
        from paddleocr import PaddleOCR
        ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
        
        images = ['6111242100992_front.jpg', '3017620425035_front.jpg', '5449000000996_front.jpg', '7613035833272_front.jpg']
        for img in images:
            start = time.time()
            res = ocr.ocr(f'/data/openfoodfacts/raw/{img}', cls=True)
            print(f'\n--- IMAGE: {img} ---')
            print('OCR STATUS: PASS')
            
            if res and res[0]:
                print(f'REGION COUNT: {len(res[0])}')
                for idx, r in enumerate(res[0][:3]):
                    print(f'BOX: {r[0]} | TEXT: {r[1][0]} | CONF: {r[1][1]:.3f}')
                if len(res[0]) > 3:
                    print('... (truncated for brevity)')
            else:
                print('REGION COUNT: 0')
            print(f'TIME: {time.time() - start:.2f}s')
            
    except Exception as e:
        print(f"OCR STATUS: FAIL")
        print(f"EXACT ERROR: {str(e)}")

run()
