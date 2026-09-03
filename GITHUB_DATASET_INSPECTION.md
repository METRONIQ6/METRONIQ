# GITHUB DATASET INSPECTION

## Source
Repository: `joyeetadey/Object-Detection-and-Text-Recognition-of-Packaged-Foods`

## Statistics
- Total Source Images: 125
- Annotated: 124 (.txt label files)
- Existing Split: `train` (93 images), `val` (32 images)

## Task 2: Class Mapping
The source dataset targets nutritional extraction and classification of symbols, not Legal Metrology declarations.

| Source Class (GitHub) | MetronIQ Translation Target | Status |
|---|---|---|
| `veg/non-veg` | N/A | NOT MATCH |
| `nutrition table` | N/A | NOT MATCH |
| `ingredients` | N/A | NOT MATCH |
| `item names` | N/A | NOT MATCH |
| `expiry date` | N/A | NOT MATCH |

**Result:** MetronIQ Legal Metrology Classes (MRP, NET_QUANTITY, MANUFACTURER, PACKER, IMPORTER, CONSUMER_CARE) are **UNAVAILABLE** in the provided source ground-truth labels.

## Task 3 & 4: OCR Screening
Screening candidate images via OCR highlights some products *have* weight and pricing physically printed on them, but they lack human-verified bounding boxes required to train the `metroniq.pt` domain model.

## Task 5: MetronIQ Dataset Decision
Because the source labels are completely out-of-domain for our six specific legal targets, the training data is:
**NOT AVAILABLE IN SOURCE DATA**

## AI Assistance Queue
A `HUMAN_REVIEW_QUEUE.csv` has been generated for candidate images that contain potential MRP or Weight values. These require physical bounding-box annotation before Stage 6 training can commence.
