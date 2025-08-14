import { initUI, getSelectorColors } from './ui.js';
import { initImageLoader } from './imageLoader.js';
import { initConverter } from './converter.js';

const store = {
  img: null,
  selector: null,
  sourceCanvas: document.getElementById('sourceCanvas'),
  sourceCtx: document.getElementById('sourceCanvas').getContext('2d'),
  resultCanvas: document.getElementById('resultCanvas'),
  resultCtx: document.getElementById('resultCanvas').getContext('2d')
};

window.addEventListener('DOMContentLoaded', () => {
  initUI(store);
  initImageLoader(store, { getSelectorColors });
  initConverter(store);
});
