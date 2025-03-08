import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { PrismDimensions } from '../../app/components/standalone/prism/types';

interface PrismProps {
  dimensions: PrismDimensions;
  isUnfolded?: boolean;
}

const Prism: React.FC<PrismProps> = ({ dimensions, isUnfolded = false }) => {
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

        const prismGeometry = createPrismGeometry(dimensions, isUnfolded);
        const prismMaterial = new THREE.MeshPhongMaterial({
            color: isUnfolded ? 0xffffff : 0x4a90e2, // White when unfolded to show vertex colors
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            vertexColors: isUnfolded // Enable vertex colors when unfolded
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
    }, [dimensions, isUnfolded]);

    useEffect(() => {
        if (!meshRef.current || !sceneRef.current) return;
        
        const newGeometry = createPrismGeometry(dimensions, isUnfolded);
        meshRef.current.geometry.dispose();
        meshRef.current.geometry = newGeometry;
        
        updateLabels(dimensions, sceneRef.current, meshRef.current, isUnfolded);
    }, [dimensions, isUnfolded]);

    return (
        <div 
            ref={containerRef} 
            style={{ width: '100%', height: '400px', position: 'relative' }} 
        />
    );
};

function updateLabels(dimensions: PrismDimensions, scene: THREE.Scene, mesh: THREE.Mesh, isUnfolded: boolean): void {
  // Clear existing labels
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

  if (!isUnfolded) {
    // Regular labeling for folded prism
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
  } else {
    // Labels for unfolded prism
    const spacing = 0.05;
    
    // Calculate outward perpendicular directions as in createPrismGeometry
    const edge1Perp = calculateOutwardPerp(triangle[0], triangle[1], triangle[2]);
    const edge2Perp = calculateOutwardPerp(triangle[1], triangle[2], triangle[0]);
    const edge3Perp = calculateOutwardPerp(triangle[2], triangle[0], triangle[1]);
    
    // Adjust the perpendicular vectors by the height and spacing
    const adjustedEdge1Perp = edge1Perp.clone().multiplyScalar(height * (1 + spacing));
    const adjustedEdge2Perp = edge2Perp.clone().multiplyScalar(height * (1 + spacing));
    const adjustedEdge3Perp = edge3Perp.clone().multiplyScalar(height * (1 + spacing));
    
    // Bottom triangle labels
    const midpointA_bottom = new THREE.Vector3(
      (triangle[0].x + triangle[1].x) / 2,
      0,
      (triangle[0].y + triangle[1].y) / 2
    );
    
    const midpointB_bottom = new THREE.Vector3(
      (triangle[1].x + triangle[2].x) / 2,
      0,
      (triangle[1].y + triangle[2].y) / 2
    );
    
    const midpointC_bottom = new THREE.Vector3(
      (triangle[2].x + triangle[0].x) / 2,
      0,
      (triangle[2].y + triangle[0].y) / 2
    );
    
    // Rectangle height labels - position them at the middle of each height edge
    const rect1MidH = new THREE.Vector3(
      triangle[0].x + adjustedEdge1Perp.x * 0.5,  // 0.5 means halfway along the height
      0,
      triangle[0].y + adjustedEdge1Perp.y * 0.5
    );
    
    const rect2MidH = new THREE.Vector3(
      triangle[1].x + adjustedEdge2Perp.x * 0.5,  // 0.5 means halfway along the height
      0,
      triangle[1].y + adjustedEdge2Perp.y * 0.5
    );
    
    const rect3MidH = new THREE.Vector3(
      triangle[2].x + adjustedEdge3Perp.x * 0.5,  // 0.5 means halfway along the height
      0,
      triangle[2].y + adjustedEdge3Perp.y * 0.5
    );
    
    // Top triangle edges
    const topTriangle1 = new THREE.Vector2(
      triangle[2].x + adjustedEdge3Perp.x,
      triangle[2].y + adjustedEdge3Perp.y
    );
    
    const topTriangle2 = new THREE.Vector2(
      triangle[0].x + adjustedEdge3Perp.x,
      triangle[0].y + adjustedEdge3Perp.y
    );
    
    const topTriangle3 = findThirdVertex(
      topTriangle2,
      topTriangle1,
      sideA,
      sideB
    );
    
    // Top triangle labels
    const midpointA_top = new THREE.Vector3(
      (topTriangle2.x + topTriangle3.x) / 2,
      0,
      (topTriangle2.y + topTriangle3.y) / 2
    );
    
    const midpointB_top = new THREE.Vector3(
      (topTriangle3.x + topTriangle1.x) / 2,
      0,
      (topTriangle3.y + topTriangle1.y) / 2
    );
    
    const midpointC_top = new THREE.Vector3(
      (topTriangle1.x + topTriangle2.x) / 2,
      0,
      (topTriangle1.y + topTriangle2.y) / 2
    );
    
    // Create the labels
    createLabel(midpointA_bottom, `A: ${sideA.toFixed(1)}`);
    createLabel(midpointB_bottom, `B: ${sideB.toFixed(1)}`);
    createLabel(midpointC_bottom, `C: ${sideC.toFixed(1)}`);
    
    createLabel(rect1MidH, `H: ${height.toFixed(1)}`);
    createLabel(rect2MidH, `H: ${height.toFixed(1)}`);
    createLabel(rect3MidH, `H: ${height.toFixed(1)}`);
    
    createLabel(midpointA_top, `A: ${sideA.toFixed(1)}`);
    createLabel(midpointB_top, `B: ${sideB.toFixed(1)}`);
    createLabel(midpointC_top, `C: ${sideC.toFixed(1)}`);
  }
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

// Helper function to calculate outward-facing perpendicular direction
function calculateOutwardPerp(edgeStart: THREE.Vector2, edgeEnd: THREE.Vector2, thirdVertex: THREE.Vector2): THREE.Vector2 {
  // Calculate edge direction
  const edgeDir = new THREE.Vector2().subVectors(edgeEnd, edgeStart);
  
  // Normalize
  const normDir = edgeDir.clone().normalize();
  
  // Initial perpendicular (90 degrees counterclockwise)
  const perp = new THREE.Vector2(-normDir.y, normDir.x);
  
  // Calculate vector from edgeStart to the third vertex
  const toVertex = new THREE.Vector2().subVectors(thirdVertex, edgeStart);
  
  // Dot product of perp with toVertex determines if pointing inside or outside
  const dot = perp.dot(toVertex);
  
  // If dot product is positive, perp is pointing toward the vertex (inside)
  // so we need to reverse it
  if (dot > 0) {
    return perp.multiplyScalar(-1);
  }
  
  // Already pointing outside
  return perp;
}

// Helper function to find the third vertex of a triangle given two vertices and two side lengths
function findThirdVertex(v1: THREE.Vector2, v2: THREE.Vector2, lengthToV1: number, lengthToV2: number): THREE.Vector2 {
  // Direction vector from v1 to v2
  const dir = new THREE.Vector2().subVectors(v2, v1);
  
  // Length of the edge v1-v2
  const edgeLength = dir.length();
  
  // Calculate the angle using the law of cosines
  const angleCos = (lengthToV1*lengthToV1 + edgeLength*edgeLength - lengthToV2*lengthToV2) / (2 * lengthToV1 * edgeLength);
  const angleSin = Math.sqrt(1 - angleCos*angleCos);
  
  // Unit vector in the direction of the edge
  const unitDir = dir.clone().normalize();
  
  // Perpendicular unit vector (90 degrees counterclockwise)
  const perpDir = new THREE.Vector2(-unitDir.y, unitDir.x);
  
  // The third vertex coordinates
  return new THREE.Vector2(
    v1.x + lengthToV1 * (unitDir.x * angleCos + perpDir.x * angleSin),
    v1.y + lengthToV1 * (unitDir.y * angleCos + perpDir.y * angleSin)
  );
}

function createPrismGeometry(dimensions: PrismDimensions, isUnfolded: boolean): THREE.BufferGeometry {
  const { sideA, sideB, sideC, height } = dimensions;
  const triangle = calculateTriangleVertices(sideA, sideB, sideC);
  
  if (!isUnfolded) {
    // Regular folded prism geometry
    const vertices = [
      ...triangle.map(v => [v.x, 0, v.y]).flat(),
      ...triangle.map(v => [v.x, height, v.y]).flat(),
    ];

    const indices = [
      0, 1, 2, // bottom face
      3, 4, 5, // top face
      0, 3, 1, 1, 3, 4, // side face 1
      1, 4, 2, 2, 4, 5, // side face 2
      2, 5, 0, 0, 5, 3, // side face 3
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  } else {
    // Improved unfolded prism geometry with proper outward perpendicular directions
    const vertices = [];
    const colors = [];
    
    // Add a spacing factor to create gaps between unfolded pieces for better visibility
    const spacing = 0.05;
    
    // Bottom triangle (centered at origin) - BLUE
    vertices.push(
      triangle[0].x, 0, triangle[0].y,
      triangle[1].x, 0, triangle[1].y,
      triangle[2].x, 0, triangle[2].y
    );
    
    // Add blue color for bottom triangle
    for (let i = 0; i < 3; i++) {
      colors.push(0.3, 0.3, 0.9);
    }
    
    // Calculate outward perpendicular directions for each edge of the triangle
    // Edge 0-1, third vertex is 2
    const edge1Perp = calculateOutwardPerp(triangle[0], triangle[1], triangle[2]);
    
    // Edge 1-2, third vertex is 0
    const edge2Perp = calculateOutwardPerp(triangle[1], triangle[2], triangle[0]);
    
    // Edge 2-0, third vertex is 1
    const edge3Perp = calculateOutwardPerp(triangle[2], triangle[0], triangle[1]);
    
    // Adjust the perpendicular vectors by the height and spacing
    const adjustedEdge1Perp = edge1Perp.clone().multiplyScalar(height * (1 + spacing));
    const adjustedEdge2Perp = edge2Perp.clone().multiplyScalar(height * (1 + spacing));
    const adjustedEdge3Perp = edge3Perp.clone().multiplyScalar(height * (1 + spacing));
    
    // Side rectangle 1 (from edge 0-1) - RED
    vertices.push(
      triangle[0].x, 0, triangle[0].y,  // Bottom left
      triangle[1].x, 0, triangle[1].y,  // Bottom right
      triangle[0].x + adjustedEdge1Perp.x, 0, triangle[0].y + adjustedEdge1Perp.y,  // Top left
      triangle[1].x + adjustedEdge1Perp.x, 0, triangle[1].y + adjustedEdge1Perp.y   // Top right
    );
    
    // Add red color for rectangle 1
    for (let i = 0; i < 4; i++) {
      colors.push(0.9, 0.3, 0.3);
    }
    
    // Side rectangle 2 (from edge 1-2) - GREEN
    vertices.push(
      triangle[1].x, 0, triangle[1].y,  // Bottom left
      triangle[2].x, 0, triangle[2].y,  // Bottom right
      triangle[1].x + adjustedEdge2Perp.x, 0, triangle[1].y + adjustedEdge2Perp.y,  // Top left
      triangle[2].x + adjustedEdge2Perp.x, 0, triangle[2].y + adjustedEdge2Perp.y   // Top right
    );
    
    // Add green color for rectangle 2
    for (let i = 0; i < 4; i++) {
      colors.push(0.3, 0.9, 0.3);
    }
    
    // Side rectangle 3 (from edge 2-0) - YELLOW
    vertices.push(
      triangle[2].x, 0, triangle[2].y,  // Bottom left
      triangle[0].x, 0, triangle[0].y,  // Bottom right
      triangle[2].x + adjustedEdge3Perp.x, 0, triangle[2].y + adjustedEdge3Perp.y,  // Top left
      triangle[0].x + adjustedEdge3Perp.x, 0, triangle[0].y + adjustedEdge3Perp.y   // Top right
    );
    
    // Add yellow color for rectangle 3
    for (let i = 0; i < 4; i++) {
      colors.push(0.9, 0.9, 0.3);
    }
    
    // Now we need to add the top triangle. We'll attach it to one of the rectangles,
    // let's choose rectangle 3 (the yellow one)
    const topTriangle1 = new THREE.Vector2(
      triangle[2].x + adjustedEdge3Perp.x,
      triangle[2].y + adjustedEdge3Perp.y
    );
    
    const topTriangle2 = new THREE.Vector2(
      triangle[0].x + adjustedEdge3Perp.x,
      triangle[0].y + adjustedEdge3Perp.y
    );
    
    // Calculate the third vertex of the top triangle to maintain the same shape as the bottom triangle
    // We need to compute where triangle[1] would be relative to the transformed positions of triangle[0] and triangle[2]
    const topTriangle3 = findThirdVertex(
      topTriangle2, // Corresponds to triangle[0]
      topTriangle1, // Corresponds to triangle[2]
      sideA,        // Length from triangle[0] to triangle[1]
      sideB         // Length from triangle[2] to triangle[1]
    );
    
    // Add the top triangle vertices (PURPLE)
    vertices.push(
      topTriangle1.x, 0, topTriangle1.y,
      topTriangle2.x, 0, topTriangle2.y,
      topTriangle3.x, 0, topTriangle3.y
    );
    
    // Add purple color for the top triangle
    for (let i = 0; i < 3; i++) {
      colors.push(0.9, 0.3, 0.9);
    }
    
    // Define faces with indices
    const indices = [
      // Bottom triangle (blue)
      0, 1, 2,
      
      // Side rectangles (each is two triangles)
      3, 5, 4, 4, 5, 6,  // Rectangle 1 (red)
      7, 9, 8, 8, 9, 10, // Rectangle 2 (green)
      11, 13, 12, 12, 13, 14, // Rectangle 3 (yellow)
      
      // Top triangle (purple)
      15, 16, 17
    ];
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  } // Closing brace for the else block
} // Closing brace for the createPrismGeometry function

export default Prism;