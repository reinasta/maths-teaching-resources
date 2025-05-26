# Refactoring Plan: Modularizing `src/components/Prism/TrapezoidalPrism.tsx`

**Objective**: Refactor `src/components/Prism/TrapezoidalPrism.tsx` into smaller, more focused modules (utility functions and custom React hooks) to improve modularity, readability, maintainability, and testability, mirroring the approach used for `Prism.tsx`.

**Guiding Principles**:
*   Each step should be small, isolated, and independently testable.
*   Maintain existing functionality after each step. Verify with existing tests if available, or by manual testing.
*   Follow React best practices, especially for custom hooks and dependency management.
*   Ensure proper cleanup of Three.js resources to prevent memory leaks.
*   Adapt paths and type names as necessary for the trapezoidal prism context.

---

## Phase 1: Extract Types

**Goal**: Move type definitions specific to `TrapezoidalPrism` into a dedicated file.

**Step 1.1: Create `trapezoidalPrism.types.ts` for Type Definitions**
1.  **Action**: Create a new file: `src/components/Prism/trapezoidalPrism.types.ts`.
2.  **Action**: Move the `TrapezoidalPrismProps` interface definition from `TrapezoidalPrism.tsx` to `trapezoidalPrism.types.ts`.
    *   Note: `TrapezoidalPrismDimensions`, `VisualStyle`, `LabelConfig`, and `TrapezoidalPrismCalculations` are currently imported from `../../app/components/standalone/trapezoidal-prism/types`. We will keep these imports as is in `trapezoidalPrism.types.ts` for now, or consider moving/re-exporting them if a more centralized type management is desired later. For this refactor, we'll focus on `TrapezoidalPrismProps`.
3.  **Action**: Export `TrapezoidalPrismProps` from `trapezoidalPrism.types.ts`.
    ```typescript
    // filepath: src/components/Prism/trapezoidalPrism.types.ts
    import { 
        TrapezoidalPrismDimensions, 
        VisualStyle, 
        LabelConfig, 
        TrapezoidalPrismCalculations 
    } from '../../app/components/standalone/trapezoidal-prism/types';

    export interface TrapezoidalPrismProps {
      dimensions: TrapezoidalPrismDimensions;
      isUnfolded?: boolean;
      visualStyle: VisualStyle; // Assuming VisualStyle is generic enough or defined in the imported types
      labelConfig?: LabelConfig; // Assuming LabelConfig is generic enough or defined in the imported types
      calculations?: TrapezoidalPrismCalculations;
    }

    // It might be beneficial to re-export shared types if they are used by other components in this module
    export type { 
        TrapezoidalPrismDimensions, 
        VisualStyle, 
        LabelConfig, 
        TrapezoidalPrismCalculations 
    };
    ```
4.  **Update `TrapezoidalPrism.tsx`**:
    *   Remove the local definition of `TrapezoidalPrismProps`.
    *   Import `TrapezoidalPrismProps` from `./trapezoidalPrism.types.ts`.
        ```tsx
        // filepath: src/components/Prism/TrapezoidalPrism.tsx
        // ... other imports ...
        import { TrapezoidalPrismProps } from './trapezoidalPrism.types';
        import { 
          TrapezoidalPrismDimensions, 
          VisualStyle, 
          LabelConfig, 
          TrapezoidalPrismCalculations 
        } from '../../app/components/standalone/trapezoidal-prism/types'; // Keep these if not re-exported and used directly
        // ... rest of the file ...
        ```
5.  **Testing**: Manually test or run existing tests to ensure no regressions related to type definitions.

**Step 1.2: Define and Export `DEFAULT_TRAPEZOIDAL_LABEL_CONFIG` (Optional but Recommended)**
1.  **Action**: If `TrapezoidalPrism.tsx` uses a specific default for `labelConfig` that differs from a global default, define it in `trapezoidalPrism.types.ts`. The current `TrapezoidalPrism.tsx` defines it inline: `{ showVolume: true, showSurfaceArea: false, showFaces: false }`.
2.  **Action**: Create and export `DEFAULT_TRAPEZOIDAL_LABEL_CONFIG` from `trapezoidalPrism.types.ts`.
    ```typescript
    // filepath: src/components/Prism/trapezoidalPrism.types.ts
    // ... existing types ...
    import { LabelConfig } from '../../app/components/standalone/trapezoidal-prism/types'; // Ensure LabelConfig is imported

    export const DEFAULT_TRAPEZOIDAL_LABEL_CONFIG: LabelConfig = {
      showVolume: true,
      showSurfaceArea: false,
      showFaces: false,
      // Add other fields if LabelConfig has more and they need defaults
    };
    ```
3.  **Update `TrapezoidalPrism.tsx`**:
    *   Import `DEFAULT_TRAPEZOIDAL_LABEL_CONFIG` from `./trapezoidalPrism.types.ts`.
    *   Use it as the default value for the `labelConfig` prop.
        ```tsx
        // filepath: src/components/Prism/TrapezoidalPrism.tsx
        // ... other imports ...
        import { TrapezoidalPrismProps, DEFAULT_TRAPEZOIDAL_LABEL_CONFIG } from './trapezoidalPrism.types';
        // ...

        const TrapezoidalPrism: React.FC<TrapezoidalPrismProps> = ({ 
          // ...
          labelConfig = DEFAULT_TRAPEZOIDAL_LABEL_CONFIG,
          // ...
        }) => {
          // ...
        };
        ```
