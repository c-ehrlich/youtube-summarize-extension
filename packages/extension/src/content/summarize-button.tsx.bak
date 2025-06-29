import { useQuery } from "@tanstack/react-query";
import { YoutubeTranscript } from "youtube-transcript";
import { cn } from "../ui/util/cn";
import ReactMarkdown from "react-markdown";
import he from "he";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "../ui/primitives/dialog";
import React from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Button } from "../ui/primitives/button";
import { BASE_URL } from "../lib/req";
import { errorToString } from "../ui/util/error-to-string";

export function SummarizeButton({
  videoId,
  title,
  channel,
  type,
}: {
  videoId: string;
  title: string;
  channel: string;
  type: "regular" | "end-card" | "metadata" | "player" | "shorts" | "live" | "premiere";
}) {
  const buttonStyles =
    type === "metadata"
      ? {} // No special positioning for metadata
      : {
          position: "absolute" as const,
          bottom: "8px",
          left: "8px",
        };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            "summarize-btn", // 🐉 needed for application logic (to check if there is already a button)
            "z-50 bg-red-500 text-white border-none py-1 px-3 text-lg cursor-pointer rounded-md",
            // Only add absolute positioning class for non-metadata types
            type !== "metadata" && "absolute"
          )}
          style={buttonStyles}
        >
          Summarize
        </button>
      </DialogTrigger>
      <DialogContent
        overlayClassName="z-[9998]"
        className="bg-gray-100 dark:bg-gray-900 z-[9999] dark:text-white !max-w-2xl"
      >
        <Content videoId={videoId} title={title} channel={channel} />
      </DialogContent>
    </Dialog>
  );
}

const Content = ({
  videoId,
  title,
  channel,
}: {
  videoId: string;
  title: string;
  channel: string;
}) => {
  console.log("tktk videoId", videoId);
  const videoInfoQuery = useQuery({
    enabled: !!videoId,
    staleTime: Infinity,
    queryKey: ["video-info", videoId, title],
    queryFn: async () => {
      if (!videoId) {
        throw new Error("No video ID found");
      }

      // Fetch transcript and description in parallel
      const [transcript, descriptionResponse] = await Promise.all([
        YoutubeTranscript.fetchTranscript(videoId),
        fetch(`https://www.youtube.com/watch?v=${videoId}`),
      ]);

      if (!transcript) {
        throw new Error("No transcript found");
      }

      const transcriptText = transcript
        .map((t) => he.decode(t.text))
        .join("\n");

      // Extract description from the response HTML
      const html = await descriptionResponse.text();
      const descriptionMatch =
        html.match(/"description":{"simpleText":"(.*?)"}/) ||
        html.match(/"shortDescription":"(.*?)"/);
      let description: string | undefined;

      try {
        description = descriptionMatch
          ? descriptionMatch[1]
              .replace(/\\u/g, "%u")
              .replace(/\\n/g, "\n")
              .replace(/\\"/g, '"')
          : undefined;
      } catch (e) {
        console.error("Error decoding description", { descriptionMatch, e });

        throw new Error("Error decoding description");
      }

      return {
        transcript: transcriptText,
        title,
        videoId,
        description,
        author: channel,
      };
    },
  });

  const summaryQuery = useQuery({
    enabled: !!videoInfoQuery.data,
    queryKey: ["summary", videoId, title],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/summary`, {
        method: "POST",
        body: JSON.stringify({
          videoId,
          title,
          author: channel,
          transcript: videoInfoQuery.data?.transcript,
          description: videoInfoQuery.data?.description,
        }),
      });
      return response.json();
    },
  });

  if (videoInfoQuery.isLoading) {
    return <Loading text="Loading video info..." />;
  }

  if (summaryQuery.isLoading) {
    return <Loading text="Loading summary..." />;
  }

  if (videoInfoQuery.isError) {
    return (
      <p>Error loading video info: {errorToString(videoInfoQuery.error)}</p>
    );
  }

  if (summaryQuery.isError) {
    return <p>Error loading summary: {errorToString(summaryQuery.error)}</p>;
  }

  return (
    <React.Fragment>
      <DialogHeader className="pr-4 text-3xl">Summary</DialogHeader>
      <div className="w-full flex flex-col gap-2">
        <div className="prose prose-base max-w-none !text-xl dark:prose-invert [&>p]:mb-4">
          <ReactMarkdown>{summaryQuery.data.summary}</ReactMarkdown>
        </div>
      </div>
      <DialogFooter className="flex gap-2">
        <Button variant="ghost" className="flex-1">
          <a href={`https://www.youtube.com/watch?v=${videoId}`}>Watch</a>
        </Button>
        <DialogClose asChild>
          <Button variant="default" className="flex-1">
            Not interested
          </Button>
        </DialogClose>
      </DialogFooter>
    </React.Fragment>
  );
};

function Loading({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2 items-center justify-center text-gray-900 dark:text-gray-100">
      <LoadingSpinner size={32} />
      <div className="h-2" />
      <p>{text}</p>
    </div>
  );
}
