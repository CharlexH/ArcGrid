import { parseSvg } from "./src/lib/svg/parse.mjs";
import fs from "fs";

const svgText2 = fs.readFileSync("public/testsvg/test7 1.svg", "utf-8");
try {
  const result = parseSvg(svgText2);
  console.log(JSON.stringify(result.paths[0], null, 2));
} catch (e) {
  console.error("Error:", e);
}
