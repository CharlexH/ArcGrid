import { ApiFailure } from "../errors.mjs";
import { sanitizeSvg } from "./sanitize.mjs";
import { parseTransform, applyTransform, multiplyTransform } from "./transform.mjs";

const PATH_TAG_REGEX = /<path\b[^>]*>/gi;
const POLYGON_TAG_REGEX = /<polygon\b[^>]*>/gi;
const POLYLINE_TAG_REGEX = /<polyline\b[^>]*>/gi;
const RECT_TAG_REGEX = /<rect\b[^>]*>/gi;
const CIRCLE_TAG_REGEX = /<circle\b[^>]*>/gi;
const ELLIPSE_TAG_REGEX = /<ellipse\b[^>]*>/gi;
const LINE_TAG_REGEX = /<line\b[^>]*>/gi;

function extractAttr(tag, name) {
  const regex = new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i");
  const match = tag.match(regex);
  return match ? match[2] : null;
}

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePointsAttr(pointsText) {
  if (!pointsText) return [];
  const numbers = pointsText
    .replace(/,/g, " ")
    .trim()
    .match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g);

  if (!numbers || numbers.length < 2) return [];

  const points = [];
  for (let i = 0; i < numbers.length - 1; i += 2) {
    const x = Number(numbers[i]);
    const y = Number(numbers[i + 1]);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      points.push({ anchor: [x, y], leftDirection: [x, y], rightDirection: [x, y] });
    }
  }
  return points;
}

function parsePathPoints(d) {
  const tokens = d
    .replace(/,/g, " ")
    .trim()
    .match(/[AaCcHhLlMmQqSsTtVvZz]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g);

  if (!tokens || tokens.length === 0) return [];

  const points = [];
  let i = 0;
  let x = 0, y = 0;
  let cmd = "M";
  let startX = 0, startY = 0;

  const pushAnchor = (nx, ny, h1, h2) => {
    if (Number.isFinite(nx) && Number.isFinite(ny)) {
      if (points.length === 0) {
        startX = nx; startY = ny;
      }
      if (points.length > 0 && h1) {
        points[points.length - 1].rightDirection = [h1.x, h1.y];
      }
      x = nx;
      y = ny;
      points.push({
        anchor: [x, y],
        leftDirection: h2 ? [h2.x, h2.y] : [x, y],
        rightDirection: [x, y]
      });
    }
  };

  while (i < tokens.length) {
    const token = tokens[i];

    if (/^[AaCcHhLlMmQqSsTtVvZz]$/.test(token)) {
      cmd = token;
      i += 1;
      if (cmd === "Z" || cmd === "z") {
        pushAnchor(startX, startY);
      }
      continue;
    }

    if (cmd === "M" || cmd === "L" || cmd === "T") {
      pushAnchor(Number(tokens[i]), Number(tokens[i + 1]));
      i += 2;
      continue;
    }

    if (cmd === "m" || cmd === "l" || cmd === "t") {
      pushAnchor(x + Number(tokens[i]), y + Number(tokens[i + 1]));
      i += 2;
      continue;
    }

    if (cmd === "H") {
      pushAnchor(Number(tokens[i]), y);
      i += 1;
      continue;
    }

    if (cmd === "h") {
      pushAnchor(x + Number(tokens[i]), y);
      i += 1;
      continue;
    }

    if (cmd === "V") {
      pushAnchor(x, Number(tokens[i]));
      i += 1;
      continue;
    }

    if (cmd === "v") {
      pushAnchor(x, y + Number(tokens[i]));
      i += 1;
      continue;
    }

    if (cmd === "C") {
      const cx1 = Number(tokens[i]);
      const cy1 = Number(tokens[i + 1]);
      const cx2 = Number(tokens[i + 2]);
      const cy2 = Number(tokens[i + 3]);
      const nx = Number(tokens[i + 4]);
      const ny = Number(tokens[i + 5]);
      pushAnchor(nx, ny, { x: cx1, y: cy1 }, { x: cx2, y: cy2 });
      i += 6;
      continue;
    }

    if (cmd === "c") {
      const cx1 = x + Number(tokens[i]);
      const cy1 = y + Number(tokens[i + 1]);
      const cx2 = x + Number(tokens[i + 2]);
      const cy2 = y + Number(tokens[i + 3]);
      const nx = x + Number(tokens[i + 4]);
      const ny = y + Number(tokens[i + 5]);
      pushAnchor(nx, ny, { x: cx1, y: cy1 }, { x: cx2, y: cy2 });
      i += 6;
      continue;
    }

    if (cmd === "S" || cmd === "Q") {
      const cx1 = Number(tokens[i]);
      const cy1 = Number(tokens[i + 1]);
      const nx = Number(tokens[i + 2]);
      const ny = Number(tokens[i + 3]);
      // For S/Q we simplify by using the provided control point as BOTH handles for ArcGrid's Bezier logic
      // This ensures they are recognized as "Curved" segments
      pushAnchor(nx, ny, { x: cx1, y: cy1 }, { x: cx1, y: cy1 });
      i += 4;
      continue;
    }

    if (cmd === "s" || cmd === "q") {
      const cx1 = x + Number(tokens[i]);
      const cy1 = y + Number(tokens[i + 1]);
      const nx = x + Number(tokens[i + 2]);
      const ny = y + Number(tokens[i + 3]);
      pushAnchor(nx, ny, { x: cx1, y: cy1 }, { x: cx1, y: cy1 });
      i += 4;
      continue;
    }

    if (cmd === "A" || cmd === "a") {
      const nx = (cmd === "A") ? Number(tokens[i + 5]) : x + Number(tokens[i + 5]);
      const ny = (cmd === "A") ? Number(tokens[i + 6]) : y + Number(tokens[i + 6]);
      // Arcs are complex to approximate. To prevent them being "Straight", 
      // we provide a handle that is slightly offset from the diagonal.
      const hx = (x + nx) / 2 + 1e-4;
      const hy = (y + ny) / 2 + 1e-4;
      pushAnchor(nx, ny, { x: hx, y: hy }, { x: hx, y: hy });
      i += 7;
      continue;
    }

    i += 1;
  }

  return points;
}

