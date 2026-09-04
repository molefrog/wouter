/**
 * When basepath is `undefined` or '/' it is ignored (we assume it's empty string)
 */
const baseDefaults = (base = "") => (base === "/" ? "" : base);

export const absolutePath = (to, base) =>
  to[0] === "~" ? to.slice(1) : baseDefaults(base) + to;

/*
 * Transforms `path` into its relative `base` version
 * If base isn't part of the path provided returns absolute path e.g. `~/app`
 */
export const relativePath = (base, path) => {
  base = unescape(baseDefaults(base));
  path = unescape(path);

  return !base || !path.toLowerCase().indexOf(base.toLowerCase())
    ? path.slice(base.length) || "/"
    : "~" + path;
};

/*
 * decodes escape sequences such as %20
 */
const unescape = (str) => {
  try {
    return str.includes("%") ? decodeURI(str) : str;
  } catch (_e) {
    // fail-safe mode: if string can't be decoded do nothing
    return str;
  }
};

/*
 * Removes leading question mark
 */
export const sanitizeSearch = (search) =>
  unescape(search[0] === "?" ? search.slice(1) : search);
