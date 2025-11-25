import { renderToReadableStream } from "react-dom/server";
import { Router } from "wouter";
import { App } from "./App";
import indexHtml from "./index.html";

Bun.serve({
  port: 3002,
  async fetch(req) {
    const url = new URL(req.url);

    // Check if this is a request for bundled assets
    // In dev mode, Bun generates these on the fly
    const isAsset =
      url.pathname.includes("/_bun/") ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".tsx") ||
      url.pathname.endsWith(".ts");

    // If it's an asset, check HTMLBundle files or serve directly
    if (isAsset) {
      // If files array exists (production build), serve from there
      if (indexHtml.files) {
        const file = indexHtml.files.find(
          (f) => url.pathname === f.path || url.pathname.endsWith(f.path)
        );
        if (file) {
          return new Response(Bun.file(file.path), {
            headers: file.headers,
          });
        }
      }
      // In dev mode, return undefined to let Bun's bundler handle it
      return;
    }

    // Get the HTML template using the file path from HTMLBundle
    const html = await Bun.file(indexHtml.index).text();

    // Extract path and search from URL
    const ssrPath = url.pathname;
    const ssrSearch = url.search;

    // Render the app with Router and SSR props
    const stream = await renderToReadableStream(
      <Router ssrPath={ssrPath} ssrSearch={ssrSearch}>
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

    const transformedResponse = rewriter.transform(new Response(html));

    return new Response(transformedResponse.body, {
      headers: { "Content-Type": "text/html" },
    });
  },
});

console.log("Server running at http://localhost:3002");
