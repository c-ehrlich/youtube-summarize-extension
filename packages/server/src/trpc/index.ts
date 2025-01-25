import { t } from "./init";
import { hello } from "./routes/greeting";
import { getSummary } from "./routes/summary";

export const appRouter = t.router({
  greeting: t.router({
    hello: hello,
  }),

  summary: t.router({
    getSummary: getSummary,
  }),
});

export type AppRouter = typeof appRouter;
