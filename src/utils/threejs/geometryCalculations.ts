/**
 * @fileoverview Pure Three.js geometry calculation functions
 * 
 * This module contains pure mathematical functions for Three.js geometry calculations,
 * extracted from Prism components to improve testability and reusability.
 * 
 * Key functions:
 * - Triangle vertex positioning
 * - 3D label positioning
 * - Camera positioning calculations
 * - Mesh transformation utilities
 * 
 * All functions are pure (no side effects) and thoroughly tested.
 */

import { Vector3, Vector2, BufferGeometry, Float32BufferAttribute, Matrix4 } from './imports';

// Import types for dimensions
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
 * Creates Three.js BufferGeometry for a triangular prism
 * Supports both folded and unfolded (net) states with proper face coloring
 * 
 * @param dimensions - Object containing sideA, sideB, sideC, and height
 * @param isUnfolded - Whether to create unfolded net geometry (default: false)
 * @returns BufferGeometry with position, color attributes and material groups
 * 
 * @example
 * ```typescript
 * const dims = { sideA: 3, sideB: 4, sideC: 5, height: 2 };
 * const geometry = createPrismGeometry(dims, false);
 * const mesh = new Mesh(geometry, material);
 * ```
 */
export function createPrismGeometry(dimensions: PrismDimensions, isUnfolded: boolean = false): BufferGeometry {
  const { sideA, sideB, sideC, height } = dimensions;
  const triangle = calculateTriangleVertices(sideA, sideB, sideC);
  
  let geometry: BufferGeometry;
  
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
    
    geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
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
    const topTriangle1 = new Vector2(
      triangle[2].x + adjustedEdge3Perp.x,
      triangle[2].y + adjustedEdge3Perp.y
    );
    const topTriangle2 = new Vector2(
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
    
    geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
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

/**
 * Creates Three.js BufferGeometry for a trapezoidal prism
 * Supports both folded and unfolded (net) states with proper face coloring
 * 
 * @param dimensions - Object containing topWidth, bottomWidth, height, and depth
 * @param isUnfolded - Whether to create unfolded net geometry (default: false)
 * @returns BufferGeometry with position, color attributes and material groups
 * 
 * @example
 * ```typescript
 * const dims = { topWidth: 2, bottomWidth: 4, height: 3, depth: 2 };
 * const geometry = createTrapezoidalPrismGeometry(dims, false);
 * const mesh = new Mesh(geometry, material);
 * ```
 */
export function createTrapezoidalPrismGeometry(dimensions: TrapezoidalPrismDimensions, isUnfolded: boolean = false): BufferGeometry {
  const { topWidth, bottomWidth, height, depth } = dimensions;
  
  let geometry: BufferGeometry;
  
  if (!isUnfolded) {
    // Regular folded trapezoidal prism geometry
    const halfTopWidth = topWidth / 2;
    const halfBottomWidth = bottomWidth / 2;
    const halfDepth = depth / 2;
    
    // Define the vertices (8 corners of the prism)
    const vertices = [
        // Bottom face
        -halfBottomWidth, 0, -halfDepth,  // 0: bottom left back
        halfBottomWidth, 0, -halfDepth,   // 1: bottom right back
        halfBottomWidth, 0, halfDepth,    // 2: bottom right front
        -halfBottomWidth, 0, halfDepth,   // 3: bottom left front
        
        // Top face
        -halfTopWidth, height, -halfDepth, // 4: top left back
        halfTopWidth, height, -halfDepth,  // 5: top right back
        halfTopWidth, height, halfDepth,   // 6: top right front
        -halfTopWidth, height, halfDepth   // 7: top left front
    ];
    
    // Define the faces (12 triangles forming 6 rectangular faces)
    const indices = [
        // Bottom face - BLUE
        0, 2, 1, 0, 3, 2,
        
        // Top face - PURPLE
        4, 5, 6, 4, 6, 7,
        
        // Front face - RED
        3, 7, 6, 3, 6, 2,
        
        // Back face - GREEN
        0, 1, 5, 0, 5, 4,
        
        // Left face - YELLOW
        0, 4, 7, 0, 7, 3,
        
        // Right face - CYAN
        1, 2, 6, 1, 6, 5
    ];

    // Use non-indexed geometry for proper face coloring
    const positionBuffer = [];
    const colorBuffer = [];

    // Process each triangle and assign colors
    for (let i = 0; i < indices.length; i += 3) {
        const faceIndex = Math.floor(i / 6); // Determine which face we're on
        let faceColor;
        
        // Assign colors based on face index
        switch(faceIndex) {
            case 0: faceColor = [0.3, 0.3, 0.9]; break; // Bottom - BLUE
            case 1: faceColor = [0.9, 0.3, 0.9]; break; // Top - PURPLE
            case 2: faceColor = [0.9, 0.3, 0.3]; break; // Front - RED
            case 3: faceColor = [0.3, 0.9, 0.3]; break; // Back - GREEN
            case 4: faceColor = [0.9, 0.9, 0.3]; break; // Left - YELLOW
            case 5: faceColor = [0.3, 0.9, 0.9]; break; // Right - CYAN
        }
        
        // For each vertex in this triangle
        for (let j = 0; j < 3; j++) {
            const vertexIndex = indices[i + j];
            // Add position
            positionBuffer.push(
                vertices[vertexIndex * 3],
                vertices[vertexIndex * 3 + 1],
                vertices[vertexIndex * 3 + 2]
            );
            // Add color
            if (faceColor) {
                colorBuffer.push(...faceColor);
            }
        }
    }
    
    geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positionBuffer, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colorBuffer, 3));
  } else {
    const halfTopWidth = topWidth / 2;
    const halfBottomWidth = bottomWidth / 2;
    const halfDepth = depth / 2;
    const _spacing = 0; // Removed gap for natural connectivity

    const vertices = [];
    const colors = [];
    
    // Bottom face (centered at origin) - BLUE
    vertices.push(
      -halfBottomWidth, 0, -halfDepth, // bottom left back
      halfBottomWidth, 0, -halfDepth,  // bottom right back
      halfBottomWidth, 0, halfDepth,   // bottom right front
      -halfBottomWidth, 0, halfDepth   // bottom left front
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.3, 0.3, 0.9);
    }
    
    // Front face - attach directly to bottom face front edge
    const frontFaceZ = halfDepth; 
    vertices.push(
      -halfBottomWidth, 0, frontFaceZ,          // bottom left
      halfBottomWidth, 0, frontFaceZ,           // bottom right
      halfTopWidth, 0, frontFaceZ + height,     // top right
      -halfTopWidth, 0, frontFaceZ + height      // top left
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.9, 0.3, 0.3);
    }
    
    // Back face - attach to bottom face back edge
    const backFaceZ = -halfDepth;
    vertices.push(
      halfBottomWidth, 0, backFaceZ,           // bottom left (from back view)
      -halfBottomWidth, 0, backFaceZ,          // bottom right (from back view)
      -halfTopWidth, 0, backFaceZ - height,    // top right (from back view)
      halfTopWidth, 0, backFaceZ - height      // top left (from back view)
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.3, 0.9, 0.3);
    }
    
    // Left face - attach to bottom face left edge
    const leftFaceX = -halfBottomWidth;
    vertices.push(
      leftFaceX, 0, -halfDepth,              // bottom left
      leftFaceX, 0, halfDepth,               // bottom right
      leftFaceX - height, 0, halfDepth,      // top right
      leftFaceX - height, 0, -halfDepth      // top left
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.9, 0.9, 0.3);
    }
    
    // Right face - attach to bottom face right edge
    const rightFaceX = halfBottomWidth;
    vertices.push(
      rightFaceX, 0, halfDepth,              // bottom left
      rightFaceX, 0, -halfDepth,             // bottom right
      rightFaceX + height, 0, -halfDepth,    // top right
      rightFaceX + height, 0, halfDepth      // top left
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.3, 0.9, 0.9);
    }
    
    // Top face - attach to front face top edge
    const topFaceZ = frontFaceZ + height;
    vertices.push(
      -halfTopWidth, 0, topFaceZ,           // bottom left
      halfTopWidth, 0, topFaceZ,            // bottom right
      halfTopWidth, 0, topFaceZ + depth,    // top right
      -halfTopWidth, 0, topFaceZ + depth    // top left
    );
    for (let i = 0; i < 4; i++) {
      colors.push(0.9, 0.3, 0.9);
    }
    
    // Define faces (each rectangular face is made of 2 triangles)
    const indices = [
      // Bottom face (blue)
      0, 2, 1, 0, 3, 2,
      
      // Front face (red)
      4, 6, 5, 4, 7, 6,
      
      // Back face (green)
      8, 10, 9, 8, 11, 10,
      
      // Left face (yellow)
      12, 14, 13, 12, 15, 14,
      
      // Right face (cyan)
      16, 18, 17, 16, 19, 18,
      
      // Top face (purple)
      20, 22, 21, 20, 23, 22
    ];
    
    geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
  }
  
  // Store dimensions in the geometry's userData for later access
  geometry.userData = { dimensions };
  
  geometry.computeVertexNormals();
  
  return geometry;
}

