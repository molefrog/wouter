/**
 * The function below was extracted from the `regexparam` package.
 * It has been modified to support optional wildcards, which is
 * addressed in this PR https://github.com/lukeed/regexparam/pull/25
 *
 * The original source code is distributed under the MIT license
 * and is available at: https://github.com/lukeed/regexparam
 *
 * Copyright: Luke Edwards
 */

export function parse(str, loose) {
  if (str instanceof RegExp) return { keys: false, pattern: str };
  var c,
    o,
    tmp,
    ext,
    keys = [],
    pattern = "",
    arr = str.split("/");
  arr[0] || arr.shift();

  while ((tmp = arr.shift())) {
    c = tmp[0];
    if (c === "*") {
      o = tmp[1] === "?";
      keys.push("wild");
      pattern += o ? "(?:/(.*))?" : "/(.*)";
    } else if (c === ":") {
      o = tmp.indexOf("?", 1);
      ext = tmp.indexOf(".", 1);
      keys.push(tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length));
      pattern += !!~o && !~ext ? "(?:/([^/]+?))?" : "/([^/]+?)";
      if (!!~ext) pattern += (!!~o ? "?" : "") + "\\" + tmp.substring(ext);
    } else {
      pattern += "/" + tmp;
    }
  }

  return {
    keys: keys,
    pattern: new RegExp("^" + pattern + (loose ? "(?=$|/)" : "/?$"), "i"),
  };
}
