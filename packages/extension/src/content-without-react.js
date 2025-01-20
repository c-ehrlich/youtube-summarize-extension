// contentScript.js

// A simple function to parse the video ID from a thumbnail URL or from data attributes
function getVideoIdFromThumbnail(thumbnailElement) {
  // YouTube typically encodes the video ID in various ways:
  // 1. The URL in the anchor tag around the thumbnail: <a href="/watch?v=VIDEO_ID">
  // 2. A data attribute in the DOM, etc.
  // You can parse the ID from the watch URL or from other attributes.
  // This is one example approach:
  const anchor = thumbnailElement.querySelector("a#thumbnail");
  if (!anchor) return null;
  const urlParams = new URLSearchParams(anchor.search);
  return urlParams.get("v"); // returns VIDEO_ID
}

function injectSummarizeButton(thumbnailElement) {
  // Check if we already added a button
  if (thumbnailElement.querySelector(".summarize-btn")) {
    return;
  }

  const summarizeBtn = document.createElement("button");
  summarizeBtn.innerText = "Summarize";
  summarizeBtn.className = "summarize-btn";
  summarizeBtn.style.cssText = `
    position: absolute;
    bottom: 8px;
    left: 8px;
    z-index: 9999;
    background-color: #ff0000;
    color: #fff;
    border: none;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 12px;
    border-radius: 4px;
  `;

  // Insert the button into the thumbnail container (set position: relative on thumbnail’s parent if needed)
  thumbnailElement.style.position = "relative";
  thumbnailElement.appendChild(summarizeBtn);

  // On click: send a message to the background with the videoId
  summarizeBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // to prevent default YouTube behavior
    const videoId = getVideoIdFromThumbnail(thumbnailElement);
    if (videoId) {
      chrome.runtime.sendMessage({ type: "SUMMARIZE_VIDEO", videoId: videoId });
    } else {
      alert("No video ID found.");
    }
  });
}

function addButtonsToAllThumbnails() {
  // YouTube thumbnails can be found via various selectors; adjust as needed.
  // Typically: #dismissible or ytd-thumbnail or .ytd-rich-item-renderer
  const thumbnailElements = document.querySelectorAll("ytd-thumbnail");

  thumbnailElements.forEach((thumb) => {
    injectSummarizeButton(thumb);
  });
}

// Run once DOM is ready
document.addEventListener("DOMContentLoaded", addButtonsToAllThumbnails);
// Also run on dynamic page updates (YouTube is an SPA).
// A MutationObserver can handle DOM changes. For simplicity:
setInterval(addButtonsToAllThumbnails, 3000);

// contentScript.js (append this)

// Listen for summary result from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SUMMARY_RESULT") {
    const { summary, videoId } = request;

    // Display the summary to the user.
    showSummaryOverlay(`Summary for Video ${videoId}:\n\n${summary}`);
  }
});

function showSummaryOverlay(summary) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;
    background: white;
    border: 2px solid #000;
    padding: 16px;
    width: 400px;
    max-height: 70vh;
    overflow-y: auto;
  `;

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "Close";
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  const summaryText = document.createElement("div");
  summaryText.innerText = summary;

  overlay.appendChild(summaryText);
  overlay.appendChild(document.createElement("br"));
  overlay.appendChild(closeBtn);

  document.body.appendChild(overlay);
}