4.  **Testing**: Manually test or run existing tests.

---

## Phase 2: Extract `updateLabels` Function

**Goal**: Move the `updateLabels` function specific to the trapezoidal prism into its own utility file.

**Step 2.1: Create `trapezoidalLabelUpdater.ts` and Move Function**
1.  **Action**: Create a new file: `src/components/Prism/trapezoidalLabelUpdater.ts`.
2.  **Action**: Move the entire `updateLabels` function definition from `TrapezoidalPrism.tsx` to `trapezoidalLabelUpdater.ts`.
3.  **Action**: In `trapezoidalLabelUpdater.ts`, add all necessary imports. These will include:
    *   Three.js elements: `Scene`, `Mesh`, `Vector3` (from `../../utils/threejs/imports`).
    *   Types: `TrapezoidalPrismDimensions`, `LabelConfig`, `TrapezoidalPrismCalculations`, `VisualStyle` (from `../../app/components/standalone/trapezoidal-prism/types` or re-exported from `./trapezoidalPrism.types.ts`).
    *   Utility functions: `setupLabelsGroup`, `createTrapezoidalPrismLabel` (from `../../utils/threejs/labelUtils`).
4.  **Action**: Export the `updateLabels` function from `trapezoidalLabelUpdater.ts`.
    ```typescript
    // filepath: src/components/Prism/trapezoidalLabelUpdater.ts
    import { Scene, Mesh, Vector3 } from '../../utils/threejs/imports';
    import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'; // If createTrapezoidalPrismLabel returns CSS2DObject and it's used here
    import { 
        TrapezoidalPrismDimensions, 
        LabelConfig, 
        TrapezoidalPrismCalculations,
        VisualStyle 
    } from '../../app/components/standalone/trapezoidal-prism/types';
    import { setupLabelsGroup, createTrapezoidalPrismLabel } from '../../utils/threejs/labelUtils';

    // The entire updateLabels function code for TrapezoidalPrism goes here...
    export function updateTrapezoidalLabels(
      dimensions: TrapezoidalPrismDimensions,
      scene: Scene,
      mesh: Mesh, // mesh parameter was `_mesh` suggesting it might not be fully used. Review usage.
      isUnfolded: boolean,
      labelConfig: LabelConfig, // Consider using the imported DEFAULT_TRAPEZOIDAL_LABEL_CONFIG if applicable for default
      calculations?: TrapezoidalPrismCalculations,
      visualStyle: VisualStyle // visualStyle parameter was `_visualStyle`. Review usage.
    ): void {
      // ... function body ...
    }
    ```
    *   **Note**: The function has been renamed to `updateTrapezoidalLabels` for clarity. Adjust calls accordingly.
5.  **Update `TrapezoidalPrism.tsx`**:
    *   Remove the local `updateLabels` function definition.
    *   Import `updateTrapezoidalLabels` from `./trapezoidalLabelUpdater.ts`.
        ```tsx
        // filepath: src/components/Prism/TrapezoidalPrism.tsx
        // ... other imports ...
        import { updateTrapezoidalLabels } from './trapezoidalLabelUpdater';
        // ... rest of the file ...
        ```
    *   Ensure the calls to `updateTrapezoidalLabels` (previously `updateLabels`) within the `useEffect` hooks in `TrapezoidalPrism.tsx` are still correct.
        ```tsx
        // filepath: src/components/Prism/TrapezoidalPrism.tsx
        // ...
        // Inside the first useEffect:
        updateTrapezoidalLabels(dimensions, scene, mesh, isUnfolded, labelConfig, calculations, visualStyle);
        // ...
        // Inside the second useEffect:
        updateTrapezoidalLabels(dimensions, sceneRef.current, newMesh, isUnfolded, labelConfig, calculations, visualStyle);
        // ...
        ```
6.  **Testing**: Manually test or run existing tests. Labeling functionality should remain unchanged.

---

## Phase 3: Create Custom Hook `useTrapezoidalPrismEffects`

**Goal**: Encapsulate the Three.js setup, mesh updates, animation, and cleanup logic for the trapezoidal prism within a custom hook.

**Step 3.1: Create `useTrapezoidalPrismEffects.ts` and Define the Hook**
1.  **Action**: Create a new file: `src/components/Prism/useTrapezoidalPrismEffects.ts`.
2.  **Action**: Define the custom hook `useTrapezoidalPrismEffects`.
    *   It will accept: `containerRef: React.RefObject<HTMLDivElement>`, `dimensions: TrapezoidalPrismDimensions`, `isUnfolded: boolean`, `visualStyle: VisualStyle`, `labelConfig: LabelConfig`, `calculations?: TrapezoidalPrismCalculations`.
    *   It will internally manage `useRef` for `webGLRenderer`, `css2DRenderer`, `scene`, `camera`, `orbitControls`, and `meshRef`.
