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

  return (
    <Show
      when={
        !videoInfoQuery.isLoading &&
        !summaryQuery.isLoading &&
        !videoInfoQuery.isError &&
        !summaryQuery.isError
      }
      fallback={
        <Show
          when={videoInfoQuery.isLoading}
          fallback={
            <Show
              when={summaryQuery.isLoading}
              fallback={
                <Show
                  when={videoInfoQuery.isError}
                  fallback={
                    <p>
                      Error loading summary: {errorToString(summaryQuery.error)}
                    </p>
                  }
                >
                  <p>
                    Error loading video info:{" "}
                    {errorToString(videoInfoQuery.error)}
                  </p>
                </Show>
              }
            >
              <Loading text="Loading summary..." />
            </Show>
          }
        >
          <Loading text="Loading video info..." />
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
