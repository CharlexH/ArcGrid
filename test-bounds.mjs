import fs from "fs";
import { parseSvg } from "./src/lib/svg/parse.mjs";

const text = fs.readFileSync("public/testsvg/test8.svg", "utf-8");
const result = parseSvg(text);

let minX = Infinity, minY = Infinity;
let maxX = -Infinity, maxY = -Infinity;

for (const path of result.paths) {
    for (const pt of path.points) {
        minX = Math.min(minX, pt.anchor[0]);
        minY = Math.min(minY, pt.anchor[1]);
        maxX = Math.max(maxX, pt.anchor[0]);
        maxY = Math.max(maxY, pt.anchor[1]);
    }
}
console.log(`test8.svg points bounds: X[${minX}, ${maxX}] Y[${minY}, ${maxY}]`);