3.  **Action**: Move the combined logic of both `useEffect` hooks from `TrapezoidalPrism.tsx` into a single `useEffect` within `useTrapezoidalPrismEffects.ts`.
    *   The dependencies for this `useEffect` will be `[containerRef, dimensions, isUnfolded, visualStyle, labelConfig, calculations]`.
    *   **Initial Setup**: Similar to `usePrismEffects`, using `setupPrismVisualization`, `createPrismAnimationLoop`, `createResizeHandler`.
    *   **Mesh Creation/Update**:
        *   Dispose of old mesh.
        *   Use `createTrapezoidalPrismGeometry` and `createTrapezoidalPrismMesh`.
        *   Call `updateTrapezoidalLabels`.
    *   **Cleanup Function**: Similar to `usePrismEffects`, ensuring all resources specific to the trapezoidal prism (mesh, labels, renderers, event listeners) are cleaned up.
4.  **Action**: Ensure all necessary imports are added to `useTrapezoidalPrismEffects.ts`.
    ```typescript
    // filepath: src/components/Prism/useTrapezoidalPrismEffects.ts
    import React, { useEffect, useRef, RefObject } from 'react';
    import { WebGLRenderer, Scene, PerspectiveCamera, Mesh, Material, Group, LineSegments } from '../../utils/threejs/imports';
    import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
    import { 
        TrapezoidalPrismDimensions, 
        VisualStyle, 
        LabelConfig, 
        TrapezoidalPrismCalculations 
    } from '../../app/components/standalone/trapezoidal-prism/types';
    import { updateTrapezoidalLabels } from './trapezoidalLabelUpdater';
    import { createTrapezoidalPrismGeometry } from '../../utils/threejs/geometryCalculations';
    import { createTrapezoidalPrismMesh } from '../../utils/threejs/meshCreation';
    import { setupPrismVisualization, createPrismAnimationLoop, createResizeHandler } from '../../utils/threejs/sceneSetup'; // Assuming these are generic enough

    export function useTrapezoidalPrismEffects(
      containerRef: RefObject<HTMLDivElement>,
      dimensions: TrapezoidalPrismDimensions,
      isUnfolded: boolean,
      visualStyle: VisualStyle,
      labelConfig: LabelConfig,
      calculations?: TrapezoidalPrismCalculations
    ) {
      const rendererRef = useRef<WebGLRenderer | null>(null);
      const labelRendererRef = useRef<CSS2DRenderer | null>(null);
      const sceneRef = useRef<Scene | null>(null);
      const cameraRef = useRef<PerspectiveCamera | null>(null);
      const orbitControlsRef = useRef<OrbitControls | null>(null);
      const meshRef = useRef<Mesh | null>(null);
      const animationFrameIdRef = useRef<number | null>(null);

      useEffect(() => {
        const currentContainer = containerRef.current;
        if (!currentContainer) return;

        let scene: Scene, camera: PerspectiveCamera, webGLRenderer: WebGLRenderer, css2DRenderer: CSS2DRenderer, orbitControls: OrbitControls;

        if (!rendererRef.current) {
          const visualization = setupPrismVisualization(currentContainer);
          rendererRef.current = visualization.webGLRenderer;
          labelRendererRef.current = visualization.css2DRenderer;
          sceneRef.current = visualization.scene;
          cameraRef.current = visualization.camera;
          orbitControlsRef.current = visualization.orbitControls;
        }
        
        webGLRenderer = rendererRef.current;
        css2DRenderer = labelRendererRef.current;
        scene = sceneRef.current;
        camera = cameraRef.current;
        orbitControls = orbitControlsRef.current;

        if (!webGLRenderer || !css2DRenderer || !scene || !camera || !orbitControls) {
            console.error("Three.js core components not initialized for TrapezoidalPrism!");
            return;
        }

        // Dispose of old mesh and its labels
        if (meshRef.current) {
          scene.remove(meshRef.current);
          if (meshRef.current.geometry) meshRef.current.geometry.dispose();
          if (meshRef.current.material instanceof Material) {
            meshRef.current.material.dispose();
          } else if (Array.isArray(meshRef.current.material)) {
            meshRef.current.material.forEach(material => material.dispose());
          }
          // More specific cleanup for labels if they are direct children or in a known group
          const labelsGroup = scene.getObjectByName('labelsGroup') as Group;
          if (labelsGroup) {
              while (labelsGroup.children.length > 0) {
                  const child = labelsGroup.children[0];
                  labelsGroup.remove(child);
                  if (child instanceof CSS2DObject) {
                      if (child.element && child.element.parentNode) {
                          child.element.parentNode.removeChild(child.element);
                      }
                  }
              }
              scene.remove(labelsGroup); // Remove the group itself if it's recreated each time
          }
          meshRef.current = null;
        }

        const prismGeometry = createTrapezoidalPrismGeometry(dimensions, isUnfolded);
        const newMesh = createTrapezoidalPrismMesh(prismGeometry, visualStyle, isUnfolded);
        scene.add(newMesh);
        meshRef.current = newMesh;

        updateTrapezoidalLabels(dimensions, scene, newMesh, isUnfolded, labelConfig, calculations, visualStyle);

        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
        }
        const animate = createPrismAnimationLoop(orbitControls, webGLRenderer, css2DRenderer, scene, camera);
        const runAnimation = () => {
            animate();
            animationFrameIdRef.current = requestAnimationFrame(runAnimation);
        };
        runAnimation();

        const handleResize = createResizeHandler(currentContainer, camera, webGLRenderer, css2DRenderer);
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
          }

          if (meshRef.current) {
            scene.remove(meshRef.current);
            if (meshRef.current.geometry) meshRef.current.geometry.dispose();
            if (meshRef.current.material instanceof Material) {
              meshRef.current.material.dispose();
            } else if (Array.isArray(meshRef.current.material)) {
              meshRef.current.material.forEach(material => material.dispose());
            }
            meshRef.current = null;
          }
          
          // Cleanup labels group again, as it might be recreated by updateTrapezoidalLabels
          const labelsGroupOnCleanup = scene.getObjectByName('labelsGroup') as Group;
          if (labelsGroupOnCleanup) {
              while (labelsGroupOnCleanup.children.length > 0) {
                  const child = labelsGroupOnCleanup.children[0];
                  labelsGroupOnCleanup.remove(child);
                  if (child instanceof CSS2DObject) {
                      if (child.element && child.element.parentNode) {
                          child.element.parentNode.removeChild(child.element);
                      }
                  }
              }
              scene.remove(labelsGroupOnCleanup);
          }
        };
      }, [containerRef, dimensions, isUnfolded, visualStyle, labelConfig, calculations]);

      // Effect for final cleanup of renderers when the component unmounts
      useEffect(() => {
        const currentRenderer = rendererRef.current;
        const currentLabelRenderer = labelRendererRef.current;
        const currentContainer = containerRef.current;

        return () => {
            if (currentRenderer) {
                currentRenderer.dispose();
                if (currentContainer && currentRenderer.domElement.parentNode === currentContainer) {
                    currentContainer.removeChild(currentRenderer.domElement);
                }
            }
            if (currentLabelRenderer && currentLabelRenderer.domElement.parentNode) {
                // Check parentNode before removal, as currentContainer might not be its direct parent
                currentLabelRenderer.domElement.remove();
            }
        };
      }, [containerRef]); // Only depends on containerRef for final cleanup
    }
    ```
