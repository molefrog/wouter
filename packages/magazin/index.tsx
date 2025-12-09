import { renderToReadableStream } from "react-dom/server";
import { Router } from "wouter";
import {
  HelmetProvider,
  type HelmetDataContext,
} from "@dr.pogodin/react-helmet";
import { App } from "./App.tsx";
import tailwind from "bun-plugin-tailwind";

// Build the HTML and all its assets before starting the server
const build = await Bun.build({
  entrypoints: ["./index.html"],
  // No outdir = files are kept in memory, not written to disk
  minify: false,
  publicPath: "/",
  plugins: [tailwind],
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

const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;

Bun.serve({
  port,
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
    // ssrContext is used to handle redirects and status codes on the server
    const ssrContext: { redirectTo?: string; statusCode?: number } = {};
    const helmetContext: HelmetDataContext = {};

    const stream = await renderToReadableStream(
      <HelmetProvider context={helmetContext}>
        <Router ssrPath={url.pathname + url.search} ssrContext={ssrContext}>
          <App />
        </Router>
      </HelmetProvider>
    );

    // Check if a redirect occurred during SSR
    if (ssrContext.redirectTo) {
      return Response.redirect(
        new URL(ssrContext.redirectTo, url.origin).toString(),
        302
      );
    }

    // Get status code from context, default to 200
    const statusCode = ssrContext.statusCode || 200;

    // Convert stream to string
    const appHtml = await new Response(stream).text();

    const helmet = helmetContext.helmet;

    // Use HTMLRewriter to inject the SSR content into body and title
    const rewriter = new HTMLRewriter()
      .on("body", {
        element(element) {
          element.setInnerContent(appHtml, { html: true });
        },
      })
      .on("title", {
        element(element) {
          if (!helmet) return;
          // Remove the existing title tag and let helmet's title be appended to head
          element.remove();
        },
      })
      .on("head", {
        element(element) {
          if (!helmet) return;

          const headContent = [
            helmet.title?.toString(),
            helmet.priority?.toString(),
            helmet.meta?.toString(),
            helmet.link?.toString(),
            helmet.script?.toString(),
          ]
            .filter(Boolean)
            .join("\n");

          if (headContent) {
            element.append(headContent, { html: true });
          }
        },
      });

    const transformedResponse = rewriter.transform(new Response(htmlTemplate));

    return new Response(transformedResponse.body, {
      status: statusCode,
      headers: { "Content-Type": "text/html" },
    });
  },
});

console.log(`Server running at http://localhost:${port}`);
