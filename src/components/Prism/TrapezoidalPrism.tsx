import React, { useEffect, useRef } from 'react';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { 
  WebGLRenderer, 
  Scene, 
  PerspectiveCamera, 
  Mesh, 
  Material,
  Vector3, 
  Group,
  LineSegments
} from '../../utils/threejs/imports';
import { createTrapezoidalPrismGeometry } from '../../utils/threejs/geometryCalculations';
import { createTrapezoidalPrismMesh } from '../../utils/threejs/meshCreation';
import { setupLabelsGroup, createTrapezoidalPrismLabel } from '../../utils/threejs/labelUtils';
import { setupPrismVisualization, createPrismAnimationLoop, createResizeHandler } from '../../utils/threejs/sceneSetup';
import { TrapezoidalPrismDimensions, VisualStyle, LabelConfig, TrapezoidalPrismCalculations } from '../../app/components/standalone/trapezoidal-prism/types'; // Ensure types are correctly imported

// Export the interface so it can be imported in test files
export interface TrapezoidalPrismProps {
  dimensions: TrapezoidalPrismDimensions;
  isUnfolded?: boolean;
  visualStyle: VisualStyle;
  labelConfig?: LabelConfig;
  calculations?: TrapezoidalPrismCalculations;
}

const TrapezoidalPrism: React.FC<TrapezoidalPrismProps> = ({ 
  dimensions, 
  isUnfolded = false,
  visualStyle = 'solid',
  labelConfig = { showVolume: true, showSurfaceArea: false, showFaces: false },
  calculations // Destructure calculations
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<WebGLRenderer | null>(null);
    const labelRendererRef = useRef<CSS2DRenderer | null>(null);
    const sceneRef = useRef<Scene | null>(null);
    const cameraRef = useRef<PerspectiveCamera | null>(null);
    const meshRef = useRef<Mesh | null>(null);
    const _edgesRef = useRef<LineSegments | null>(null);

    useEffect(() => {
        const currentContainer = containerRef.current;
        if (!currentContainer) return;

        // Use utility function to set up scene, renderers, camera, and controls
        const { webGLRenderer, css2DRenderer, scene, camera, orbitControls } = setupPrismVisualization(currentContainer);
        
        // Store references for cleanup
        rendererRef.current = webGLRenderer;
        labelRendererRef.current = css2DRenderer;
        sceneRef.current = scene;
        cameraRef.current = camera;

        const prismGeometry = createTrapezoidalPrismGeometry(dimensions, isUnfolded);
        
        const mesh = createTrapezoidalPrismMesh(prismGeometry, visualStyle, isUnfolded);
        scene.add(mesh);
        meshRef.current = mesh;

        updateLabels(dimensions, scene, mesh, isUnfolded, labelConfig, calculations, visualStyle); 

        // Start animation loop using utility function
        const animate = createPrismAnimationLoop(orbitControls, webGLRenderer, css2DRenderer, scene, camera);
        animate();

        // Set up resize handler using utility function
        const handleResize = createResizeHandler(currentContainer, camera, webGLRenderer, css2DRenderer);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (rendererRef.current) rendererRef.current.dispose();
            if (labelRendererRef.current) labelRendererRef.current.domElement.remove();
            
            if (currentContainer && rendererRef.current) {
                // Check if domElement is still a child before removing
                if (rendererRef.current.domElement.parentNode === currentContainer) {
                    currentContainer.removeChild(rendererRef.current.domElement);
                }
            }

            // Clear labels from the specific group by name
            const groupToRemove = sceneRef.current?.children.find(child => child.name === 'labelsGroup') as Group;
            if (groupToRemove) {
                while (groupToRemove.children.length > 0) {
                    const child = groupToRemove.children[0];
                    groupToRemove.remove(child);
                    if (child instanceof CSS2DObject) {
                        if (child.element && child.element.parentNode) {
                            child.element.parentNode.removeChild(child.element);
                        }
                    }
                }
                sceneRef.current?.remove(groupToRemove);
            }
        };
    }, [dimensions, isUnfolded, visualStyle, labelConfig, calculations]);

    useEffect(() => {
        if (!meshRef.current || !sceneRef.current) return;
        
        const newGeometry = createTrapezoidalPrismGeometry(dimensions, isUnfolded);
        
        if (sceneRef.current && meshRef.current) {
            sceneRef.current.remove(meshRef.current);
            if (meshRef.current.geometry) meshRef.current.geometry.dispose();
            if (meshRef.current.material instanceof Material) {
                meshRef.current.material.dispose();
            } else if (Array.isArray(meshRef.current.material)) {
                meshRef.current.material.forEach(material => material.dispose());
            }
        }
        
        const newMesh = createTrapezoidalPrismMesh(newGeometry, visualStyle, isUnfolded);
        if (sceneRef.current) {
            sceneRef.current.add(newMesh);
            meshRef.current = newMesh;
        }
        
        // Ensure scene and mesh are available for updateLabels
        if (sceneRef.current && meshRef.current) {
             updateLabels(dimensions, sceneRef.current, newMesh, isUnfolded, labelConfig, calculations, visualStyle);
        }
    }, [dimensions, isUnfolded, visualStyle, labelConfig, calculations]);

    return (
        <div 
            ref={containerRef} 
            style={{ width: '100%', height: '400px', position: 'relative' }} 
        />
    );
};

