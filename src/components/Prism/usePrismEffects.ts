import { useEffect, useRef, RefObject } from 'react';
import { 
  WebGLRenderer, 
  Scene, 
  PerspectiveCamera, 
  Mesh, 
  Material,
  LineSegments
} from '../../utils/threejs/imports';
import { CSS2DRenderer, CSS2DObject, OrbitControls } from '../../utils/threejs/imports';
import { PrismDimensions, VisualStyle, LabelConfig } from './prism.types';
import { updateLabels } from './labelUpdater';
import { createPrismGeometry } from '../../utils/threejs/geometryCalculations';
import { createTriangularPrismMesh } from '../../utils/threejs/meshCreation';
import { 
  setupPrismVisualization, 
  createPrismAnimationLoop, 
  createResizeHandler 
} from '../../utils/threejs/sceneSetup';

export function usePrismEffects(
  containerRef: RefObject<HTMLDivElement>,
  dimensions: PrismDimensions,
  isUnfolded: boolean,
  visualStyle: VisualStyle,
  labelConfig: LabelConfig
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

    // Initialize Three.js core components if not already done
    if (!rendererRef.current) {
      const visualization = setupPrismVisualization(currentContainer);
      rendererRef.current = visualization.webGLRenderer;
      labelRendererRef.current = visualization.css2DRenderer;
      sceneRef.current = visualization.scene;
      cameraRef.current = visualization.camera;
      orbitControlsRef.current = visualization.orbitControls;
    }

    const webGLRenderer = rendererRef.current;
    const css2DRenderer = labelRendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const orbitControls = orbitControlsRef.current;

    if (!webGLRenderer || !css2DRenderer || !scene || !camera || !orbitControls) {
      console.error("Three.js core components not initialized!");
      return;
    }

    // Dispose of old mesh
    if (meshRef.current) {
      scene.remove(meshRef.current);
      if (meshRef.current.geometry) meshRef.current.geometry.dispose();
      if (meshRef.current.material instanceof Material) {
        meshRef.current.material.dispose();
      } else if (Array.isArray(meshRef.current.material)) {
        meshRef.current.material.forEach(material => material.dispose());
      }
      meshRef.current.children.forEach(child => {
        if (child instanceof LineSegments) {
          if (child.geometry) child.geometry.dispose();
          if (child.material instanceof Material) child.material.dispose();
        }
        if (child instanceof CSS2DObject) {
          child.element.remove();
        }
      });
      meshRef.current = null;
    }

    // Create and add new mesh
    const prismGeometry = createPrismGeometry(dimensions, isUnfolded);
    const newMesh = createTriangularPrismMesh(prismGeometry, visualStyle, isUnfolded);
    scene.add(newMesh);
    meshRef.current = newMesh;

    updateLabels(dimensions, scene, newMesh, isUnfolded, labelConfig, visualStyle);

    // Animation and resize handling
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

      // Clean up mesh associated with this effect run
      if (meshRef.current && scene) {
        scene.remove(meshRef.current);
        if (meshRef.current.geometry) meshRef.current.geometry.dispose();
        if (meshRef.current.material instanceof Material) {
          meshRef.current.material.dispose();
        } else if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach(material => material.dispose());
        }
        meshRef.current.children.forEach(child => {
          if (child instanceof LineSegments) {
            if (child.geometry) child.geometry.dispose();
            if (child.material instanceof Material) child.material.dispose();
          }
          if (child instanceof CSS2DObject) {
            child.element.remove();
          }
        });
        meshRef.current = null;
      }
    };
  }, [containerRef, dimensions, isUnfolded, visualStyle, labelConfig]);

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
        currentLabelRenderer.domElement.remove();
      }
    };
  }, [containerRef]);
}
