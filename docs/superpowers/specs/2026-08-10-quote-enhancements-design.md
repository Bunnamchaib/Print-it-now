# 3D Quote Enhancements Design

## Goal

Extend the existing static quote page with three operator-friendly features:

- hidden support allowance that increases estimated material usage
- manual scaling controls for customers
- QR code output that packages the finished quote for reuse

## Scope

- Add a configurable `supportPercent` value in admin settings
- Treat support as extra printed material on top of the estimated job
- Keep support hidden from customers as a separate line item
- Add an `Advance` section on the quote page with `Manual Scale (x)`
- Recalculate dimensions, volume, weight, time, and price from the chosen scale
- Generate a QR code only when a valid quote is available
- Store quote details in a deterministic JSON payload that another program can scan and parse

## Non-Goals

- Editable support structures or slicer-accurate support generation
- Exact target-height workflow in this round
- Backend storage or server-side QR lookup

## Product Decisions

### Hidden support allowance

- Support is represented as a percent multiplier configured by admin
- The allowance increases effective material volume, grams, and print time
- Customers only see the final combined estimates

### Manual scale

- The default scale is `1`
- Customers can open `Advance` and type a scale multiplier such as `2`
- Scale affects `x`, `y`, `z` linearly
- Scale affects `volume`, `material usage`, `weight`, and `time` cubically where appropriate through scaled solid volume
- A helper line explains the current height conversion so the field feels trustworthy

### QR quote payload

- A quote QR appears only when the system has a reliable quote
- The payload is JSON text encoded directly into the QR code
- The payload includes file name, material, color, infill, scale, dimensions, volume, weight, time, price, and a generated timestamp
- The same payload is also shown as compact text so the user can save or forward it if QR scanning is inconvenient

## Technical Approach

- Extend `DEFAULT_SITE_CONFIG.pricing` with `supportPercent`
- Keep pricing math in `src/quote-engine.js`
- Move scale and QR payload formatting into small pure helpers for testing
- Update `src/app.js` to own the advanced controls, scaled metrics, and QR rendering
- Use a lightweight browser QR library loaded from CDN because the site stays static

## Success Criteria

- Admin can set support percent in `-X`
- Customer can change scale and immediately get updated estimates
- Reliable quotes render a scannable QR code
- Unreliable files still block quoting and do not render a QR code
