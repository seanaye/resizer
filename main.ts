import { instantiate } from "./lib/rs_lib.generated.js";
import { serve } from "https://deno.land/std/http/server.ts";

const key = Deno.env.get("SPACES_KEY");
const secret = Deno.env.get("SPACES_SECRET");

if (!key || !secret) throw new Error("No key or secret provided");

const mod = await instantiate();
const app = mod.App.new(
  "https://nyc3.digitaloceanspaces.com",
  "kavir.nyc3.cdn.digitaloceanspaces.com",
  "kavir",
  "nyc3",
  key,
  secret
);

const kv = await Deno.openKv();
serve(
  async (req) => {
    const { pathname } = new URL(req.url);
    console.log(pathname);
    if (!pathname.includes(".jpg") && !pathname.includes(".png"))
      return new Response(null, { status: 404 });

    const key = ["image", req.url];

    const cached = await kv.get<Uint8Array>(key);
    if (cached.value) {
      console.log('cache hit')
      return new Response(cached.value, {
        headers: {
          "Content-Type": "image/jpeg",
        },
      });
    }

    const { searchParams } = new URL(req.url);
    const width = Number(searchParams.get("w") || undefined);
    const height = Number(searchParams.get("h") || undefined);

    const result = await app.handler(
      pathname.replace("/", ""),
      isNaN(width) ? 500 : width,
      isNaN(height) ? 500 : height
    );

    await kv.set(key, result);

    return new Response(result, {
      headers: {
        "Content-Type": "image/jpeg",
      },
    });
  },
  { port: 8000 }
);
