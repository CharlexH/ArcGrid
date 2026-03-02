import fs from "fs";
import { parseSvg } from "./src/lib/svg/parse.mjs";

const text = fs.readFileSync("public/testsvg/test8.svg", "utf-8"); // "test8.svg" seems to be the problematic robot SVG?
const result = parseSvg(text);

for (let i = 0; i < Math.min(3, result.paths.length); i++) {
  const p = result.paths[i];
  console.log(`Path ${p.id} points count: ${p.points.length}`);
  if (p.points.length > 0) {
    console.log(`  Start:`, p.points[0].anchor);
    console.log(`  End:`, p.points[p.points.length - 1].anchor);
  }
}
