/**
 * Generates a random sequence of numbers and letters
 * @param n number of characters in id
 * @returns random values
 */
const generateId = (n: number = 16): string => {
    let result = "";
    while (n-- > 0) {
        result += Math.floor(Math.random() * 36).toString(36);
    }
    return result;
};

export { generateId };
