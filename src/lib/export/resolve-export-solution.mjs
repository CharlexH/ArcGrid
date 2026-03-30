export function resolveExportSolution(analysis, selectedCandidateId) {
  if (!analysis?.candidates?.length) {
    return analysis?.bestSolution ?? null;
  }

  if (selectedCandidateId) {
    const selected = analysis.candidates.find((candidate) => candidate.id === selectedCandidateId);
    if (selected) return selected;
  }

  const fullConstruction = analysis.candidates.find((candidate) => candidate.id === "cand_geometry_auto");
  return fullConstruction ?? analysis.bestSolution;
}
