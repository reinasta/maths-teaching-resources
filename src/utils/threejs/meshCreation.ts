// Three.js mesh creation utilities
import { 
  Mesh, 
  Material, 
  MeshBasicMaterial, 
  MeshPhongMaterial, 
  LineBasicMaterial, 
  LineDashedMaterial, 
  LineSegments, 
  EdgesGeometry, 
  BufferGeometry, 
  DoubleSide,
  Float32BufferAttribute
} from './imports';
import { calculateTriangleVertices, calculateOutwardPerp } from '../geometry/triangularPrism';

export type VisualStyle = 'solid' | 'wireframe' | 'colored';

export interface PrismDimensions {
  sideA: number;
  sideB: number;
  sideC: number;
  height: number;
}

export interface TrapezoidalPrismDimensions {
  topWidth: number;
  bottomWidth: number;
  height: number;
  depth: number;
}

/**
 * Creates material configurations for different visual styles
 */
export function createPrismMaterials(
  visualStyle: VisualStyle, 
  isUnfolded: boolean,
  geometryType: 'triangular' | 'trapezoidal' = 'triangular'
): Material | Material[] {
  switch (visualStyle) {
    case 'colored':
      if (geometryType === 'triangular') {
        if (isUnfolded) {
          // Use individual colors for each face section in unfolded state
          return [
            new MeshPhongMaterial({ color: 0x8888FF, transparent: true, opacity: 0.8, side: DoubleSide }), // Bottom triangle - blue
            new MeshPhongMaterial({ color: 0xFF8888, transparent: true, opacity: 0.8, side: DoubleSide }), // Side 1 - red
            new MeshPhongMaterial({ color: 0x88FF88, transparent: true, opacity: 0.8, side: DoubleSide }), // Side 2 - green
            new MeshPhongMaterial({ color: 0xFFFF88, transparent: true, opacity: 0.8, side: DoubleSide }), // Side 3 - yellow
            new MeshPhongMaterial({ color: 0xFF88FF, transparent: true, opacity: 0.8, side: DoubleSide })  // Top triangle - purple
          ];
        } else {
          // For folded state
          return [
            new MeshPhongMaterial({ color: 0x8888FF, transparent: true, opacity: 0.8, side: DoubleSide }), // Bottom triangle
            new MeshPhongMaterial({ color: 0xFF88FF, transparent: true, opacity: 0.8, side: DoubleSide }), // Top triangle
            new MeshPhongMaterial({ color: 0xFF8888, transparent: true, opacity: 0.8, side: DoubleSide }), // Side 1
            new MeshPhongMaterial({ color: 0x88FF88, transparent: true, opacity: 0.8, side: DoubleSide }), // Side 2
            new MeshPhongMaterial({ color: 0xFFFF88, transparent: true, opacity: 0.8, side: DoubleSide })  // Side 3
          ];
        }
      } else {
        // Trapezoidal prism uses vertex colors
        return new MeshBasicMaterial({
          vertexColors: true,
          side: DoubleSide
        });
      }
      break;
      
    case 'wireframe':
      if (geometryType === 'triangular') {
        // For wireframe, use a different approach with visible edges
        return new MeshBasicMaterial({
          color: 0xeeeeee,             // Light gray base
          wireframe: false,            // Not using Three.js wireframe mode
          transparent: true,
          opacity: 0.2,                // Very transparent
          side: DoubleSide
        });
      } else {
        return new MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.1, // Slightly visible to help with face identification
          side: DoubleSide,
          depthWrite: false
        });
      }
      break;
      
    case 'solid':
    default:
      return new MeshPhongMaterial({
        color: 0x4a90e2,
        transparent: true,
        opacity: 0.8,
        side: DoubleSide,
        shininess: 40,
        flatShading: false
      });
  }
}

/**
 * Creates edge materials for different visual styles
 */
export function createEdgeMaterial(visualStyle: VisualStyle, isUnfolded: boolean): LineBasicMaterial {
  const linewidth = isUnfolded ? 2 : 1;
  
  if (visualStyle === 'wireframe') {
    return new LineBasicMaterial({ 
      color: 0x000000,
      linewidth: 2,
      opacity: 1.0,
      transparent: false
    });
  }
  
  return new LineBasicMaterial({ 
    color: 0x000000, 
    linewidth,
    opacity: 1.0,
    transparent: false
  });
}

/**
 * Creates interior edge lines for unfolded triangular prisms
 */
