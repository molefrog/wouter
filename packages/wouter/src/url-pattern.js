/* global URLPattern */

// Opt-in URLPattern adapter. Load a polyfill before using it where needed.
export const urlPatternParser = (route, loose) => {
  const pattern = new URLPattern({ pathname: route });

  return {
    pattern: {
      exec(path) {
        let end = path.length;
        do {
          const prefix = path.slice(0, end);
          const result = pattern.exec({ pathname: prefix });
          if (result) {
            const groups = result.pathname.groups;
            return Object.assign(
              [
                // Keep the original prefix; URLPattern canonicalizes its input.
                loose && path[end] !== "/" ? prefix.replace(/\/$/, "") : prefix,
              ],
              { index: 0, input: path, groups }
            );
          }

          if (!loose || !end) break;
          // Try segment boundaries, including trailing slashes, longest first.
          end =
            path[end - 1] === "/"
              ? end - 1
              : path.lastIndexOf("/", end - 1) + 1;
        } while (end > 0 || path[0] === "/");
        return null;
      },
    },
  };
};
