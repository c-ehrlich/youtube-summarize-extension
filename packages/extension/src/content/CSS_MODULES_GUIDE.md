# CSS Modules in Chrome Extension Content Scripts

## Overview
We've switched from messy inline styles to clean CSS modules for better maintainability and reliability.

## How It Works

### CSS Modules Benefits
- **Scoped class names**: Automatically generated unique class names prevent conflicts with YouTube's CSS
- **No !important needed**: Scoped names have natural specificity
- **Clean separation**: Styles in `.module.css` files, logic in `.tsx` files
- **Type safety**: Vite generates TypeScript definitions for CSS classes

### File Structure
```
src/content/
├── Button.module.css        # Scoped styles for buttons
├── solid-init.tsx          # Main content script
└── utils/cn.ts             # Class utility function
```

## Usage Examples

### Basic CSS Module Usage
```tsx
// Import the CSS module
import styles from "./Button.module.css";

// Use the scoped classes
<div class={styles.container}>
  <button class={styles.button}>
    Click me
  </button>
</div>
```

### Conditional Classes
```tsx
import { cn } from "./utils/cn";
import styles from "./Button.module.css";

const containerClasses = cn(styles.container, {
  [styles.absolute]: props.type !== "metadata",
  [styles.bottomLeft]: props.type === "regular",
  [styles.inlineBlock]: props.type === "metadata",
});

<div class={containerClasses}>
  <button class={styles.button}>Button</button>
</div>
```

### Multiple Class Variants
```tsx
<button class={cn(styles.button, styles.small, styles.secondary)}>
  Small Secondary Button
</button>
```

## Available Classes (Button.module.css)

### Container Classes
- `container` - Base container with CSS reset
- `absolute` - Absolute positioning
- `bottomLeft` - Bottom left positioning (8px from edges)
- `bottomLeftZero` - Bottom left positioning (0px from edges)
- `inlineBlock` - Inline block display with margin

### Button Classes
- `button` - Base button styling (red, white text)
- `small` - Smaller padding and font size
- `large` - Larger padding and font size
- `secondary` - Gray color variant
- `success` - Green color variant

## Generated Class Names
CSS modules automatically generate scoped class names like:
- `.container` → `.Button__container___a1b2c`
- `.button` → `.Button__button___d3e4f`

This prevents conflicts with YouTube's existing CSS.

## Adding New Styles

### Creating New CSS Module Files
```css
/* Component.module.css */
.newComponent {
  background: blue;
  color: white;
}

.variant {
  background: green;
}
```

### Using in Components
```tsx
import styles from "./Component.module.css";

<div class={styles.newComponent}>
  <span class={styles.variant}>Content</span>
</div>
```

## Configuration
CSS modules are configured in `vite.config.ts`:
```ts
css: {
  modules: {
    localsConvention: 'camelCase',
    generateScopedName: '[name]__[local]___[hash:base64:5]',
  },
}
```

## Benefits Over Previous Approach
1. **No inline styles** - Clean code separation
2. **No style injection** - Styles load with the page
3. **No specificity wars** - Scoped names prevent conflicts
4. **Better performance** - CSS is cached by browser
5. **Maintainable** - Easy to modify and extend styles
6. **Type safe** - IDE autocompletion for class names

## Bundle Size
- **CSS file**: ~1.4 kB (0.6 kB gzipped)
- **JS file**: ~4.7 kB (2.0 kB gzipped)
- **Total**: Much smaller than previous inline approach
