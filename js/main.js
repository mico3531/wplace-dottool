import { wplacePalette } from "./palette.js";
import { convertToDotPixel } from "./dotpixel.js";

const uploadImage = document.getElementById("uploadImage");
const dotWidthInput = document.getElementById("dotWidth");
const dotHeightInput = document.getElementById("dotHeight");
const setSizeBtn = document.getElementById("setSizeBtn");
const convertBtn = document.getElementById("convertBtn");

const imageCanvas = document.getElementById("imageCanvas");
const overlayCanvas = document.getElementById("overlayCanvas");
const outputCanvas = document.getElementById("outputCanvas");

const imgCtx = imageCanvas.getContext("2d");
const overlayCtx = overlayCanvas.getContext("2d");
const outputCtx = outputCanvas.getContext("2d");

let img = new Image();
let dotWidth = 32;
let dotHeight = 32;

let selection = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  draggingCorner: null,
  draggingEdge: null,
  dragOffsetX: 0,
  dragOffsetY: 0,
};

let isDragging = false;
let dragType = null; // "corner", "edge"
let dragTarget = null;

const MAX_OUTPUT_WIDTH_RATIO = 0.9; // 90% of window width

uploadImage.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    img.onload = () => {
      // キャンバスサイズは画像サイズに合わせる
      imageCanvas.width = img.width;
      imageCanvas.height = img.height;
      overlayCanvas.width = img.width;
      overlayCanvas.height = img.height;

      imageCanvas.style.position = "relative";
      overlayCanvas.style.position = "absolute";
      overlayCanvas.style.left = imageCanvas.offsetLeft + "px";
      overlayCanvas.style.top = imageCanvas.offsetTop + "px";
      overlayCanvas.style.pointerEvents = "auto";

      imgCtx.clearRect(0,0,imageCanvas.width,imageCanvas.height);
      imgCtx.drawImage(img, 0, 0);

      // アスペクト比に合わせて初期選択範囲を画像中央に作成
      const aspect = dotWidth / dotHeight;
      let selWidth = img.width * 0.5;
      let selHeight = selWidth / aspect;
      if(selHeight > img.height) {
        selHeight = img.height * 0.5;
        selWidth = selHeight * aspect;
      }
      selection.x = (img.width - selWidth) / 2;
      selection.y = (img.height - selHeight) / 2;
      selection.width = selWidth;
      selection.height = selHeight;

      drawOverlay();

      convertBtn.disabled = false;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

setSizeBtn.addEventListener("click", () => {
  const w = Number(dotWidthInput.value);
  const h = Number(dotHeightInput.value);
  if(w < 1 || h < 1) {
    alert("ドット絵の幅と高さは1以上の整数で入力してください");
    return;
  }
  dotWidth = w;
  dotHeight = h;

  if(img.src) {
    // 選択範囲をアスペクト比に合わせて調整
    const aspect = dotWidth / dotHeight;
    let selWidth = selection.width;
    let selHeight = selWidth / aspect;
    if(selHeight > img.height) {
      selHeight = img.height * 0.5;
      selWidth = selHeight * aspect;
    }
    selection.width = selWidth;
    selection.height = selHeight;

    // 範囲Y座標も中央に寄せる
    selection.y = Math.min(selection.y, img.height - selection.height);

    drawOverlay();
  }
});

function drawOverlay() {
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  // 半透明黒で全体を暗くする
  overlayCtx.fillStyle = "rgba(0,0,0,0.4)";
  overlayCtx.fillRect(0,0,overlayCanvas.width, overlayCanvas.height);

  // 選択範囲の中は透明に
  overlayCtx.clearRect(selection.x, selection.y, selection.width, selection.height);

  // 選択枠を描画
  overlayCtx.strokeStyle = "#00ff00";
  overlayCtx.lineWidth = 2;
  overlayCtx.strokeRect(selection.x, selection.y, selection.width, selection.height);

  // コーナーのハンドル（四角形）
  const handleSize = 10;
  const corners = getCorners(selection);
  overlayCtx.fillStyle = "#00ff00";
  corners.forEach(c => {
    overlayCtx.fillRect(c.x - handleSize/2, c.y - handleSize/2, handleSize, handleSize);
  });
}

// 選択枠の四隅座標取得
function getCorners(sel) {
  return [
    {x: sel.x, y: sel.y}, // 左上
    {x: sel.x + sel.width, y: sel.y}, // 右上
    {x: sel.x + sel.width, y: sel.y + sel.height}, // 右下
    {x: sel.x, y: sel.y + sel.height} // 左下
  ];
}

// 選択枠の四辺座標取得
function getEdges(sel) {
  return [
    {x1: sel.x, y1: sel.y, x2: sel.x + sel.width, y2: sel.y, name: "top"},
    {x1: sel.x + sel.width, y1: sel.y, x2: sel.x + sel.width, y2: sel.y + sel.height, name: "right"},
    {x1: sel.x, y1: sel.y + sel.height, x2: sel.x + sel.width, y2: sel.y + sel.height, name: "bottom"},
    {x1: sel.x, y1: sel.y, x2: sel.x, y2: sel.y + sel.height, name: "left"},
  ];
}

// マウス座標取得（canvas内の座標）
function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

// マウスのドラッグ開始判定用
function isNearPoint(px, py, x, y, radius=10) {
  return Math.abs(px - x) <= radius && Math.abs(py - y) <= radius;
}

// マウスのドラッグ開始判定（辺の近傍判定、辺の判定は垂直か水平なので楽）
function isNearEdge(px, py, edge, margin=6) {
  // 横辺か縦辺か判定
  if(edge.y1 === edge.y2) {
    // 横辺
    if(py >= edge.y1 - margin && py <= edge.y1 + margin &&
      px >= Math.min(edge.x1, edge.x2) && px <= Math.max(edge.x1, edge.x2)) {
      return true;
    }
  } else {
    // 縦辺
    if(px >= edge.x1 - margin && px <= edge.x1 + margin &&
      py >= Math.min(edge.y1, edge.y2) && py <= Math.max(edge.y1, edge.y2)) {
      return true;
    }
  }
  return false;
}

let dragStart = null;

overlayCanvas.addEventListener("mousedown", (e) => {
  if(!img.src) return;
  const pos = getMousePos(overlayCanvas, e);

  // まず角を判定
  const corners = getCorners(selection);
  for(let i=0; i<corners.length; i++) {
    if(isNearPoint(pos.x, pos.y, corners[i].x, corners[i].y)) {
      dragType = "corner";
      dragTarget = i;
      isDragging = true;
      return;
    }
  }

  // 次に辺の判定
  const edges = getEdges(selection);
  for(let i=0; i<edges.length; i++) {
    if(isNearEdge(pos.x, pos.y, edges[i])) {
      dragType = "edge";
      dragTarget = edges[i].name;
      isDragging = true;
      dragStart = pos;
      return;
    }
  }
});

overlayCanvas.addEventListener("mousemove", (e) => {
  if(!isDragging) return;
  if(!img.src) return;

  const pos = getMousePos(overlayCanvas, e);

  if(dragType === "corner") {
    // 角をドラッグしてリサイズ（アスペクト比維持）
    resizeFromCorner(dragTarget, pos);
  } else if(dragType === "edge") {
    // 辺をドラッグして平行移動
    moveEdge(dragTarget, pos);
  }
  drawOverlay();
});

overlayCanvas.addEventListener("mouseup", () => {
  isDragging = false;
  dragType = null;
  dragTarget = null;
  dragStart = null;
});

// 角ドラッグでアスペクト比維持しながらリサイズ
function resizeFromCorner(cornerIndex, pos) {
  const aspect = dotWidth / dotHeight;

  // 元の対角点
  const corners = getCorners(selection);
  const fixedCornerIndex = (cornerIndex + 2) % 4;
  const fixed = corners[fixedCornerIndex];

  let newX = pos.x;
  let newY = pos.y;

  // 制約内で新しい幅・高さ計算
  let newWidth = Math.abs(newX - fixed.x);
  let newHeight = newWidth / aspect;

  if(fixed.y > newY) {
    newY = fixed.y - newHeight;
  } else {
    newY = fixed.y + newHeight;
  }

  // 最小サイズの制限
  const MIN_SIZE = 10;
  if(newWidth < MIN_SIZE) newWidth = MIN_SIZE;
  if(newHeight < MIN_SIZE) newHeight = MIN_SIZE;

  // 範囲外制限
  newX = Math.min(Math.max(newX, 0), imageCanvas.width);
  newY = Math.min(Math.max(newY, 0), imageCanvas.height);

  // selection更新
  selection.x = Math.min(newX, fixed.x);
  selection.y = Math.min(newY, fixed.y);
  selection.width = newWidth;
  selection.height = newHeight;

  clampSelectionToImage();
}

// 辺のドラッグで平行移動（縦か横のみ）
function moveEdge(edgeName, pos) {
  if(!dragStart) return;

  const dx = pos.x - dragStart.x;
  const dy = pos.y - dragStart.y;

  if(edgeName === "top" || edgeName === "bottom") {
    // 垂直方向だけ動かす
    let newY = (edgeName === "top") ? selection.y + dy : selection.y + selection.height + dy;
    newY = Math.min(Math.max(newY, 0), imageCanvas.height);

    if(edgeName === "top") {
      // top移動すると高さが変わる
      let newHeight = selection.y + selection.height - newY;
      if(newHeight < 10) return;
      selection.y = newY;
      selection.height = newHeight;
    } else {
      // bottom移動
      let newHeight = newY - selection.y;
      if(newHeight < 10) return;
      selection.height = newHeight;
    }
  } else {
    // left or right
    let newX = (edgeName === "left") ? selection.x + dx : selection.x + selection.width + dx;
    newX = Math.min(Math.max(newX, 0), imageCanvas.width);

    if(edgeName === "left") {
      let newWidth = selection.x + selection.width - newX;
      if(newWidth < 10) return;
      selection.x = newX;
      selection.width = newWidth;
    } else {
      let newWidth = newX - selection.x;
      if(newWidth < 10) return;
      selection.width = newWidth;
    }
  }

  dragStart = pos;

  clampSelectionToImage();
}

// 選択範囲が画像キャンバス内に収まるよう制限
function clampSelectionToImage() {
  if(selection.x < 0) selection.x = 0;
  if(selection.y < 0) selection.y = 0;
  if(selection.x + selection.width > imageCanvas.width) {
    selection.x = imageCanvas.width - selection.width;
  }
  if(selection.y + selection.height > imageCanvas.height) {
    selection.y = imageCanvas.height - selection.height;
  }
}

// ドット絵変換ボタン押下
convertBtn.addEventListener("click", () => {
  if(!img.src) return;

  const dotPixelCanvas = convertToDotPixel(img,
    selection.x, selection.y, selection.width, selection.height,
    dotWidth, dotHeight
  );

  // 表示領域に合わせて拡大表示（最大はウィンドウ幅の90%）
  const maxWidth = window.innerWidth * MAX_OUTPUT_WIDTH_RATIO;
  let scale = Math.floor(maxWidth / dotWidth);
  if(scale < 1) scale = 1;

  outputCanvas.width = dotWidth * scale;
  outputCanvas.height = dotHeight * scale;

  outputCtx.imageSmoothingEnabled = false;
  outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
  outputCtx.drawImage(dotPixelCanvas, 0, 0, dotWidth, dotHeight, 0, 0, outputCanvas.width, outputCanvas.height);
});
