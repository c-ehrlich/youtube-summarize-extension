import { createOpenAI } from "@ai-sdk/openai";

export const openai = (apiKey: string) =>
  createOpenAI({
    apiKey: apiKey,
  });
