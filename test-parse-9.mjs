import fs from "fs";
import { parseSvg } from "./src/lib/svg/parse.mjs";

const svgText9 = fs.readFileSync("./public/testsvg/test9.svg", "utf-8");
const parsed9 = parseSvg(svgText9);

const rects = parsed9.paths.filter(p => !!p.id.includes("rect"));
const paths = parsed9.paths.filter(p => !!p.id.includes("path"));

console.log("Rect count:", rects.length);
console.log("Path count:", paths.length);
if (paths.length > 0) {
  console.log("Path 0 initial points:", paths[0].points.slice(0, 3).map(pt => pt.anchor));
}
