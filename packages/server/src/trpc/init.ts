import { initTRPC } from "@trpc/server";
import { Context } from "hono";
import { openai } from "../lib/ai/init";
import { createAxiom } from "../lib/axiom/axiom";

export const createContext = ({
  c,
}: {
  c: Context<{ Bindings: CloudflareBindings }>;
}) => {
  return {
    env: c.env,
    openai: openai(c.env.OPENAI_API_KEY),
    axiom: createAxiom({
      token: c.env.AXIOM_TOKEN,
      datasetName: c.env.AXIOM_DATASET_NAME,
    }),
  };
};

export const t = initTRPC.context<typeof createContext>().create();

const flushAxiomMiddleware = t.middleware(async (opts) => {
  const res = await opts.next({ ctx: opts.ctx });
  await opts.ctx.axiom.flush();
  return res;
});

export const baseProcedure = t.procedure.use(flushAxiomMiddleware);
