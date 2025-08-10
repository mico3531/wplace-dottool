/**
 * app.js
 * メイン処理
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

  inputImage.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    img = new Image();
    img.onload = () => {
      // canvasのサイズを画像サイズに合わせる
      sourceCanvas.width = img.width;
      sourceCanvas.height = img.height;

      // canvasの表示サイズも画像サイズに合わせる（CSS的）
      sourceCanvas.style.width = img.width + 'px';
      sourceCanvas.style.height = img.height + 'px';

      sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
      sourceCtx.drawImage(img, 0, 0);

      if (selector) {
        selector.selectionBox.remove();
      }

      const aspectRatio = dotWidthInput.value / dotHeightInput.value;
      selector = new FixedAspectSelector(imageContainer, aspectRatio);

      // 初期選択枠サイズ（最大200px幅か画像幅の小さい方）
      const initWidth = Math.min(200, img.width);
      selector.box = {
        x: (img.width - initWidth) / 2,
        y: (img.height - initWidth / aspectRatio) / 2,
        width: initWidth,
        height: initWidth / aspectRatio,
      };
      selector.update();
    };
    img.src = url;
  });

  applyAspectBtn.addEventListener('click', () => {
    if (!selector) return;
    const aspectRatio = dotWidthInput.value / dotHeightInput.value;
    selector.setAspectRatio(aspectRatio);
  });

  convertBtn.addEventListener('click', () => {
    if (!img || !selector) return;

    const rect = selector.getRect();

    // 選択範囲切り抜き用キャンバス
    const tmpCanvas = document.createElement('canvas');
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCanvas.width = rect.width;
    tmpCanvas.height = rect.height;
    tmpCtx.drawImage(sourceCanvas, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);

    const outW = parseInt(dotWidthInput.value, 10);
    const outH = parseInt(dotHeightInput.value, 10);

    if (isNaN(outW) || isNaN(outH) || outW <= 0 || outH <= 0) {
      alert('ドット絵サイズは正の整数で指定してください');
      return;
    }

    // 縮小用キャンバス
    const outCanvas = document.createElement('canvas');
    outCanvas.width = outW;
    outCanvas.height = outH;
    const outCtx = outCanvas.getContext('2d');

    // 補間なしで縮小
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(tmpCanvas, 0, 0, rect.width, rect.height, 0, 0, outW, outH);

    // 色をパレットに近い色に変換
    const imageData = outCtx.getImageData(0, 0, outW, outH);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const rgb = [data[i], data[i + 1], data[i + 2]];
      const nearestHex = nearestColor(rgb);
      const [r, g, b] = hexToRgb(nearestHex);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      // alphaはそのまま
    }
    outCtx.putImageData(imageData, 0, 0);

    // 結果キャンバスに表示
    resultCanvas.width = outW;
    resultCanvas.height = outH;
    resultCtx.imageSmoothingEnabled = false;
    resultCtx.clearRect(0, 0, outW, outH);
    resultCtx.drawImage(outCanvas, 0, 0);

  });
});
