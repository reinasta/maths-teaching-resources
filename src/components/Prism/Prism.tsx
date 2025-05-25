import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

export type VisualStyle = 'solid' | 'colored' | 'wireframe';
export type LabelCategory = 'volume' | 'surfaceArea' | 'faces';

export interface LabelConfig {
  showVolume: boolean;      // Edge lengths and height needed for volume calculation
  showSurfaceArea: boolean; // Additional measurements for surface area calculation
  showFaces: boolean;       // Face identification labels
}

export interface PrismDimensions {
  sideA: number;
  sideB: number;
  sideC: number;
  height: number;
}

interface PrismProps {
  dimensions: PrismDimensions;
  isUnfolded?: boolean;
  visualStyle?: VisualStyle;
  labelConfig?: LabelConfig; // New prop for label configuration
}

const DEFAULT_LABEL_CONFIG: LabelConfig = {
  showVolume: true,
  showSurfaceArea: false,
  showFaces: false
};

const Prism: React.FC<PrismProps> = ({ 
  dimensions, 
  isUnfolded = false,
  visualStyle = 'solid',
  labelConfig = DEFAULT_LABEL_CONFIG
}) => {
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-5, 3, -10);
    scene.add(directionalLight2);

    const prismGeometry = createPrismGeometry(dimensions, isUnfolded);
    const mesh = createPrismMesh(prismGeometry, visualStyle, isUnfolded);
    scene.add(mesh);
    meshRef.current = mesh;

    const labelsGroup = new THREE.Group();
    scene.add(labelsGroup);
    labelsGroupRef.current = labelsGroup;

    updateLabels(dimensions, scene, mesh, isUnfolded, labelConfig, visualStyle);

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

      if (meshRef.current) {
        if (meshRef.current.geometry) meshRef.current.geometry.dispose();
        if (meshRef.current.material instanceof THREE.Material) {
          meshRef.current.material.dispose();
        } else if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach(material => material.dispose());
        }

        meshRef.current.children.forEach(child => {
          if (child instanceof THREE.LineSegments) {
            if (child.geometry) child.geometry.dispose();
            if (child.material instanceof THREE.Material) child.material.dispose();
          }
          if (child instanceof CSS2DObject) {
            child.element.remove();
          }
        });
      }
    };
  }, [dimensions, isUnfolded, visualStyle, labelConfig]);

  useEffect(() => {
    if (!meshRef.current || !sceneRef.current) return;

    const newGeometry = createPrismGeometry(dimensions, isUnfolded);

    if (sceneRef.current && meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      if (meshRef.current.geometry) meshRef.current.geometry.dispose();
      if (meshRef.current.material instanceof THREE.Material) {
        meshRef.current.material.dispose();
      } else if (Array.isArray(meshRef.current.material)) {
        meshRef.current.material.forEach(material => material.dispose());
      }
    }

    const newMesh = createPrismMesh(newGeometry, visualStyle, isUnfolded);
    if (sceneRef.current) {
      sceneRef.current.add(newMesh);
      meshRef.current = newMesh;
    }

    updateLabels(dimensions, sceneRef.current, newMesh, isUnfolded, labelConfig);
  }, [dimensions, isUnfolded, visualStyle, labelConfig]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '400px', position: 'relative' }} 
    />
  );
};

// Replace the createPrismMesh function with this improved version

