// Import required modules from deno_std
import { serve } from "https://deno.land/std/http/server.ts";
import { serveFile } from "https://deno.land/std/http/file_server.ts";

// Create a KV storage for storing short URLs
const kv = await Deno.openKv();

// Serve static files (e.g., index.html) from the "public" directory
const staticServer = async (req: any) => {
  const path = req.url.replace(/^\/public\//, '');
  await serveFile(req, path);
};

// Create a server instance
const port = Deno.env.get("PORT") ?? "8000"; // Default to port 8000 if $PORT is not set
const server = serve({ port: parseInt(port) });
console.log(`Server running on port ${port}`);

// Handle incoming requests
for await (const requestEvent of server) {
  const request = requestEvent.request;
  try {
    // Check if the request is for a static file
    if (request.url.startsWith("/public")) {
      await staticServer(request);
    } else {
      // Handle URL shortening requests
      if (request.method === "POST") {
        const body = await request.text();
        const { slug, url } = JSON.parse(body);
        const result = await kv.set(["links", slug], url);
        requestEvent.respondWith(new Response(JSON.stringify(result)));
      } else {
        // Redirect short links
        const slug = request.url.substr(1); // Remove leading slash
        const storedUrl = (await kv.get(["links", slug]))?.value as string;
        if (storedUrl) {
          requestEvent.respondWith(Response.redirect(storedUrl, 301));
        } else {
          requestEvent.respondWith(new Response(`Slug "${slug}" not found`, { status: 404 }));
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
    requestEvent.respondWith(new Response("Internal Server Error", { status: 500 }));
  }
}




