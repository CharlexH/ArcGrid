import fs from "fs";
import { parseTransform } from "./src/lib/svg/transform.mjs";
import { parseSvg } from "./src/lib/svg/parse.mjs";

const svgText1 = fs.readFileSync("./public/testsvg/test1.svg", "utf-8");
const svgText9 = fs.readFileSync("./public/testsvg/test9.svg", "utf-8");

const parsed1 = parseSvg(svgText1);
console.log("Test1 paths:", parsed1.paths.length);
console.log("Test1 bounding box (approx):", parsed1.paths[0].points[0].anchor);

const parsed9 = parseSvg(svgText9);
console.log("Test9 paths:", parsed9.paths.length);
console.log("Test9 rect0 p0 (raw):", parsed9.paths[0].points[0].anchor);
console.log("Test9 transform:", parseTransform("matrix(-0.009271 -0.017448 0.0215011 -0.0134883 13.0472 18.2292)"));

