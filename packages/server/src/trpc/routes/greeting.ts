import { z } from "zod";
import { t } from "../init";

export const hello = t.procedure
  .input(z.object({ name: z.string() }))
  .query(({ input }) => {
    return `Hello ${input.name}`;
  });
