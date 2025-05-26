import React, { useEffect, useRef } from 'react';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { 
  WebGLRenderer, 
  Scene, 
  PerspectiveCamera, 
  Mesh, 
  Material,
  Vector3, 
  Vector2, 
  BufferGeometry,
  Line,
  LineSegments
} from '../../utils/threejs/imports';
import { 
  createPrismGeometry,
  calculateTriangleVertices,
  calculateOutwardPerp,
  findThirdVertex
} from '../../utils/threejs/geometryCalculations';
import { createTriangularPrismMesh } from '../../utils/threejs/meshCreation';
import { 
  setupLabelsGroup, 
  shouldShowLabels, 
  createTriangularPrismLabel, 
  createDashedLineMaterial 
} from '../../utils/threejs/labelUtils';
import { 
  setupPrismVisualization, 
  createPrismAnimationLoop, 
  createResizeHandler 
} from '../../utils/threejs/sceneSetup';

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
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const meshRef = useRef<Mesh | null>(null);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const visualization = setupPrismVisualization(currentContainer);
    const webGLRenderer = visualization.webGLRenderer;
    const css2DRenderer = visualization.css2DRenderer;
    const scene = visualization.scene;
    const camera = visualization.camera;
    const orbitControls = visualization.orbitControls;
    
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = webGLRenderer;
    labelRendererRef.current = css2DRenderer;

    const prismGeometry = createPrismGeometry(dimensions, isUnfolded);
    const mesh = createTriangularPrismMesh(prismGeometry, visualStyle, isUnfolded);
    scene.add(mesh);
    meshRef.current = mesh;

    updateLabels(dimensions, scene, mesh, isUnfolded, labelConfig, visualStyle);

    const animate = createPrismAnimationLoop(orbitControls, webGLRenderer, css2DRenderer, scene, camera);
    animate();

    const handleResize = createResizeHandler(currentContainer, camera, webGLRenderer, css2DRenderer);

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
      }
    };
  }, [dimensions, isUnfolded, visualStyle, labelConfig]);

  useEffect(() => {
    if (!meshRef.current || !sceneRef.current) return;

    const newGeometry = createPrismGeometry(dimensions, isUnfolded);

    if (sceneRef.current && meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      if (meshRef.current.geometry) meshRef.current.geometry.dispose();
      if (meshRef.current.material instanceof Material) {
        meshRef.current.material.dispose();
      } else if (Array.isArray(meshRef.current.material)) {
        meshRef.current.material.forEach(material => material.dispose());
      }
    }

    const newMesh = createTriangularPrismMesh(newGeometry, visualStyle, isUnfolded);
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

// Improved updateLabels function using utility functions
function updateLabels(
  dimensions: PrismDimensions, 
  scene: Scene, 
  mesh: Mesh, 
  isUnfolded: boolean,
  labelConfig: LabelConfig = DEFAULT_LABEL_CONFIG,
  visualStyle: VisualStyle = 'solid'
): void {
  // Setup labels group - clear existing and return early if no labels needed
  const labelsGroup = setupLabelsGroup(scene);
  if (!shouldShowLabels(labelConfig)) {
    return;
  }

  const { sideA, sideB, sideC, height } = dimensions;
  const triangle = calculateTriangleVertices(sideA, sideB, sideC);

  const createLabel = (position: Vector3, text: string, color?: string) => {
    const label = createTriangularPrismLabel(position, text, color);
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
      new Vector3((triangle[0].x + triangle[1].x) / 2, 0, (triangle[0].y + triangle[1].y) / 2),
      new Vector3((triangle[1].x + triangle[2].x) / 2, 0, (triangle[1].y + triangle[2].y) / 2),
      new Vector3((triangle[2].x + triangle[0].x) / 2, 0, (triangle[2].y + triangle[0].y) / 2),
    ];

    // Prism height vector
    const heightMidpoint = new Vector3(
      (triangle[0].x + triangle[1].x + triangle[2].x) / 3, // center of triangle
      height / 2,
      (triangle[0].y + triangle[1].y + triangle[2].y) / 3
    );

    // 1. VOLUME LABELS - only essential measurements
    if (labelConfig.showVolume) {
      // Just base (longest side) and heights
      createLabel(bottomEdgeMidpoints[0], `B: ${base.toFixed(1)}`, 'rgba(255, 230, 180, 0.8)');
      createLabel(new Vector3(
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
      createLabel(new Vector3(
        (triangle[0].x + triangle[1].x + triangle[2].x) / 3, 
        0.15, 
        (triangle[0].y + triangle[1].y + triangle[2].y) / 3
      ), `TH: ${triangleHeight.toFixed(1)}`, 'rgba(180, 230, 255, 0.8)');
    }
    
    // 3. FACE LABELS - identify each face
    if (labelConfig.showFaces) {
      // Bottom face
      createLabel(
        new Vector3(
          (triangle[0].x + triangle[1].x + triangle[2].x) / 3, 
          0.1, 
          (triangle[0].y + triangle[1].y + triangle[2].y) / 3
        ), 
        `Bottom Face`, 'rgba(173, 216, 230, 0.7)'
      );
      
      // Top face
      createLabel(
        new Vector3(
          (triangle[0].x + triangle[1].x + triangle[2].x) / 3, 
          height - 0.1, 
          (triangle[0].y + triangle[1].y + triangle[2].y) / 3
        ), 
        `Top Face`, 'rgba(255, 200, 255, 0.7)'
      );
      
      // Side faces - positioned at the center of each rectangular side
      createLabel(
        new Vector3(
          (triangle[0].x + triangle[1].x) / 2, 
          height / 2, 
          (triangle[0].y + triangle[1].y) / 2
        ),
        `Side 1`, 'rgba(255, 200, 200, 0.7)'
      );
      
      createLabel(
        new Vector3(
          (triangle[1].x + triangle[2].x) / 2, 
          height / 2, 
          (triangle[1].y + triangle[2].y) / 2
        ),
        `Side 2`, 'rgba(200, 255, 200, 0.7)'
      );
      
      createLabel(
        new Vector3(
          (triangle[2].x + triangle[0].x) / 2, 
          height / 2, 
          (triangle[2].y + triangle[0].y) / 2
        ),
        `Side 3`, 'rgba(255, 255, 200, 0.7)'
      );
    }

    // Add dashed lines for height visualization
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
      const baseVector = new Vector2().subVectors(triangle[baseEnd], triangle[baseStart]);
      const baseUnit = baseVector.clone().normalize();
      const toOpposite = new Vector2().subVectors(triangle[oppositePoint], triangle[baseStart]);
      const projection = triangle[baseStart].clone().addScaledVector(
        baseUnit, 
        toOpposite.dot(baseUnit)
      );
      
      // Create dashed line material using utility
      const dashLineMaterial = createDashedLineMaterial(visualStyle);
      
      // Create the line to represent triangle height
      const heightLineGeometry = new BufferGeometry().setFromPoints([
        new Vector3(triangle[oppositePoint].x, 0.05, triangle[oppositePoint].y),
        new Vector3(projection.x, 0.05, projection.y)
      ]);
      
      const heightLine = new Line(heightLineGeometry, dashLineMaterial);
      heightLine.computeLineDistances(); // Required for dashed lines
      labelsGroup.add(heightLine);

      // Also add top face height line
      const topHeightLineGeometry = new BufferGeometry().setFromPoints([
        new Vector3(triangle[oppositePoint].x, height + 0.05, triangle[oppositePoint].y),
        new Vector3(projection.x, height + 0.05, projection.y)
      ]);

      const topHeightLine = new Line(topHeightLineGeometry, dashLineMaterial);
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

    // Create dashed line material using utility
    const dashLineMaterial = createDashedLineMaterial(visualStyle);

    // Bottom face center
    const bottomCenter = new Vector3(
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
        new Vector3((triangle[0].x + triangle[1].x) / 2, 0.1, (triangle[0].y + triangle[1].y) / 2),
        `Base: ${base.toFixed(1)}`, 'rgba(255, 230, 180, 0.8)'
      );
      
      createLabel(bottomCenter, `Height: ${triangleHeight.toFixed(1)}`, 'rgba(255, 230, 180, 0.8)');
      
      // Prism depth (becomes height of rectangles in unfolded state)
      createLabel(
        new Vector3(
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
        new Vector3((triangle[0].x + triangle[1].x) / 2, 0.1, (triangle[0].y + triangle[1].y) / 2),
        `Side A: ${sideA.toFixed(1)}`, 'rgba(180, 230, 255, 0.8)'
      );
      
      createLabel(
        new Vector3((triangle[1].x + triangle[2].x) / 2, 0.1, (triangle[1].y + triangle[2].y) / 2),
        `Side B: ${sideB.toFixed(1)}`, 'rgba(180, 230, 255, 0.8)'
      );
      
      createLabel(
        new Vector3((triangle[2].x + triangle[0].x) / 2, 0.1, (triangle[2].y + triangle[0].y) / 2),
        `Side C: ${sideC.toFixed(1)}`, 'rgba(180, 230, 255, 0.8)'
      );
      
      // Height for the rectangular sides
      createLabel(
        new Vector3(
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
      const side1Center = new Vector3(
        triangle[0].x + adjustedEdge1Perp.x / 2,
        0.1,
        triangle[0].y + adjustedEdge1Perp.y / 2
      );
      createLabel(side1Center, `Side 1`, 'rgba(255, 200, 200, 0.7)');
      
      const side2Center = new Vector3(
        triangle[1].x + adjustedEdge2Perp.x / 2,
        0.1,
        triangle[1].y + adjustedEdge2Perp.y / 2
      );
      createLabel(side2Center, `Side 2`, 'rgba(200, 255, 200, 0.7)');
      
      const side3Center = new Vector3(
        triangle[2].x + adjustedEdge3Perp.x / 2,
        0.1,
        triangle[2].y + adjustedEdge3Perp.y / 2
      );
      createLabel(side3Center, `Side 3`, 'rgba(255, 255, 200, 0.7)');
      
      // Top triangle face
      const topFaceCenter = new Vector3(
        (triangle[0].x + triangle[1].x + triangle[2].x) / 3 + adjustedEdge3Perp.x,
        0.2,
        (triangle[0].y + triangle[1].y + triangle[2].y) / 3 + adjustedEdge3Perp.y
      );
      createLabel(topFaceCenter, `Top Face`, 'rgba(255, 200, 255, 0.7)');
    }

    // Add dashed lines for unfolded state
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
      const baseVector = new Vector2().subVectors(triangle[baseEnd], triangle[baseStart]);
      const baseUnit = baseVector.clone().normalize();
      const toOpposite = new Vector2().subVectors(triangle[oppositePoint], triangle[baseStart]);
      const projectionAmount = toOpposite.dot(baseUnit);
      const projection = triangle[baseStart].clone().addScaledVector(
        baseUnit, 
        projectionAmount
      );
      
      // Draw bottom face height line
      const heightLineGeometry = new BufferGeometry().setFromPoints([
        new Vector3(triangle[oppositePoint].x, 0.03, triangle[oppositePoint].y),
        new Vector3(projection.x, 0.03, projection.y)
      ]);
      
      const heightLine = new Line(heightLineGeometry, dashLineMaterial);
      heightLine.computeLineDistances();
      labelsGroup.add(heightLine);
      
      // Calculate top triangle height with proper orientation
      const topTriangle = [
        new Vector2(triangle[0].x + adjustedEdge3Perp.x, triangle[0].y + adjustedEdge3Perp.y),
        new Vector2(triangle[2].x + adjustedEdge3Perp.x, triangle[2].y + adjustedEdge3Perp.y),
        findThirdVertex(
          new Vector2(triangle[0].x + adjustedEdge3Perp.x, triangle[0].y + adjustedEdge3Perp.y),
          new Vector2(triangle[2].x + adjustedEdge3Perp.x, triangle[2].y + adjustedEdge3Perp.y),
          sideA, sideB
        )
      ];
      
      // Find the longest side for the top triangle
      const topSide1 = new Vector2().subVectors(topTriangle[0], topTriangle[1]).length();
      const topSide2 = new Vector2().subVectors(topTriangle[1], topTriangle[2]).length();
      const topSide3 = new Vector2().subVectors(topTriangle[2], topTriangle[0]).length();
      
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
      
      const topBaseVector = new Vector2().subVectors(topTriangle[topBaseEnd], topTriangle[topBaseStart]);
      const topBaseUnit = topBaseVector.clone().normalize();
      const topToOpposite = new Vector2().subVectors(topTriangle[topOpposite], topTriangle[topBaseStart]);
      const topProjAmount = topToOpposite.dot(topBaseUnit);
      
      // Ensure the projection stays along the base segment
      const clampedProjAmount = Math.max(0, Math.min(topProjAmount, topBaseVector.length()));
      const topProjection = topTriangle[topBaseStart].clone().addScaledVector(topBaseUnit, clampedProjAmount);
      
      // Draw top face height line
      const topHeightLineGeometry = new BufferGeometry().setFromPoints([
        new Vector3(topTriangle[topOpposite].x, 0.03, topTriangle[topOpposite].y),
        new Vector3(topProjection.x, 0.03, topProjection.y)
      ]);
      
      const topHeightLine = new Line(topHeightLineGeometry, dashLineMaterial);
      topHeightLine.computeLineDistances();
      labelsGroup.add(topHeightLine);
    }
  }
}

export default Prism;