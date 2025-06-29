# YouTube Summarize UI Fixes Plan

## Issues to Fix
1. Loading spinner doesn't spin ✅
2. X button is low contrast ✅
3. Button styling issues:
   - "Not interested" button has weird white background and contrast ✅
   - "Watch" button text is too low contrast, hover too extreme ✅

## Tasks
- [x] Analyze current CSS and component structure
- [x] Fix loading spinner animation
- [x] Fix X button contrast
- [x] Fix "Not interested" button styling (white-ish bg with dark text in dark mode)
- [x] Fix "Watch" button contrast and hover state

## Changes Made

### 1. Fixed Loading Spinner Animation
- **File**: `packages/extension/src/index.css`
- **Issue**: `animate-spin` class was not defined
- **Fix**: Added `@keyframes spin` animation and `.animate-spin` class

### 2. Improved X Button Contrast
- **File**: `packages/extension/src/ui-solid/primitives/Dialog.module.css`
- **Issue**: Low opacity and no color specification made button hard to see
- **Fix**: 
  - Increased opacity from 0.7 to 0.8
  - Added explicit colors for light/dark mode
  - Added hover background color
  - Better contrast in both light and dark themes

### 3. Fixed Button Styling
- **File**: `packages/extension/src/ui-solid/primitives/Button.module.css`
- **Issue**: Poor contrast and extreme hover effects
- **Fix**:
  - **Default variant** ("Not interested"): Changed to white-ish background with dark text and border, maintains this in dark mode
  - **Ghost variant** ("Watch"): Improved text contrast, softer hover background transition
  - Added proper dark mode support for both variants

## Files Modified
- packages/extension/src/index.css
- packages/extension/src/ui-solid/primitives/Dialog.module.css  
- packages/extension/src/ui-solid/primitives/Button.module.css