/**
 * Configuration interface for camera positioning
 */
export interface CameraConfig {
  position: { x: number; y: number; z: number };
  fov: number;
  near: number;
  far: number;
  lookAt: { x: number; y: number; z: number };
}

/**
 * Configuration interface for 3D label positioning
 */
export interface LabelPositionConfig {
  position: Vector3;
  text: string;
  color?: string;
  offset?: Vector3;
  className?: string;
}

/**
 * Configuration interface for lighting setup
 */
export interface LightingConfig {
  ambient: {
    color: number;
    intensity: number;
  };
  directional: Array<{
    color: number;
    intensity: number;
    position: { x: number; y: number; z: number };
  }>;
}

/**
 * Configuration interface for OrbitControls
 */
export interface OrbitControlsConfig {
  enableDamping: boolean;
  minPolarAngle: number;
  maxPolarAngle: number;
  minDistance: number;
  maxDistance: number;
}

/**
 * Calculates triangle vertices in 2D space using side lengths
 * Places the first vertex at origin, second along x-axis, third calculated using law of cosines
 * 
 * @param sideA - Length of side A
 * @param sideB - Length of side B  
 * @param sideC - Length of side C
 * @returns Array of three Vector2 points representing triangle vertices
 * 
 * @example
 * ```typescript
 * const vertices = calculateTriangleVertices(3, 4, 5);
 * console.log(vertices); // Right triangle with vertices at (0,0), (3,0), (0,4)
 * ```
 */
