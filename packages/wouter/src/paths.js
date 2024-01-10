/*
 * Transforms `path` into its relative `base` version
 * If base isn't part of the path provided returns absolute path e.g. `~/app`
 */
export const relativePath = (base = "", path) =>
  !path.toLowerCase().indexOf(base.toLowerCase())
    ? path.slice(base.length) || "/"
    : "~" + path;

export const absolutePath = (to, base = "") =>
  to[0] === "~" ? to.slice(1) : base + to;

/*
 * Removes leading question mark
 */
export const stripQm = (str) => (str[0] === "?" ? str.slice(1) : str);

/*
 * decodes escape sequences such as %20
 */
export const unescape = (str) => {
  try {
    return decodeURI(str);
  } catch (_e) {
    // fail-safe mode: if string can't be decoded do nothing
    return str;
  }
};
