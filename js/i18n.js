// i18n.js
export const messages = {
  ja: {
    title: "WPLACE ドット絵変換ツール",
    upload: "画像アップロード (JPG, PNG):",
    dotWidth: "ドット絵 横サイズ:",
    dotHeight: "ドット絵 縦サイズ:",
    applyAspect: "アスペクト比反映",
    selectorColor: "長方形選択枠の色:",
    gridBase: "グリッド線の太さ基準値:",
    gridBaseNote: "(横のドット数 w に対し、線の太さ ≈ (基準値 ÷ w) px で描画します。)",
    gridColor: "グリッド線色:",
    convert: "ドット絵に変換",
    result: "変換結果",
  },
  en: {
    title: "WPLACE Pixel Art Converter",
    upload: "Upload Image (JPG, PNG):",
    dotWidth: "Dot Width:",
    dotHeight: "Dot Height:",
    applyAspect: "Apply Aspect Ratio",
    selectorColor: "Selection Box Color:",
    gridBase: "Grid Line Base Thickness:",
    gridBaseNote: "(Line thickness ≈ Base ÷ # of horizontal dots)",
    gridColor: "Grid Line Color:",
    convert: "Convert to Pixel Art",
    result: "Result",
  }
};

export function setLanguage(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (messages[lang] && messages[lang][key]) {
      el.textContent = messages[lang][key];
    }
  });
}
