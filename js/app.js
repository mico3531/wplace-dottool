/**
 * app.js
 * メイン処理（グリッド線込み高解像度出力＋UI設定対応版）
*/

import { palette, hexToRgb, nearestColor } from './palette.js';
import FixedAspectSelector from './selector.js';
import { setLanguage } from './i18n.js';
import { setColors } from './l10n.js';

window.addEventListener('DOMContentLoaded', () => {
  const langSwitch = document.getElementById('langSwitch');

  function changeLanguage(lang) {
    setLanguage(lang);   // UIラベル等の切替
    setColors(lang);     // 色名の切替
  }

  // 初期設定
  changeLanguage('ja');

  // 言語切替イベント
  langSwitch.addEventListener('change', (e) => {
    changeLanguage(e.target.value);
  });

  const inputImage = document.getElementById('inputImage');
  const dotWidthInput = document.getElementById('dotWidth');
  const dotHeightInput = document.getElementById('dotHeight');
  const applyAspectBtn = document.getElementById('applyAspect');
  const imageContainer = document.getElementById('imageContainer');
  const sourceCanvas = document.getElementById('sourceCanvas');
  const resultCanvas = document.getElementById('resultCanvas');
  const convertBtn = document.getElementById('convertBtn');
  const gridBaseInput = document.getElementById('gridBase');
  const gridColorSelect = document.getElementById('gridColor'); 
  const selectorColorSelect = document.getElementById('selectorColor'); 

  const sourceCtx = sourceCanvas.getContext('2d');
  const resultCtx = resultCanvas.getContext('2d');

  let img = null;
  let selector = null;

  const FIXED_OUTPUT_WIDTH = 4000;

  // 選択枠の色設定マップ
  function getSelectorColors(name) {
    switch (name) {
      case 'blue':
        return { border: '#00f', fill: 'rgba(0,0,255,0.12)' };
      case 'black':
        return { border: '#000', fill: 'rgba(0,0,0,0.12)' };
      case 'white':
        return { border: '#fff', fill: 'rgba(255,255,255,0.12)' };
      case 'red':
      default:
        return { border: '#f00', fill: 'rgba(255,0,0,0.12)' };
    }
  }

  inputImage.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    img = new Image();
    img.onload = () => {
      sourceCanvas.width = img.width;
      sourceCanvas.height = img.height;
      sourceCanvas.style.width = img.width + 'px';
      sourceCanvas.style.height = img.height + 'px';

      sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
      sourceCtx.drawImage(img, 0, 0);

      if (selector) {
        selector.selectionBox.remove();
      }

      const aspectRatio = dotWidthInput.value / dotHeightInput.value;
      selector = new FixedAspectSelector(imageContainer, aspectRatio);

      // 初期色設定
      const { border, fill } = getSelectorColors(selectorColorSelect.value || 'red');
      selector.setColors(border, fill);

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

  // 選択枠色変更イベント
  selectorColorSelect.addEventListener('change', () => {
    if (selector) {
      const { border, fill } = getSelectorColors(selectorColorSelect.value || 'red');
      selector.setColors(border, fill);
    }
  });

  convertBtn.addEventListener('click', () => {
    if (!img || !selector) return;

    const rect = selector.getBox();
    const canvasRect = sourceCanvas.getBoundingClientRect();
    const scaleX = sourceCanvas.width / canvasRect.width;
    const scaleY = sourceCanvas.height / canvasRect.height;

    const sx = Math.round(rect.x * scaleX);
    const sy = Math.round(rect.y * scaleY);
    const sw = Math.round(rect.width * scaleX);
    const sh = Math.round(rect.height * scaleY);

    const tmpCanvas = document.createElement('canvas');
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCanvas.width = sw;
    tmpCanvas.height = sh;
    tmpCtx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, sw, sh);

    const outW = parseInt(dotWidthInput.value, 10);
    const outH = parseInt(dotHeightInput.value, 10);
    if (isNaN(outW) || isNaN(outH) || outW <= 0 || outH <= 0) {
      alert('ドット絵サイズは正の整数で指定してください');
      return;
    }

    const outCanvas = document.createElement('canvas');
    outCanvas.width = outW;
    outCanvas.height = outH;
    const outCtx = outCanvas.getContext('2d');
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(tmpCanvas, 0, 0, sw, sh, 0, 0, outW, outH);

    const imageData = outCtx.getImageData(0, 0, outW, outH);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const rgb = [data[i], data[i + 1], data[i + 2]];
      const nearestHex = nearestColor(rgb);
      const [r, g, b] = hexToRgb(nearestHex);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
    outCtx.putImageData(imageData, 0, 0);

    /** ===== 高解像度＋グリッド込み描画 ===== **/
    const gridBase = parseFloat(gridBaseInput.value) || 400;
    const gridThickness = Math.max(1, Math.round(gridBase / outW));
    const gridColor = gridColorSelect.value || 'red';

    const cellSize = Math.floor(
      (FIXED_OUTPUT_WIDTH - (outW + 1) * gridThickness) / outW
    );
    const enlargedW = outW * cellSize + (outW + 1) * gridThickness;
    const enlargedH = outH * cellSize + (outH + 1) * gridThickness;

    resultCanvas.width = enlargedW;
    resultCanvas.height = enlargedH;
    resultCtx.imageSmoothingEnabled = false;

    // 背景（グリッド線色）
    resultCtx.fillStyle = gridColor;
    resultCtx.fillRect(0, 0, enlargedW, enlargedH);

    const srcData = outCtx.getImageData(0, 0, outW, outH).data;
    for (let y = 0; y < outH; y++) {
      for (let x = 0; x < outW; x++) {
        const idx = (y * outW + x) * 4;
        const r = srcData[idx];
        const g = srcData[idx + 1];
        const b = srcData[idx + 2];
        const a = srcData[idx + 3] / 255;

        resultCtx.fillStyle = `rgba(${r},${g},${b},${a})`;
        const px = gridThickness + x * (cellSize + gridThickness);
        const py = gridThickness + y * (cellSize + gridThickness);
        resultCtx.fillRect(px, py, cellSize, cellSize);
      }
    }

    const maxDisplayWidth = window.innerWidth * 0.6;
    resultCanvas.style.width = maxDisplayWidth + 'px';
    resultCanvas.style.height = 'auto';
  });
});
