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
  direction: "inches" | "cm";
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
  --primary-color: #0072b2;
  --grid-line-color: #e5e7eb;
  --axis-line-color: #374151;
}
```

### Technical Specifications

#### Conversion Graph Component

```typescript
// Core data structure
interface ConversionData {
  x: number; // inches
  y: number; // centimetres
  direction: "inches" | "cm";
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

## Generators from Markdown

This project includes powerful automation tools for generating educational content from structured Markdown files. These generators enable rapid content creation while maintaining consistency and quality across all materials.

### 🎥 Video Component Generator

**Purpose**: Automatically generates React components and standalone pages for educational video content.

**Source File**: `content/video_sources/videos.md`

**Usage**:

```bash
# Generate from default source
node scripts/generateVideoComponents.mjs

# Generate from specific file
node scripts/generateVideoComponents.mjs path/to/videos.md

# Or use VS Code task: "Generate Video Components"
```

**Generated Output**:

- React components with embedded video players and test IDs
- Standalone pages for direct video access
- Automatic landing page integration (Interactive Tools section)
- Index files for clean imports

**Markdown Format**:

```markdown
# Video Components

## Component Name

**Description:** Brief description of the video content.
**Video File:** /path/to/video.mp4
```

**Features**:

- ✅ Idempotent generation (no duplicates on multiple runs)
- ✅ Automatic test ID generation for component testing
- ✅ Landing page link deduplication
- ✅ Comprehensive test coverage (13 tests)

**Generated Structure**:

```
src/
├── components/
│   └── ComponentName/
│       ├── ComponentName.tsx (with video player & test IDs)
│       └── index.tsx
└── app/components/standalone/
    └── component-name/
        └── page.tsx (standalone video page)
```

### 📄 Worksheet Generator

**Purpose**: Automatically generates worksheet pages with PDF downloads and educational resources.

**Source File**: `content/worksheet_sources/worksheets.md`

**Usage**:

```bash
# Generate from default source
node scripts/generateWorksheetPages.mjs

# Generate from specific file
node scripts/generateWorksheetPages.mjs path/to/worksheets.md

# Or use VS Code task: "Generate Worksheet Pages"
```

**Generated Output**:

- Complete worksheet pages with frontmatter metadata
- PDF download links (worksheet + answer key)
- Learning objectives derived from tags
- External links section (from Additional Links)
- Local worksheet resources section (from Additional Resources)
- Automatic integration with WorksheetsSection component

**Markdown Format**:

```markdown
# Math Worksheets

## Worksheet Title

**Description:** Worksheet description and learning objectives.
**Worksheet PDF:** /path/to/worksheet.pdf
**Answers PDF:** /path/to/answers.pdf
**Additional Links:**

- [External Resource](https://example.com/resource)
- [Another External Resource](https://example.com/another)
  **Tags:** tag1, tag2, tag3, tag4

**Additional Resources**

- [Local Worksheet Title](/worksheets/topic-folder/local-worksheet.pdf)
- [Local Worksheet Answers](/worksheets/topic-folder/local-worksheet-answers.pdf)
```

**Creating a New Worksheet Topic**:

1. **Prepare PDF Files**:

   - Create or collect PDF worksheets and answer keys
   - Place PDFs **only** in `content/worksheets/topic-folder/` directory
   - PDFs are automatically copied to `public/worksheets/` during generation for web display
   - **Smart Sync**: Only newer files are copied (prevents accidental overwrites)

2. **Update Source Markdown**:

   - Add new worksheet section to `content/worksheet_sources/worksheets.md`
   - Include main worksheet PDF and answers PDF paths
   - Add external educational links in **Additional Links** section
   - List additional local PDFs in **Additional Resources** section

3. **Generate Pages**:

   ```bash
   # Standard generation (smart sync - only copies newer files)
   node scripts/generateWorksheetPages.mjs content/worksheet_sources/worksheets.md

   # Force overwrite all PDFs (useful for fixing corrupted files)
   node scripts/generateWorksheetPages.mjs content/worksheet_sources/worksheets.md --force

   # Or use VS Code tasks:
   # - "Generate Worksheet Pages" (smart sync)
   # - "Generate Worksheet Pages (Force)" (force overwrite)
   ```

   **PDF Sync Behavior**:

   - **Default (Smart Sync)**: Only copies PDFs that are newer than existing ones
   - **Force Mode**: Overwrites all PDFs regardless of modification time
   - **Feedback**: Shows which files were copied, skipped, and why

4. **Create Topic Page (Optional)**:

   - Create dedicated topic page: `src/app/worksheets/topic-name/page.tsx`
   - Filter worksheets by relevant slugs
   - Customize page content and metadata

5. **Verify Integration**:
   - Check generated pages at `/worksheets/worksheet-slug`
   - Verify PDF links work correctly
   - Confirm worksheet appears in main worksheets list

**Features**:

- ✅ Rich frontmatter generation with metadata
- ✅ Automatic slug generation from titles
- ✅ Learning objectives from tags (limit 4)
- ✅ External educational resources section
- ✅ Local additional worksheets section
- ✅ Comprehensive test coverage (12 tests)

**Generated Structure**:

```
content/worksheets/
└── worksheet-slug/
    └── index.md (complete worksheet page with downloads)

public/worksheets/
└── worksheet-slug/
    ├── main-worksheet.pdf
    ├── main-answers.pdf
    ├── additional-worksheet.pdf
    └── additional-answers.pdf
```

### 🛠️ Generator Architecture

Both generators follow a consistent three-layer architecture:

1. **Markdown Parser** (`*MarkdownParser.ts`)

   - Parses structured markdown into typed data objects
   - Validates required fields and formats
   - Generates clean, filesystem-safe slugs

2. **Content Generator** (`*Generator.ts`)

   - Creates output content from parsed data
   - Handles templating and formatting
   - Maintains consistent structure across all generated content

3. **Main Orchestrator** (`generate*.mjs`)
   - Coordinates the generation process
   - Manages file system operations
   - Provides status logging and error handling
   - Integrates with landing page updates

### 🧪 Testing

Each generator includes comprehensive test suites:

- **Unit Tests**: Individual component testing (parsers, generators)
- **Integration Tests**: End-to-end generation workflow testing
- **Fixture-based Tests**: Real-world markdown format validation

**Run Tests**:

```bash
# All generator tests
npm test -- scripts/__tests__/

# Specific generator
npm test -- scripts/__tests__/video*.test.ts
npm test -- scripts/__tests__/worksheet*.test.ts
```

### 📚 Documentation

Detailed documentation for each generator:

- **Video Generator**: See existing codebase and tests
- **Worksheet Generator**: `docs/worksheet-generator.md`

Both generators include TypeScript types, comprehensive error handling, and follow the same patterns for consistency and maintainability.
