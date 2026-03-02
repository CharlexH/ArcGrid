import fs from "fs";
import { parseSvg } from "./src/lib/svg/parse.mjs";

const text1 = fs.readFileSync("public/testsvg/test1.svg", "utf-8");
const result = parseSvg(text1);
console.log("Found paths:", result.paths.length);
for (let i=0; i<result.paths.length; i++) {
  const p = result.paths[i];
  const pts = p.points.map(pt => `[${pt.anchor[0].toFixed(1)},${pt.anchor[1].toFixed(1)}]`);
  console.log(`Path ${i}: ${p.id}, pts: ${pts.slice(0, 4).join(" ")}... (closed: ${p.closed})`);
}
