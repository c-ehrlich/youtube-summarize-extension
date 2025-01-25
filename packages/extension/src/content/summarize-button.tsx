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

export function SummarizeButton({
  thumbnailElement,
}: {
  thumbnailElement: HTMLElement;
}) {
  // TODO: `useEffect` somehow makes things go bad here
  const videoId = (() => {
    const anchor = thumbnailElement.querySelector(
      "a#thumbnail"
    ) as HTMLAnchorElement;

    if (!anchor.search) {
      return null;
    }

    console.log("tktk thumbnailElement", thumbnailElement);

    const urlParams = new URLSearchParams(anchor.search);
    return urlParams.get("v");
  })();

  // const handleClick = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (videoId) {
  //     chrome.runtime.sendMessage({ type: "SUMMARIZE_VIDEO", videoId });
  //   } else {
  //     alert("No video ID found.");
  //   }
  // };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "summarize-btn",
            "absolute z-50 bg-red-500 text-white border-none py-1 px-3 text-lg cursor-pointer rounded-md"
          )}
          // onClick={handleClick}
          style={{
            bottom: "8px",
            left: "8px",
          }}
        >
          Summarize
        </button>
      </PopoverTrigger>
      <PopoverContent className="transition-all p-6 bg-gray-100 dark:bg-gray-900 shadow-lg text-gray-900 dark:text-gray-100 z-[9999] w-[500px]">
        <Content videoId={videoId} />
      </PopoverContent>
    </Popover>
  );
}

const Content = ({ videoId }: { videoId: string | null }) => {
  console.log("tktk content", videoId);
  const qc = useQueryClient();
  const q = useQuery({
    enabled: !!videoId,
    staleTime: Infinity,
    queryKey: ["video-summary", videoId],
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

      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      const transcriptText = transcript.map((t) => t.text).join("\n");

      const openai = createOpenAI({
        apiKey: OPENAI_API_KEY,
      });

      const summary = await generateText({
        model: openai("gpt-4o-mini-2024-07-18"),
        prompt: generatePrompt(transcriptText),
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

function generatePrompt(transcriptText: string): string {
  return `You are a helpful assistant that summarizes YouTube videos.
Keep it short and concise - in most cases you should not need more than 5 bullet points.
But you can make exceptions - for example if the video is a top10, tell me what the top10 things are and why.Return the summary in a markdown format (but no need to use a code block).

The transcript is as follows:

${transcriptText}
`;
}
