import { palette, hexToRgb, nearestColor } from './palette.js';

const FIXED_OUTPUT_WIDTH = 4000;

export function initConverter(store) {
  const convertBtn = document.getElementById('convertBtn');
  const dotWidthInput = document.getElementById('dotWidth');
  const dotHeightInput = document.getElementById('dotHeight');
  const gridBaseInput = document.getElementById('gridBase');
  const gridColorSelect = document.getElementById('gridColor');

  convertBtn.addEventListener('click', () => {
    if (!store.img || !store.selector) return;

    const rect = store.selector.getBox();
    const canvasRect = store.sourceCanvas.getBoundingClientRect();
    const scaleX = store.sourceCanvas.width / canvasRect.width;
    const scaleY = store.sourceCanvas.height / canvasRect.height;

    const sx = Math.round(rect.x * scaleX);
    const sy = Math.round(rect.y * scaleY);
    const sw = Math.round(rect.width * scaleX);
    const sh = Math.round(rect.height * scaleY);

    const tmpCanvas = document.createElement('canvas');
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCanvas.width = sw;
    tmpCanvas.height = sh;
    tmpCtx.drawImage(store.sourceCanvas, sx, sy, sw, sh, 0, 0, sw, sh);

    const outW = parseInt(dotWidthInput.value,10);
    const outH = parseInt(dotHeightInput.value,10);
    if (isNaN(outW)||isNaN(outH)||outW<=0||outH<=0){
      alert('ドット絵サイズは正の整数で指定してください');
      return;
    }

    const outCanvas = document.createElement('canvas');
    outCanvas.width = outW;
    outCanvas.height = outH;
    const outCtx = outCanvas.getContext('2d');
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(tmpCanvas,0,0,sw,sh,0,0,outW,outH);

    const imageData = outCtx.getImageData(0,0,outW,outH);
    const data = imageData.data;
    for(let i=0;i<data.length;i+=4){
      const rgb=[data[i],data[i+1],data[i+2]];
      const nearestHex = nearestColor(rgb);
      const [r,g,b] = hexToRgb(nearestHex);
      data[i]=r; data[i+1]=g; data[i+2]=b;
    }
    outCtx.putImageData(imageData,0,0);

    // ===== 高解像度＋グリッド描画 =====
    const gridBase = parseFloat(gridBaseInput.value) || 400;
    const gridThickness = Math.max(1, Math.round(gridBase/outW));
    const gridColor = gridColorSelect.value || 'red';

    const cellSize = Math.floor((FIXED_OUTPUT_WIDTH-(outW+1)*gridThickness)/outW);
    const enlargedW = outW*cellSize + (outW+1)*gridThickness;
    const enlargedH = outH*cellSize + (outH+1)*gridThickness;

    store.resultCanvas.width = enlargedW;
    store.resultCanvas.height = enlargedH;
    store.resultCtx.imageSmoothingEnabled = false;

    store.resultCtx.fillStyle = gridColor;
    store.resultCtx.fillRect(0,0,enlargedW,enlargedH);

    const srcData = outCtx.getImageData(0,0,outW,outH).data;
    for(let y=0;y<outH;y++){
      for(let x=0;x<outW;x++){
        const idx=(y*outW+x)*4;
        const r=srcData[idx];
        const g=srcData[idx+1];
        const b=srcData[idx+2];
        const a=srcData[idx+3]/255;
        store.resultCtx.fillStyle=`rgba(${r},${g},${b},${a})`;
        const px=gridThickness+x*(cellSize+gridThickness);
        const py=gridThickness+y*(cellSize+gridThickness);
        store.resultCtx.fillRect(px,py,cellSize,cellSize);
      }
    }

    store.resultCanvas.style.width=window.innerWidth*0.6+'px';
    store.resultCanvas.style.height='auto';
  });
}
