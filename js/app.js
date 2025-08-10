/**
 * app.js
 * 画像アップロード、サイズ指定、選択枠制御、ドット絵変換を統合
 */

import { palette, hexToRgb, nearestColor } from './palette.js';
import FixedAspectSelector from './selector.js';

window.addEventListener('DOMContentLoaded', () => {
  const inputImage = document.getElementById('inputImage');
  const dotWidthInput = document.getElementById('dotWidth');
  const dotHeightInput = document.getElementById('dotHeight');
  const applyAspectBtn = document.getElementById('applyAspect');
  const imageContainer = document.getElementById('imageContainer');
  const sourceCanvas = document.getElementById('sourceCanvas');
  const resultCanvas = document.getElementById('resultCanvas');
  const convertBtn = document.getElementById('convertBtn');

  const sourceCtx = sourceCanvas.getContext('2d');
  const resultCtx = resultCanvas.getContext('2d');

  let img = null;
  let selector = null;

  // 画像アップロード時
  inputImage.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    img = new Image();
    img.onload = () => {
      // canvasサイズ合わせる
      sourceCanvas.width = img.width;
      sourceCanvas.height = img.height;
      sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
      sourceCtx.drawImage(img, 0, 0);

      // 既存selector破棄
      if (selector) {
        selector.selectionBox.remove();
      }

      // 初期アスペクト比は入力値で決定
      const aspectRatio = dotWidthInput.value / dotHeightInput.value;
      selector = new FixedAspectSelector(imageContainer, aspectRatio);

      // 選択枠をcanvasサイズに合わせて初期配置
      const initWidth = Math.min(200, img.width);
      selector.box = {
        x: (img.width - initWidth) / 2,
        y: (img.height - initWidth / aspectRatio) / 2,
        width: initWidth,
        height: initWidth / aspectRatio
      };
      selector.update();
    };
    img.src = url;
  });

  // アスペクト比反映ボタン
  applyAspectBtn.addEventListener('click', () => {
    if (!selector) return;
    const aspectRatio = dotWidthInput.value / dotHeightInput.value;
    selector.setAspectRatio(aspectRatio);
  });

  // ドット絵変換ボタン
  convertBtn.addEventListener('click', () => {
    if (!img || !selector) return;

    const rect = selector.getRect();

    // 選択範囲を切り抜くため一旦別canvasへ
    const tmpCanvas = document.createElement('canvas');
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCanvas.width = rect.width;
    tmpCanvas.height = rect.height;
    tmpCtx.drawImage(sourceCanvas, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);

    // ドット絵サイズを取得
    const outW = parseInt(dotWidthInput.value, 10);
    const outH = parseInt(dotHeightInput.value, 10);
    if (isNaN(outW) || isNaN(outH) || outW <= 0 || outH <= 0) {
      alert('ドット絵サイズは正の整数で指定してください');
      return;
    }

    // 縮小してドット絵化
    const outCanvas = document.createElement('canvas');
    outCanvas.width = outW;
    outCanvas.height = outH;
    const outCtx = outCanvas.getContext('2d');

    // 画像を縮小（バイリニア補間）
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(tmpCanvas, 0, 0, rect.width, rect.height, 0, 0, outW, outH);

    // パレットに最も近い色に変換
    const imageData = outCtx.getImageData(0, 0, outW, outH);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const rgb = [data[i], data[i+1], data[i+2]];
      const nearestHex = nearestColor(rgb);
      const [r, g, b] = hexToRgb(nearestHex);
      data[i] = r;
      data[i+1] = g;
      data[i+2] = b;
      // alphaはそのまま
    }
    outCtx.putImageData(imageData, 0, 0);

    // 結果キャンバスに転送
    resultCanvas.width = outW;
    resultCanvas.height = outH;
    resultCtx.imageSmoothingEnabled = false;
    resultCtx.clearRect(0, 0, outW, outH);
    resultCtx.drawImage(outCanvas, 0, 0);
  });
});
