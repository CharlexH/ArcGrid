import fs from "fs";
import { parseSvg } from "./src/lib/svg/parse.mjs";
import { normalizePaths } from "./src/lib/svg/normalize.mjs";

const svgText9 = fs.readFileSync("./public/testsvg/test9.svg", "utf-8");
const parsed9 = parseSvg(svgText9);
const norm9 = normalizePaths(parsed9.paths, parsed9.explicitViewBox);

for (let path of norm9.paths) {
  const pXs = path.points.map(p => p.anchor[0]);
  const pYs = path.points.map(p => p.anchor[1]);
  const pMinX = Math.min(...pXs), pMaxX = Math.max(...pXs);
  const pMinY = Math.min(...pYs), pMaxY = Math.max(...pYs);
  const pArea = (pMaxX - pMinX) * (pMaxY - pMinY);
  console.log(path.id, "area:", Math.round(pArea), "bounds:[", pMinX.toFixed(1), pMaxX.toFixed(1), "x", pMinY.toFixed(1), pMaxY.toFixed(1), "]");
}
