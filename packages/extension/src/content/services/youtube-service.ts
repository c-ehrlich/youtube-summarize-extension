/**
 * YouTube Integration Service
 * Handles all YouTube-specific DOM operations and SPA navigation
 */

export interface YouTubeNavigationEvent {
  type: 'start' | 'finish';
  url: string;
  timestamp: number;
}

export interface YouTubeThumbnailElement {
  element: HTMLElement;
  type: 'regular' | 'end-card' | 'metadata' | 'player';
  context: 'home' | 'search' | 'watch' | 'channel' | 'subscriptions' | 'trending' | 'unknown';
}

export interface YouTubeServiceConfig {
  debug?: boolean;
  debounceMs?: number;
}

export class YouTubeService {
  private config: YouTubeServiceConfig;
  private mutationObserver: MutationObserver | null = null;
  private navigationCallbacks: ((event: YouTubeNavigationEvent) => void)[] = [];
  private thumbnailCallbacks: ((thumbnails: YouTubeThumbnailElement[]) => void)[] = [];
  private isInitialized = false;
  private debounceTimer: number | null = null;

  constructor(config: YouTubeServiceConfig = {}) {
    this.config = {
      debug: false,
      debounceMs: 100,
      ...config,
    };
  }

  /**
   * Initialize the YouTube service
   */
  public initialize(): void {
    if (this.isInitialized) {
      this.log('YouTube service already initialized');
      return;
    }

    this.log('Initializing YouTube service...');
    
    this.setupNavigationListeners();
    this.setupMutationObserver();
    this.isInitialized = true;
    
    this.log('YouTube service initialized successfully');
  }

  /**
   * Clean up and destroy the service
   */
  public destroy(): void {
    this.log('Destroying YouTube service...');
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.navigationCallbacks = [];
    this.thumbnailCallbacks = [];
    this.isInitialized = false;
    
    this.log('YouTube service destroyed');
  }

  /**
   * Subscribe to navigation events
   */
  public onNavigation(callback: (event: YouTubeNavigationEvent) => void): () => void {
    this.navigationCallbacks.push(callback);
    return () => {
      const index = this.navigationCallbacks.indexOf(callback);
      if (index > -1) {
        this.navigationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to thumbnail detection events
   */
  public onThumbnailsDetected(callback: (thumbnails: YouTubeThumbnailElement[]) => void): () => void {
    this.thumbnailCallbacks.push(callback);
    return () => {
      const index = this.thumbnailCallbacks.indexOf(callback);
      if (index > -1) {
        this.thumbnailCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current page context
   */
  public getCurrentContext(): YouTubeThumbnailElement['context'] {
    const pathname = window.location.pathname;
    
    if (pathname === '/' || pathname.startsWith('/feed/home')) return 'home';
    if (pathname.startsWith('/results')) return 'search';
    if (pathname.startsWith('/watch')) return 'watch';
    if (pathname.startsWith('/channel') || pathname.startsWith('/c/') || pathname.startsWith('/@')) return 'channel';
    if (pathname.startsWith('/feed/subscriptions')) return 'subscriptions';
    if (pathname.startsWith('/feed/trending')) return 'trending';
    
    return 'unknown';
  }

  /**
   * Setup YouTube SPA navigation listeners
   */
  private setupNavigationListeners(): void {
    // Listen for YouTube's navigation events
    window.addEventListener('yt-navigate-start', () => {
      const navigationEvent: YouTubeNavigationEvent = {
        type: 'start',
        url: window.location.href,
        timestamp: Date.now(),
      };
      this.log('Navigation start', navigationEvent);
      this.notifyNavigationCallbacks(navigationEvent);
    });

    window.addEventListener('yt-navigate-finish', () => {
      const navigationEvent: YouTubeNavigationEvent = {
        type: 'finish',
        url: window.location.href,
        timestamp: Date.now(),
      };
      this.log('Navigation finish', navigationEvent);
      this.notifyNavigationCallbacks(navigationEvent);
      
      // Trigger thumbnail detection after navigation
      this.scheduleProcessThumbnails();
    });

    // Fallback: Listen for URL changes
    let lastUrl = window.location.href;
    const checkUrlChange = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        this.log('URL change detected', { from: lastUrl, to: currentUrl });
        lastUrl = currentUrl;
        this.scheduleProcessThumbnails();
      }
    };
    
    setInterval(checkUrlChange, 1000);
  }

  /**
   * Setup mutation observer for DOM changes
   */
  private setupMutationObserver(): void {
    this.mutationObserver = new MutationObserver((mutations) => {
      this.log(`MutationObserver triggered with ${mutations.length} mutations`);
      this.scheduleProcessThumbnails();
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href'],
    });

    this.log('MutationObserver set up successfully');
  }

  /**
   * Debounced thumbnail processing
   */
  private scheduleProcessThumbnails(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.processThumbnails();
      this.debounceTimer = null;
    }, this.config.debounceMs);
  }

  /**
   * Process and detect thumbnails
   */
  private processThumbnails(): void {
    this.log('Processing thumbnails...');
    
    const thumbnails: YouTubeThumbnailElement[] = [];
    const context = this.getCurrentContext();

    // Find all ytd-thumbnail elements
    const thumbnailElements = document.querySelectorAll('ytd-thumbnail');
    thumbnailElements.forEach((element) => {
      thumbnails.push({
        element: element as HTMLElement,
        type: 'regular',
        context,
      });
    });

    // Find end card thumbnails
    const endCardElements = document.querySelectorAll('.ytp-videowall-still');
    endCardElements.forEach((element) => {
      thumbnails.push({
        element: element as HTMLElement,
        type: 'end-card',
        context,
      });
    });

    // Find metadata line elements
    const metadataElements = document.querySelectorAll('#metadata-line');
    metadataElements.forEach((element) => {
      const metaDiv = element.closest('#meta');
      const titleAnchor = metaDiv?.querySelector('a#video-title');
      if (titleAnchor) {
        thumbnails.push({
          element: element as HTMLElement,
          type: 'metadata',
          context,
        });
      }
    });

    // Find video player (for watch page)
    if (context === 'watch') {
      const videoPlayer = document.querySelector('.html5-video-player') as HTMLElement;
      if (videoPlayer) {
        thumbnails.push({
          element: videoPlayer,
          type: 'player',
          context,
        });
      }
    }

    this.log(`Found ${thumbnails.length} thumbnails`, thumbnails);
    this.notifyThumbnailCallbacks(thumbnails);
  }

  /**
   * Notify navigation callbacks
   */
  private notifyNavigationCallbacks(event: YouTubeNavigationEvent): void {
    this.navigationCallbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in navigation callback:', error);
      }
    });
  }

  /**
   * Notify thumbnail callbacks
   */
  private notifyThumbnailCallbacks(thumbnails: YouTubeThumbnailElement[]): void {
    this.thumbnailCallbacks.forEach((callback) => {
      try {
        callback(thumbnails);
      } catch (error) {
        console.error('Error in thumbnail callback:', error);
      }
    });
  }

  /**
   * Debug logging
   */
  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[YouTubeService] ${message}`, data || '');
    }
  }
}
