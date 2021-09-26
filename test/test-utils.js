import { useState } from "react";

export const memoryLocation =
  (path = "/") =>
  () =>
    useState(path);

export const customHookWithReturn =
  (initialPath = "/") =>
  () => {
    const [path, updatePath] = useState(initialPath);
    const navigate = (path) => {
      updatePath(path);
      return "foo";
    };

    return [path, navigate];
  };