5.  **Testing**: Manually test or run existing tests.

**Step 3.2: Update `TrapezoidalPrism.tsx` to Use the Custom Hook**
1.  **Action**: In `TrapezoidalPrism.tsx`:
    *   Import `useTrapezoidalPrismEffects` from `./useTrapezoidalPrismEffects.ts`.
    *   Remove the `useRef` declarations for `rendererRef`, `labelRendererRef`, `sceneRef`, `cameraRef`, `meshRef`, and `_edgesRef` (if `_edgesRef` is not used elsewhere).
    *   Remove both `useEffect` hooks entirely.
    *   Call the custom hook:
        ```tsx
        // filepath: src/components/Prism/TrapezoidalPrism.tsx
        import React, { useRef } from 'react';
        import { 
          TrapezoidalPrismProps, 
          DEFAULT_TRAPEZOIDAL_LABEL_CONFIG // Or your chosen default config
        } from './trapezoidalPrism.types';
        import { useTrapezoidalPrismEffects } from './useTrapezoidalPrismEffects';
        // Remove other Three.js direct imports if no longer needed here
        // Remove utility function imports if they are only called within the hook

        const TrapezoidalPrism: React.FC<TrapezoidalPrismProps> = ({
          dimensions,
          isUnfolded = false,
          visualStyle = 'solid', // Ensure VisualStyle type is available
          labelConfig = DEFAULT_TRAPEZOIDAL_LABEL_CONFIG,
          calculations,
        }) => {
          const containerRef = useRef<HTMLDivElement>(null);

          useTrapezoidalPrismEffects(
            containerRef,
            dimensions,
            isUnfolded,
            visualStyle,
            labelConfig,
            calculations
          );

          return (
            <div
              ref={containerRef}
              style={{ width: '100%', height: '400px', position: 'relative' }}
            />
          );
        };

        export default TrapezoidalPrism;
        ```
2.  **Action**: Clean up any unused imports from `TrapezoidalPrism.tsx`.
3.  **Testing**: Manually test or run existing tests. The trapezoidal prism visualization should function as before.

---

## Phase 4: Review and Final Touches

**Goal**: Ensure the refactoring of `TrapezoidalPrism.tsx` is clean and all parts are working correctly.

**Step 4.1: Code Review**
1.  **Action**: Review `TrapezoidalPrism.tsx`, `trapezoidalPrism.types.ts`, `trapezoidalLabelUpdater.ts`, and `useTrapezoidalPrismEffects.ts`.
2.  **Check**:
    *   Clarity and readability.
    *   Correctness of dependencies in hooks.
    *   Proper resource disposal in all cleanup functions (especially for Three.js objects, labels, and renderers).
    *   No redundant code.
    *   Consistent import paths and naming conventions.
    *   Ensure types imported from `../../app/components/standalone/trapezoidal-prism/types` are still appropriate or if some should be made more generic/local.

**Step 4.2: Final Testing**
1.  **Action**: Perform thorough testing of all `TrapezoidalPrism` functionalities:
    *   Initial rendering.
    *   Updates when `dimensions` change.
    *   Updates when `isUnfolded` changes.
    *   Updates when `visualStyle` changes.
    *   Updates when `labelConfig` changes.
    *   Updates when `calculations` change.
    *   Window resizing.
    *   Component unmounting (check for console errors related to cleanup or memory leaks).

