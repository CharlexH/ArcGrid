import assert from "node:assert/strict";

import { withServer } from "./helpers.mjs";

const mockSvg = `<svg id="MOCK_LOGO_ARCGRID_V1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#111" stroke-width="20"><path d="M96 384 L96 128 L256 128 L416 384 Z" /><path d="M176 300 L256 172 L336 300 Z" /></g></svg>`;

async function testHealth(baseUrl) {
  const response = await fetch(`${baseUrl}/api/health`);
  const json = await response.json();
  assert.equal(response.status, 200);
  assert.equal(json.ok, true);
}

async function testAnalyzeAndExport(baseUrl) {
  // --- Analyze ---
  const analyzeResp = await fetch(`${baseUrl}/api/v1/logo/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      svgText: mockSvg,
      strategy: "auto",
      constraints: { minScore: 0.5 },
    }),
  });

  const analysis = await analyzeResp.json();

  assert.equal(analyzeResp.status, 200);
  assert.ok(analysis.analysisId);
  assert.equal(analysis.signature, "GEOMETRIC_SOLVER=AG27");
  assert.ok(analysis.input);
  assert.ok(Array.isArray(analysis.input.paths));
  assert.equal(analysis.candidates.length, 1);
  assert.ok(analysis.bestSolution.metrics.finalScore > 0.5);

  // --- Export SVG (stateless: sends svgText, not analysisId) ---
  const exportSvgResp = await fetch(`${baseUrl}/api/v1/logo/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      svgText: mockSvg,
      format: "svg",
      includeLayers: ["logo", "guides", "annotations"],
    }),
  });

  const exportSvg = await exportSvgResp.json();
  assert.equal(exportSvgResp.status, 200);
  assert.equal(exportSvg.fileName.startsWith("guidepack-mock-"), true);
  const svgRaw = Buffer.from(exportSvg.fileBase64, "base64").toString("utf8");
  assert.equal(svgRaw.includes('id="guides-layer"'), true);

  // --- Export PDF (stateless) ---
  const exportPdfResp = await fetch(`${baseUrl}/api/v1/logo/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      svgText: mockSvg,
      format: "pdf",
      includeLayers: ["guides"],
    }),
  });

  const exportPdf = await exportPdfResp.json();
  assert.equal(exportPdfResp.status, 200);
  const pdfRaw = Buffer.from(exportPdf.fileBase64, "base64").toString("utf8");
  assert.equal(pdfRaw.includes("layer=guides"), true);
}


async function testInvalidSvg(baseUrl) {
  const response = await fetch(`${baseUrl}/api/v1/logo/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ svgText: "<svg></svg>" }),
  });
  const json = await response.json();
  assert.equal(response.status, 400);
  assert.equal(json.errorCode, "ANALYSIS_FAILED");
}

export async function runApiTests() {
  await withServer(async ({ baseUrl }) => {
    await testHealth(baseUrl);
    await testAnalyzeAndExport(baseUrl);
    await testInvalidSvg(baseUrl);
  });
}
