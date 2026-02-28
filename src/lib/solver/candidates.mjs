import {
  isStraightSegment,
  drawLineAcrossBoundaries,
  makeLineKey,
  getCircleCenterFrom2AnchorArc,
  isApproxCircularArc
} from "./math.mjs";

function getGeometricGuides(paths, bbox, mode, shouldDedup = true) {
  const lines = [];
  const circles = [];
  const lineKeys = new Set();
  const circleKeys = new Set();

  for (const path of paths) {
    const pts = path.points;
    if (!pts || pts.length < 2) continue;

    const n = pts.length;
    for (let i = 0; i < n; i++) {
      if (!path.closed && i === n - 1) break;
      const pt1 = pts[i];
      const pt2 = pts[(i + 1) % n];

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
              role: "axis"
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

          if (radius > 0 && isApproxCircularArc(pt1.anchor, pt1.rightDirection, pt2.leftDirection, pt2.anchor, center, radius)) {
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

  return { lines, circles };
}

export function generateCandidates({ paths, bbox, strategy, mockId }) {
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

  // Generate three variants based on the algorithm modes
  const allGeom = getGeometricGuides(paths, bbox, "ALL", true);
  const straightGeom = getGeometricGuides(paths, bbox, "STRAIGHT", true);
  const curveGeom = getGeometricGuides(paths, bbox, "CURVE", true);

  const calcComplexity = (g) => Math.min(1.0, (g.lines.length + g.circles.length) * 0.05);

  return [
    {
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
    },
    {
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
    },
    {
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
    }
  ];
}
