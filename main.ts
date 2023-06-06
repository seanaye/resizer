import { instantiate } from "./lib/rs_lib.generated.js";
import { serve } from "https://deno.land/std/http/server.ts";

const key = Deno.env.get("SPACES_KEY");
const secret = Deno.env.get("SPACES_SECRET");

if (!key || !secret) throw new Error("No key or secret provided");

const mod = await instantiate();
const app = mod.App.new(
  "https://nyc3.digitaloceanspaces.com",
  "photostore.nyc3.cdn.digitaloceanspaces.com",
  "photostore",
  "nyc3",
  key,
  secret
);

serve(
  async (req) => {
    const { pathname } = new URL(req.url);
    console.log(pathname)
    if (!pathname.includes(".jpg") && !pathname.includes(".png"))
      return new Response(null, { status: 404 });
    const { searchParams } = new URL(req.url);
    const width = Number(searchParams.get("w") || undefined);
    const height = Number(searchParams.get("h") || undefined);

    return await app.handler(
      pathname.replace("/", ""),
      isNaN(width) ? 500 : width,
      isNaN(height) ? 500 : height
    );
  },
  { port: 8000 }
);
