import { analyzeLogo } from "../src/lib/solver/index.mjs";

const svgText = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- A straight edge from (10, 10) to (90, 10) -->
  <path d="M 10,10 L 90,10" stroke="black" />
  <!-- A perfect semi-circle with center (50, 50) and radius 30 -->
  <!-- M 20,50 C 20,33.43 33.43,20 50,20 C 66.57,20 80,33.43 80,50 -->
  <path d="M 20,50 C 20,33.43 33.43,20 50,20 C 66.57,20 80,33.43 80,50" stroke="blue" />
</svg>
`;

try {
    const result = analyzeLogo({ svgText, strategy: "auto" });
    console.log("Analysis Success! Candidate: ", result.bestSolution.id);

    const circles = result.bestSolution.circles;
    const lines = result.bestSolution.lines;

    console.log(`Found ${lines.length} lines and ${circles.length} circles.`);

    console.log("Lines:");
    lines.forEach(l => {
        console.log(`  (${l.x1.toFixed(2)}, ${l.y1.toFixed(2)}) -> (${l.x2.toFixed(2)}, ${l.y2.toFixed(2)})`);
    });

    console.log("Circles:");
    circles.forEach(c => {
        console.log(`  Center: (${c.cx.toFixed(3)}, ${c.cy.toFixed(3)}), Radius: ${c.r.toFixed(3)}`);
    });
} catch (e) {
    console.error("Analysis Failed:", e);
}
