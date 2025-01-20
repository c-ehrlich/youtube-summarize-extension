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
    <button
      className="summarize-btn"
      onClick={handleClick}
      style={{
        position: "absolute",
        bottom: "8px",
        left: "8px",
        zIndex: 9999,
        backgroundColor: "#ff0000",
        color: "#fff",
        border: "none",
        padding: "4px 8px",
        cursor: "pointer",
        fontSize: "12px",
        borderRadius: "4px",
      }}
    >
      Summarize
    </button>
  );
  4;
}