function createPrismMesh(geometry: THREE.BufferGeometry, visualStyle: VisualStyle, isUnfolded: boolean): THREE.Mesh {
    let material: THREE.Material | THREE.Material[];
    let addStandardEdges = true; // Flag to control default edge rendering
    
    switch (visualStyle) {
        case 'colored':
            if (isUnfolded) {
                // Use individual colors for each face section in unfolded state
                material = [
                    new THREE.MeshPhongMaterial({ color: 0x8888FF, transparent: true, opacity: 0.8, side: THREE.DoubleSide }), // Bottom triangle - blue
                    new THREE.MeshPhongMaterial({ color: 0xFF8888, transparent: true, opacity: 0.8, side: THREE.DoubleSide }), // Side 1 - red
                    new THREE.MeshPhongMaterial({ color: 0x88FF88, transparent: true, opacity: 0.8, side: THREE.DoubleSide }), // Side 2 - green
                    new THREE.MeshPhongMaterial({ color: 0xFFFF88, transparent: true, opacity: 0.8, side: THREE.DoubleSide }), // Side 3 - yellow
                    new THREE.MeshPhongMaterial({ color: 0xFF88FF, transparent: true, opacity: 0.8, side: THREE.DoubleSide })  // Top triangle - purple
                ];
            } else {
                // For folded state
                material = [
                    new THREE.MeshPhongMaterial({ color: 0x8888FF, transparent: true, opacity: 0.8, side: THREE.DoubleSide }), // Bottom triangle
                    new THREE.MeshPhongMaterial({ color: 0xFF88FF, transparent: true, opacity: 0.8, side: THREE.DoubleSide }), // Top triangle
                    new THREE.MeshPhongMaterial({ color: 0xFF8888, transparent: true, opacity: 0.8, side: THREE.DoubleSide }), // Side 1
                    new THREE.MeshPhongMaterial({ color: 0x88FF88, transparent: true, opacity: 0.8, side: THREE.DoubleSide }), // Side 2
                    new THREE.MeshPhongMaterial({ color: 0xFFFF88, transparent: true, opacity: 0.8, side: THREE.DoubleSide })  // Side 3
                ];
            }
            break;
            
        case 'wireframe':
            // For wireframe, we'll use a different approach with visible edges
            material = new THREE.MeshBasicMaterial({
                color: 0xeeeeee,             // Light gray base
                wireframe: false,            // Not using Three.js wireframe mode
                transparent: true,
                opacity: 0.2,                // Very transparent
                side: THREE.DoubleSide
            });
            addStandardEdges = false;        // Don't add normal edges
            break;
            
        case 'solid':
        default:
            material = new THREE.MeshPhongMaterial({
                color: 0x4a90e2,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide,
                shininess: 40,
                flatShading: false
            });
            break;
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Add standard black edges for solid and colored styles
    if (addStandardEdges) {
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ 
            color: 0x000000, 
            linewidth: isUnfolded ? 2 : 1,
            opacity: 1.0,
            transparent: false
        });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        mesh.add(edges);
    }
    
    // Special handling for wireframe style
    if (visualStyle === 'wireframe') {
        // Keep only EdgesGeometry for clean wireframe without diagonals
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ 
            color: 0x000000, // Changed from 0x2a70c2 (blue) to 0x000000 (black)
            linewidth: 2,
            opacity: 1.0,
            transparent: false
        });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        mesh.add(edges);
    }
    
    // For unfolded state, add interior edges to distinguish faces
    if (isUnfolded) {
        const segmentGeometry = new THREE.BufferGeometry();
        
        // Get dimensions from the geometry userData
        const { sideA, sideB, sideC, height } = (geometry.userData as { dimensions: PrismDimensions }).dimensions || { 
            sideA: 3, sideB: 3, sideC: 3, height: 3 
        };
        
        const triangle = calculateTriangleVertices(sideA, sideB, sideC);
        
        // Calculate outward perpendicular directions
        const edge1Perp = calculateOutwardPerp(triangle[0], triangle[1], triangle[2]);
        const edge2Perp = calculateOutwardPerp(triangle[1], triangle[2], triangle[0]);
        const edge3Perp = calculateOutwardPerp(triangle[2], triangle[0], triangle[1]);
        
        // Adjust by height
        const _adjustedEdge1Perp = edge1Perp.clone().multiplyScalar(height);
        const _adjustedEdge2Perp = edge2Perp.clone().multiplyScalar(height);
        const _adjustedEdge3Perp = edge3Perp.clone().multiplyScalar(height);
        
        // Add lines between faces in the net
        const linePositions = [
            // Between bottom triangle and rectangle sides
            triangle[0].x, 0, triangle[0].y, triangle[1].x, 0, triangle[1].y,
            triangle[1].x, 0, triangle[1].y, triangle[2].x, 0, triangle[2].y,
            triangle[2].x, 0, triangle[2].y, triangle[0].x, 0, triangle[0].y
        ];
        
        segmentGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        
        // Create a separate material for these lines - adjust based on style
        const lineColor = visualStyle === 'wireframe' ? 0x000000 : 0x000000; // Changed from 0x2a70c2 to 0x000000
        const lineOpacity = visualStyle === 'wireframe' ? 0.9 : 0.7;
        
        const lineMaterial = new THREE.LineBasicMaterial({
            color: lineColor,
            linewidth: 2,
            opacity: lineOpacity,
            transparent: true
        });
        
        const segments = new THREE.LineSegments(segmentGeometry, lineMaterial);
        mesh.add(segments);
    }
    
    return mesh;
}

