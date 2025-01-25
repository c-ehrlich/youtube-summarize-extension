import { z } from "zod";
import { t } from "../init.js";

export const getSummary = t.procedure
  .input(
    z.object({
      videoId: z.string(),
      title: z.string(),
      author: z.string(),
      transcript: z.string(),
    })
  )
  .query((opts) => {
    console.log("tktk env from trpc procedure", opts.ctx.env);

    return {
      summary: "foo bar",
    };
  });
