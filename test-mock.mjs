import { parseSvg } from "./src/lib/svg/parse.mjs";

const mockSvg = `<svg id="MOCK_LOGO_ARCGRID_V1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#111" stroke-width="20"><path d="M96 384 L96 128 L256 128 L416 384 Z" /><path d="M176 300 L256 172 L336 300 Z" /></g></svg>`;

try {
    const result = parseSvg(mockSvg);
    console.log(JSON.stringify(result, null, 2));
} catch (e) {
    console.error("Error:", e);
}
