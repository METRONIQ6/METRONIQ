
import sys
try:
    from ultralytics import YOLO
    model = YOLO('/app/models/yolo/yolo11n.pt')
    results = model('/data/openfoodfacts/raw/6111242100992_front.jpg', verbose=False)
    for r in results:
        boxes = r.boxes
        print(f"MODEL: yolo11n.pt")
        print(f"DETECTION COUNT: {len(boxes)}")
        for i, box in enumerate(boxes):
            cls = int(box.cls[0].item())
            conf = box.conf[0].item()
            cname = model.names[cls]
            b = box.xyxy[0].tolist()
            print(f"CLASS: {cname} | CONF: {conf:.2f}")
except Exception as e:
    print(f"YOLO_EXCEPTION: {str(e)}")
