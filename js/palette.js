/**
 * wplace用31色パレット定義と色近似関数
 */

const palette = [
  '#000000', '#3c3c3c', '#787878', '#d2d2d2',
  '#ffffff', '#6a0015', '#ff0006', '#ff7500',
  '#ffa600', '#ffdc00', '#fffab4', '#00bc5f',
  '#00ea6e', '#4cff38', '#00836d', '#00b1a7',
  '#00e5bd', '#1651a4', '#0095eb', '#00fbf3',
  '#704fff', '#93b2ff', '#84009f', '#b92bbf',
  '#ec9bff', '#de007c', '#ff0081', '#ff86a9',
  '#6e4431', '#9d6617', '#ffae6c'
];

/**
 * HEXカラーをRGB配列に変換 (#RRGGBB -> [r,g,b])
 * @param {string} hex 
 * @returns {[number,number,number]}
 */
function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

/**
 * RGBの2点間距離（ユークリッド距離）
 * @param {[number,number,number]} c1 
 * @param {[number,number,number]} c2 
 * @returns {number}
 */
function colorDistance(c1, c2) {
  return Math.sqrt(
    (c1[0]-c2[0])**2 +
    (c1[1]-c2[1])**2 +
    (c1[2]-c2[2])**2
  );
}

/**
 * 任意のRGBをパレットの中で最も近い色に変換する
 * @param {[number,number,number]} rgb 
 * @returns {string} HEXカラーコード
 */
function nearestColor(rgb) {
  let minDist = Infinity;
  let nearest = palette[0];
  for (const p of palette) {
    const prgb = hexToRgb(p);
    const dist = colorDistance(rgb, prgb);
    if (dist < minDist) {
      minDist = dist;
      nearest = p;
    }
  }
  return nearest;
}
