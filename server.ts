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
for await (const req of server) {
  try {
    // Check if the request is for a static file
    if (req.url.startsWith("/public")) {
      await staticServer(req);
    } else {
      // Handle URL shortening requests
      if (req.method === "POST") {
        const body = await req.text();
        const { slug, url } = JSON.parse(body);
        const result = await kv.set(["links", slug], url);
        req.respond({ body: JSON.stringify(result) });
      } else {
        // Redirect short links
        const slug = req.url.substr(1); // Remove leading slash
        const storedUrl = (await kv.get(["links", slug]))?.value as string;
        if (storedUrl) {
          req.respond({ status: 301, headers: new Headers({ "Location": storedUrl }) });
        } else {
          req.respond({ status: 404, body: `Slug "${slug}" not found` });
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
    req.respond({ status: 500, body: "Internal Server Error" });
  }
}





