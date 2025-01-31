import { t } from "./init";
import { hello } from "./routes/greeting";

export const appRouter = t.router({
  greeting: t.router({
    hello: hello,
  }),
});

export type AppRouter = typeof appRouter;
