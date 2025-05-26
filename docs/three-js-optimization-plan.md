# Three.js Performance Optimization Implementation Plan

## Phase 1: Tree Shaking Implementation (High Impact - Immediate)

### Files to Update:

1. **Core Three.js Components:**
   - `src/components/Prism/Prism.tsx`
   - `src/components/Prism/TrapezoidalPrism.tsx`

2. **Utility Modules:**
   - `src/utils/threejs/geometryCalculations.ts`
   - `src/utils/threejs/meshCreation.ts`
   - `src/utils/threejs/labelUtils.ts` 
   - `src/utils/threejs/sceneSetup.ts`

3. **Test Mocks:**
   - `__mocks__/three.js`

### Expected Bundle Size Reduction:
- **Before:** ~568KB Three.js chunk
- **After:** ~150-200KB (60-65% reduction)
- **Page Load Impact:** 160KB → 60-80KB for 3D components

### Tree Shaking Strategy:

#### Step 1: Analyze Current Usage
```bash
# Find all Three.js imports
grep -r "import.*THREE.*from.*three" src/
grep -r "THREE\." src/ | wc -l
```

#### Step 2: Create Import Maps
```typescript
// src/utils/threejs/imports.ts
export {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Mesh,
  BufferGeometry,
  Float32BufferAttribute,
  MeshBasicMaterial,
  MeshPhongMaterial,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  EdgesGeometry,
  Vector3,
  Vector2,
  Group,
  Color,
  AmbientLight,
  DirectionalLight,
  Matrix4,
  Euler,
  DoubleSide
} from 'three';

export { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
export { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
```

#### Step 3: Update Components
Replace namespace imports with named imports throughout the codebase.

## Phase 2: Dynamic Imports & Code Splitting (Medium Impact)

### Current Situation Analysis:
- Both triangular and trapezoidal prism pages show 344KB first load
- Three.js is loaded even when users visit non-3D pages
- No lazy loading of 3D components

### Dynamic Import Strategy:

#### Option A: Component-Level Dynamic Imports (Recommended)
```typescript
// Lazy load 3D components
const Prism = dynamic(() => import('@/components/Prism/Prism'), {
  loading: () => <div>Loading 3D visualization...</div>,
  ssr: false // Three.js doesn't work with SSR
});
```

#### Option B: Route-Level Code Splitting
```typescript
// Split Three.js at page level
const PrismVisualization = dynamic(() => import('./PrismVisualization'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

### Expected Benefits:
- **Base pages:** 188KB (no Three.js loaded)
- **3D pages:** 188KB + ~80KB Three.js chunk (loaded on demand)
- **First paint improvement:** ~160KB less initial JavaScript

## Phase 3: Advanced Optimizations

### Bundle Splitting Configuration:
```typescript
// next.config.ts enhancement
const nextConfig: NextConfig = {
  webpack: (config) => {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          threejs: {
            test: /[\\/]node_modules[\\/]three[\\/]/,
            name: 'vendor-threejs',
            chunks: 'all',
            priority: 10,
          },
          threeJsExamples: {
            test: /[\\/]node_modules[\\/]three[\\/]examples[\\/]/,
            name: 'vendor-threejs-examples',
            chunks: 'all',
            priority: 9,
          }
        }
      }
    };
    return config;
  }
};
```

### Performance Monitoring:
```typescript
// Add to components for monitoring
const PrismWithMetrics = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('three')) {
          console.log(`Three.js load time: ${entry.duration}ms`);
        }
      });
    });
    observer.observe({ entryTypes: ['resource'] });
  }, []);
};
```

## Implementation Priority:

1. **Week 1:** Tree shaking implementation (highest impact)
2. **Week 2:** Dynamic imports for 3D components  
3. **Week 3:** Advanced webpack configuration
4. **Week 4:** Performance monitoring and fine-tuning

## Risk Assessment:

### Low Risk:
- Tree shaking (only changes import statements)
- Component-level dynamic imports

### Medium Risk:
- Webpack configuration changes
- Route-level code splitting

### Testing Strategy:
- Bundle analyzer before/after
- Performance benchmarks on low-end devices
- Lighthouse score improvements
- Manual testing of all 3D features

## Success Metrics:

### Target Performance Improvements:
- **Bundle size:** 60-65% reduction in Three.js payload
- **First load:** Non-3D pages load 160KB less JavaScript
- **3D pages:** 50-60% faster initial paint
- **Lighthouse score:** +10-15 points on performance

### Monitoring:
```bash
# Bundle analysis
npx webpack-bundle-analyzer .next/static/chunks/

# Performance testing
npm run build && npm run lighthouse
```
