import fs from "fs";
import { parseSvg } from "./src/lib/svg/parse.mjs";
import { normalizePaths } from "./src/lib/svg/normalize.mjs";

const text1 = fs.readFileSync("public/testsvg/test1.svg", "utf-8");
const text9 = fs.readFileSync("public/testsvg/test9.svg", "utf-8");

const p1 = parseSvg(text1);
const b1 = normalizePaths(p1.paths).bbox;
console.log("test1 raw attributes:", text1.match(/<svg[^>]*>/)[0]);
console.log(`test1 computed bbox: X[${b1.minX.toFixed(2)}, ${b1.maxX.toFixed(2)}] Y[${b1.minY.toFixed(2)}, ${b1.maxY.toFixed(2)}] W:${b1.width.toFixed(2)} H:${b1.height.toFixed(2)}`);

const p9 = parseSvg(text9);
const b9 = normalizePaths(p9.paths).bbox;
console.log("\ntest9 raw attributes:", text9.match(/<svg[^>]*>/)[0]);
console.log(`test9 computed bbox: X[${b9.minX.toFixed(2)}, ${b9.maxX.toFixed(2)}] Y[${b9.minY.toFixed(2)}, ${b9.maxY.toFixed(2)}] W:${b9.width.toFixed(2)} H:${b9.height.toFixed(2)}`);
