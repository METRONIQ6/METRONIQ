import os
import sys

def main():
    print("==================================================")
    print("    METRONIQ YOLO DOMAIN MODEL FINETUNING")
    print("==================================================")

    mlops_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_yaml = os.path.join(mlops_dir, "dataset", "dataset.yaml")
    
    if not os.path.exists(dataset_yaml):
        print(f"Dataset block missing: {dataset_yaml}")
        sys.exit(1)
        
    try:
        from ultralytics import YOLO
    except ImportError:
        print("Ultralytics library missing.")
        sys.exit(1)
        
    print("Initializing YOLOv11 small architecture baseline...")
    # Setting explicitly to local to bypass downloads if possible, but let ultralytics fetch yolo11n.pt if it's missing.
    model = YOLO("yolo11n.pt") 
    
    print("Running specialized domain alignment for 2 epochs on the verified 62 geometry vectors...")
    
    # Train the model
    res = model.train(
        data=dataset_yaml,
        epochs=2,
        imgsz=640,
        batch=4,
        project=os.path.join(mlops_dir, "dataset"), # write runs to backend/mlops/dataset
        name="domain_v1",
        cache=False,
        exist_ok=True
    )
    
    print("TRAINING SUCCESSFUL!")
    
    # Export explicitly
    prod_path = os.path.join(os.path.dirname(mlops_dir), "app", "ai", "models", "metroniq.pt")
    os.makedirs(os.path.dirname(prod_path), exist_ok=True)
    
    trained_weights = os.path.join(mlops_dir, "dataset", "domain_v1", "weights", "best.pt")
    if os.path.exists(trained_weights):
        import shutil
        shutil.copy(trained_weights, prod_path)
        print(f"Domain weights successfully promoted to PRODUCTION at {prod_path}")
    else:
        print("Failed to locate trained weights.")

if __name__ == "__main__":
    main()
