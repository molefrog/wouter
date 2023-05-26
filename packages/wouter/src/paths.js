/*
 * Transforms `path` into its relative `base` version
 * If base isn't part of the path provided returns absolute path e.g. `~/app`
 */
export const relativePath = (base = "", path = location.pathname) =>
  !path.toLowerCase().indexOf(base.toLowerCase())
    ? path.slice(base.length) || "/"
    : "~" + path;

export const absolutePath = (to, base = "") =>
  to[0] === "~" ? to.slice(1) : base + to;
