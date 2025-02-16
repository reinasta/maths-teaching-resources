
## Current project structure

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

More details about the `src/` file structure:

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

## Development

```bash
# Run development server with Turbopack
npm run dev

# Build static site
npm run build

# Start production server
npm start
```

## Project Transition Plan

*For details on the original project, read the section "Mathematics Teaching Resources - Conversion Graphs" below*

This project is undergoing a structural transformation to better serve its purpose as a collection of mathematics teaching resources. The key objectives of this transition are:

1. Better separation between content and interactive components
2. Improved content management using a static site generator
3. More flexible deployment options
4. Better support for mathematical notation
5. Easier content creation and maintenance

### Current State

The project currently consists of:
- RevealJS slideshows for teaching mathematical concepts
- React components for interactive visualizations
- D3.js-based graphs and conversion tools
- Custom styling and layouts

### Planned Changes

#### Phase 1: Repository Organization
- Preserve current React/RevealJS implementation in main branch
- Create new branch for static site development
- Document all existing components and their dependencies

#### Phase 2: New Static Site
- Set up new static site project using a modern static site generator
- Implement base site structure and navigation
- Create content organization system
- Set up mathematical notation support (LaTeX/MathJax)

#### Phase 3: Component Integration
- Gradually migrate existing React components
- Ensure proper integration with static site framework
- Maintain component reusability
- Add proper documentation

#### Phase 4: Content Migration
- Move existing slide content to new structure
- Implement improved content organization
- Add metadata and tagging system
- Create index and search functionality

### Benefits of Transition

This transition will result in:
- Clear separation between content and interactive elements
- Easier content creation and maintenance
- Better organization of teaching resources
- Improved accessibility and performance
- More flexible deployment options

### Timeline

This transition is expected to proceed incrementally, ensuring that existing functionality remains available throughout the process. Each phase will be thoroughly tested before proceeding to the next.

---
*Note: This transition plan was added on February 16, 2025, to document the planned structural changes to the project.*


# Mathematics Teaching Resources - Conversion Graphs

An interactive web application for teaching mathematical concepts through dynamic visualizations, focusing on unit conversions and coordinate geometry. Built with RevealJS for presentations and React for interactive components.

# Project structure

This is the old project structure, superseded by the Nextjs-based setup above.

```bash
slides-revealjs/
├── package.json           # Project dependencies
├── index.html            # Entry point
├── src/
│   ├── styles/
│   │   ├── main.css      # Main styles
│   │   └── theme.css     # Theme variables
│   ├── components/
│   │   ├── CoordinatePlane.jsx
│   │   └── ConversionGraph.jsx
│   ├── slides/
│   │   └── conversion/
│   │       ├── index.html  # Slide content
│   │       └── images/     # Slide-specific images
│   └── utils/
│       └── animation.js   # Animation helpers
└── vite.config.js        # Build configuration
```



## Project Overview

This project creates browser-based mathematics teaching resources that combine presentation slides with interactive visualizations. The initial focus is on conversion graphs and coordinate geometry, designed for Year 8 students.

### Key Features

- Interactive coordinate plane visualization
- Dynamic conversion graphs with animations
- Step-by-step mathematical concept exploration
- Responsive and accessible design
- British English mathematical terminology

## Technical Stack

- **React 18** - For building interactive UI components
- **RevealJS** - Presentation framework
- **D3.js** - Data visualization library
- **Vite** - Build tool and development server

## Architecture

### Component Structure

The project uses a modular component architecture:

```
src/
├── components/
│   ├── CoordinatePlane.jsx    # Reusable coordinate system
│   └── ConversionGraph.jsx    # Interactive conversion visualizations
├── slides/
│   └── conversion/           # Slide content and configuration
└── styles/
    └── main.css             # Global styles and theme
```

### Key Components

1. **CoordinatePlane**
   - Renders a coordinate system with customizable axes
   - Handles point plotting and interactions
   - Supports interactive point highlighting

2. **ConversionGraph**
   - Builds on CoordinatePlane for unit conversions
   - Implements animated conversion demonstrations
   - Provides interactive conversion examples

### Design Principles

- Component reusability for different mathematical concepts
- Clear separation of presentation and interactive elements
- Accessibility-first approach to mathematical visualization
- Progressive enhancement for different device capabilities

## Development Guidelines

### Adding New Content

1. Create new slide content in `src/slides/`
2. Develop any required interactive components in `src/components/`
3. Register new slides in the main presentation structure

### Component Development

- Follow React functional component patterns
- Use D3.js for data visualization
- Implement responsive design using CSS variables
- Include ARIA labels and keyboard navigation
- Add British English tooltips and labels

### Mathematical Accuracy

- Use precise mathematical terminology
- Validate conversions and calculations
- Provide clear step-by-step explanations
- Include mathematical notation where appropriate

## Future Development

- Additional mathematical topics and visualizations
- More interactive exercises and examples
- Enhanced animation capabilities
- Expanded accessibility features
- Support for different educational levels
- Publish resources to the web on GitHub Pages or other static site hosting platform