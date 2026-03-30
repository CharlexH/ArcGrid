# Preview Zoom And Pan Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `+` and `-` controls to the right preview toolbar so the SVG preview can zoom from `1x` to `3x` and be dragged with mouse or touch/pointer input.

**Architecture:** Keep export behavior unchanged and implement zoom/pan only in the preview surface. Extract preview viewport math into a small pure module so scale clamping and pan bounds can be tested independently, then wire those helpers into `public/app.js` with Pointer Events and a transform-based preview wrapper.

**Tech Stack:** Vanilla JS, static HTML, Tailwind-generated CSS, Node `assert` test runner.

---

### Task 1: Add failing viewport math tests

**Files:**
- Create: `tests/preview-viewport.test.mjs`
- Modify: `tests/run-tests.mjs`

**Step 1: Write the failing test**

Cover:
- scale is clamped to `1` minimum
- scale is clamped to `3` maximum
- panning remains `0,0` when content does not overflow
- panning is clamped to overflow bounds when zoomed in

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because preview viewport helpers do not exist yet.

### Task 2: Implement preview viewport helpers

**Files:**
- Create: `src/lib/preview/viewport.mjs`
- Test: `tests/preview-viewport.test.mjs`

**Step 1: Write minimal implementation**

Add helpers for:
- clamping scale between `1` and `3`
- computing horizontal and vertical pan limits from viewport size, content size, and scale
- clamping offsets after drag or zoom changes

**Step 2: Run test to verify it passes**

Run: `npm test`
Expected: PASS for the new viewport test and existing API tests.

### Task 3: Add preview controls and viewport wrapper

**Files:**
- Modify: `public/index.html`
- Modify: `src/styles/input.css`

**Step 1: Update markup**

Add:
- a compact two-button zoom control using `+` and `-`
- a preview viewport wrapper inside `#svgCanvas`
- a preview stage element that can receive CSS transforms

**Step 2: Add styles**

Define:
- button layout matching the export button height
- viewport clipping and drag cursor states
- transform origin and touch behavior for the preview stage

### Task 4: Wire zoom and pan interactions

**Files:**
- Modify: `public/app.js`
- Modify: `src/lib/preview/viewport.mjs`

**Step 1: Keep preview state in JS**

Track:
- `previewScale`
- `previewOffsetX`
- `previewOffsetY`
- active pointer drag session

**Step 2: Connect controls**

Implement:
- `+` increases by `0.25`
- `-` decreases by `0.25`
- scale remains within `1..3`
- offsets are clamped after every scale change

**Step 3: Connect dragging**

Use Pointer Events on the preview viewport:
- pointer down starts dragging only when zoomed in
- pointer move updates offsets
- pointer up/cancel ends dragging
- touch and mouse both work through the same path

### Task 5: Re-render and verify

**Files:**
- Modify: `public/app.js`
- Test: `tests/preview-viewport.test.mjs`
- Test: `tests/api.test.mjs`

**Step 1: Preserve state across preview redraws**

Ensure changing candidate, colors, tolerance, or visibility layers keeps the current zoom/pan while re-rendering the SVG.

**Step 2: Run full verification**

Run: `npm test`
Expected: PASS

Run: `npm run build:css`
Expected: PASS
