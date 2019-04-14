import pathToRegexp from "path-to-regexp";

// creates a matcher function
export default function makeMatcher() {
  let cache = {};

  // obtains a cached regexp version of the pattern
  const convertToRgx = pattern => {
    if (cache[pattern]) return cache[pattern];
    let keys = [];
    return (cache[pattern] = [pathToRegexp(pattern, keys), keys]);
  };

  return (pattern, path) => {
    const [regexp, keys] = convertToRgx(pattern);
    const out = regexp.exec(path);

    if (!out) return [false, null];

    // formats an object with matched params
    const params = keys.reduce((params, key, i) => {
      params[key.name] = out[i + 1];
      return params;
    }, {});

    return [true, params];
  };
}
