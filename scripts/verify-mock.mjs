import assert from "node:assert/strict";

import { withServer, waitFor } from "../tests/helpers.mjs";

const mockSvg = `<svg id="MOCK_LOGO_ARCGRID_V1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#111" stroke-width="20"><path d="M96 384 L96 128 L256 128 L416 384 Z" /><path d="M176 300 L256 172 L336 300 Z" /></g></svg>`;

async function checkHealth(baseUrl) {
  const response = await fetch(`${baseUrl}/api/health`);
  const body = await response.json();
  assert.equal(response.status, 200, "health status should be 200");
  assert.equal(body.ok, true, "health payload should contain ok=true");
}

async function checkVectorize(baseUrl) {
  const submit = await fetch(`${baseUrl}/api/v1/vectorize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "nanabanana2", imageBase64: "ZmFrZQ==" }),
  });
  const payload = await submit.json();
  assert.equal(submit.status, 200, "vectorize submit should return 200");

  for (let i = 0; i < 40; i += 1) {
    const poll = await fetch(`${baseUrl}/api/v1/vectorize/${payload.jobId}`);
    const result = await poll.json();
    if (result.status === "done") {
      assert.equal(result.svgText.includes("MOCK_LOGO_ARCGRID_V1"), true, "vectorize result should include mock svg id");
      return result.svgText;
    }
    if (result.status === "failed") {
      throw new Error(`Vectorize failed: ${result.errorCode} ${result.errorMessage}`);
    }
    await waitFor(25);
  }

  throw new Error("Vectorize polling timeout");
}

async function checkAnalyzeAndExport(baseUrl, svgText) {
  const analyze = await fetch(`${baseUrl}/api/v1/logo/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ svgText, strategy: "auto", constraints: { minScore: 0.5 } }),
  });

  const analysis = await analyze.json();
  assert.equal(analyze.status, 200, "analyze should return 200");
  assert.equal(analysis.signature, "MOCK_SOLVER_SIGNATURE=AG26", "signature mismatch");
  assert.equal(analysis.candidates.length, 3, "candidate count mismatch");
  assert.equal(analysis.bestSolution.metrics.finalScore, 0.8731, "best score fingerprint mismatch");

  const exportSvg = await fetch(`${baseUrl}/api/v1/logo/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      analysisId: analysis.analysisId,
      format: "svg",
      includeLayers: ["logo", "guides", "annotations"],
    }),
  });

  const svg = await exportSvg.json();
  assert.equal(exportSvg.status, 200, "svg export should return 200");
  assert.equal(svg.fileName.startsWith("guidepack-mock-"), true, "svg filename prefix mismatch");
  const decodedSvg = Buffer.from(svg.fileBase64, "base64").toString("utf8");
  assert.equal(decodedSvg.includes("id=\"guides-layer\""), true, "guides layer missing in svg export");

  const exportPdf = await fetch(`${baseUrl}/api/v1/logo/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analysisId: analysis.analysisId, format: "pdf", includeLayers: ["guides"] }),
  });

  const pdf = await exportPdf.json();
  assert.equal(exportPdf.status, 200, "pdf export should return 200");
  const decodedPdf = Buffer.from(pdf.fileBase64, "base64").toString("utf8");
  assert.equal(decodedPdf.includes("layer=guides"), true, "pdf should include guides marker");

  const appHtml = await fetch(`${baseUrl}/`).then((r) => r.text());
  assert.equal(appHtml.includes("id=\"signature\""), true, "UI signature mount point missing");
}

await withServer(async ({ baseUrl }) => {
  await checkHealth(baseUrl);
  const svgText = (await checkVectorize(baseUrl)) || mockSvg;
  await checkAnalyzeAndExport(baseUrl, svgText);
});

console.log("verify:mock passed");
