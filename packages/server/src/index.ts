import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { OpenAIProvider } from "@ai-sdk/openai";
import { openai } from "./lib/ai/init";
import { AxiomProvider, createAxiom } from "./lib/axiom/axiom";
import { generateText } from "ai";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const foo: number = 4;

app.use("*", cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const ctxMiddleware = createMiddleware<{
  Bindings: CloudflareBindings;
  Variables: {
    echo: (str: string) => string;
    openai: OpenAIProvider;
    axiom: AxiomProvider;
  };
}>(async (c, next) => {
  c.set("echo", (str) => str);
  c.set("openai", openai(c.env.OPENAI_API_KEY));
  const axiom = createAxiom({
    token: c.env.AXIOM_TOKEN,
    datasetName: c.env.AXIOM_DATASET_NAME,
  });
  c.set("axiom", axiom);

  await next();

  axiom.flush();
});

const api = new Hono<{ Bindings: CloudflareBindings }>();

api.post("/summary", ctxMiddleware, async (c) => {
  // TODO: zod or j-stack
  const { videoId, title, author, transcript, description } =
    await c.req.json();

  const summary = await generateText({
    model: c.var.openai("gpt-4o-mini-2024-07-18"),
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: generateUserPrompt({
          transcript: transcript,
          title: title,
          channel: author,
          description: description,
        }),
      },
    ],
  });

  c.var.axiom.ingest({
    type: "summary",
    env: c.env.ENVIRONMENT,
    // TODO: user id
    inputs: {
      videoId: videoId,
      title: title,
      author: author,
    },
    summary: summary.text,
    usage: {
      prompt: summary.usage.promptTokens,
      completion: summary.usage.completionTokens,
      total: summary.usage.totalTokens,
    },
  });

  return c.json({ summary: summary.text });
});

app.route("/api", api);

export default app;

const systemPrompt = `
<identity>
You are a helpful assistant that summarizes and extracts insights from YouTube videos.
</identity>

<instructions>
Summarize the top takeaways from the video. The goal is that the user can read the summary and get all the main information.

Some examples on how to be useful:
- If the title is a question or some other kind of clickbait that is answered in the video, start by answering it with 1 sentence.
- Keep it short and concise - in most cases you should not need more than 5 bullet points.
- But you can make exceptions - for example if the video is a top10, tell me what the top10 things are and why. Return the summary in a markdown format (but no need to use a code block).
- Give specific insights.
  - Bad: "The host takes both shoes for a run, sharing insights on their performance and suitability for speed training."
  - Good: "The host takes both shoes for a run, and concludes that the Adidas shoe is faster but the Saucony shoe is a better fun fast shoe for most runners."
- If the video is a review, tell me the score, and what the pros and cons are, as well as comparisons to other products if the reviewer made them.
- Don't mention that the speaker is asking viewers to like, subscribe, etc.
- You don't need to start with something like "Summary of <video title>", this is self-evident.
</instructions>

Please use the following information to help you give a good summary:`;

function generateUserPrompt({
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

  return `
<context>
${
  channel &&
  `## Channel name:
${channel}`
}

${
  title &&
  `## Video title:
${title}`
}

${
  description &&
  `## Video description:
${description}`
}

## Transcript:
${transcript}
</context>
`;
}
