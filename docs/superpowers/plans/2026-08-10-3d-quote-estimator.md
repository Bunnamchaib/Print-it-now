# 3D Quote Estimator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a one-page static web app that estimates 3D print quotes from uploaded `STL` and `OBJ` files.

**Architecture:** The app uses browser-side parsing and rendering with pure utility modules for geometry math and pricing. Testing focuses on the deterministic quote and metric functions so the business logic stays trustworthy while the UI remains simple.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Three.js CDN modules, Node `--test`

## Global Constraints

- Must run as static files on GitHub Pages
- Must accept `STL` and `OBJ`
- Must provide conservative estimates to reduce underpricing risk
- Must avoid backend services
- Must keep pricing constants easy to edit in code

---

### Task 1: Geometry Math Utilities

**Files:**
- Create: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/src/geometry-math.js`
- Test: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/tests/geometry-math.test.js`

**Interfaces:**
- Produces: `computeBoundsFromPoints(points)`, `computeTriangleVolume(points, indices)`, `mmToCm3(mm3)`

- [ ] Write failing tests for bounds and volume math
- [ ] Run `node --test tests/geometry-math.test.js` and verify failure
- [ ] Implement the minimal geometry helpers
- [ ] Re-run `node --test tests/geometry-math.test.js` and verify pass

### Task 2: Quote Engine

**Files:**
- Create: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/src/quote-engine.js`
- Test: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/tests/quote-engine.test.js`

**Interfaces:**
- Consumes: `mmToCm3`
- Produces: `estimatePrintJob(input)`, `MATERIALS`, `DEFAULT_MACHINE_PROFILE`

- [ ] Write failing tests for material usage, time estimate, and minimum-price protection
- [ ] Run `node --test tests/quote-engine.test.js` and verify failure
- [ ] Implement the minimal pricing logic
- [ ] Re-run `node --test tests/quote-engine.test.js` and verify pass

### Task 3: Static UI and File Parsing

**Files:**
- Create: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/index.html`
- Create: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/styles.css`
- Create: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/src/app.js`
- Modify: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/code.html`

**Interfaces:**
- Consumes: `estimatePrintJob`, geometry helpers
- Produces: a working upload-and-quote browser flow

- [ ] Build the single-page layout with upload, metrics, options, and quote summary
- [ ] Parse uploaded `STL` and `OBJ` files in-browser with Three.js loaders
- [ ] Render a simple preview scene and fit the camera to the model
- [ ] Show warnings and quote fallback states in the UI

### Task 4: Verification

**Files:**
- Modify: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/package.json`

**Interfaces:**
- Consumes: all earlier tasks
- Produces: runnable local verification commands

- [ ] Add test scripts
- [ ] Run `node --test`
- [ ] Run a static smoke check by opening `index.html` in a browser-compatible layout
