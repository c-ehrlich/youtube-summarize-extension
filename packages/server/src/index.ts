import { Hono } from "hono";
import { serve } from "@hono/node-server"; // or a different adapter
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@yt-summarize/trpc";

const app = new Hono();

// Basic route for testing
app.get("/", (c) => {
  return c.text("Hono + tRPC API is running");
});

// tRPC via Hono: we can mount it under /trpc
// Switch to fetch adapter
app.all("/trpc/*", async (c) => {
  const response = await fetchRequestHandler({
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: () => ({}),
  });
  return response;
});

serve({
  fetch: app.fetch,
  port: 3000,
});
