# MetronIQ Dataset Discovery Report

## 1. Executive Summary
This report evaluates publicly available computer vision datasets concerning Indian packaged foods and FMCG products to determine viability for training the `metroniq.pt` domain model. The required classes are: `MRP`, `NET_QUANTITY`, `MANUFACTURER`, `PACKER`, `IMPORTER`, and `CONSUMER_CARE`.

**Conclusion (OPTION C):** Public datasets contain useful images but zero compatible ground-truth bounding boxes for the 6 Legal Metrology classes. A minimal AI-assisted human verification stage is unavoidable.

## 2. Open Food Facts Analysis
Open Food Facts provides a massive repository of global and Indian packaged goods.
* **Available Data:** High-resolution product images (front, nutrition, ingredients).
* **Metadata vs. Ground Truth:** The API returns structured metadata (e.g., `quantity: "500 g"`, `brands: "Nestle"`, `manufacturing_places: "India"`). **This metadata does NOT equal an image bounding box.** 
* **OCR Capability:** Open Food Facts runs a server-side text extraction for general searchability but does not label bounding boxes semantically mapping to Legal Metrology compliance bounds.
* **Conclusion:** Excellent source of RAW images, zero strict bounding-box labels.

## 3. Dataset Comparison Table
The datasets evaluated below include Open Food Facts, Mendeley/Kaggle Indian Packaged Foods Nutritional Composition Dataset, and Roboflow Indian Grocery Object Detection.

| DATASET | SOURCE | LICENSE | IMAGES | INDIAN CONTEXT | BBOX EXISTS? | OCR LABELS? | DATA QUALITY | ASSESSED HUMAN WORK |
|---------|--------|---------|--------|----------------|--------------|-------------|--------------|---------------------|
| Open Food Facts | OpenFoodFacts.org | ODbL | 3M+ | High (Filterable) | NO (Metadata only)| Partial (Raw Text) | High (Raw Images) | High (Needs BBox mapping) |
| Indian Packaged Foods Nutritional (2026) | Mendeley/Kaggle | CC BY 4.0 | 852 | Very High | NO (Metadata only)| NO | Medium | High (Needs BBox mapping) |
| Indian Groceries (Roboflow) | Roboflow Universe | CC BY 4.0 | Multi | Very High | YES (Whole Object) | NO | High | High (Wrong Ontology) |
| GitHub "Packaged Foods" Sample | GitHub (Existing) | Unclear | 125 | Unknown | YES (Nutrition) | NO | Low | Very High (Wrong Ontology) |

## 4. MetronIQ Class Compatibility
Mapping dataset capabilities directly to the 6 target classes:

| DATASET | MRP | NET_QUANTITY | MANUFACTURER | PACKER | IMPORTER | CONSUMER_CARE |
|---------|-----|--------------|--------------|--------|----------|---------------|
| Open Food Facts | NONE | NONE | NONE | NONE | NONE | NONE |
| Indian Packaged Foods (2026) | NONE | NONE | NONE | NONE | NONE | NONE |
| Indian Groceries (Roboflow) | NONE | NONE | NONE | NONE | NONE | NONE |
| GitHub "Packaged Foods" | NONE | NONE | NONE | NONE | NONE | NONE |

*Note: "NONE" indicates the absolute absence of geometric bounding box ground truth for these exact classes. While Open Food Facts has metadata string values for NET_QUANTITY, they are purely textual and not localized on the images.*

## 5. Recommended Data Source
**Open Food Facts (Filtered to India)**
* **Reasoning:** It provides the highest volume of legitimate, open-license (ODbL) front-and-back packaged food imagery.

## 6. Expected Manual Work & AI-Assistance
* **Expected Manual Work:** Without AI assistance, annotating bounds for 6 complex OCR-dense classes across hundreds of training samples would require drawing ~3000-5000 geometric polygons manually.
* **AI-Assistance Reduction:** By deploying `PaddleOCR` to scan the raw Open Food Facts images, extracting raw OCR text bounded regions, and matching them via Regex (e.g., `MRP`, `₹`, `Net Qty`, `Manufactured by`, `Contact`), the system can generate **Provisional Bounding Boxes**. The human reviewer's job shifts from "finding and drawing 6 boxes from scratch" to simply clicking "Approve" or "Adjust" on AI-recommended bounds, reducing manual geometric work by ~85%.

## 7. Exact Next Step
Proceed to build the automated Stage 3 candidate screening pipeline (`candidate_images.csv`) to pre-process the Open Food Facts raw images using the newly verified isolated `PaddleOCR` Docker container, saving coordinates as provisional queues.
