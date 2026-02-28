import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";

dotenv.config();

import { ApiFailure } from "../lib/errors.mjs";
import { analyzeLogo } from "../lib/solver/index.mjs";
import { vectorizeInput } from "../lib/vectorize/provider.mjs";
import { buildExportSvg } from "../lib/export/svg-export.mjs";
import { buildExportPdf } from "../lib/export/pdf-export.mjs";
import {
  createVectorJob,
  updateVectorJob,
  getVectorJob,
  saveAnalysis,
  getAnalysis,
} from "./store.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(body));
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiFailure(400, "INVALID_REQUEST", "Request body must be valid JSON.");
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, "http://localhost");
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.join(projectRoot, "public", pathname);

  if (!filePath.startsWith(path.join(projectRoot, "public"))) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    const contentType = pathname.endsWith(".html")
      ? "text/html; charset=utf-8"
      : pathname.endsWith(".js")
        ? "text/javascript; charset=utf-8"
        : pathname.endsWith(".css")
          ? "text/css; charset=utf-8"
          : "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(file);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  }
}

async function handleApi(req, res) {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.pathname === "/api/health") {
    return json(res, 200, { ok: true, now: new Date().toISOString() });
  }

  if (req.method === "POST" && url.pathname === "/api/v1/vectorize") {
    const body = await parseBody(req);
    const job = createVectorJob({ provider: body.provider, imageUrl: body.imageUrl });

    setTimeout(async () => {
      try {
        updateVectorJob(job.jobId, { status: "running" });
        const result = await vectorizeInput({
          provider: body.provider,
          imageBase64: body.imageBase64,
          imageUrl: body.imageUrl,
          options: body.options,
        });
        updateVectorJob(job.jobId, {
          status: "done",
          svgText: result.svgText,
          provider: result.provider,
          providerMode: result.mode,
        });
      } catch (error) {
        updateVectorJob(job.jobId, {
          status: "failed",
          errorCode: error.errorCode || "VECTORIZATION_FAILED",
          errorMessage: error.errorMessage || error.message,
        });
      }
    }, 15);

    return json(res, 200, {
      jobId: job.jobId,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    });
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/v1/vectorize/")) {
    const jobId = url.pathname.split("/").pop();
    const job = getVectorJob(jobId);
    if (!job) {
      throw new ApiFailure(404, "NOT_FOUND", "Vectorize job not found.");
    }

    return json(res, 200, {
      jobId: job.jobId,
      status: job.status,
      svgText: job.svgText,
      errorCode: job.errorCode,
      errorMessage: job.errorMessage,
      provider: job.provider,
      providerMode: job.providerMode,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    });
  }

  if (req.method === "POST" && url.pathname === "/api/v1/logo/analyze") {
    const body = await parseBody(req);
    const analysis = analyzeLogo({
      svgText: body.svgText,
      strategy: body.strategy ?? "auto",
      constraints: body.constraints ?? {},
    });

    saveAnalysis(analysis);

    return json(res, 200, {
      analysisId: analysis.analysisId,
      input: analysis.input,
      constraintGraph: analysis.constraintGraph,
      strategy: analysis.strategy,
      bestSolution: analysis.bestSolution,
      candidates: analysis.candidates,
      metrics: analysis.metrics,
      signature: analysis.signature,
      createdAt: analysis.createdAt,
    });
  }

  if (req.method === "POST" && url.pathname === "/api/v1/logo/export") {
    const body = await parseBody(req);
    if (!body.analysisId || !body.format) {
      throw new ApiFailure(400, "INVALID_REQUEST", "analysisId and format are required.");
    }

    const analysis = getAnalysis(body.analysisId);
    if (!analysis) {
      throw new ApiFailure(404, "NOT_FOUND", "Analysis not found.");
    }

    const includeLayers = Array.isArray(body.includeLayers)
      ? body.includeLayers
      : ["logo", "guides", "annotations"];

    if (body.format === "svg") {
      const svgText = buildExportSvg({ analysis, includeLayers, styleConfig: body.styleConfig });
      return json(res, 200, {
        mimeType: "image/svg+xml",
        fileName: `guidepack-${analysis.analysisId}.svg`,
        fileBase64: Buffer.from(svgText, "utf8").toString("base64"),
      });
    }

    if (body.format === "pdf") {
      const pdfBuffer = buildExportPdf({ analysis, includeLayers, styleConfig: body.styleConfig });
      return json(res, 200, {
        mimeType: "application/pdf",
        fileName: `guidepack-${analysis.analysisId}.pdf`,
        fileBase64: pdfBuffer.toString("base64"),
      });
    }

    throw new ApiFailure(400, "INVALID_REQUEST", "format must be svg or pdf.");
  }

  throw new ApiFailure(404, "NOT_FOUND", "Endpoint not found.");
}

export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      if ((req.url ?? "").startsWith("/api/")) {
        await handleApi(req, res);
      } else {
        await serveStatic(req, res);
      }
    } catch (error) {
      if (error instanceof ApiFailure) {
        json(res, error.status, error.toJSON());
        return;
      }

      json(res, 500, {
        errorCode: "INTERNAL_ERROR",
        errorMessage: error?.message ?? "Unexpected server error.",
      });
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3000);
  const server = createServer();

  server.listen(port, () => {
    console.log(`ArcGrid server running on http://localhost:${port}`);
  });
}
