import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { analyzeLogo } from "../../src/lib/solver/index.mjs";
import { buildExportSvg } from "../../src/lib/export/svg-export.mjs";
import { buildExportPdf } from "../../src/lib/export/pdf-export.mjs";

const app = new Hono().basePath('/api');

app.get("/health", (c) => {
    return c.json({ ok: true, now: new Date().toISOString() });
});



app.post("/v1/logo/analyze", async (c) => {
    try {
        const body = await c.req.json();
        const analysis = analyzeLogo({
            svgText: body.svgText,
            strategy: body.strategy ?? "auto",
            constraints: body.constraints ?? {},
        });

        // We no longer save to a store.mjs in memory.
        // Return all necessary info to the frontend immediately.

        return c.json({
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
    } catch (error) {
        return c.json({
            errorCode: "ANALYSIS_FAILED",
            errorMessage: error.message,
        }, 400);
    }
});

app.post("/v1/logo/export", async (c) => {
    try {
        const body = await c.req.json();
        // Stateless export requires re-running analyzeLogo or getting the full SVG and candidates back.
        // Since analyzeLogo is incredibly fast, we just re-run it with the original input.

        if (!body.svgText || !body.format) {
            return c.json({
                errorCode: "INVALID_REQUEST",
                errorMessage: "svgText and format are required for stateless export."
            }, 400);
        }

        const analysis = analyzeLogo({
            svgText: body.svgText,
            strategy: body.strategy ?? "auto",
            constraints: body.constraints ?? {},
        });

        const includeLayers = Array.isArray(body.includeLayers)
            ? body.includeLayers
            : ["logo", "guides", "annotations"];

        if (body.format === "svg") {
            const svgText = buildExportSvg({ analysis, includeLayers, styleConfig: body.styleConfig });
            const svgBase64 = typeof Buffer !== "undefined"
                ? Buffer.from(svgText, "utf8").toString("base64")
                : btoa(unescape(encodeURIComponent(svgText)));

            return c.json({
                mimeType: "image/svg+xml",
                fileName: `guidepack-${analysis.analysisId}.svg`,
                fileBase64: svgBase64,
            });
        }

        if (body.format === "pdf") {
            const pdfBuffer = buildExportPdf({ analysis, includeLayers, styleConfig: body.styleConfig });
            const pdfBase64 = typeof Buffer !== "undefined"
                ? pdfBuffer.toString("base64")
                : btoa(String.fromCharCode.apply(null, new Uint8Array(pdfBuffer)));

            return c.json({
                mimeType: "application/pdf",
                fileName: `guidepack-${analysis.analysisId}.pdf`,
                fileBase64: pdfBase64,
            });
        }

        return c.json({
            errorCode: "INVALID_REQUEST",
            errorMessage: "format must be svg or pdf."
        }, 400);

    } catch (error) {
        return c.json({
            errorCode: "EXPORT_FAILED",
            errorMessage: error.message,
        }, 400);
    }
});

export const onRequest = handle(app);
