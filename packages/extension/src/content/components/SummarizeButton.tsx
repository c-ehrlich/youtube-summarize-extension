/** @jsxImportSource solid-js */
import { createSignal } from "solid-js";
import { cn } from "../utils/cn";
import styles from "./SummarizeButton.module.css";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "../../ui-solid/primitives/dialog";
import { Content } from "./Content";

type VideoInfo = {
  videoId: string;
  title: string;
  channel: string;
  type:
    | "regular"
    | "end-card"
    | "metadata"
    | "player"
    | "shorts"
    | "live"
    | "premiere";
};

type ButtonPortalInfo = VideoInfo & {
  thumbnailElement: Element;
};

export const SummarizeButton = (props: ButtonPortalInfo) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const containerClasses = cn(styles.container, {
    [styles.absolute]: props.type !== "metadata",
    [styles.bottomLeft]: props.type !== "end-card" && props.type !== "metadata",
    [styles.bottomLeftZero]: props.type === "end-card",
    [styles.inlineBlock]: props.type === "metadata",
  });

  return (
    <div class={containerClasses}>
      <Dialog
        open={isOpen()}
        onOpenChange={(open) => {
          console.log("Dialog onOpenChange called with:", open);
          setIsOpen(open);
        }}
      >
        <DialogTrigger
          class={cn(
            "summarize-btn",
            styles.button,
            props.type !== "metadata" && styles.absolute
          )}
          style={
            props.type === "metadata"
              ? {}
              : {
                  position: "absolute",
                  bottom: "8px",
                  left: "8px",
                }
          }
          onPointerDown={(e: any) => {
            e.stopPropagation();
          }}
          onMouseDown={(e: any) => {
            e.stopPropagation();
          }}
        >
          Summarize
        </DialogTrigger>
        <DialogContent
          overlayClass={styles.overlayClass}
          class={styles.dialogContent}
        >
          <Content
            videoId={props.videoId}
            title={props.title}
            channel={props.channel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export type { ButtonPortalInfo };
