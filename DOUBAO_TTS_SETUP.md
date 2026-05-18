# Doubao TTS Setup

The app can use Doubao TTS through a private proxy. Do not put AppID, Token, API Key, or any secret directly into `index.html`, because GitHub Pages is public.

## Recommended Free Proxy

Use Cloudflare Workers free tier:

1. Create a Worker in Cloudflare.
2. Paste the code from `doubao-tts-worker.js`.
3. Add Worker variables:
   - New console: `DOUBAO_TTS_API_KEY`
   - Old console: `DOUBAO_TTS_APPID` and `DOUBAO_TTS_TOKEN`
   - Optional: `DOUBAO_TTS_RESOURCE_ID`, default is `seed-tts-1.0`
   - Optional: `DOUBAO_TTS_SPEAKER`, default is `BV504_streaming`
4. Deploy the Worker and copy its URL.
5. Open the English app, choose `Doubao TTS`, and paste the Worker URL into `Doubao proxy`.

## Notes

- The browser calls only your Worker URL.
- The Worker calls Volcengine with your private credentials.
- If Doubao fails, the app automatically falls back to the browser voice.
