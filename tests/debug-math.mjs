import { parseSvg } from "../src/lib/svg/parse.mjs";
import { normalizePaths } from "../src/lib/svg/normalize.mjs";
import { getCircleCenterFrom2AnchorArc, isApproxCircularArc, isStraightSegment } from "../src/lib/solver/math.mjs";

const svgText = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 20,50 C 20,33.43 33.43,20 50,20 C 66.57,20 80,33.43 80,50" />
</svg>`;

const parsed = parseSvg(svgText);
console.log("Parsed Shapes:");
console.dir(parsed.paths[0].points, { depth: null });

const normalized = normalizePaths(parsed.paths);
console.log("\nNormalized Shapes:");
console.dir(normalized.paths[0].points, { depth: null });

const pts = normalized.paths[0].points;
for (let i = 0; i < pts.length - 1; i++) {
    const pt1 = pts[i];
    const pt2 = pts[i + 1];
    console.log(`\nSegment ${i}: straight?`, isStraightSegment(pt1, pt2));

    if (!isStraightSegment(pt1, pt2)) {
        console.log("Left dir: ", pt2.leftDirection);
        console.log("Right dir:", pt1.rightDirection);
        const center = getCircleCenterFrom2AnchorArc(
            pt1.anchor,
            pt1.rightDirection,
            pt2.anchor,
            pt2.leftDirection
        );
        console.log("Derived Center:", center);
        if (center) {
            const dx = pt1.anchor[0] - center[0];
            const dy = pt1.anchor[1] - center[1];
            const r = Math.sqrt(dx * dx + dy * dy);
            console.log("Radius:", r);
            console.log("Is Approx Arc?", isApproxCircularArc(pt1.anchor, pt1.rightDirection, pt2.leftDirection, pt2.anchor, center, r));
        }
    }
}