export function createTriangularPrismInteriorEdges(
  geometry: BufferGeometry,
  visualStyle: VisualStyle
): LineSegments | null {
  const dimensions = (geometry.userData as { dimensions: PrismDimensions })?.dimensions;
  if (!dimensions) return null;
  
  const { sideA, sideB, sideC, height } = dimensions;
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
  
  const segmentGeometry = new BufferGeometry();
  segmentGeometry.setAttribute('position', new Float32BufferAttribute(linePositions, 3));
  
  // Create a separate material for these lines
  const lineColor = visualStyle === 'wireframe' ? 0x000000 : 0x000000;
  const lineOpacity = visualStyle === 'wireframe' ? 0.9 : 0.7;
  
  const lineMaterial = new LineBasicMaterial({
    color: lineColor,
    linewidth: 2,
    opacity: lineOpacity,
    transparent: true
  });
  
  return new LineSegments(segmentGeometry, lineMaterial);
}

/**
 * Creates interior edge lines for unfolded trapezoidal prisms
 */
export function createTrapezoidalPrismInteriorEdges(
  geometry: BufferGeometry,
  visualStyle: VisualStyle
): LineSegments | null {
  const dimensions = (geometry.userData as { dimensions: TrapezoidalPrismDimensions })?.dimensions;
  if (!dimensions) return null;
  
  const { topWidth, bottomWidth, height, depth } = dimensions;
  const halfTopWidth = topWidth / 2;
  const halfBottomWidth = bottomWidth / 2;
  const halfDepth = depth / 2;
  
  // Add lines between faces in the net
  const linePositions = [
    // Between bottom and front face
    -halfBottomWidth, 0, halfDepth, halfBottomWidth, 0, halfDepth,
    
    // Between bottom and back face
    -halfBottomWidth, 0, -halfDepth, halfBottomWidth, 0, -halfDepth,
    
    // Between bottom and left face
    -halfBottomWidth, 0, -halfDepth, -halfBottomWidth, 0, halfDepth,
    
    // Between bottom and right face
    halfBottomWidth, 0, -halfDepth, halfBottomWidth, 0, halfDepth,
    
    // Between front face and top face
    -halfTopWidth, 0, halfDepth + height, halfTopWidth, 0, halfDepth + height
  ];
  
  const segmentGeometry = new BufferGeometry();
  segmentGeometry.setAttribute('position', new Float32BufferAttribute(linePositions, 3));
  
  // Create a separate material for these lines to make them more visible
  const lineMaterial = new LineBasicMaterial({
    color: visualStyle === 'wireframe' ? 0x333333 : 0x000000,
    linewidth: 3,
    opacity: visualStyle === 'wireframe' ? 1.0 : 0.9,
    transparent: true
  });
  
  return new LineSegments(segmentGeometry, lineMaterial);
}

/**
 * Creates a complete mesh with proper materials and edges for triangular prisms
 */
export function createTriangularPrismMesh(
  geometry: BufferGeometry, 
  visualStyle: VisualStyle, 
  isUnfolded: boolean
): Mesh {
  const material = createPrismMaterials(visualStyle, isUnfolded, 'triangular');
  const mesh = new Mesh(geometry, material);
  
  // Add standard black edges for solid and colored styles (but not wireframe)
  const addStandardEdges = visualStyle !== 'wireframe';
  
  if (addStandardEdges) {
    const edgesGeometry = new EdgesGeometry(geometry);
    const edgesMaterial = createEdgeMaterial(visualStyle, isUnfolded);
    const edges = new LineSegments(edgesGeometry, edgesMaterial);
    mesh.add(edges);
  }
  
  // Special handling for wireframe style
  if (visualStyle === 'wireframe') {
    const edgesGeometry = new EdgesGeometry(geometry);
    const edgesMaterial = createEdgeMaterial(visualStyle, isUnfolded);
    const edges = new LineSegments(edgesGeometry, edgesMaterial);
    mesh.add(edges);
  }
  
  // For unfolded state, add interior edges to distinguish faces
  if (isUnfolded) {
    const interiorEdges = createTriangularPrismInteriorEdges(geometry, visualStyle);
    if (interiorEdges) {
      mesh.add(interiorEdges);
    }
  }
  
  return mesh;
}

/**
 * Creates a complete mesh with proper materials and edges for trapezoidal prisms
 */
export function createTrapezoidalPrismMesh(
  geometry: BufferGeometry, 
  visualStyle: VisualStyle, 
  isUnfolded: boolean
): Mesh {
  const material = createPrismMaterials(visualStyle, isUnfolded, 'trapezoidal');
  const mesh = new Mesh(geometry, material);
  
  // Add prominent edges for better visualization
  const edgesGeometry = new EdgesGeometry(geometry);
  const edgesMaterial = createEdgeMaterial(visualStyle, isUnfolded);
  const edges = new LineSegments(edgesGeometry, edgesMaterial);
  mesh.add(edges);
  
  // For wireframe and unfolded state, add interior edges to distinguish faces
  if (isUnfolded) {
    const interiorEdges = createTrapezoidalPrismInteriorEdges(geometry, visualStyle);
    if (interiorEdges) {
      mesh.add(interiorEdges);
    }
  }
  
  return mesh;
}
