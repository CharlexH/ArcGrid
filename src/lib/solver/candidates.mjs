import {
  isStraightSegment,
  drawLineAcrossBoundaries,
  makeLineKey,
  getCircleCenterFrom2AnchorArc,
  isApproxCircularArc
} from "./math.mjs";

// Maximum number of guide elements to keep (prevents visual noise on complex logos)
const MAX_LINES = 60;
const MAX_CIRCLES = 40;

// Minimum segment length as a fraction of bbox width
// 0.03 = 3% — filters out small text strokes while keeping structural lines
const MIN_SEG_RATIO = 0.01;

// Angle dedup tolerance in degrees — lines within this angle AND position are considered duplicates
const ANGLE_DEDUP_DEG = 1.0;
// Position dedup tolerance as fraction of bbox diagonal
const POS_DEDUP_RATIO = 0.02;

/**
 * Compute normalized angle (0–180°) of a line for deduplication.
 * We use 0–180 range because a line from A→B and B→A are the same line.
 */
function lineAngleDeg(x1, y1, x2, y2) {
  let angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  if (angle < 0) angle += 180;
  if (angle >= 180) angle -= 180;
  return angle;
}

/**
 * Compute signed perpendicular distance from the origin to the line.
 * This distinguishes parallel lines at different positions.
 */
function linePerpendicularOffset(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1e-9) return 0;
  // Signed distance from origin to the line: (x1*dy - y1*dx) / len
  return (x1 * dy - y1 * dx) / len;
}

/**
 * Dedup lines by angle + position: two lines are duplicates only if they have
 * both similar angle AND similar perpendicular offset (i.e., they represent the
 * same extended line). Parallel lines at different positions are preserved.
 */
function deduplicateByAngleAndPosition(lines, toleranceDeg, posTolerance) {
  if (lines.length === 0) return lines;

  // Sort by segLen descending so the first encountered in each bucket is the longest
  const sorted = [...lines].sort((a, b) => (b._segLen || 0) - (a._segLen || 0));
  const kept = [];
  const usedKeys = []; // { angle, offset }

  for (const line of sorted) {
    const angle = lineAngleDeg(line.x1, line.y1, line.x2, line.y2);
    const offset = linePerpendicularOffset(line.x1, line.y1, line.x2, line.y2);

    const isDuplicate = usedKeys.some(k => {
      const angleDiff = Math.abs(k.angle - angle);
      const angleClose = angleDiff < toleranceDeg || angleDiff > (180 - toleranceDeg);
      const posClose = Math.abs(k.offset - offset) < posTolerance;
      return angleClose && posClose;
    });

    if (!isDuplicate) {
      usedKeys.push({ angle, offset });
      kept.push(line);
    }
  }

  return kept;
}

function getGeometricGuides(paths, bbox, mode, toleranceMult = 1.0, shouldDedup = true) {
  const lines = [];
  const circles = [];
  const lineKeys = new Set();
  const circleKeys = new Set();

  const minLen = bbox.width * MIN_SEG_RATIO;

  for (const path of paths) {
    const pts = path.points;
    if (!pts || pts.length < 2) continue;

    const n = pts.length;
    for (let i = 0; i < n; i++) {
      if (!path.closed && i === n - 1) break;
      const pt1 = pts[i];
      const pt2 = pts[(i + 1) % n];

      // Skip short segments to reduce noise from text strokes and small details
      const dx = pt2.anchor[0] - pt1.anchor[0];
      const dy = pt2.anchor[1] - pt1.anchor[1];
      const segLen = Math.sqrt(dx * dx + dy * dy);
      if (segLen < minLen) continue;

      const isStraight = isStraightSegment(pt1, pt2);

      // Handle Straight Segments (Line Extensions)
      if (isStraight && (mode === "ALL" || mode === "STRAIGHT")) {
        const intersections = drawLineAcrossBoundaries(
          pt1.anchor,
          pt2.anchor,
          bbox.minX,
          bbox.minY,
          bbox.maxX,
          bbox.maxY
        );

        if (intersections && intersections.length === 2) {
          const key = makeLineKey(intersections[0], intersections[1]);
          if (!shouldDedup || !lineKeys.has(key)) {
            lineKeys.add(key);
            lines.push({
              x1: intersections[0][0],
              y1: intersections[0][1],
              x2: intersections[1][0],
              y2: intersections[1][1],
              role: "axis",
              _segLen: segLen // keep for sorting/dedup, stripped later
            });
          }
        }
      }

      // Handle Curved Segments (Circle Reconstruction)
      if (!isStraight && (mode === "ALL" || mode === "CURVE")) {
        const center = getCircleCenterFrom2AnchorArc(
          pt1.anchor,
          pt1.rightDirection,
          pt2.anchor,
          pt2.leftDirection
        );

        if (center) {
          const dx = pt1.anchor[0] - center[0];
          const dy = pt1.anchor[1] - center[1];
          const radius = Math.sqrt(dx * dx + dy * dy);

          // Pass toleranceMult to isApproxCircularArc
          if (radius > 0 && isApproxCircularArc(pt1.anchor, pt1.rightDirection, pt2.leftDirection, pt2.anchor, center, radius, toleranceMult)) {
            const key = `${center[0].toFixed(3)},${center[1].toFixed(3)},${radius.toFixed(3)}`;
            if (!shouldDedup || !circleKeys.has(key)) {
              circleKeys.add(key);
              circles.push({
                cx: center[0],
                cy: center[1],
                r: radius,
                role: "construction"
              });
            }
          }
        }
      }
    }
  }

  // --- Post-processing: reduce noise ---

  // Compute position tolerance from bbox diagonal
  const bboxDiag = Math.sqrt(bbox.width * bbox.width + bbox.height * bbox.height);
  const posTolerance = bboxDiag * POS_DEDUP_RATIO;

  // 1. Angle + position deduplication for lines
  //    Lines must have BOTH similar angle AND similar position to be merged
  let filteredLines = deduplicateByAngleAndPosition(lines, ANGLE_DEDUP_DEG, posTolerance);

  // 2. Cap maximum count (keep longest segments)
  if (filteredLines.length > MAX_LINES) {
    filteredLines = filteredLines.slice(0, MAX_LINES);
  }

  // 3. Clean up internal properties
  for (const l of filteredLines) { delete l._segLen; }

  // 4. Cap circles (keep largest radii — most structurally significant)
  let filteredCircles = circles;
  if (filteredCircles.length > MAX_CIRCLES) {
    filteredCircles = [...filteredCircles].sort((a, b) => b.r - a.r).slice(0, MAX_CIRCLES);
  }

  return { lines: filteredLines, circles: filteredCircles };
}

