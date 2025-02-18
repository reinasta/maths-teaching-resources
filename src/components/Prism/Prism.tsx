import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { PrismDimensions } from '../../app/components/standalone/prism/types';

interface PrismProps {
  dimensions: PrismDimensions;
  isUnfolded: boolean;
}

const Prism: React.FC<PrismProps> = ({ dimensions, isUnfolded }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const labelsRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0); // Light gray background
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    // Position camera for a 3/4 view of the top face
    camera.position.set(4, 4, 3);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup CSS2D renderer for labels
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    containerRef.current.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minPolarAngle = Math.PI / 6; // Limit how low user can orbit
    controls.maxPolarAngle = Math.PI * 0.8; // Limit how high user can orbit
    controls.minDistance = 3; // Limit how close user can zoom
    controls.maxDistance = 10; // Limit how far user can zoom
    controlsRef.current = controls;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Create initial prism
    const prismGeometry = createPrismGeometry(dimensions);
    const prismMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    
    const mesh = new THREE.Mesh(prismGeometry, prismMaterial);
    scene.add(mesh);
    meshRef.current = mesh;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      labelRenderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      labelRenderer.domElement.remove();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      if (labelsRef.current) {
        labelsRef.current.children.forEach(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      }
    };
  }, []);

  // Single effect to handle both geometry and label updates
  useEffect(() => {
    if (!meshRef.current) return;
    
    // Update geometry
    const newGeometry = createPrismGeometry(dimensions);
    meshRef.current.geometry.dispose();
    meshRef.current.geometry = newGeometry;
    
    // Update labels
    updateLabels(dimensions, sceneRef.current!, meshRef.current);
  }, [dimensions]);

  return <div ref={containerRef} style={{ width: '100%', height: '400px', position: 'relative' }} />;
};

function updateLabels(dimensions: PrismDimensions, scene: THREE.Scene, mesh: THREE.Mesh): void {
  // Clear ALL existing labels
  while (mesh.children.length > 0) {
    const child = mesh.children[0];
    mesh.remove(child);
    if (child instanceof CSS2DObject) {
      child.element.remove();
    }
  }

  const { sideA, sideB, sideC, height } = dimensions;
  const triangle = calculateTriangleVertices(sideA, sideB, sideC);

  // Create and position labels
  const createLabel = (position: THREE.Vector3, text: string) => {
    const div = document.createElement('div');
    div.className = 'annotation';
    div.textContent = text;
    
    const label = new CSS2DObject(div);
    label.position.copy(position);
    label.position.y += 0.2; // Changed from -= to += to offset above the edge
    
    mesh.add(label);
  };

  // Vertices for top face
  const v1 = new THREE.Vector3(triangle[0].x, height, triangle[0].y);
  const v2 = new THREE.Vector3(triangle[1].x, height, triangle[1].y);
  const v3 = new THREE.Vector3(triangle[2].x, height, triangle[2].y);

  // Calculate midpoints for top edges
  const midpointA = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
  const midpointB = new THREE.Vector3().addVectors(v2, v3).multiplyScalar(0.5);
  const midpointC = new THREE.Vector3().addVectors(v3, v1).multiplyScalar(0.5);

  // Calculate height label position (at the rightmost vertical edge)
  // Get bottom and top points of the rightmost vertical edge
  const bottomRight = new THREE.Vector3(triangle[1].x, 0, triangle[1].y);
  const topRight = new THREE.Vector3(triangle[1].x, height, triangle[1].y);
  // Calculate midpoint of the edge
  const heightMidpoint = new THREE.Vector3()
    .addVectors(bottomRight, topRight)
    .multiplyScalar(0.5);
  // Add small offset to the right
  const heightOffset = new THREE.Vector3(0.3, 0, 0);
  const heightPos = heightMidpoint.add(heightOffset);

  // Create label texts
  const textA = `A: ${sideA.toFixed(1)}`;
  const textB = `B: ${sideB.toFixed(1)}`;
  const textC = `C: ${sideC.toFixed(1)}`;
  const textH = `H: ${height.toFixed(1)}`;
  
  // Add labels
  createLabel(midpointA, textA);
  createLabel(midpointB, textB);
  createLabel(midpointC, textC);
  createLabel(heightPos, textH);
}

// Helper function to calculate triangle vertices
function calculateTriangleVertices(a: number, b: number, c: number): [THREE.Vector2, THREE.Vector2, THREE.Vector2] {
  // Place first point at origin
  const v1 = new THREE.Vector2(0, 0);
  
  // Place second point along x-axis
  const v2 = new THREE.Vector2(a, 0);
  
  // Calculate third point using cosine law
  const cosC = (a * a + b * b - c * c) / (2 * a * b);
  const sinC = Math.sqrt(1 - cosC * cosC);
  const v3 = new THREE.Vector2(
    b * cosC,
    b * sinC
  );

  return [v1, v2, v3];
}

function createPrismGeometry(dimensions: PrismDimensions): THREE.BufferGeometry {
  const { sideA, sideB, sideC, height } = dimensions;

  // Calculate triangle vertices (first point will be at origin)
  const triangle = calculateTriangleVertices(sideA, sideB, sideC);
  
  // Create vertices array for prism, using original coordinates
  const vertices = [
    // Bottom face
    ...triangle.map(v => [v.x, 0, v.y]).flat(),
    // Top face
    ...triangle.map(v => [v.x, height, v.y]).flat(),
  ];

  // Rest remains the same
  const indices = [
    // Bottom face
    0, 1, 2,
    // Top face
    3, 4, 5,
    // Side faces
    0, 3, 1, 1, 3, 4,
    1, 4, 2, 2, 4, 5,
    2, 5, 0, 0, 5, 3,
  ];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export default Prism;