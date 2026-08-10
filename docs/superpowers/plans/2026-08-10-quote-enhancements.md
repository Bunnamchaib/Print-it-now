# Quote Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add hidden support allowance, manual scale controls, and QR quote output to the static 3D quote app.

**Architecture:** The new behavior stays inside the existing static app but moves calculations into small pure helpers so pricing, scaling, and QR payloads can be tested without a browser. Admin settings continue to flow through the runtime config store into the quote engine and then into the UI.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Three.js CDN modules, QRCode CDN module, Node `--test`

## Global Constraints

- Must keep running as static files on GitHub Pages
- Must keep unreliable fallback files from showing a quote or QR code
- Must hide support allowance as an internal pricing factor rather than a customer-facing row
- Must keep admin settings in the existing config flow
- Must keep new business logic covered by Node tests

---

### Task 1: Support and Scale Pricing Helpers

**Files:**
- Modify: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/src/quote-engine.js`
- Create: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/src/scale-utils.js`
- Test: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/tests/quote-engine.test.js`
- Test: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/tests/scale-utils.test.js`

**Interfaces:**
- Produces: `applyScaleToBounds(boundsMm, scale)`, `applyScaleToVolumeMm3(volumeMm3, scale)`, `normalizeScaleInput(value)`
- Produces: `estimatePrintJob(input, siteConfig)` with hidden support allowance applied

- [ ] Write failing tests for scaled bounds, scaled volume, and support percent effects
- [ ] Run `node --test tests/scale-utils.test.js tests/quote-engine.test.js`
- [ ] Implement the minimal helper and quote changes
- [ ] Re-run `node --test tests/scale-utils.test.js tests/quote-engine.test.js`

### Task 2: QR Quote Payload Helpers

**Files:**
- Create: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/src/quote-qr.js`
- Test: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/tests/quote-qr.test.js`

**Interfaces:**
- Produces: `buildQuoteQrPayload(input)`, `formatQuoteReference(payload)`

- [ ] Write failing tests for payload shape and stable formatting
- [ ] Run `node --test tests/quote-qr.test.js`
- [ ] Implement the minimal payload helpers
- [ ] Re-run `node --test tests/quote-qr.test.js`

### Task 3: Admin and Customer UI

**Files:**
- Modify: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/index.html`
- Modify: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/admin-x.html`
- Modify: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/styles.css`
- Modify: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/src/app.js`
- Modify: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/src/admin.js`
- Modify: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/src/site-config.js`

**Interfaces:**
- Consumes: `supportPercent`, scale helpers, QR helpers, `estimatePrintJob`
- Produces: advanced scale controls, QR display area, admin support setting field

- [ ] Add the admin support-percent field
- [ ] Add the customer-facing `Advance` section with manual scale input and helper text
- [ ] Add QR markup and rendering flow for reliable quotes only
- [ ] Verify unreliable quotes still clear the QR area

### Task 4: Full Verification

**Files:**
- Test: `C:/Users/dekso/OneDrive/เดสก์ท็อป/print it  now/tests/*.test.js`

**Interfaces:**
- Consumes: all prior tasks
- Produces: verified static quote workflow

- [ ] Run `npm test`
- [ ] Smoke-check the browser flow with upload, scale change, and QR output
