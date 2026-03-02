import fs from "fs";
import { parseSvg } from "./src/lib/svg/parse.mjs";

const text = fs.readFileSync("public/testsvg/test8.svg", "utf-8");

// We'll read the first path directly without any parser magic
const pathMatch = /<path\b([^>]*)d="([^"]*)"/i.exec(text);
if (pathMatch) {
  const d = pathMatch[2];
  console.log(d.substring(0, 50) + "...");
}

