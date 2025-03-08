# Spec for refactoring the styling across the project

Let's analyze the component-specific styles and create a detailed plan for splitting `globals.css` and handling slide styles.

Current Analysis:
1. globals.css contains:
   - Tailwind directives
   - Root variables
   - Component styles
   - Slide styles
   - Responsive styles mixed throughout
   - Button and control panel styles
   - Graph-specific styles

Let's break this down into a more organized structure:

```bash
src/
  styles/
    base/
      _reset.css          # Browser resets
      _root.css           # Root variables
      _typography.css     # Base typography
    components/
      graphs/
        _conversion.css   # Conversion graph specific
        _coordinate.css   # Coordinate plane specific
        _grid.css         # Shared grid styles
      controls/
        _buttons.css      # Button styles
        _panels.css       # Control panel styles
        _inputs.css       # Input styles
      prism/
        _container.css    # 3D container styles
        _controls.css     # Prism controls
        _annotations.css  # 3D annotations
    layouts/
      _conversion.css     # Conversion layout styles
      _standalone.css     # Standalone page layouts
    slides/
      _base.css          # Base slide styles
      _typography.css     # Slide-specific typography
      _layouts.css       # Slide layouts
      _transitions.css    # Slide transitions
      _themes.css        # Slide themes
    utilities/
      _animations.css    # Animation utilities
      _responsive.css    # Responsive utilities
    index.css           # Main entry point
```

Let's look at specific component style separations:

### 1. Conversion Graph Styles

```css
/* styles/components/graphs/_conversion.css */
.coordinate-plane {
  width: 100%;
  height: auto;
  max-height: 80vh;
  aspect-ratio: 1.25;
}

.grid-line {
  @apply stroke-gray-300;
  stroke-width: clamp(0.05rem, 0.1vw, 0.1rem);
}

.conversion-line {
  @apply stroke-primary;
  stroke-width: clamp(0.15rem, 0.2vw, 0.3rem);
}

.helper-line {
  @apply stroke-primary;
  stroke-width: clamp(0.1rem, 0.15vw, 0.2rem);
  stroke-dasharray: 6 4;
}

/* Responsive adjustments */
@media (max-width: theme('screens.tablet')) {
  .coordinate-plane {
    max-height: 70vh;
  }
}
```

### 2. Control Panel Styles

```css
/* styles/components/controls/_panels.css */
.controls-container {
  @apply bg-white rounded-lg shadow-sm;
  width: 100%;
  max-width: 400px;
  padding: clamp(0.75rem, 2vw, 1.5rem);
}

.button-group {
  @apply flex flex-col;
  gap: clamp(0.5rem, 1.5vw, 0.75rem);
}

/* Responsive adaptations */
@media (max-width: theme('screens.mobile')) {
  .controls-container {
    transform: scale(0.8);
  }
}
```

### 3. Slide Styles

```css
/* styles/slides/_base.css */
.reveal {
  font-family: var(--main-font);
  font-size: clamp(24px, 2.5vw, 32px);
}

.reveal .slides {
  text-align: left;
}

/* styles/slides/_typography.css */
.reveal h1 {
  font-size: clamp(56px, 6vw, 84px);
  font-weight: 700;
  line-height: 1.3;
}

/* styles/slides/_layouts.css */
.reveal .conversion-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1rem, 3vw, 2rem);
}
```

### 4. New index.css Structure

```css
/* styles/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Base styles */
@import './base/_reset.css';
@import './base/_root.css';
@import './base/_typography.css';

/* Component styles */
@import './components/graphs/_conversion.css';
@import './components/graphs/_coordinate.css';
@import './components/graphs/_grid.css';
@import './components/controls/_buttons.css';
@import './components/controls/_panels.css';
@import './components/controls/_inputs.css';
@import './components/prism/_container.css';
@import './components/prism/_controls.css';
@import './components/prism/_annotations.css';

/* Layout styles */
@import './layouts/_conversion.css';
@import './layouts/_standalone.css';

/* Slide styles */
@import './slides/_base.css';
@import './slides/_typography.css';
@import './slides/_layouts.css';
@import './slides/_transitions.css';
@import './slides/_themes.css';

/* Utilities */
@import './utilities/_animations.css';
@import './utilities/_responsive.css';
```