This plan provides a structured approach to refactoring `TrapezoidalPrism.tsx`. Remember to commit changes after each successful and tested step.
```<!-- filepath: /Users/rei/Documents/code/js-projects/remaths/specs/refactoring-for-modularity.md -->
// ...existing code...
This plan provides a structured approach to refactoring `Prism.tsx`. Remember to commit changes after each successful and tested step.


# Refactoring Plan: Modularizing `src/components/Prism/TrapezoidalPrism.tsx`

**Objective**: Refactor `src/components/Prism/TrapezoidalPrism.tsx` into smaller, more focused modules (utility functions and custom React hooks) to improve modularity, readability, maintainability, and testability, mirroring the approach used for `Prism.tsx`.

**Guiding Principles**:
*   Each step should be small, isolated, and independently testable.
*   Maintain existing functionality after each step. Verify with existing tests if available, or by manual testing.
*   Follow React best practices, especially for custom hooks and dependency management.
*   Ensure proper cleanup of Three.js resources to prevent memory leaks.
*   Adapt paths and type names as necessary for the trapezoidal prism context.

---

## Phase 1: Extract Types

**Goal**: Move type definitions specific to `TrapezoidalPrism` into a dedicated file.

**Step 1.1: Create `trapezoidalPrism.types.ts` for Type Definitions**
1.  **Action**: Create a new file: `src/components/Prism/trapezoidalPrism.types.ts`.
2.  **Action**: Move the `TrapezoidalPrismProps` interface definition from `TrapezoidalPrism.tsx` to `trapezoidalPrism.types.ts`.
    *   Note: `TrapezoidalPrismDimensions`, `VisualStyle`, `LabelConfig`, and `TrapezoidalPrismCalculations` are currently imported from `../../app/components/standalone/trapezoidal-prism/types`. We will keep these imports as is in `trapezoidalPrism.types.ts` for now, or consider moving/re-exporting them if a more centralized type management is desired later. For this refactor, we'll focus on `TrapezoidalPrismProps`.
3.  **Action**: Export `TrapezoidalPrismProps` from `trapezoidalPrism.types.ts`.
    ```typescript
    // filepath: src/components/Prism/trapezoidalPrism.types.ts
    import { 
        TrapezoidalPrismDimensions, 
        VisualStyle, 
        LabelConfig, 
        TrapezoidalPrismCalculations 
    } from '../../app/components/standalone/trapezoidal-prism/types';

    export interface TrapezoidalPrismProps {
      dimensions: TrapezoidalPrismDimensions;
      isUnfolded?: boolean;
      visualStyle: VisualStyle; // Assuming VisualStyle is generic enough or defined in the imported types
      labelConfig?: LabelConfig; // Assuming LabelConfig is generic enough or defined in the imported types
      calculations?: TrapezoidalPrismCalculations;
    }

    // It might be beneficial to re-export shared types if they are used by other components in this module
    export type { 
        TrapezoidalPrismDimensions, 
        VisualStyle, 
        LabelConfig, 
        TrapezoidalPrismCalculations 
    };
    ```
4.  **Update `TrapezoidalPrism.tsx`**:
    *   Remove the local definition of `TrapezoidalPrismProps`.
    *   Import `TrapezoidalPrismProps` from `./trapezoidalPrism.types.ts`.
        ```tsx
        // filepath: src/components/Prism/TrapezoidalPrism.tsx
        // ... other imports ...
        import { TrapezoidalPrismProps } from './trapezoidalPrism.types';
        import { 
          TrapezoidalPrismDimensions, 
          VisualStyle, 
          LabelConfig, 
          TrapezoidalPrismCalculations 
        } from '../../app/components/standalone/trapezoidal-prism/types'; // Keep these if not re-exported and used directly
        // ... rest of the file ...
        ```
5.  **Testing**: Manually test or run existing tests to ensure no regressions related to type definitions.

**Step 1.2: Define and Export `DEFAULT_TRAPEZOIDAL_LABEL_CONFIG` (Optional but Recommended)**
1.  **Action**: If `TrapezoidalPrism.tsx` uses a specific default for `labelConfig` that differs from a global default, define it in `trapezoidalPrism.types.ts`. The current `TrapezoidalPrism.tsx` defines it inline: `{ showVolume: true, showSurfaceArea: false, showFaces: false }`.
2.  **Action**: Create and export `DEFAULT_TRAPEZOIDAL_LABEL_CONFIG` from `trapezoidalPrism.types.ts`.
    ```typescript
    // filepath: src/components/Prism/trapezoidalPrism.types.ts
    // ... existing types ...
    import { LabelConfig } from '../../app/components/standalone/trapezoidal-prism/types'; // Ensure LabelConfig is imported

    export const DEFAULT_TRAPEZOIDAL_LABEL_CONFIG: LabelConfig = {
      showVolume: true,
      showSurfaceArea: false,
      showFaces: false,
      // Add other fields if LabelConfig has more and they need defaults
    };
    ```
3.  **Update `TrapezoidalPrism.tsx`**:
    *   Import `DEFAULT_TRAPEZOIDAL_LABEL_CONFIG` from `./trapezoidalPrism.types.ts`.
    *   Use it as the default value for the `labelConfig` prop.
        ```tsx
        // filepath: src/components/Prism/TrapezoidalPrism.tsx
        // ... other imports ...
        import { TrapezoidalPrismProps, DEFAULT_TRAPEZOIDAL_LABEL_CONFIG } from './trapezoidalPrism.types';
        // ...

        const TrapezoidalPrism: React.FC<TrapezoidalPrismProps> = ({ 
          // ...
          labelConfig = DEFAULT_TRAPEZOIDAL_LABEL_CONFIG,
          // ...
        }) => {
          // ...
        };
        ```
4.  **Testing**: Manually test or run existing tests.

---

## Phase 2: Extract `updateLabels` Function

**Goal**: Move the `updateLabels` function specific to the trapezoidal prism into its own utility file.

**Step 2.1: Create `trapezoidalLabelUpdater.ts` and Move Function**
1.  **Action**: Create a new file: `src/components/Prism/trapezoidalLabelUpdater.ts`.
2.  **Action**: Move the entire `updateLabels` function definition from `TrapezoidalPrism.tsx` to `trapezoidalLabelUpdater.ts`.
3.  **Action**: In `trapezoidalLabelUpdater.ts`, add all necessary imports. These will include:
    *   Three.js elements: `Scene`, `Mesh`, `Vector3` (from `../../utils/threejs/imports`).
    *   Types: `TrapezoidalPrismDimensions`, `LabelConfig`, `TrapezoidalPrismCalculations`, `VisualStyle` (from `../../app/components/standalone/trapezoidal-prism/types` or re-exported from `./trapezoidalPrism.types.ts`).
    *   Utility functions: `setupLabelsGroup`, `createTrapezoidalPrismLabel` (from `../../utils/threejs/labelUtils`).
4.  **Action**: Export the `updateLabels` function from `trapezoidalLabelUpdater.ts`.
    ```typescript
    // filepath: src/components/Prism/trapezoidalLabelUpdater.ts
    import { Scene, Mesh, Vector3 } from '../../utils/threejs/imports';
    import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'; // If createTrapezoidalPrismLabel returns CSS2DObject and it's used here
    import { 
        TrapezoidalPrismDimensions, 
        LabelConfig, 
        TrapezoidalPrismCalculations,
        VisualStyle 
    } from '../../app/components/standalone/trapezoidal-prism/types';
    import { setupLabelsGroup, createTrapezoidalPrismLabel } from '../../utils/threejs/labelUtils';

    // The entire updateLabels function code for TrapezoidalPrism goes here...
    export function updateTrapezoidalLabels(
      dimensions: TrapezoidalPrismDimensions,
      scene: Scene,
      mesh: Mesh, // mesh parameter was `_mesh` suggesting it might not be fully used. Review usage.
      isUnfolded: boolean,
      labelConfig: LabelConfig, // Consider using the imported DEFAULT_TRAPEZOIDAL_LABEL_CONFIG if applicable for default
      calculations?: TrapezoidalPrismCalculations,
      visualStyle: VisualStyle // visualStyle parameter was `_visualStyle`. Review usage.
    ): void {
      // ... function body ...
    }
    ```
    *   **Note**: The function has been renamed to `updateTrapezoidalLabels` for clarity. Adjust calls accordingly.
5.  **Update `TrapezoidalPrism.tsx`**:
    *   Remove the local `updateLabels` function definition.
    *   Import `updateTrapezoidalLabels` from `./trapezoidalLabelUpdater.ts`.
        ```tsx
        // filepath: src/components/Prism/TrapezoidalPrism.tsx
        // ... other imports ...
        import { updateTrapezoidalLabels } from './trapezoidalLabelUpdater';
        // ... rest of the file ...
        ```
    *   Ensure the calls to `updateTrapezoidalLabels` (previously `updateLabels`) within the `useEffect` hooks in `TrapezoidalPrism.tsx` are still correct.
        ```tsx
        // filepath: src/components/Prism/TrapezoidalPrism.tsx
        // ...
        // Inside the first useEffect:
        updateTrapezoidalLabels(dimensions, scene, mesh, isUnfolded, labelConfig, calculations, visualStyle);
        // ...
        // Inside the second useEffect:
        updateTrapezoidalLabels(dimensions, sceneRef.current, newMesh, isUnfolded, labelConfig, calculations, visualStyle);
        // ...
        ```
6.  **Testing**: Manually test or run existing tests. Labeling functionality should remain unchanged.

---

## Phase 3: Create Custom Hook `useTrapezoidalPrismEffects`

**Goal**: Encapsulate the Three.js setup, mesh updates, animation, and cleanup logic for the trapezoidal prism within a custom hook.

**Step 3.1: Create `useTrapezoidalPrismEffects.ts` and Define the Hook**
1.  **Action**: Create a new file: `src/components/Prism/useTrapezoidalPrismEffects.ts`.
2.  **Action**: Define the custom hook `useTrapezoidalPrismEffects`.
    *   It will accept: `containerRef: React.RefObject<HTMLDivElement>`, `dimensions: TrapezoidalPrismDimensions`, `isUnfolded: boolean`, `visualStyle: VisualStyle`, `labelConfig: LabelConfig`, `calculations?: TrapezoidalPrismCalculations`.
    *   It will internally manage `useRef` for `webGLRenderer`, `css2DRenderer`, `scene`, `camera`, `orbitControls`, and `meshRef`.
3.  **Action**: Move the combined logic of both `useEffect` hooks from `TrapezoidalPrism.tsx` into a single `useEffect` within `useTrapezoidalPrismEffects.ts`.
    *   The dependencies for this `useEffect` will be `[containerRef, dimensions, isUnfolded, visualStyle, labelConfig, calculations]`.
    *   **Initial Setup**: Similar to `usePrismEffects`, using `setupPrismVisualization`, `createPrismAnimationLoop`, `createResizeHandler`.
    *   **Mesh Creation/Update**:
        *   Dispose of old mesh.
        *   Use `createTrapezoidalPrismGeometry` and `createTrapezoidalPrismMesh`.
        *   Call `updateTrapezoidalLabels`.
    *   **Cleanup Function**: Similar to `usePrismEffects`, ensuring all resources specific to the trapezoidal prism (mesh, labels, renderers, event listeners) are cleaned up.
4.  **Action**: Ensure all necessary imports are added to `useTrapezoidalPrismEffects.ts`.
    ```typescript
    // filepath: src/components/Prism/useTrapezoidalPrismEffects.ts
    import React, { useEffect, useRef, RefObject } from 'react';
    import { WebGLRenderer, Scene, PerspectiveCamera, Mesh, Material, Group, LineSegments } from '../../utils/threejs/imports';
    import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
    import { 
        TrapezoidalPrismDimensions, 
        VisualStyle, 
        LabelConfig, 
        TrapezoidalPrismCalculations 
    } from '../../app/components/standalone/trapezoidal-prism/types';
    import { updateTrapezoidalLabels } from './trapezoidalLabelUpdater';
    import { createTrapezoidalPrismGeometry } from '../../utils/threejs/geometryCalculations';
    import { createTrapezoidalPrismMesh } from '../../utils/threejs/meshCreation';
    import { setupPrismVisualization, createPrismAnimationLoop, createResizeHandler } from '../../utils/threejs/sceneSetup'; // Assuming these are generic enough

    export function useTrapezoidalPrismEffects(
      containerRef: RefObject<HTMLDivElement>,
      dimensions: TrapezoidalPrismDimensions,
      isUnfolded: boolean,
      visualStyle: VisualStyle,
      labelConfig: LabelConfig,
      calculations?: TrapezoidalPrismCalculations
    ) {
      const rendererRef = useRef<WebGLRenderer | null>(null);
      const labelRendererRef = useRef<CSS2DRenderer | null>(null);
      const sceneRef = useRef<Scene | null>(null);
      const cameraRef = useRef<PerspectiveCamera | null>(null);
      const orbitControlsRef = useRef<OrbitControls | null>(null);
      const meshRef = useRef<Mesh | null>(null);
      const animationFrameIdRef = useRef<number | null>(null);

      useEffect(() => {
        const currentContainer = containerRef.current;
        if (!currentContainer) return;

        let scene: Scene, camera: PerspectiveCamera, webGLRenderer: WebGLRenderer, css2DRenderer: CSS2DRenderer, orbitControls: OrbitControls;

        if (!rendererRef.current) {
          const visualization = setupPrismVisualization(currentContainer);
          rendererRef.current = visualization.webGLRenderer;
          labelRendererRef.current = visualization.css2DRenderer;
          sceneRef.current = visualization.scene;
          cameraRef.current = visualization.camera;
          orbitControlsRef.current = visualization.orbitControls;
        }
        
        webGLRenderer = rendererRef.current;
        css2DRenderer = labelRendererRef.current;
        scene = sceneRef.current;
        camera = cameraRef.current;
        orbitControls = orbitControlsRef.current;

        if (!webGLRenderer || !css2DRenderer || !scene || !camera || !orbitControls) {
            console.error("Three.js core components not initialized for TrapezoidalPrism!");
            return;
        }

        // Dispose of old mesh and its labels
        if (meshRef.current) {
          scene.remove(meshRef.current);
          if (meshRef.current.geometry) meshRef.current.geometry.dispose();
          if (meshRef.current.material instanceof Material) {
            meshRef.current.material.dispose();
          } else if (Array.isArray(meshRef.current.material)) {
            meshRef.current.material.forEach(material => material.dispose());
          }
          // More specific cleanup for labels if they are direct children or in a known group
          const labelsGroup = scene.getObjectByName('labelsGroup') as Group;
          if (labelsGroup) {
              while (labelsGroup.children.length > 0) {
                  const child = labelsGroup.children[0];
                  labelsGroup.remove(child);
                  if (child instanceof CSS2DObject) {
                      if (child.element && child.element.parentNode) {
                          child.element.parentNode.removeChild(child.element);
                      }
                  }
              }
              scene.remove(labelsGroup); // Remove the group itself if it's recreated each time
          }
          meshRef.current = null;
        }

        const prismGeometry = createTrapezoidalPrismGeometry(dimensions, isUnfolded);
        const newMesh = createTrapezoidalPrismMesh(prismGeometry, visualStyle, isUnfolded);
        scene.add(newMesh);
        meshRef.current = newMesh;

        updateTrapezoidalLabels(dimensions, scene, newMesh, isUnfolded, labelConfig, calculations, visualStyle);

        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
        }
        const animate = createPrismAnimationLoop(orbitControls, webGLRenderer, css2DRenderer, scene, camera);
        const runAnimation = () => {
            animate();
            animationFrameIdRef.current = requestAnimationFrame(runAnimation);
        };
        runAnimation();

        const handleResize = createResizeHandler(currentContainer, camera, webGLRenderer, css2DRenderer);
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
          }

          if (meshRef.current) {
            scene.remove(meshRef.current);
            if (meshRef.current.geometry) meshRef.current.geometry.dispose();
            if (meshRef.current.material instanceof Material) {
              meshRef.current.material.dispose();
            } else if (Array.isArray(meshRef.current.material)) {
              meshRef.current.material.forEach(material => material.dispose());
            }
            meshRef.current = null;
          }
          
          // Cleanup labels group again, as it might be recreated by updateTrapezoidalLabels
          const labelsGroupOnCleanup = scene.getObjectByName('labelsGroup') as Group;
          if (labelsGroupOnCleanup) {
              while (labelsGroupOnCleanup.children.length > 0) {
                  const child = labelsGroupOnCleanup.children[0];
                  labelsGroupOnCleanup.remove(child);
                  if (child instanceof CSS2DObject) {
                      if (child.element && child.element.parentNode) {
                          child.element.parentNode.removeChild(child.element);
                      }
                  }
              }
              scene.remove(labelsGroupOnCleanup);
          }
        };
      }, [containerRef, dimensions, isUnfolded, visualStyle, labelConfig, calculations]);

      // Effect for final cleanup of renderers when the component unmounts
      useEffect(() => {
        const currentRenderer = rendererRef.current;
        const currentLabelRenderer = labelRendererRef.current;
        const currentContainer = containerRef.current;

        return () => {
            if (currentRenderer) {
                currentRenderer.dispose();
                if (currentContainer && currentRenderer.domElement.parentNode === currentContainer) {
                    currentContainer.removeChild(currentRenderer.domElement);
                }
            }
            if (currentLabelRenderer && currentLabelRenderer.domElement.parentNode) {
                // Check parentNode before removal, as currentContainer might not be its direct parent
                currentLabelRenderer.domElement.remove();
            }
        };
      }, [containerRef]); // Only depends on containerRef for final cleanup
    }
    ```
5.  **Testing**: Manually test or run existing tests.

**Step 3.2: Update `TrapezoidalPrism.tsx` to Use the Custom Hook**
1.  **Action**: In `TrapezoidalPrism.tsx`:
    *   Import `useTrapezoidalPrismEffects` from `./useTrapezoidalPrismEffects.ts`.
    *   Remove the `useRef` declarations for `rendererRef`, `labelRendererRef`, `sceneRef`, `cameraRef`, `meshRef`, and `_edgesRef` (if `_edgesRef` is not used elsewhere).
    *   Remove both `useEffect` hooks entirely.
    *   Call the custom hook:
        ```tsx
        // filepath: src/components/Prism/TrapezoidalPrism.tsx
        import React, { useRef } from 'react';
        import { 
          TrapezoidalPrismProps, 
          DEFAULT_TRAPEZOIDAL_LABEL_CONFIG // Or your chosen default config
        } from './trapezoidalPrism.types';
        import { useTrapezoidalPrismEffects } from './useTrapezoidalPrismEffects';
        // Remove other Three.js direct imports if no longer needed here
        // Remove utility function imports if they are only called within the hook

        const TrapezoidalPrism: React.FC<TrapezoidalPrismProps> = ({
          dimensions,
          isUnfolded = false,
          visualStyle = 'solid', // Ensure VisualStyle type is available
          labelConfig = DEFAULT_TRAPEZOIDAL_LABEL_CONFIG,
          calculations,
        }) => {
          const containerRef = useRef<HTMLDivElement>(null);

          useTrapezoidalPrismEffects(
            containerRef,
            dimensions,
            isUnfolded,
            visualStyle,
            labelConfig,
            calculations
          );

          return (
            <div
              ref={containerRef}
              style={{ width: '100%', height: '400px', position: 'relative' }}
            />
          );
        };

        export default TrapezoidalPrism;
        ```
2.  **Action**: Clean up any unused imports from `TrapezoidalPrism.tsx`.
3.  **Testing**: Manually test or run existing tests. The trapezoidal prism visualization should function as before.

---

## Phase 4: Review and Final Touches

**Goal**: Ensure the refactoring of `TrapezoidalPrism.tsx` is clean and all parts are working correctly.

**Step 4.1: Code Review**
1.  **Action**: Review `TrapezoidalPrism.tsx`, `trapezoidalPrism.types.ts`, `trapezoidalLabelUpdater.ts`, and `useTrapezoidalPrismEffects.ts`.
2.  **Check**:
    *   Clarity and readability.
    *   Correctness of dependencies in hooks.
    *   Proper resource disposal in all cleanup functions (especially for Three.js objects, labels, and renderers).
    *   No redundant code.
    *   Consistent import paths and naming conventions.
    *   Ensure types imported from `../../app/components/standalone/trapezoidal-prism/types` are still appropriate or if some should be made more generic/local.

**Step 4.2: Final Testing**
1.  **Action**: Perform thorough testing of all `TrapezoidalPrism` functionalities:
    *   Initial rendering.
    *   Updates when `dimensions` change.
    *   Updates when `isUnfolded` changes.
    *   Updates when `visualStyle` changes.
    *   Updates when `labelConfig` changes.
    *   Updates when `calculations` change.
    *   Window resizing.
    *   Component unmounting (check for console errors related to cleanup or memory leaks).

This plan provides a structured approach to refactoring `TrapezoidalPrism.tsx`. Remember to commit changes after each successful and tested step.