const translations = {
  ja: {
    title: "ドット絵変換ツール",
    language: "言語:",
    selectImage: "画像ファイルを選択:",
    selectImageDesc: "変換したい画像ファイルを選択してください。",
    dotWidth: "ドット幅:",
    dotWidthDesc: "1ドットあたりの幅をピクセル単位で指定します。",
    dotHeight: "ドット高さ:",
    dotHeightDesc: "1ドットあたりの高さをピクセル単位で指定します。",
    applyAspect: "縦横比を適用",
    applyAspectDesc: "指定したドット幅・高さの比率を選択枠に反映します。",
    gridBase: "基準横幅(px):",
    gridBaseDesc: "変換後キャンバスの基準横幅を設定します。ドット幅に応じて自動調整されます。",
    gridColor: "グリッド線色:",
    gridColorDesc: "グリッド線の色を選択します。",
    selectorColor: "選択枠色:",
    selectorColorDesc: "画像上の選択枠の色を変更します。",
    convert: "変換する",
    convertDesc: "設定に基づき、ドット絵に変換します。",
  },
  en: {
    title: "Pixel Art Converter",
    language: "Language:",
    selectImage: "Select Image File:",
    selectImageDesc: "Choose the image file you want to convert.",
    dotWidth: "Dot Width:",
    dotWidthDesc: "Set the width of each dot in pixels.",
    dotHeight: "Dot Height:",
    dotHeightDesc: "Set the height of each dot in pixels.",
    applyAspect: "Apply Aspect Ratio",
    applyAspectDesc: "Apply the width/height ratio to the selection box.",
    gridBase: "Base Width(px):",
    gridBaseDesc: "Set the base width of the converted canvas. Adjusts automatically according to dot size.",
    gridColor: "Grid Line Color:",
    gridColorDesc: "Select the color of grid lines.",
    selectorColor: "Selection Box Color:",
    selectorColorDesc: "Change the color of the selection box.",
    convert: "Convert",
    convertDesc: "Convert the image to pixel art according to the settings.",
  }
};

export function setLanguage(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}
