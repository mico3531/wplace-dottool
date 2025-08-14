/**
 * palette.js
 * WPLACEの31色パレットとCIEDE2000による最近似色検索
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

// RGB → LAB変換
export function rgbToLab(rgb) {
  let [r, g, b] = rgb.map(v => v / 255);

  // sRGB → XYZ
  r = r > 0.04045 ? Math.pow((r + 0.055)/1.055, 2.4) : r/12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055)/1.055, 2.4) : g/12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055)/1.055, 2.4) : b/12.92;

  const X = r*0.4124564 + g*0.3575761 + b*0.1804375;
  const Y = r*0.2126729 + g*0.7151522 + b*0.0721750;
  const Z = r*0.0193339 + g*0.1191920 + b*0.9503041;

  // XYZ → LAB
  const refX = 0.95047, refY = 1.00000, refZ = 1.08883;
  let fx = X/refX > 0.008856 ? Math.cbrt(X/refX) : (903.3*(X/refX)+16)/116;
  let fy = Y/refY > 0.008856 ? Math.cbrt(Y/refY) : (903.3*(Y/refY)+16)/116;
  let fz = Z/refZ > 0.008856 ? Math.cbrt(Z/refZ) : (903.3*(Z/refZ)+16)/116;

  const L = 116*fy - 16;
  const a = 500*(fx - fy);
  const b2 = 200*(fy - fz);

  return [L, a, b2];
}

// CIEDE2000 色差
export function deltaE00(lab1, lab2) {
  const [L1,a1,b1] = lab1;
  const [L2,a2,b2] = lab2;

  const avgLp = (L1+L2)/2;
  const C1 = Math.sqrt(a1*a1 + b1*b1);
  const C2 = Math.sqrt(a2*a2 + b2*b2);
  const avgC = (C1+C2)/2;

  const G = 0.5*(1 - Math.sqrt(Math.pow(avgC,7)/(Math.pow(avgC,7)+Math.pow(25,7))));
  const a1p = a1*(1+G);
  const a2p = a2*(1+G);

  const C1p = Math.sqrt(a1p*a1p + b1*b1);
  const C2p = Math.sqrt(a2p*a2p + b2*b2);
  const avgCp = (C1p+C2p)/2;

  const h1p = Math.atan2(b1,a1p) * 180/Math.PI;
  const h2p = Math.atan2(b2,a2p) * 180/Math.PI;
  const h1p_ = h1p < 0 ? h1p+360 : h1p;
  const h2p_ = h2p < 0 ? h2p+360 : h2p;

  let deltahp;
  if (Math.abs(h1p_-h2p_) <= 180) deltahp = h2p_ - h1p_;
  else deltahp = h2p_ <= h1p_ ? h2p_ - h1p_ + 360 : h2p_ - h1p_ - 360;

  const deltaLp = L2 - L1;
  const deltaCp = C2p - C1p;
  const deltaHp = 2*Math.sqrt(C1p*C2p)*Math.sin(deltahp/2*Math.PI/180);

  const avgHp = Math.abs(h1p_-h2p_) > 180 ? (h1p_+h2p_+360)/2 : (h1p_+h2p_)/2;

  const T = 1 - 0.17*Math.cos((avgHp-30)*Math.PI/180)
              + 0.24*Math.cos((2*avgHp)*Math.PI/180)
              + 0.32*Math.cos((3*avgHp+6)*Math.PI/180)
              - 0.20*Math.cos((4*avgHp-63)*Math.PI/180);

  const SL = 1 + (0.015*Math.pow(avgLp-50,2))/Math.sqrt(20+Math.pow(avgLp-50,2));
  const SC = 1 + 0.045*avgCp;
  const SH = 1 + 0.015*avgCp*T;

  const deltaTheta = 30*Math.exp(-Math.pow((avgHp-275)/25,2));
  const RC = 2*Math.sqrt(Math.pow(avgCp,7)/(Math.pow(avgCp,7)+Math.pow(25,7)));
  const RT = -RC*Math.sin(2*deltaTheta*Math.PI/180);

  return Math.sqrt(
    Math.pow(deltaLp/SL,2) +
    Math.pow(deltaCp/SC,2) +
    Math.pow(deltaHp/SH,2) +
    RT*(deltaCp/SC)*(deltaHp/SH)
  );
}

// パレット色をLABに変換してキャッシュ
const paletteLab = palette.map(hex => rgbToLab(hexToRgb(hex)));

// 入力RGBに最も近いパレット色のHEXを返す (CIEDE2000)
export function nearestColor(rgb) {
  const lab1 = rgbToLab(rgb);
  let minDelta = Infinity;
  let nearest = palette[0];

  for (let i=0; i<palette.length; i++) {
    const d = deltaE00(lab1, paletteLab[i]);
    if (d < minDelta) {
      minDelta = d;
      nearest = palette[i];
    }
  }

  return nearest;
}
