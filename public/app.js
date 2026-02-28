const i18n = {
  en: {
    title: "ArcGrid Guide Lab",
    desc: "Auto-generate construction lines for logos and export editable assets.",
    uploadSvg: "Upload SVG File",
    dragDrop: "Drag and drop or click to browse",
    pasteSvg: "Or paste SVG Code",
    analyzeBtn: "Analyze SVG",
    phase2Title: "Experimental Features",
    phase2Desc: "Requires Nana Banana API",
    uploadImg: "Upload Image",
    vectorizeBtn: "Vectorize Image + Analyze",
    previewTitle: "Preview",
    exportSvg: "Export SVG",
    exportPdf: "Export PDF",
    layerLogo: "logo",
    layerGuides: "guides",
    layerAnnotations: "annotations",
    curve: "Curve",
    line: "Line",
    statusReady: "Ready.",
    noAnalysis: "No analysis yet.",
    analyzing: "Analyzing SVG...",
    analyzed: "Analyzed. bestScore=",
    uploadingSvg: "Loaded SVG file: {0}. Analyzing...",
    uploadFailed: "Failed to read/analyze SVG file.",
    loadedImg: "Loaded image: ",
    submitting: "Submitting vectorize job...",
    vectorizationFailed: "Vectorization did not complete.",
    vectorizationRateLimit: "AI is busy or rate-limited. Please try again in a minute.",
    vectorized: "Vectorized ({0}) and analyzed.",
    runAnalyzeFirst: "Run analyze first.",
    exported: "Exported ",
    signature: "Signature: ",
    cFull: "Full",
    cCurves: "Curves",
    cLines: "Lines",
    copyright: "© 2024 Charlex"
  },
  zh: {
    title: "ArcGrid 辅助线生成",
    desc: "为图标自动生成几何结构辅助线，并导出可编辑的矢量资源。",
    uploadSvg: "上传 SVG 文件",
    dragDrop: "拖拽或点击浏览",
    pasteSvg: "或粘贴 SVG 代码",
    analyzeBtn: "分析 SVG",
    phase2Title: "实验功能",
    phase2Desc: "需要配置 Nana Banana API",
    uploadImg: "上传图片",
    vectorizeBtn: "矢量化图片并分析",
    previewTitle: "预览",
    exportSvg: "导出 SVG",
    exportPdf: "导出 PDF",
    layerLogo: "图标",
    layerGuides: "参考线",
    layerAnnotations: "标注",
    curve: "曲线",
    line: "直线",
    statusReady: "就绪。",
    noAnalysis: "暂无分析结果。",
    analyzing: "正在分析 SVG...",
    analyzed: "分析完成。最高得分=",
    uploadingSvg: "已加载 SVG 文件：{0}。正在分析...",
    uploadFailed: "读取/分析 SVG 文件失败。",
    loadedImg: "已加载图片：",
    submitting: "正在提交矢量化任务...",
    vectorizationFailed: "图像矢量化未完成。",
    vectorizationRateLimit: "AI 忙碌或触发频率限制，请稍后（约一分钟）重试。",
    vectorized: "已矢量化 ({0}) 并分析完成。",
    runAnalyzeFirst: "请先执行分析。",
    exported: "已导出 ",
    signature: "特征签名：",
    cFull: "全部",
    cCurves: "曲线",
    cLines: "直线",
    copyright: "© 2024 Charlex"
  }
};

let currentLang = document.querySelector('input[name="lang"]:checked')?.value || "zh";

function t(key, ...args) {
  let str = i18n[currentLang][key] || key;
  args.forEach((arg, i) => {
    str = str.replace(`{${i}}`, arg);
  });
  return str;
}

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
const layersControl = document.querySelector("#layersControl");

