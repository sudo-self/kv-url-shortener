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
console.log(`Server running on port ${port}`);
for await (const request of serve({ port: parseInt(port) })) {
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
        request.respond({ body: JSON.stringify(result) });
      } else {
        // Redirect short links
        const slug = request.url.substr(1); // Remove leading slash
        const storedUrl = (await kv.get(["links", slug]))?.value as string;
        if (storedUrl) {
          request.respond({ status: 301, headers: new Headers({ "Location": storedUrl }) });
        } else {
          request.respond({ status: 404, body: `Slug "${slug}" not found` });
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
    request.respond({ status: 500, body: "Internal Server Error" });
  }
}



