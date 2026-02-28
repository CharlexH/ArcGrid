import { solverSignature } from "../solver/index.mjs";

function pdfEscape(text) {
  return String(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function buildExportPdf({ analysis }) {
  const lines = [
    "%PDF-1.4",
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >> endobj",
  ];

  const content = [
    "BT",
    "/F1 12 Tf",
    "72 740 Td",
    `(${pdfEscape("guidepack export")}) Tj`,
    "0 -18 Td",
    `(${pdfEscape(`analysisId=${analysis.analysisId}`)}) Tj`,
    "0 -18 Td",
    `(${pdfEscape("layer=guides")}) Tj`,
    "0 -18 Td",
    `(${pdfEscape(`score=${analysis.bestSolution.metrics.finalScore}`)}) Tj`,
    "0 -18 Td",
    `(${pdfEscape(solverSignature)}) Tj`,
    "ET",
  ].join("\n");

  lines.push(`4 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`);

  const xrefStart = lines.join("\n").length + 1;
  lines.push("xref");
  lines.push("0 5");
  lines.push("0000000000 65535 f ");
  lines.push("0000000010 00000 n ");
  lines.push("0000000060 00000 n ");
  lines.push("0000000117 00000 n ");
  lines.push("0000000248 00000 n ");
  lines.push(`trailer << /Root 1 0 R /Size 5 >>`);
  lines.push(`startxref\n${xrefStart}`);
  lines.push("%%EOF");

  return Buffer.from(lines.join("\n"), "utf8");
}
