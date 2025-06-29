import { useQuery } from "@tanstack/solid-query";
import { YoutubeTranscript } from "youtube-transcript";
import he from "he";
import { BASE_URL } from "../lib/req";

export interface VideoInfo {
  transcript: string;
  title: string;
  videoId: string;
  description?: string;
  author: string;
}

export interface SummaryData {
  summary: string;
}

export interface SummarizeDataProps {
  videoId: string;
  title: string;
  channel: string;
}

export function useSummarizeData(props: SummarizeDataProps) {
  const videoInfoQuery = useQuery(() => ({
    enabled: !!props.videoId,
    staleTime: Infinity,
    queryKey: ["video-info", props.videoId, props.title],
    queryFn: async (): Promise<VideoInfo> => {
      if (!props.videoId) {
        throw new Error("No video ID found");
      }

      // Fetch transcript and description in parallel
      const [transcript, descriptionResponse] = await Promise.all([
        YoutubeTranscript.fetchTranscript(props.videoId),
        fetch(`https://www.youtube.com/watch?v=${props.videoId}`),
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
        title: props.title,
        videoId: props.videoId,
        description,
        author: props.channel,
      };
    },
  }));

  const summaryQuery = useQuery(() => ({
    enabled: !!videoInfoQuery.data,
    queryKey: ["summary", props.videoId, props.title],
    queryFn: async (): Promise<SummaryData> => {
      const response = await fetch(`${BASE_URL}/summary`, {
        method: "POST",
        body: JSON.stringify({
          videoId: props.videoId,
          title: props.title,
          author: props.channel,
          transcript: videoInfoQuery.data?.transcript,
          description: videoInfoQuery.data?.description,
        }),
      });
      return response.json();
    },
  }));

  return {
    videoInfoQuery,
    summaryQuery,
  };
}

export function createSummarizeData(props: SummarizeDataProps) {
  return useSummarizeData(props);
}