function parsePolygonLike(svgText, regex, closedDefault, idPrefix, startIndex) {
  const results = [];
  let match;
  let index = startIndex;

  while ((match = regex.exec(svgText)) !== null) {
    const tag = match[0];
    const points = parsePointsAttr(extractAttr(tag, "points"));
    if (points.length < 2) continue;

    const closed = closedDefault || points.length > 2;
    if (closed) {
      points.push(JSON.parse(JSON.stringify(points[0])));
    }

    results.push({
      id: `${idPrefix}_${index}`,
      d: "",
      points,
      closed,
    });
    index += 1;
  }

  return { items: results, nextIndex: index };
}

function parseRectangles(svgText, startIndex) {
  const results = [];
  let index = startIndex;
  let match;

  while ((match = RECT_TAG_REGEX.exec(svgText)) !== null) {
    const tag = match[0];
    const x = parseNumber(extractAttr(tag, "x"), 0);
    const y = parseNumber(extractAttr(tag, "y"), 0);
    const width = parseNumber(extractAttr(tag, "width"), 0);
    const height = parseNumber(extractAttr(tag, "height"), 0);
    if (width <= 0 || height <= 0) continue;

    const points = [
      { anchor: [x, y], leftDirection: [x, y], rightDirection: [x, y] },
      { anchor: [x + width, y], leftDirection: [x + width, y], rightDirection: [x + width, y] },
      { anchor: [x + width, y + height], leftDirection: [x + width, y + height], rightDirection: [x + width, y + height] },
      { anchor: [x, y + height], leftDirection: [x, y + height], rightDirection: [x, y + height] },
      { anchor: [x, y], leftDirection: [x, y], rightDirection: [x, y] },
    ];

    results.push({ id: `rect_${index}`, d: "", points, closed: true });
    index += 1;
  }

  return { items: results, nextIndex: index };
}

function parseCircles(svgText, startIndex) {
  const results = [];
  let index = startIndex;
  let match;

  while ((match = CIRCLE_TAG_REGEX.exec(svgText)) !== null) {
    const tag = match[0];
    const cx = parseNumber(extractAttr(tag, "cx"), 0);
    const cy = parseNumber(extractAttr(tag, "cy"), 0);
    const r = parseNumber(extractAttr(tag, "r"), 0);
    if (r <= 0) continue;

    const k = 0.552284749831 * r;
    const points = [
      { anchor: [cx, cy - r], leftDirection: [cx - k, cy - r], rightDirection: [cx + k, cy - r] },
      { anchor: [cx + r, cy], leftDirection: [cx + r, cy - k], rightDirection: [cx + r, cy + k] },
      { anchor: [cx, cy + r], leftDirection: [cx + k, cy + r], rightDirection: [cx - k, cy + r] },
      { anchor: [cx - r, cy], leftDirection: [cx - r, cy + k], rightDirection: [cx - r, cy - k] },
      { anchor: [cx, cy - r], leftDirection: [cx - k, cy - r], rightDirection: [cx + k, cy - r] },
    ];

    results.push({ id: `circle_${index}`, d: "", points, closed: true });
    index += 1;
  }

  return { items: results, nextIndex: index };
}

