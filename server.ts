// server.ts

import { serveStatic } from "https://deno.land/x/serve_static@2.1.1/mod.ts";

const kv = await Deno.openKv();

// Serve static files (e.g., index.html) from the "public" directory
const staticServer = serveStatic("public");

Deno.serve(async (request: Request) => {
  const url = new URL(request.url);

  // Check if the request is for a static file
  if (url.pathname.startsWith("/public")) {
    return staticServer(request);
  }

  if (request.method == "POST") {
    // Handle POST request to create short links
    const body = await request.text();
    const { slug, url } = JSON.parse(body);
    const result = await kv.set(["links", slug], url);
    return new Response(JSON.stringify(result));
  } else {
    // Handle GET request to redirect short links
    const slug = url.pathname.split("/").pop() || "";
    const storedUrl = (await kv.get(["links", slug]))?.value as string;
    if (storedUrl) {
      return Response.redirect(storedUrl, 301);
    } else {
      const message = !slug ? "Please provide a slug." : `Slug "${slug}" not found`;
      return new Response(message, { status: 404 });
    }
  }
});

