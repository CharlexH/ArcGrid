export type AnalyzeStrategy = "auto" | "circleFirst" | "gridFirst";
export type VectorizeStatus = "queued" | "running" | "done" | "failed";
export type ExportFormat = "svg" | "pdf";

export interface VectorPoint {
  x: number;
  y: number;
}

export interface VectorPath {
  id: string;
  d: string;
  points: VectorPoint[];
  closed: boolean;
}

export interface PrimitiveCircle {
  cx: number;
  cy: number;
  r: number;
  role: "fit" | "construction";
}

export interface PrimitiveLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  role: "axis" | "tangent" | "grid";
}

export interface ConstraintGraph {
  nodes: Array<{ id: string; type: "circle" | "line" | "point" }>;
  edges: Array<{ from: string; to: string; relation: string; weight: number }>;
}

export interface SolveMetrics {
  fitError: number;
  symmetryScore: number;
  complexityPenalty: number;
  finalScore: number;
}

export interface SolveCandidate {
  id: string;
  label: string;
  circles: PrimitiveCircle[];
  lines: PrimitiveLine[];
  metrics: SolveMetrics;
  explanation: string;
}

export interface ExportSpec {
  analysisId: string;
  format: ExportFormat;
  includeLayers: Array<"logo" | "guides" | "annotations">;
}

export interface ApiError {
  errorCode:
    | "INVALID_SVG"
    | "UNSOLVABLE_GEOMETRY"
    | "VECTORIZATION_FAILED"
    | "SOLVER_TIMEOUT"
    | "NOT_FOUND"
    | "INVALID_REQUEST";
  errorMessage: string;
}