function parseEllipses(svgText, startIndex) {
  const results = [];
  let index = startIndex;
  let match;

  while ((match = ELLIPSE_TAG_REGEX.exec(svgText)) !== null) {
    const tag = match[0];
    const cx = parseNumber(extractAttr(tag, "cx"), 0);
    const cy = parseNumber(extractAttr(tag, "cy"), 0);
    const rx = parseNumber(extractAttr(tag, "rx"), 0);
    const ry = parseNumber(extractAttr(tag, "ry"), 0);
    if (rx <= 0 || ry <= 0) continue;

    const kx = 0.552284749831 * rx;
    const ky = 0.552284749831 * ry;
    const points = [
      { anchor: [cx, cy - ry], leftDirection: [cx - kx, cy - ry], rightDirection: [cx + kx, cy - ry] },
      { anchor: [cx + rx, cy], leftDirection: [cx + rx, cy - ky], rightDirection: [cx + rx, cy + ky] },
      { anchor: [cx, cy + ry], leftDirection: [cx + kx, cy + ry], rightDirection: [cx - kx, cy + ry] },
      { anchor: [cx - rx, cy], leftDirection: [cx - rx, cy + ky], rightDirection: [cx - rx, cy - ky] },
      { anchor: [cx, cy - ry], leftDirection: [cx - kx, cy - ry], rightDirection: [cx + kx, cy - ry] },
    ];

    results.push({ id: `ellipse_${index}`, d: "", points, closed: true });
    index += 1;
  }

  return { items: results, nextIndex: index };
}

function parseLines(svgText, startIndex) {
  // Moved to be parsed inline
}

