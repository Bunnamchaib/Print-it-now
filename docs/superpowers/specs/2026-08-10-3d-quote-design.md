# 3D Print Quote Web Design

## Goal

Build a lightweight static website that runs on GitHub Pages and lets customers upload `STL` or `OBJ` files to get an instant rough quote for 3D printing.

## Scope

- Parse `STL` and `OBJ` files in the browser only
- Show estimated dimensions, solid volume, material usage, weight, and print time
- Let the customer choose material (`PLA` or `PETG`) and a display color
- Calculate a quote in Thai baht with a built-in safety margin to reduce underpricing risk
- Keep the app as a static frontend with no backend dependency

## Non-Goals

- Exact slicer-accurate print time
- Support generation or orientation optimization
- File storage, checkout, payment, or order management
- Admin dashboard

## Product Decisions

### Estimation model

The quote is intentionally conservative:

- Use actual model volume when available
- Estimate printed material usage with a heuristic that blends shell overhead, infill, and support/waste buffer
- Price from material cost, machine time, a minimum setup fee, and an added margin
- If a mesh cannot produce a valid volume, fall back to a bounding-box-based estimate and show a warning

### User experience

The site stays on one page:

1. Upload model
2. Preview model
3. Review metrics
4. Choose material and color
5. Calculate and view the quote

### Technical approach

- `index.html` serves the app shell
- `styles.css` holds the visual system
- `src/app.js` handles file upload, parsing, rendering, and DOM updates
- `src/quote-engine.js` contains pricing formulas
- `src/geometry-math.js` contains pure geometry helpers for dimensions and volume math
- `tests/*.test.js` cover pricing and geometry logic with Node's built-in test runner

## Risk Handling

- Favor overestimation over underestimation
- Surface warnings for invalid meshes or fallback math
- Keep rates configurable in code so business rules can be tuned quickly

## Success Criteria

- A customer can upload an `STL` or `OBJ` file directly in the browser
- The page shows size, estimated weight, estimated print time, and price
- The quote updates when the material changes
- The project can be hosted as static files on GitHub Pages