export function calculateTriangleVertices(
  sideA: number, 
  sideB: number, 
  sideC: number
): [Vector2, Vector2, Vector2] {
  if (sideA <= 0 || sideB <= 0 || sideC <= 0) {
    throw new Error('All side lengths must be positive');
  }

  // Check triangle inequality
  if (sideA + sideB <= sideC || sideA + sideC <= sideB || sideB + sideC <= sideA) {
    throw new Error('Invalid triangle: sides do not satisfy triangle inequality');
  }

  const v1 = new Vector2(0, 0);
  const v2 = new Vector2(sideA, 0);
  
  // Use law of cosines to find angle C
  const cosC = (sideA * sideA + sideB * sideB - sideC * sideC) / (2 * sideA * sideB);
  
  // Clamp cosC to valid range to handle floating point errors
  const clampedCosC = Math.max(-1, Math.min(1, cosC));
  const sinC = Math.sqrt(1 - clampedCosC * clampedCosC);
  
  const v3 = new Vector2(
    sideB * clampedCosC,
    sideB * sinC
  );

  return [v1, v2, v3];
}

/**
 * Calculates outward-facing perpendicular direction for a triangle edge
 * Used for positioning rectangle faces in unfolded prism nets
 * 
 * @param edgeStart - Start point of the edge
 * @param edgeEnd - End point of the edge
 * @param thirdVertex - The third vertex of the triangle (opposite to the edge)
 * @returns Unit vector pointing outward from the triangle
 * 
 * @example
 * ```typescript
 * const v1 = new Vector2(0, 0);
 * const v2 = new Vector2(1, 0);
 * const v3 = new Vector2(0.5, 1);
 * const outward = calculateOutwardPerp(v1, v2, v3);
 * console.log(outward); // Vector pointing away from triangle
 * ```
 */
