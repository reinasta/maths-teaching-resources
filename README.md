# Mathematics Teaching Resources - Conversion Graphs

An interactive mathematics education platform built with Next.js, focusing on dynamic visualizations and interactive learning components.

## Current Project Structure

```bash
remaths git:(main) ✗ tree -I "node_modules" -L 3
.
├── README.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src
│   ├── app
│   │   ├── components
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── slides
│   └── components
│       ├── ConversionGraph
│       └── CoordinatePlane
├── tailwind.config.ts
└── tsconfig.json

9 directories, 18 files
```

For a closer look at the `src/` directory structure:

```bash
src/
├── app/
│   ├── slides/
│   │   └── conversion/
│   │       └── page.tsx
│   └── components/
│       └── standalone/
│           ├── conversion-graph/
│           │   └── page.tsx
│           └── coordinate-plane/
│               └── page.tsx
└── components/
    ├── ConversionGraph/
    │   └── index.tsx
    └── CoordinatePlane/
        └── index.tsx
```

Media files (videos, images) are held in the following directory structure

```bash
remaths/
├── public/
│   ├── static/
│   │   ├── diagrams/      # Mathematical diagrams
│   │   ├── icons/         # UI icons
│   │   └── thumbnails/    # Slide previews
│   └── videos/
│       └── tutorials/      # Math concept videos
|       └── videos/         # Videos
|       └── components/     # Component-specific videos
└── src/
    └── assets/
        └── images/
            ├── slides/     # Slide-specific images
            └── components/ # Component-specific graphics
```


## Next.js setup

This project uses Next.js to generate static mathematics teaching resources. 
We have just transitioned to Next.js. See the transition plan below, and the details of the old project description in the section "Project Overview" (the aims of the project remain the same) below the transition plan.

## Core Technologies

- Next.js 15 with static exports
- React 19
- TypeScript 5
- Tailwind CSS 3.4
- D3.js for data visualizations
- Reveal.js for presentations

## Architecture Overview

### Core Components

1. **Conversion Graph System**
   - D3.js-based visualization with React wrapper
   - Manim videos
   - Two-way data binding between graph and control panel
   - State management via React hooks for animation sequences
   - Responsive design with dynamic viewBox calculations
   - Helper line animations for demonstrating conversions

2. **Coordinate Plane System**
   - Interactive point plotting with click events
   - Support for example and practice points
   - CSS2D labels integrated with D3 rendered points
   - Responsive grid system with dynamic tick spacing

3. **3D Prism Visualization**
   - Three.js implementation with OrbitControls
   - Real-time dimension updates with geometry recalculation
   - CSS2D labels for measurements
   - Unfolding animation capabilities
   - Auto-adjusting camera positions

4. **Control Panels**
   - Unified styling system across all tools
   - Direct state management with parent components
   - Input validation for mathematical constraints
   - Real-time calculation updates
   - Responsive layout system

### State Management

The application uses React's Context API for global state where needed, but primarily relies on component-level state management:

```typescript
// Example state flow for conversion graph
interface ConversionState {
  direction: 'inches' | 'cm';
  value: number;
  animationKey: number;
}

// Example state flow for 3D prism
interface PrismState {
  dimensions: PrismDimensions;
  isUnfolded: boolean;
  calculations: PrismCalculations;
}
```

### Styling Architecture

The project uses a hybrid styling approach:

1. **Global Styles**
   - Tailwind CSS for utility classes
   - CSS variables for theme configuration
   - Global responsive breakpoints
   - Animation keyframes

2. **Component-Specific Styles**
   - Module CSS for component isolation
   - D3.js inline styles for dynamic SVG properties
   - Three.js material system for 3D components

```css
/* Example of design system variables */
:root {
  --primary-color: #0072B2;
  --grid-line-color: #E5E7EB;
  --axis-line-color: #374151;
}
```

### Technical Specifications

#### Conversion Graph Component

```typescript
// Core data structure
interface ConversionData {
  x: number;      // inches
  y: number;      // centimetres
  direction: 'inches' | 'cm';
}

// Animation timing (ms)
const ANIMATION_TIMINGS = {
  HELPER_LINE_DELAY: 500,
  HELPER_LINE_DURATION: 1500,
  POINT_APPEARANCE_DELAY: 1750,
};
```

#### 3D Prism Component

```typescript
// Geometry calculations
interface PrismGeometry {
  vertices: Float32Array;
  indices: Uint16Array;
  normals: Float32Array;
}

// Label positioning
interface LabelConfig {
  offset: Vector3;
  rotation: Euler;
  scale: number;
}
```

### Performance Considerations

1. **D3.js Optimizations**
   - ViewBox-based scaling instead of resize recalculations
   - Debounced window resize handlers
   - Efficient update patterns for animations

2. **Three.js Performance**
   - Geometry reuse when possible
   - Proper disposal of materials and geometries
   - Optimized render loop with RAF
   - Camera frustum culling

3. **React Optimizations**
   - Memoization of expensive calculations
   - Proper cleanup in useEffect hooks
   - Efficient state updates for animations

### Build Configuration

Key build configurations for optimal performance:

```js
// webpack.config.js optimization
{
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        threejs: {
          test: /[\\/]node_modules[\\/]three[\\/]/,
          name: 'vendor-threejs',
          chunks: 'all',
        },
      },
    },
  },
}
```

### Testing Strategy

1. **Unit Tests**
   - Component rendering
   - Mathematical calculations
   - State management
   - Event handlers

2. **Integration Tests**
   - Component interactions
   - Animation sequences
   - User interaction flows

3. **Visual Regression Tests**
   - Graph rendering
   - 3D model appearances
   - Responsive layouts

## Development Guidelines

### Component Design

1. **Visualization Components**
   - Must handle window resizing gracefully
   - Should provide accessibility features
   - Must clean up resources (especially Three.js)
   - Should support touch interactions

2. **Control Panels**
   - Must validate mathematical constraints
   - Should provide immediate feedback
   - Must be keyboard accessible
   - Should support mobile interactions

### Mathematical Accuracy

- All calculations should be validated against known correct values
- Rounding should be consistent across components
- Units should be clearly displayed
- Error margins should be documented

### Responsive Design

The application uses custom breakpoints for specialized component behavior:

```typescript
const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE: 1440,
};
```

Each visualization component should adjust its behaviour based on screen size while maintaining mathematical accuracy and usability.