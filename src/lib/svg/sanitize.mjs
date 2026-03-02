import { optimize } from 'svgo/browser';

/**
 * Sanitizes and normalizes an SVG string using SVGO.
 * Focuses on converting all shapes to paths, baking transforms, and removing invisible/empty elements
 * to simplify downstream geometric analysis.
 * 
 * @param {string} rawSvg - The raw SVG string to sanitize.
 * @returns {string} The optimized and normalized SVG string.
 */
export function sanitizeSvg(rawSvg) {
    try {
        const result = optimize(rawSvg, {
            multipass: true,
            plugins: [
                {
                    name: 'preset-default',
                    params: {
                        overrides: {
                            // We want to keep original shapes (circle, rect) to simplify reconstruction
                            convertShapeToPath: false,
                            // We handle transforms manually in parse.mjs to avoid double-baking or inconsistencies
                            convertTransform: false,
                            // CRITICAL: convertPathData's defaults destroy curve information needed
                            // for ArcGrid's geometric analysis:
                            //   - straightCurves (default: true) converts near-straight Bézier curves
                            //     into L/H/V commands, losing control point data
                            //   - makeArcs converts curves to arc commands our parser doesn't fully support
                            //   - lineShorthands converts L to H/V which is fine but we disable for safety
                            convertPathData: {
                                straightCurves: false,
                                makeArcs: false,
                            },
                            // mergePaths can combine separate curve segments, altering geometry
                            mergePaths: false,
                        }
                    }
                },
                'removeHiddenElems',  // Removes display="none", opacity="0", etc.
                'removeEmptyAttrs',
                'removeEmptyContainers'
            ]
        });

        return result.data;
    } catch (error) {
        // If SVGO completely fails, log and return original to let the fallback parser try
        console.warn("SVGO optimization failed, falling back to raw SVG:", error);
        return rawSvg;
    }
}
