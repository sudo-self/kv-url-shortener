# [kv-url-Shortener](https://kv-url-shortener.deno.dev/)
![Screenshot 2024-03-10 at 10 01 41 PM](https://github.com/sudo-self/kv-deno-url/assets/119916323/5dcec805-b03e-4c53-8015-4724b702cd0e)

Request
,,,
curl --header "Content-Type: application/json" \   
--request POST \
--data '{"url":"https://kv-url-shortner.deno.dev","slug":"url"}' \     
https://kv-url-shortener.deno.dev
,,,


Responce
,,,
{"ok":true,"versionstamp":"0100000000501bd00000"}% 
,,,

Veryify
,,,
curl -v https://kv-url-shortener.deno.dev/url
,,,
