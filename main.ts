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

serve(
  async (req) => {
    const { pathname } = new URL(req.url);
    console.log(pathname);
    if (pathname === "/list") {
      return new Response(JSON.stringify(await app.list()), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    if (!pathname.includes(".jpg") && !pathname.includes(".png"))
      return new Response(null, { status: 404 });

    const { searchParams } = new URL(req.url);
    const width = Number(searchParams.get("w") || undefined);
    const height = Number(searchParams.get("h") || undefined);

    let result: Uint8Array;
    try {
      result = await app.handler(
        pathname.replace("/", ""),
        isNaN(width) ? 0 : width,
        isNaN(height) ? 0 : height
      );
    } catch (e: unknown) {
      return e as unknown as Response;
    }

    return new Response(result, {
      headers: {
        "Content-Type": "image/jpeg",
      },
    });
  },
  { port: 8001 }
);
