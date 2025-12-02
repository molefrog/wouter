import { renderToReadableStream } from "react-dom/server";
import { Router } from "wouter";
import { App } from "./App.tsx";

// Build the HTML and all its assets before starting the server
const build = await Bun.build({
  entrypoints: ["./index.html"],
  // No outdir = files are kept in memory, not written to disk
  minify: false,
  publicPath: "/",
});

if (!build.success) {
  console.error("Build failed:", build.logs);
  process.exit(1);
}

// Create a map of assets by their path for quick lookup
const assets = new Map<string, (typeof build.outputs)[number]>();
let htmlTemplate: string | null = null;

for (const output of build.outputs) {
  // The HTML file will be used as template for SSR
  if (output.path.endsWith(".html")) {
    htmlTemplate = await output.text();
  } else {
    // Store other assets (JS, CSS, etc.) by their basename
    const basename = "/" + output.path.split("/").pop()!;
    assets.set(basename, output);
  }
}

if (!htmlTemplate) {
  console.error("No HTML template found in build outputs");
  process.exit(1);
}

Bun.serve({
  port: 3002,
  async fetch(req) {
    const url = new URL(req.url);

    // Check if this is a request for a built asset
    const asset = assets.get(url.pathname);
    if (asset) {
      return new Response(asset);
    }

    // Check if this is a request for a static file from public/
    const publicFile = Bun.file(`./public${url.pathname}`);
    if (await publicFile.exists()) {
      return new Response(publicFile);
    }

    // Otherwise, it's a page request - render with SSR
    // ssrPath accepts full path with search, e.g. "/foo?bar=1"
    const stream = await renderToReadableStream(
      <Router ssrPath={url.pathname + url.search}>
        <App />
      </Router>
    );

    // Convert stream to string
    const appHtml = await new Response(stream).text();

    // Use HTMLRewriter to inject the SSR content into body
    const rewriter = new HTMLRewriter().on("body", {
      element(element) {
        element.setInnerContent(appHtml, { html: true });
      },
    });

    const transformedResponse = rewriter.transform(new Response(htmlTemplate));

    return new Response(transformedResponse.body, {
      headers: { "Content-Type": "text/html" },
    });
  },
});

console.log("Server running at http://localhost:3002");
