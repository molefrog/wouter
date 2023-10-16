/**
 * Executes a callback and returns a promise that resolve when `hashchange` event is fired.
 * Rejects after `throwAfter` milliseconds.
 */
export const waitForHashChangeEvent = async (
  cb: () => void,
  throwAfter = 1000
) =>
  new Promise<void>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout>;

    const onChange = () => {
      resolve();
      clearTimeout(timeout);
      window.removeEventListener("hashchange", onChange);
    };

    window.addEventListener("hashchange", onChange);
    cb();

    timeout = setTimeout(() => {
      reject(new Error("Timed out: `hashchange` event did not fire!"));
      window.removeEventListener("hashchange", onChange);
    }, throwAfter);
  });
