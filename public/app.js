const state = {
  analysis: null,
  selectedCandidateId: null,
  imageBase64: null,
};

const svgInput = document.querySelector("#svgInput");
const svgFile = document.querySelector("#svgFile");
const controlsWrapper = document.querySelector("#controlsWrapper");

const imageFileInput = document.querySelector("#imageFile");
const analyzeBtn = document.querySelector("#analyzeBtn");
const vectorizeBtn = document.querySelector("#vectorizeBtn");
const exportSvgBtn = document.querySelector("#exportSvgBtn");
const exportPdfBtn = document.querySelector("#exportPdfBtn");
const signatureEl = document.querySelector("#signature");
const statusEl = document.querySelector("#status");
const svgCanvas = document.querySelector("#svgCanvas");
const strategySelect = document.querySelector("#strategy");
const candidateList = document.querySelector("#candidateList");
const toggleLogo = document.querySelector("#toggleLogo");
const toggleGuides = document.querySelector("#toggleGuides");
const toggleAnnotations = document.querySelector("#toggleAnnotations");

const MOCK_FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 64 64"><path fill="#89664c" d="m52.2 7.9l2.5 2.6L60 7c2.2-.3 3.2-5-2.8-3.5c-1.5.4-3.8 1.5-5 4.4"/><path fill="#594640" d="M61.1 7c1.8-.7.5-2.8.5-2.8s.4 1.5-2.4 1.9c-4.1.6-5.2 3.6-5.2 3.6l.7.7s2.4-1.8 6.4-3.4"/><path fill="#699635" d="M53.5 6c8.8 9.3 1.2 23.3-7.6 39.5c-.7 1.4-1.5 2.7-2.2 4.1C37.5 61.1 28.4 62.3 23.5 62c-5.5-.4-11-3-14.7-6.9c-3.8-4-6.3-9.8-6.7-15.7c-.4-5.2.5-15.1 11.1-22c1.2-.8 2.5-1.6 3.7-2.4C31.8 5.2 44.7-3.3 53.5 6"/><g fill="#c7e755"><path d="M15 19.9C29.5 10.5 44.3-.5 52 7.7c7.7 8.1-7.5 18.6-16 34.5C27.5 58 17.1 60.7 10.2 53.5C3.4 46.2.4 29.4 15 19.9"/><path d="M11.8 51.8c1.6 1.6 3.3 2.5 5.3 2.6c5.5.4 11.6-4.8 16.7-14.2c2.9-5.5 6.6-10.3 9.9-14.6c5.2-6.7 10-13.1 6.9-16.4c-5.3-5.6-19 3.4-30 10.7c-1.2.8-2.5 1.6-3.7 2.4c-9.1 5.9-9.9 14-9.6 18.3c.3 4.4 2 8.6 4.5 11.2"/></g><path fill="#ffce31" d="M11.8 51.8c1.6 1.6 3.3 2.5 5.3 2.6c5.5.4 11.6-4.8 16.7-14.2c2.9-5.5 6.6-10.3 9.9-14.6c5.2-6.7 10-13.1 6.9-16.4c-5.3-5.6-19 3.4-30 10.7c-1.2.8-2.5 1.6-3.7 2.4c-9.1 5.9-9.9 14-9.6 18.3c.3 4.4 2 8.6 4.5 11.2" opacity=".33"/><path fill="#89664c" d="M17.2 27c6-6.6 14.8-6 16.6-2S33 35 29 39.4c-4.1 4.4-9.6 7.3-13.3 5.5c-3.8-1.8-4.5-11.3 1.5-17.9"/><path fill="#d3976e" d="M16.5 33.6c2.6-3.8 5.3-4.8 4.8-3.9c-.4.9-1.8 3.1-2.6 5.1c-.9 2-1.4 3.7-2.4 4.3c-1 .8-2.3-1.4.2-5.5"/><path fill="#594640" d="M26.4 36.7c-3.5 3.7-7.7 6.6-11.7 7.5c.3.3.6.6 1 .7c3.8 1.9 9.2-1 13.3-5.5C33 35 35.6 29 33.8 25c-.2-.4-.4-.7-.7-1c-.7 4.2-3.3 8.9-6.7 12.7"/></svg>`;

function setStatus(text) {
  statusEl.textContent = text;
}

