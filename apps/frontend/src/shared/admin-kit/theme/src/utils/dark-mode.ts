/** Dark mode class name (UnoCSS) */
const DARK_CLASS = "dark";

/** Semi Design dark mode attribute on body */
const SEMI_THEME_MODE_ATTR = "theme-mode";

/**
 * Toggle HTML class helper
 *
 * @param className Class name to toggle
 * @returns Object with add and remove functions
 */
function toggleHtmlClass(className: string) {
  function add() {
    document.documentElement.classList.add(className);
  }

  function remove() {
    document.documentElement.classList.remove(className);
  }

  return { add, remove };
}

/**
 * Sync Semi Design body[theme-mode] with app dark mode.
 *
 * @see https://semi.design/zh-CN/start/dark-mode
 */
export function toggleSemiThemeMode(darkMode = false): void {
  if (darkMode) {
    document.body.setAttribute(SEMI_THEME_MODE_ATTR, "dark");
  } else {
    document.body.removeAttribute(SEMI_THEME_MODE_ATTR);
  }
}

/**
 * Toggle CSS dark mode
 *
 * - html.dark for UnoCSS theme tokens
 * - body[theme-mode=dark] for Semi Design
 *
 * @param darkMode Is dark mode enabled
 */
export function toggleCssDarkMode(darkMode = false): void {
  const { add, remove } = toggleHtmlClass(DARK_CLASS);

  if (darkMode) {
    add();
  } else {
    remove();
  }

  toggleSemiThemeMode(darkMode);
}

/**
 * Check if dark mode class is present
 *
 * @returns Whether dark mode class is on html element
 */
export function isDarkModeClass(): boolean {
  return document.documentElement.classList.contains(DARK_CLASS);
}
