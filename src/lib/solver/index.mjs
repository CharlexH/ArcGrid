import { ApiFailure } from "../errors.mjs";
import { parseSvg } from "../svg/parse.mjs";
import { normalizePaths } from "../svg/normalize.mjs";
import { generateCandidates } from "./candidates.mjs";
import { optimizeCandidates } from "./optimize.mjs";

const SOLVER_SIGNATURE = "GEOMETRIC_SOLVER=AG27";
const DEFAULT_TIMEOUT_MS = 15000;

function nowIso() {
  return new Date().toISOString();
}

function buildConstraintGraph(candidates) {
  const nodes = [];
  const edges = [];

  candidates.forEach((candidate) => {
    candidate.circles.forEach((circle, idx) => {
      const id = `${candidate.id}_circle_${idx + 1}`;
      nodes.push({ id, type: "circle" });
      edges.push({ from: candidate.id, to: id, relation: circle.role, weight: 1 });
    });
    candidate.lines.forEach((line, idx) => {
      const id = `${candidate.id}_line_${idx + 1}`;
      nodes.push({ id, type: "line" });
      edges.push({ from: candidate.id, to: id, relation: line.role, weight: 0.8 });
    });
  });

  return { nodes, edges };
}

function randomId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function analyzeLogo({ svgText, strategy = "auto", constraints = {} }) {
  const startedAt = Date.now();
  const parsed = parseSvg(svgText);
  const normalized = normalizePaths(parsed.paths);

  const candidates = generateCandidates({
    paths: normalized.paths,
    bbox: normalized.bbox,
    strategy,
    mockId: parsed.mockId,
  });

  if (!candidates.length) {
    throw new ApiFailure(422, "UNSOLVABLE_GEOMETRY", "No candidate guides could be generated.");
  }

  const solved = optimizeCandidates(candidates, constraints);
  const bestSolution = solved[0];

  if (!bestSolution || bestSolution.metrics.finalScore < (constraints.minScore ?? 0.5)) {
    throw new ApiFailure(422, "UNSOLVABLE_GEOMETRY", "Generated candidates did not meet minimum quality threshold.");
  }

  if (Date.now() - startedAt > (constraints.timeoutMs ?? DEFAULT_TIMEOUT_MS)) {
    throw new ApiFailure(504, "SOLVER_TIMEOUT", "Solver exceeded timeout budget.");
  }

  return {
    analysisId: randomId("anl"),
    createdAt: nowIso(),
    signature: SOLVER_SIGNATURE,
    strategy,
    input: {
      mockId: parsed.mockId,
      paths: parsed.paths,
      bbox: normalized.bbox,
      raw: parsed.raw,
    },
    constraintGraph: buildConstraintGraph(solved),
    bestSolution,
    candidates: solved,
    metrics: bestSolution.metrics,
  };
}

export const solverSignature = SOLVER_SIGNATURE;
