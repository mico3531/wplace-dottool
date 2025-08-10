// wplacePaletteはpalette.jsで読み込み済み

function nearestColor(hex) {
  // RGBに変換
  const rgb = hexToRgb(hex);
  let minDist = Infinity;
  let nearest = wplacePalette[0];
  for (const c of wplacePalette) {
    const crgb = hexToRgb(c);
    const dist = colorDistance(rgb, crgb);
    if (dist < minDist) {
      minDist = dist;
      nearest = c;
    }
  }
  return nearest;
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  return {
    r: parseInt(hex.substr(0,2),16),
    g: parseInt(hex.substr(2,2),16),
    b: parseInt(hex.substr(4,2),16),
  };
}

function colorDistance(c1, c2) {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

// ドット絵に変換するメイン関数
function convertToDotPixel(image, sx, sy, sw, sh, dotWidth, dotHeight) {
  // 一時キャンバスに切り抜き画像を縮小
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = dotWidth;
  tmpCanvas.height = dotHeight;
  const tmpCtx = tmpCanvas.getContext("2d");

  tmpCtx.drawImage(image, sx, sy, sw, sh, 0, 0, dotWidth, dotHeight);

  // 縮小後の画像のピクセルデータ取得
  const imgData = tmpCtx.getImageData(0, 0, dotWidth, dotHeight);
  const data = imgData.data;

  // 新たに変換結果用キャンバス作成
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = dotWidth;
  outputCanvas.height = dotHeight;
  const outCtx = outputCanvas.getContext("2d");

  // 各ピクセルをパレットの最も近い色に置き換え
  for(let y=0; y<dotHeight; y++) {
    for(let x=0; x<dotWidth; x++) {
      const i = (y*dotWidth + x)*4;
      const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
      if(a === 0) {
        outCtx.fillStyle = "#ffffff";
      } else {
        const col = nearestColor(rgbToHex(r,g,b));
        outCtx.fillStyle = col;
      }
      outCtx.fillRect(x, y, 1, 1);
    }
  }
  return outputCanvas;
}

function rgbToHex(r,g,b) {
  return "#" + [r,g,b].map(x => {
    const h = x.toString(16);
    return h.length === 1 ? "0"+h : h;
  }).join("");
}
