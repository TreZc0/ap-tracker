let systemTheme = "light";
// https://stackoverflow.com/questions/56393880/how-do-i-detect-dark-mode-using-javascript
if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
) {
    systemTheme = "dark";
}

/**
 *
 * @param {"system"|"dark"|"light"|null} value
 */
const readThemeValue = (value) => {
    switch (value) {
        case "dark": {
            return "dark";
        }
        case "light": {
            return "light";
        }
        case "system": // fallthrough
        default: {
            return systemTheme;
        }
    }
};

export { readThemeValue };
