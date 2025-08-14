import FixedAspectSelector from './selector.js';
import { setLanguage } from './i18n.js';
import { setColors } from './l10n.js';

export function getSelectorColors(name) {
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

export function initUI(store) {
  const langSwitch = document.getElementById('langSwitch');
  function changeLanguage(lang) {
    setLanguage(lang);
    setColors(lang);
  }
  changeLanguage('ja');
  langSwitch.addEventListener('change', e => changeLanguage(e.target.value));

  const dotWidthInput = document.getElementById('dotWidth');
  const dotHeightInput = document.getElementById('dotHeight');
  const applyAspectBtn = document.getElementById('applyAspect');
  const selectorColorSelect = document.getElementById('selectorColor');

  applyAspectBtn.addEventListener('click', () => {
    if (!store.selector) return;
    const aspectRatio = dotWidthInput.value / dotHeightInput.value;
    store.selector.setAspectRatio(aspectRatio);
  });

  selectorColorSelect.addEventListener('change', () => {
    if (!store.selector) return;
    const { border, fill } = getSelectorColors(selectorColorSelect.value || 'red');
    store.selector.setColors(border, fill);
  });
}
