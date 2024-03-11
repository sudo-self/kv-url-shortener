# [kv-url-Shortener](https://kv-url-shortener.deno.dev/)

server.ts
```

// server.ts

// deno run -A --unstable server.ts

// localhost:8000

const kv = await Deno.openKv();

Deno.serve(async (request: Request) => {
  // Create short links
  if (request.method == "POST") {
    const body = await request.text();
    const { slug, url } = JSON.parse(body);
    const result = await kv.set(["links", slug], url);
    return new Response(JSON.stringify(result));
  }

  // Redirect short links
  const slug = request.url.split("/").pop() || "";
  const url = (await kv.get(["links", slug])).value as string;
  if (url) {
    return Response.redirect(url, 301);
  } else {
    const m = !slug ? "Please provide a slug." : `Slug "${slug}" not found`;
    return new Response(m, { status: 404 });
  }
});
```

Request
```
curl --header "Content-Type: application/json" \   
--request POST \
--data '{"url":"THE_URL_TO-SHORTEN","slug":"NEW_SHORT_NAME"}' \     
https://kv-url-shortener.deno.dev
```

Responce
```
{"ok":true,"versionstamp":"0100000000501bd00000"}% 
```

Verify
```
curl -v https://kv-url-shortener.deno.dev/url
```

the server<br>
https://kv-url-shortener.deno.dev 
```
Please Provide a Slug
```





