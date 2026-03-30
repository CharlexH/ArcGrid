export const PREVIEW_SCALE_MIN = 1;
export const PREVIEW_SCALE_MAX = 3;
export const PREVIEW_SCALE_STEP = 0.25;

export function clampPreviewScale(scale) {
  if (!Number.isFinite(scale)) return PREVIEW_SCALE_MIN;
  return Math.max(PREVIEW_SCALE_MIN, Math.min(PREVIEW_SCALE_MAX, Number(scale)));
}

export function getPreviewPanLimits({
  viewportWidth,
  viewportHeight,
  contentWidth,
  contentHeight,
  scale,
}) {
  const safeScale = clampPreviewScale(scale);
  const overflowX = Math.max(0, (contentWidth * safeScale - viewportWidth) / 2);
  const overflowY = Math.max(0, (contentHeight * safeScale - viewportHeight) / 2);
  const minX = overflowX === 0 ? 0 : -overflowX;
  const minY = overflowY === 0 ? 0 : -overflowY;

  return {
    minX,
    maxX: overflowX,
    minY,
    maxY: overflowY,
  };
}

export function clampPreviewOffset(offset, metrics) {
  const limits = getPreviewPanLimits(metrics);
  const x = Number.isFinite(offset?.x) ? offset.x : 0;
  const y = Number.isFinite(offset?.y) ? offset.y : 0;

  return {
    x: Math.max(limits.minX, Math.min(limits.maxX, x)),
    y: Math.max(limits.minY, Math.min(limits.maxY, y)),
  };
}
