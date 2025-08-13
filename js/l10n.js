export const messages = {
  ja: {
    red: "赤",
    blue: "青",
    black: "黒",
    white: "白"
  },
  en: {
    red: "Red",
    blue: "Blue",
    black: "Black",
    white: "White"
  }
};

export function setColors(lang) {
  document.querySelectorAll('#selectorColor option, #gridColor option').forEach(option => {
    const key = option.value;
    if (messages[lang] && messages[lang][key]) {
      option.textContent = messages[lang][key];
    }
  });
}
