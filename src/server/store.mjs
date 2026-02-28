const vectorJobs = new Map();
const analyses = new Map();

export function createVectorJob(payload) {
  const jobId = `job_${Math.random().toString(36).slice(2, 10)}`;
  const job = {
    jobId,
    status: "queued",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payload,
  };
  vectorJobs.set(jobId, job);
  return job;
}

export function updateVectorJob(jobId, patch) {
  const current = vectorJobs.get(jobId);
  if (!current) return null;
  const next = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  vectorJobs.set(jobId, next);
  return next;
}

export function getVectorJob(jobId) {
  return vectorJobs.get(jobId) ?? null;
}

export function saveAnalysis(analysis) {
  analyses.set(analysis.analysisId, analysis);
}

export function getAnalysis(analysisId) {
  return analyses.get(analysisId) ?? null;
}
