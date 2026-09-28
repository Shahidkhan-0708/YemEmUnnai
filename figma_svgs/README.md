# YEMEMUNNAI — SVG screen assets

Seven self-contained SVG assets. Screens 01–06 use a 375 × 812 viewBox. The mascot uses 546 × 330, with preserved proportions.

## Included
- 01_home_discovery_feed.svg
- 02_quick_order_modal.svg
- 03_feedback_popup.svg
- 04_business_dashboard.svg
- 05_add_edit_food_item.svg
- 06_walk_in_map_modal.svg
- 07_mascot_logo.svg
- preview.png: overview of all seven assets
- previews/: individually rendered PNGs
- FONT-LICENSE.txt: Plus Jakarta Sans license

## Construction
Interface components, icons, stars, gradients, clips, walking route, and shadows are SVG geometry. Food photos, shop avatars, and mascot artwork are embedded PNG crops from the user-provided references. No external image or font requests are required. Plus Jakarta Sans weights 400–800 are embedded as base64 font data. Text remains editable.

The prescribed shadows are implemented through Gaussian blur, offset, flood, composite and merge primitives, equivalent to feDropShadow, for compatibility with Inkscape as well as browsers.

## Integration
Use an SVG file as an image source, with width:100%; height:auto; object-fit:contain. Each SVG can also be inlined; prefix its IDs when placing several inline SVGs into one HTML document to prevent gradient/filter/clip ID collisions. Importing into a design editor may require Plus Jakarta Sans to be installed locally if that editor ignores embedded web fonts.

These are static design assets. Ordering, form submission, live inventory and Google Maps handoff must be connected in application code. The map is schematic, not a verified campus route. The logo preserves the supplied illustration as an embedded raster crop, including its sage background; it is not a transparent traced vector logo.

## Fidelity limits
These are reconstructed screens using the supplied design specifications, not certified pixel-perfect copies. The references contain different screen proportions and distorted/generated lettering. Labels have been normalized for readability and sample order data made coherent. Cropped food images and mascot retain the source resolution; no original high-resolution assets were supplied. A genuine all-vector mascot would require a separate manual tracing pass. The explicit seven-file deliverable list defines this package; other screens visible on the larger reference boards are not included.

## Validation
All seven files parsed as XML, use embedded assets, and were rendered and visually inspected with Inkscape. Preview PNGs are included. There are no scripts, remote dependencies or functional application controls in these SVGs.
