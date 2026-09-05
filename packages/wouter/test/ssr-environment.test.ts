import { expect, test } from "bun:test";
import { join } from "path";

test("renders links, redirects, and locations without browser globals or SSR warnings", async () => {
  // A plain Bun process does not load the test suite's happy-dom preload.
  const child = Bun.spawn(
    [process.execPath, join(import.meta.dir, "fixtures/ssr.tsx")],
    { stdout: "pipe", stderr: "pipe" }
  );
  const [output, errors, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);

  expect(errors).toBe("");
  expect(exitCode).toBe(0);
  expect(JSON.parse(output)).toEqual({
    browserGlobals: ["undefined", "undefined", "undefined", "undefined"],
    browser: "<p>/ssr/react?from=path</p>",
    hash: "<p>/ssr/hash?from=hash</p>",
    link: '<a href="/about">About</a>',
    redirect: "",
    context: { redirectTo: "/about" },
  });
});
