// @ts-check
/**
 * Generates a random sequence of numbers and letters
 * @param {number} n number of characters in id
 * @returns {string} random values
 */
const generateId = (n = 16) => {
    let result = "";
    while (n-- > 0) {
        result += Math.floor(Math.random() * 36).toString(36);
    }
    return result;
};

export { generateId };
