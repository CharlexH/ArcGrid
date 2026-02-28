import { createServer } from "../src/server/app.mjs";

export async function withServer(run) {
  const server = createServer();

  await new Promise((resolve) => {
    server.listen(0, resolve);
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
