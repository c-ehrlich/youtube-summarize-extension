import { z } from "zod";
import { baseProcedure, t } from "../init.js";
import { generateText } from "ai";

function generatePrompt({
  transcript,
  title,
  channel,
  description,
}: {
  transcript: string;
  title?: string;
  channel?: string;
  description?: string;
}): string {
  console.log("tktk generating prompt", {
    title,
    channel,
    description,
    transcript,
  });

  return `You are a helpful assistant that summarizes YouTube videos.
If the title is a question or some other kind of clickbait, start by answering it with 1 sentence.
Keep it short and concise - in most cases you should not need more than 5 bullet points.
But you can make exceptions - for example if the video is a top10, tell me what the top10 things are and why.Return the summary in a markdown format (but no need to use a code block).

Please use the following information to help you give a good summary:

${
  channel &&
  `Channel name:
${channel}`
}

${
  title &&
  `Video title:
${title}`
}

${
  description &&
  `Video description:
${description}`
}

Transcript:
${transcript}
`;
}

export const getSummary = baseProcedure
  .input(
    z.object({
      videoId: z.string(),
      title: z.string().optional(),
      author: z.string().optional(),
      transcript: z.string(),
      description: z.string().optional(),
    })
  )
  .query(async (opts) => {
    console.log("tktk env from trpc procedure", opts.ctx.env);

    // TODO: check cache

    const summary = await generateText({
      model: opts.ctx.openai("gpt-4o-mini-2024-07-18"),
      prompt: generatePrompt({
        transcript: opts.input.transcript,
        title: opts.input.title,
      }),
    });

    opts.ctx.axiom.ingest({
      type: "summary",
      env: opts.ctx.env.ENVIRONMENT,
      // TODO: user id
      inputs: {
        videoId: opts.input.videoId,
        title: opts.input.title,
        author: opts.input.author,
      },
      summary: summary.text,
      usage: {
        prompt: summary.usage.promptTokens,
        completion: summary.usage.completionTokens,
        total: summary.usage.totalTokens,
      },
    });

    return {
      summary: summary.text,
    };
  });
