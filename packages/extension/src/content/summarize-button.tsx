import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/primitives/popover";

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
          className="summarize-btn bg-red-500 text-white border-none py-1 px-2 text-sm cursor-pointer rounded"
          onClick={handleClick}
          style={{
            position: "absolute",
            bottom: "8px",
            left: "8px",
            zIndex: 9999,
          }}
        >
          Summarize
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <Content />
      </PopoverContent>
    </Popover>
  );
}

const Content = () => {
  console.log("tktk foo");
  return <div className="p-4 bg-green-500">foo</div>;
};
