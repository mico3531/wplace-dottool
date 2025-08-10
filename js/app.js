const srcCanvas = document.getElementById("srcCanvas");
const srcCtx = srcCanvas.getContext("2d");
const previewCanvas = document.getElementById("previewCanvas");
const previewCtx = previewCanvas.getContext("2d");

let img = new Image();
let selection = null;
let isDragging = false;
let startX, startY;

// 画像読み込み
document.getElementById("fileInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    img.onload = () => {
      srcCanvas.width = img.width;
      srcCanvas.height = img.height;
      srcCtx.drawImage(img, 0, 0);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// 範囲選択
srcCanvas.addEventListener("mousedown", e => {
  const rect = srcCanvas.getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;
  isDragging = true;
});
srcCanvas.addEventListener("mousemove", e => {
  if (!isDragging) return;
  const rect = srcCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const w = x - startX;
  const h = y - startY;
  srcCtx.drawImage(img, 0, 0);
  srcCtx.strokeStyle = "red";
  srcCtx.lineWidth = 2;
  srcCtx.strokeRect(startX, startY, w, h);
});
srcCanvas.addEventListener("mouseup", e => {
  isDragging = false;
  const rect = srcCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  selection = {
    x: Math.min(startX, x),
    y: Math.min(startY, y),
    w: Math.abs(x - startX),
    h: Math.abs(y - startY)
  };
});

// 変換処理
document.getElementById("convertBtn").addEventListener("click", () => {
  if (!selection) {
    alert("範囲を選択してください");
    return;
  }
  const dotW = parseInt(document.getElementById("dotWidth").value);
  const dotH = parseInt(document.getElementById("dotHeight").value);

  const imageData = srcCtx.getImageData(selection.x, selection.y, selection.w, selection.h);
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = dotW;
  tempCanvas.height = dotH;
  const tempCtx = tempCanvas.getContext("2d");

  const tempImgCanvas = document.createElement("canvas");
  tempImgCanvas.width = selection.w;
  tempImgCanvas.height = selection.h;
  tempImgCanvas.getContext("2d").putImageData(imageData, 0, 0);
  tempCtx.drawImage(tempImgCanvas, 0, 0, dotW, dotH);

  const data = tempCtx.getImageData(0, 0, dotW, dotH);
  for (let i = 0; i < data.data.length; i += 4) {
    const rgb = {r: data.data[i], g: data.data[i+1], b: data.data[i+2]};
    const nc = nearestColor(rgb);
    data.data[i] = nc.r;
    data.data[i+1] = nc.g;
    data.data[i+2] = nc.b;
  }
  tempCtx.putImageData(data, 0, 0);

  const scale = 10;
  previewCanvas.width = dotW * scale;
  previewCanvas.height = dotH * scale;
  previewCtx.imageSmoothingEnabled = false;
  previewCtx.drawImage(tempCanvas, 0, 0, dotW * scale, dotH * scale);

  previewCanvas.dataset.downloadUrl = tempCanvas.toDataURL("image/png");
});

// ダウンロード
document.getElementById("downloadBtn").addEventListener("click", () => {
  const url = previewCanvas.dataset.downloadUrl;
  if (!url) {
    alert("変換結果がありません");
    return;
  }
  const a = document.createElement("a");
  a.href = url;
  a.download = "dot_image.png";
  a.click();
});
