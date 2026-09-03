# STAGE 16 DATASET SEARCH REPORT

This report evaluates publicly accessible remote datasets containing packaged food imagery for automated expansion of the MetronIQ training infrastructure. 

## CANDIDATE 1
**SOURCE**: Object Detection and Text Recognition of Packaged Foods
**URL**: https://github.com/joyeetadey/Object-Detection-and-Text-Recognition-of-Packaged-Foods
**DOWNLOAD STATUS**: SUCCESS (Direct Git/Archive access)
**LICENSE**: Open (Unspecified standard GitHub public terms)
**REAL IMAGE COUNT**: 125
**ANNOTATION COUNT**: 125
**ANNOTATION FORMAT**: YOLO
**ORIGINAL CLASSES**: Nutrition tables, Brand name, Ingredients list
**TEXT BOXES**: NO (Semantic regions only)
**OCR TEXT**: NO
**INDIAN PRODUCTS**: YES (High concentration of domestic FMCG)
**METRONIQ DIRECT COMPATIBILITY**: NONE
**OCR-ASSISTED COMPATIBILITY**: YES
**AUTOMATION POTENTIAL**: HIGH
**RECOMMENDATION**: Ideal sandbox for `PaddleOCR` pipeline since angles reflect real-world smartphone scans of domestic products.

## CANDIDATE 2
**SOURCE**: NutriGreen Image Dataset
**URL**: https://zenodo.org/records/10020545
**DOWNLOAD STATUS**: SUCCESS (Zenodo Open API)
**LICENSE**: CC BY 4.0
**REAL IMAGE COUNT**: 10,472
**ANNOTATION COUNT**: 10,472
**ANNOTATION FORMAT**: CSV (Center X, Y, W, H)
**ORIGINAL CLASSES**: NutriScore A-E, BIO, V-Label
**TEXT BOXES**: NO (Logo regions only)
**OCR TEXT**: NO
**INDIAN PRODUCTS**: NO (Predominantly European Union datasets)
**METRONIQ DIRECT COMPATIBILITY**: NONE
**OCR-ASSISTED COMPATIBILITY**: YES
**AUTOMATION POTENTIAL**: MEDIUM
**RECOMMENDATION**: Excellent volume for generic Manufacturer names via zero-shot OCR, but zero utility for Indian Legal Metrology specific artifacts (like "MRP" and "₹").

## CANDIDATE 3
**SOURCE**: Grocery Store Dataset
**URL**: https://github.com/marcusklasson/GroceryStoreDataset
**DOWNLOAD STATUS**: SUCCESS 
**LICENSE**: MIT 
**REAL IMAGE COUNT**: 5,125
**ANNOTATION COUNT**: 0 (Image Classification)
**ANNOTATION FORMAT**: Hierarchical Folder Structure
**ORIGINAL CLASSES**: Apple, Yogurt, Milk, etc.
**TEXT BOXES**: NO
**OCR TEXT**: NO
**INDIAN PRODUCTS**: NO (European/Swedish Origin)
**METRONIQ DIRECT COMPATIBILITY**: NONE
**OCR-ASSISTED COMPATIBILITY**: PARTIAL
**AUTOMATION POTENTIAL**: LOW
**RECOMMENDATION**: Mostly front-facing shots of fruit. Lacks the rear-packaging density necessary for packer/importer labels.

## CANDIDATE 4
**SOURCE**: Indian Groceries Object Detection
**URL**: https://universe.roboflow.com/indian-groceries
**DOWNLOAD STATUS**: BLOCKED (Requires specific REST API Token)
**LICENSE**: CC-BY
**REAL IMAGE COUNT**: Unknown
**RECOMMENDATION**: Dropped from consideration due to API token restrictions in headless environment.

---

### RANKING
1. BEST: Object Detection and Text Recognition of Packaged Foods (Candidate 1)
2. SECOND BEST: NutriGreen Image (Candidate 2)
3. THIRD BEST: Grocery Store Dataset (Candidate 3)

### BEST DATASET: 
**Object Detection and Text Recognition of Packaged Foods**

**WHY:**
It is freely downloadable, contains verifiable Indian FMCG products, and features images explicitly photographed from angles containing dense textual declarations (ingredients, manufacturers, MRPs). 

**EXPECTED MANUAL WORK:**
Only reviewing auto-generated `PaddleOCR` geometries against the images on a binary (ACCEPT/REJECT) basis. 

**EXPECTED AUTOMATION:**
The previously established Docker-based `metroniq-ai` screening engine can seamlessly extract text vectors, use the built-in regex matrix to isolate `MANUFACTURER` and `PACKER` targets, and stream them natively into `human_review_queue.csv`.

**REMAINING BLOCKERS:**
Currently blocked until the pipeline is physically launched on more volumes to generate the minimum viable geometry bounds for the `MANUFACTURER`, `PACKER`, and `IMPORTER` topologies.
