import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = document.createElement("div");
root.id = "crx-root";
document.body.appendChild(root);

// Create new components for the summary functionality
const SummaryOverlay = ({
  summary,
  onClose,
}: {
  summary: string;
  onClose: () => void;
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        background: "white",
        border: "2px solid #000",
        padding: "16px",
        width: "400px",
        maxHeight: "70vh",
        overflowY: "auto",
      }}
    >
      <div>{summary}</div>
      <br />
      <button onClick={onClose}>Close</button>
    </div>
  );
};

const SummarizeButton = ({
  thumbnailElement,
}: {
  thumbnailElement: HTMLElement;
}) => {
  const getVideoId = () => {
    const anchor = thumbnailElement.querySelector("a#thumbnail");
    if (!anchor) return null;
    const urlParams = new URLSearchParams(anchor.search);
    return urlParams.get("v");
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const videoId = getVideoId();
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
};

const YouTubeSummarizer = () => {
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    const addButtonsToThumbnails = () => {
      const thumbnails = document.querySelectorAll("ytd-thumbnail");
      thumbnails.forEach((thumb) => {
        if (!thumb.querySelector(".summarize-btn")) {
          thumb.style.position = "relative";
          const buttonContainer = document.createElement("div");
          ReactDOM.createRoot(buttonContainer).render(
            <SummarizeButton thumbnailElement={thumb} />
          );
          thumb.appendChild(buttonContainer);
        }
      });
    };

    // Initial run and interval setup
    addButtonsToThumbnails();
    const interval = setInterval(addButtonsToThumbnails, 3000);

    // Message listener for summary results
    const messageListener = (request: any) => {
      if (request.type === "SUMMARY_RESULT") {
        setSummary(
          `Summary for Video ${request.videoId}:\n\n${request.summary}`
        );
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup
    return () => {
      clearInterval(interval);
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return summary ? (
    <SummaryOverlay summary={summary} onClose={() => setSummary(null)} />
  ) : null;
};

// Update the main render to include the YouTubeSummarizer
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    {/* <App /> */}
    <YouTubeSummarizer />
  </React.StrictMode>
);
