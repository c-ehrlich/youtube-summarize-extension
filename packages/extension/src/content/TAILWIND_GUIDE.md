# Tailwind CSS in Chrome Extension Content Scripts

## Overview
Tailwind CSS is now properly configured for use in the content scripts. The setup ensures that:

1. **CSS is automatically injected** into YouTube pages via the manifest
2. **Styles are isolated** from YouTube's existing CSS using `!important` and specificity
3. **Full Tailwind utilities** are available for use

## How It Works

### CSS Injection
- Content script CSS is automatically generated as `assets/content-*.css`
- The `@crxjs/vite-plugin` automatically adds it to the manifest under `content_scripts.css`
- Chrome injects this CSS when the content script runs

### Style Isolation
The base container `.yt-summarize-container` uses:
- `all: initial` to reset all inherited styles
- `!important` declarations to override YouTube's aggressive CSS
- High z-index values to ensure visibility

## Usage Examples

### Basic Button with Tailwind Classes
```tsx
<button class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
  Click me
</button>
```

### Conditional Classes with `cn()` Utility
```tsx
import { cn } from "./utils/cn";

const buttonClass = cn(
  "base-button-class",
  {
    "bg-green-500": isSuccess,
    "bg-red-500": isError,
    "bg-blue-500": isDefault,
  }
);

<button class={buttonClass}>Dynamic Button</button>
```

### Container Positioning
```tsx
const containerClass = cn(
  "yt-summarize-container", // Always include this base class
  "absolute top-2 right-2",  // Positioning
  "bg-white shadow-lg rounded-md p-3" // Styling
);
```

## Important Notes

### Always Use Base Container
Every injected element should have the `yt-summarize-container` class:
```tsx
<div class="yt-summarize-container absolute bottom-2 left-2">
  {/* Your content */}
</div>
```

### Responsive Design
Tailwind responsive prefixes work normally:
```tsx
<div class="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

### Dark Mode
Dark mode classes work but YouTube's theme detection isn't automatic:
```tsx
<div class="bg-white dark:bg-gray-800 text-black dark:text-white">
  Theme-aware content
</div>
```

### Custom Styles
For complex styling needs, you can add custom CSS to `content.css`:
```css
.yt-summarize-container .custom-component {
  /* Custom styles with !important if needed */
  border: 2px solid #ff0000 !important;
}
```

## File Structure
```
src/content/
├── content.css           # Tailwind imports + custom CSS
├── solid-init.tsx        # Main content script (imports content.css)
├── utils/cn.ts          # Class utility function
└── TAILWIND_GUIDE.md    # This guide
```

## Debugging Tips

1. **Inspect element** in YouTube to see if classes are applied
2. **Check console** for CSS injection errors
3. **Verify manifest** includes the CSS file in `content_scripts.css`
4. **Use !important** if YouTube's styles are overriding yours

## Performance Notes

- **CSS is minified** and tree-shaken in production builds
- **Only used classes** are included in the final bundle
- **Current CSS size**: ~18.6KB (4.3KB gzipped) - includes all Tailwind utilities