// Improved updateLabels function with better label positioning
function updateLabels(
  dimensions: TrapezoidalPrismDimensions,
  scene: Scene,
  _mesh: Mesh, 
  isUnfolded: boolean,
  labelConfig: LabelConfig = { showVolume: true, showSurfaceArea: false, showFaces: false },
  calculations?: TrapezoidalPrismCalculations,
  _visualStyle: VisualStyle = 'solid'
): void {
  // Use utility function to set up labels group
  const labelsGroup = setupLabelsGroup(scene);

  if (!labelConfig.showVolume && !labelConfig.showSurfaceArea && !labelConfig.showFaces) {
    return;
  }

  const { topWidth, bottomWidth, height, depth: prismDepth } = dimensions; // Renamed depth to prismDepth for clarity

  if (!isUnfolded) {
    // --- FOLDED STATE LOGIC (remains the same) ---
    const yBase = -height / 2;
    const yTop = height / 2;
    const zFront = prismDepth / 2;
    const zBack = -prismDepth / 2;
    const xOffset_bottom_left = -bottomWidth / 2;
    const xOffset_bottom_right = bottomWidth / 2;

    let horiz_proj_left = 0;
    let horiz_proj_right = 0;

    if (calculations) {
      if (calculations.leftSide * calculations.leftSide >= height * height) {
        horiz_proj_left = Math.sqrt(calculations.leftSide * calculations.leftSide - height * height);
      }
      if (calculations.rightSide * calculations.rightSide >= height * height) {
        horiz_proj_right = Math.sqrt(calculations.rightSide * calculations.rightSide - height * height);
      }
    }

    const v_bottom_left_front = new Vector3(xOffset_bottom_left, yBase, zFront);
    const v_bottom_right_front = new Vector3(xOffset_bottom_right, yBase, zFront);
    const v_top_left_front = new Vector3(xOffset_bottom_left + horiz_proj_left, yTop, zFront);
    const v_top_right_front = new Vector3(xOffset_bottom_right - horiz_proj_right, yTop, zFront);

    const v_bottom_left_back = new Vector3(xOffset_bottom_left, yBase, zBack);
    const v_bottom_right_back = new Vector3(xOffset_bottom_right, yBase, zBack);
    const v_top_left_back = new Vector3(xOffset_bottom_left + horiz_proj_left, yTop, zBack);
    const v_top_right_back = new Vector3(xOffset_bottom_right - horiz_proj_right, yTop, zBack);

    if (labelConfig.showSurfaceArea || labelConfig.showVolume) {
      const topEdgeCenter = new Vector3().addVectors(v_top_left_front, v_top_right_front).multiplyScalar(0.5);
      labelsGroup.add(createTrapezoidalPrismLabel(topEdgeCenter, `Wₜ: ${topWidth.toFixed(1)}`, '#0000FF', 'label', new Vector3(0, 0.2, 0)));
      const bottomEdgeCenter = new Vector3().addVectors(v_bottom_left_front, v_bottom_right_front).multiplyScalar(0.5);
      labelsGroup.add(createTrapezoidalPrismLabel(bottomEdgeCenter, `Wᵦ: ${bottomWidth.toFixed(1)}`, '#0000FF', 'label', new Vector3(0, -0.2, 0)));
      const heightLabelX = (v_top_left_front.x < v_bottom_left_front.x ? v_top_left_front.x : v_bottom_left_front.x) - 0.3;
      labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(heightLabelX, 0, zFront), `H: ${height.toFixed(1)}`, '#FF0000', 'label'));
      const depthEdgeCenter = new Vector3().addVectors(v_bottom_left_front, v_bottom_left_back).multiplyScalar(0.5);
      labelsGroup.add(createTrapezoidalPrismLabel(depthEdgeCenter, `D: ${prismDepth.toFixed(1)}`, '#FFA500', 'label', new Vector3(0, -0.2, 0)));

      if (labelConfig.showSurfaceArea) {
        if (!calculations) {
          console.warn('Surface area labels (Sl, Sr) require calculations, but calculations are undefined.');
          labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(0,0,0), "SA calculations missing for Sl/Sr!", "red"));
        } else {
          const { leftSide, rightSide } = calculations;
          const leftSlantedEdgeCenter = new Vector3().addVectors(v_bottom_left_front, v_top_left_front).multiplyScalar(0.5);
          labelsGroup.add(createTrapezoidalPrismLabel(leftSlantedEdgeCenter, `Sₗ: ${leftSide.toFixed(1)}`, '#008000', 'label', new Vector3(-0.2, 0, 0)));
          const rightSlantedEdgeCenter = new Vector3().addVectors(v_bottom_right_front, v_top_right_front).multiplyScalar(0.5);
          labelsGroup.add(createTrapezoidalPrismLabel(rightSlantedEdgeCenter, `Sᵣ: ${rightSide.toFixed(1)}`, '#008000', 'label', new Vector3(0.2, 0, 0)));
        }
      }
    }
    if (labelConfig.showFaces) {
      const faceLabelColor = '#333333';
      labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(0, yBase, 0), "Bottom", faceLabelColor, 'face-label', new Vector3(0, -0.3, 0)));
      const topFaceCenter = new Vector3((v_top_left_front.x+v_top_right_front.x+v_top_left_back.x+v_top_right_back.x)/4, yTop, (v_top_left_front.z+v_top_right_front.z+v_top_left_back.z+v_top_right_back.z)/4);
      labelsGroup.add(createTrapezoidalPrismLabel(topFaceCenter, "Top", faceLabelColor, 'face-label', new Vector3(0, 0.3, 0)));
      const frontFaceCenter = new Vector3().add(v_bottom_left_front).add(v_bottom_right_front).add(v_top_left_front).add(v_top_right_front).multiplyScalar(0.25);
      labelsGroup.add(createTrapezoidalPrismLabel(frontFaceCenter, "Front", faceLabelColor, 'face-label', new Vector3(0, 0, 0.3)));
      const backFaceCenter = new Vector3().add(v_bottom_left_back).add(v_bottom_right_back).add(v_top_left_back).add(v_top_right_back).multiplyScalar(0.25);
      labelsGroup.add(createTrapezoidalPrismLabel(backFaceCenter, "Back", faceLabelColor, 'face-label', new Vector3(0, 0, -0.3)));
      const leftFaceCenter = new Vector3().add(v_bottom_left_front).add(v_top_left_front).add(v_bottom_left_back).add(v_top_left_back).multiplyScalar(0.25);
      labelsGroup.add(createTrapezoidalPrismLabel(leftFaceCenter, "Left Side", faceLabelColor, 'face-label', new Vector3(-0.3, 0, 0)));
      const rightFaceCenter = new Vector3().add(v_bottom_right_front).add(v_top_right_front).add(v_bottom_right_back).add(v_top_right_back).multiplyScalar(0.25);
      labelsGroup.add(createTrapezoidalPrismLabel(rightFaceCenter, "Right Side", faceLabelColor, 'face-label', new Vector3(0.3, 0, 0)));
    }
  } else {
    // --- UNFOLDED STATE LOGIC (Labels in XZ plane, Y is for offset from plane) ---
    const halfBottomWidth = bottomWidth / 2;
    const halfTopWidth = topWidth / 2;
    const halfPrismDepth = prismDepth / 2; // Half of the prism's depth dimension
    const yLabelOffset = 0.1; // All labels slightly above the XZ plane of the net
    const labelOffsetSmall = 0.2; // Small offset for positioning labels away from edges

    // Dimension Labels (Volume or Surface Area)
    if (labelConfig.showSurfaceArea || labelConfig.showVolume) {
      // Bottom Face (Wb, D)
      labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(0, yLabelOffset, halfPrismDepth + labelOffsetSmall), `Wᵦ: ${bottomWidth.toFixed(1)}`, '#0000FF'));
      labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(-halfBottomWidth - labelOffsetSmall, yLabelOffset, 0), `D: ${prismDepth.toFixed(1)}`, '#FFA500'));

      // Front Face (H)
      // Center Z of Front Face: halfPrismDepth + height / 2
      // Place H label to the side of the front face, aligned with its height.
      labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(-halfBottomWidth - labelOffsetSmall, yLabelOffset, halfPrismDepth + height / 2), `H: ${height.toFixed(1)}`, '#FF0000'));

      // Top Face (Wt)
      // Top face is attached to front face, its Z starts at halfPrismDepth + height
      // Center Z of Top Face: halfPrismDepth + height + halfPrismDepth / 2 (if top face rectangle has length `prismDepth`)
      // The top face in the net is a rectangle of topWidth x prismDepth.
      // It starts at Z = halfPrismDepth + height. Its length is prismDepth.
      // So it ends at Z = halfPrismDepth + height + prismDepth.
      // Wt label for Top Face, place it beyond its Z extent.
      labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(0, yLabelOffset, halfPrismDepth + height + halfPrismDepth + labelOffsetSmall), `Wₜ: ${topWidth.toFixed(1)}`, '#0000FF'));

      if (labelConfig.showSurfaceArea) {
        if (!calculations) {
          console.warn('Surface area labels (Sl, Sr) require calculations, but calculations are undefined.');
          labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(0, yLabelOffset, halfPrismDepth + height / 2), "SA calc missing!", "red"));
        } else {
          const { leftSide, rightSide } = calculations;
          // Slanted side labels on the Front Face trapezoid
          // Left slanted side (v4-v7 of geometry): midX = (-hBW-hTW)/2, midZ = hD+H/2
          const slMidX = (-halfBottomWidth - halfTopWidth) / 2;
          const slSrMidZ = halfPrismDepth + height / 2;
          labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(slMidX - labelOffsetSmall, yLabelOffset, slSrMidZ), `Sₗ: ${leftSide.toFixed(1)}`, '#008000'));
          // Right slanted side (v5-v6 of geometry): midX = (hBW+hTW)/2, midZ = hD+H/2
          const srMidX = (halfBottomWidth + halfTopWidth) / 2;
          labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(srMidX + labelOffsetSmall, yLabelOffset, slSrMidZ), `Sᵣ: ${rightSide.toFixed(1)}`, '#008000'));
        }
      }
    }

    // Face Labels (Unfolded)
    if (labelConfig.showFaces) {
      const faceLabelColor = '#333333';

      // Bottom Face (Center X=0, Z=0)
      labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(0, yLabelOffset, 0), "Bottom", faceLabelColor, 'face-label'));

      // Front Face (Center X=0, Z = halfPrismDepth + height/2)
      labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(0, yLabelOffset, halfPrismDepth + height / 2), "Front", faceLabelColor, 'face-label'));

      // Top Face (Center X=0, Z = halfPrismDepth + height + prismDepth/2)
      labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(0, yLabelOffset, halfPrismDepth + height + prismDepth/2), "Top", faceLabelColor, 'face-label'));

      // Back Face (Center X=0, Z = -halfPrismDepth - height/2)
      labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(0, yLabelOffset, -halfPrismDepth - height / 2), "Back", faceLabelColor, 'face-label'));

      // Left Face (Center X = -halfBottomWidth - height/2, Z=0)
      // The width of this unfolded rectangle is `height` (trapezoid height)
      labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(-halfBottomWidth - height/2, yLabelOffset, 0), "Left Side", faceLabelColor, 'face-label'));

      // Right Face (Center X = halfBottomWidth + height/2, Z=0)
      labelsGroup.add(createTrapezoidalPrismLabel(new Vector3(halfBottomWidth + height/2, yLabelOffset, 0), "Right Side", faceLabelColor, 'face-label'));
    }
  }
}

export default TrapezoidalPrism;