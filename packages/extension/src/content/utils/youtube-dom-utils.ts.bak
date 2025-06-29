/**
 * YouTube DOM Utilities
 * Helper functions for YouTube-specific DOM operations
 */

export interface VideoInfo {
  videoId: string;
  title: string;
  channel: string;
  url: string;
}

/**
 * Extract video information from a thumbnail element
 */
export function extractVideoInfo(
  element: HTMLElement,
  type: 'regular' | 'end-card' | 'metadata' | 'player' | 'shorts' | 'live' | 'premiere'
): VideoInfo | null {
  try {
    switch (type) {
      case 'metadata':
        return extractMetadataVideoInfo(element);
      case 'regular':
      case 'shorts':
      case 'live':
      case 'premiere':
        return extractRegularVideoInfo(element);
      case 'end-card':
        return extractEndCardVideoInfo(element);
      case 'player':
        return extractPlayerVideoInfo(element);
      default:
        return null;
    }
  } catch (error) {
    console.error('Error extracting video info:', error);
    return null;
  }
}

/**
 * Extract video info from metadata line elements
 */
function extractMetadataVideoInfo(element: HTMLElement): VideoInfo | null {
  const metaDiv = element.closest('#meta');
  const titleAnchor = metaDiv?.querySelector('a#video-title') as HTMLAnchorElement;

  if (!titleAnchor) return null;

  const title = titleAnchor.textContent?.trim() || '';
  const urlParams = new URLSearchParams(titleAnchor.search);
  const videoId = urlParams.get('v') || '';

  if (!videoId) return null;

  // Find channel name
  const channelElement =
    metaDiv?.querySelector('.yt-formatted-string') ??
    metaDiv?.querySelector('.ytd-channel-name');
  const channel = channelElement?.textContent?.trim() || '';

  return {
    videoId,
    title,
    channel,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

/**
 * Extract video info from regular thumbnail elements
 */
function extractRegularVideoInfo(element: HTMLElement): VideoInfo | null {
  const gridMedia =
    element.closest('ytd-rich-grid-media') ??
    element.closest('ytd-compact-video-renderer') ??
    element.closest('ytd-video-renderer');

  if (!gridMedia) return null;

  // Extract video title
  const titleElement = gridMedia.querySelector('#video-title');
  const title = titleElement?.textContent?.trim() || '';

  // Extract channel name
  const channelElement =
    gridMedia.querySelector('.yt-formatted-string') ??
    gridMedia.querySelector('.ytd-channel-name') ??
    gridMedia.querySelector('#channel-name');
  const channel = channelElement?.textContent?.trim() || '';

  // Extract video ID from thumbnail link
  const anchor = gridMedia.querySelector('a#thumbnail') as HTMLAnchorElement;
  if (!anchor) return null;

  const urlParams = new URLSearchParams(anchor.search || '');
  const videoId = urlParams.get('v') || '';

  if (!videoId) return null;

  return {
    videoId,
    title,
    channel,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

/**
 * Extract video info from end card thumbnails
 */
function extractEndCardVideoInfo(element: HTMLElement): VideoInfo | null {
  const titleElement = element.querySelector('.ytp-videowall-still-info-title');
  const title = titleElement?.textContent?.trim() || '';

  const authorElement = element.querySelector('.ytp-videowall-still-info-author');
  const channel = authorElement?.textContent?.split('•')[0]?.trim() || '';

  // Extract video ID from href
  const href = element.getAttribute('href') || '';
  const videoIdMatch = href.match(/(?:\/watch\?v=|youtu\.be\/)([^&?]+)/);
  const videoId = videoIdMatch?.[1] || '';

  if (!videoId) return null;

  return {
    videoId,
    title,
    channel,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

/**
 * Extract video info from video player (watch page)
 */
function extractPlayerVideoInfo(_element: HTMLElement): VideoInfo | null {
  const mediaContainer = document.querySelector('#media-container-link') as HTMLAnchorElement;
  if (!mediaContainer) return null;

  const href = mediaContainer.getAttribute('href') || '';
  const videoIdMatch = href.match(/\/watch\?v=([^&?]+)/);
  const videoId = videoIdMatch?.[1] || '';

  if (!videoId) return null;

  // Get title from page
  const titleElement = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
  const title = titleElement?.textContent?.trim() || '';

  // Get channel from page
  const channelElement = document.querySelector('#owner #channel-name');
  const channel = channelElement?.textContent?.trim() || '';

  return {
    videoId,
    title,
    channel,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

/**
 * Check if an element already has a summarize button
 */
export function hasExistingButton(element: HTMLElement): boolean {
  return !!element.querySelector('.summarize-btn, .yt-summarize-container');
}

/**
 * Remove existing summarize buttons from an element
 */
export function removeExistingButtons(element: HTMLElement): void {
  const existingButtons = element.querySelectorAll('.summarize-btn, .yt-summarize-container');
  existingButtons.forEach((button) => button.remove());
}

/**
 * Mark an element as processed to avoid duplicate processing
 */
export function markAsProcessed(element: HTMLElement, identifier = 'yt-summarize-processed'): void {
  element.setAttribute(`data-${identifier}`, 'true');
}

/**
 * Check if an element is already marked as processed
 */
export function isProcessed(element: HTMLElement, identifier = 'yt-summarize-processed'): boolean {
  return element.hasAttribute(`data-${identifier}`);
}

/**
 * Get optimal button position for different thumbnail types
 */
export function getButtonPosition(type: 'regular' | 'end-card' | 'metadata' | 'player' | 'shorts' | 'live' | 'premiere'): React.CSSProperties {
  switch (type) {
    case 'end-card':
      return {
        position: 'absolute',
        bottom: '0px',
        left: '0px',
        zIndex: 99999,
      };
    case 'metadata':
      return {
        marginLeft: '8px',
        display: 'inline-block',
      };
    case 'player':
    case 'regular':
    case 'shorts':
    case 'live':
    case 'premiere':
    default:
      return {
        position: 'absolute',
        bottom: '8px',
        left: '8px',
        zIndex: 50,
      };
  }
}

/**
 * Wait for an element to appear in the DOM
 */
export function waitForElement(
  selector: string,
  timeout = 5000
): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Safely execute a function with error handling
 */
export function safeExecute<T>(
  fn: () => T,
  errorMessage = 'Error in YouTube DOM operation'
): T | null {
  try {
    return fn();
  } catch (error) {
    console.error(errorMessage, error);
    return null;
  }
}

/**
 * Debounce function to limit execution frequency
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
}