function selectedLayers() {
  const layers = [];
  if (toggleLogo.checked) layers.push("logo");
  if (toggleGuides.checked) layers.push("guides");
  if (toggleAnnotations.checked) layers.push("annotations");
  return layers;
}

function selectedCandidate() {
  if (!state.analysis) return null;
  return (
    state.analysis.candidates.find((candidate) => candidate.id === state.selectedCandidateId) ||
    state.analysis.bestSolution
  );
}

function renderPreview() {
  if (!state.analysis) {
    svgCanvas.innerHTML = `<span style="color: #98a2ad">No analysis yet.</span>`;
    candidateList.innerHTML = "";
    candidateList.style.display = "none";
    signatureEl.textContent = "Signature: -";
    return;
  }

  const layerSet = new Set(selectedLayers());
  const { bbox } = state.analysis.input;
  const candidate = selectedCandidate();

  const swL = bbox.width * 0.005;
  const swG = bbox.width * 0.002;
  const fwA = bbox.width * 0.03;

  let originalContent = "";
  if (state.analysis.input.raw) {
    const rawSvg = state.analysis.input.raw;
    const match = rawSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    if (match) {
      originalContent = match[1];
    }
  }

  const logoLayer = layerSet.has("logo")
    ? `<g opacity="0.6">${originalContent}</g>`
    : "";

  const lineColorStr = document.querySelector("#lineColor")?.value || "#ff6d00";
  const circleColorStr = document.querySelector("#circleColor")?.value || "#0057ff";

  // Weights act as multipliers against the responsive base size swG
  const lineWeightMult = parseFloat(document.querySelector("#lineWeight")?.value || "0.15") * 10;
  const circleWeightMult = parseFloat(document.querySelector("#circleWeight")?.value || "0.15") * 10;

  const guideCircles = layerSet.has("guides")
    ? candidate.circles
      .map(
        (circle) =>
          `<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="none" stroke="${circleColorStr}" stroke-width="${swG * circleWeightMult}" stroke-dasharray="${swG * circleWeightMult * 3} ${swG * circleWeightMult * 2}"/>`,
      )
      .join("\n")
    : "";

  const guideLines = layerSet.has("guides")
    ? candidate.lines
      .map(
        (line) =>
          `<line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" stroke="${lineColorStr}" stroke-width="${swG * lineWeightMult}" stroke-dasharray="${swG * lineWeightMult * 2} ${swG * lineWeightMult * 2}"/>`,
      )
      .join("\n")
    : "";

  const annotationLayer = layerSet.has("annotations")
    ? `<text x="${bbox.minX}" y="${bbox.maxY + fwA * 1.5}" fill="#222" font-family="monospace" font-size="${fwA}">${state.analysis.signature}</text><text x="${bbox.minX}" y="${bbox.maxY + fwA * 3}" fill="#222" font-family="monospace" font-size="${fwA}">score=${candidate.metrics.finalScore}</text>`
    : "";

  const padX = bbox.width * 0.2;
  const padY = bbox.height * 0.2;
  svgCanvas.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bbox.minX - padX} ${bbox.minY - padY} ${bbox.width + padX * 2} ${bbox.height + padY * 2 + fwA * 4}" style="width: 100%; max-height: 560px;">\n${logoLayer}\n${guideCircles}\n${guideLines}\n${annotationLayer}\n</svg>`;

  signatureEl.textContent = `Signature: ${state.analysis.signature}`;

  if (state.analysis.candidates && state.analysis.candidates.length > 0) {
    candidateList.style.display = "flex";
    candidateList.innerHTML = state.analysis.candidates
      .map((candidate) => {
        let shortLabel = candidate.label;
        if (shortLabel.includes("Full")) shortLabel = "Full";
        else if (shortLabel.includes("Circles")) shortLabel = "Curves";
        else if (shortLabel.includes("Lines")) shortLabel = "Lines";

        const checked = candidate.id === state.selectedCandidateId ? "checked" : "";
        return `<label><input type="radio" name="candidate" value="${candidate.id}" ${checked} />${shortLabel} (${candidate.metrics.finalScore})</label>`;
      })
      .join("");

    candidateList.querySelectorAll("input[type='radio']").forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.target.checked) {
          state.selectedCandidateId = e.target.value;
          renderPreview();
        }
      });
    });
  } else {
    candidateList.style.display = "none";
    candidateList.innerHTML = "";
  }
}

