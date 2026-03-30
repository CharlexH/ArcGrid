import assert from "node:assert/strict";

import {
  PREVIEW_SCALE_MAX,
  PREVIEW_SCALE_MIN,
  clampPreviewOffset,
  clampPreviewScale,
  getPreviewPanLimits,
} from "../src/lib/preview/viewport.mjs";

export function runPreviewViewportTests() {
  assert.equal(clampPreviewScale(0.5), PREVIEW_SCALE_MIN);
  assert.equal(clampPreviewScale(4), PREVIEW_SCALE_MAX);
  assert.equal(clampPreviewScale(2.25), 2.25);

  assert.deepEqual(
    getPreviewPanLimits({
      viewportWidth: 600,
      viewportHeight: 500,
      contentWidth: 400,
      contentHeight: 300,
      scale: 1,
    }),
    { minX: 0, maxX: 0, minY: 0, maxY: 0 },
  );

  assert.deepEqual(
    clampPreviewOffset(
      { x: 250, y: -220 },
      {
        viewportWidth: 600,
        viewportHeight: 500,
        contentWidth: 400,
        contentHeight: 300,
        scale: 2,
      },
    ),
    { x: 100, y: -50 },
  );
}
