import fs from "fs";

function extractAttr(tag, name) {
  const regex = new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i");
  const match = tag.match(regex);
  return match ? match[2] : null;
}

const svgText9 = fs.readFileSync("./public/testsvg/test9.svg", "utf-8");
const svgMatch = svgText9.match(/<svg([^>]*)>/i);
if (svgMatch) {
  const vbAttr = extractAttr(svgMatch[0], "viewBox");
  console.log("viewBox:", vbAttr);
  if (vbAttr) {
    const parts = vbAttr.split(/[\s,]+/).map(Number);
    console.log("parts:", parts);
  }
}
