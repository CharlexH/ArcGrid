// math vector/matrix utilities for parse.mjs

// 3x3 matrix multiplication (used for 2D affine transforms)
// A = [a, c, e
//      b, d, f
//      0, 0, 1]
// The array format is [a, b, c, d, e, f] matching SVG's matrix() syntax.

export function multiplyTransform(m1, m2) {
    if (!m1) return m2;
    if (!m2) return m1;

    // m1 * m2
    return [
        m1[0] * m2[0] + m1[2] * m2[1],
        m1[1] * m2[0] + m1[3] * m2[1],
        m1[0] * m2[2] + m1[2] * m2[3],
        m1[1] * m2[2] + m1[3] * m2[3],
        m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
        m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
    ];
}

export function parseTransform(transformStr) {
    if (!transformStr) return null;

    // Use [a, c, e, b, d, f] equivalent for 1D arrays: SVG matrix(a, b, c, d, e, f)
    // SVG order: a=0, b=1, c=2, d=3, e=4, f=5 
    let currentMatrix = [1, 0, 0, 1, 0, 0];

    // Simple regex to match commands like "translate(10, 20)"
    const commands = Array.from(transformStr.matchAll(/([a-zA-Z]+)\s*\(([^)]*)\)/g));
    for (const match of commands) {
        const type = match[1].toLowerCase();
        // Split by comma or whitespace
        const args = match[2].trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n));

        let m = [1, 0, 0, 1, 0, 0];

        if (type === 'matrix' && args.length === 6) {
            m = args;
        } else if (type === 'translate' && args.length >= 1) {
            const tx = args[0];
            const ty = args.length > 1 ? args[1] : 0;
            m = [1, 0, 0, 1, tx, ty];
        } else if (type === 'scale' && args.length >= 1) {
            const sx = args[0];
            const sy = args.length > 1 ? args[1] : sx;
            m = [sx, 0, 0, sy, 0, 0];
        } else if (type === 'rotate' && args.length >= 1) {
            const a = args[0] * Math.PI / 180;
            const cos = Math.cos(a);
            const sin = Math.sin(a);
            m = [cos, sin, -sin, cos, 0, 0];
            if (args.length === 3) {
                const cx = args[1];
                const cy = args[2];
                // Math for translate(cx, cy) * rotate(a) * translate(-cx, -cy)
                // We just compute it directly to be safe
                const dx = cx - cos * cx + sin * cy;
                const dy = cy - sin * cx - cos * cy;
                m = [cos, sin, -sin, cos, dx, dy];
            }
        } else if (type === 'skewx' && args.length === 1) {
            const a = args[0] * Math.PI / 180;
            m = [1, 0, Math.tan(a), 1, 0, 0];
        } else if (type === 'skewy' && args.length === 1) {
            const a = args[0] * Math.PI / 180;
            m = [1, Math.tan(a), 0, 1, 0, 0];
        }

        // Accumulate transforms: new * current
        currentMatrix = multiplyTransform(currentMatrix, m);
    }
    return currentMatrix;
}

export function applyTransform(pt, m) {
    if (!m) return pt;
    const x = pt[0];
    const y = pt[1];
    return [
        x * m[0] + y * m[2] + m[4],
        x * m[1] + y * m[3] + m[5]
    ];
}
