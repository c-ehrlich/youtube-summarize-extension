/** @jsxImportSource solid-js */
import { Show } from "solid-js";
import {
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "../../ui-solid/primitives/dialog";
import { Button } from "../../ui-solid/primitives/button";
import { useSummarizeData } from "../solid-data-hooks";
import { errorToString } from "../../ui-solid/util/error-to-string";
import { SolidMarkdown } from "solid-markdown";
import { Loading } from "./Loading";
import styles from "./Content.module.css";

export const Content = (props: {
  videoId: string;
  title: string;
  channel: string;
}) => {
  const { videoInfoQuery, summaryQuery } = useSummarizeData({
    videoId: props.videoId,
    title: props.title,
    channel: props.channel,
  });

  const isLoading = () => videoInfoQuery.isLoading || summaryQuery.isLoading;
  const hasError = () => videoInfoQuery.isError || summaryQuery.isError;
  
  const loadingText = () => {
    if (videoInfoQuery.isLoading) return "Loading video info...";
    if (summaryQuery.isLoading) return "Loading summary...";
    return "";
  };

  const errorMessage = () => {
    if (videoInfoQuery.isError) {
      return `Error loading video info: ${errorToString(videoInfoQuery.error)}`;
    }
    if (summaryQuery.isError) {
      return `Error loading summary: ${errorToString(summaryQuery.error)}`;
    }
    return "";
  };

  return (
    <Show
      when={!isLoading() && !hasError()}
      fallback={
        <Show
          when={isLoading()}
          fallback={<p>{errorMessage()}</p>}
        >
          <Loading text={loadingText()} />
        </Show>
      }
    >
      <DialogHeader class={styles.header}>Summary</DialogHeader>
      <div class={styles.container}>
        <div class={styles.prose}>
          <SolidMarkdown children={summaryQuery.data?.summary || ""} />
        </div>
      </div>
      <DialogFooter class={styles.footer}>
        <Button variant="ghost" class={styles.flexOne}>
          <a href={`https://www.youtube.com/watch?v=${props.videoId}`}>Watch</a>
        </Button>
        <DialogClose as={Button} variant="default" class={styles.flexOne}>
          Not interested
        </DialogClose>
      </DialogFooter>
    </Show>
  );
};
