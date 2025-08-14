import FixedAspectSelector from './selector.js';

export function initImageLoader(store, { getSelectorColors }) {
  const inputImage = document.getElementById('inputImage');
  const dotWidthInput = document.getElementById('dotWidth');
  const imageContainer = document.getElementById('imageContainer');

  inputImage.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      store.sourceCanvas.width = img.width;
      store.sourceCanvas.height = img.height;
      store.sourceCanvas.style.width = img.width + 'px';
      store.sourceCanvas.style.height = img.height + 'px';

      store.sourceCtx.clearRect(0,0,img.width,img.height);
      store.sourceCtx.drawImage(img,0,0);

      if (store.selector) {
        store.selector.selectionBox.remove();
      }

      const aspectRatio = dotWidthInput.value / document.getElementById('dotHeight').value;
      store.selector = new FixedAspectSelector(imageContainer, aspectRatio);

      const { border, fill } = getSelectorColors(document.getElementById('selectorColor').value || 'red');
      store.selector.setColors(border, fill);

      const initWidth = Math.min(200, img.width);
      store.selector.box = {
        x: (img.width - initWidth)/2,
        y: (img.height - initWidth/aspectRatio)/2,
        width: initWidth,
        height: initWidth/aspectRatio
      };
      store.selector.update();
    };
    img.src = url;
    store.img = img;
  });
}
