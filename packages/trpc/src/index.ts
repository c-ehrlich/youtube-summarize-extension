import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      const { name = "World" } = input;
      return `Hello, ${name}!`;
    }),
});

export type AppRouter = typeof appRouter;
