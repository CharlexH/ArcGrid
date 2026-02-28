import { ApiFailure } from "../errors.mjs";

const MOCK_VECTOR_SVG = `
<svg id="MOCK_LOGO_ARCGRID_V1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#111" stroke-width="20">
    <path d="M96 384 L96 128 L256 128 L416 384 Z" />
    <path d="M176 300 L256 172 L336 300 Z" />
  </g>
</svg>
`.trim();

async function tryNanabanana2({ imageBase64, imageUrl, options = {} }) {
  const apiKey = process.env.NANABANANA2_API_KEY;
  const apiBase = process.env.NANABANANA2_API_BASE;

  if (!apiKey || !apiBase) {
    return {
      mode: "mock",
      svgText: MOCK_VECTOR_SVG,
      provider: "nanabanana2",
    };
  }

  if (typeof fetch !== "function") {
    throw new ApiFailure(424, "VECTORIZATION_FAILED", "Runtime fetch API unavailable.");
  }

  const response = await fetch(`${apiBase.replace(/\/$/, "")}/vectorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ imageBase64, imageUrl, options }),
  });

  if (!response.ok) {
    throw new ApiFailure(424, "VECTORIZATION_FAILED", `Vectorization failed with status ${response.status}.`);
  }

  const data = await response.json();
  if (!data || typeof data.svgText !== "string") {
    throw new ApiFailure(424, "VECTORIZATION_FAILED", "Vectorization response missing svgText.");
  }

  return {
    mode: "live",
    svgText: data.svgText,
    provider: "nanabanana2",
  };
}

export async function vectorizeInput({ provider, imageBase64, imageUrl, options }) {
  if (provider !== "nanabanana2") {
    throw new ApiFailure(400, "INVALID_REQUEST", "Only nanabanana2 provider is supported in v1.");
  }

  if (!imageBase64 && !imageUrl) {
    throw new ApiFailure(400, "INVALID_REQUEST", "Either imageBase64 or imageUrl is required.");
  }

  return tryNanabanana2({ imageBase64, imageUrl, options });
}

export const mockVectorSvg = MOCK_VECTOR_SVG;
