# OPEN FOOD FACTS - LICENSE & PROVENANCE

## Provider Details
**Source:** Open Food Facts (https://openfoodfacts.org)
**API Endpoints:** `https://world.openfoodfacts.org/api/v2/search`
**User-Agent Requirements:** Explicit identification required per requests (Implemented as `MetronIQ-Compliance-Scanner/1.0`).

## Legal Attribution & Licensing
Open Food Facts is a collaborative, free and open database of food products from around the world.
1. **Database:** The core Open Food Facts database is licensed under the **Open Database License (ODbL)**.
2. **Product Images:** Submitted imagery is generally published under the **Creative Commons Attribution-ShareAlike (CC-BY-SA 4.0)** license, or similar public domain dedication if specified.

## MetronIQ Handling Constraints
*   **Data Isolation:** All raw imagery pulled via this API is sequestered in `external_data/openfoodfacts/raw_images`. 
*   **No Commercial Redistribution:** MetronIQ processes these images solely to train its own proprietary bounding-box metrics (the `metroniq.pt` weights). The source images themselves are not redistributed directly within our production application beyond evidence logging for the specific product scan.
*   **Attribution:** Any usage in demonstrations must cite Open Food Facts as the imagery source.
