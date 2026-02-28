import assert from "node:assert/strict";

import { withServer, waitFor } from "./helpers.mjs";

const mockSvg = `<svg id="MOCK_LOGO_ARCGRID_V1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#111" stroke-width="20"><path d="M96 384 L96 128 L256 128 L416 384 Z" /><path d="M176 300 L256 172 L336 300 Z" /></g></svg>`;

async function testHealth(baseUrl) {
  const response = await fetch(`${baseUrl}/api/health`);
  const json = await response.json();
  assert.equal(response.status, 200);
  assert.equal(json.ok, true);
}

async function testAnalyzeAndExport(baseUrl) {
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

  const exportSvgResp = await fetch(`${baseUrl}/api/v1/logo/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      analysisId: analysis.analysisId,
      format: "svg",
      includeLayers: ["logo", "guides", "annotations"],
    }),
  });

  const exportSvg = await exportSvgResp.json();
  assert.equal(exportSvgResp.status, 200);
  assert.equal(exportSvg.fileName.startsWith("guidepack-mock-"), true);
  const svgRaw = Buffer.from(exportSvg.fileBase64, "base64").toString("utf8");
  assert.equal(svgRaw.includes("id=\"guides-layer\""), true);

  const exportPdfResp = await fetch(`${baseUrl}/api/v1/logo/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      analysisId: analysis.analysisId,
      format: "pdf",
      includeLayers: ["guides"],
    }),
  });

  const exportPdf = await exportPdfResp.json();
  assert.equal(exportPdfResp.status, 200);
  const pdfRaw = Buffer.from(exportPdf.fileBase64, "base64").toString("utf8");
  assert.equal(pdfRaw.includes("layer=guides"), true);
}

async function testVectorize(baseUrl) {
  const submitResp = await fetch(`${baseUrl}/api/v1/vectorize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: "mock",
      imageBase64: "ZmFrZS1pbWFnZS1ieXRlcw==",
    }),
  });

  const submit = await submitResp.json();
  assert.equal(submitResp.status, 200);
  assert.ok(submit.jobId);

  let final = null;
  for (let i = 0; i < 30; i += 1) {
    const pollResp = await fetch(`${baseUrl}/api/v1/vectorize/${submit.jobId}`);
    const poll = await pollResp.json();
    if (poll.status === "done" || poll.status === "failed") {
      final = poll;
      break;
    }
    await waitFor(25);
  }

  assert.ok(final);
  assert.equal(final.status, "done");
  assert.equal(final.provider, "mock");
  assert.equal(typeof final.svgText, "string");
  assert.equal(final.svgText.includes("MOCK_LOGO_ARCGRID_V1"), true);
}

async function testInvalidSvg(baseUrl) {
  const response = await fetch(`${baseUrl}/api/v1/logo/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ svgText: "<svg></svg>" }),
  });
  const json = await response.json();
  assert.equal(response.status, 400);
  assert.equal(json.errorCode, "INVALID_SVG");
}

export async function runApiTests() {
  await withServer(async ({ baseUrl }) => {
    await testHealth(baseUrl);
    await testAnalyzeAndExport(baseUrl);
    await testVectorize(baseUrl);
    await testInvalidSvg(baseUrl);
  });
}
