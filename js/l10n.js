const colorNames = {
  ja: {
    red: "赤",
    blue: "青",
    black: "黒",
    white: "白",
  },
  en: {
    red: "Red",
    blue: "Blue",
    black: "Black",
    white: "White",
  }
};

export function setColors(lang) {
  document.querySelectorAll("[data-i18n-color]").forEach(el => {
    const key = el.getAttribute("data-i18n-color");
    el.textContent = colorNames[lang][key] || key;
  });
}
