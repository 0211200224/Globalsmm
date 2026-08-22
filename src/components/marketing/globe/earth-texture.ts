/**
 * Procedurally draws a glowing dot-matrix world map onto a canvas and
 * returns it as a THREE.CanvasTexture -- gives the globe recognizable
 * continents instead of a bare wireframe sphere, without hotlinking a
 * real satellite/map image (this session already removed every external
 * image dependency elsewhere for reliability -- see AuthMarketingPanel's
 * git history). Continents are simplified blob shapes built from a few
 * overlapping soft "landmass" clusters per region rather than accurate
 * coastlines -- close enough to read as Earth at the globe's rendered
 * size, in the same dot-matrix style as the rest of the scene.
 *
 * Must run client-side only (uses `document.createElement("canvas")`).
 */

type LandCluster = { lat: number; lon: number; rx: number; ry: number };

// Rough lat/lon center + radius (degrees) per blob -- several overlapping
// blobs per continent approximate an irregular coastline instead of one
// obviously-rectangular region.
const LANDMASSES: LandCluster[] = [
  // North America
  { lat: 50, lon: -100, rx: 22, ry: 16 },
  { lat: 38, lon: -95, rx: 18, ry: 12 },
  { lat: 62, lon: -110, rx: 20, ry: 14 },
  { lat: 20, lon: -102, rx: 10, ry: 8 },
  // South America
  { lat: -5, lon: -62, rx: 14, ry: 12 },
  { lat: -22, lon: -58, rx: 14, ry: 14 },
  { lat: -40, lon: -66, rx: 10, ry: 12 },
  // Europe
  { lat: 50, lon: 12, rx: 14, ry: 10 },
  { lat: 58, lon: 25, rx: 12, ry: 10 },
  { lat: 42, lon: 0, rx: 10, ry: 7 },
  // Africa
  { lat: 15, lon: 18, rx: 20, ry: 16 },
  { lat: -12, lon: 22, rx: 16, ry: 14 },
  { lat: -28, lon: 24, rx: 12, ry: 10 },
  { lat: 30, lon: 10, rx: 10, ry: 8 },
  // Asia
  { lat: 55, lon: 90, rx: 28, ry: 16 },
  { lat: 35, lon: 100, rx: 20, ry: 14 },
  { lat: 20, lon: 78, rx: 14, ry: 12 },
  { lat: 10, lon: 105, rx: 12, ry: 10 },
  { lat: 45, lon: 45, rx: 12, ry: 10 },
  { lat: 60, lon: 130, rx: 16, ry: 12 },
  // Australia
  { lat: -25, lon: 134, rx: 16, ry: 10 },
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function createEarthDotTexture(width = 1024, height = 512): {
  canvas: HTMLCanvasElement;
} {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, width, height);

  const rand = seededRandom(42);
  const step = 6;

  for (let py = 0; py < height; py += step) {
    for (let px = 0; px < width; px += step) {
      const lon = (px / width) * 360 - 180;
      const lat = 90 - (py / height) * 180;

      let inside = false;
      let edgeFactor = 0;
      for (const c of LANDMASSES) {
        const dx = (lon - c.lon) / c.rx;
        const dy = (lat - c.lat) / c.ry;
        const d = dx * dx + dy * dy;
        if (d < 1) {
          inside = true;
          edgeFactor = Math.max(edgeFactor, 1 - d);
        }
      }
      if (!inside) continue;

      // Soften the blob edges into an irregular coastline instead of a
      // hard ellipse boundary.
      if (rand() > 0.55 + edgeFactor * 0.4) continue;

      const jitterX = (rand() - 0.5) * step * 0.8;
      const jitterY = (rand() - 0.5) * step * 0.8;
      const r = 1.2 + edgeFactor * 1.1;
      const alpha = 0.55 + edgeFactor * 0.4;

      ctx.beginPath();
      ctx.arc(px + jitterX, py + jitterY, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(216, 205, 255, ${alpha})`;
      ctx.fill();
    }
  }

  return { canvas };
}
