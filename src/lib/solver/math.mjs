export function rot90(v) {
  return [-v[1], v[0]];
}

export function lineIntersectionPointDir(p, v, q, w) {
  const denom = v[0] * w[1] - v[1] * w[0];
  if (Math.abs(denom) < 1e-9) return null;
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const t = (dx * w[1] - dy * w[0]) / denom;
  return [p[0] + v[0] * t, p[1] + v[1] * t];
}

export function isStraightSegment(pt1, pt2) {
  const epsilon = 0.001;
  const rDx = Math.abs(pt1.rightDirection[0] - pt1.anchor[0]);
  const rDy = Math.abs(pt1.rightDirection[1] - pt1.anchor[1]);
  const lDx = Math.abs(pt2.leftDirection[0] - pt2.anchor[0]);
  const lDy = Math.abs(pt2.leftDirection[1] - pt2.anchor[1]);
  return (rDx < epsilon && rDy < epsilon && lDx < epsilon && lDy < epsilon);
}

export function getCircleCenterFrom2AnchorArc(p1, h1, p3, h2) {
  const t1 = [h1[0] - p1[0], h1[1] - p1[1]];
  const t2 = [p3[0] - h2[0], p3[1] - h2[1]];

  const n1 = rot90(t1);
  const n2 = rot90(t2);

  return lineIntersectionPointDir(p1, n1, p3, n2);
}

export function drawLineAcrossBoundaries(p1, p2, left, top, right, bottom) {
  const x1 = p1[0], y1 = p1[1];
  const x2 = p2[0], y2 = p2[1];
  const intersections = [];
  const epsilon = 0.001;

  if (Math.abs(x1 - x2) < epsilon) {
    intersections.push([x1, top]);
    intersections.push([x1, bottom]);
  } else if (Math.abs(y1 - y2) < epsilon) {
    intersections.push([left, y1]);
    intersections.push([right, y1]);
  } else {
    const m = (y2 - y1) / (x2 - x1);
    const b = y1 - m * x1;

    const minX = Math.min(left, right);
    const maxX = Math.max(left, right);
    const minY = Math.min(top, bottom);
    const maxY = Math.max(top, bottom);

    const yAtLeft = m * minX + b;
    if (yAtLeft >= minY - epsilon && yAtLeft <= maxY + epsilon) intersections.push([minX, yAtLeft]);

    const yAtRight = m * maxX + b;
    if (yAtRight >= minY - epsilon && yAtRight <= maxY + epsilon) intersections.push([maxX, yAtRight]);

    const xAtTop = (minY - b) / m;
    if (xAtTop >= minX - epsilon && xAtTop <= maxX + epsilon) intersections.push([xAtTop, minY]);

    const xAtBottom = (maxY - b) / m;
    if (xAtBottom >= minX - epsilon && xAtBottom <= maxX + epsilon) intersections.push([xAtBottom, maxY]);
  }

  if (intersections.length >= 2) {
    const uniquePoints = [intersections[0]];
    for (let j = 1; j < intersections.length; j++) {
      const dx = intersections[j][0] - uniquePoints[0][0];
      const dy = intersections[j][1] - uniquePoints[0][1];
      if (Math.sqrt(dx * dx + dy * dy) > epsilon) {
        uniquePoints.push(intersections[j]);
        break;
      }
    }
    if (uniquePoints.length >= 2) {
      return uniquePoints.slice(0, 2);
    }
  }
  return null;
}

export function makeLineKey(a, b) {
  const pointKey = (p) => `${Number(p[0]).toFixed(3)},${Number(p[1]).toFixed(3)}`;
  const ka = pointKey(a);
  const kb = pointKey(b);
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
}

export function dot2(a, b) { return a[0] * b[0] + a[1] * b[1]; }
export function len2(v) { return Math.sqrt(v[0] * v[0] + v[1] * v[1]); }
export function sub2(a, b) { return [a[0] - b[0], a[1] - b[1]]; }

export function cubicBezierPoint(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const uu = u * u;
  const uuu = uu * u;
  const tt = t * t;
  const ttt = tt * t;
  return [
    uuu * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + ttt * p3[0],
    uuu * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + ttt * p3[1]
  ];
}

export function isApproxCircularArc(p1, h1, h2, p3, center, radius) {
  if (!center || !(radius > 0)) return false;
  const tol = Math.max(0.2, radius * 0.01);
  const d1 = len2(sub2(p1, center));
  const d3 = len2(sub2(p3, center));
  if (Math.abs(d1 - radius) > tol) return false;
  if (Math.abs(d3 - radius) > tol) return false;

  const mid = cubicBezierPoint(p1, h1, h2, p3, 0.5);
  const dm = len2(sub2(mid, center));
  if (Math.abs(dm - radius) > tol) return false;

  const t1 = sub2(h1, p1);
  const t2 = sub2(p3, h2);
  const r1 = sub2(p1, center);
  const r3 = sub2(p3, center);

  if (len2(t1) < 1e-6 || len2(t2) < 1e-6) return false;

  const dot1 = dot2(r1, t1);
  const dot2Val = dot2(r3, t2);
  if (Math.abs(dot1) > tol * len2(t1)) return false;
  if (Math.abs(dot2Val) > tol * len2(t2)) return false;

  return true;
}