// Improved updateLabels function with color-coded face labels
function updateLabels(
  dimensions: PrismDimensions, 
  scene: THREE.Scene, 
  mesh: THREE.Mesh, 
  isUnfolded: boolean,
  labelConfig: LabelConfig = DEFAULT_LABEL_CONFIG,
  visualStyle: VisualStyle = 'solid' // Added visualStyle parameter
): void {
  // Find existing labels group or create a new one
  let labelsGroup = scene.children.find(child => child instanceof THREE.Group) as THREE.Group;
  
  if (!labelsGroup) {
    labelsGroup = new THREE.Group();
    scene.add(labelsGroup);
  } else {
    // Clear existing labels
    while (labelsGroup.children.length > 0) {
      const child = labelsGroup.children[0];
      labelsGroup.remove(child);
      if (child instanceof CSS2DObject) {
        child.element.remove();
      }
    }
  }

  // No labels to show
  if (!labelConfig.showVolume && !labelConfig.showSurfaceArea && !labelConfig.showFaces) {
    return;
  }

  const { sideA, sideB, sideC, height } = dimensions;
  const triangle = calculateTriangleVertices(sideA, sideB, sideC);

  const createLabel = (position: THREE.Vector3, text: string, color?: string) => {
    const div = document.createElement('div');
    div.className = 'annotation';
    div.textContent = text;
    div.style.backgroundColor = color || 'rgba(255, 255, 255, 0.8)';
    div.style.color = 'black';
    div.style.padding = '2px 6px';
    div.style.borderRadius = '4px';
    div.style.fontSize = '0.8em';
    div.style.pointerEvents = 'none';
    div.style.border = '1px solid rgba(0,0,0,0.3)';

    const label = new CSS2DObject(div);
    label.position.copy(position);
    labelsGroup.add(label);
  };

  // FOLDED STATE
  if (!isUnfolded) {
    // Calculate triangle height using Heron's formula
    const s = (sideA + sideB + sideC) / 2;
    const triangleArea = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));
    const base = Math.max(sideA, sideB, sideC);
    const triangleHeight = (2 * triangleArea) / base;

    // Bottom face edge midpoints
    const bottomEdgeMidpoints = [
      new THREE.Vector3((triangle[0].x + triangle[1].x) / 2, 0, (triangle[0].y + triangle[1].y) / 2),
      new THREE.Vector3((triangle[1].x + triangle[2].x) / 2, 0, (triangle[1].y + triangle[2].y) / 2),
      new THREE.Vector3((triangle[2].x + triangle[0].x) / 2, 0, (triangle[2].y + triangle[0].y) / 2),
    ];

    // Prism height vector
    const heightMidpoint = new THREE.Vector3(
      (triangle[0].x + triangle[1].x + triangle[2].x) / 3, // center of triangle
      height / 2,
      (triangle[0].y + triangle[1].y + triangle[2].y) / 3
    );

    // 1. VOLUME LABELS - only essential measurements
    if (labelConfig.showVolume) {
      // Just base (longest side) and heights
      createLabel(bottomEdgeMidpoints[0], `B: ${base.toFixed(1)}`, 'rgba(255, 230, 180, 0.8)');
      createLabel(new THREE.Vector3(
        (triangle[0].x + triangle[1].x + triangle[2].x) / 3, 
        0.1, 
        (triangle[0].y + triangle[1].y + triangle[2].y) / 3
      ), `TH: ${triangleHeight.toFixed(1)}`, 'rgba(255, 230, 180, 0.8)');
      createLabel(heightMidpoint, `PH: ${height.toFixed(1)}`, 'rgba(255, 230, 180, 0.8)');
    }
    
    // 2. SURFACE AREA LABELS
    if (labelConfig.showSurfaceArea) {
      // All three sides of the base triangle
      createLabel(bottomEdgeMidpoints[0], `A: ${sideA.toFixed(1)}`, 'rgba(180, 230, 255, 0.8)');
      createLabel(bottomEdgeMidpoints[1], `B: ${sideB.toFixed(1)}`, 'rgba(180, 230, 255, 0.8)');
      createLabel(bottomEdgeMidpoints[2], `C: ${sideC.toFixed(1)}`, 'rgba(180, 230, 255, 0.8)');
      
      // Prism height and triangle height for surface area
      createLabel(heightMidpoint, `PH: ${height.toFixed(1)}`, 'rgba(180, 230, 255, 0.8)');
      createLabel(new THREE.Vector3(
        (triangle[0].x + triangle[1].x + triangle[2].x) / 3, 
        0.15, 
        (triangle[0].y + triangle[1].y + triangle[2].y) / 3
      ), `TH: ${triangleHeight.toFixed(1)}`, 'rgba(180, 230, 255, 0.8)');
    }
    
    // 3. FACE LABELS - identify each face
    if (labelConfig.showFaces) {
      // Bottom face
      createLabel(
        new THREE.Vector3(
          (triangle[0].x + triangle[1].x + triangle[2].x) / 3, 
          0.1, 
          (triangle[0].y + triangle[1].y + triangle[2].y) / 3
        ), 
        `Bottom Face`, 'rgba(173, 216, 230, 0.7)'
      );
      
      // Top face
      createLabel(
        new THREE.Vector3(
          (triangle[0].x + triangle[1].x + triangle[2].x) / 3, 
          height - 0.1, 
          (triangle[0].y + triangle[1].y + triangle[2].y) / 3
        ), 
        `Top Face`, 'rgba(255, 200, 255, 0.7)'
      );
      
      // Side faces - positioned at the center of each rectangular side
      createLabel(
        new THREE.Vector3(
          (triangle[0].x + triangle[1].x) / 2, 
          height / 2, 
          (triangle[0].y + triangle[1].y) / 2
        ),
        `Side 1`, 'rgba(255, 200, 200, 0.7)'
      );
      
      createLabel(
        new THREE.Vector3(
          (triangle[1].x + triangle[2].x) / 2, 
          height / 2, 
          (triangle[1].y + triangle[2].y) / 2
        ),
        `Side 2`, 'rgba(200, 255, 200, 0.7)'
      );
      
      createLabel(
        new THREE.Vector3(
          (triangle[2].x + triangle[0].x) / 2, 
          height / 2, 
          (triangle[2].y + triangle[0].y) / 2
        ),
        `Side 3`, 'rgba(255, 255, 200, 0.7)'
      );
    }

    // Add this after creating all the labels
    if ((labelConfig.showVolume || labelConfig.showSurfaceArea) && !isUnfolded) {
      // Find the base (longest side) vertices
      let baseIndex = 0;
      if (sideB > sideA && sideB > sideC) baseIndex = 1;
      if (sideC > sideA && sideC > sideB) baseIndex = 2;
      
      // Get vertices for the base and opposite point
      const baseStart = baseIndex;
      const baseEnd = (baseIndex + 1) % 3;
      const oppositePoint = (baseIndex + 2) % 3;
      
      // Calculate the projection of the opposite point onto the base
      const baseVector = new THREE.Vector2().subVectors(triangle[baseEnd], triangle[baseStart]);
      const baseUnit = baseVector.clone().normalize();
      const toOpposite = new THREE.Vector2().subVectors(triangle[oppositePoint], triangle[baseStart]);
      const projection = triangle[baseStart].clone().addScaledVector(
        baseUnit, 
        toOpposite.dot(baseUnit)
      );
      
      // Create dashed line material
      const lineColor = visualStyle === 'wireframe' ? 0x222222 : 0x888888;
      const lineOpacity = visualStyle === 'wireframe' ? 1.0 : 0.8;

      const dashLineMaterial = new THREE.LineDashedMaterial({
        color: lineColor,
        opacity: lineOpacity,
        transparent: true,
        dashSize: 0.1,
        gapSize: 0.05,
        linewidth: 1,
      });
      
      // Create the line to represent triangle height
      const heightLineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(triangle[oppositePoint].x, 0.05, triangle[oppositePoint].y),
        new THREE.Vector3(projection.x, 0.05, projection.y)
      ]);
      
      const heightLine = new THREE.Line(heightLineGeometry, dashLineMaterial);
      heightLine.computeLineDistances(); // Required for dashed lines
      labelsGroup.add(heightLine);

      // Also add top face height line
      const topHeightLineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(triangle[oppositePoint].x, height + 0.05, triangle[oppositePoint].y),
        new THREE.Vector3(projection.x, height + 0.05, projection.y)
      ]);

      const topHeightLine = new THREE.Line(topHeightLineGeometry, dashLineMaterial);
      topHeightLine.computeLineDistances();
      labelsGroup.add(topHeightLine);
    }
  } 
  // UNFOLDED STATE
  else {
    // Calculate triangle height (for volume)
    const s = (sideA + sideB + sideC) / 2;
    const triangleArea = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));
    const base = Math.max(sideA, sideB, sideC);
    const triangleHeight = (2 * triangleArea) / base;

    // Determine line color based on visual style - MOVED HERE
    const lineColor = visualStyle === 'wireframe' ? 0x222222 : 0x888888;
    const lineOpacity = visualStyle === 'wireframe' ? 1.0 : 0.8;

    // Create dashed line material for height indicator - MOVED HERE
    const dashLineMaterial = new THREE.LineDashedMaterial({
      color: lineColor,
      opacity: lineOpacity,
      transparent: true,
      dashSize: 0.1,
      gapSize: 0.05,
      linewidth: 1,
    });

    // Bottom face center
    const bottomCenter = new THREE.Vector3(
      (triangle[0].x + triangle[1].x + triangle[2].x) / 3,
      0.2,
      (triangle[0].y + triangle[1].y + triangle[2].y) / 3
    );

    const edge1Perp = calculateOutwardPerp(triangle[0], triangle[1], triangle[2]);
    const edge2Perp = calculateOutwardPerp(triangle[1], triangle[2], triangle[0]);
    const edge3Perp = calculateOutwardPerp(triangle[2], triangle[0], triangle[1]);
    
    // Adjust perpendicular vectors by height
    const adjustedEdge1Perp = edge1Perp.clone().multiplyScalar(height);
    const adjustedEdge2Perp = edge2Perp.clone().multiplyScalar(height);
    const adjustedEdge3Perp = edge3Perp.clone().multiplyScalar(height);
    
    // 1. VOLUME LABELS
    if (labelConfig.showVolume) {
      // Base and height for triangle
      createLabel(
        new THREE.Vector3((triangle[0].x + triangle[1].x) / 2, 0.1, (triangle[0].y + triangle[1].y) / 2),
        `Base: ${base.toFixed(1)}`, 'rgba(255, 230, 180, 0.8)'
      );
      
      createLabel(bottomCenter, `Height: ${triangleHeight.toFixed(1)}`, 'rgba(255, 230, 180, 0.8)');
      
      // Prism depth (becomes height of rectangles in unfolded state)
      createLabel(
        new THREE.Vector3(
          triangle[0].x + adjustedEdge1Perp.x / 2,
          0.1,
          triangle[0].y + adjustedEdge1Perp.y / 2
        ),
        `Depth: ${height.toFixed(1)}`, 'rgba(255, 230, 180, 0.8)'
      );
    }
    
    // 2. SURFACE AREA LABELS
    if (labelConfig.showSurfaceArea) {
      // All sides of base triangle
      createLabel(
        new THREE.Vector3((triangle[0].x + triangle[1].x) / 2, 0.1, (triangle[0].y + triangle[1].y) / 2),
        `Side A: ${sideA.toFixed(1)}`, 'rgba(180, 230, 255, 0.8)'
      );
      
      createLabel(
        new THREE.Vector3((triangle[1].x + triangle[2].x) / 2, 0.1, (triangle[1].y + triangle[2].y) / 2),
        `Side B: ${sideB.toFixed(1)}`, 'rgba(180, 230, 255, 0.8)'
      );
      
      createLabel(
        new THREE.Vector3((triangle[2].x + triangle[0].x) / 2, 0.1, (triangle[2].y + triangle[0].y) / 2),
        `Side C: ${sideC.toFixed(1)}`, 'rgba(180, 230, 255, 0.8)'
      );
      
      // Height for the rectangular sides
      createLabel(
        new THREE.Vector3(
          triangle[0].x + adjustedEdge1Perp.x / 2,
          0.1,
          triangle[0].y + adjustedEdge1Perp.y / 2
        ),
        `Height: ${height.toFixed(1)}`, 'rgba(180, 230, 255, 0.8)'
      );
    }
    
    // 3. FACE LABELS
    if (labelConfig.showFaces) {
      // Bottom triangle face
      createLabel(bottomCenter, `Bottom Face`, 'rgba(173, 216, 230, 0.7)');
      
      // Side rectangle faces - reduced to just one label per face
      const side1Center = new THREE.Vector3(
        triangle[0].x + adjustedEdge1Perp.x / 2,
        0.1,
        triangle[0].y + adjustedEdge1Perp.y / 2
      );
      createLabel(side1Center, `Side 1`, 'rgba(255, 200, 200, 0.7)');
      
      const side2Center = new THREE.Vector3(
        triangle[1].x + adjustedEdge2Perp.x / 2,
        0.1,
        triangle[1].y + adjustedEdge2Perp.y / 2
      );
      createLabel(side2Center, `Side 2`, 'rgba(200, 255, 200, 0.7)');
      
      const side3Center = new THREE.Vector3(
        triangle[2].x + adjustedEdge3Perp.x / 2,
        0.1,
        triangle[2].y + adjustedEdge3Perp.y / 2
      );
      createLabel(side3Center, `Side 3`, 'rgba(255, 255, 200, 0.7)');
      
      // Top triangle face
      const topFaceCenter = new THREE.Vector3(
        (triangle[0].x + triangle[1].x + triangle[2].x) / 3 + adjustedEdge3Perp.x,
        0.2,
        (triangle[0].y + triangle[1].y + triangle[2].y) / 3 + adjustedEdge3Perp.y
      );
      createLabel(topFaceCenter, `Top Face`, 'rgba(255, 200, 255, 0.7)');
    }

    // Inside the UNFOLDED STATE section, after defining dashLineMaterial but before creating any labels
    if (labelConfig.showVolume || labelConfig.showSurfaceArea) {
      // Calculate which side is the base (longest side)
      let baseIndex = 0;
      if (sideB > sideA && sideB > sideC) baseIndex = 1;
      if (sideC > sideA && sideC > sideB) baseIndex = 2;
      
      // Get vertices for the base and opposite point
      const baseStart = baseIndex;
      const baseEnd = (baseIndex + 1) % 3;
      const oppositePoint = (baseIndex + 2) % 3;
      
      // Calculate the projection of the opposite point onto the base
      const baseVector = new THREE.Vector2().subVectors(triangle[baseEnd], triangle[baseStart]);
      const baseUnit = baseVector.clone().normalize();
      const toOpposite = new THREE.Vector2().subVectors(triangle[oppositePoint], triangle[baseStart]);
      const projectionAmount = toOpposite.dot(baseUnit);
      const projection = triangle[baseStart].clone().addScaledVector(
        baseUnit, 
        projectionAmount
      );
      
      // Draw bottom face height line
      const heightLineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(triangle[oppositePoint].x, 0.03, triangle[oppositePoint].y),
        new THREE.Vector3(projection.x, 0.03, projection.y)
      ]);
      
      const heightLine = new THREE.Line(heightLineGeometry, dashLineMaterial);
      heightLine.computeLineDistances();
      labelsGroup.add(heightLine);
      
      // Calculate top triangle height with proper orientation
      // Adjust the top triangle calculations to ensure height line stays inside
      const topTriangle = [
        new THREE.Vector2(triangle[0].x + adjustedEdge3Perp.x, triangle[0].y + adjustedEdge3Perp.y),
        new THREE.Vector2(triangle[2].x + adjustedEdge3Perp.x, triangle[2].y + adjustedEdge3Perp.y),
        findThirdVertex(
          new THREE.Vector2(triangle[0].x + adjustedEdge3Perp.x, triangle[0].y + adjustedEdge3Perp.y),
          new THREE.Vector2(triangle[2].x + adjustedEdge3Perp.x, triangle[2].y + adjustedEdge3Perp.y),
          sideA, sideB
        )
      ];
      
      // Find the longest side for the top triangle
      const topSide1 = new THREE.Vector2().subVectors(topTriangle[0], topTriangle[1]).length();
      const topSide2 = new THREE.Vector2().subVectors(topTriangle[1], topTriangle[2]).length();
      const topSide3 = new THREE.Vector2().subVectors(topTriangle[2], topTriangle[0]).length();
      
      let topBaseStart = 0;
      let topBaseEnd = 1;
      let topOpposite = 2;
      
      if (topSide2 > topSide1 && topSide2 > topSide3) {
        topBaseStart = 1;
        topBaseEnd = 2;
        topOpposite = 0;
      } else if (topSide3 > topSide1 && topSide3 > topSide2) {
        topBaseStart = 2;
        topBaseEnd = 0;
        topOpposite = 1;
      }
      
      const topBaseVector = new THREE.Vector2().subVectors(topTriangle[topBaseEnd], topTriangle[topBaseStart]);
      const topBaseUnit = topBaseVector.clone().normalize();
      const topToOpposite = new THREE.Vector2().subVectors(topTriangle[topOpposite], topTriangle[topBaseStart]);
      const topProjAmount = topToOpposite.dot(topBaseUnit);
      
      // Ensure the projection stays along the base segment
      const clampedProjAmount = Math.max(0, Math.min(topProjAmount, topBaseVector.length()));
      const topProjection = topTriangle[topBaseStart].clone().addScaledVector(topBaseUnit, clampedProjAmount);
      
      // Draw top face height line
      const topHeightLineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(topTriangle[topOpposite].x, 0.03, topTriangle[topOpposite].y),
        new THREE.Vector3(topProjection.x, 0.03, topProjection.y)
      ]);
      
      const topHeightLine = new THREE.Line(topHeightLineGeometry, dashLineMaterial);
      topHeightLine.computeLineDistances();
      labelsGroup.add(topHeightLine);
    }
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

