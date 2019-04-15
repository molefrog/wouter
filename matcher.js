// escapes a regexp string (borrowed from path-to-regexp sources)
// https://github.com/pillarjs/path-to-regexp/blob/v3.0.0/index.js#L202
const escapeRegexp = str => str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");

const genSegment = (segment, mod) => {
  switch (mod) {
    case "?":
      return "([^\\/]+?)?";
    case "+":
      return "((?:[^/]+?)(?:/(?:[^/]+?))*)";
    case "*":
      return "((?:[^/]+?)(?:/(?:[^/]+?))*)?";
    default:
      return "([^\\/]+?)";
  }
};

const pathToRegexp = (pattern, keys) => {
  const segmentRx = /:([A-Za-z0-9_]+)([\?\+\*]?)/g;

  let lastSegEnd = 0,
    match = null,
    result = "";

  while ((match = segmentRx.exec(pattern)) !== null) {
    const prev = pattern.substring(lastSegEnd, match.index);
    const [_, segment, modifier] = match;

    keys.push({ name: segment });

    lastSegEnd = segmentRx.lastIndex;
    result += escapeRegexp(prev) + genSegment(match[0], modifier);
  }

  result += escapeRegexp(pattern.substring(lastSegEnd));
  return new RegExp("^" + result + "(?:\\/)?$", "i");
};

// creates a matcher function
export default function makeMatcher(makeRegexpFn = pathToRegexp) {
  let cache = {};

  // obtains a cached regexp version of the pattern
  const convertToRgx = pattern => {
    if (cache[pattern]) return cache[pattern];
    let keys = [];
    return (cache[pattern] = [makeRegexpFn(pattern, keys), keys]);
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