export function parseSvg(svgText) {
  if (typeof svgText !== "string" || !svgText.includes("<svg")) {
    throw new ApiFailure(400, "INVALID_SVG", "SVG payload is missing or invalid.");
  }

  // Preprocess and optimize SVG string
  const optimizedSvg = sanitizeSvg(svgText);

  // We no longer strip <defs> and <clipPath> because some SVGs (like test9.svg)
  // use clip paths as their primary logo shape mask, which we need to analyse.
  const cleanedSvg = optimizedSvg;

  const paths = [];
  let index = 1;

  // Transform stack
  const ctmStack = [[1, 0, 0, 1, 0, 0]]; // Start with identity matrix
  let currentCtm = ctmStack[0];

  // We need to parse tags in order to build the hierarchical CTM
  const TAG_REGEX = /<(\/?)(g|path|polygon|polyline|rect|circle|ellipse|line)\b([^>]*)>/gi;
  let match;

  while ((match = TAG_REGEX.exec(cleanedSvg)) !== null) {
    const isClosing = match[1] === "/";
    const tagName = match[2].toLowerCase();
    const tagContent = match[0];
    const isSelfClosing = tagContent.endsWith("/>");

    if (isClosing) {
      if (tagName === "g" && ctmStack.length > 1) {
        ctmStack.pop();
        currentCtm = ctmStack[ctmStack.length - 1];
      }
      continue;
    }

    const transformAttr = extractAttr(tagContent, "transform");
    let nodeCtm = currentCtm;

    if (transformAttr) {
      const parsedTransform = parseTransform(transformAttr);
      if (parsedTransform) {
        nodeCtm = multiplyTransform(currentCtm, parsedTransform);
      }
    }

    // Push to stack if it's a group
    if (tagName === "g" && !isSelfClosing) {
      ctmStack.push(nodeCtm);
      currentCtm = nodeCtm;
      continue;
    }

    // Apply CTM to points generated by parsers
    const transformPoints = (points) => {
      for (const pt of points) {
        pt.anchor = applyTransform(pt.anchor, nodeCtm);
        pt.leftDirection = applyTransform(pt.leftDirection, nodeCtm);
        pt.rightDirection = applyTransform(pt.rightDirection, nodeCtm);
      }
    };

    if (tagName === "path") {
      const d = extractAttr(tagContent, "d");
      if (d) {
        const points = parsePathPoints(d);
        if (points.length > 1) {
          transformPoints(points);
          paths.push({
            id: `path_${index++}`,
            d, // keeping raw d for legacy, though not strictly accurate after transform
            points,
            closed: /z\s*$/i.test(d.trim())
          });
        }
      }
    } else if (tagName === "polygon" || tagName === "polyline") {
      const ptsAttr = extractAttr(tagContent, "points");
      if (ptsAttr) {
        const points = parsePointsAttr(ptsAttr);
        if (points.length > 1) {
          const closed = tagName === "polygon" || points.length > 2;
          if (closed) {
            points.push(JSON.parse(JSON.stringify(points[0])));
          }
          transformPoints(points);
          paths.push({
            id: `${tagName}_${index++}`,
            d: "",
            points,
            closed
          });
        }
      }
    } else if (tagName === "rect") {
      const x = parseNumber(extractAttr(tagContent, "x"), 0);
      const y = parseNumber(extractAttr(tagContent, "y"), 0);
      const width = parseNumber(extractAttr(tagContent, "width"), 0);
      const height = parseNumber(extractAttr(tagContent, "height"), 0);
      if (width > 0 && height > 0) {
        const points = [
          { anchor: [x, y], leftDirection: [x, y], rightDirection: [x, y] },
          { anchor: [x + width, y], leftDirection: [x + width, y], rightDirection: [x + width, y] },
          { anchor: [x + width, y + height], leftDirection: [x + width, y + height], rightDirection: [x + width, y + height] },
          { anchor: [x, y + height], leftDirection: [x, y + height], rightDirection: [x, y + height] },
          { anchor: [x, y], leftDirection: [x, y], rightDirection: [x, y] },
        ];
        transformPoints(points);
        paths.push({ id: `rect_${index++}`, d: "", points, closed: true });
      }
    } else if (tagName === "circle") {
      const cx = parseNumber(extractAttr(tagContent, "cx"), 0);
      const cy = parseNumber(extractAttr(tagContent, "cy"), 0);
      const r = parseNumber(extractAttr(tagContent, "r"), 0);
      if (r > 0) {
        const k = 0.552284749831 * r;
        const points = [
          { anchor: [cx, cy - r], leftDirection: [cx - k, cy - r], rightDirection: [cx + k, cy - r] },
          { anchor: [cx + r, cy], leftDirection: [cx + r, cy - k], rightDirection: [cx + r, cy + k] },
          { anchor: [cx, cy + r], leftDirection: [cx + k, cy + r], rightDirection: [cx - k, cy + r] },
          { anchor: [cx - r, cy], leftDirection: [cx - r, cy + k], rightDirection: [cx - r, cy - k] },
          { anchor: [cx, cy - r], leftDirection: [cx - k, cy - r], rightDirection: [cx + k, cy - r] },
        ];
        transformPoints(points);
        paths.push({ id: `circle_${index++}`, d: "", points, closed: true });
      }
    } else if (tagName === "ellipse") {
      const cx = parseNumber(extractAttr(tagContent, "cx"), 0);
      const cy = parseNumber(extractAttr(tagContent, "cy"), 0);
      const rx = parseNumber(extractAttr(tagContent, "rx"), 0);
      const ry = parseNumber(extractAttr(tagContent, "ry"), 0);
      if (rx > 0 && ry > 0) {
        const kx = 0.552284749831 * rx;
        const ky = 0.552284749831 * ry;
        const points = [
          { anchor: [cx, cy - ry], leftDirection: [cx - kx, cy - ry], rightDirection: [cx + kx, cy - ry] },
          { anchor: [cx + rx, cy], leftDirection: [cx + rx, cy - ky], rightDirection: [cx + rx, cy + ky] },
          { anchor: [cx, cy + ry], leftDirection: [cx + kx, cy + ry], rightDirection: [cx - kx, cy + ry] },
          { anchor: [cx - rx, cy], leftDirection: [cx - rx, cy + ky], rightDirection: [cx - rx, cy - ky] },
          { anchor: [cx, cy - ry], leftDirection: [cx - kx, cy - ry], rightDirection: [cx + kx, cy - ry] },
        ];
        transformPoints(points);
        paths.push({ id: `ellipse_${index++}`, d: "", points, closed: true });
      }
    } else if (tagName === "line") {
      const x1 = parseNumber(extractAttr(tagContent, "x1"), 0);
      const y1 = parseNumber(extractAttr(tagContent, "y1"), 0);
      const x2 = parseNumber(extractAttr(tagContent, "x2"), 0);
      const y2 = parseNumber(extractAttr(tagContent, "y2"), 0);
      if (x1 !== x2 || y1 !== y2) {
        const points = [
          { anchor: [x1, y1], leftDirection: [x1, y1], rightDirection: [x1, y1] },
          { anchor: [x2, y2], leftDirection: [x2, y2], rightDirection: [x2, y2] },
        ];
        transformPoints(points);
        paths.push({ id: `line_${index++}`, d: "", points, closed: false });
      }
    }
  }

  if (paths.length === 0) {
    throw new ApiFailure(400, "INVALID_SVG", "No supported geometry found in SVG.");
  }

  const svgMatch = svgText.match(/<svg([^>]*)>/i);
  let explicitViewBox = null;
  if (svgMatch) {
    const vbAttr = extractAttr(svgMatch[0], "viewBox");
    if (vbAttr) {
      const parts = vbAttr.split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts.every(Number.isFinite)) {
        explicitViewBox = {
          minX: parts[0],
          minY: parts[1],
          width: parts[2],
          height: parts[3],
          maxX: parts[0] + parts[2],
          maxY: parts[1] + parts[3],
        };
      }
    }
  }

  const mockId = svgText.includes("MOCK_LOGO_ARCGRID_V1") ? "MOCK_LOGO_ARCGRID_V1" : null;

  return {
    raw: svgText,
    paths,
    mockId,
    explicitViewBox,
  };
}