// Updated createPrismGeometry to store dimensions in userData and support colored faces
function createPrismGeometry(dimensions: PrismDimensions, isUnfolded: boolean): THREE.BufferGeometry {
  const { sideA, sideB, sideC, height } = dimensions;
  const triangle = calculateTriangleVertices(sideA, sideB, sideC);
  
  let geometry: THREE.BufferGeometry;
  
  if (!isUnfolded) {
    // Create colored vertices for the folded prism
    const vertices = [];
    const colors = [];
    
    // Bottom triangle (blue)
    vertices.push(
      triangle[0].x, 0, triangle[0].y,
      triangle[1].x, 0, triangle[1].y,
      triangle[2].x, 0, triangle[2].y
    );
    for (let i = 0; i < 3; i++) {
      colors.push(0.3, 0.3, 0.9);
    }
    
    // Top triangle (purple)
    vertices.push(
      triangle[0].x, height, triangle[0].y,
      triangle[1].x, height, triangle[1].y,
      triangle[2].x, height, triangle[2].y
    );
    for (let i = 0; i < 3; i++) {
      colors.push(0.9, 0.3, 0.9);
    }
    
    // Side rectangles
    // Side 1 (red) - connecting bottom edge 0-1 to top edge
    vertices.push(
      triangle[0].x, 0, triangle[0].y,
      triangle[1].x, 0, triangle[1].y,
      triangle[0].x, height, triangle[0].y,
      triangle[1].x, height, triangle[1].y
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.9, 0.3, 0.3);
    }
    
    // Side 2 (green) - connecting bottom edge 1-2 to top edge
    vertices.push(
      triangle[1].x, 0, triangle[1].y,
      triangle[2].x, 0, triangle[2].y,
      triangle[1].x, height, triangle[1].y,
      triangle[2].x, height, triangle[2].y
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.3, 0.9, 0.3);
    }
    
    // Side 3 (yellow) - connecting bottom edge 2-0 to top edge
    vertices.push(
      triangle[2].x, 0, triangle[2].y,
      triangle[0].x, 0, triangle[0].y,
      triangle[2].x, height, triangle[2].y,
      triangle[0].x, height, triangle[0].y
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.9, 0.9, 0.3);
    }
    
    const indices = [
      0, 1, 2,      // Bottom triangle
      3, 5, 4,      // Top triangle
      6, 8, 7, 7, 8, 9,    // Side 1: two triangles
      10, 12, 11, 11, 12, 13,  // Side 2: two triangles
      14, 16, 15, 15, 16, 17   // Side 3: two triangles
    ];
    
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);

    // Set material groups to map materials to faces
    geometry.addGroup(0, 3, 0);              // Bottom face - material[0]
    geometry.addGroup(3, 3, 1);              // Top face - material[1]
    geometry.addGroup(6, 6, 2);              // Side 1 - material[2] 
    geometry.addGroup(12, 6, 3);             // Side 2 - material[3]
    geometry.addGroup(18, 6, 4);             // Side 3 - material[4]
  } else {
    // Create unfolded net
    const vertices = [];
    const colors = [];
    const spacing = 0.05;
    
    // Bottom triangle (blue)
    vertices.push(
      triangle[0].x, 0, triangle[0].y,
      triangle[1].x, 0, triangle[1].y,
      triangle[2].x, 0, triangle[2].y
    );
    for (let i = 0; i < 3; i++) {
      colors.push(0.3, 0.3, 0.9);
    }
    
    // Calculate outward perpendicular directions for each edge
    const edge1Perp = calculateOutwardPerp(triangle[0], triangle[1], triangle[2]);
    const edge2Perp = calculateOutwardPerp(triangle[1], triangle[2], triangle[0]);
    const edge3Perp = calculateOutwardPerp(triangle[2], triangle[0], triangle[1]);
    
    // Side rectangle 1 (red) - from edge 0-1
    const adjustedEdge1Perp = edge1Perp.clone().multiplyScalar(height * (1 + spacing));
    vertices.push(
      triangle[0].x, 0, triangle[0].y,
      triangle[1].x, 0, triangle[1].y,
      triangle[0].x + adjustedEdge1Perp.x, 0, triangle[0].y + adjustedEdge1Perp.y,
      triangle[1].x + adjustedEdge1Perp.x, 0, triangle[1].y + adjustedEdge1Perp.y
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.9, 0.3, 0.3);
    }
    
    // Side rectangle 2 (green) - from edge 1-2
    const adjustedEdge2Perp = edge2Perp.clone().multiplyScalar(height * (1 + spacing));
    vertices.push(
      triangle[1].x, 0, triangle[1].y,
      triangle[2].x, 0, triangle[2].y,
      triangle[1].x + adjustedEdge2Perp.x, 0, triangle[1].y + adjustedEdge2Perp.y,
      triangle[2].x + adjustedEdge2Perp.x, 0, triangle[2].y + adjustedEdge2Perp.y
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.3, 0.9, 0.3);
    }
    
    // Side rectangle 3 (yellow) - from edge 2-0
    const adjustedEdge3Perp = edge3Perp.clone().multiplyScalar(height * (1 + spacing));
    vertices.push(
      triangle[2].x, 0, triangle[2].y,
      triangle[0].x, 0, triangle[0].y,
      triangle[2].x + adjustedEdge3Perp.x, 0, triangle[2].y + adjustedEdge3Perp.y,
      triangle[0].x + adjustedEdge3Perp.x, 0, triangle[0].y + adjustedEdge3Perp.y
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.9, 0.9, 0.3);
    }
    
    // Top triangle (purple) - attached to rectangle 3
    const topTriangle1 = new THREE.Vector2(
      triangle[2].x + adjustedEdge3Perp.x,
      triangle[2].y + adjustedEdge3Perp.y
    );
    const topTriangle2 = new THREE.Vector2(
      triangle[0].x + adjustedEdge3Perp.x,
      triangle[0].y + adjustedEdge3Perp.y
    );
    const topTriangle3 = findThirdVertex(topTriangle2, topTriangle1, sideA, sideB);
    vertices.push(
      topTriangle1.x, 0, topTriangle1.y,
      topTriangle2.x, 0, topTriangle2.y,
      topTriangle3.x, 0, topTriangle3.y
    );
    for (let i = 0; i < 3; i++) {
      colors.push(0.9, 0.3, 0.9);
    }
    
    const indices = [
      0, 1, 2,      // Bottom triangle
      3, 5, 4, 4, 5, 6,    // Side rectangle 1
      7, 9, 8, 8, 9, 10,   // Side rectangle 2
      11, 13, 12, 12, 13, 14, // Side rectangle 3
      15, 16, 17     // Top triangle
    ];
    
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);

    // Set material groups to map materials to faces in unfolded state
    geometry.addGroup(0, 3, 0);       // Bottom triangle - material[0]
    geometry.addGroup(3, 6, 1);       // Side rectangle 1 - material[1]
    geometry.addGroup(9, 6, 2);       // Side rectangle 2 - material[2]
    geometry.addGroup(15, 6, 3);      // Side rectangle 3 - material[3]
    geometry.addGroup(21, 3, 4);      // Top triangle - material[4]
  }
  
  geometry.userData = { dimensions };
  geometry.computeVertexNormals();
  
  return geometry;
}

export default Prism;