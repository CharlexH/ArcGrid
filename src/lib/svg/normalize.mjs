export function normalizePaths(paths, explicitViewBox) {
  let filteredPaths = paths;

  if (explicitViewBox && explicitViewBox.width > 0 && explicitViewBox.height > 0) {
    const vbArea = explicitViewBox.width * explicitViewBox.height;
    filteredPaths = paths.filter((path) => {
      if (!path.points || path.points.length === 0) return false;
      const pXs = path.points.map(p => p.anchor[0]);
      const pYs = path.points.map(p => p.anchor[1]);
      const pMinX = Math.min(...pXs), pMaxX = Math.max(...pXs);
      const pMinY = Math.min(...pYs), pMaxY = Math.max(...pYs);
      const pArea = (pMaxX - pMinX) * (pMaxY - pMinY);

      // Filter out overly huge background gradient rects that were unclipped
      // 1. If the area is larger than 1.1x the viewBox area
      // 2. If the path significantly extends outside the viewBox (by >10%)
      const isTooLarge = pArea >= vbArea * 1.1;
      const extendsOutX = pMinX < explicitViewBox.minX - explicitViewBox.width * 0.1 ||
        pMaxX > explicitViewBox.maxX + explicitViewBox.width * 0.1;
      const extendsOutY = pMinY < explicitViewBox.minY - explicitViewBox.height * 0.1 ||
        pMaxY > explicitViewBox.maxY + explicitViewBox.height * 0.1;

      if (isTooLarge || extendsOutX || extendsOutY) {
        return false;
      }
      return true;
    });

    if (filteredPaths.length === 0) {
      filteredPaths = paths;
    }
  }

  const allPoints = filteredPaths.flatMap((path) => path.points.map(p => p.anchor));
  const minX = Math.min(...allPoints.map((p) => p[0]));
  const minY = Math.min(...allPoints.map((p) => p[1]));
  const maxX = Math.max(...allPoints.map((p) => p[0]));
  const maxY = Math.max(...allPoints.map((p) => p[1]));

  let width = Math.max(1, maxX - minX);
  let height = Math.max(1, maxY - minY);

  // If explicitViewBox is valid and covers a reasonable area compared to the shapes
  // we align the analysis bbox to the viewBox to prevent skewed rendering UI
  let bbox = {
    minX, minY, maxX, maxY, width, height,
    cx: minX + width / 2,
    cy: minY + height / 2,
    actualWidth: width,
    actualHeight: height,
  };

  if (explicitViewBox) {
    bbox = {
      ...explicitViewBox,
      cx: explicitViewBox.minX + explicitViewBox.width / 2,
      cy: explicitViewBox.minY + explicitViewBox.height / 2,
      actualWidth: explicitViewBox.width,
      actualHeight: explicitViewBox.height,
    };
  }

  return {
    paths: filteredPaths,
    bbox,
  };
}
