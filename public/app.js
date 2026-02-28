const state = {
  analysis: null,
  selectedCandidateId: null,
  imageBase64: null,
};

const svgInput = document.querySelector("#svgInput");
const svgFile = document.querySelector("#svgFile");
const imageUrlInput = document.querySelector("#imageUrl");
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

const MOCK_FALLBACK_SVG = `<svg id="MOCK_LOGO_ARCGRID_V1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#111" stroke-width="20"><path d="M96 384 L96 128 L256 128 L416 384 Z" /><path d="M176 300 L256 172 L336 300 Z" /></g></svg>`;

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
    signatureEl.textContent = "Signature: -";
    return;
  }

  const layerSet = new Set(selectedLayers());
  const { bbox } = state.analysis.input;
  const candidate = selectedCandidate();

  const swL = bbox.width * 0.005;
  const swG = bbox.width * 0.002;
  const fwA = bbox.width * 0.03;

  const logoLayer = layerSet.has("logo")
    ? state.analysis.input.paths
      .map((path) => `<path d="${path.d}" fill="none" stroke="#111" stroke-width="${swL}"/>`)
      .join("\n")
    : "";

  const guideCircles = layerSet.has("guides")
    ? candidate.circles
      .map(
        (circle) =>
          `<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="none" stroke="#0057ff" stroke-width="${swG * 2}" stroke-dasharray="${swG * 6} ${swG * 4}"/>`,
      )
      .join("\n")
    : "";

  const guideLines = layerSet.has("guides")
    ? candidate.lines
      .map(
        (line) =>
          `<line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" stroke="#ff6d00" stroke-width="${swG * 1.5}" stroke-dasharray="${swG * 4} ${swG * 4}"/>`,
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

  candidateList.innerHTML = state.analysis.candidates
    .map((candidate) => {
      const active = candidate.id === state.selectedCandidateId ? "active" : "";
      return `<button class="candidate-item ${active}" data-candidate-id="${candidate.id}"><span>${candidate.label}</span><span>score ${candidate.metrics.finalScore}</span></button>`;
    })
    .join("");

  candidateList.querySelectorAll("button[data-candidate-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedCandidateId = button.dataset.candidateId;
      renderPreview();
    });
  });
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
        imageUrl: imageUrlInput.value.trim() || undefined,
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

svgInput.value = MOCK_FALLBACK_SVG;
setStatus("Loaded built-in mock SVG. Click Analyze SVG to start.");
