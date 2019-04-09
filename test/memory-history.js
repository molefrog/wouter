import NanoEvents from "nanoevents";
import { useEffect } from "react";

const memory = path => {
  const emitter = new NanoEvents();

  return {
    path: () => path,
    push: to => emitter.emit("change", (path = to)),
    subscribe: cb => emitter.on("change", cb)
  };
};

export default memory;
