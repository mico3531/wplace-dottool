/**
 * palette.js
 * WPLACEの31色パレットと補助関数
 */

export const palette = [
  '#000000', '#3c3c3c', '#787878', '#d2d2d2',
  '#ffffff', '#6a0015', '#ff0006', '#ff7500',
  '#ffa600', '#ffdc00', '#fffab4', '#00bc5f',
  '#00ea6e', '#4cff38', '#00836d', '#00b1a7',
  '#00e5bd', '#1651a4', '#0095eb', '#00fbf3',
  '#704fff', '#93b2ff', '#84009f', '#b92bbf',
  '#ec9bff', '#de007c', '#ff0081', '#ff86a9',
  '#6e4431', '#9d6617', '#ffae6c'
];

// HEXカラー文字列をRGB配列に変換 (#RRGGBB)
export function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}

// RGB距離の2乗を計算
function colorDistSq(c1, c2) {
  return (c1[0]-c2[0])**2 + (c1[1]-c2[1])**2 + (c1[2]-c2[2])**2;
}

// 入力RGBに最も近いパレット色のHEXを返す
export function nearestColor(rgb) {
  let minDist = Infinity;
  let nearest = palette[0];
  for (const c of palette) {
    const pc = hexToRgb(c);
    const dist = colorDistSq(rgb, pc);
    if (dist < minDist) {
      minDist = dist;
      nearest = c;
    }
  }
  return nearest;
}