export function generateCandidates({ paths, bbox, strategy, constraints = {}, mockId }) {
  const toleranceMult = constraints.toleranceMult ?? 1.0;

  if (mockId === "MOCK_LOGO_ARCGRID_V1") {
    // Keep mock fallback exactly as it was for UI demonstration fixed state
    return [
      {
        id: "cand_mock_auto",
        label: "Auto Balanced",
        circles: [
          { cx: bbox.cx, cy: bbox.cy, r: Math.min(bbox.width, bbox.height) * 0.5, role: "fit" },
          { cx: bbox.cx, cy: bbox.cy, r: Math.min(bbox.width, bbox.height) * 0.35, role: "construction" },
        ],
        lines: [
          { x1: bbox.cx, y1: bbox.minY, x2: bbox.cx, y2: bbox.maxY, role: "axis" },
          { x1: bbox.minX, y1: bbox.cy, x2: bbox.maxX, y2: bbox.cy, role: "axis" }
        ],
        metrics: { fitError: 0.1122, symmetryScore: 0.934, complexityPenalty: 0.171, finalScore: 0.8731 },
        explanation: "Balanced circle+grid constraints with central symmetry anchor.",
      }
    ];
  }

  // Generate three variants based on the algorithm modes, passing toleranceMult
  const allGeom = getGeometricGuides(paths, bbox, "ALL", toleranceMult, true);
  const straightGeom = getGeometricGuides(paths, bbox, "STRAIGHT", toleranceMult, true);
  const curveGeom = getGeometricGuides(paths, bbox, "CURVE", toleranceMult, true);

  const calcComplexity = (g) => Math.min(1.0, (g.lines.length + g.circles.length) * 0.05);

  const autoCand = {
    id: "cand_geometry_auto",
    label: "Full Construction",
    circles: allGeom.circles,
    lines: allGeom.lines,
    metrics: {
      fitError: 0.10,
      symmetryScore: 0.90,
      complexityPenalty: calcComplexity(allGeom),
      finalScore: Math.max(0.1, 0.95 - calcComplexity(allGeom) * 0.3),
    },
    explanation: "Extracts all straight guide extensions and underlying circular origins.",
  };

  const curvesCand = {
    id: "cand_geometry_circles",
    label: "Circles Only (Curves)",
    circles: curveGeom.circles,
    lines: curveGeom.lines, // will be empty
    metrics: {
      fitError: 0.15,
      symmetryScore: 0.85,
      complexityPenalty: calcComplexity(curveGeom),
      finalScore: Math.max(0.1, 0.85 - calcComplexity(curveGeom) * 0.3),
    },
    explanation: "Focuses exclusively on reconstructing origins for bezier curves.",
  };

  const linesCand = {
    id: "cand_geometry_lines",
    label: "Lines Only (Straight)",
    circles: straightGeom.circles, // will be empty
    lines: straightGeom.lines,
    metrics: {
      fitError: 0.20,
      symmetryScore: 0.80,
      complexityPenalty: calcComplexity(straightGeom),
      finalScore: Math.max(0.1, 0.80 - calcComplexity(straightGeom) * 0.3),
    },
    explanation: "Limits extraction to boundary-extended straight segments only.",
  };

  const curvesCount = curveGeom.circles.length;
  const linesCount = straightGeom.lines.length;

  // The user explicitly requested that curve-heavy graphics should default to NO straight lines.
  // Straight lines can be very noisy, so we strongly preference curves if they are prominent.
  if (curvesCount > 0 && curvesCount >= linesCount * 0.5) {
    return [curvesCand, autoCand, linesCand];
  } else if (linesCount > 0 && linesCount > curvesCount * 2) {
    return [linesCand, autoCand, curvesCand];
  }

  return [autoCand, curvesCand, linesCand];
}
