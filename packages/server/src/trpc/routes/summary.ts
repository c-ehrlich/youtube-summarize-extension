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

const TEST_MODE = false;

const TEST_SUMMARY = `What the hell happened to COD Warzone? The game has seen a significant decline in player engagement due to various gameplay and design issues.

- **Complex Gameplay**: The introduction of an overly complicated movement system and inconsistent gameplay mechanics has alienated both new and returning players.
- **Weapon and Gear Overload**: With over 160 weapons and excessive gear options, players feel overwhelmed and find it hard to balance the game.
- **Loss of Battle Royale Essence**: Warzone has shifted from a traditional battle royale experience to a fast-paced team deathmatch format, diminishing the thrill of survival.
- **Audio Issues**: Poor audio design hampers player awareness, making it difficult to hear footsteps and other critical sounds, leading to frustrating gameplay experiences.
- **Cheating and Trust Issues**: The rampant cheating problem has eroded player trust, with many feeling that the developers prioritize monetization over fixing core gameplay issues.

Overall, the video expresses a desire for Warzone to return to its roots and suggests that separating it from the annual Call of Duty releases could help restore its original appeal.`;

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
    // TODO: check cache

    if (TEST_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { summary: TEST_SUMMARY };
    }

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
