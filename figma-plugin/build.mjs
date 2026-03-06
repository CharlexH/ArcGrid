/**
 * ArcGrid Figma Plugin — Build Script
 *
 * Bundles the solver modules (+ SVGO) into an IIFE and injects
 * the result into ui-template.html → ui.html
 */
import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 1. Bundle solver modules into a single IIFE
const result = await build({
    entryPoints: [path.join(rootDir, 'src/lib/solver/index.mjs')],
    bundle: true,
    format: 'iife',
    globalName: 'ArcGridSolver',
    write: false,
    minify: false,
    platform: 'browser',
    // Resolve from the project root so node_modules (svgo) can be found
    absWorkingDir: rootDir,
    define: {
        'process.env.NODE_ENV': '"production"',
    },
});

let solverCode = result.outputFiles[0].text;
// Prevent </script> inside the bundle from closing the HTML <script> tag.
// We replace each '<' that precedes '/script' with the unicode escape sequence.
// The HTML parser sees '\u003c' (6 literal chars) and does NOT treat it as '<',
// but the JS engine interprets '\u003c' in string contexts as '<' at runtime.
const ESCAPED_OPEN = String.raw`\u003c`;
solverCode = solverCode.split('</script').join(ESCAPED_OPEN + '/script');
console.log(`Solver bundle: ${(solverCode.length / 1024).toFixed(1)} KB`);

// 2. Read HTML template
const templatePath = path.join(__dirname, 'ui-template.html');
const template = fs.readFileSync(templatePath, 'utf8');

// 3. Inject solver bundle
// Use a replacer function to avoid \`$'\` in the bundle triggering special replace behavior
// which was causing the template remainder (including </html>) to be duplicated.
const output = template.replace('/* __SOLVER_BUNDLE__ */', () => solverCode);

// 4. Write final ui.html
const outputPath = path.join(__dirname, 'ui.html');
fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Written: ${outputPath} (${(output.length / 1024).toFixed(1)} KB)`);
