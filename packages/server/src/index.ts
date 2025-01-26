import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { appRouter } from "./trpc";
import { createContext } from "./trpc/init";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const foo: number = 2;

app.use("*", cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.all("/trpc/*", async (c) => {
  const response = await fetchRequestHandler({
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: () => createContext({ c }),
  });
  return response;
});

export default app;
