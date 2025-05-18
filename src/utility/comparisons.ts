// A collection of comparison operators for sorting lists
/** Compares 2 strings, with an awareness for numbers within those strings
 * https://stackoverflow.com/questions/2802341/natural-sort-of-alphanumerical-strings-in-javascript
 */
const naturalSort = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
}).compare;

export { naturalSort };
