export function normalizePaths(paths) {
  const allPoints = paths.flatMap((path) => path.points.map(p => p.anchor));
  const minX = Math.min(...allPoints.map((p) => p[0]));
  const minY = Math.min(...allPoints.map((p) => p[1]));
  const maxX = Math.max(...allPoints.map((p) => p[0]));
  const maxY = Math.max(...allPoints.map((p) => p[1]));

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  return {
    paths, // keep original unscaled path control points
    bbox: {
      minX,
      minY,
      maxX,
      maxY,
      width,
      height,
      cx: minX + width / 2,
      cy: minY + height / 2,
      actualWidth: width,
      actualHeight: height,
    },
  };
}
