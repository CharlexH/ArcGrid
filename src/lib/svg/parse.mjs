import { ApiFailure } from "../errors.mjs";

const PATH_TAG_REGEX = /<path\b[^>]*>/gi;
const POLYGON_TAG_REGEX = /<polygon\b[^>]*>/gi;
const POLYLINE_TAG_REGEX = /<polyline\b[^>]*>/gi;
const RECT_TAG_REGEX = /<rect\b[^>]*>/gi;
const CIRCLE_TAG_REGEX = /<circle\b[^>]*>/gi;
const ELLIPSE_TAG_REGEX = /<ellipse\b[^>]*>/gi;
const LINE_TAG_REGEX = /<line\b[^>]*>/gi;

function extractAttr(tag, name) {
  const regex = new RegExp(`${name}\\s*=\\s*(["'])(.*?)\\1`, "i");
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

    if (cmd === "S" || cmd === "Q" || cmd === "s" || cmd === "q") {
      pushAnchor(Number(tokens[i + 2]), Number(tokens[i + 3]));
      i += 4;
      continue;
    }

    if (cmd === "A" || cmd === "a") {
      pushAnchor(Number(tokens[i + 5]), Number(tokens[i + 6]));
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
  const results = [];
  let index = startIndex;
  let match;

  while ((match = LINE_TAG_REGEX.exec(svgText)) !== null) {
    const tag = match[0];
    const x1 = parseNumber(extractAttr(tag, "x1"), 0);
    const y1 = parseNumber(extractAttr(tag, "y1"), 0);
    const x2 = parseNumber(extractAttr(tag, "x2"), 0);
    const y2 = parseNumber(extractAttr(tag, "y2"), 0);

    if (x1 === x2 && y1 === y2) continue;

    results.push({
      id: `line_${index}`,
      d: "",
      points: [
        { anchor: [x1, y1], leftDirection: [x1, y1], rightDirection: [x1, y1] },
        { anchor: [x2, y2], leftDirection: [x2, y2], rightDirection: [x2, y2] },
      ],
      closed: false,
    });
    index += 1;
  }

  return { items: results, nextIndex: index };
}

export function parseSvg(svgText) {
  if (typeof svgText !== "string" || !svgText.includes("<svg")) {
    throw new ApiFailure(400, "INVALID_SVG", "SVG payload is missing or invalid.");
  }

  // Strip non-rendering containers so their children aren't matched as geometry
  const cleanedSvg = svgText
    .replace(/<defs[\s\S]*?<\/defs>/gi, "")
    .replace(/<clipPath[\s\S]*?<\/clipPath>/gi, "");

  const paths = [];
  let index = 1;
  let match;

  while ((match = PATH_TAG_REGEX.exec(cleanedSvg)) !== null) {
    const tag = match[0];
    const d = extractAttr(tag, "d");
    if (!d) continue;

    const points = parsePathPoints(d);
    const closed = /z\s*$/i.test(d.trim());

    if (points.length > 1) {
      paths.push({
        id: `path_${index}`,
        d,
        points,
        closed,
      });
      index += 1;
    }
  }

  const polygon = parsePolygonLike(cleanedSvg, POLYGON_TAG_REGEX, true, "polygon", index);
  paths.push(...polygon.items);
  index = polygon.nextIndex;

  const polyline = parsePolygonLike(cleanedSvg, POLYLINE_TAG_REGEX, false, "polyline", index);
  paths.push(...polyline.items);
  index = polyline.nextIndex;

  const rects = parseRectangles(cleanedSvg, index);
  paths.push(...rects.items);
  index = rects.nextIndex;

  const circles = parseCircles(cleanedSvg, index);
  paths.push(...circles.items);
  index = circles.nextIndex;

  const ellipses = parseEllipses(cleanedSvg, index);
  paths.push(...ellipses.items);
  index = ellipses.nextIndex;

  const lines = parseLines(cleanedSvg, index);
  paths.push(...lines.items);

  if (paths.length === 0) {
    throw new ApiFailure(400, "INVALID_SVG", "No supported geometry found in SVG.");
  }

  const mockId = svgText.includes("MOCK_LOGO_ARCGRID_V1") ? "MOCK_LOGO_ARCGRID_V1" : null;

  return {
    raw: svgText,
    paths,
    mockId,
  };
}
