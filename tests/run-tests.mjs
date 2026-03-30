import { runApiTests } from "./api.test.mjs";
import { runPreviewViewportTests } from "./preview-viewport.test.mjs";

async function run() {
  const started = Date.now();
  runPreviewViewportTests();
  await runApiTests();
  const elapsed = Date.now() - started;
  console.log(`All tests passed in ${elapsed}ms`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
