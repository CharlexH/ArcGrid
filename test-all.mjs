import fs from "fs";
import { parseSvg } from "./src/lib/svg/parse.mjs";

const files = fs.readdirSync("public/testsvg").filter(f => f.endsWith(".svg"));
for (const file of files) {
  try {
    const text = fs.readFileSync(`public/testsvg/${file}`, "utf-8");
    const result = parseSvg(text);
    let hasNaN = false;
    for (const path of result.paths) {
      for (const pt of path.points) {
        if (isNaN(pt.anchor[0]) || isNaN(pt.anchor[1])) hasNaN = true;
      }
    }
    console.log(`${file}: ${result.paths.length} paths, hasNaN=${hasNaN}`);
  } catch(e) {
    console.log(`${file}: ERROR ${e.message}`);
  }
}
