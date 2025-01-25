import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { appRouter } from "@yt-summarize/trpc";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use("*", cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
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

export default app;
