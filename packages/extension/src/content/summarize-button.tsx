import { useQuery, useQueryClient } from "@tanstack/react-query";
import { YoutubeTranscript } from "youtube-transcript";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/primitives/popover";
import { cn } from "../ui/util/cn";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import ReactMarkdown from "react-markdown";
import { PopoverClose } from "@radix-ui/react-popover";
// import { trpc } from "../lib/trpc";

export function SummarizeButton({
  videoId,
  title,
  channel,
  description,
}: {
  videoId: string;
  title: string;
  channel: string;
  description: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "summarize-btn", // 🐉 needed for application logic (to check if there is already a button)
            "absolute z-50 bg-red-500 text-white border-none py-1 px-3 text-lg cursor-pointer rounded-md"
          )}
          style={{
            bottom: "8px",
            left: "8px",
          }}
        >
          Summarize
        </button>
      </PopoverTrigger>
      <PopoverContent className="transition-all p-6 bg-gray-100 dark:bg-gray-900 shadow-lg text-gray-900 dark:text-gray-100 z-[9999] w-[500px]">
        <Content
          videoId={videoId}
          title={title}
          channel={channel}
          description={description}
        />
      </PopoverContent>
    </Popover>
  );
}

const Content = ({
  videoId,
  title,
  channel,
  description,
}: {
  videoId: string;
  title: string;
  channel: string;
  description: string;
}) => {
  // const c = trpc.hello.useQuery({ name: "from trpc" });
  // console.log("tktk content", videoId, c.data);
  const qc = useQueryClient();
  const q = useQuery({
    enabled: !!videoId,
    staleTime: Infinity,
    queryKey: ["video-summary", videoId, title],
    queryFn: async () => {
      if (!videoId) {
        throw new Error("No video ID found");
      }

      const { openaiApiKey } = await chrome.storage.local.get(["openaiApiKey"]);
      const OPENAI_API_KEY = openaiApiKey;
      console.log("tktk OPENAI_API_KEY", OPENAI_API_KEY);

      if (!OPENAI_API_KEY) {
        return "No OpenAI API key found. Please set an API key in the extension settings.";
      }

      // Fetch transcript and description in parallel
      const [transcript, descriptionResponse] = await Promise.all([
        YoutubeTranscript.fetchTranscript(videoId),
        fetch(`https://www.youtube.com/watch?v=${videoId}`),
      ]);

      const transcriptText = transcript.map((t) => t.text).join("\n");

      // Extract description from the response HTML
      const html = await descriptionResponse.text();
      const descriptionMatch =
        html.match(/"description":{"simpleText":"(.*?)"}/) ||
        html.match(/"shortDescription":"(.*?)"/);
      const fullDescription = descriptionMatch
        ? decodeURIComponent(
            descriptionMatch[1]
              .replace(/\\u/g, "%u")
              .replace(/\\n/g, "\n")
              .replace(/\\"/g, '"')
          )
        : description || "No description available";

      const openai = createOpenAI({
        apiKey: OPENAI_API_KEY,
      });

      const summary = await generateText({
        model: openai("gpt-4o-mini-2024-07-18"),
        prompt: generatePrompt({
          transcriptText,
          title,
          channel,
          description: fullDescription,
        }),
      });

      console.log("tktk summary", summary);

      return summary.text;
    },
  });

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full flex justify-end">
        <PopoverClose>X</PopoverClose>
      </div>
      {/* {c.data ? <p>{c.data}</p> : <pre>{JSON.stringify(c, null, 2)}</pre>} */}
      {q.data && !q.isFetching ? (
        <div className="w-full flex flex-col gap-2">
          <div className="prose prose-base max-w-none !text-xl dark:prose-invert [&>p]:mb-4">
            <ReactMarkdown>{q.data}</ReactMarkdown>
          </div>
          <button
            onClick={() =>
              qc.invalidateQueries({ queryKey: ["video-summary", videoId] })
            }
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Regenerate summary
          </button>
        </div>
      ) : (
        <p>loading...</p>
      )}
    </div>
  );
};

function generatePrompt({
  transcriptText,
  title,
  channel,
  description,
}: {
  transcriptText: string;
  title: string;
  channel: string;
  description: string;
}): string {
  console.log("tktk generating prompt", {
    title,
    channel,
    description,
    transcriptText,
  });

  return `You are a helpful assistant that summarizes YouTube videos.
If the title is a question or some other kind of clickbait, start by answering it with 1 sentence.
Keep it short and concise - in most cases you should not need more than 5 bullet points.
But you can make exceptions - for example if the video is a top10, tell me what the top10 things are and why.Return the summary in a markdown format (but no need to use a code block).

Please use the following information to help you give a good summary:

Channel name:
${channel}

Video title: 
${title}

Video description:
${description}

The transcript is as follows:

${transcriptText}
`;
}