const MOCK_FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 64 64"><path fill="#89664c" d="m52.2 7.9l2.5 2.6L60 7c2.2-.3 3.2-5-2.8-3.5c-1.5.4-3.8 1.5-5 4.4"/><path fill="#594640" d="M61.1 7c1.8-.7.5-2.8.5-2.8s.4 1.5-2.4 1.9c-4.1.6-5.2 3.6-5.2 3.6l.7.7s2.4-1.8 6.4-3.4"/><path fill="#699635" d="M53.5 6c8.8 9.3 1.2 23.3-7.6 39.5c-.7 1.4-1.5 2.7-2.2 4.1C37.5 61.1 28.4 62.3 23.5 62c-5.5-.4-11-3-14.7-6.9c-3.8-4-6.3-9.8-6.7-15.7c-.4-5.2.5-15.1 11.1-22c1.2-.8 2.5-1.6 3.7-2.4C31.8 5.2 44.7-3.3 53.5 6"/><g fill="#c7e755"><path d="M15 19.9C29.5 10.5 44.3-.5 52 7.7c7.7 8.1-7.5 18.6-16 34.5C27.5 58 17.1 60.7 10.2 53.5C3.4 46.2.4 29.4 15 19.9"/><path d="M11.8 51.8c1.6 1.6 3.3 2.5 5.3 2.6c5.5.4 11.6-4.8 16.7-14.2c2.9-5.5 6.6-10.3 9.9-14.6c5.2-6.7 10-13.1 6.9-16.4c-5.3-5.6-19 3.4-30 10.7c-1.2.8-2.5 1.6-3.7 2.4c-9.1 5.9-9.9 14-9.6 18.3c.3 4.4 2 8.6 4.5 11.2"/></g><path fill="#ffce31" d="M11.8 51.8c1.6 1.6 3.3 2.5 5.3 2.6c5.5.4 11.6-4.8 16.7-14.2c2.9-5.5 6.6-10.3 9.9-14.6c5.2-6.7 10-13.1 6.9-16.4c-5.3-5.6-19 3.4-30 10.7c-1.2.8-2.5 1.6-3.7 2.4c-9.1 5.9-9.9 14-9.6 18.3c.3 4.4 2 8.6 4.5 11.2" opacity=".33"/><path fill="#89664c" d="M17.2 27c6-6.6 14.8-6 16.6-2S33 35 29 39.4c-4.1 4.4-9.6 7.3-13.3 5.5c-3.8-1.8-4.5-11.3 1.5-17.9"/><path fill="#d3976e" d="M16.5 33.6c2.6-3.8 5.3-4.8 4.8-3.9c-.4.9-1.8 3.1-2.6 5.1c-.9 2-1.4 3.7-2.4 4.3c-1 .8-2.3-1.4.2-5.5"/><path fill="#594640" d="M26.4 36.7c-3.5 3.7-7.7 6.6-11.7 7.5c.3.3.6.6 1 .7c3.8 1.9 9.2-1 13.3-5.5C33 35 35.6 29 33.8 25c-.2-.4-.4-.7-.7-1c-.7 4.2-3.3 8.9-6.7 12.7"/></svg>`;

function updateUI() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (i18n[currentLang][key]) {
      if (el.tagName === 'LABEL' && el.querySelector('input')) {
        for (const child of el.childNodes) {
          if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
            child.textContent = " " + i18n[currentLang][key];
            break;
          }
        }
      } else {
        el.textContent = i18n[currentLang][key];
      }
    }
  });

  if (state.analysis) {
    signatureEl.textContent = `${t('signature')}${state.analysis.signature}`;
  } else {
    signatureEl.textContent = "";
    if (document.querySelector("#svgCanvas span")) {
      document.querySelector("#svgCanvas span").textContent = t('noAnalysis');
    }
  }

  if (statusEl.textContent === i18n['en'].statusReady || statusEl.textContent === i18n['zh'].statusReady) {
    statusEl.textContent = t('statusReady');
  } else if (statusEl.textContent === i18n['en'].copyright || statusEl.textContent === i18n['zh'].copyright) {
    statusEl.textContent = t('copyright');
  }

  if (state.analysis) renderPreview();
}

document.querySelectorAll('input[name="lang"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    currentLang = e.target.value;
    updateUI();
  });
});

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
    svgCanvas.innerHTML = `<span style="color: #98a2ad">${t('noAnalysis')}</span>`;
    candidateList.style.display = "none";
    signatureEl.textContent = "";
    if (layersControl) layersControl.style.display = "none";
    return;
  }
  if (layersControl) layersControl.style.display = "flex";

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

  signatureEl.textContent = `${t('signature')}${state.analysis.signature}`;

  if (state.analysis.candidates && state.analysis.candidates.length > 0) {
    candidateList.style.display = "flex";
    candidateList.innerHTML = state.analysis.candidates
      .map((candidate) => {
        let shortLabel = candidate.label;
        if (shortLabel.includes("Full")) shortLabel = t('cFull');
        else if (shortLabel.includes("Circles")) shortLabel = t('cCurves');
        else if (shortLabel.includes("Lines")) shortLabel = t('cLines');

        const checked = candidate.id === state.selectedCandidateId ? "checked" : "";
        return `<label><input type="radio" name="candidate" value="${candidate.id}" ${checked} /> ${shortLabel} (${candidate.metrics.finalScore})</label>`;
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
  setStatus(t('analyzing'));
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
  setStatus(`${t('analyzed')}${data.bestSolution.metrics.finalScore}`);
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
    setStatus(t('uploadingSvg', file.name));
    await analyzeSvg(text);
  } catch (error) {
    setStatus(error.message || t('uploadFailed'));
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
    setStatus(`${t('loadedImg')}${file.name}`);
  };
  reader.readAsDataURL(file);
});

vectorizeBtn.addEventListener("click", async () => {
  try {
    setStatus(t('submitting'));
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
    for (let i = 0; i < 150; i += 1) {
      const poll = await fetch(`/api/v1/vectorize/${createData.jobId}`);
      job = await poll.json();
      if (job.status === "done" || job.status === "failed") break;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (!job || job.status !== "done") {
      throw new Error(job?.errorMessage || t('vectorizationFailed'));
    }

    svgInput.value = job.svgText;
    await analyzeSvg(job.svgText);
    setStatus(t('vectorized', job.providerMode));
  } catch (error) {
    if (error.message.includes("RATE_LIMIT") || error.message.includes("429")) {
      setStatus(t('vectorizationRateLimit'));
    } else {
      setStatus(error.message);
    }
  }
});

async function exportResult(format) {
  if (!state.analysis) {
    setStatus(t('runAnalyzeFirst'));
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

  setStatus(`${t('exported')}${data.fileName}`);
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
setStatus(t('copyright'));
updateUI();
