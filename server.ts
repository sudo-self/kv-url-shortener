// server.ts

const kv = await Deno.openKv();

Deno.serve(async (request: Request) => {
  if (request.method == "POST") {
    // Handle POST request to create short links
    const body = await request.text();
    const { slug, url } = JSON.parse(body);
    const result = await kv.set(["links", slug], url);
    return new Response(JSON.stringify(result));
  } else {
    // Handle GET request to redirect short links
    const slug = request.url.split("/").pop() || "";
    const url = (await kv.get(["links", slug]))?.value as string;
    if (url) {
      return Response.redirect(url, 301);
    } else {
      const message = !slug ? "Please provide a slug." : `Slug "${slug}" not found`;
      return new Response(message, { status: 404 });
    }
  }
});





