import { solverSignature } from "../solver/index.mjs";

function svgEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildExportSvg({ analysis, includeLayers = ["logo", "guides", "annotations"] }) {
  const { input, bestSolution } = analysis;
  const { bbox } = input;

  const layers = [];

  const swL = bbox.width * 0.005;
  const swG = bbox.width * 0.002;
  const fwA = bbox.width * 0.03;
  const padX = bbox.width * 0.2;
  const padY = bbox.height * 0.2;

  if (includeLayers.includes("logo")) {
    const paths = input.paths
      .map((path) => `<path d="${svgEscape(path.d)}" fill="none" stroke="#111" stroke-width="${swL}"/>`)
      .join("\n");
    layers.push(`<g id="logo-layer">${paths}</g>`);
  }

  if (includeLayers.includes("guides")) {
    const circles = bestSolution.circles
      .map((circle) => `<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="none" stroke="#1f5bff" stroke-width="${swG * 2}" stroke-dasharray="${swG * 6} ${swG * 4}" data-role="${circle.role}"/>`)
      .join("\n");

    const lines = bestSolution.lines
      .map((line) => `<line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" stroke="#ff5b1f" stroke-width="${swG * 1.5}" stroke-dasharray="${swG * 4} ${swG * 4}" data-role="${line.role}"/>`)
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
