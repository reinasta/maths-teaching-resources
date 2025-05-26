// Common Three.js scene setup utilities
import { 
  PerspectiveCamera, 
  Scene, 
  WebGLRenderer, 
  AmbientLight, 
  DirectionalLight, 
  Color, 
  Camera 
} from './imports';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';

/**
 * Creates a standard camera configuration for prism visualizations
 */
export function createPrismCamera(aspect: number): PerspectiveCamera {
  const camera = new PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.set(5, 5, 4);
  camera.lookAt(0, 0, 0);
  return camera;
}

/**
 * Creates standard lighting setup for prism scenes
 */
export function setupPrismLighting(scene: Scene): void {
  const ambientLight = new AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);

  const directionalLight2 = new DirectionalLight(0xffffff, 0.3);
  directionalLight2.position.set(-5, 3, -10);
  scene.add(directionalLight2);
}

/**
 * Creates standard orbit controls for prism visualizations
 */
export function createPrismOrbitControls(
  camera: Camera, 
  domElement: HTMLElement
): OrbitControls {
  const orbitControls = new OrbitControls(camera, domElement);
  orbitControls.enableDamping = true;
  orbitControls.minPolarAngle = Math.PI / 6;
  orbitControls.maxPolarAngle = Math.PI * 0.8;
  orbitControls.minDistance = 3;
  orbitControls.maxDistance = 10;
  return orbitControls;
}

/**
 * Creates and configures CSS2D renderer for labels
 */
export function createCSS2DRenderer(container: HTMLElement): CSS2DRenderer {
  const css2DRenderer = new CSS2DRenderer();
  css2DRenderer.setSize(container.clientWidth, container.clientHeight);
  css2DRenderer.domElement.style.position = 'absolute';
  css2DRenderer.domElement.style.top = '0';
  css2DRenderer.domElement.style.pointerEvents = 'none';
  container.appendChild(css2DRenderer.domElement);
  return css2DRenderer;
}

/**
 * Creates a standard scene with background color
 */
export function createPrismScene(backgroundColor: number = 0xf0f0f0): Scene {
  const scene = new Scene();
  scene.background = new Color(backgroundColor);
  return scene;
}

/**
 * Sets up WebGL renderer with standard configuration
 */
export function createWebGLRenderer(container: HTMLElement): WebGLRenderer {
  const webGLRenderer = new WebGLRenderer({ antialias: true });
  webGLRenderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(webGLRenderer.domElement);
  return webGLRenderer;
}

/**
 * Creates a complete prism visualization setup
 */
export function setupPrismVisualization(container: HTMLElement): {
  scene: Scene;
  camera: PerspectiveCamera;
  webGLRenderer: WebGLRenderer;
  css2DRenderer: CSS2DRenderer;
  orbitControls: OrbitControls;
} {
  const scene = createPrismScene();
  const camera = createPrismCamera(container.clientWidth / container.clientHeight);
  const webGLRenderer = createWebGLRenderer(container);
  const css2DRenderer = createCSS2DRenderer(container);
  const orbitControls = createPrismOrbitControls(camera, webGLRenderer.domElement);
  
  setupPrismLighting(scene);
  
  return {
    scene,
    camera,
    webGLRenderer,
    css2DRenderer,
    orbitControls
  };
}

/**
 * Creates standard animation loop for prism visualizations
 */
export function createPrismAnimationLoop(
  orbitControls: OrbitControls,
  webGLRenderer: WebGLRenderer,
  css2DRenderer: CSS2DRenderer,
  scene: Scene,
  camera: Camera
): () => void {
  const animate = () => {
    requestAnimationFrame(animate);
    orbitControls.update();
    webGLRenderer.render(scene, camera);
    css2DRenderer.render(scene, camera);
  };
  
  return animate;
}

/**
 * Creates a resize handler for responsive prism visualizations
 */
export function createResizeHandler(
  container: HTMLElement,
  camera: PerspectiveCamera,
  webGLRenderer: WebGLRenderer,
  css2DRenderer: CSS2DRenderer
): () => void {
  return () => {
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    webGLRenderer.setSize(width, height);
    css2DRenderer.setSize(width, height);
  };
}
