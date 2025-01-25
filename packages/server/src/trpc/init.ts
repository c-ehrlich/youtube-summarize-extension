import { initTRPC } from "@trpc/server";
import { Context } from "hono";

export const createContext = ({
  c,
}: {
  c: Context<{ Bindings: CloudflareBindings }>;
}) => {
  return { env: c.env };
};

export const t = initTRPC.context<typeof createContext>().create();
