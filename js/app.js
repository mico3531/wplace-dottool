/**
 * app.js
 * メイン処理（グリッド線込み高解像度出力＋UI設定対応版）
 */

import { palette, hexToRgb, nearestColor } from './palette.js';
import FixedAspectSelector from './selector.js';
import { setLanguage } from './i18n.js';
import { setColors } from './l10n.js';

window.addEventListener('DOMContentLoaded', () => {
  // --- UI要素 ---
  const langSwitch = document.getElementById('langSwitch');
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

  // --- 言語切替 ---
  function changeLanguage(lang) {
    setLanguage(lang);
    setColors(lang);
  }
  changeLanguage('ja');
  langSwitch.addEventListener('change', e => changeLanguage(e.target.value));

  // --- 選択枠色マップ ---
  function getSelectorColors(name) {
    switch (name) {
      case 'blue': return { border: '#00f', fill: 'rgba(0,0,255,0.12)' };
      case 'black': return { border: '#000', fill: 'rgba(0,0,0,0.12)' };
      case 'white': return { border: '#fff', fill: 'rgba(255,255,255,0.12)' };
      case 'red':
      default: return { border: '#f00', fill: 'rgba(255,0,0,0.12)' };
    }
  }

  // --- 画像読み込み ---
  inputImage.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      sourceCanvas.width = img.width;
      sourceCanvas.height = img.height;
      sourceCanvas.style.width = img.width + 'px';
      sourceCanvas.style.height = img.height + 'px';
      sourceCtx.drawImage(img, 0, 0);

      if (selector) selector.selectionBox.remove();
      const aspectRatio = dotWidthInput.value / dotHeightInput.value;
      selector = new FixedAspectSelector(imageContainer, aspectRatio);

      // 選択枠初期色
      const { border, fill } = getSelectorColors(selectorColorSelect.value || 'red');
      selector.setColors(border, fill);

      // 初期ボックスは中央に配置
      const initWidth = Math.min(200, img.width);
      selector.box = {
        x: (img.width - initWidth) / 2,
        y: (img.height - initWidth / aspectRatio) / 2,
        width: initWidth,
        height: initWidth / aspectRatio
      };
      selector.update();
    };
  });

  // --- 選択枠アスペクト比適用 ---
  applyAspectBtn.addEventListener('click', () => {
    if (!selector) return;
    const aspectRatio = dotWidthInput.value / dotHeightInput.value;
    selector.setAspectRatio(aspectRatio);
  });

  // --- 選択枠色変更 ---
  selectorColorSelect.addEventListener('change', () => {
    if (!selector) return;
    const { border, fill } = getSelectorColors(selectorColorSelect.value || 'red');
    selector.setColors(border, fill);
  });

  // --- ドット変換＋グリッド描画 ---
  convertBtn.addEventListener('click', () => {
    if (!img || !selector) return;

    // 選択範囲をキャンバス座標に変換
    const rect = selector.getBox();
    const scaleX = sourceCanvas.width / sourceCanvas.getBoundingClientRect().width;
    const scaleY = sourceCanvas.height / sourceCanvas.getBoundingClientRect().height;
    const sx = Math.round(rect.x * scaleX);
    const sy = Math.round(rect.y * scaleY);
    const sw = Math.round(rect.width * scaleX);
    const sh = Math.round(rect.height * scaleY);

    // 一時キャンバスで切り抜き
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = sw;
    tmpCanvas.height = sh;
    tmpCanvas.getContext('2d').drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, sw, sh);

    // 出力ドットサイズ
    const outW = parseInt(dotWidthInput.value, 10);
    const outH = parseInt(dotHeightInput.value, 10);
    if (isNaN(outW) || isNaN(outH) || outW <= 0 || outH <= 0) {
      alert('ドット絵サイズは正の整数で指定してください');
      return;
    }

    // ドット化
    const outCanvas = document.createElement('canvas');
    outCanvas.width = outW;
    outCanvas.height = outH;
    const outCtx = outCanvas.getContext('2d');
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(tmpCanvas, 0, 0, sw, sh, 0, 0, outW, outH);

    const data = outCtx.getImageData(0, 0, outW, outH).data;
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = hexToRgb(nearestColor([data[i], data[i+1], data[i+2]]));
      data[i] = r; data[i+1] = g; data[i+2] = b;
    }
    outCtx.putImageData(new ImageData(data, outW, outH), 0, 0);

    // 高解像度＋グリッド描画
    const gridBase = parseFloat(gridBaseInput.value) || 400;
    const gridThickness = Math.max(1, Math.round(gridBase / outW));
    const cellSize = Math.floor((FIXED_OUTPUT_WIDTH - (outW+1)*gridThickness)/outW);
    const enlargedW = outW * cellSize + (outW+1)*gridThickness;
    const enlargedH = outH * cellSize + (outH+1)*gridThickness;

    resultCanvas.width = enlargedW;
    resultCanvas.height = enlargedH;
    resultCtx.imageSmoothingEnabled = false;
    resultCtx.fillStyle = gridColorSelect.value || 'red';
    resultCtx.fillRect(0,0,enlargedW,enlargedH);

    const srcData = outCtx.getImageData(0,0,outW,outH).data;
    for (let y=0; y<outH; y++) {
      for (let x=0; x<outW; x++) {
        const idx = (y*outW+x)*4;
        resultCtx.fillStyle = `rgba(${srcData[idx]},${srcData[idx+1]},${srcData[idx+2]},${srcData[idx+3]/255})`;
        resultCtx.fillRect(gridThickness+x*(cellSize+gridThickness), gridThickness+y*(cellSize+gridThickness), cellSize, cellSize);
      }
    }

    // 表示サイズ調整
    resultCanvas.style.width = window.innerWidth*0.6 + 'px';
    resultCanvas.style.height = 'auto';
  });

});
