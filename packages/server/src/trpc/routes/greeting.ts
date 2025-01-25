import { z } from "zod";
import { baseProcedure, t } from "../init";

export const hello = baseProcedure
  .input(z.object({ name: z.string() }))
  .query(({ input }) => {
    return `Hello ${input.name}`;
  });
