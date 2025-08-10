// wplace 31色パレット（RGB形式）
const palette = [
  "#000000","#3c3c3c","#787878","#d2d2d2",
  "#ffffff","#6a0015","#ff0006","#ff7500",
  "#ffa600","#ffdc00","#fffab4","#00bc5f",
  "#00ea6e","#4cff38","#00836d","#00b1a7",
  "#00e5bd","#1651a4","#0095eb","#00fbf3",
  "#704fff","#93b2ff","#84009f","#b92bbf",
  "#ec9bff","#de007c","#ff0081","#ff86a9",
  "#6e4431","#9d6617","#ffae6c"
].map(c => hexToRgb(c));

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return {r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16)};
}

function colorDistance(c1, c2) {
  return (c1.r - c2.r)**2 + (c1.g - c2.g)**2 + (c1.b - c2.b)**2;
}

function nearestColor(rgb) {
  let minDist = Infinity, nearest = palette[0];
  for (const p of palette) {
    const dist = colorDistance(rgb, p);
    if (dist < minDist) { minDist = dist; nearest = p; }
  }
  return nearest;
}
