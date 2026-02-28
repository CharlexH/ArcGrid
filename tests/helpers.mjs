import { serve } from "@hono/node-server";

// Dynamically import the Hono app from the Cloudflare Pages function entry.
// The [[route]].js exports `onRequest` via `handle(app)`, but we need the raw
// Hono `app` instance.  We therefore re-export it from a thin wrapper that
// the tests can consume.
import { createTestApp } from "./hono-app.mjs";

export async function withServer(run) {
  const app = createTestApp();

  const server = serve({ fetch: app.fetch, port: 0 });

  await new Promise((resolve) => {
    server.once("listening", resolve);
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await run({ baseUrl });
  } finally {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }
}

export async function waitFor(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
