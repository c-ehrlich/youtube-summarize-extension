import { useQuery } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/primitives/popover";
import { cn } from "../ui/util/cn";

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

    const urlParams = new URLSearchParams(anchor.search);
    return urlParams.get("v");
  })();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoId) {
      chrome.runtime.sendMessage({ type: "SUMMARIZE_VIDEO", videoId });
    } else {
      alert("No video ID found.");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "summarize-btn",
            "absolute z-50 bg-red-500 text-white border-none py-1 px-3 text-lg cursor-pointer rounded-md"
          )}
          onClick={handleClick}
          style={{
            bottom: "8px",
            left: "8px",
          }}
        >
          Summarize
        </button>
      </PopoverTrigger>
      <PopoverContent className="transition-all p-4 bg-green-500 z-[9999]">
        <Content videoId={videoId} />
      </PopoverContent>
    </Popover>
  );
}

const Content = ({ videoId }: { videoId: string | null }) => {
  console.log("tktk foo", videoId);
  const q = useQuery({
    queryKey: ["foo", videoId],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return "bar";
    },
  });
  return (
    <div>
      {q.data ? (
        <div>
          {q.data} {videoId}
        </div>
      ) : (
        <p>loading</p>
      )}
    </div>
  );
};
