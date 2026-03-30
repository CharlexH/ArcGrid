/**
 * Thin wrapper that exposes the Hono app for tests.
 * We duplicate the routes instead of importing [[route]].js directly because
 * that file uses Cloudflare-specific `handle()` and `c.env` bindings.
 */
import { Hono } from "hono";
import { analyzeLogo } from "../src/lib/solver/index.mjs";
import { buildExportSvg } from "../src/lib/export/svg-export.mjs";
import { buildExportPdf } from "../src/lib/export/pdf-export.mjs";
import { resolveExportSolution } from "../src/lib/export/resolve-export-solution.mjs";

export function createTestApp() {
    const app = new Hono().basePath("/api");

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
            return c.json(
                {
                    errorCode: "ANALYSIS_FAILED",
                    errorMessage: error.message,
                },
                400,
            );
        }
    });

    app.post("/v1/logo/export", async (c) => {
        try {
            const body = await c.req.json();

            if (!body.svgText || !body.format) {
                return c.json(
                    {
                        errorCode: "INVALID_REQUEST",
                        errorMessage:
                            "svgText and format are required for stateless export.",
                    },
                    400,
                );
            }

            const analysis = analyzeLogo({
                svgText: body.svgText,
                strategy: body.strategy ?? "auto",
                constraints: body.constraints ?? {},
            });
            analysis.exportSolution = resolveExportSolution(analysis, body.selectedCandidateId);

            const includeLayers = Array.isArray(body.includeLayers)
                ? body.includeLayers
                : ["logo", "guides", "annotations"];

            if (body.format === "svg") {
                const svgText = buildExportSvg({
                    analysis,
                    includeLayers,
                    styleConfig: body.styleConfig,
                });
                const svgBase64 = Buffer.from(svgText, "utf8").toString("base64");
                return c.json({
                    mimeType: "image/svg+xml",
                    fileName: `guidepack-${analysis.analysisId}.svg`,
                    fileBase64: svgBase64,
                });
            }

            if (body.format === "pdf") {
                const pdfBuffer = buildExportPdf({
                    analysis,
                    includeLayers,
                    styleConfig: body.styleConfig,
                });
                const pdfBase64 = pdfBuffer.toString("base64");
                return c.json({
                    mimeType: "application/pdf",
                    fileName: `guidepack-${analysis.analysisId}.pdf`,
                    fileBase64: pdfBase64,
                });
            }

            return c.json(
                {
                    errorCode: "INVALID_REQUEST",
                    errorMessage: "format must be svg or pdf.",
                },
                400,
            );
        } catch (error) {
            return c.json(
                {
                    errorCode: "EXPORT_FAILED",
                    errorMessage: error.message,
                },
                400,
            );
        }
    });

    return app;
}
