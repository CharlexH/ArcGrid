import { ApiFailure } from "../errors.mjs";
import { SYSTEM_PROMPT_VECTORIZE } from "./prompt.mjs";

const MOCK_VECTOR_SVG = `
<svg id="MOCK_LOGO_ARCGRID_V1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#111" stroke-width="20">
    <path d="M96 384 L96 128 L256 128 L416 384 Z" />
    <path d="M176 300 L256 172 L336 300 Z" />
  </g>
</svg>
`.trim();

async function tryGeminiVectorize({ imageBase64, imageUrl, mimeType, options = {} }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new ApiFailure(500, "CONFIG_ERROR", "GEMINI_API_KEY is not configured in environment.");
  }

  if (typeof fetch !== "function") {
    throw new ApiFailure(424, "VECTORIZATION_FAILED", "Runtime fetch API unavailable.");
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT_VECTORIZE }]
    },
    contents: [{
      parts: [
        { text: "Convert this logo to a clean SVG following the instructions." }
      ]
    }]
  };

  if (imageBase64) {
    const resolvedMimeType = mimeType || "image/jpeg";
    console.log(`[vectorize] Using mimeType: ${resolvedMimeType}`);
    payload.contents[0].parts.push({
      inlineData: {
        mimeType: resolvedMimeType,
        data: imageBase64
      }
    });
  } else {
    throw new ApiFailure(400, "INVALID_REQUEST", "imageUrl is not supported by this proxy yet, need imageBase64.");
  }

  let response;
  let lastError;
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.log(`Retrying Gemini API (attempt ${attempt}/${maxRetries}) after ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        break;
      }

      const errorText = await response.text();
      console.error(`Gemini API Error (Status ${response.status}):`, errorText);

      if (response.status === 429 && attempt < maxRetries) {
        continue;
      }

      throw new ApiFailure(
        response.status === 429 ? 429 : 424,
        response.status === 429 ? "RATE_LIMIT" : "VECTORIZATION_FAILED",
        `Gemini API failed with status ${response.status}.`
      );
    } catch (e) {
      lastError = e;
      if (e instanceof ApiFailure && e.status === 429 && attempt < maxRetries) {
        continue;
      }
      throw e;
    }
  }

  if (!response || !response.ok) {
    throw lastError || new ApiFailure(424, "VECTORIZATION_FAILED", "Gemini API call failed after retries.");
  }

  const data = await response.json();

  // Thinking models may return thought parts before the actual text.
  // Iterate through parts and find the last non-thought text part.
  const parts = data?.candidates?.[0]?.content?.parts || [];
  console.log(`[vectorize] Response has ${parts.length} part(s):`, parts.map((p, i) => `part[${i}] thought=${!!p.thought} hasText=${!!p.text}`).join(', '));

  let textOutput = null;
  for (const part of parts) {
    if (part.text && !part.thought) {
      textOutput = part.text;
    }
  }

  if (!textOutput) {
    console.error('[vectorize] No valid text output found in response parts:', JSON.stringify(parts.map(p => ({ thought: p.thought, textLen: p.text?.length }))));
    throw new ApiFailure(424, "VECTORIZATION_FAILED", "Gemini response missing text output (may contain only thought parts).");
  }

  // Extract SVG if it's wrapped in markdown
  let svgText = textOutput.trim();
  const svgMatch = svgText.match(/<svg[\s\S]*<\/svg>/i);
  if (svgMatch) {
    svgText = svgMatch[0];
  }

  return {
    mode: "live",
    svgText: svgText,
    provider: "nanabanana2", // Keep the frontend provider name same for compatibility
  };
}

export async function vectorizeInput({ provider, imageBase64, imageUrl, mimeType, options }) {
  if (provider === "mock") {
    return {
      mode: "mock",
      svgText: MOCK_VECTOR_SVG,
      provider: "mock",
    };
  }

  if (provider !== "nanabanana2") {
    throw new ApiFailure(400, "INVALID_REQUEST", "Only nanabanana2 provider is supported in v1.");
  }
  if (!imageBase64 && !imageUrl) {
    throw new ApiFailure(400, "INVALID_REQUEST", "Either imageBase64 or imageUrl is required.");
  }

  return tryGeminiVectorize({ imageBase64, imageUrl, mimeType, options });
}

export const mockVectorSvg = MOCK_VECTOR_SVG;
