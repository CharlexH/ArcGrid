import * as dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

import { vectorizeInput } from './src/lib/vectorize/provider.mjs';

async function test() {
  try {
    const res = await vectorizeInput({
      provider: 'nanabanana2',
      imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      mimeType: 'image/png'
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Caught error:", err);
  }
}
test();