Implementation Steps:

1. Initial Setup and Backup:
```bash
# Create backup branch
git checkout -b backup/pre-refactor
git add .
git commit -m "backup: before style refactoring"

# Create main refactor branch
git checkout main
git checkout -b refactor/main
```

2. Create Directory Structure:
```bash
# Create directories
mkdir -p src/styles/{base,components/{graphs,controls,prism},layouts,slides,utilities}

# Copy existing globals.css as backup
cp src/styles/globals.css src/styles/_globals.old.css
```

3. Set up Feature Flags:
```css
// filepath: src/styles/base/_root.css
:root {
  --enable-new-styles: true;
  --enable-new-components: true;
  --enable-new-slides: true;
  
  /* Existing variables */
  --main-font: 'Inter', sans-serif;
  --primary-color: #0066cc;
}
```

4. Move Component Styles (Incremental):
```bash
# Create component-specific branches
git checkout -b refactor/graphs-styles
git checkout -b refactor/controls-styles
git checkout -b refactor/slides-styles
```

5. Add Component Dependencies Documentation:
```css
// filepath: src/styles/components/graphs/_conversion.css
/* @requires: ../../base/_root.css */
/* @requires: ../../utilities/_responsive.css */
/* @component: ConversionGraph */

.coordinate-plane {
  /* ...existing styles... */
}
```

6. Implement CSS Modules (Optional):
```css
// filepath: src/styles/components/graphs/Conversion.module.css
.graphContainer {
  composes: baseGraph from '../../base/_base.module.css';
  /* Component specific styles */
}
```

7. Update Main Entry Point:
```css
// filepath: src/styles/index.css
/* Feature flags */
@import './base/_root.css';

/* Only import new styles if enabled */
@supports (--enable-new-styles: true) {
  /* Base styles */
  @import './base/_reset.css';
  @import './base/_typography.css';
  
  /* Component styles - conditional imports */
  @import './components/index.css' layer(components);
  
  /* Rest of imports */
}

/* Fallback for old styles */
@supports not (--enable-new-styles: true) {
  @import './_globals.old.css';
}
```

8. Testing Commands:
```bash
# Visual regression testing
npx backstopjs test

# Component style testing
npm run test:components

# Integration testing
npm run test:integration
```

9. Rollback Plan:
```bash
# If issues are detected
git checkout backup/pre-refactor
git checkout -b hotfix/style-rollback

# Restore original globals.css
mv src/styles/_globals.old.css src/styles/globals.css
```

10. Deployment Strategy:
```bash
# Stage 1: Deploy with feature flags off
ENABLE_NEW_STYLES=false npm run build

# Stage 2: Enable new styles for 20% of users
ENABLE_NEW_STYLES=true STYLE_ROLLOUT=0.2 npm run build

# Stage 3: Full rollout
ENABLE_NEW_STYLES=true npm run build
```

Testing Approach:

1. Component Testing:
   - Test each component individually after style extraction
   - Verify responsive behaviour
   - Check all interactions and states
   - Cross-browser testing

2. Slide Testing:
   - Test all slide transitions
   - Verify responsive behaviour
   - Check presentation mode
   - Test slide navigation

3. Integration Testing:
   - Test components within slides
   - Verify layout combinations
   - Check responsive layouts
   - Test all interactive features

4. Visual Regression Testing:
   - Take screenshots before and after each change
   - Compare component renders
   - Check responsive breakpoints
   - Verify animation states

Implementation Guidelines:

1. Use comments to document:
   - Component purpose
   - Responsive breakpoints
   - Animation timings
   - Important style decisions

2. Maintain consistency:
   - Use CSS custom properties
   - Follow BEM naming convention
   - Use Tailwind utilities where appropriate
   - Keep media queries consistent

3. Performance considerations:
   - Minimize CSS specificity
   - Use efficient selectors
   - Optimize media queries
   - Consider CSS load order
