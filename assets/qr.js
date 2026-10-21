import { toQR } from '/vendor/toqr.mjs';

const EC_M = 0;

// 모듈마다 <rect>를 만들면 수천 개가 되므로 가로로 이어진 칸을 한 path 조각으로 묶는다.
export function qrSvg(text, { dark = '#10231A', quiet = 2 } = {}) {
  const cells = toQR(text, EC_M);
  const size = Math.round(Math.sqrt(cells.length));
  const full = size + quiet * 2;
  let d = '';
  for (let y = 0; y < size; y++) {
    let x = 0;
    while (x < size) {
      if (!cells[y * size + x]) { x++; continue; }
      const start = x;
      while (x < size && cells[y * size + x]) x++;
      d += `M${start + quiet} ${y + quiet}h${x - start}v1h-${x - start}z`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${full} ${full}" shape-rendering="crispEdges" aria-hidden="true"><rect width="${full}" height="${full}" fill="#fff"/><path d="${d}" fill="${dark}"/></svg>`;
}
