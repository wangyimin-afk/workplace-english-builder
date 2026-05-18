const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function extractJsonObjects(buffer) {
  const objects = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < buffer.length; i += 1) {
    const char = buffer[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }
    if (char === "\"") {
      inString = true;
    } else if (char === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        objects.push(buffer.slice(start, i + 1));
        buffer = buffer.slice(i + 1);
        i = -1;
        start = -1;
      }
    }
  }

  return {objects, rest: buffer};
}

async function readDoubaoAudio(response) {
  if (!response.body) {
    const body = await response.json();
    return body.data || "";
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const audioParts = [];
  let buffer = "";

  while (true) {
    const {value, done} = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, {stream: true});

    const parsed = extractJsonObjects(buffer);
    buffer = parsed.rest;
    for (const raw of parsed.objects) {
      const payload = JSON.parse(raw);
      if (payload.data) audioParts.push(payload.data);
      if (payload.code && payload.code !== 0 && payload.code !== 20000000) {
        throw new Error(payload.message || `Doubao error code ${payload.code}`);
      }
    }
  }

  return audioParts.join("");
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {headers: CORS_HEADERS});
    }
    if (request.method !== "POST") {
      return jsonResponse({error: "Use POST with JSON body: {\"text\":\"...\"}"}, 405);
    }

    const {text} = await request.json().catch(() => ({}));
    if (!text || typeof text !== "string") {
      return jsonResponse({error: "Missing text"}, 400);
    }

    const apiKey = env.DOUBAO_TTS_API_KEY;
    const appId = env.DOUBAO_TTS_APPID;
    const token = env.DOUBAO_TTS_TOKEN;
    const resourceId = env.DOUBAO_TTS_RESOURCE_ID || "seed-tts-1.0";
    const speaker = env.DOUBAO_TTS_SPEAKER || "BV504_streaming";

    if (!apiKey && (!appId || !token)) {
      return jsonResponse({error: "Set DOUBAO_TTS_API_KEY, or set both DOUBAO_TTS_APPID and DOUBAO_TTS_TOKEN in Worker variables."}, 500);
    }

    const headers = {
      "Content-Type": "application/json",
      "X-Api-Request-Id": crypto.randomUUID(),
      "X-Api-Resource-Id": resourceId
    };
    if (apiKey) {
      headers["X-Api-Key"] = apiKey;
    } else {
      headers["X-Api-App-Id"] = appId;
      headers["X-Api-Access-Key"] = token;
    }

    const payload = {
      user: {uid: "workplace-english-builder"},
      req_params: {
        text: text.slice(0, 500),
        speaker,
        audio_params: {
          format: "mp3",
          sample_rate: 24000
        }
      }
    };

    const response = await fetch("https://openspeech.bytedance.com/api/v3/tts/unidirectional", {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const detail = await response.text();
      return jsonResponse({error: `Doubao request failed: ${response.status}`, detail}, 502);
    }

    const audioBase64 = await readDoubaoAudio(response);
    if (!audioBase64) {
      return jsonResponse({error: "Doubao returned no audio data"}, 502);
    }

    return jsonResponse({audioBase64, mimeType: "audio/mpeg"});
  }
};
