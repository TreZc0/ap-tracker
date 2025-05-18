let systemTheme: "light" | "dark" = "light";
// https://stackoverflow.com/questions/56393880/how-do-i-detect-dark-mode-using-javascript
if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
) {
    systemTheme = "dark";
}

/**
 * Reads a string into a theme value
 * @param value Should be one of "light"|"dark"|"system"|null
 * @returns
 */
const readThemeValue = (
    value: "light" | "dark" | "system" | null
): "light" | "dark" => {
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
