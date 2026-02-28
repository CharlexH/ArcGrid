import { solverSignature } from "../solver/index.mjs";

function svgEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildExportSvg({ analysis, includeLayers = ["logo", "guides", "annotations"], styleConfig = {} }) {
  const { input, bestSolution } = analysis;
  const { bbox } = input;

  const layers = [];

  const swL = bbox.width * 0.005;
  const swG = bbox.width * 0.002;
  const fwA = bbox.width * 0.03;
  const padX = bbox.width * 0.2;
  const padY = bbox.height * 0.2;

  let originalContent = "";
  if (input.raw) {
    const match = input.raw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    if (match) originalContent = match[1];
  }

  if (includeLayers.includes("logo")) {
    layers.push(`<g id="logo-layer" opacity="0.6">${originalContent}</g>`);
  }

  if (includeLayers.includes("guides")) {
    const opts = styleConfig || {};
    const lineColorStr = opts.lineColor || "#ff6d00";
    const circleColorStr = opts.circleColor || "#0057ff";
    const lineWeightMult = typeof opts.lineWeightMult === "number" ? opts.lineWeightMult : 2;
    const circleWeightMult = typeof opts.circleWeightMult === "number" ? opts.circleWeightMult : 2;

    const circles = bestSolution.circles
      .map((circle) => `<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="none" stroke="${circleColorStr}" stroke-width="${swG * circleWeightMult}" stroke-dasharray="${swG * circleWeightMult * 3} ${swG * circleWeightMult * 2}" data-role="${circle.role}"/>`)
      .join("\n");

    const lines = bestSolution.lines
      .map((line) => `<line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" stroke="${lineColorStr}" stroke-width="${swG * lineWeightMult}" stroke-dasharray="${swG * lineWeightMult * 2} ${swG * lineWeightMult * 2}" data-role="${line.role}"/>`)
      .join("\n");

    layers.push(`<g id="guides-layer">${circles}${lines}</g>`);
  }

  if (includeLayers.includes("annotations")) {
    layers.push(`<g id="annotations-layer"><text x="${bbox.minX}" y="${bbox.maxY + fwA * 1.5}" fill="#111" font-family="monospace" font-size="${fwA}">${solverSignature}</text><text x="${bbox.minX}" y="${bbox.maxY + fwA * 3}" fill="#111" font-family="monospace" font-size="${fwA}">score=${bestSolution.metrics.finalScore}</text></g>`);
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bbox.minX - padX} ${bbox.minY - padY} ${bbox.width + padX * 2} ${bbox.height + padY * 2 + fwA * 4}" data-analysis-id="${analysis.analysisId}">
  ${layers.join("\n")}
</svg>
`.trim();
}