async function analyzeSvg(svgText) {
  setStatus("Analyzing SVG...");
  const response = await fetch("/api/v1/logo/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      svgText,
      strategy: strategySelect.value,
      constraints: {
        minScore: 0.5,
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${data.errorCode}: ${data.errorMessage}`);
  }

  state.analysis = data;
  state.selectedCandidateId = data.bestSolution.id;
  setStatus(`Analyzed. bestScore=${data.bestSolution.metrics.finalScore}`);
  if (controlsWrapper) controlsWrapper.style.display = "flex";
  renderPreview();
}

analyzeBtn.addEventListener("click", async () => {
  const rawSvg = svgInput.value.trim() || MOCK_FALLBACK_SVG;
  try {
    await analyzeSvg(rawSvg);
  } catch (error) {
    setStatus(error.message);
  }
});

svgFile.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    svgInput.value = text;
    setStatus(`Loaded SVG file: ${file.name}. Analyzing...`);
    await analyzeSvg(text);
  } catch (error) {
    setStatus(error.message || "Failed to read/analyze SVG file.");
  }
});

imageFileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    state.imageBase64 = null;
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const result = String(reader.result || "");
    const payload = result.includes(",") ? result.split(",")[1] : result;
    state.imageBase64 = payload;
    setStatus(`Loaded image: ${file.name}`);
  };
  reader.readAsDataURL(file);
});

vectorizeBtn.addEventListener("click", async () => {
  try {
    setStatus("Submitting vectorize job...");
    const createResp = await fetch("/api/v1/vectorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "nanabanana2",
        imageBase64: state.imageBase64,
      }),
    });

    const createData = await createResp.json();
    if (!createResp.ok) {
      throw new Error(`${createData.errorCode}: ${createData.errorMessage}`);
    }

    let job;
    for (let i = 0; i < 25; i += 1) {
      const poll = await fetch(`/api/v1/vectorize/${createData.jobId}`);
      job = await poll.json();
      if (job.status === "done" || job.status === "failed") break;
      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    if (!job || job.status !== "done") {
      throw new Error(job?.errorMessage || "Vectorization did not complete.");
    }

    svgInput.value = job.svgText;
    await analyzeSvg(job.svgText);
    setStatus(`Vectorized (${job.providerMode}) and analyzed.`);
  } catch (error) {
    setStatus(error.message);
  }
});

async function exportResult(format) {
  if (!state.analysis) {
    setStatus("Run analyze first.");
    return;
  }

  const response = await fetch("/api/v1/logo/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      analysisId: state.analysis.analysisId,
      format,
      includeLayers: selectedLayers(),
      styleConfig: {
        lineColor: document.querySelector("#lineColor")?.value || "#ff6d00",
        circleColor: document.querySelector("#circleColor")?.value || "#0057ff",
        lineWeightMult: parseFloat(document.querySelector("#lineWeight")?.value || "0.15") * 10,
        circleWeightMult: parseFloat(document.querySelector("#circleWeight")?.value || "0.15") * 10,
      }
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${data.errorCode}: ${data.errorMessage}`);
  }

  const link = document.createElement("a");
  link.href = `data:${data.mimeType};base64,${data.fileBase64}`;
  link.download = data.fileName;
  document.body.append(link);
  link.click();
  link.remove();

  setStatus(`Exported ${data.fileName}`);
}

exportSvgBtn.addEventListener("click", async () => {
  try {
    await exportResult("svg");
  } catch (error) {
    setStatus(error.message);
  }
});

exportPdfBtn.addEventListener("click", async () => {
  try {
    await exportResult("pdf");
  } catch (error) {
    setStatus(error.message);
  }
});

[toggleLogo, toggleGuides, toggleAnnotations].forEach((checkbox) => {
  checkbox.addEventListener("change", renderPreview);
});

[document.querySelector("#lineColor"), document.querySelector("#circleColor"), document.querySelector("#lineWeight"), document.querySelector("#circleWeight")].forEach((input) => {
  input?.addEventListener("input", renderPreview);
});

svgInput.value = MOCK_FALLBACK_SVG;
setStatus("© 2024 Charlex");
