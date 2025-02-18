import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { PrismDimensions } from '../../app/components/standalone/prism/types';

interface PrismProps {
  dimensions: PrismDimensions;
  isUnfolded?: boolean;
}

const Prism: React.FC<PrismProps> = ({ dimensions }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const labelRendererRef = useRef<CSS2DRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const meshRef = useRef<THREE.Mesh | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const labelsGroupRef = useRef<THREE.Group | null>(null);

    useEffect(() => {
        const currentContainer = containerRef.current;
        const currentLabelsGroup = labelsGroupRef.current;
        if (!currentContainer) return;

        const webGLRenderer = new THREE.WebGLRenderer({ antialias: true });
        const css2DRenderer = new CSS2DRenderer();
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            75,
            currentContainer.clientWidth / currentContainer.clientHeight,
            0.1,
            1000
        );
        camera.position.set(4, 4, 3);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        webGLRenderer.setSize(currentContainer.clientWidth, currentContainer.clientHeight);
        currentContainer.appendChild(webGLRenderer.domElement);
        rendererRef.current = webGLRenderer;

        css2DRenderer.setSize(currentContainer.clientWidth, currentContainer.clientHeight);
        css2DRenderer.domElement.style.position = 'absolute';
        css2DRenderer.domElement.style.top = '0';
        css2DRenderer.domElement.style.pointerEvents = 'none';
        currentContainer.appendChild(css2DRenderer.domElement);
        labelRendererRef.current = css2DRenderer;

        const orbitControls = new OrbitControls(camera, webGLRenderer.domElement);
        orbitControls.enableDamping = true;
        orbitControls.minPolarAngle = Math.PI / 6;
        orbitControls.maxPolarAngle = Math.PI * 0.8;
        orbitControls.minDistance = 3;
        orbitControls.maxDistance = 10;
        controlsRef.current = orbitControls;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

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

        const animate = () => {
            requestAnimationFrame(animate);
            orbitControls.update();
            webGLRenderer.render(scene, camera);
            css2DRenderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!currentContainer) return;
            const width = currentContainer.clientWidth;
            const height = currentContainer.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            webGLRenderer.setSize(width, height);
            css2DRenderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            webGLRenderer.dispose();
            css2DRenderer.domElement.remove();
            
            if (currentContainer) {
                currentContainer.removeChild(webGLRenderer.domElement);
            }

            if (currentLabelsGroup) {
                currentLabelsGroup.children.forEach(child => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose();
                        if (child.material instanceof THREE.Material) {
                            child.material.dispose();
                        }
                    }
                    if (child instanceof CSS2DObject) {
                        child.element.remove();
                    }
                });
            }
        };
    }, [dimensions]);

    useEffect(() => {
        if (!meshRef.current || !sceneRef.current) return;
        
        const newGeometry = createPrismGeometry(dimensions);
        meshRef.current.geometry.dispose();
        meshRef.current.geometry = newGeometry;
        
        updateLabels(dimensions, sceneRef.current, meshRef.current);
    }, [dimensions]);

    return (
        <div 
            ref={containerRef} 
            style={{ width: '100%', height: '400px', position: 'relative' }} 
        />
    );
};

function updateLabels(dimensions: PrismDimensions, scene: THREE.Scene, mesh: THREE.Mesh): void {
  while (mesh.children.length > 0) {
    const child = mesh.children[0];
    mesh.remove(child);
    if (child instanceof CSS2DObject) {
      child.element.remove();
    }
  }

  const { sideA, sideB, sideC, height } = dimensions;
  const triangle = calculateTriangleVertices(sideA, sideB, sideC);

  const createLabel = (position: THREE.Vector3, text: string) => {
    const div = document.createElement('div');
    div.className = 'annotation';
    div.textContent = text;
    
    const label = new CSS2DObject(div);
    label.position.copy(position);
    label.position.y += 0.2;
    
    mesh.add(label);
  };

  const v1 = new THREE.Vector3(triangle[0].x, height, triangle[0].y);
  const v2 = new THREE.Vector3(triangle[1].x, height, triangle[1].y);
  const v3 = new THREE.Vector3(triangle[2].x, height, triangle[2].y);

  const midpointA = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
  const midpointB = new THREE.Vector3().addVectors(v2, v3).multiplyScalar(0.5);
  const midpointC = new THREE.Vector3().addVectors(v3, v1).multiplyScalar(0.5);

  const bottomRight = new THREE.Vector3(triangle[1].x, 0, triangle[1].y);
  const topRight = new THREE.Vector3(triangle[1].x, height, triangle[1].y);
  const heightMidpoint = new THREE.Vector3()
    .addVectors(bottomRight, topRight)
    .multiplyScalar(0.5);
  const heightOffset = new THREE.Vector3(0.3, 0, 0);
  const heightPos = heightMidpoint.add(heightOffset);

  const textA = `A: ${sideA.toFixed(1)}`;
  const textB = `B: ${sideB.toFixed(1)}`;
  const textC = `C: ${sideC.toFixed(1)}`;
  const textH = `H: ${height.toFixed(1)}`;
  
  createLabel(midpointA, textA);
  createLabel(midpointB, textB);
  createLabel(midpointC, textC);
  createLabel(heightPos, textH);
}

function calculateTriangleVertices(a: number, b: number, c: number): [THREE.Vector2, THREE.Vector2, THREE.Vector2] {
  const v1 = new THREE.Vector2(0, 0);
  const v2 = new THREE.Vector2(a, 0);
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
  const triangle = calculateTriangleVertices(sideA, sideB, sideC);
  
  const vertices = [
    ...triangle.map(v => [v.x, 0, v.y]).flat(),
    ...triangle.map(v => [v.x, height, v.y]).flat(),
  ];

  const indices = [
    0, 1, 2,
    3, 4, 5,
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