export function calculateOutwardPerp(
  edgeStart: Vector2, 
  edgeEnd: Vector2, 
  thirdVertex: Vector2
): Vector2 {
  // Calculate edge direction
  const edgeDir = new Vector2().subVectors(edgeEnd, edgeStart);
  
  if (edgeDir.length() === 0) {
    throw new Error('Edge start and end points cannot be the same');
  }
  
  // Normalize
  const normDir = edgeDir.clone().normalize();
  
  // Initial perpendicular (90 degrees counterclockwise)
  const perp = new Vector2(-normDir.y, normDir.x);
  
  // Calculate vector from edgeStart to the third vertex
  const toVertex = new Vector2().subVectors(thirdVertex, edgeStart);
  
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

/**
 * Finds the third vertex of a triangle given two vertices and side lengths
 * Uses law of cosines to determine position
 * 
 * @param v1 - First known vertex
 * @param v2 - Second known vertex
 * @param lengthToV1 - Distance from third vertex to v1
 * @param lengthToV2 - Distance from third vertex to v2
 * @returns Position of the third vertex
 * 
 * @example
 * ```typescript
 * const v1 = new Vector2(0, 0);
 * const v2 = new Vector2(3, 0);
 * const v3 = findThirdVertex(v1, v2, 4, 5);
 * console.log(v3); // Third vertex forming triangle with given side lengths
 * ```
 */
export function findThirdVertex(
  v1: Vector2, 
  v2: Vector2, 
  lengthToV1: number, 
  lengthToV2: number
): Vector2 {
  if (lengthToV1 <= 0 || lengthToV2 <= 0) {
    throw new Error('Side lengths must be positive');
  }

  // Direction vector from v1 to v2
  const dir = new Vector2().subVectors(v2, v1);
  
  // Length of the edge v1-v2
  const edgeLength = dir.length();
  
  if (edgeLength === 0) {
    throw new Error('v1 and v2 cannot be the same point');
  }

  // Check triangle inequality
  if (lengthToV1 + edgeLength <= lengthToV2 || 
      lengthToV1 + lengthToV2 <= edgeLength || 
      edgeLength + lengthToV2 <= lengthToV1) {
    throw new Error('Invalid triangle: sides do not satisfy triangle inequality');
  }
  
  // Calculate the angle using the law of cosines
  const angleCos = (lengthToV1 * lengthToV1 + edgeLength * edgeLength - lengthToV2 * lengthToV2) / 
                   (2 * lengthToV1 * edgeLength);
  
  // Clamp to valid range to handle floating point errors
  const clampedAngleCos = Math.max(-1, Math.min(1, angleCos));
  const angleSin = Math.sqrt(1 - clampedAngleCos * clampedAngleCos);
  
  // Unit vector in the direction of the edge
  const unitDir = dir.clone().normalize();
  
  // Perpendicular unit vector (90 degrees counterclockwise)
  const perpDir = new Vector2(-unitDir.y, unitDir.x);
  
  // The third vertex coordinates
  return new Vector2(
    v1.x + lengthToV1 * (unitDir.x * clampedAngleCos + perpDir.x * angleSin),
    v1.y + lengthToV1 * (unitDir.y * clampedAngleCos + perpDir.y * angleSin)
  );
}

/**
 * Calculates 3D positions for labels on triangular prism faces
 * 
 * @param triangleVertices - 2D triangle vertices
 * @param height - Prism height
 * @param isUnfolded - Whether prism is in unfolded state
 * @returns Object containing label positions for different prism elements
 */
export function calculateTriangularPrismLabelPositions(
  triangleVertices: [Vector2, Vector2, Vector2],
  height: number,
  isUnfolded: boolean
): {
  bottomFaceCenter: Vector3;
  topFaceCenter: Vector3;
  bottomEdgeMidpoints: Vector3[];
  topEdgeMidpoints: Vector3[];
  heightMidpoint: Vector3;
  sideFaceCenters: Vector3[];
} {
  const [v1, v2, v3] = triangleVertices;

  // Bottom face center
  const bottomFaceCenter = new Vector3(
    (v1.x + v2.x + v3.x) / 3,
    isUnfolded ? 0.1 : 0,
    (v1.y + v2.y + v3.y) / 3
  );

  // Top face center
  const topFaceCenter = new Vector3(
    (v1.x + v2.x + v3.x) / 3,
    isUnfolded ? 0.1 : height,
    (v1.y + v2.y + v3.y) / 3
  );

  // Bottom edge midpoints
  const bottomEdgeMidpoints = [
    new Vector3((v1.x + v2.x) / 2, isUnfolded ? 0.1 : 0, (v1.y + v2.y) / 2),
    new Vector3((v2.x + v3.x) / 2, isUnfolded ? 0.1 : 0, (v2.y + v3.y) / 2),
    new Vector3((v3.x + v1.x) / 2, isUnfolded ? 0.1 : 0, (v3.y + v1.y) / 2),
  ];

  // Top edge midpoints
  const topEdgeMidpoints = [
    new Vector3((v1.x + v2.x) / 2, isUnfolded ? 0.1 : height, (v1.y + v2.y) / 2),
    new Vector3((v2.x + v3.x) / 2, isUnfolded ? 0.1 : height, (v2.y + v3.y) / 2),
    new Vector3((v3.x + v1.x) / 2, isUnfolded ? 0.1 : height, (v3.y + v1.y) / 2),
  ];

  // Height midpoint (center of prism)
  const heightMidpoint = new Vector3(
    (v1.x + v2.x + v3.x) / 3,
    isUnfolded ? 0.1 : height / 2,
    (v1.y + v2.y + v3.y) / 3
  );

  // Side face centers (for triangular prism)
  const sideFaceCenters = [
    new Vector3(
      (v1.x + v2.x) / 2,
      isUnfolded ? 0.1 : height / 2,
      (v1.y + v2.y) / 2
    ),
    new Vector3(
      (v2.x + v3.x) / 2,
      isUnfolded ? 0.1 : height / 2,
      (v2.y + v3.y) / 2
    ),
    new Vector3(
      (v3.x + v1.x) / 2,
      isUnfolded ? 0.1 : height / 2,
      (v3.y + v1.y) / 2
    ),
  ];

  return {
    bottomFaceCenter,
    topFaceCenter,
    bottomEdgeMidpoints,
    topEdgeMidpoints,
    heightMidpoint,
    sideFaceCenters,
  };
}

/**
 * Calculates 3D positions for labels on trapezoidal prism faces
 * 
 * @param dimensions - Trapezoidal prism dimensions
 * @param isUnfolded - Whether prism is in unfolded state
 * @returns Object containing label positions for different prism elements
 */
export function calculateTrapezoidalPrismLabelPositions(
  dimensions: { topWidth: number; bottomWidth: number; height: number; depth: number },
  isUnfolded: boolean
): {
  topEdgeCenter: Vector3;
  bottomEdgeCenter: Vector3;
  depthEdgeCenter: Vector3;
  heightPosition: Vector3;
  faceCenters: {
    bottom: Vector3;
    top: Vector3;
    front: Vector3;
    back: Vector3;
    left: Vector3;
    right: Vector3;
  };
} {
  const { topWidth, bottomWidth, height, depth } = dimensions;
  const _halfTopWidth = topWidth / 2;
  const halfBottomWidth = bottomWidth / 2;
  const halfDepth = depth / 2;

  if (isUnfolded) {
    // Unfolded state positions
    return {
      topEdgeCenter: new Vector3(0, 0.1, halfDepth + height + depth + 0.2),
      bottomEdgeCenter: new Vector3(0, 0.1, halfDepth + 0.2),
      depthEdgeCenter: new Vector3(-halfBottomWidth - 0.2, 0.1, 0),
      heightPosition: new Vector3(-halfBottomWidth - 0.2, 0.1, halfDepth + height / 2),
      faceCenters: {
        bottom: new Vector3(0, 0.1, 0),
        top: new Vector3(0, 0.1, halfDepth + height + depth / 2),
        front: new Vector3(0, 0.1, halfDepth + height / 2),
        back: new Vector3(0, 0.1, -halfDepth - height / 2),
        left: new Vector3(-halfBottomWidth - height / 2, 0.1, 0),
        right: new Vector3(halfBottomWidth + height / 2, 0.1, 0),
      },
    };
  } else {
    // Folded state positions
    const yBase = -height / 2;
    const yTop = height / 2;
    const zFront = halfDepth;
    const zBack = -halfDepth;

    return {
      topEdgeCenter: new Vector3(0, yTop + 0.2, zFront),
      bottomEdgeCenter: new Vector3(0, yBase - 0.2, zFront),
      depthEdgeCenter: new Vector3(-halfBottomWidth - 0.2, 0, 0),
      heightPosition: new Vector3(-halfBottomWidth - 0.3, 0, zFront),
      faceCenters: {
        bottom: new Vector3(0, yBase - 0.3, 0),
        top: new Vector3(0, yTop + 0.3, 0),
        front: new Vector3(0, 0, zFront + 0.3),
        back: new Vector3(0, 0, zBack - 0.3),
        left: new Vector3(-halfBottomWidth - 0.3, 0, 0),
        right: new Vector3(halfBottomWidth + 0.3, 0, 0),
      },
    };
  }
}

/**
 * Calculates optimal camera position for viewing a prism
 * 
 * @param dimensions - Bounding box dimensions of the object
 * @param isUnfolded - Whether viewing unfolded net
 * @returns Camera configuration object
 */
export function calculateOptimalCameraPosition(
  dimensions: { width: number; height: number; depth: number },
  isUnfolded: boolean = false
): CameraConfig {
  const { width, height, depth } = dimensions;
  
  // Calculate bounding sphere radius
  const boundingRadius = Math.sqrt(width * width + height * height + depth * depth) / 2;
  
  // Distance factor based on field of view (75 degrees)
  const fov = 75;
  const distance = boundingRadius / Math.sin((fov / 2) * Math.PI / 180);
  
  // Adjust for unfolded view (typically needs more distance for wider net)
  const distanceMultiplier = isUnfolded ? 1.5 : 1.2;
  const finalDistance = Math.max(distance * distanceMultiplier, 3);

  return {
    position: {
      x: isUnfolded ? 0 : finalDistance * 0.7,
      y: finalDistance * 0.8,
      z: finalDistance * 0.6
    },
    fov,
    near: 0.1,
    far: Math.max(finalDistance * 3, 1000),
    lookAt: { x: 0, y: isUnfolded ? 0 : height / 4, z: 0 }
  };
}

/**
 * Creates standard lighting configuration for 3D scenes
 * 
 * @param isUnfolded - Whether scene shows unfolded net
 * @returns Lighting configuration object
 */
export function createStandardLighting(_isUnfolded: boolean = false): LightingConfig {
  return {
    ambient: {
      color: 0xffffff,
      intensity: 0.4
    },
    directional: [
      {
        color: 0xffffff,
        intensity: 0.6,
        position: { x: 10, y: 10, z: 10 }
      },
      {
        color: 0xffffff,
        intensity: 0.3,
        position: { x: -5, y: 3, z: -10 }
      }
    ]
  };
}

/**
 * Creates standard OrbitControls configuration
 * 
 * @param isUnfolded - Whether viewing unfolded net (affects constraints)
 * @returns OrbitControls configuration object
 */
export function createStandardOrbitControls(isUnfolded: boolean = false): OrbitControlsConfig {
  return {
    enableDamping: true,
    minPolarAngle: Math.PI / 6,
    maxPolarAngle: Math.PI * 0.8,
    minDistance: 3,
    maxDistance: isUnfolded ? 15 : 10
  };
}

/**
 * Calculates mesh transformation matrix for unfolded prism nets
 * 
 * @param faceType - Type of face ('bottom', 'top', 'side1', 'side2', 'side3')
 * @param prismHeight - Height of the prism
 * @param edgeIndex - Index of the edge for side faces (0, 1, or 2)
 * @returns 4x4 transformation matrix
 */
export function calculateUnfoldedFaceTransform(
  faceType: 'bottom' | 'top' | 'side1' | 'side2' | 'side3',
  prismHeight: number,
  edgeIndex?: number
): Matrix4 {
  const matrix = new Matrix4();
  
  switch (faceType) {
    case 'bottom':
      // Bottom face stays at origin
      matrix.identity();
      break;
      
    case 'top':
      // Top face is rotated 180 degrees and positioned
      matrix.makeRotationY(Math.PI);
      break;
      
    case 'side1':
    case 'side2':
    case 'side3':
      // Side faces are rotated 90 degrees outward
      const rotation = (edgeIndex || 0) * (2 * Math.PI / 3);
      matrix.makeRotationY(rotation);
      matrix.setPosition(0, 0, prismHeight);
      break;
      
    default:
      matrix.identity();
  }
  
  return matrix;
}

/**
 * Calculates triangle height using Heron's formula and base
 * Used for volume and area calculations
 * 
 * @param sideA - Length of side A
 * @param sideB - Length of side B
 * @param sideC - Length of side C
 * @param base - Length of the base side (longest side by default)
 * @returns Height of triangle perpendicular to base
 */
export function calculateTriangleHeight(
  sideA: number, 
  sideB: number, 
  sideC: number, 
  base?: number
): number {
  if (sideA <= 0 || sideB <= 0 || sideC <= 0) {
    throw new Error('All side lengths must be positive');
  }

  // Check triangle inequality
  if (sideA + sideB <= sideC || sideA + sideC <= sideB || sideB + sideC <= sideA) {
    throw new Error('Invalid triangle: sides do not satisfy triangle inequality');
  }

  // Use longest side as base if not specified
  const actualBase = base || Math.max(sideA, sideB, sideC);
  
  // Calculate area using Heron's formula
  const s = (sideA + sideB + sideC) / 2;
  const area = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));
  
  // Height = 2 * Area / Base
  return (2 * area) / actualBase;
}

/**
 * Calculates the projection of a point onto a line segment
 * Used for height line calculations in triangles
 * 
 * @param point - Point to project
 * @param lineStart - Start of line segment
 * @param lineEnd - End of line segment
 * @returns Projected point on line segment (clamped to segment bounds)
 */
export function calculateProjectionOnLine(
  point: Vector2,
  lineStart: Vector2,
  lineEnd: Vector2
): Vector2 {
  const lineVector = new Vector2().subVectors(lineEnd, lineStart);
  const lineLength = lineVector.length();
  
  if (lineLength === 0) {
    return lineStart.clone();
  }
  
  const lineUnit = lineVector.clone().normalize();
  const toPoint = new Vector2().subVectors(point, lineStart);
  const projectionLength = toPoint.dot(lineUnit);
  
  // Clamp to line segment bounds
  const clampedLength = Math.max(0, Math.min(projectionLength, lineLength));
  
  return lineStart.clone().addScaledVector(lineUnit, clampedLength);
}
