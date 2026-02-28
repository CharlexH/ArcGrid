import { analyzeLogo } from "../src/lib/solver/index.mjs";

const svgText = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- A letter U shape using Beziers -->
  <!-- Outer U -->
  <path d="M 20 20 L 20 60 C 20 76.5 33.5 90 50 90 C 66.5 90 80 76.5 80 60 L 80 20 L 60 20 L 60 60 C 60 65.5 55.5 70 50 70 C 44.5 70 40 65.5 40 60 L 40 20 Z" fill="red"/>
</svg>
`;

try {
    const result = analyzeLogo({ svgText, strategy: "auto" });
    const geom = result.candidates.find(c => c.id === "cand_geometry_auto");

    if (geom) {
        console.log(`Lines: ${geom.lines.length}, Circles: ${geom.circles.length}`);
        geom.lines.forEach(l => console.log(`LINE: (${l.x1.toFixed(1)}, ${l.y1.toFixed(1)}) -> (${l.x2.toFixed(1)}, ${l.y2.toFixed(1)})`));
        geom.circles.forEach(c => console.log(`CIRCLE: center(${c.cx.toFixed(1)}, ${c.cy.toFixed(1)}) r=${c.r.toFixed(1)}`));
    } else {
        console.log("No cand_geometry_auto found");
    }
} catch (e) {
    console.error("Test failed:", e);
}
